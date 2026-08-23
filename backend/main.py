import os
import asyncio
import logging
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from sqlalchemy import func
from stellar_sdk import Keypair

import models
from database import create_db_and_tables, get_session
from decimal import Decimal, ROUND_HALF_UP
from models import (
    Commission, CommissionCreate, CommissionRead,
    Dispute, DisputeCreate, DisputeRead, User, Milestone, MilestoneRead,
    Review, ReviewCreate, ReviewRead
)
import stellar_utils
from middleware.auth import (
    JWTTokenMiddleware, CurrentUser, get_current_user, get_current_user_optional,
    require_admin, generate_challenge_message,
    parse_challenge_and_verify, verify_stellar_signature,
    create_access_token, is_admin_wallet, ROLE_CLIENT, ROLE_ARTIST, ROLE_ADMIN
)
from middleware.rate_limit import limiter, rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from routers.notifications import router as notifications_router
from services.notifications import dispatch_notification, start_deadline_checker

logger = logging.getLogger(__name__)

app = FastAPI(title="ComiSure API", description="Off-chain API for tracking Stellar Commissions")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For prototyping
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication and Rate Limiting Middlewares
app.add_middleware(JWTTokenMiddleware)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Register notification router
app.include_router(notifications_router)

# Input Validation Helpers
def validate_stellar_address(address: str):
    try:
        Keypair.from_public_key(address)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid Stellar public address: {address}")

def clean_input_string(value: str, name: str) -> str:
    if "<script" in value.lower() or "javascript:" in value.lower():
        raise HTTPException(status_code=400, detail=f"Suspicious characters detected in field '{name}'.")
    return value.strip()

# Pydantic request models
class LoginRequest(BaseModel):
    wallet_address: str
    challenge: str
    signature: str
    role: Optional[str] = "client"

@app.on_event("startup")
def on_startup():
    # Fail fast if deployer keys cannot be resolved or derived
    try:
        stellar_utils.setup_cloud_deployer()
    except Exception as e:
        import sys
        print(f"❌ FATAL STARTUP CHECK FAILED: {e}")
        sys.exit(1)

    # Verify WASM files exist (non-fatal — some environments may not have them locally)
    for wasm_path in (stellar_utils.WASM_PATH, stellar_utils.MILESTONE_WASM_PATH):
        if not os.path.exists(wasm_path):
            logger.error(f"WASM file missing: {wasm_path}")
        
    create_db_and_tables()

    # Start deadline notification checker background loop
    asyncio.get_event_loop().create_task(start_deadline_checker())

@app.get("/")
def read_root(request: Request):
    return {"message": "Welcome to ComiSure Off-Chain API"}

@app.get("/health")
def health_check(request: Request, session: Session = Depends(get_session)):
    """Production health check — verifies DB connectivity and deployer key resolution."""
    checks = {"status": "healthy", "database": "ok", "deployer": "ok", "version": "1.1.0"}
    
    # Check database connectivity
    try:
        session.exec(select(Commission).limit(1))
    except Exception as e:
        checks["database"] = f"error: {str(e)[:100]}"
        checks["status"] = "degraded"
    
    # Check deployer key can be resolved
    try:
        addr = stellar_utils.get_deployer_address()
        checks["deployer_address"] = addr[:8] + "..."
    except Exception as e:
        checks["deployer"] = f"error: {str(e)[:100]}"
        checks["status"] = "degraded"
    
    status_code = 200 if checks["status"] == "healthy" else 503
    from fastapi.responses import JSONResponse
    return JSONResponse(content=checks, status_code=status_code)

# Challenge-Response Authentication
@app.get("/auth/challenge")
@limiter.limit("10/minute", key_func=get_remote_address)
def get_challenge(wallet_address: str, request: Request):
    try:
        Keypair.from_public_key(wallet_address)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Stellar public key")
        
    challenge = generate_challenge_message(wallet_address)
    return {"challenge": challenge}

@app.post("/auth/login")
@limiter.limit("10/minute", key_func=get_remote_address)
def login(login_req: LoginRequest, request: Request, session: Session = Depends(get_session)):
    # 1. Parse and verify challenge validity
    if not parse_challenge_and_verify(login_req.challenge, login_req.wallet_address):
        raise HTTPException(status_code=400, detail="Challenge is invalid or expired")
        
    # 2. Verify Stellar signature
    if not verify_stellar_signature(login_req.wallet_address, login_req.challenge, login_req.signature):
        raise HTTPException(status_code=400, detail="Invalid signature for challenge")
        
    # 3. Determine user role
    role = ROLE_CLIENT
    if is_admin_wallet(login_req.wallet_address):
        role = ROLE_ADMIN
    elif login_req.role in [ROLE_CLIENT, ROLE_ARTIST]:
        role = login_req.role
        
    # 4. Check if user exists, otherwise create
    db_user = session.get(User, login_req.wallet_address)
    if not db_user:
        db_user = User(wallet_address=login_req.wallet_address, role=role)
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
    else:
        # If user exists, dynamically set role if they are admin, otherwise retain stored DB role
        if is_admin_wallet(login_req.wallet_address):
            db_user.role = ROLE_ADMIN
        elif login_req.role in [ROLE_CLIENT, ROLE_ARTIST] and db_user.role != ROLE_ADMIN:
            db_user.role = login_req.role
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        
    # 5. Issue JWT token
    token = create_access_token(db_user.wallet_address, db_user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role,
        "wallet_address": db_user.wallet_address
    }

# Contract Escrows Management
@app.post("/contracts", response_model=CommissionRead)
@limiter.limit("5/minute")
def create_contract(
    commission: CommissionCreate, 
    request: Request,
    session: Session = Depends(get_session),
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional)
):
    # Input sanitization
    clean_title = clean_input_string(commission.title, "title")
    clean_desc = clean_input_string(commission.description, "description")
    
    if len(clean_title) > 100:
        raise HTTPException(status_code=400, detail="Title is too long (max 100 characters)")
    if len(clean_desc) > 1000:
        raise HTTPException(status_code=400, detail="Description is too long (max 1000 characters)")
        
    validate_stellar_address(commission.client_address)
    validate_stellar_address(commission.artist_address)
    
    if commission.client_address == commission.artist_address:
        raise HTTPException(status_code=400, detail="Client and Artist addresses cannot be identical.")
        
    if commission.amount_usdc <= 0:
        raise HTTPException(status_code=400, detail="USDC amount must be greater than zero.")
        
    # Validate deadline range (1–90 days)
    if commission.deadline_days < 1 or commission.deadline_days > 90:
        raise HTTPException(status_code=400, detail="Deadline must be between 1 and 90 days.")
        
    # Enforce authorization: request client address must match current user wallet address
    if current_user and current_user.role != ROLE_ADMIN and commission.client_address != current_user.wallet_address:
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: Client address in contract does not match authenticated user."
        )
    
    # Validate milestone configuration when commission_type == "milestone"
    if commission.commission_type == "milestone":
        if not commission.milestones:
            raise HTTPException(status_code=400, detail="Milestones are required for milestone-type commissions.")
        if len(commission.milestones) < 2 or len(commission.milestones) > 10:
            raise HTTPException(status_code=400, detail="Milestone count must be between 2 and 10.")
        if any(m.percentage <= 0 for m in commission.milestones):
            raise HTTPException(status_code=400, detail="Each milestone percentage must be greater than zero.")
        if sum(m.percentage for m in commission.milestones) != 100:
            raise HTTPException(status_code=400, detail="Milestone percentages must sum to 100.")
        
    db_commission = Commission.model_validate(commission.model_dump(exclude={"milestones"}))
    db_commission.title = clean_title
    db_commission.description = clean_desc
    
    active_version = os.getenv("DEPLOYER_SECRET_KEY_VERSION", "v1")
    db_commission.deployer_key_version = active_version
    
    # Compute deadline as UTC datetime and Unix timestamp for the smart contract
    deadline_dt = datetime.utcnow() + timedelta(days=commission.deadline_days)
    deadline_unix = int(deadline_dt.timestamp())
    db_commission.deadline_at = deadline_dt
    
    # Trigger smart contract deployment
    try:
        if db_commission.commission_type == "milestone":
            contract_id = stellar_utils.deploy_and_initialize_milestone_escrow(
                client_address=db_commission.client_address,
                artist_address=db_commission.artist_address,
                milestones=[{"label": m.label, "percentage": m.percentage} for m in commission.milestones],
                version=active_version,
                deadline_unix=deadline_unix,
            )
        else:
            contract_id = stellar_utils.deploy_and_initialize_escrow(
                client_address=db_commission.client_address,
                artist_address=db_commission.artist_address,
                version=active_version,
                deadline_unix=deadline_unix
            )
        db_commission.contract_id = contract_id
    except Exception as e:
        logger.error(f"Contract deployment failed: {e}")
        error_detail = str(e)
        # Redact any secret key that might leak in error messages
        if error_detail and len(error_detail) > 500:
            error_detail = error_detail[:500] + "..."
        raise HTTPException(status_code=500, detail=f"Smart contract deployment failed: {error_detail}")
        
    session.add(db_commission)
    session.commit()
    session.refresh(db_commission)
    
    # Store milestone rows for milestone-type commissions
    if db_commission.commission_type == "milestone" and commission.milestones:
        for idx, m in enumerate(commission.milestones):
            milestone_row = Milestone(
                commission_id=db_commission.id,
                index=idx,
                label=m.label,
                percentage=m.percentage,
                status="Pending",
            )
            session.add(milestone_row)
        session.commit()
    
    return db_commission

@app.get("/contracts", response_model=List[CommissionRead])
def read_contracts(
    request: Request,
    client_address: str = None, 
    artist_address: str = None, 
    session: Session = Depends(get_session),
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional)
):
    query = select(Commission)
    
    # Role-based filtering (if authenticated)
    if current_user:
        if current_user.role == ROLE_ADMIN:
            if client_address:
                query = query.where(Commission.client_address == client_address)
            if artist_address:
                query = query.where(Commission.artist_address == artist_address)
        elif current_user.role == ROLE_CLIENT:
            query = query.where(Commission.client_address == current_user.wallet_address)
        elif current_user.role == ROLE_ARTIST:
            query = query.where(Commission.artist_address == current_user.wallet_address)
    else:
        # Unauthenticated: filter by provided params
        if client_address:
            query = query.where(Commission.client_address == client_address)
        if artist_address:
            query = query.where(Commission.artist_address == artist_address)
        
    commissions = session.exec(query).all()
    return commissions

@app.get("/contracts/{contract_id}", response_model=CommissionRead)
def read_contract(
    contract_id: int, 
    request: Request,
    session: Session = Depends(get_session),
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional)
):
    commission = session.get(Commission, contract_id)
    if not commission:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    # Access check: admin or participant only
    # Access check: admin or participant only (if authenticated)
    if current_user and current_user.role != ROLE_ADMIN:
        if commission.client_address != current_user.wallet_address and commission.artist_address != current_user.wallet_address:
            raise HTTPException(status_code=403, detail="Access denied.")
            
    return commission

@app.post("/contracts/{contract_id}/release")
def release_contract(
    contract_id: int,
    request: Request,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional)
):
    db_commission = session.get(Commission, contract_id)
    if not db_commission:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    is_client_owner = current_user and db_commission.client_address == current_user.wallet_address
    is_admin = current_user and current_user.role == ROLE_ADMIN
    
    if current_user and not (is_client_owner or is_admin):
        raise HTTPException(status_code=403, detail="Only the client owner or admin can release this contract.")
        
    if db_commission.status == "Released":
        return {"status": "success", "detail": "Contract is already released."}
        
    if is_client_owner:
        # Verify that the client has signed and released funds on-chain first
        try:
            on_chain_state = stellar_utils.get_contract_state_on_chain(
                db_commission.contract_id, 
                version=db_commission.deployer_key_version
            )
            if on_chain_state != "Released":
                raise HTTPException(
                    status_code=400, 
                    detail=f"On-chain contract state is '{on_chain_state}', not 'Released'. Client must sign and submit approve_release on-chain first."
                )
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            logger.error(f"On-chain verification failed: {e}")
            raise HTTPException(
                status_code=400,
                detail="Unable to verify contract state on-chain. Please ensure you have signed and submitted approve_release on-chain first."
            )
            
        db_commission.status = "Released"
        session.add(db_commission)
        session.commit()
        
    elif is_admin:
        # Admin force release via deployer key
        try:
            stellar_utils.perform_admin_action(
                db_commission.contract_id, 
                "admin_force_release", 
                version=db_commission.deployer_key_version
            )
            db_commission.status = "Released"
            session.add(db_commission)
            session.commit()
        except Exception as e:
            logger.error(f"Admin force release failed: {e}")
            raise HTTPException(status_code=500, detail="Admin force release transaction failed.")
            
    background_tasks.add_task(dispatch_notification, "Released", db_commission, session)
    return {"status": "success"}

@app.post("/contracts/{contract_id}/refund")
def refund_contract(
    contract_id: int,
    request: Request,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    admin_user: CurrentUser = Depends(require_admin)
):
    db_commission = session.get(Commission, contract_id)
    if not db_commission or not db_commission.contract_id:
        raise HTTPException(status_code=404, detail="Valid commission contract not found")
        
    if db_commission.status == "Refunded":
        return {"status": "success", "detail": "Contract is already refunded."}
        
    try:
        stellar_utils.perform_admin_action(
            db_commission.contract_id, 
            "admin_refund", 
            version=db_commission.deployer_key_version
        )
        db_commission.status = "Refunded"
        session.add(db_commission)
        session.commit()
    except Exception as e:
        logger.error(f"Admin refund failed: {e}")
        raise HTTPException(status_code=500, detail="Admin refund transaction failed.")
        
    background_tasks.add_task(dispatch_notification, "Refunded", db_commission, session)
    return {"status": "success"}

@app.post("/contracts/{contract_id}/client-refund")
def client_refund_expired(
    contract_id: int,
    request: Request,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional)
):
    """
    Syncs off-chain status after the client has submitted client_refund_expired on-chain.
    Only the registered client can call this. Verifies the deadline has passed and
    confirms the on-chain state is Refunded before updating the database.
    """
    db_commission = session.get(Commission, contract_id)
    if not db_commission or not db_commission.contract_id:
        raise HTTPException(status_code=404, detail="Valid commission contract not found")

    # Only the client can trigger this (if authenticated)
    if current_user and db_commission.client_address != current_user.wallet_address:
        raise HTTPException(status_code=403, detail="Only the client can claim an expired refund.")

    # Check deadline in the database first (fast fail before querying on-chain)
    if db_commission.deadline_at and datetime.utcnow() < db_commission.deadline_at:
        raise HTTPException(status_code=400, detail="Deadline has not passed yet.")

    if db_commission.status == "Refunded":
        return {"status": "success", "detail": "Contract is already refunded."}

    # Verify on-chain state is Refunded (client must have already signed on-chain)
    try:
        on_chain_state = stellar_utils.get_contract_state_on_chain(
            db_commission.contract_id,
            version=db_commission.deployer_key_version
        )
        if on_chain_state != "Refunded":
            raise HTTPException(
                status_code=400,
                detail=f"On-chain state is '{on_chain_state}'. Submit client_refund_expired on-chain first."
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"On-chain verification failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify on-chain state.")

    db_commission.status = "Refunded"
    session.add(db_commission)
    session.commit()
    background_tasks.add_task(dispatch_notification, "Refunded", db_commission, session)
    return {"status": "success"}

# Disputes Resolution Management
@app.post("/disputes", response_model=DisputeRead)
def create_dispute(
    dispute: DisputeCreate, 
    request: Request,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user)
):
    db_commission = session.get(Commission, dispute.commission_id)
    if not db_commission:
         raise HTTPException(status_code=404, detail="Commission not found to link dispute to.")
         
    # Check if current user is participant or admin
    is_participant = (db_commission.client_address == current_user.wallet_address or 
                      db_commission.artist_address == current_user.wallet_address)
    if not is_participant and current_user.role != ROLE_ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden: You are not a participant in this commission.")
        
    # Check that raised_by_address matches requesting user
    if current_user.role != ROLE_ADMIN and dispute.raised_by_address != current_user.wallet_address:
        raise HTTPException(status_code=403, detail="Forbidden: raised_by_address must match authenticated user.")
        
    clean_reason = clean_input_string(dispute.reason, "reason")
    
    db_dispute = Dispute.model_validate(dispute)
    db_dispute.reason = clean_reason
    
    session.add(db_dispute)
    
    # Mark commission status as Disputed
    db_commission.status = "Disputed"
    session.add(db_commission)
    
    session.commit()
    session.refresh(db_dispute)
    background_tasks.add_task(dispatch_notification, "Disputed", db_commission, session, db_dispute)
    return db_dispute

@app.get("/disputes", response_model=List[DisputeRead])
def read_disputes(
    request: Request,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user)
):
    if current_user.role == ROLE_ADMIN:
        disputes = session.exec(select(Dispute)).all()
        return disputes
        
    # Clients/artists only see disputes on their contracts
    query = select(Dispute).join(Commission, Dispute.commission_id == Commission.id).where(
        (Commission.client_address == current_user.wallet_address) | 
        (Commission.artist_address == current_user.wallet_address)
    )
    disputes = session.exec(query).all()
    return disputes

@app.patch("/disputes/{dispute_id}/resolve")
def resolve_dispute(
    dispute_id: int, 
    resolution: str, 
    request: Request,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    admin_user: CurrentUser = Depends(require_admin)
):
    db_dispute = session.get(Dispute, dispute_id)
    if not db_dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    if resolution not in ["Refunded", "ForceReleased"]:
         raise HTTPException(status_code=400, detail="Invalid resolution status")
         
    db_dispute.status = f"Resolved_{resolution}"
    session.add(db_dispute)
    
    db_commission = session.get(Commission, db_dispute.commission_id)
    if db_commission:
        action = "admin_refund" if resolution == "Refunded" else "admin_force_release"
        try:
            stellar_utils.perform_admin_action(
                db_commission.contract_id, 
                action, 
                version=db_commission.deployer_key_version
            )
            db_commission.status = "Refunded" if resolution == "Refunded" else "Released"
            session.add(db_commission)
        except Exception as e:
            logger.error(f"On-chain resolve dispute failed: {e}")
            raise HTTPException(status_code=500, detail=f"On-chain resolution failed: {e}")
        
    session.commit()
    background_tasks.add_task(dispatch_notification, "Dispute_Resolved", db_commission, session)
    return {"status": "success", "dispute_status": db_dispute.status}


# Milestone Management Endpoints
@app.get("/contracts/{contract_id}/milestones", response_model=List[MilestoneRead])
def get_milestones(
    contract_id: int,
    request: Request,
    session: Session = Depends(get_session),
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional)
):
    """Returns milestone array with statuses, released total, and unreleased amount."""
    commission = session.get(Commission, contract_id)
    if not commission or commission.commission_type != "milestone":
        raise HTTPException(status_code=404, detail="Milestone commission not found")

    # Access check: participant or admin (if authenticated)
    if current_user and current_user.role != ROLE_ADMIN:
        if (commission.client_address != current_user.wallet_address and
                commission.artist_address != current_user.wallet_address):
            raise HTTPException(status_code=403, detail="Access denied.")

    milestones = session.exec(
        select(Milestone).where(Milestone.commission_id == contract_id).order_by(Milestone.index)
    ).all()

    # Compute released/unreleased from approved milestone percentages
    released_total = sum(
        m.percentage * commission.amount_usdc // 100
        for m in milestones if m.status == "Approved"
    )
    unreleased_amount = commission.amount_usdc - released_total

    # Attach summary as response headers (JSON body is the milestone list)
    from fastapi.responses import JSONResponse
    milestone_dicts = [MilestoneRead.model_validate(m).model_dump() for m in milestones]
    return JSONResponse(content={
        "milestones": milestone_dicts,
        "released_total": released_total,
        "unreleased_amount": unreleased_amount,
    })


@app.post("/contracts/{contract_id}/milestones/{index}/approve")
def approve_milestone(
    contract_id: int,
    index: int,
    request: Request,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Syncs off-chain milestone status after the client has signed approve_milestone on-chain.
    Only the commission client can call this endpoint.
    """
    commission = session.get(Commission, contract_id)
    if not commission or commission.commission_type != "milestone":
        raise HTTPException(status_code=404, detail="Milestone commission not found")

    if commission.client_address != current_user.wallet_address:
        raise HTTPException(status_code=403, detail="Only the client can approve milestones.")

    milestones = session.exec(
        select(Milestone).where(Milestone.commission_id == contract_id).order_by(Milestone.index)
    ).all()

    if index < 0 or index >= len(milestones):
        raise HTTPException(status_code=400, detail="Invalid milestone index.")

    target = milestones[index]
    if target.status != "Pending":
        raise HTTPException(status_code=400, detail="Milestone already processed.")

    # Verify on-chain state — the client must have already signed approve_milestone on-chain.
    # This mirrors the existing release_contract pattern: check on-chain state before DB update.
    try:
        on_chain_state = stellar_utils.get_contract_state_on_chain(
            commission.contract_id,
            version=commission.deployer_key_version
        )
        # After on-chain approval the state should be PartiallyReleased or Released
        if on_chain_state not in ("PartiallyReleased", "Released"):
            raise HTTPException(
                status_code=400,
                detail=f"On-chain state is '{on_chain_state}'. Approve the milestone on-chain via your wallet first."
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"On-chain milestone verification failed: {e}")
        raise HTTPException(
            status_code=400,
            detail="Unable to verify on-chain state. Please ensure you have approved the milestone on-chain first."
        )

    # Update DB milestone status
    target.status = "Approved"
    session.add(target)

    # Update commission status based on milestone progress
    all_approved = all(m.status == "Approved" for m in milestones)
    if all_approved:
        commission.status = "Released"
    else:
        commission.status = "PartiallyReleased"
    session.add(commission)
    session.commit()

    return {"status": "success", "milestone_index": index, "commission_status": commission.status}


# Reviews and Reputation Endpoints

def _validate_wallet_format(wallet_address: str):
    """Validate Stellar address format: 56 chars, starts with G."""
    if not wallet_address or len(wallet_address) != 56 or not wallet_address.startswith("G"):
        raise HTTPException(
            status_code=400,
            detail="Invalid wallet address format. Expected a 56-character Stellar public key starting with G."
        )


@app.post("/reviews", status_code=201, response_model=ReviewRead)
def create_review(
    review_input: ReviewCreate,
    request: Request,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user),
):
    # Look up commission
    commission = session.get(Commission, review_input.commission_id)
    if not commission:
        raise HTTPException(status_code=404, detail="Commission not found.")

    # Verify terminal state
    if commission.status not in ("Released", "Refunded"):
        raise HTTPException(
            status_code=400,
            detail="Commission is not complete. Reviews can only be submitted for Released or Refunded commissions."
        )

    # Verify caller is participant
    is_client = commission.client_address == current_user.wallet_address
    is_artist = commission.artist_address == current_user.wallet_address
    if not is_client and not is_artist:
        raise HTTPException(status_code=403, detail="You are not a participant of this commission.")

    # Determine reviewee
    reviewee_address = commission.artist_address if is_client else commission.client_address

    # Check for duplicate
    existing = session.exec(
        select(Review).where(
            Review.commission_id == review_input.commission_id,
            Review.reviewer_address == current_user.wallet_address,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You have already submitted a review for this commission.")

    # Validate star_rating
    if review_input.star_rating < 1 or review_input.star_rating > 5:
        raise HTTPException(status_code=400, detail="Star rating must be an integer between 1 and 5.")

    # Validate and sanitize text
    text_value = None
    if review_input.text is not None:
        if len(review_input.text) > 500:
            raise HTTPException(status_code=400, detail="Review text must not exceed 500 characters.")
        text_value = clean_input_string(review_input.text, "text")

    # Store review
    db_review = Review(
        commission_id=review_input.commission_id,
        reviewer_address=current_user.wallet_address,
        reviewee_address=reviewee_address,
        star_rating=review_input.star_rating,
        text=text_value,
    )
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review


@app.get("/reviews/{wallet_address}")
def get_reviews_for_wallet(
    wallet_address: str,
    request: Request,
    offset: int = 0,
    limit: int = 20,
    session: Session = Depends(get_session),
):
    _validate_wallet_format(wallet_address)

    # Clamp limit to [1, 100]
    limit = max(1, min(limit, 100))
    if offset < 0:
        offset = 0

    # Total count
    total = session.exec(
        select(func.count()).select_from(Review).where(Review.reviewee_address == wallet_address)
    ).one()

    # Paginated results
    reviews = session.exec(
        select(Review)
        .where(Review.reviewee_address == wallet_address)
        .order_by(Review.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    return {
        "reviews": [ReviewRead.model_validate(r).model_dump() for r in reviews],
        "total": total,
        "offset": offset,
        "limit": limit,
    }


@app.get("/reputation/{wallet_address}")
def get_reputation(
    wallet_address: str,
    request: Request,
    session: Session = Depends(get_session),
):
    _validate_wallet_format(wallet_address)

    row = session.exec(
        select(func.avg(Review.star_rating), func.count()).select_from(Review).where(
            Review.reviewee_address == wallet_address
        )
    ).one()

    avg_raw, count = row

    if count == 0:
        aggregate_score = None
    else:
        # Half-up rounding to 1 decimal
        aggregate_score = float(Decimal(str(avg_raw)).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))

    return {
        "wallet_address": wallet_address,
        "aggregate_score": aggregate_score,
        "review_count": count,
    }


@app.delete("/reviews/{review_id}", status_code=204)
def delete_review(
    review_id: int,
    request: Request,
    session: Session = Depends(get_session),
    admin_user: CurrentUser = Depends(require_admin),
):
    db_review = session.get(Review, review_id)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found.")

    session.delete(db_review)
    session.commit()
    return Response(status_code=204)

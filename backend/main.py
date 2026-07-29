import os
import logging
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from stellar_sdk import Keypair

import models
from database import create_db_and_tables, get_session
from models import (
    Commission, CommissionCreate, CommissionRead,
    Dispute, DisputeCreate, DisputeRead, User
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
        
    create_db_and_tables()

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
        
    db_commission = Commission.model_validate(commission)
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
        contract_id = stellar_utils.deploy_and_initialize_escrow(
            client_address=db_commission.client_address,
            artist_address=db_commission.artist_address,
            version=active_version,
            deadline_unix=deadline_unix
        )
        db_commission.contract_id = contract_id
    except Exception as e:
        logger.error(f"Contract deployment failed: {e}")
        raise HTTPException(status_code=500, detail="Smart contract deployment failed. Please try again.")
        
    session.add(db_commission)
    session.commit()
    session.refresh(db_commission)
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
            
    return {"status": "success"}

@app.post("/contracts/{contract_id}/refund")
def refund_contract(
    contract_id: int,
    request: Request,
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
        
    return {"status": "success"}

@app.post("/contracts/{contract_id}/client-refund")
def client_refund_expired(
    contract_id: int,
    request: Request,
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
    return {"status": "success"}

# Disputes Resolution Management
@app.post("/disputes", response_model=DisputeRead)
def create_dispute(
    dispute: DisputeCreate, 
    request: Request,
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
    return {"status": "success", "dispute_status": db_dispute.status}

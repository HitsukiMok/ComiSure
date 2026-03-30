from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import create_db_and_tables, get_session
from models import (
    Commission, CommissionCreate, CommissionRead, CommissionUpdate,
    Dispute, DisputeCreate, DisputeRead
)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ComiSure API", description="Off-chain API for tracking Stellar Commissions")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For prototyping
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "Welcome to ComiSure Off-Chain API"}

@app.post("/commissions/", response_model=CommissionRead)
def create_commission(commission: CommissionCreate, session: Session = Depends(get_session)):
    db_commission = Commission.model_validate(commission)
    session.add(db_commission)
    session.commit()
    session.refresh(db_commission)
    return db_commission

@app.get("/commissions/", response_model=List[CommissionRead])
def read_commissions(
    client_address: str = None, 
    artist_address: str = None, 
    session: Session = Depends(get_session)
):
    query = select(Commission)
    if client_address:
        query = query.where(Commission.client_address == client_address)
    if artist_address:
        query = query.where(Commission.artist_address == artist_address)
    commissions = session.exec(query).all()
    return commissions

@app.get("/commissions/{commission_id}", response_model=CommissionRead)
def read_commission(commission_id: int, session: Session = Depends(get_session)):
    commission = session.get(Commission, commission_id)
    if not commission:
        raise HTTPException(status_code=404, detail="Commission not found")
    return commission

@app.patch("/commissions/{commission_id}", response_model=CommissionRead)
def update_commission(commission_id: int, commission_update: CommissionUpdate, session: Session = Depends(get_session)):
    db_commission = session.get(Commission, commission_id)
    if not db_commission:
        raise HTTPException(status_code=404, detail="Commission not found")
    
    commission_data = commission_update.model_dump(exclude_unset=True)
    for key, value in commission_data.items():
        setattr(db_commission, key, value)
    
    session.add(db_commission)
    session.commit()
    session.refresh(db_commission)
    return db_commission

@app.post("/disputes/", response_model=DisputeRead)
def create_dispute(dispute: DisputeCreate, session: Session = Depends(get_session)):
    db_commission = session.get(Commission, dispute.commission_id)
    if not db_commission:
         raise HTTPException(status_code=404, detail="Commission not found to link dispute to.")
         
    db_dispute = Dispute.model_validate(dispute)
    session.add(db_dispute)
    
    # Mark commission as Disputed
    db_commission.status = "Disputed"
    session.add(db_commission)
    
    session.commit()
    session.refresh(db_dispute)
    return db_dispute

@app.get("/disputes/", response_model=List[DisputeRead])
def read_disputes(session: Session = Depends(get_session)):
    disputes = session.exec(select(Dispute)).all()
    return disputes

@app.patch("/disputes/{dispute_id}/resolve")
def resolve_dispute(dispute_id: int, resolution: str, session: Session = Depends(get_session)):
    db_dispute = session.get(Dispute, dispute_id)
    if not db_dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    if resolution not in ["Refunded", "ForceReleased"]:
         raise HTTPException(status_code=400, detail="Invalid resolution status")
         
    db_dispute.status = f"Resolved_{resolution}"
    session.add(db_dispute)
    
    db_commission = session.get(Commission, db_dispute.commission_id)
    if db_commission:
        db_commission.status = "Refunded" if resolution == "Refunded" else "Released"
        session.add(db_commission)
        
    session.commit()
    return {"status": "success", "dispute_status": db_dispute.status}

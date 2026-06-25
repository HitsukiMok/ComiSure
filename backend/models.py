from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class CommissionBase(SQLModel):
    title: str = Field(index=True)
    description: str
    amount_usdc: int # 7-decimal representation as specified in SC
    client_address: str = Field(index=True)
    artist_address: str = Field(index=True)
    status: str = Field(default="Pending") # Pending, Funded, Delivered, Released, Refunded, Disputed

class Commission(CommissionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    contract_id: Optional[str] = Field(default=None) # Set when contract deployment/initialization happens
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deployer_key_version: Optional[str] = Field(default=None)

class CommissionCreate(CommissionBase):
    pass

class CommissionRead(CommissionBase):
    id: int
    contract_id: Optional[str]
    created_at: datetime
    deployer_key_version: Optional[str]

class CommissionUpdate(SQLModel):
    status: Optional[str] = None
    contract_id: Optional[str] = None

class DisputeBase(SQLModel):
    commission_id: int = Field(foreign_key="commission.id")
    raised_by_address: str
    reason: str
    proof_url: Optional[str] = None
    status: str = Field(default="Open") # Open, Resolved_Refunded, Resolved_Forced

class Dispute(DisputeBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DisputeCreate(DisputeBase):
    pass

class DisputeRead(DisputeBase):
    id: int
    created_at: datetime

class User(SQLModel, table=True):
    wallet_address: str = Field(primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    role: str = Field(default="client") # client | artist | admin

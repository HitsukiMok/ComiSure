from typing import Optional, List
from sqlmodel import Field, SQLModel
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import UniqueConstraint

class CommissionBase(SQLModel):
    title: str = Field(index=True)
    description: str
    amount_usdc: int # 7-decimal representation as specified in SC
    client_address: str = Field(index=True)
    artist_address: str = Field(index=True)
    status: str = Field(default="Pending") # Pending, Funded, Delivered, Released, Refunded, Disputed
    deadline_days: int = Field(default=14) # 1–90 days until client can self-refund
    commission_type: str = Field(default="single") # "single" | "milestone"

class Commission(CommissionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    contract_id: Optional[str] = Field(default=None) # Set when contract deployment/initialization happens
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deployer_key_version: Optional[str] = Field(default=None)
    deadline_at: Optional[datetime] = Field(default=None) # Computed UTC datetime of the deadline

class MilestoneInput(BaseModel):
    label: str
    percentage: int

class CommissionCreate(CommissionBase):
    milestones: Optional[List[MilestoneInput]] = None

class CommissionRead(CommissionBase):
    id: int
    contract_id: Optional[str]
    created_at: datetime
    deployer_key_version: Optional[str]
    deadline_at: Optional[datetime]

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


class MilestoneBase(SQLModel):
    commission_id: int = Field(foreign_key="commission.id", index=True)
    index: int                    # 0-based position
    label: str
    percentage: int               # 1–99, all sum to 100
    status: str = Field(default="Pending")  # Pending, Approved, Refunded

class Milestone(MilestoneBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class MilestoneRead(MilestoneBase):
    id: int


class ReviewBase(SQLModel):
    commission_id: int = Field(foreign_key="commission.id", index=True)
    reviewer_address: str = Field(index=True)
    reviewee_address: str = Field(index=True)
    star_rating: int = Field(ge=1, le=5)
    text: Optional[str] = Field(default=None, max_length=500)


class Review(ReviewBase, table=True):
    __table_args__ = (
        UniqueConstraint("commission_id", "reviewer_address", name="uq_review_commission_reviewer"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ReviewCreate(SQLModel):
    commission_id: int
    star_rating: int = Field(ge=1, le=5)
    text: Optional[str] = Field(default=None, max_length=500)


class ReviewRead(ReviewBase):
    id: int
    created_at: datetime

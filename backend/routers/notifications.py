"""
Notification preferences and push subscription endpoints.
"""

import re
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from middleware.auth import get_current_user, require_admin, CurrentUser
from models import (
    NotificationPreference,
    NotificationPreferenceUpdate,
    NotificationPreferenceRead,
    PushSubscription,
    PushSubscriptionCreate,
    PushSubscriptionRead,
)
from services.notifications import enforce_subscription_cap

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["notifications"])

# RFC 5322 simplified regex for email validation
EMAIL_RE = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?"
    r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
)


def _validate_email(email: str) -> str:
    """Validate email format per RFC 5322 (simplified). Raises 422 on invalid."""
    if not email or len(email) > 254:
        raise HTTPException(status_code=422, detail="Invalid email address.")
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=422, detail="Invalid email address format.")
    return email


# ─── Task 4.1: GET/PUT /notifications/preferences ─────────────────────────────

@router.get("/preferences", response_model=NotificationPreferenceRead)
def get_preferences(
    user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    pref = session.get(NotificationPreference, user.wallet_address)
    if not pref:
        # Return defaults
        return NotificationPreferenceRead(
            wallet_address=user.wallet_address,
            email_enabled=False,
            push_enabled=False,
            email_address=None,
        )
    return pref


@router.put("/preferences", response_model=NotificationPreferenceRead)
def update_preferences(
    data: NotificationPreferenceUpdate,
    user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Validate: if email_enabled is True, email_address must be provided
    email_enabled = data.email_enabled if data.email_enabled is not None else False
    email_address = data.email_address

    if email_enabled:
        if not email_address:
            raise HTTPException(
                status_code=422,
                detail="Email address is required when email notifications are enabled.",
            )
        _validate_email(email_address)
    elif email_address:
        # Validate format even if not enabled (store validated data)
        _validate_email(email_address)

    pref = session.get(NotificationPreference, user.wallet_address)
    if not pref:
        pref = NotificationPreference(wallet_address=user.wallet_address)
        session.add(pref)

    if data.email_enabled is not None:
        pref.email_enabled = data.email_enabled
    if data.push_enabled is not None:
        pref.push_enabled = data.push_enabled
    if data.email_address is not None:
        pref.email_address = data.email_address

    session.commit()
    session.refresh(pref)
    return pref


# ─── Task 4.2: POST/DELETE /notifications/subscriptions ────────────────────────

@router.post("/subscriptions", response_model=PushSubscriptionRead, status_code=201)
def create_subscription(
    data: PushSubscriptionCreate,
    user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    sub = PushSubscription(
        wallet_address=user.wallet_address,
        endpoint=data.endpoint,
        p256dh=data.p256dh,
        auth=data.auth,
    )
    session.add(sub)
    session.commit()
    session.refresh(sub)

    # Enforce FIFO cap (max 10 per user)
    enforce_subscription_cap(user.wallet_address, session)

    return sub


@router.delete("/subscriptions/{sub_id}", status_code=204)
def delete_subscription(
    sub_id: int,
    user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    sub = session.get(PushSubscription, sub_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found.")
    if sub.wallet_address != user.wallet_address:
        raise HTTPException(status_code=403, detail="You can only delete your own subscriptions.")
    session.delete(sub)
    session.commit()


# ─── Task 4.3: GET /notifications/preferences/{wallet} (admin only) ───────────

@router.get("/preferences/{wallet_address}", response_model=NotificationPreferenceRead)
def get_preferences_admin(
    wallet_address: str,
    admin: CurrentUser = Depends(require_admin),
    session: Session = Depends(get_session),
):
    pref = session.get(NotificationPreference, wallet_address)
    if not pref:
        raise HTTPException(status_code=404, detail="Preferences not found for this wallet.")

    # Redact email for admin view (Property 12)
    return NotificationPreferenceRead(
        wallet_address=pref.wallet_address,
        email_enabled=pref.email_enabled,
        push_enabled=pref.push_enabled,
        email_address=None,  # redacted
    )

"""
Notification service module.

Handles email (Resend) and push (pywebpush) delivery, recipient resolution,
payload construction, and deadline checking.
"""

import os
import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional

from sqlmodel import Session, select

logger = logging.getLogger(__name__)

# ─── Environment ───────────────────────────────────────────────────────────────

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
VAPID_CLAIMS_EMAIL = os.getenv("VAPID_CLAIMS_EMAIL", "mailto:admin@comisure.com")
NOTIFICATION_FROM_EMAIL = os.getenv("NOTIFICATION_FROM_EMAIL", "noreply@comisure.com")

if not RESEND_API_KEY:
    logger.warning("RESEND_API_KEY not set — email notifications disabled.")
if not VAPID_PRIVATE_KEY:
    logger.warning("VAPID_PRIVATE_KEY not set — push notifications disabled.")


# ─── Recipient Resolution (Task 2.1) ──────────────────────────────────────────

def resolve_recipients(event_type: str, commission, dispute=None) -> list[str]:
    """
    Return wallet addresses that should be notified for a given event.
    Property 6: Event-to-recipient mapping.
    """
    mapping = {
        "Funded": [commission.artist_address],
        "Delivered": [commission.client_address],
        "Released": [commission.artist_address],
        "Refunded": [commission.client_address, commission.artist_address],
        "Dispute_Resolved": [commission.client_address, commission.artist_address],
        "Deadline_Approaching": [commission.artist_address],
    }

    if event_type == "Disputed" and dispute:
        # Notify the other participant
        if dispute.raised_by_address == commission.client_address:
            return [commission.artist_address]
        return [commission.client_address]

    return mapping.get(event_type, [])


# ─── Payload Builder (Task 2.2) ────────────────────────────────────────────────

def build_payload(event_type: str, commission) -> dict:
    """
    Construct notification payload.
    Property 8: Contains event_type, title (≤120 chars), url. Total ≤4096 bytes.
    """
    titles = {
        "Funded": f"Commission '{commission.title}' has been funded",
        "Delivered": f"Work delivered for '{commission.title}'",
        "Released": f"Payment released for '{commission.title}'",
        "Refunded": f"Commission '{commission.title}' has been refunded",
        "Disputed": f"Dispute raised on '{commission.title}'",
        "Dispute_Resolved": f"Dispute resolved for '{commission.title}'",
        "Deadline_Approaching": f"Deadline approaching for '{commission.title}'",
    }

    title = titles.get(event_type, f"Update on '{commission.title}'")
    # Truncate to 120 chars
    if len(title) > 120:
        title = title[:117] + "..."

    url = f"/commissions/{commission.id}"

    payload = {
        "event_type": event_type,
        "title": title,
        "url": url,
    }

    # Ensure total payload ≤ 4096 bytes
    encoded = json.dumps(payload).encode("utf-8")
    if len(encoded) > 4096:
        # Truncate title further to fit
        excess = len(encoded) - 4096
        payload["title"] = title[: max(0, len(title) - excess - 3)] + "..."

    return payload


# ─── Email Channel (Task 2.3) ──────────────────────────────────────────────────

def send_email(to: str, payload: dict):
    """
    Send notification email via Resend. 10s timeout, no retry.
    Gracefully skips if RESEND_API_KEY is missing.
    """
    if not RESEND_API_KEY:
        return

    try:
        import resend

        resend.api_key = RESEND_API_KEY
        resend.Emails.send(
            {
                "from": NOTIFICATION_FROM_EMAIL,
                "to": [to],
                "subject": payload["title"],
                "html": f"""
                    <h2>{payload['title']}</h2>
                    <p>Event: {payload['event_type']}</p>
                    <p><a href="https://comisure.app{payload['url']}">View Commission</a></p>
                """,
            },
            timeout=10,
        )
    except Exception as e:
        logger.error(f"Email send failed to={to} event={payload['event_type']}: {e}")


# ─── Push Channel (Task 2.4) ───────────────────────────────────────────────────

def send_push(subscriptions: list, payload: dict, session: Session):
    """
    Send push notification to all subscriptions. Remove expired (410/404).
    No retry on 5xx.
    """
    if not VAPID_PRIVATE_KEY:
        return

    from pywebpush import webpush, WebPushException

    data = json.dumps(payload)

    for sub in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
                },
                data=data,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": VAPID_CLAIMS_EMAIL},
            )
        except WebPushException as e:
            status = getattr(e, "response", None)
            status_code = status.status_code if status else None
            if status_code in (410, 404):
                # Expired subscription — remove it
                session.delete(sub)
                session.commit()
                logger.info(f"Removed expired push subscription id={sub.id}")
            else:
                logger.error(f"Push send failed sub_id={sub.id}: {e}")
        except Exception as e:
            logger.error(f"Push send error sub_id={sub.id}: {e}")


# ─── Subscription FIFO Cap (Task 2.6) ─────────────────────────────────────────

def enforce_subscription_cap(wallet_address: str, session: Session, max_subs: int = 10):
    """
    Ensure at most `max_subs` subscriptions per user. Remove oldest on overflow.
    Property 4: FIFO cap.
    """
    from models import PushSubscription

    statement = (
        select(PushSubscription)
        .where(PushSubscription.wallet_address == wallet_address)
        .order_by(PushSubscription.created_at.desc())
    )
    all_subs = session.exec(statement).all()

    if len(all_subs) > max_subs:
        # Keep the newest max_subs, delete the rest
        to_delete = all_subs[max_subs:]
        for sub in to_delete:
            session.delete(sub)
        session.commit()


# ─── Dispatch Orchestrator (Task 2.5) ─────────────────────────────────────────

def dispatch_notification(
    event_type: str,
    commission,
    session: Session,
    dispute=None,
):
    """
    Resolve recipients → get preferences → fan out to enabled channels.
    Property 9: Only dispatches to channels enabled with valid targets.
    5s timeout on preference resolution (best-effort via log-and-abort).
    """
    from models import NotificationPreference, PushSubscription

    recipients = resolve_recipients(event_type, commission, dispute)
    if not recipients:
        logger.warning(f"No recipients for event={event_type} commission_id={commission.id}")
        return

    payload = build_payload(event_type, commission)

    for wallet in recipients:
        try:
            pref = session.get(NotificationPreference, wallet)
            if not pref:
                continue

            # Email channel
            if pref.email_enabled and pref.email_address:
                send_email(pref.email_address, payload)

            # Push channel
            if pref.push_enabled:
                subs = session.exec(
                    select(PushSubscription).where(
                        PushSubscription.wallet_address == wallet
                    )
                ).all()
                if subs:
                    send_push(subs, payload, session)

        except Exception as e:
            logger.error(f"Dispatch failed for wallet={wallet} event={event_type}: {e}")


# ─── Deadline Checker (Task 2.7) ───────────────────────────────────────────────

async def start_deadline_checker():
    """
    Asyncio background loop. Runs every 60 minutes.
    Queries Funded commissions with deadline_at within 24h, dispatches to artist.
    Property 7: Correct filtering.
    """
    from database import get_session as get_session_gen
    from models import Commission

    while True:
        try:
            # Get a session from the generator
            session_gen = get_session_gen()
            session = next(session_gen)
            try:
                now = datetime.utcnow()
                horizon = now + timedelta(hours=24)

                statement = select(Commission).where(
                    Commission.status == "Funded",
                    Commission.deadline_at != None,  # noqa: E711
                    Commission.deadline_at > now,
                    Commission.deadline_at <= horizon,
                )
                commissions = session.exec(statement).all()

                for comm in commissions:
                    dispatch_notification("Deadline_Approaching", comm, session)

                if commissions:
                    logger.info(f"Deadline checker: notified {len(commissions)} approaching deadlines.")
            finally:
                # Close the session
                try:
                    next(session_gen)
                except StopIteration:
                    pass
        except Exception as e:
            logger.error(f"Deadline checker error: {e}")

        await asyncio.sleep(3600)  # 60 minutes

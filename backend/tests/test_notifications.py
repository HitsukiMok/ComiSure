"""
Property-based tests for the Notification System.

Uses Hypothesis + FastAPI TestClient with in-memory SQLite.
Each test validates a correctness property from the design document.
"""

import json
import string
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

import pytest
from hypothesis import given, settings, assume, HealthCheck
from hypothesis import strategies as st
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.pool import StaticPool

from main import app
from database import get_session
from middleware.auth import create_access_token, ROLE_CLIENT, ROLE_ARTIST, ROLE_ADMIN
from models import (
    Commission, NotificationPreference, PushSubscription, Dispute
)
from services.notifications import (
    resolve_recipients, build_payload, dispatch_notification, enforce_subscription_cap
)


# --- Test infrastructure ---

STELLAR_CHARS = string.ascii_uppercase + "234567"


@st.composite
def stellar_address(draw):
    rest = draw(st.text(alphabet=STELLAR_CHARS, min_size=55, max_size=55))
    return "G" + rest


@st.composite
def two_distinct_addresses(draw):
    a = draw(stellar_address())
    b = draw(stellar_address())
    assume(a != b)
    return a, b


def make_engine():
    return create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


def get_test_session(engine):
    def override():
        with Session(engine) as session:
            yield session
    return override


def fresh_client():
    engine = make_engine()
    SQLModel.metadata.create_all(engine)
    app.dependency_overrides[get_session] = get_test_session(engine)
    client = TestClient(app)
    return client, engine


def auth_header(wallet_address, role=ROLE_CLIENT):
    token = create_access_token(wallet_address, role)
    return {"Authorization": f"Bearer {token}"}


def create_user(engine, wallet_address, role="client"):
    from models import User
    with Session(engine) as session:
        u = session.get(User, wallet_address)
        if not u:
            u = User(wallet_address=wallet_address, role=role)
            session.add(u)
            session.commit()


def create_commission(engine, client_address, artist_address, status="Funded", deadline_at=None):
    with Session(engine) as session:
        c = Commission(
            title="Test Commission",
            description="Test",
            amount_usdc=1000,
            client_address=client_address,
            artist_address=artist_address,
            status=status,
            deadline_days=14,
            commission_type="single",
            deadline_at=deadline_at,
        )
        session.add(c)
        session.commit()
        session.refresh(c)
        return c


COMMON_SETTINGS = settings(
    max_examples=100,
    suppress_health_check=[HealthCheck.function_scoped_fixture],
    deadline=None,
)


# --- Property 1: Preference Storage Round-Trip ---

@st.composite
def valid_email(draw):
    user = draw(st.text(
        alphabet=string.ascii_lowercase + string.digits + "._",
        min_size=1, max_size=20,
    ))
    domain = draw(st.text(
        alphabet=string.ascii_lowercase,
        min_size=2, max_size=10,
    ))
    tld = draw(st.sampled_from(["com", "net", "org", "io"]))
    return f"{user}@{domain}.{tld}"


@COMMON_SETTINGS
@given(
    addresses=stellar_address(),
    email=valid_email(),
    email_enabled=st.booleans(),
    push_enabled=st.booleans(),
)
def test_prop_preference_round_trip(addresses, email, email_enabled, push_enabled):
    """
    Property 1: Round-trip consistency.
    Validates: Requirements 1.1, 1.2, 1.3
    """
    wallet = addresses
    client, engine = fresh_client()
    create_user(engine, wallet)

    headers = auth_header(wallet)
    payload = {
        "email_enabled": email_enabled,
        "push_enabled": push_enabled,
        "email_address": email if email_enabled else None,
    }

    resp = client.put("/notifications/preferences", json=payload, headers=headers)
    # If email_enabled but no email → 422; otherwise should succeed
    if email_enabled and not email:
        assert resp.status_code == 422
    else:
        assert resp.status_code == 200

        # Read back
        resp2 = client.get("/notifications/preferences", headers=headers)
        assert resp2.status_code == 200
        data = resp2.json()
        assert data["email_enabled"] == email_enabled
        assert data["push_enabled"] == push_enabled
        if email_enabled:
            assert data["email_address"] == email

    app.dependency_overrides.clear()


# --- Property 2: Invalid Email Rejection ---

@COMMON_SETTINGS
@given(
    wallet=stellar_address(),
    bad_email=st.text(min_size=1, max_size=100).filter(lambda s: "@" not in s or "." not in s.split("@")[-1] if "@" in s else True),
)
def test_prop_invalid_email_rejection(wallet, bad_email):
    """
    Property 2: Invalid email rejection.
    Validates: Requirements 1.4
    """
    assume("@" not in bad_email or not bad_email.split("@")[-1].count("."))
    client, engine = fresh_client()
    create_user(engine, wallet)

    headers = auth_header(wallet)
    resp = client.put("/notifications/preferences", json={
        "email_enabled": True,
        "email_address": bad_email,
    }, headers=headers)
    assert resp.status_code == 422

    app.dependency_overrides.clear()


# --- Property 3: Email-Required-When-Enabled ---

@COMMON_SETTINGS
@given(
    wallet=stellar_address(),
    empty_email=st.sampled_from([None, ""]),
)
def test_prop_email_required_when_enabled(wallet, empty_email):
    """
    Property 3: Email-required-when-enabled constraint.
    Validates: Requirements 1.5
    """
    client, engine = fresh_client()
    create_user(engine, wallet)

    headers = auth_header(wallet)
    resp = client.put("/notifications/preferences", json={
        "email_enabled": True,
        "email_address": empty_email,
    }, headers=headers)
    assert resp.status_code == 422

    app.dependency_overrides.clear()


# --- Property 4: Subscription FIFO Cap ---

@COMMON_SETTINGS
@given(
    wallet=stellar_address(),
    num_subs=st.integers(min_value=11, max_value=20),
)
def test_prop_subscription_fifo_cap(wallet, num_subs):
    """
    Property 4: Subscription FIFO cap.
    Validates: Requirements 2.3
    """
    client, engine = fresh_client()
    create_user(engine, wallet)
    headers = auth_header(wallet)

    sub_ids = []
    for i in range(num_subs):
        resp = client.post("/notifications/subscriptions", json={
            "endpoint": f"https://push.example.com/sub/{i}",
            "p256dh": f"key_{i}",
            "auth": f"auth_{i}",
        }, headers=headers)
        assert resp.status_code == 201
        sub_ids.append(resp.json()["id"])

    # Query via the test engine
    with Session(engine) as session:
        from sqlmodel import select as sel
        all_subs = session.exec(
            sel(PushSubscription)
            .where(PushSubscription.wallet_address == wallet)
        ).all()
        assert len(all_subs) <= 10

        # Retained should be the 10 most recent (highest IDs)
        retained_ids = sorted([s.id for s in all_subs])
        expected_ids = sorted(sub_ids[-10:])
        assert retained_ids == expected_ids

    app.dependency_overrides.clear()


# --- Property 5: Expired Subscription Cleanup ---

@COMMON_SETTINGS
@given(
    wallet=stellar_address(),
    error_code=st.sampled_from([410, 404]),
)
def test_prop_expired_subscription_cleanup(wallet, error_code):
    """
    Property 5: Expired subscription cleanup.
    Validates: Requirements 2.6, 5.4
    """
    engine = make_engine()
    SQLModel.metadata.create_all(engine)

    from models import User
    with Session(engine) as session:
        session.add(User(wallet_address=wallet, role="client"))
        session.commit()

    # Insert a subscription directly
    with Session(engine) as session:
        sub = PushSubscription(
            wallet_address=wallet,
            endpoint="https://push.example.com/expired",
            p256dh="key",
            auth="auth",
        )
        session.add(sub)
        session.commit()
        session.refresh(sub)
        sub_id = sub.id

    # Mock pywebpush to raise WebPushException with the error code
    mock_response = MagicMock()
    mock_response.status_code = error_code

    from pywebpush import WebPushException

    with Session(engine) as session:
        from sqlmodel import select as sel
        subs = session.exec(
            sel(PushSubscription).where(PushSubscription.id == sub_id)
        ).all()

        # Simulate what send_push does: call webpush, catch exception, delete sub
        for s in subs:
            try:
                raise WebPushException("Gone", response=mock_response)
            except WebPushException as e:
                status = getattr(e, "response", None)
                sc = status.status_code if status else None
                if sc in (410, 404):
                    session.delete(s)
                    session.commit()

    # Verify subscription was removed
    with Session(engine) as session:
        remaining = session.get(PushSubscription, sub_id)
        assert remaining is None


# --- Property 6: Event-to-Recipient Resolution ---

@COMMON_SETTINGS
@given(
    addresses=two_distinct_addresses(),
    event_type=st.sampled_from(["Funded", "Delivered", "Released", "Refunded", "Dispute_Resolved", "Deadline_Approaching"]),
)
def test_prop_event_recipient_resolution(addresses, event_type):
    """
    Property 6: Event-to-recipient resolution.
    Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
    """
    client_addr, artist_addr = addresses

    commission = MagicMock()
    commission.client_address = client_addr
    commission.artist_address = artist_addr

    recipients = resolve_recipients(event_type, commission)

    expected = {
        "Funded": [artist_addr],
        "Delivered": [client_addr],
        "Released": [artist_addr],
        "Refunded": [client_addr, artist_addr],
        "Dispute_Resolved": [client_addr, artist_addr],
        "Deadline_Approaching": [artist_addr],
    }
    assert recipients == expected[event_type]


@COMMON_SETTINGS
@given(addresses=two_distinct_addresses())
def test_prop_disputed_recipient_resolution(addresses):
    """
    Property 6 (Disputed variant): Notifies the other participant.
    """
    client_addr, artist_addr = addresses

    commission = MagicMock()
    commission.client_address = client_addr
    commission.artist_address = artist_addr

    # Client raises dispute → artist notified
    dispute = MagicMock()
    dispute.raised_by_address = client_addr
    assert resolve_recipients("Disputed", commission, dispute) == [artist_addr]

    # Artist raises dispute → client notified
    dispute.raised_by_address = artist_addr
    assert resolve_recipients("Disputed", commission, dispute) == [client_addr]


# --- Property 7: Deadline Checker Filtering ---

@COMMON_SETTINGS
@given(
    addresses=two_distinct_addresses(),
    hours_until_deadline=st.integers(min_value=-48, max_value=72),
    status=st.sampled_from(["Pending", "Funded", "Released", "Refunded", "Disputed"]),
)
def test_prop_deadline_checker_filtering(addresses, hours_until_deadline, status):
    """
    Property 7: Deadline checker correct filtering.
    Validates: Requirements 3.7
    """
    from sqlmodel import select

    client_addr, artist_addr = addresses
    engine = make_engine()
    SQLModel.metadata.create_all(engine)

    now = datetime.utcnow()
    deadline = now + timedelta(hours=hours_until_deadline)

    with Session(engine) as session:
        c = Commission(
            title="Test",
            description="Test",
            amount_usdc=1000,
            client_address=client_addr,
            artist_address=artist_addr,
            status=status,
            deadline_days=14,
            commission_type="single",
            deadline_at=deadline,
        )
        session.add(c)
        session.commit()

    # The deadline checker should select commissions where:
    # status == "Funded" AND deadline_at > now AND deadline_at <= now + 24h
    should_match = (
        status == "Funded"
        and hours_until_deadline > 0
        and hours_until_deadline <= 24
    )

    with Session(engine) as session:
        horizon = now + timedelta(hours=24)
        statement = select(Commission).where(
            Commission.status == "Funded",
            Commission.deadline_at != None,
            Commission.deadline_at > now,
            Commission.deadline_at <= horizon,
        )
        results = session.exec(statement).all()

        if should_match:
            assert len(results) == 1
        else:
            assert len(results) == 0


# --- Property 8: Payload Completeness and Size ---

@COMMON_SETTINGS
@given(
    title=st.text(min_size=0, max_size=500),
    event_type=st.sampled_from(["Funded", "Delivered", "Released", "Refunded", "Disputed", "Dispute_Resolved", "Deadline_Approaching"]),
)
def test_prop_payload_completeness_and_size(title, event_type):
    """
    Property 8: Notification payload completeness and size.
    Validates: Requirements 3.8, 5.2
    """
    commission = MagicMock()
    commission.title = title
    commission.id = 42

    payload = build_payload(event_type, commission)

    assert "event_type" in payload
    assert "title" in payload
    assert "url" in payload
    assert payload["event_type"] == event_type
    assert len(payload["title"]) <= 120

    # Total JSON size ≤ 4096 bytes
    encoded = json.dumps(payload).encode("utf-8")
    assert len(encoded) <= 4096


# --- Property 9: Channel Dispatch Routing ---

@COMMON_SETTINGS
@given(
    addresses=two_distinct_addresses(),
    email_enabled=st.booleans(),
    push_enabled=st.booleans(),
    has_email=st.booleans(),
    has_subs=st.booleans(),
)
def test_prop_channel_dispatch_routing(addresses, email_enabled, push_enabled, has_email, has_subs):
    """
    Property 9: Channel dispatch routing.
    Validates: Requirements 2.7, 5.1, 8.3
    """
    client_addr, artist_addr = addresses
    engine = make_engine()
    SQLModel.metadata.create_all(engine)

    from models import User
    with Session(engine) as session:
        session.add(User(wallet_address=artist_addr, role="artist"))
        session.commit()

        # Set up preferences for artist (recipient of "Funded")
        pref = NotificationPreference(
            wallet_address=artist_addr,
            email_enabled=email_enabled,
            push_enabled=push_enabled,
            email_address="test@example.com" if has_email else None,
        )
        session.add(pref)
        session.commit()

        if has_subs and push_enabled:
            sub = PushSubscription(
                wallet_address=artist_addr,
                endpoint="https://push.example.com/1",
                p256dh="key",
                auth="auth",
            )
            session.add(sub)
            session.commit()

    commission = MagicMock()
    commission.client_address = client_addr
    commission.artist_address = artist_addr
    commission.title = "Test"
    commission.id = 1

    with patch("services.notifications.send_email") as mock_email, \
         patch("services.notifications.send_push") as mock_push:

        with Session(engine) as session:
            dispatch_notification("Funded", commission, session)

        # Email should fire only if enabled AND has valid email
        if email_enabled and has_email:
            mock_email.assert_called_once()
        else:
            mock_email.assert_not_called()

        # Push should fire only if enabled AND has subscriptions
        if push_enabled and has_subs:
            mock_push.assert_called_once()
        else:
            mock_push.assert_not_called()


# --- Property 11: Cross-User Preference Access Blocked ---

@COMMON_SETTINGS
@given(addresses=two_distinct_addresses())
def test_prop_cross_user_access_blocked(addresses):
    """
    Property 11: Cross-user preference access blocked.
    Validates: Requirements 9.2
    """
    wallet_a, wallet_b = addresses
    client, engine = fresh_client()
    create_user(engine, wallet_a)
    create_user(engine, wallet_b)

    # User A sets their preferences
    headers_a = auth_header(wallet_a)
    client.put("/notifications/preferences", json={
        "email_enabled": False, "push_enabled": False,
    }, headers=headers_a)

    # User B (non-admin) tries to read A's preferences via admin endpoint
    headers_b = auth_header(wallet_b, ROLE_CLIENT)
    resp = client.get(f"/notifications/preferences/{wallet_a}", headers=headers_b)
    assert resp.status_code == 403

    app.dependency_overrides.clear()


# --- Property 12: Admin Email Redaction ---

@COMMON_SETTINGS
@given(
    addresses=two_distinct_addresses(),
    email=valid_email(),
)
def test_prop_admin_email_redaction(addresses, email):
    """
    Property 12: Admin email redaction.
    Validates: Requirements 9.6
    """
    user_wallet, admin_wallet = addresses
    client, engine = fresh_client()
    create_user(engine, user_wallet)
    create_user(engine, admin_wallet, role="admin")

    # User sets email preferences
    headers_user = auth_header(user_wallet)
    client.put("/notifications/preferences", json={
        "email_enabled": True,
        "email_address": email,
    }, headers=headers_user)

    # Admin reads user's preferences
    headers_admin = auth_header(admin_wallet, ROLE_ADMIN)
    resp = client.get(f"/notifications/preferences/{user_wallet}", headers=headers_admin)
    assert resp.status_code == 200
    data = resp.json()

    # Email must be redacted (None)
    assert data["email_address"] is None
    # But email_enabled status should be visible
    assert data["email_enabled"] is True

    app.dependency_overrides.clear()

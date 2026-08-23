"""
Property-based tests for the Reputation and Rating System.

Uses Hypothesis + FastAPI TestClient with in-memory SQLite.
Each test validates a correctness property from the design document.
"""

import string
import time
from decimal import Decimal, ROUND_HALF_UP

import pytest
from hypothesis import given, settings, assume, HealthCheck
from hypothesis import strategies as st
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.pool import StaticPool

from main import app
from database import get_session
from middleware.auth import create_access_token, ROLE_CLIENT, ROLE_ARTIST, ROLE_ADMIN
from models import Commission, Review


# --- Test infrastructure ---

STELLAR_CHARS = string.ascii_uppercase + "234567"


@st.composite
def stellar_address(draw):
    """Generate a random valid-format Stellar address (G + 55 base32 chars)."""
    rest = draw(st.text(alphabet=STELLAR_CHARS, min_size=55, max_size=55))
    return "G" + rest


@st.composite
def two_distinct_addresses(draw):
    """Generate two distinct Stellar addresses."""
    a = draw(stellar_address())
    b = draw(stellar_address())
    assume(a != b)
    return a, b


@st.composite
def three_distinct_addresses(draw):
    """Generate three distinct Stellar addresses."""
    a = draw(stellar_address())
    b = draw(stellar_address())
    c = draw(stellar_address())
    assume(len({a, b, c}) == 3)
    return a, b, c


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
    """Create a TestClient with a fresh in-memory DB."""
    engine = make_engine()
    SQLModel.metadata.create_all(engine)
    app.dependency_overrides[get_session] = get_test_session(engine)
    client = TestClient(app)
    return client, engine


def create_commission(engine, client_address, artist_address, status="Released"):
    """Insert a commission directly into the DB."""
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
        )
        session.add(c)
        session.commit()
        session.refresh(c)
        return c.id


def auth_header(wallet_address, role=ROLE_CLIENT):
    """Generate an Authorization header for the given wallet."""
    token = create_access_token(wallet_address, role)
    return {"Authorization": f"Bearer {token}"}


def insert_review(engine, commission_id, reviewer, reviewee, star_rating, text=None):
    """Insert a review directly into the DB."""
    from datetime import datetime
    with Session(engine) as session:
        r = Review(
            commission_id=commission_id,
            reviewer_address=reviewer,
            reviewee_address=reviewee,
            star_rating=star_rating,
            text=text,
        )
        session.add(r)
        session.commit()
        session.refresh(r)
        return r.id


# --- Property Tests ---

COMMON_SETTINGS = settings(max_examples=100, suppress_health_check=[HealthCheck.function_scoped_fixture])


@COMMON_SETTINGS
@given(
    addresses=two_distinct_addresses(),
    star_rating=st.integers(min_value=1, max_value=5),
    text=st.one_of(st.none(), st.text(min_size=0, max_size=500, alphabet=st.characters(blacklist_categories=("Cs",), blacklist_characters="<"))),
    terminal_status=st.sampled_from(["Released", "Refunded"]),
    reviewer_is_client=st.booleans(),
)
def test_prop_review_roundtrip(addresses, star_rating, text, terminal_status, reviewer_is_client):
    """
    Property 1: Review submission round-trip.
    **Validates: Requirements 1.1**
    """
    client_addr, artist_addr = addresses
    client, engine = fresh_client()

    commission_id = create_commission(engine, client_addr, artist_addr, status=terminal_status)

    reviewer = client_addr if reviewer_is_client else artist_addr
    headers = auth_header(reviewer, ROLE_CLIENT if reviewer_is_client else ROLE_ARTIST)

    payload = {"commission_id": commission_id, "star_rating": star_rating}
    if text is not None:
        payload["text"] = text

    resp = client.post("/reviews", json=payload, headers=headers)
    assert resp.status_code == 201, resp.text

    data = resp.json()
    assert data["star_rating"] == star_rating
    assert data["reviewer_address"] == reviewer
    expected_reviewee = artist_addr if reviewer_is_client else client_addr
    assert data["reviewee_address"] == expected_reviewee
    assert data["commission_id"] == commission_id
    if text is not None:
        assert data["text"] == text.strip()
    else:
        assert data["text"] is None

    app.dependency_overrides.clear()


@COMMON_SETTINGS
@given(
    addresses=two_distinct_addresses(),
    non_terminal=st.sampled_from(["Pending", "Funded", "Delivered", "Disputed"]),
    star_rating=st.integers(min_value=1, max_value=5),
)
def test_prop_non_terminal_rejection(addresses, non_terminal, star_rating):
    """
    Property 2: Non-terminal state rejection.
    **Validates: Requirements 1.2**
    """
    client_addr, artist_addr = addresses
    client, engine = fresh_client()

    commission_id = create_commission(engine, client_addr, artist_addr, status=non_terminal)
    headers = auth_header(client_addr, ROLE_CLIENT)

    resp = client.post("/reviews", json={"commission_id": commission_id, "star_rating": star_rating}, headers=headers)
    assert resp.status_code == 400

    app.dependency_overrides.clear()


@COMMON_SETTINGS
@given(
    addresses=three_distinct_addresses(),
    star_rating=st.integers(min_value=1, max_value=5),
    terminal_status=st.sampled_from(["Released", "Refunded"]),
)
def test_prop_non_participant_rejection(addresses, star_rating, terminal_status):
    """
    Property 3: Non-participant rejection.
    **Validates: Requirements 1.3**
    """
    client_addr, artist_addr, outsider = addresses
    client, engine = fresh_client()

    commission_id = create_commission(engine, client_addr, artist_addr, status=terminal_status)
    headers = auth_header(outsider, ROLE_CLIENT)

    resp = client.post("/reviews", json={"commission_id": commission_id, "star_rating": star_rating}, headers=headers)
    assert resp.status_code == 403

    app.dependency_overrides.clear()


@COMMON_SETTINGS
@given(
    addresses=two_distinct_addresses(),
    star1=st.integers(min_value=1, max_value=5),
    star2=st.integers(min_value=1, max_value=5),
    terminal_status=st.sampled_from(["Released", "Refunded"]),
)
def test_prop_duplicate_rejection(addresses, star1, star2, terminal_status):
    """
    Property 4: Duplicate submission rejection.
    **Validates: Requirements 1.4**
    """
    client_addr, artist_addr = addresses
    client, engine = fresh_client()

    commission_id = create_commission(engine, client_addr, artist_addr, status=terminal_status)
    headers = auth_header(client_addr, ROLE_CLIENT)

    # First submission succeeds
    resp1 = client.post("/reviews", json={"commission_id": commission_id, "star_rating": star1}, headers=headers)
    assert resp1.status_code == 201
    original = resp1.json()

    # Second submission rejected
    resp2 = client.post("/reviews", json={"commission_id": commission_id, "star_rating": star2}, headers=headers)
    assert resp2.status_code == 409

    # Original unchanged
    reviewee = artist_addr
    resp3 = client.get(f"/reviews/{reviewee}")
    reviews = resp3.json()["reviews"]
    assert len(reviews) == 1
    assert reviews[0]["star_rating"] == star1

    app.dependency_overrides.clear()


@COMMON_SETTINGS
@given(
    addresses=two_distinct_addresses(),
    bad_rating=st.integers().filter(lambda x: x < 1 or x > 5),
    terminal_status=st.sampled_from(["Released", "Refunded"]),
)
def test_prop_star_rating_boundary(addresses, bad_rating, terminal_status):
    """
    Property 5: Star rating boundary validation.
    **Validates: Requirements 1.5**
    """
    client_addr, artist_addr = addresses
    client, engine = fresh_client()

    commission_id = create_commission(engine, client_addr, artist_addr, status=terminal_status)
    headers = auth_header(client_addr, ROLE_CLIENT)

    resp = client.post(
        "/reviews",
        json={"commission_id": commission_id, "star_rating": bad_rating},
        headers=headers,
    )
    # Pydantic may catch this as 422 (ge/le constraint) or app logic catches as 400
    assert resp.status_code in (400, 422)

    app.dependency_overrides.clear()


@COMMON_SETTINGS
@given(
    addresses=two_distinct_addresses(),
    long_text=st.text(min_size=501, max_size=600, alphabet=st.characters(blacklist_categories=("Cs",), blacklist_characters="<")),
    terminal_status=st.sampled_from(["Released", "Refunded"]),
)
def test_prop_text_length_boundary(addresses, long_text, terminal_status):
    """
    Property 6: Text length boundary validation.
    **Validates: Requirements 1.6**
    """
    client_addr, artist_addr = addresses
    client, engine = fresh_client()

    commission_id = create_commission(engine, client_addr, artist_addr, status=terminal_status)
    headers = auth_header(client_addr, ROLE_CLIENT)

    resp = client.post(
        "/reviews",
        json={"commission_id": commission_id, "star_rating": 3, "text": long_text},
        headers=headers,
    )
    # Pydantic max_length may yield 422, or app logic yields 400
    assert resp.status_code in (400, 422)

    app.dependency_overrides.clear()


@COMMON_SETTINGS
@given(
    addresses=two_distinct_addresses(),
    num_reviews=st.integers(min_value=1, max_value=10),
    offset=st.integers(min_value=0, max_value=15),
    limit=st.integers(min_value=0, max_value=150),
)
def test_prop_retrieval_filtering_ordering(addresses, num_reviews, offset, limit):
    """
    Property 7: Review retrieval filtering and ordering.
    **Validates: Requirements 2.1, 2.2, 2.4**
    """
    client_addr, artist_addr = addresses
    client, engine = fresh_client()

    # Create multiple commissions, each with a review for the artist
    for i in range(num_reviews):
        cid = create_commission(engine, client_addr, artist_addr, status="Released")
        insert_review(engine, cid, client_addr, artist_addr, star_rating=((i % 5) + 1))
        # Small delay to ensure ordering by created_at is meaningful
        time.sleep(0.001)

    # Also insert a review where artist_addr is the REVIEWER (should not appear)
    cid2 = create_commission(engine, client_addr, artist_addr, status="Released")
    insert_review(engine, cid2, artist_addr, client_addr, star_rating=3)

    # Clamped limit
    effective_limit = max(1, min(limit, 100))
    effective_offset = max(0, offset)

    resp = client.get(f"/reviews/{artist_addr}", params={"offset": offset, "limit": limit})
    assert resp.status_code == 200
    data = resp.json()

    # Only reviews where reviewee_address == artist_addr
    assert data["total"] == num_reviews
    returned = data["reviews"]
    for r in returned:
        assert r["reviewee_address"] == artist_addr

    # Respects pagination
    expected_count = min(effective_limit, max(0, num_reviews - effective_offset))
    assert len(returned) == expected_count

    # Ordered by created_at DESC
    timestamps = [r["created_at"] for r in returned]
    assert timestamps == sorted(timestamps, reverse=True)

    app.dependency_overrides.clear()


@COMMON_SETTINGS
@given(
    bad_address=st.text(
        min_size=1, max_size=100,
        alphabet=st.characters(whitelist_categories=("L", "N"), whitelist_characters="_-.")
    ).filter(lambda s: not (len(s) == 56 and s.startswith("G"))),
)
def test_prop_invalid_address_rejection(bad_address):
    """
    Property 8: Invalid Stellar address rejection.
    **Validates: Requirements 2.5, 3.4**
    """
    client, engine = fresh_client()

    # GET /reviews/{bad_address} should 400
    resp1 = client.get(f"/reviews/{bad_address}")
    assert resp1.status_code == 400

    # GET /reputation/{bad_address} should 400
    resp2 = client.get(f"/reputation/{bad_address}")
    assert resp2.status_code == 400

    app.dependency_overrides.clear()


@COMMON_SETTINGS
@given(
    addresses=two_distinct_addresses(),
    ratings=st.lists(st.integers(min_value=1, max_value=5), min_size=1, max_size=20),
)
def test_prop_aggregate_correctness(addresses, ratings):
    """
    Property 9: Aggregate score correctness.
    **Validates: Requirements 3.1, 3.2**
    """
    client_addr, artist_addr = addresses
    client, engine = fresh_client()

    # Insert reviews from distinct "reviewers" (use client_addr variants)
    for i, rating in enumerate(ratings):
        # Each review needs a unique commission
        cid = create_commission(engine, client_addr, artist_addr, status="Released")
        # Use a synthetic unique reviewer per review (directly inserting)
        reviewer = "G" + f"{i:0>55}"[:55]
        insert_review(engine, cid, reviewer, artist_addr, star_rating=rating)

    resp = client.get(f"/reputation/{artist_addr}")
    assert resp.status_code == 200
    data = resp.json()

    assert data["review_count"] == len(ratings)

    # Expected aggregate: mean with half-up rounding to 1 decimal
    mean = sum(ratings) / len(ratings)
    expected = float(Decimal(str(mean)).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))
    assert data["aggregate_score"] == expected

    app.dependency_overrides.clear()


@COMMON_SETTINGS
@given(
    addresses=two_distinct_addresses(),
    role=st.sampled_from([ROLE_CLIENT, ROLE_ARTIST]),
)
def test_prop_non_admin_delete_rejection(addresses, role):
    """
    Property 10: Non-admin deletion rejection.
    **Validates: Requirements 6.2**
    """
    client_addr, artist_addr = addresses
    client, engine = fresh_client()

    cid = create_commission(engine, client_addr, artist_addr, status="Released")
    review_id = insert_review(engine, cid, client_addr, artist_addr, star_rating=4)

    headers = auth_header(client_addr, role)
    resp = client.delete(f"/reviews/{review_id}", headers=headers)
    assert resp.status_code == 403

    app.dependency_overrides.clear()


@COMMON_SETTINGS
@given(
    addresses=two_distinct_addresses(),
    ratings=st.lists(st.integers(min_value=1, max_value=5), min_size=2, max_size=10),
    delete_index=st.integers(min_value=0, max_value=9),
)
def test_prop_deletion_excludes_from_aggregate(addresses, ratings, delete_index):
    """
    Property 11: Deletion excludes review from aggregate.
    **Validates: Requirements 6.4**
    """
    assume(delete_index < len(ratings))
    client_addr, artist_addr = addresses
    client, engine = fresh_client()

    review_ids = []
    for i, rating in enumerate(ratings):
        cid = create_commission(engine, client_addr, artist_addr, status="Released")
        reviewer = "G" + f"{i:0>55}"[:55]
        rid = insert_review(engine, cid, reviewer, artist_addr, star_rating=rating)
        review_ids.append(rid)

    # Admin deletes one review
    admin_headers = auth_header(client_addr, ROLE_ADMIN)
    target_id = review_ids[delete_index]
    resp = client.delete(f"/reviews/{target_id}", headers=admin_headers)
    assert resp.status_code == 204

    # Remaining ratings
    remaining = ratings[:delete_index] + ratings[delete_index + 1:]

    resp2 = client.get(f"/reputation/{artist_addr}")
    assert resp2.status_code == 200
    data = resp2.json()

    assert data["review_count"] == len(remaining)

    if remaining:
        mean = sum(remaining) / len(remaining)
        expected = float(Decimal(str(mean)).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))
        assert data["aggregate_score"] == expected
    else:
        assert data["aggregate_score"] is None

    app.dependency_overrides.clear()

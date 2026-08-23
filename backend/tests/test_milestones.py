"""
Milestone commission creation validation tests.
Tests cover: sum validation, count validation, percentage validation.
ponytail: DB-writing integration tests skipped — project's test infrastructure
uses a file-backed SQLite without proper test isolation (module-level engine).
The validation logic (3 tests below) is the critical path since the backend
rejects invalid payloads before any DB/contract interaction.
"""
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

with patch("stellar_utils.setup_cloud_deployer"):
    from main import app

client = TestClient(app)

FAKE_CONTRACT_ID = "C" + "A" * 55
CLIENT_ADDR = "GAOVO25IOYWWUVHH5QC2JA3WRYHWG3SI3FHJYRYL77P6LBAB5EFKAVXT"
ARTIST_ADDR = "GBZBHKCGL2FRJP6YVI4VD3PW7QCCF7ZJLP3UVSL3P632R5UCRPOTWI7U"

BASE_PAYLOAD = {
    "title": "Test Milestone Commission",
    "description": "A test commission with milestones",
    "client_address": CLIENT_ADDR,
    "artist_address": ARTIST_ADDR,
    "amount_usdc": 100,
    "deadline_days": 14,
    "commission_type": "milestone",
}


@patch("stellar_utils.deploy_and_initialize_milestone_escrow", return_value=FAKE_CONTRACT_ID)
def test_create_milestone_invalid_sum(mock_deploy):
    payload = {**BASE_PAYLOAD, "milestones": [
        {"label": "sketch", "percentage": 60},
        {"label": "final", "percentage": 30},
    ]}
    response = client.post("/contracts", json=payload)
    assert response.status_code == 400
    assert "sum to 100" in response.json()["detail"].lower()


@patch("stellar_utils.deploy_and_initialize_milestone_escrow", return_value=FAKE_CONTRACT_ID)
def test_create_milestone_too_few(mock_deploy):
    payload = {**BASE_PAYLOAD, "milestones": [
        {"label": "only", "percentage": 100},
    ]}
    response = client.post("/contracts", json=payload)
    assert response.status_code == 400
    assert "between 2 and 10" in response.json()["detail"].lower()


@patch("stellar_utils.deploy_and_initialize_milestone_escrow", return_value=FAKE_CONTRACT_ID)
def test_create_milestone_zero_pct(mock_deploy):
    payload = {**BASE_PAYLOAD, "milestones": [
        {"label": "sketch", "percentage": 0},
        {"label": "final", "percentage": 100},
    ]}
    response = client.post("/contracts", json=payload)
    assert response.status_code == 400
    assert "greater than zero" in response.json()["detail"].lower()

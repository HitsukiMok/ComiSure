import pytest
from fastapi.testclient import TestClient
import stellar_utils

@pytest.fixture(autouse=True)
def mock_stellar_utils(monkeypatch):
    # Prevent startup check crash by mocking deployer address resolution
    monkeypatch.setattr(stellar_utils, "setup_cloud_deployer", lambda: None)
    monkeypatch.setattr(stellar_utils, "get_deployer_address", lambda version=None: "GA4GHSZWDI2SFG54BVNIVX4XOPVD5BGEVJD54CJQCISUBLDGBXA3JOH5")

def test_rate_limiting_auth_routes():
    from main import app
    client = TestClient(app)
    # Limit is 10 requests per minute on the challenge endpoint
    wallet = "GA4GHSZWDI2SFG54BVNIVX4XOPVD5BGEVJD54CJQCISUBLDGBXA3JOH5"
    
    responses = []
    for _ in range(12):
        res = client.get(f"/auth/challenge?wallet_address={wallet}")
        responses.append(res)
        
    status_codes = [r.status_code for r in responses]
    assert 429 in status_codes
    
    # Verify rate limit response details
    r429 = [r for r in responses if r.status_code == 429][0]
    data = r429.json()
    assert "detail" in data
    assert "Rate limit exceeded" in data["detail"]
    assert "Retry-After" in r429.headers

import json
import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_api_campaign_preview(client):
    res = client.post('/api/campaigns/preview', json={
        "template_subject": "Hello {{ name }}",
        "template_body": "Welcome to {{ company }}",
        "recipient_data": {"name": "Alice", "company": "Acme"}
    })
    data = res.get_json()
    assert res.status_code == 200
    assert data["success"] is True
    assert data["subject"] == "Hello Alice"
    assert data["body"] == "Welcome to Acme"

def test_api_campaign_send_and_job_status(client):
    payload = {
        "recipients": [{"id": 1, "_email": "test@example.com", "name": "Test"}],
        "smtp_config": {"smtp_host": "smtp.gmail.com", "username": "u@e.com", "password": "p"},
        "subject": "Test Subject",
        "body": "Test Body",
        "speed": "fast"
    }
    res = client.post('/api/campaigns/send', json=payload)
    data = res.get_json()
    assert res.status_code == 200
    assert data["success"] is True
    job_id = data["job_id"]

    # Retrieve status
    res_job = client.get(f'/api/jobs/{job_id}')
    job_info = res_job.get_json()
    assert res_job.status_code == 200
    assert job_info["success"] is True
    assert job_info["job"]["total"] == 1
    # Verify password is obfuscated in API response
    assert job_info["job"]["smtp_config"]["password"] == "******"

    # Test Pause
    client.post(f'/api/jobs/{job_id}/pause')
    res_paused = client.get(f'/api/jobs/{job_id}')
    assert res_paused.get_json()["job"]["status"] == "paused"

    # Test Resume
    client.post(f'/api/jobs/{job_id}/resume')
    res_resumed = client.get(f'/api/jobs/{job_id}')
    assert res_resumed.get_json()["job"]["status"] in ("sending", "completed")

    # Test Cancel
    client.post(f'/api/jobs/{job_id}/cancel')
    res_cancelled = client.get(f'/api/jobs/{job_id}')
    assert res_cancelled.get_json()["job"]["status"] == "cancelled"

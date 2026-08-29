from services.job_service import create_job, get_job, set_job_status

def test_job_lifecycle():
    recipients = [
        {"id": 1, "_email": "alice@example.com", "name": "Alice"},
        {"id": 2, "_email": "bob@example.com", "name": "Bob"}
    ]
    smtp_config = {"smtp_host": "smtp.gmail.com", "username": "u", "password": "p"}

    job_id, job_data = create_job(
        recipients=recipients,
        smtp_config=smtp_config,
        subject="Hello",
        body="World",
        speed="fast"
    )

    assert job_id is not None
    assert job_data["status"] == "queued"
    assert job_data["total"] == 2

    # Verify status transition
    updated = set_job_status(job_id, "sending")
    assert updated["status"] == "sending"

    # Verify pause
    set_job_status(job_id, "paused")
    assert get_job(job_id)["status"] == "paused"

    # Verify completion sanitizes password
    completed = set_job_status(job_id, "completed")
    assert completed["status"] == "completed"
    assert completed["smtp_config"]["password"] == "******"

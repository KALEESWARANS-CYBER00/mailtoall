from services.smtp_service import test_smtp_connection

def test_smtp_invalid_host():
    success, msg = test_smtp_connection(
        smtp_host="invalid.smtp.domain.nonexistent",
        smtp_port=465,
        username="user@example.com",
        password="secretpassword",
        security="SSL"
    )
    assert success is False
    assert "✕" in msg
    # Verify password is not leaked in error message
    assert "secretpassword" not in msg

def test_smtp_missing_credentials():
    success, msg = test_smtp_connection(
        smtp_host="",
        smtp_port=465,
        username="",
        password="",
        security="SSL"
    )
    assert success is False

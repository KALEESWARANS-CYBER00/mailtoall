import io
from services.csv_service import process_csv_file, parse_email_list, is_valid_email

def test_is_valid_email():
    assert is_valid_email("user@example.com") is True
    assert is_valid_email("alice.bob+tag@domain.co.uk") is True
    assert is_valid_email("invalid-email") is False
    assert is_valid_email("@domain.com") is False

def test_parse_email_list():
    assert parse_email_list("a@b.com, c@d.com") == ["a@b.com", "c@d.com"]
    assert parse_email_list("a@b.com; c@d.com") == ["a@b.com", "c@d.com"]
    assert parse_email_list("") == []

def test_process_csv_file_valid():
    csv_content = "name,email,company\nAlice,alice@example.com,Acme\nBob,bob@example.com,Google\n"
    file_obj = io.BytesIO(csv_content.encode("utf-8"))
    res = process_csv_file(file_obj)

    assert res["total_rows"] == 2
    assert res["valid_count"] == 2
    assert res["invalid_count"] == 0
    assert res["duplicate_count"] == 0
    assert "name" in res["headers"]
    assert "email" in res["headers"]
    assert len(res["recipients"]) == 2
    assert res["recipients"][0]["name"] == "Alice"
    assert res["recipients"][0]["_email"] == "alice@example.com"

def test_process_csv_file_duplicates_and_invalids():
    csv_content = "name,email\nAlice,alice@example.com\nBob,bademail\nAlice Dup,alice@example.com\n"
    file_obj = io.BytesIO(csv_content.encode("utf-8"))
    res = process_csv_file(file_obj)

    assert res["total_rows"] == 3
    assert res["valid_count"] == 1
    assert res["invalid_count"] == 1
    assert res["duplicate_count"] == 1

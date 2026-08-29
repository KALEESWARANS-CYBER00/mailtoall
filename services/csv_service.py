import csv
import io
import re

MAX_CSV_SIZE = 5 * 1024 * 1024  # 5 MB
EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def parse_email_list(value):
    if not value:
        return []
    value = str(value).replace(';', ',')
    return [e.strip() for e in value.split(',') if e.strip()]


def is_valid_email(email):
    return bool(EMAIL_REGEX.match(email))


def process_csv_file(file_storage):
    raw = file_storage.read()
    if len(raw) > MAX_CSV_SIZE:
        raise ValueError("CSV file is too large. Maximum size is 5 MB.")

    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            text = raw.decode("latin-1")
        except Exception:
            raise ValueError("CSV must be UTF-8 encoded.")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise ValueError("CSV file does not contain headers.")

    cleaned_headers = [h.strip() for h in reader.fieldnames if h and h.strip()]
    if not cleaned_headers:
        raise ValueError("CSV contains empty headers.")

    # Find email header column
    email_header = None
    for h in cleaned_headers:
        if h.lower() in ('email', 'emails', 'email_address', 'e-mail'):
            email_header = h
            break
            
    if not email_header:
        # Fallback search for any column containing 'email'
        for h in cleaned_headers:
            if 'email' in h.lower():
                email_header = h
                break

    if not email_header:
        raise ValueError("CSV must contain an 'email' or 'emails' header column.")

    valid_recipients = []
    invalid_recipients = []
    seen_emails = set()
    total_rows = 0
    duplicate_count = 0

    for idx, row in enumerate(reader, start=1):
        total_rows += 1
        clean_row = {}
        for k, v in row.items():
            if k and k.strip():
                clean_row[k.strip()] = str(v).strip() if v is not None else ""

        raw_email_val = clean_row.get(email_header, "")
        extracted_emails = parse_email_list(raw_email_val)

        if not extracted_emails:
            invalid_recipients.append({
                "row_number": idx,
                "email": raw_email_val,
                "reason": "Missing email address",
                "data": clean_row
            })
            continue

        for email in extracted_emails:
            norm_email = email.lower()
            if not is_valid_email(norm_email):
                invalid_recipients.append({
                    "row_number": idx,
                    "email": email,
                    "reason": "Invalid email format",
                    "data": clean_row
                })
            elif norm_email in seen_emails:
                duplicate_count += 1
            else:
                seen_emails.add(norm_email)
                recipient_item = dict(clean_row)
                recipient_item['_email'] = norm_email
                recipient_item['id'] = len(valid_recipients) + 1
                valid_recipients.append(recipient_item)

    # Cleaned header list excluding private keys
    variables = [h for h in cleaned_headers if not h.startswith('_')]
    if 'email' not in [v.lower() for v in variables]:
        variables.insert(0, email_header)

    return {
        "total_rows": total_rows,
        "valid_count": len(valid_recipients),
        "invalid_count": len(invalid_recipients),
        "duplicate_count": duplicate_count,
        "headers": variables,
        "recipients": valid_recipients,
        "invalid_recipients": invalid_recipients
    }

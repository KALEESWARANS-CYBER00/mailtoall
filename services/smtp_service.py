import ssl
import smtplib
from email.message import EmailMessage

def create_smtp_connection(smtp_host, smtp_port, username, password, security='SSL', timeout=10):
    smtp_host = (smtp_host or '').strip()
    username = (username or '').strip()
    try:
        smtp_port = int(smtp_port)
    except (ValueError, TypeError):
        smtp_port = 465 if security.upper() == 'SSL' else 587

    if not smtp_host:
        raise ValueError("SMTP host is required.")
    if not username:
        raise ValueError("SMTP username is required.")
    if not password:
        raise ValueError("SMTP password is required.")

    context = ssl.create_default_context()
    sec_upper = (security or 'SSL').upper()

    if sec_upper == 'SSL' or smtp_port == 465:
        server = smtplib.SMTP_SSL(smtp_host, smtp_port, context=context, timeout=timeout)
    else:
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=timeout)
        server.ehlo()
        if sec_upper == 'STARTTLS' or smtp_port == 587:
            server.starttls(context=context)
            server.ehlo()

    server.login(username, password)
    return server


def test_smtp_connection(smtp_host, smtp_port, username, password, security='SSL'):
    try:
        server = create_smtp_connection(smtp_host, smtp_port, username, password, security, timeout=10)
        server.quit()
        return True, "✓ SMTP connection and authentication successful."
    except smtplib.SMTPAuthenticationError:
        return False, "✕ SMTP authentication failed. Please check your username and password or app password."
    except smtplib.SMTPConnectError:
        return False, "✕ Failed to connect to SMTP server. Please verify the host and port."
    except Exception as exc:
        err_msg = str(exc)
        if "Authentication failed" in err_msg or "Username and Password not accepted" in err_msg:
            return False, "✕ SMTP authentication failed. Please verify credentials."
        return False, f"✕ Connection failed: {err_msg[:120]}"


def send_email_message(smtp_config, to_email, subject, body, is_html=False):
    smtp_host = smtp_config.get('smtp_host', '').strip()
    smtp_port = smtp_config.get('smtp_port', 465)
    username = smtp_config.get('username', '').strip()
    password = smtp_config.get('password', '')
    security = smtp_config.get('security', 'SSL')
    # Support both 'sender_name'/'sender_email' (React SaaS frontend) and legacy 'from_name'/'from_email'
    from_name = (smtp_config.get('sender_name') or smtp_config.get('from_name') or '').strip()
    from_email = (smtp_config.get('sender_email') or smtp_config.get('from_email') or '').strip() or username
    reply_to = smtp_config.get('reply_to', '').strip()

    message = EmailMessage()
    
    if from_name:
        message['From'] = f"{from_name} <{from_email}>"
    else:
        message['From'] = from_email

    message['To'] = to_email.strip()
    message['Subject'] = subject or '(No Subject)'

    if reply_to:
        message['Reply-To'] = reply_to

    if is_html:
        message.set_content(body, subtype='html')
    else:
        message.set_content(body)

    server = create_smtp_connection(smtp_host, smtp_port, username, password, security, timeout=15)
    try:
        server.send_message(message)
    finally:
        server.quit()

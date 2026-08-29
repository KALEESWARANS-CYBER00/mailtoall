import time
import threading
from services.job_service import get_job, update_job, set_job_status
from services.smtp_service import create_smtp_connection
from services.template_service import render_email_content
from email.message import EmailMessage


def _build_message(smtp_config: dict, to_email: str, subject: str, body: str, is_html: bool) -> EmailMessage:
    """Build an EmailMessage object without sending it."""
    from_name = (smtp_config.get('sender_name') or smtp_config.get('from_name') or '').strip()
    username = smtp_config.get('username', '').strip()
    from_email = (smtp_config.get('sender_email') or smtp_config.get('from_email') or '').strip() or username
    reply_to = smtp_config.get('reply_to', '').strip()

    msg = EmailMessage()
    msg['From'] = f"{from_name} <{from_email}>" if from_name else from_email
    msg['To'] = to_email.strip()
    msg['Subject'] = subject or '(No Subject)'
    if reply_to:
        msg['Reply-To'] = reply_to
    if is_html:
        msg.set_content(body, subtype='html')
    else:
        msg.set_content(body)
    return msg


def _open_connection(smtp_config: dict, timeout: int = 5):
    """Open an SMTP connection. Low timeout of 5s prevents hangs."""
    return create_smtp_connection(
        smtp_host=smtp_config.get('smtp_host', ''),
        smtp_port=smtp_config.get('smtp_port', 465),
        username=smtp_config.get('username', ''),
        password=smtp_config.get('password', ''),
        security=smtp_config.get('security', 'SSL'),
        timeout=timeout
    )


def _safe_quit(server):
    if server is not None:
        try:
            server.quit()
        except Exception:
            pass


def process_campaign_job(job_id: str):
    job = get_job(job_id)
    if not job:
        return

    set_job_status(job_id, "sending")

    smtp_config = job.get("smtp_config", {})
    subject_tmpl = job.get("subject", "")
    body_tmpl = job.get("body", "")
    is_html = job.get("is_html", False)
    delay_seconds = job.get("delay_seconds", 2.0)
    recipients = job.get("recipients", [])

    # Keep a persistent connection reference
    server = None

    def record_single_result(idx: int, email: str, success: bool, message: str, timestamp: str, name: str):
        """Immediately update progress and results in the job store for instant UI response."""
        def apply_single(j):
            j["processed"] += 1
            if success:
                j["successful"] += 1
                status_str = "SENT"
            else:
                j["failed"] += 1
                status_str = "FAILED"

            j["progress"] = round((j["processed"] / j["total"]) * 100) if j["total"] > 0 else 100

            if idx < len(j["recipients"]):
                j["recipients"][idx]["status"] = status_str
                j["recipients"][idx]["message"] = message
                j["recipients"][idx]["sent_at"] = timestamp

            j["results"].append({
                "email": email,
                "status": status_str,
                "message": message,
                "sent_at": timestamp,
                "name": name,
            })
            return j

        update_job(job_id, apply_single)

    # ── Main send loop ───────────────────────────────────────────────────────
    for idx, item in enumerate(recipients):
        # ── Pause / Cancel check every email ──────────────────────────────
        while True:
            current_job = get_job(job_id)
            if not current_job:
                _safe_quit(server)
                return
            status = current_job.get("status")
            if status == "cancelled":
                _safe_quit(server)
                return
            elif status == "paused":
                time.sleep(0.5)
                continue
            elif status in ("completed", "failed"):
                _safe_quit(server)
                return
            break

        if item.get("status") != "pending":
            continue

        email = item.get("email", "")
        recipient_data = item.get("data", {})
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

        # ── Template render ────────────────────────────────────────────────
        try:
            rendered_subject, rendered_body = render_email_content(subject_tmpl, body_tmpl, recipient_data)
        except Exception:
            rendered_subject, rendered_body = subject_tmpl, body_tmpl

        # ── Send with connection reuse + robust reconnect on failure ──────
        sent_success = False
        error_msg = ""

        for attempt in range(2):
            try:
                # If connection is not active/opened, open it now
                if server is None:
                    server = _open_connection(smtp_config)

                msg = _build_message(smtp_config, email, rendered_subject, rendered_body, is_html)
                server.send_message(msg)
                sent_success = True
                error_msg = "✓ Sent successfully"
                break
            except Exception as send_err:
                err_str = str(send_err)
                # Close the dead socket and reset reference to None
                if server is not None:
                    _safe_quit(server)
                    server = None

                if attempt == 0:
                    # Retry once — next loop iteration will connect fresh
                    continue
                else:
                    error_msg = f"✕ Delivery error: {err_str[:120]}"

        # ── Update results immediately for zero UI delay ──────────────────
        recipient_name = recipient_data.get("name") or recipient_data.get("first_name", "")
        record_single_result(idx, email, sent_success, error_msg, timestamp, recipient_name)

        # ── Rate-limit delay (only between emails, not after last one) ─────
        if idx < len(recipients) - 1 and delay_seconds > 0:
            time.sleep(delay_seconds)

    # ── Cleanup & Finalize ────────────────────────────────────────────────
    _safe_quit(server)
    set_job_status(job_id, "completed")

import threading
from services.job_service import create_job
from workers.email_worker import process_campaign_job

def start_campaign(recipients, smtp_config, subject, body, is_html=False, speed='normal', custom_rate=30):
    if not recipients:
        raise ValueError("No valid recipients provided.")
    if not smtp_config or not smtp_config.get('smtp_host') or not smtp_config.get('username') or not smtp_config.get('password'):
        raise ValueError("SMTP configuration is missing or incomplete.")
    if not subject or not subject.strip():
        raise ValueError("Email subject is required.")
    if not body or not body.strip():
        raise ValueError("Email body is required.")

    job_id, job_data = create_job(
        recipients=recipients,
        smtp_config=smtp_config,
        subject=subject.strip(),
        body=body.strip(),
        is_html=is_html,
        speed=speed,
        custom_rate=custom_rate
    )

    # Try Celery task dispatch first if configured, or run background worker thread
    try:
        from worker import send_campaign_celery_task
        send_campaign_celery_task.delay(job_id)
    except Exception:
        # Background daemon thread fallback
        thread = threading.Thread(target=process_campaign_job, args=(job_id,), daemon=True)
        thread.start()

    return job_id, job_data

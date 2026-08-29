import json
import time
import uuid
import threading
from config import Config

# In-memory job store fallback (thread-safe)
_memory_jobs = {}
_jobs_lock = threading.Lock()

def get_redis_client():
    if not Config.REDIS_URL or Config.REDIS_URL.startswith('memory://'):
        return None
    try:
        import redis
        client = redis.Redis.from_url(Config.REDIS_URL, decode_responses=True)
        client.ping()
        return client
    except Exception:
        return None


def create_job(recipients, smtp_config, subject, body, is_html=False, speed='normal', custom_rate=30):
    job_id = str(uuid.uuid4())

    # Calculate sending rate (delay in seconds between emails)
    try:
        if speed == 'slow' or speed == 'stealth':
            rate_per_min = 10
        elif speed == 'normal':
            rate_per_min = 30
        elif speed == 'fast':
            rate_per_min = 60
        elif speed == 'custom':
            rate_per_min = max(1, int(custom_rate))
        else:
            rate_per_min = 30
    except (ValueError, TypeError):
        rate_per_min = 30

    delay_seconds = 60.0 / rate_per_min

    # Recipient initial list
    recipient_items = []
    for r in recipients:
        # Support email key from React frontend ('email') and legacy keys
        email = (r.get('email') or r.get('_email') or r.get('emails') or '').strip()
        recipient_items.append({
            "id": r.get('id'),
            "email": email,
            "data": r,       # full recipient row for template variable injection
            "status": "pending",
            "message": "",
            "sent_at": None
        })

    job_data = {
        "id": job_id,
        "status": "queued",
        "total": len(recipient_items),
        "processed": 0,
        "successful": 0,
        "failed": 0,
        "progress": 0,
        "speed": speed,
        "rate_per_min": rate_per_min,
        "delay_seconds": delay_seconds,
        "created_at": time.time(),
        "updated_at": time.time(),
        "smtp_config": smtp_config,
        "subject": subject,
        "body": body,
        "is_html": is_html,
        "recipients": recipient_items,
        "results": []
    }

    r_client = get_redis_client()
    if r_client:
        key = f"job:{job_id}"
        r_client.setex(key, Config.JOB_TTL_SECONDS, json.dumps(job_data))
    else:
        with _jobs_lock:
            _memory_jobs[job_id] = job_data

    return job_id, job_data


def get_job(job_id):
    r_client = get_redis_client()
    if r_client:
        key = f"job:{job_id}"
        data_str = r_client.get(key)
        if data_str:
            return json.loads(data_str)
        return None

    with _jobs_lock:
        return _memory_jobs.get(job_id)


def update_job(job_id, update_fn):
    r_client = get_redis_client()
    if r_client:
        key = f"job:{job_id}"
        data_str = r_client.get(key)
        if not data_str:
            return None
        job_data = json.loads(data_str)
        job_data = update_fn(job_data)
        job_data["updated_at"] = time.time()
        r_client.setex(key, Config.JOB_TTL_SECONDS, json.dumps(job_data))
        return job_data

    with _jobs_lock:
        job_data = _memory_jobs.get(job_id)
        if not job_data:
            return None
        job_data = update_fn(job_data)
        job_data["updated_at"] = time.time()
        _memory_jobs[job_id] = job_data
        return job_data


def set_job_status(job_id, status):
    def update(job):
        job["status"] = status
        # If job is completed/cancelled/failed, wipe sensitive SMTP password from temporary store
        if status in ("completed", "cancelled", "failed"):
            if "smtp_config" in job and "password" in job["smtp_config"]:
                job["smtp_config"]["password"] = "******"
        return job
    return update_job(job_id, update)


def delete_job(job_id):
    r_client = get_redis_client()
    if r_client:
        r_client.delete(f"job:{job_id}")
    with _jobs_lock:
        _memory_jobs.pop(job_id, None)

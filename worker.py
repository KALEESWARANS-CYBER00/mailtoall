import os
from celery import Celery
from workers.email_worker import process_campaign_job

redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

celery = Celery(
    'mailflow_worker',
    broker=redis_url,
    backend=redis_url
)

celery.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

@celery.task(name='worker.send_campaign_celery_task')
def send_campaign_celery_task(job_id):
    process_campaign_job(job_id)

if __name__ == '__main__':
    celery.start()

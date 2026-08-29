import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'mailflow-stateless-secret-key-2026')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 5 * 1024 * 1024))  # 5MB max upload
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    JOB_TTL_SECONDS = int(os.environ.get('JOB_TTL_SECONDS', 86400))  # 24 hours TTL for temporary job data
    CELERY_BROKER_URL = REDIS_URL
    CELERY_RESULT_BACKEND = REDIS_URL
    TESTING = False
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')

class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    REDIS_URL = 'memory://'
    CELERY_BROKER_URL = 'memory://'
    CELERY_RESULT_BACKEND = 'cache+memory://'

"""
Django settings for StockTake project.
This file contains ALL configuration for your Django application.
Think of it as the master control panel for your backend.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials
import dj_database_url  # For parsing DATABASE_URL environment variable

# Load environment variables from .env file
# This keeps sensitive data like passwords out of your code
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'
# This gives us the absolute path to our project folder
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
# Never hardcode secrets - always use environment variables
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-your-secret-key-here')

# SECURITY WARNING: don't run with debug turned on in production!
# DEBUG=True shows error details - only use during development
DEBUG = os.getenv('DEBUG', 'False').strip().lower() in ('1', 'true', 'yes', 'on')

# Helper function to parse comma-separated environment variables
# Used for ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS, and CSRF_TRUSTED_ORIGINS
def comma_separated_env(var_name, default=''):
    """Return a list of values from a comma-separated environment variable."""
    value = os.getenv(var_name, default)
    if not value:
        return []
    return [item.strip() for item in value.split(',') if item.strip()]

# Allowed hosts configuration
# Render provides the external hostname automatically via RENDER_EXTERNAL_HOSTNAME
# Local development hosts (localhost, 127.0.0.1) are always allowed
# Additional hosts can be added via DJANGO_ALLOWED_HOSTS environment variable
ALLOWED_HOSTS = list({
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    *comma_separated_env('DJANGO_ALLOWED_HOSTS'),
    os.getenv('RENDER_EXTERNAL_HOSTNAME', ''),
} - {''})


# Application definition
# These are all the Django apps/modules your project uses
INSTALLED_APPS = [
    'django.contrib.admin',          # Admin interface
    'django.contrib.auth',           # User authentication
    'django.contrib.contenttypes',   # Content types framework
    'django.contrib.sessions',       # Session management
    'django.contrib.messages',       # Message framework
    'django.contrib.staticfiles',    # Static file handling
    
    # Third-party apps
    'rest_framework',                # REST API framework
    'corsheaders',                   # Cross-Origin Resource Sharing
    'drf_yasg',                      # API documentation (Swagger/ReDoc)
    'django_filters',                # Filtering for API endpoints
    'whitenoise',                    # Static file serving in production
    
    # Your custom apps
    'api',                           # Main API application for StockTake
]


# Middleware - these are functions that run on every request
# Order matters! Middleware runs from top to bottom
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first for CORS
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Serves static files in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# URL configuration - the main URL file
ROOT_URLCONF = 'StockTake.urls'

# Template settings (we're using React for frontend, so minimal templates here)
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI application - used for deployment (Gunicorn, uWSGI, etc.)
WSGI_APPLICATION = 'StockTake.wsgi.application'


# Database configuration
# We support both SQLite (development) and PostgreSQL (production)
# DATABASE_URL environment variable overrides everything
if os.getenv('DATABASE_URL'):
    # Production database (PostgreSQL)
    DATABASES = {
        'default': dj_database_url.config(
            default=os.getenv('DATABASE_URL'),
            conn_max_age=600,
            ssl_require=not DEBUG  # Require SSL in production
        )
    }
else:
    # Development database (SQLite - simple, file-based)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation - these rules keep passwords secure
# Django's built-in validators ensure users choose strong passwords
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization - language and timezone settings
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images) configuration
# WhiteNoise is used for serving static files in production
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'  # Where collectstatic puts files
STATICFILES_DIRS = [
    BASE_DIR / 'static',  # Additional directories for static files
]

# WhiteNoise storage backend - compresses and caches static files
STORAGES = {
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}


# Default primary key field type for Django models
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# CORS (Cross-Origin Resource Sharing) settings
# Controls which domains can access your API
# In production, add your frontend domains to CORS_ALLOWED_ORIGINS
CORS_ALLOWED_ORIGINS = comma_separated_env(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://localhost:3000,http://localhost:80,http://localhost:8000'
)

# In development, allow all origins (simplifies testing)
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOW_CREDENTIALS = True  # Allow cookies and authorization headers


# CSRF (Cross-Site Request Forgery) trusted origins
# Add domains that can make POST requests to your API
CSRF_TRUSTED_ORIGINS = comma_separated_env('CSRF_TRUSTED_ORIGINS')


# Django REST Framework settings
# Authentication, permissions, filtering, and pagination
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'api.authentication.FirebaseAuthentication',  # Custom Firebase JWT auth
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # Require authentication by default
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',  # Filter querysets
        'rest_framework.filters.SearchFilter',                # Search functionality
        'rest_framework.filters.OrderingFilter',              # Sort results
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,  # Number of items per page
}


# Firebase Admin SDK initialization
# Connects your backend to Firebase for authentication
try:
    firebase_credentials = os.getenv('FIREBASE_CREDENTIALS')
    if firebase_credentials:
        # If credentials are provided as JSON string (e.g., on Render)
        import json
        # Clean up the credentials string - remove any extra whitespace or newlines
        cred_str = firebase_credentials.strip()
        # Fix common PEM format issues
        if '-----BEGIN PRIVATE KEY-----' in cred_str:
            # Ensure the private key has proper line breaks
            cred_str = cred_str.replace('\\n', '\n')
        cred_dict = json.loads(cred_str)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        print("Firebase initialized successfully from environment variable!")
    else:
        # Try to load from file (development)
        cred_path = os.path.join(BASE_DIR, 'firebase-credentials.json')
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print(f"Firebase initialized successfully from file: {cred_path}")
        else:
            print("WARNING: Firebase credentials not found. Auth will fail.")
            cred = None
except Exception as e:
    print(f"Firebase initialization warning: {e}")
    print("Authentication will still work, but Firebase features may be limited.")

# Security settings for production
# These are automatically enabled when DEBUG=False
if not DEBUG:
    # Tell Django to trust the X-Forwarded-Proto header (used by Render)
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    
    # Enforce HTTPS for cookies
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    # Redirect HTTP to HTTPS
    SECURE_SSL_REDIRECT = True
    
    # HSTS (HTTP Strict Transport Security) - forces browsers to use HTTPS
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True


# Logging configuration - helps debug issues in production
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
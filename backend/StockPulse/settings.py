"""
Django settings for StockPulse project.
This file contains ALL configuration for your Django application.
Think of it as the master control panel for your backend.
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
import firebase_admin 
from firebase_admin import credentials

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
DEBUG = os.getenv('DEBUG', 'True').strip().lower() in ('1', 'true', 'yes', 'on')

def comma_separated_env(name, default=''):
    """Return a cleaned list from a comma-separated environment variable."""
    return [item.strip() for item in os.getenv(name, default).split(',') if item.strip()]


# Render provides this host automatically. Local hosts keep development simple,
# while DJANGO_ALLOWED_HOSTS supports a custom domain when one is added.
ALLOWED_HOSTS = list({
    'localhost', '127.0.0.1',
    *comma_separated_env('DJANGO_ALLOWED_HOSTS'),
    os.getenv('RENDER_EXTERNAL_HOSTNAME', ''),
} - {''})

# Application definition
# These are all the Django apps/modules your project uses
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',          # For building REST APIs
    'corsheaders',            # Handles Cross-Origin Resource Sharing
    'drf_yasg',              # API documentation generator
    'django_filters',        # For filtering API results
    
    # Your custom apps
    'api',                   # Our main API app
]

# Middleware - these are functions that run on every request
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first for CORS
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# URL configuration - the main URL file
ROOT_URLCONF = 'StockPulse.urls'  # Fixed: Capitalized 'StockPulse'

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

# WSGI application - used for deployment
WSGI_APPLICATION = 'StockPulse.wsgi.application'  # Fixed: Capitalized 'StockPulse'

# Database configuration
# We support both SQLite (development) and PostgreSQL (production)
# DATABASE_URL environment variable overrides everything

if os.getenv('DATABASE_URL'):
    # Production database (PostgreSQL)
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(
            default=os.getenv('DATABASE_URL'),
            conn_max_age=600
        )
    }
else:
    # Development database (SQLite)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation - these rules keep passwords secure
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

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS is intentionally explicit in production. Add the Vercel deployment URL
# as CORS_ALLOWED_ORIGINS in Render's Environment settings.
CORS_ALLOWED_ORIGINS = comma_separated_env(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://localhost:3000,http://localhost:80',
)
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = comma_separated_env('CSRF_TRUSTED_ORIGINS')

# Django REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'api.authentication.FirebaseAuthentication',  # Custom Firebase auth
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # Require authentication by default
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,  # Number of items per page
}

# Static files settings
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]
STORAGES = {
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True



# FIREBASE CONFIGURATION 
FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID', 'stockpulse-99c9a')
FIREBASE_STORAGE_BUCKET = os.getenv('FIREBASE_STORAGE_BUCKET', 'stockpulse-99c9a.appspot.com')
FIREBASE_AUTH_DOMAIN = os.getenv('FIREBASE_AUTH_DOMAIN', 'stockpulse-99c9a.firebaseapp.com')

# Paths for Firebase credentials
FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json')
FIREBASE_CREDENTIALS_JSON = os.getenv('FIREBASE_CREDENTIALS')  # Optional: JSON string from env

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK with proper error handling"""
    try:
        # Check if already initialized
        if firebase_admin._apps:
            print("✅ Firebase already initialized")
            return True
            
        cred = None
        
        # Method 1: Load from environment variable (JSON string)
        if FIREBASE_CREDENTIALS_JSON:
            try:
                cred_dict = json.loads(FIREBASE_CREDENTIALS_JSON)
                cred = credentials.Certificate(cred_dict)
                print("✅ Firebase initialized from environment variable")
            except json.JSONDecodeError as e:
                print(f"❌ Error parsing FIREBASE_CREDENTIALS JSON: {e}")
        
        # Method 2: Load from file (development)
        if not cred:
            cred_path = os.path.join(BASE_DIR, FIREBASE_CREDENTIALS_PATH)
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                print(f"✅ Firebase initialized from file: {cred_path}")
            else:
                print(f"⚠️ Firebase credentials file not found at: {cred_path}")
                print("   Please download serviceAccountKey.json from Firebase Console")
                print("   and place it in the project root directory.")
                return False
        
        # Initialize Firebase with project configuration
        if cred:
            firebase_admin.initialize_app(cred, {
                'projectId': FIREBASE_PROJECT_ID,
                'storageBucket': FIREBASE_STORAGE_BUCKET,
            })
            print(f"✅ Firebase Admin SDK initialized successfully!")
            print(f"   Project ID: {FIREBASE_PROJECT_ID}")
            print(f"   Storage Bucket: {FIREBASE_STORAGE_BUCKET}")
            return True
            
    except Exception as e:
        print(f"❌ Firebase initialization error: {e}")
        return False

# Initialize Firebase
FIREBASE_INITIALIZED = initialize_firebase()

# Optional: Set up Firebase Auth middleware or utilities
if FIREBASE_INITIALIZED:
    # Import Firebase Auth for use in views
    from firebase_admin import auth
    print("✅ Firebase Auth module is ready")
else:
    print("⚠️ Firebase not initialized. Authentication will not work.")

# Firestore settings (if using Firestore)
# FIRESTORE_DATABASE_ID = os.getenv('FIRESTORE_DATABASE_ID', '(default)')

# Firebase Cloud Messaging (if using push notifications)
# FCM_CREDENTIALS_PATH = os.getenv('FCM_CREDENTIALS_PATH', FIREBASE_CREDENTIALS_PATH)

# Firebase Storage settings
# FIREBASE_STORAGE_BUCKET = os.getenv('FIREBASE_STORAGE_BUCKET', 'stockpulse-99c9a.appspot.com')

# Logging configuration - helps debug issues
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'django.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'api': {  # Your app's logger
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'firebase_admin': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

# Create logs directory if it doesn't exist
LOG_DIR = os.path.join(BASE_DIR, 'logs')
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

print("\n" + "="*50)
print("🚀 StockPulse Django Application")
print(f"   Debug Mode: {DEBUG}")
print(f"   Firebase Status: {'✅ Initialized' if FIREBASE_INITIALIZED else '❌ Not Initialized'}")
print(f"   Project ID: {FIREBASE_PROJECT_ID}")
print("="*50 + "\n")

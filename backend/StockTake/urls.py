"""
Main URL configuration.
This includes all URLs for the project.
"""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# API documentation setup using drf-yasg
# Generates Swagger/OpenAPI documentation automatically
schema_view = get_schema_view(
    openapi.Info(
        title="StockTake API",
        default_version='v1',
        description="Inventory Management System API",
        terms_of_service="",
        contact=openapi.Contact(email="jane@example.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)


# Health check endpoint - used by Render to verify the service is running
def health_check(request):
    """Unauthenticated endpoint used by Render to verify service health."""
    return JsonResponse({'status': 'ok'})


def root(request):
    """Return basic service information for the backend root URL."""
    return JsonResponse({
        'name': 'StockTake API',
        'status': 'ok',
        'health': '/health/',
        'api': '/api/',
        'docs': '/swagger/',
    })


# URL patterns - maps URLs to views
urlpatterns = [
    path('', root, name='root'),

    # Health check - used by Render for monitoring
    path('health/', health_check, name='health-check'),
    
    # Django admin panel - for database management
    path('admin/', admin.site.urls),
    
    # API endpoints - all API URLs start with /api/
    # The router in api/urls.py handles all the REST endpoints
    path('api/', include('api.urls')),
    
    # API Documentation
    # Swagger UI - interactive API docs
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    
    # ReDoc - alternative API documentation
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
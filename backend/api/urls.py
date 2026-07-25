"""
API URL routing.
This maps URLs to views.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for ViewSets
# Routers automatically generate URL patterns for CRUD operations
router = DefaultRouter()
router.register(r'products', views.ProductViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'suppliers', views.SupplierViewSet)
router.register(r'warehouses', views.WarehouseViewSet)
router.register(r'transactions', views.StockTransactionViewSet)
router.register(r'sales', views.SaleViewSet)
router.register(r'purchase-orders', views.PurchaseOrderViewSet)

# The API URLs are automatically determined by the router
urlpatterns = [
    path('', include(router.urls)),
]
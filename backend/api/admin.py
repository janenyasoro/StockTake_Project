from django.contrib import admin
from .models import Category, Product, PurchaseOrder, Sale, StockTransaction, Supplier, UserProfile, Warehouse

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'department', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('user__username', 'user__email')


admin.site.register([Category, Product, Supplier, Warehouse, StockTransaction, Sale, PurchaseOrder])

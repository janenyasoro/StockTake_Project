"""
Serializers convert complex Django models into JSON (and vice versa).
They're like translators between your database and your API.
Think of them as blueprints for what data the API sends/receives.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Category, Supplier, Warehouse, Product, 
    StockTransaction, Sale, SaleItem, 
    PurchaseOrder, PurchaseOrderItem
)

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Categories.
    Includes all fields and provides validation.
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        # These fields are read-only (set by Django automatically)
        read_only_fields = ['created_at', 'updated_at']

class SupplierSerializer(serializers.ModelSerializer):
    """
    Serializer for Suppliers with validation.
    """
    class Meta:
        model = Supplier
        fields = '__all__'  # Include all fields
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_rating(self, value):
        """Ensure rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

class WarehouseSerializer(serializers.ModelSerializer):
    """
    Serializer for Warehouses.
    """
    class Meta:
        model = Warehouse
        fields = '__all__'
        read_only_fields = ['created_at']

class ProductSerializer(serializers.ModelSerializer):
    """
    Main Product serializer with nested relationships.
    """
    # Use nested serializers to show related data
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    stock_value = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'description',
            'price', 'cost',
            'stock_quantity', 'reorder_level', 'reorder_quantity',
            'category', 'category_name',
            'supplier', 'supplier_name',
            'warehouse', 'warehouse_name',
            'is_active', 'is_featured',
            'is_low_stock', 'stock_value',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ProductMinimalSerializer(serializers.ModelSerializer):
    """
    Minimal product serializer for dropdowns and lists.
    Less data = faster responses.
    """
    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'stock_quantity', 'price']

class StockTransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for stock transaction history.
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    
    class Meta:
        model = StockTransaction
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'quantity', 'old_quantity', 'new_quantity',
            'transaction_type', 'notes',
            'user', 'created_at'
        ]
        read_only_fields = ['created_at']

class SaleItemSerializer(serializers.ModelSerializer):
    """
    Serializer for items within a sale.
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    
    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'product_sku', 
                  'quantity', 'price_at_time', 'subtotal']

class SaleSerializer(serializers.ModelSerializer):
    """
    Serializer for sales with nested items.
    """
    items = SaleItemSerializer(many=True, source='saleitem_set', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'invoice_number',
            'customer_name', 'customer_email', 'customer_phone',
            'total_amount', 'tax_amount', 'discount_amount',
            'status', 'payment_method',
            'user', 'user_name',
            'items',
            'sale_date', 'updated_at'
        ]
        read_only_fields = ['sale_date', 'updated_at']

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for items within a purchase order.
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    
    class Meta:
        model = PurchaseOrderItem
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'quantity_ordered', 'quantity_received',
            'unit_price', 'subtotal'
        ]

class PurchaseOrderSerializer(serializers.ModelSerializer):
    """
    Serializer for purchase orders with items.
    """
    items = PurchaseOrderItemSerializer(many=True, source='purchaseorderitem_set', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'order_number',
            'supplier', 'supplier_name',
            'order_date', 'expected_delivery_date', 'actual_delivery_date',
            'subtotal', 'tax', 'total',
            'status',
            'created_by', 'created_by_name',
            'items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['order_date', 'created_at', 'updated_at']
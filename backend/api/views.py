"""
API Views - these handle HTTP requests and return responses.
Each view corresponds to a URL endpoint.
Think of views as the controllers that handle the business logic.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from django.db import models
from django.utils import timezone
from datetime import timedelta
import logging
from django.contrib.auth.models import User

from .models import (
    Product, Category, Supplier, Warehouse,
    StockTransaction, Sale, SaleItem,
    PurchaseOrder, PurchaseOrderItem
)
from .serializers import (
    ProductSerializer, CategorySerializer, SupplierSerializer,
    WarehouseSerializer, StockTransactionSerializer,
    SaleSerializer, PurchaseOrderSerializer, UserSerializer
)
from .permissions import IsAdminUser, IsManagerUser, IsStaffUser

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_role(request):
    """Return the signed-in user's effective StockTake role.

    The existing UserProfile role is the source of truth. A sensible fallback
    is used for legacy users whose profile has not yet been created.
    """
    profile = getattr(request.user, 'profile', None)
    profile_role = getattr(profile, 'role', 'staff')
    if request.user.is_superuser or profile_role == 'admin':
        role, label = 'ADMIN', 'Admin'
    elif profile_role == 'manager':
        role, label = 'INVENTORY_MANAGER', 'Inventory Manager'
    else:
        role, label = 'SALES_AGENT', 'Sales Agent'

    return Response({'role': role, 'label': label, 'email': request.user.email})

class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product CRUD operations.
    Provides: list, create, retrieve, update, delete
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'supplier', 'warehouse', 'is_active', 'is_featured']
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'price', 'stock_quantity', 'created_at']
    
    def get_permissions(self):
        """
        Different permissions for different actions.
        Staff can view, only admin can modify.
        """
        if self.action in ['create', 'update', 'partial_update']:
            return [IsManagerUser()]
        if self.action == 'destroy':
            return [IsAdminUser()]
        if self.action == 'update_stock':
            return [IsManagerUser()]
        return [IsAuthenticated()]
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        """
        Custom action to update product stock.
        POST /api/products/{id}/update_stock/
        """
        product = self.get_object()
        quantity = request.data.get('quantity')
        transaction_type = request.data.get('transaction_type', 'adjustment')
        notes = request.data.get('notes', '')
        
        if not quantity:
            return Response(
                {'error': 'Quantity is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            quantity = int(quantity)
            new_stock = product.update_stock(quantity, transaction_type, notes)
            latest_transaction = product.transactions.first()
            if latest_transaction:
                latest_transaction.user = request.user
                latest_transaction.save(update_fields=['user'])
            return Response({
                'message': 'Stock updated successfully',
                'new_stock': new_stock,
                'product': ProductSerializer(product).data
            })
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """
        Get all products with low stock.
        GET /api/products/low_stock/
        """
        low_stock_products = Product.objects.filter(
            stock_quantity__lte=models.F('reorder_level'),
            is_active=True
        )
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get product statistics.
        GET /api/products/statistics/
        """
        total_products = Product.objects.filter(is_active=True).count()
        low_stock_count = Product.objects.filter(
            stock_quantity__lte=models.F('reorder_level'),
            is_active=True
        ).count()
        total_value = Product.objects.aggregate(
            total=Sum(models.F('stock_quantity') * models.F('cost'))
        )['total'] or 0
        
        return Response({
            'total_products': total_products,
            'low_stock_count': low_stock_count,
            'total_inventory_value': total_value,
            'categories': Category.objects.count(),
            'suppliers': Supplier.objects.filter(is_active=True).count()
        })

class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

class SupplierViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Suppliers.
    """
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'contact_person', 'email']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

class WarehouseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Warehouses.
    """
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'location']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

class StockTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing stock transactions (read-only).
    """
    queryset = StockTransaction.objects.all()
    serializer_class = StockTransactionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'transaction_type', 'user']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter by product if provided"""
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

class SaleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Sales.
    """
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_method', 'user']
    search_fields = ['invoice_number', 'customer_name', 'customer_email']
    ordering_fields = ['sale_date', 'total_amount']
    ordering = ['-sale_date']
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsStaffUser()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsManagerUser()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Set the user when creating a sale"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def sales_summary(self, request):
        """
        Get sales summary for dashboard.
        GET /api/sales/sales_summary/
        """
        # Today's sales
        today = timezone.now().date()
        today_sales = Sale.objects.filter(
            sale_date__date=today,
            status='completed'
        ).aggregate(
            total=Sum('total_amount'),
            count=Count('id')
        )
        
        # This week's sales
        week_ago = today - timedelta(days=7)
        week_sales = Sale.objects.filter(
            sale_date__date__gte=week_ago,
            status='completed'
        ).aggregate(
            total=Sum('total_amount'),
            count=Count('id')
        )
        
        # Monthly sales trend (last 30 days)
        month_ago = today - timedelta(days=30)
        monthly_sales = Sale.objects.filter(
            sale_date__date__gte=month_ago,
            status='completed'
        ).values('sale_date__date').annotate(
            daily_total=Sum('total_amount'),
            daily_count=Count('id')
        ).order_by('sale_date__date')
        
        return Response({
            'today': {
                'total': today_sales['total'] or 0,
                'count': today_sales['count'] or 0
            },
            'this_week': {
                'total': week_sales['total'] or 0,
                'count': week_sales['count'] or 0
            },
            'monthly_trend': list(monthly_sales)
        })

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Purchase Orders.
    """
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'supplier']
    search_fields = ['order_number']
    ordering_fields = ['order_date', 'total', 'expected_delivery_date']
    ordering = ['-order_date']
    
    def get_permissions(self):
        """
        Different permissions for different actions.
        Staff can view, managers can create/update, admins can delete.
        """
        if self.action in ['create', 'update', 'partial_update']:
            return [IsManagerUser()]
        if self.action == 'destroy':
            return [IsAdminUser()]
        if self.action == 'receive_order':
            return [IsManagerUser()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Set the user when creating a purchase order"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def receive_order(self, request, pk=None):
        """
        Mark purchase order as received and update stock.
        POST /api/purchase-orders/{id}/receive_order/
        """
        purchase_order = self.get_object()
        
        if purchase_order.status == 'delivered':
            return Response(
                {'error': 'Order already delivered'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all items in the order
        items = purchase_order.purchaseorderitem_set.all()
        
        # Update stock for each item
        for item in items:
            product = item.product
            quantity = item.quantity_ordered
            product.update_stock(
                quantity, 
                'purchase', 
                f"Received from PO #{purchase_order.order_number}"
            )
            item.quantity_received = quantity
            item.save()
        
        # Update order status
        purchase_order.status = 'delivered'
        purchase_order.actual_delivery_date = timezone.now()
        purchase_order.save()
        
        return Response({
            'message': 'Order received successfully',
            'order': self.get_serializer(purchase_order).data
        })

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users and their roles
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.profile.role,
            'role_display': user.profile.get_role_display(),
            'phone': user.profile.phone,
            'is_admin': user.profile.is_admin,
            'is_manager': user.profile.is_manager,
            'is_staff': user.profile.is_staff,
        })
    
    @action(detail=True, methods=['post'])
    def set_role(self, request, pk=None):
        """Set user role (Admin only)"""
        user = self.get_object()
        role = request.data.get('role')
        
        if role not in ['admin', 'manager', 'staff']:
            return Response(
                {'error': 'Invalid role. Must be admin, manager, or staff'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.profile.role = role
        user.profile.save()
        
        return Response({
            'message': f'User {user.username} role updated to {role}',
            'role': role
        })

"""
Database models for StockPulse.
Each class below represents a table in your database.
Think of models as blueprints for your data structure.
"""

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

class Category(models.Model):
    """
    Product categories like 'Electronics', 'Clothing', etc.
    This helps organize products for better management.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # Makes the model show up as 'Categories' in admin
        verbose_name_plural = "Categories"
        ordering = ['name']  # Always sort by name
    
    def __str__(self):
        # This is what shows up in the admin panel
        return self.name

class Supplier(models.Model):
    """
    Companies or individuals who supply products to your business.
    """
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    rating = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Supplier rating from 1 (poor) to 5 (excellent)"
    )
    lead_time_days = models.IntegerField(
        default=7,
        help_text="Average days between order and delivery"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Warehouse(models.Model):
    """
    Physical location where inventory is stored.
    For multi-location businesses.
    """
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    manager = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    """
    Main product model - the heart of the inventory system.
    Contains all information about each product.
    """
    # Unique identifiers
    sku = models.CharField(
        max_length=50, 
        unique=True,
        help_text="Stock Keeping Unit - unique product identifier"
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    # Pricing and costs
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0.00)]
    )
    
    # Stock levels
    stock_quantity = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    reorder_level = models.IntegerField(
        default=10,
        help_text="When stock falls below this, trigger alert"
    )
    reorder_quantity = models.IntegerField(
        default=50,
        help_text="How many to order when reordering"
    )
    
    # Relationships (foreign keys)
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL,  # If category deleted, keep product
        null=True, 
        blank=True,
        related_name='products'
    )
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    
    # Status flags
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)  # For promotions
    
    # Timestamps - Django auto-adds these
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        # Ensure product names are unique within a category
        unique_together = ['name', 'category']
    
    def __str__(self):
        return f"{self.name} ({self.sku})"
    
    @property
    def is_low_stock(self):
        """Check if product is below reorder level"""
        return self.stock_quantity <= self.reorder_level
    
    @property
    def stock_value(self):
        """Calculate total value of current stock"""
        return self.stock_quantity * self.cost
    
    def update_stock(self, quantity, transaction_type, notes=""):
        """
        Update stock and create a transaction record.
        This is the main method for changing stock levels.
        
        Args:
            quantity: Number of units (positive for additions, negative for removals)
            transaction_type: 'purchase', 'sale', 'adjustment', 'return'
            notes: Optional notes about the transaction
        """
        old_quantity = self.stock_quantity
        new_quantity = old_quantity + quantity
        
        # Validate we're not going negative
        if new_quantity < 0:
            raise ValueError(f"Cannot reduce stock below 0. Current: {old_quantity}")
        
        # Update the stock
        self.stock_quantity = new_quantity
        self.save()
        
        # Create transaction record
        StockTransaction.objects.create(
            product=self,
            quantity=quantity,
            old_quantity=old_quantity,
            new_quantity=new_quantity,
            transaction_type=transaction_type,
            notes=notes
        )
        
        return new_quantity

class StockTransaction(models.Model):
    """
    Audit trail for all stock movements.
    Every stock change is recorded for accountability.
    """
    TRANSACTION_TYPES = [
        ('purchase', 'Purchase Order'),
        ('sale', 'Sale'),
        ('adjustment', 'Manual Adjustment'),
        ('return', 'Return'),
        ('transfer', 'Warehouse Transfer'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='transactions')
    quantity = models.IntegerField(help_text="Positive for additions, negative for removals")
    old_quantity = models.IntegerField()
    new_quantity = models.IntegerField()
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    notes = models.TextField(blank=True)
    
    # Who made the change (when we have user authentication)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # When it happened (auto set)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']  # Most recent first
        verbose_name_plural = "Stock Transactions"
    
    def __str__(self):
        sign = "+" if self.quantity > 0 else ""
        return f"{self.product.sku} - {self.transaction_type}: {sign}{self.quantity}"

class Sale(models.Model):
    """
    Record of product sales.
    Tracks what was sold, when, and to whom.
    """
    # Sale identifier
    invoice_number = models.CharField(max_length=50, unique=True)
    
    # What was sold (many-to-many through SaleItem)
    products = models.ManyToManyField(Product, through='SaleItem')
    
    # Customer information (we could expand this with a Customer model)
    customer_name = models.CharField(max_length=200, blank=True, null=True)
    customer_email = models.EmailField(blank=True, null=True)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Sale details
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Status
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    
    # Payment
    PAYMENT_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('mobile', 'Mobile Money'),
        ('credit', 'Credit'),
    ]
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='cash')
    
    # Who made the sale
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Timestamps
    sale_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-sale_date']
    
    def __str__(self):
        return f"Invoice #{self.invoice_number} - {self.total_amount}"
    
    def calculate_total(self):
        """Recalculate total from sale items"""
        total = sum(item.subtotal for item in self.saleitem_set.all())
        self.total_amount = total - self.discount_amount + self.tax_amount
        self.save()
        return self.total_amount

class SaleItem(models.Model):
    """
    Individual items within a sale.
    Connects products to sales with quantity and price.
    """
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    
    def save(self, *args, **kwargs):
        # Auto-calculate subtotal before saving
        self.subtotal = self.quantity * self.price_at_time
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

class PurchaseOrder(models.Model):
    """
    Orders placed with suppliers to restock inventory.
    """
    ORDER_STATUSES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    order_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    
    # Order details
    order_date = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateTimeField()
    actual_delivery_date = models.DateTimeField(null=True, blank=True)
    
    # Financials
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Status
    status = models.CharField(max_length=20, choices=ORDER_STATUSES, default='draft')
    
    # Who created the order
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-order_date']
    
    def __str__(self):
        return f"PO #{self.order_number} - {self.supplier.name}"
    
    def calculate_total(self):
        """Update order totals"""
        items = self.purchaseorderitem_set.all()
        self.subtotal = sum(item.subtotal for item in items)
        self.total = self.subtotal + self.tax
        self.save()
        return self.total

class PurchaseOrderItem(models.Model):
    """
    Individual items within a purchase order.
    """
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity_ordered = models.IntegerField(validators=[MinValueValidator(1)])
    quantity_received = models.IntegerField(default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    
    def save(self, *args, **kwargs):
        self.subtotal = self.quantity_ordered * self.unit_price
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.product.name} - {self.quantity_ordered} units"

class UserProfile(models.Model):
    """
    Extended user profile with role management
    """
    ROLE_CHOICES = [
        ('admin', 'Admin/Owner'),
        ('manager', 'Inventory Manager'),
        ('staff', 'Sales Staff'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')
    phone = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    hire_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"
    
    @property
    def is_admin(self):
        return self.role == 'admin' or self.user.is_superuser
    
    @property
    def is_manager(self):
        return self.role in ['admin', 'manager']
    
    @property
    def is_staff(self):
        return self.role in ['admin', 'manager', 'staff']

# Signal to create profile when user is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
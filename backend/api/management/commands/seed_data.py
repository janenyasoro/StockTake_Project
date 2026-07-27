from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from api.models import (
    Category, Supplier, Warehouse, Product, 
    StockTransaction, Sale, SaleItem,
    PurchaseOrder, PurchaseOrderItem
)
from decimal import Decimal
from datetime import timedelta
import random

class Command(BaseCommand):
    help = 'Seed database with sample data for StockPulse'

    def handle(self, *args, **kwargs):
        self.stdout.write('🚀 Starting seed data creation...')
        
        # 1. Create Users with different roles
        self.create_users()
        
        # 2. Create Categories
        self.create_categories()
        
        # 3. Create Suppliers
        self.create_suppliers()
        
        # 4. Create Warehouses
        self.create_warehouses()
        
        # 5. Create Products
        self.create_products()
        
        # 6. Create Stock Transactions
        self.create_transactions()
        
        # 7. Create Sales
        self.create_sales()
        
        # 8. Create Purchase Orders
        self.create_purchase_orders()
        
        self.stdout.write(self.style.SUCCESS('✅ Seed data created successfully!'))
    
    def create_users(self):
        self.stdout.write('📝 Creating users...')
        
        # Admin User
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@stockpulse.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_superuser': True,
                'is_staff': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(f'  ✅ Admin user created: admin/admin123')
        
        # Inventory Manager
        manager_user, created = User.objects.get_or_create(
            username='manager',
            defaults={
                'email': 'manager@stockpulse.com',
                'first_name': 'Jane',
                'last_name': 'Manager',
                'is_staff': True,
            }
        )
        if created:
            manager_user.set_password('manager123')
            manager_user.save()
            self.stdout.write(f'  ✅ Manager user created: manager/manager123')
        
        # Sales Staff
        staff_user, created = User.objects.get_or_create(
            username='staff',
            defaults={
                'email': 'staff@stockpulse.com',
                'first_name': 'John',
                'last_name': 'Staff',
            }
        )
        if created:
            staff_user.set_password('staff123')
            staff_user.save()
            self.stdout.write(f'  ✅ Staff user created: staff/staff123')
    
    def create_categories(self):
        self.stdout.write('📦 Creating categories...')
        
        categories = [
            {'name': 'Electronics', 'description': 'Electronic devices and accessories'},
            {'name': 'Clothing', 'description': 'Apparel and fashion items'},
            {'name': 'Groceries', 'description': 'Food and beverage products'},
            {'name': 'Office Supplies', 'description': 'Stationery and office equipment'},
            {'name': 'Furniture', 'description': 'Home and office furniture'},
            {'name': 'Beauty', 'description': 'Cosmetics and personal care'},
        ]
        
        for cat_data in categories:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            if created:
                self.stdout.write(f'  ✅ Category created: {category.name}')
    
    def create_suppliers(self):
        self.stdout.write('🏢 Creating suppliers...')
        
        suppliers = [
            {
                'name': 'Tech Distributors Inc.',
                'contact_person': 'John Doe',
                'email': 'john@techdist.com',
                'phone': '+254711111111',
                'address': '123 Tech Park, Nairobi',
                'rating': 4,
                'lead_time_days': 3
            },
            {
                'name': 'Fashion World Ltd',
                'contact_person': 'Mary Smith',
                'email': 'mary@fashionworld.com',
                'phone': '+254722222222',
                'address': '456 Fashion Avenue, Mombasa',
                'rating': 5,
                'lead_time_days': 5
            },
            {
                'name': 'Fresh Food Supply Co.',
                'contact_person': 'Peter Kamau',
                'email': 'peter@freshfood.com',
                'phone': '+254733333333',
                'address': '789 Market Street, Kisumu',
                'rating': 3,
                'lead_time_days': 2
            },
        ]
        
        for sup_data in suppliers:
            supplier, created = Supplier.objects.get_or_create(
                name=sup_data['name'],
                defaults=sup_data
            )
            if created:
                self.stdout.write(f'  ✅ Supplier created: {supplier.name}')
    
    def create_warehouses(self):
        self.stdout.write('🏗️ Creating warehouses...')
        
        warehouses = [
            {'name': 'Main Warehouse', 'location': 'Nairobi Industrial Area', 'manager': 'John Main'},
            {'name': 'Mombasa Branch', 'location': 'Mombasa CBD', 'manager': 'Jane Coastal'},
            {'name': 'Kisumu Depot', 'location': 'Kisumu Town', 'manager': 'Peter Lakeside'},
        ]
        
        for wh_data in warehouses:
            warehouse, created = Warehouse.objects.get_or_create(
                name=wh_data['name'],
                defaults={
                    'location': wh_data['location'],
                    'manager': wh_data['manager'],
                    'phone': f'+2547{random.randint(10000000, 99999999)}',
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'  ✅ Warehouse created: {warehouse.name}')
    
    def create_products(self):
        self.stdout.write('📱 Creating products...')
        
        try:
            electronics = Category.objects.get(name='Electronics')
            clothing = Category.objects.get(name='Clothing')
            groceries = Category.objects.get(name='Groceries')
            office = Category.objects.get(name='Office Supplies')
        except Category.DoesNotExist:
            self.stdout.write('  ⚠️ Categories not found, please run create_categories first')
            return
        
        try:
            tech_supplier = Supplier.objects.get(name='Tech Distributors Inc.')
            fashion_supplier = Supplier.objects.get(name='Fashion World Ltd')
            food_supplier = Supplier.objects.get(name='Fresh Food Supply Co.')
        except Supplier.DoesNotExist:
            self.stdout.write('  ⚠️ Suppliers not found, please run create_suppliers first')
            return
        
        try:
            main_warehouse = Warehouse.objects.get(name='Main Warehouse')
            mombasa_warehouse = Warehouse.objects.get(name='Mombasa Branch')
        except Warehouse.DoesNotExist:
            self.stdout.write('  ⚠️ Warehouses not found, please run create_warehouses first')
            return
        
        products = [
            # Electronics
            {
                'name': 'Wireless Bluetooth Speaker',
                'sku': 'ELEC001',
                'description': 'Portable bluetooth speaker with 20W output',
                'price': 79.99,
                'cost': 45.00,
                'stock_quantity': 50,
                'reorder_level': 10,
                'reorder_quantity': 25,
                'category': electronics,
                'supplier': tech_supplier,
                'warehouse': main_warehouse
            },
            {
                'name': 'USB-C Fast Charger',
                'sku': 'ELEC002',
                'description': '65W GaN fast charger with 3 ports',
                'price': 39.99,
                'cost': 20.00,
                'stock_quantity': 100,
                'reorder_level': 20,
                'reorder_quantity': 50,
                'category': electronics,
                'supplier': tech_supplier,
                'warehouse': main_warehouse
            },
            {
                'name': 'Wireless Mechanical Keyboard',
                'sku': 'ELEC003',
                'description': 'RGB backlit mechanical keyboard',
                'price': 129.99,
                'cost': 70.00,
                'stock_quantity': 30,
                'reorder_level': 8,
                'reorder_quantity': 20,
                'category': electronics,
                'supplier': tech_supplier,
                'warehouse': mombasa_warehouse
            },
            
            # Clothing
            {
                'name': 'Premium Cotton T-Shirt',
                'sku': 'CLOTH001',
                'description': '100% organic cotton t-shirt',
                'price': 29.99,
                'cost': 12.00,
                'stock_quantity': 150,
                'reorder_level': 25,
                'reorder_quantity': 50,
                'category': clothing,
                'supplier': fashion_supplier,
                'warehouse': main_warehouse
            },
            {
                'name': 'Denim Jeans - Slim Fit',
                'sku': 'CLOTH002',
                'description': 'Classic blue denim jeans',
                'price': 59.99,
                'cost': 28.00,
                'stock_quantity': 75,
                'reorder_level': 15,
                'reorder_quantity': 30,
                'category': clothing,
                'supplier': fashion_supplier,
                'warehouse': mombasa_warehouse
            },
            
            # Groceries
            {
                'name': 'Organic Coffee Beans',
                'sku': 'GROC001',
                'description': 'Single origin Arabica coffee',
                'price': 24.99,
                'cost': 10.00,
                'stock_quantity': 200,
                'reorder_level': 40,
                'reorder_quantity': 100,
                'category': groceries,
                'supplier': food_supplier,
                'warehouse': main_warehouse
            },
            {
                'name': 'Honey (500g)',
                'sku': 'GROC002',
                'description': 'Pure natural honey',
                'price': 14.99,
                'cost': 6.00,
                'stock_quantity': 120,
                'reorder_level': 20,
                'reorder_quantity': 60,
                'category': groceries,
                'supplier': food_supplier,
                'warehouse': main_warehouse
            },
            
            # Office Supplies
            {
                'name': 'Premium Notebook (A5)',
                'sku': 'OFFI001',
                'description': 'Leather-bound notebook with 200 pages',
                'price': 19.99,
                'cost': 8.00,
                'stock_quantity': 300,
                'reorder_level': 50,
                'reorder_quantity': 100,
                'category': office,
                'supplier': tech_supplier,
                'warehouse': main_warehouse
            },
            {
                'name': 'Pilot Gel Pen Set (5 Pack)',
                'sku': 'OFFI002',
                'description': 'Smooth writing gel pens',
                'price': 9.99,
                'cost': 4.00,
                'stock_quantity': 250,
                'reorder_level': 30,
                'reorder_quantity': 75,
                'category': office,
                'supplier': tech_supplier,
                'warehouse': mombasa_warehouse
            },
        ]
        
        for prod_data in products:
            product, created = Product.objects.get_or_create(
                sku=prod_data['sku'],
                defaults=prod_data
            )
            if created:
                self.stdout.write(f'  ✅ Product created: {product.name} ({product.sku})')
    
    def create_transactions(self):
        self.stdout.write('📊 Creating stock transactions...')
        
        try:
            products = Product.objects.all()
            admin_user = User.objects.get(username='admin')
        except:
            self.stdout.write('  ⚠️ Products or admin user not found')
            return
        
        # Create some initial stock transactions
        for product in products:
            StockTransaction.objects.get_or_create(
                product=product,
                transaction_type='purchase',
                notes='Initial stock setup',
                defaults={
                    'quantity': product.stock_quantity,
                    'old_quantity': 0,
                    'new_quantity': product.stock_quantity,
                    'user': admin_user
                }
            )
        
        self.stdout.write(f'  ✅ Created {StockTransaction.objects.count()} transactions')
    
    def create_sales(self):
        self.stdout.write('💰 Creating sales records...')
        
        try:
            products = list(Product.objects.all())
            staff_user = User.objects.get(username='staff')
        except:
            self.stdout.write('  ⚠️ Products or staff user not found')
            return
        
        customers = [
            'James Mwangi', 'Grace Wanjiru', 'Peter Ochieng', 
            'Sarah Kimani', 'David Omondi', 'Lucy Wambui'
        ]
        
        # Create sales over last 30 days
        for day in range(30, 0, -1):
            date = timezone.now() - timedelta(days=day)
            
            # Random number of sales per day (1-3)
            for _ in range(random.randint(1, 3)):
                if not products:
                    break
                
                # Select random products (1-3 per sale)
                sale_products = random.sample(products, min(random.randint(1, 3), len(products)))
                total = Decimal('0.00')
                
                sale = Sale.objects.create(
                    invoice_number=f"INV-{date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
                    customer_name=random.choice(customers),
                    customer_email=f"customer{random.randint(1, 20)}@example.com",
                    customer_phone=f"+2547{random.randint(10000000, 99999999)}",
                    total_amount=Decimal('0.00'),
                    tax_amount=Decimal('0.00'),
                    discount_amount=Decimal('0.00'),
                    status='completed',
                    payment_method=random.choice(['cash', 'card', 'mobile']),
                    user=staff_user,
                    sale_date=date
                )
                
                # Add items to sale
                for product in sale_products:
                    quantity = random.randint(1, 5)
                    price = product.price
                    subtotal = quantity * price
                    total += subtotal
                    
                    SaleItem.objects.create(
                        sale=sale,
                        product=product,
                        quantity=quantity,
                        price_at_time=price,
                        subtotal=subtotal
                    )
                    
                    # Update stock
                    old_qty = product.stock_quantity
                    new_qty = old_qty - quantity
                    if new_qty >= 0:
                        product.stock_quantity = new_qty
                        product.save()
                        
                        StockTransaction.objects.create(
                            product=product,
                            quantity=-quantity,
                            old_quantity=old_qty,
                            new_quantity=new_qty,
                            transaction_type='sale',
                            notes=f'Sale {sale.invoice_number}',
                            user=staff_user
                        )
                
                # Update sale total
                sale.total_amount = total
                sale.save()
        
        self.stdout.write(f'  ✅ Created {Sale.objects.count()} sales with {SaleItem.objects.count()} items')
    
    def create_purchase_orders(self):
        self.stdout.write('📦 Creating purchase orders...')
        
        try:
            suppliers = list(Supplier.objects.all())
            products = list(Product.objects.all())
            manager_user = User.objects.get(username='manager')
        except:
            self.stdout.write('  ⚠️ Suppliers, products, or manager user not found')
            return
        
        if not suppliers:
            self.stdout.write('  ⚠️ No suppliers found')
            return
        
        # Create pending purchase orders
        for _ in range(3):
            supplier = random.choice(suppliers)
            order_date = timezone.now() - timedelta(days=random.randint(1, 10))
            expected_date = order_date + timedelta(days=supplier.lead_time_days or 5)
            
            po = PurchaseOrder.objects.create(
                order_number=f"PO-{order_date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
                supplier=supplier,
                order_date=order_date,
                expected_delivery_date=expected_date,
                status=random.choice(['draft', 'submitted', 'approved']),
                created_by=manager_user
            )
            
            # Add items
            if products:
                po_items = random.sample(products, min(random.randint(2, 5), len(products)))
                for product in po_items:
                    quantity = random.randint(10, 100)
                    unit_price = product.cost * Decimal('1.2')
                    PurchaseOrderItem.objects.create(
                        purchase_order=po,
                        product=product,
                        quantity_ordered=quantity,
                        quantity_received=random.randint(0, quantity),
                        unit_price=unit_price,
                        subtotal=quantity * unit_price
                    )
            
            po.calculate_total()
            self.stdout.write(f'  ✅ Purchase order created: {po.order_number}')
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import Category, Product


PRODUCTS = [
    {
        'name': 'Wireless Mouse', 'sku': 'ACC-001', 'category': 'Electronics',
        'description': 'Ergonomic wireless mouse with adjustable sensitivity.',
        'price': '1800.00', 'cost': '1050.00', 'stock': 35,
    },
    {
        'name': 'USB-C Hub 6-in-1', 'sku': 'ACC-002', 'category': 'Electronics',
        'description': 'Compact USB-C hub with HDMI, USB, and card reader ports.',
        'price': '4200.00', 'cost': '2750.00', 'stock': 18,
    },
    {
        'name': 'Laptop Stand', 'sku': 'ACC-003', 'category': 'Electronics',
        'description': 'Adjustable aluminium stand for laptops and tablets.',
        'price': '3500.00', 'cost': '2100.00', 'stock': 22,
    },
    {
        'name': 'Reusable Water Bottle 750ml', 'sku': 'HOME-001', 'category': 'Home & Kitchen',
        'description': 'Double-wall stainless steel bottle with a leak-proof lid.',
        'price': '1600.00', 'cost': '850.00', 'stock': 40,
    },
    {
        'name': 'Ceramic Coffee Mug', 'sku': 'HOME-002', 'category': 'Home & Kitchen',
        'description': 'Everyday ceramic mug with a comfortable handle.',
        'price': '650.00', 'cost': '300.00', 'stock': 60,
    },
    {
        'name': 'A4 Copy Paper (500 sheets)', 'sku': 'OFF-003', 'category': 'Office Supplies',
        'description': 'Quality 80gsm multipurpose office copy paper.',
        'price': '850.00', 'cost': '590.00', 'stock': 75,
    },
    {
        'name': 'Desk Organiser', 'sku': 'OFF-004', 'category': 'Office Supplies',
        'description': 'Compact organiser for pens, notes, and desk accessories.',
        'price': '1200.00', 'cost': '700.00', 'stock': 26,
    },
    {
        'name': 'Canvas Tote Bag', 'sku': 'BAG-001', 'category': 'Clothing',
        'description': 'Reusable cotton canvas tote bag with reinforced handles.',
        'price': '900.00', 'cost': '450.00', 'stock': 32,
    },
    {
        'name': 'Arabica Ground Coffee (250g)', 'sku': 'GROC-003', 'category': 'Groceries',
        'description': 'Locally roasted ground Arabica coffee, packed fresh.',
        'price': '780.00', 'cost': '480.00', 'stock': 45,
    },
    {
        'name': 'Hand Lotion (250ml)', 'sku': 'CARE-001', 'category': 'Beauty',
        'description': 'Moisturising everyday hand lotion with a light fragrance.',
        'price': '550.00', 'cost': '290.00', 'stock': 38,
    },
]


class Command(BaseCommand):
    help = 'Add ten sample products to the catalogue without changing existing products.'

    @transaction.atomic
    def handle(self, *args, **options):
        created_count = 0
        existing_count = 0

        for item in PRODUCTS:
            category, _ = Category.objects.get_or_create(
                name=item['category'],
                defaults={'description': f'{item["category"]} products'},
            )
            product, created = Product.objects.get_or_create(
                sku=item['sku'],
                defaults={
                    'name': item['name'],
                    'description': item['description'],
                    'price': Decimal(item['price']),
                    'cost': Decimal(item['cost']),
                    'stock_quantity': 0,
                    'reorder_level': 8,
                    'reorder_quantity': 20,
                    'category': category,
                },
            )

            if created:
                product.update_stock(
                    item['stock'],
                    'purchase',
                    'Opening stock loaded with the sample catalogue.',
                )
                created_count += 1
                self.stdout.write(f'Added {product.name} ({product.sku})')
            else:
                existing_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Catalogue seed complete: {created_count} added, {existing_count} already existed.'
        ))

from django.core.management.base import BaseCommand

from billing.models import Supplier, Product


class Command(BaseCommand):
    help = "Create demo suppliers and products for the POS system"

    def handle(self, *args, **options):

        # -------------------------------------------------
        # SUPPLIERS
        # -------------------------------------------------

        supplier1, _ = Supplier.objects.get_or_create(
            name="Fashion Hub Suppliers",
            defaults={
                "contact_person": "Arun Kumar",
                "phone": "9876543210",
                "email": "fashionhub@example.com",
                "address": "Kochi, Kerala",
            },
        )

        supplier2, _ = Supplier.objects.get_or_create(
            name="Style World Distributors",
            defaults={
                "contact_person": "Anjali Nair",
                "phone": "9876501234",
                "email": "styleworld@example.com",
                "address": "Calicut, Kerala",
            },
        )

        supplier3, _ = Supplier.objects.get_or_create(
            name="Kids Wear Collection",
            defaults={
                "contact_person": "Rahul Das",
                "phone": "9847001234",
                "email": "kidswear@example.com",
                "address": "Kannur, Kerala",
            },
        )

        # -------------------------------------------------
        # PRODUCTS
        # -------------------------------------------------

        products = [
            {
                "name": "Men Casual Shirt",
                "product_code": "MEN001",
                "category": "Men",
                "supplier": supplier1,
                "purchase_price": 650,
                "selling_price": 899,
                "stock": 30,
            },
            {
                "name": "Men T-Shirt",
                "product_code": "MEN002",
                "category": "Men",
                "supplier": supplier1,
                "purchase_price": 350,
                "selling_price": 599,
                "stock": 40,
            },
            {
                "name": "Men Jeans",
                "product_code": "MEN003",
                "category": "Men",
                "supplier": supplier2,
                "purchase_price": 900,
                "selling_price": 1299,
                "stock": 25,
            },
            {
                "name": "Women Kurti",
                "product_code": "WOM001",
                "category": "Women",
                "supplier": supplier2,
                "purchase_price": 700,
                "selling_price": 999,
                "stock": 35,
            },
            {
                "name": "Women Top",
                "product_code": "WOM002",
                "category": "Women",
                "supplier": supplier2,
                "purchase_price": 450,
                "selling_price": 749,
                "stock": 30,
            },
            {
                "name": "Women Jeans",
                "product_code": "WOM003",
                "category": "Women",
                "supplier": supplier1,
                "purchase_price": 850,
                "selling_price": 1199,
                "stock": 20,
            },
            {
                "name": "Kids T-Shirt",
                "product_code": "KID001",
                "category": "Kids",
                "supplier": supplier3,
                "purchase_price": 250,
                "selling_price": 449,
                "stock": 50,
            },
            {
                "name": "Kids Jeans",
                "product_code": "KID002",
                "category": "Kids",
                "supplier": supplier3,
                "purchase_price": 400,
                "selling_price": 699,
                "stock": 35,
            },
        ]

        created_count = 0
        updated_count = 0

        for product_data in products:

            product_code = product_data.pop("product_code")

            product, created = Product.objects.update_or_create(
                product_code=product_code,
                defaults=product_data,
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Demo data created successfully.\n"
                f"Products created: {created_count}\n"
                f"Products updated: {updated_count}\n"
                "Suppliers are ready."
            )
        )
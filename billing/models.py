from django.db import models
from django.contrib.auth.models import User


class Supplier(models.Model):
    name = models.CharField(max_length=150)
    contact_person = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('Men', 'Men'),
        ('Women', 'Women'),
        ('Kids', 'Kids'),
        ('Other', 'Other'),
    ]

    name = models.CharField(max_length=150)
    product_code = models.CharField(max_length=50, unique=True)

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='Other'
    )

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    purchase_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    stock = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class StaffProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.user.username


class Bill(models.Model):
    PAYMENT_CHOICES = [
        ('Cash', 'Cash'),
        ('Card', 'Card'),
        ('UPI', 'UPI'),
    ]

    invoice_number = models.CharField(
        max_length=50,
        unique=True
    )

    customer_name = models.CharField(
        max_length=150,
        blank=True
    )

    customer_phone = models.CharField(
        max_length=20,
        blank=True
    )

    staff = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='bills'
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    tax = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    grand_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES,
        default='Cash'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.invoice_number


class BillItem(models.Model):
    bill = models.ForeignKey(
        Bill,
        on_delete=models.CASCADE,
        related_name='items'
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT
    )

    quantity = models.PositiveIntegerField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.bill.invoice_number} - {self.product.name}"

class ProductReturn(models.Model):
    bill = models.ForeignKey(
        Bill,
        on_delete=models.CASCADE,
        related_name='returns'
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT
    )

    quantity = models.PositiveIntegerField()

    reason = models.TextField(blank=True)

    refund_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    returned_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Return - {self.bill.invoice_number}"

class LedgerEntry(models.Model):
    ENTRY_TYPES = [
        ('SALE', 'Sale'),
        ('RETURN', 'Return'),
        ('EXPENSE', 'Expense'),
    ]

    entry_type = models.CharField(
        max_length=20,
        choices=ENTRY_TYPES
    )

    description = models.CharField(max_length=255)

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    bill = models.ForeignKey(
        Bill,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.entry_type} - {self.amount}"
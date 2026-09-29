from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Product,
    Supplier,
    StaffProfile,
    Bill,
    BillItem,
    ProductReturn,
    LedgerEntry,
)


# =========================================================
# SUPPLIER
# =========================================================

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


# =========================================================
# PRODUCT
# =========================================================

class ProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(
        source='supplier.name',
        read_only=True
    )

    class Meta:
        model = Product
        fields = '__all__'


# =========================================================
# STAFF
# =========================================================

class StaffProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source='user.username'
    )

    first_name = serializers.CharField(
        source='user.first_name',
        required=False,
        allow_blank=True
    )

    last_name = serializers.CharField(
        source='user.last_name',
        required=False,
        allow_blank=True
    )

    email = serializers.EmailField(
        source='user.email',
        required=False,
        allow_blank=True
    )

    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        min_length=6
    )

    class Meta:
        model = StaffProfile

        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'password',
            'phone',
            'address',
            'is_active',
        ]

    def validate_username(self, value):
        queryset = User.objects.filter(
            username=value
        )

        if self.instance:
            queryset = queryset.exclude(
                id=self.instance.user_id
            )

        if queryset.exists():
            raise serializers.ValidationError(
                'This username is already in use.'
            )

        return value

    def create(self, validated_data):
        user_data = validated_data.pop(
            'user'
        )

        password = validated_data.pop(
            'password',
            None
        )

        if not password:
            raise serializers.ValidationError(
                {
                    'password':
                        'Password is required when creating staff.'
                }
            )

        user = User.objects.create_user(
            username=user_data.get(
                'username'
            ),
            first_name=user_data.get(
                'first_name',
                ''
            ),
            last_name=user_data.get(
                'last_name',
                ''
            ),
            email=user_data.get(
                'email',
                ''
            ),
            password=password,
        )

        user.is_staff = False
        user.is_superuser = False

        user.is_active = validated_data.get(
            'is_active',
            True
        )

        user.save()

        profile = StaffProfile.objects.create(
            user=user,
            **validated_data
        )

        return profile

    def update(
        self,
        instance,
        validated_data
    ):
        user_data = validated_data.pop(
            'user',
            {}
        )

        password = validated_data.pop(
            'password',
            None
        )

        user = instance.user

        if 'username' in user_data:
            user.username = user_data[
                'username'
            ]

        if 'first_name' in user_data:
            user.first_name = user_data[
                'first_name'
            ]

        if 'last_name' in user_data:
            user.last_name = user_data[
                'last_name'
            ]

        if 'email' in user_data:
            user.email = user_data[
                'email'
            ]

        if password:
            user.set_password(
                password
            )

        for attribute, value in validated_data.items():
            setattr(
                instance,
                attribute,
                value
            )

        user.is_active = instance.is_active

        user.save()
        instance.save()

        return instance


# =========================================================
# BILL ITEM
# =========================================================

class BillItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    product_code = serializers.CharField(
        source='product.product_code',
        read_only=True
    )

    class Meta:
        model = BillItem

        fields = [
            'id',
            'product',
            'product_name',
            'product_code',
            'quantity',
            'price',
            'total',
        ]


# =========================================================
# BILL
# =========================================================

class BillSerializer(serializers.ModelSerializer):
    items = BillItemSerializer(
        many=True,
        read_only=True
    )

    staff_username = serializers.CharField(
        source='staff.username',
        read_only=True
    )

    class Meta:
        model = Bill

        fields = [
            'id',
            'invoice_number',
            'customer_name',
            'customer_phone',
            'staff',
            'staff_username',
            'subtotal',
            'tax',
            'grand_total',
            'payment_method',
            'created_at',
            'items',
        ]


# =========================================================
# PRODUCT RETURN
# =========================================================

class ProductReturnSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(
        source='bill.invoice_number',
        read_only=True
    )

    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    product_code = serializers.CharField(
        source='product.product_code',
        read_only=True
    )

    class Meta:
        model = ProductReturn

        fields = [
            'id',
            'bill',
            'invoice_number',
            'product',
            'product_name',
            'product_code',
            'quantity',
            'reason',
            'refund_amount',
            'returned_at',
        ]

        read_only_fields = [
            'refund_amount',
            'returned_at',
        ]


# =========================================================
# LEDGER
# =========================================================

class LedgerEntrySerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(
        source='bill.invoice_number',
        read_only=True
    )

    class Meta:
        model = LedgerEntry

        fields = [
            'id',
            'entry_type',
            'description',
            'amount',
            'bill',
            'invoice_number',
            'created_at',
        ]

        read_only_fields = [
            'created_at',
        ]
from decimal import Decimal
import uuid

from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from rest_framework import (
    viewsets,
    status,
)

from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Product,
    Supplier,
    StaffProfile,
    Bill,
    BillItem,
    ProductReturn,
    LedgerEntry,
)

from .serializers import (
    ProductSerializer,
    SupplierSerializer,
    StaffProfileSerializer,
    BillSerializer,
    ProductReturnSerializer,
    LedgerEntrySerializer,
)

from .permissions import (
    IsAdminUser,
    IsBillingStaff,
    IsAdminOrBillingStaff,
)


# =========================================================
# LOGIN
# =========================================================

@api_view(['POST'])
def login_view(request):
    username = request.data.get(
        'username',
        ''
    ).strip()

    password = request.data.get(
        'password',
        ''
    )

    if not username or not password:
        return Response(
            {
                'error':
                    'Username and password are required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(
        username=username,
        password=password
    )

    if user is None:
        return Response(
            {
                'error':
                    'Invalid username or password.'
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {
                'error':
                    'This account is inactive.'
            },
            status=status.HTTP_403_FORBIDDEN
        )

    if user.is_superuser:
        role = 'admin'

    else:
        try:
            profile = user.staffprofile

        except StaffProfile.DoesNotExist:
            return Response(
                {
                    'error':
                        'This account does not have permission '
                        'to access the POS system.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if not profile.is_active:
            return Response(
                {
                    'error':
                        'This staff account is inactive.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        role = 'staff'

    refresh = RefreshToken.for_user(
        user
    )

    return Response(
        {
            'message':
                'Login successful.',

            'access':
                str(refresh.access_token),

            'refresh':
                str(refresh),

            'user': {
                'id':
                    user.id,

                'username':
                    user.username,

                'first_name':
                    user.first_name,

                'last_name':
                    user.last_name,

                'role':
                    role,
            },
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# PRODUCTS
# =========================================================

class ProductViewSet(viewsets.ModelViewSet):
    queryset = (
        Product.objects
        .select_related('supplier')
        .all()
        .order_by('-created_at')
    )

    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in [
            'list',
            'retrieve',
        ]:
            permission_classes = [
                IsAdminOrBillingStaff
            ]

        else:
            permission_classes = [
                IsAdminUser
            ]

        return [
            permission()
            for permission in permission_classes
        ]


# =========================================================
# SUPPLIERS
# =========================================================

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = (
        Supplier.objects
        .all()
        .order_by('name')
    )

    serializer_class = SupplierSerializer

    permission_classes = [
        IsAdminUser
    ]


# =========================================================
# STAFF
# =========================================================

class StaffProfileViewSet(viewsets.ModelViewSet):
    queryset = (
        StaffProfile.objects
        .select_related('user')
        .all()
        .order_by('user__username')
    )

    serializer_class = StaffProfileSerializer

    permission_classes = [
        IsAdminUser
    ]

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):
        profile = self.get_object()
        user = profile.user

        user.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# =========================================================
# BILLS / TRANSACTIONS
# =========================================================

class BillViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BillSerializer

    permission_classes = [
        IsAdminOrBillingStaff
    ]

    def get_queryset(self):
        queryset = (
            Bill.objects
            .prefetch_related(
                'items__product'
            )
            .select_related(
                'staff'
            )
            .all()
            .order_by(
                '-created_at'
            )
        )

        user = self.request.user

        if user.is_superuser:
            return queryset

        return queryset.filter(
            staff=user
        )


# =========================================================
# PRODUCT RETURN HISTORY
# =========================================================

class ProductReturnViewSet(
    viewsets.ReadOnlyModelViewSet
):
    queryset = (
        ProductReturn.objects
        .select_related(
            'bill',
            'product'
        )
        .all()
        .order_by(
            '-returned_at'
        )
    )

    serializer_class = (
        ProductReturnSerializer
    )

    permission_classes = [
        IsAdminUser
    ]


# =========================================================
# LEDGER
# =========================================================

class LedgerEntryViewSet(
    viewsets.ModelViewSet
):
    queryset = (
        LedgerEntry.objects
        .select_related('bill')
        .all()
        .order_by('-created_at')
    )

    serializer_class = (
        LedgerEntrySerializer
    )

    permission_classes = [
        IsAdminUser
    ]

    def create(
        self,
        request,
        *args,
        **kwargs
    ):
        entry_type = request.data.get(
            'entry_type'
        )

        if entry_type != 'EXPENSE':
            return Response(
                {
                    'error':
                        'Manual ledger entries can only be expenses.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        description = request.data.get(
            'description',
            ''
        ).strip()

        amount = request.data.get(
            'amount'
        )

        if not description:
            return Response(
                {
                    'error':
                        'Expense description is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = Decimal(
                str(amount)
            )

        except Exception:
            return Response(
                {
                    'error':
                        'Enter a valid expense amount.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if amount <= 0:
            return Response(
                {
                    'error':
                        'Expense amount must be greater than zero.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        entry = LedgerEntry.objects.create(
            entry_type='EXPENSE',
            description=description,

            # Expenses reduce the ledger balance.
            amount=-amount,
        )

        serializer = self.get_serializer(
            entry
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):
        return Response(
            {
                'error':
                    'Ledger entries cannot be edited.'
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def partial_update(
        self,
        request,
        *args,
        **kwargs
    ):
        return Response(
            {
                'error':
                    'Ledger entries cannot be edited.'
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):
        return Response(
            {
                'error':
                    'Ledger entries cannot be deleted.'
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )


# =========================================================
# COMPLETE SALE
# =========================================================

@api_view(['POST'])
@permission_classes([IsBillingStaff])
def complete_sale(request):
    items = request.data.get(
        'items',
        []
    )

    customer_name = request.data.get(
        'customer_name',
        ''
    ).strip()

    customer_phone = request.data.get(
        'customer_phone',
        ''
    ).strip()

    payment_method = request.data.get(
        'payment_method',
        'Cash'
    )

    if not items:
        return Response(
            {
                'error':
                    'Cart is empty.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    valid_payment_methods = [
        'Cash',
        'Card',
        'UPI',
    ]

    if (
        payment_method
        not in valid_payment_methods
    ):
        return Response(
            {
                'error':
                    'Invalid payment method.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        with transaction.atomic():

            subtotal = Decimal(
                '0.00'
            )

            prepared_items = []

            for item in items:
                product_id = item.get(
                    'product_id'
                )

                quantity = item.get(
                    'quantity'
                )

                if (
                    not product_id
                    or not quantity
                ):
                    return Response(
                        {
                            'error':
                                'Each item must contain '
                                'product_id and quantity.'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                try:
                    quantity = int(
                        quantity
                    )

                except (
                    TypeError,
                    ValueError
                ):
                    return Response(
                        {
                            'error':
                                'Invalid quantity.'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if quantity < 1:
                    return Response(
                        {
                            'error':
                                'Quantity must be at least 1.'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                try:
                    product = (
                        Product.objects
                        .select_for_update()
                        .get(
                            id=product_id
                        )
                    )

                except Product.DoesNotExist:
                    return Response(
                        {
                            'error':
                                f'Product with ID '
                                f'{product_id} does not exist.'
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )

                if product.stock < quantity:
                    return Response(
                        {
                            'error':
                                f'Not enough stock for '
                                f'{product.name}. '
                                f'Available stock: '
                                f'{product.stock}.'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                item_total = (
                    product.selling_price
                    * Decimal(quantity)
                )

                subtotal += item_total

                prepared_items.append(
                    {
                        'product':
                            product,

                        'quantity':
                            quantity,

                        'price':
                            product.selling_price,

                        'total':
                            item_total,
                    }
                )

            tax = Decimal(
                '0.00'
            )

            grand_total = (
                subtotal + tax
            )

            invoice_number = (
                f"INV-"
                f"{timezone.now().strftime('%Y%m%d%H%M%S')}-"
                f"{uuid.uuid4().hex[:6].upper()}"
            )

            bill = Bill.objects.create(
                invoice_number=invoice_number,
                customer_name=customer_name,
                customer_phone=customer_phone,
                staff=request.user,
                subtotal=subtotal,
                tax=tax,
                grand_total=grand_total,
                payment_method=payment_method,
            )

            for item in prepared_items:
                product = item[
                    'product'
                ]

                quantity = item[
                    'quantity'
                ]

                BillItem.objects.create(
                    bill=bill,
                    product=product,
                    quantity=quantity,
                    price=item['price'],
                    total=item['total'],
                )

                product.stock -= quantity

                product.save(
                    update_fields=[
                        'stock'
                    ]
                )

            LedgerEntry.objects.create(
                entry_type='SALE',
                description=(
                    f'Sale {invoice_number}'
                ),
                amount=grand_total,
                bill=bill,
            )

            serializer = BillSerializer(
                bill
            )

            return Response(
                {
                    'message':
                        'Sale completed successfully.',

                    'bill':
                        serializer.data,
                },
                status=status.HTTP_201_CREATED
            )

    except Exception as error:
        return Response(
            {
                'error':
                    'Unable to complete sale.',

                'details':
                    str(error),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =========================================================
# PROCESS PRODUCT RETURN
# =========================================================

@api_view(['POST'])
@permission_classes([IsAdminUser])
def process_return(request):
    bill_id = request.data.get(
        'bill_id'
    )

    product_id = request.data.get(
        'product_id'
    )

    quantity = request.data.get(
        'quantity'
    )

    reason = request.data.get(
        'reason',
        ''
    ).strip()

    if (
        not bill_id
        or not product_id
        or not quantity
    ):
        return Response(
            {
                'error':
                    'Bill, product and quantity are required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        quantity = int(
            quantity
        )

    except (
        TypeError,
        ValueError
    ):
        return Response(
            {
                'error':
                    'Return quantity must be a valid number.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if quantity < 1:
        return Response(
            {
                'error':
                    'Return quantity must be at least 1.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        with transaction.atomic():

            try:
                bill = (
                    Bill.objects
                    .select_for_update()
                    .get(
                        id=bill_id
                    )
                )

            except Bill.DoesNotExist:
                return Response(
                    {
                        'error':
                            'The selected bill does not exist.'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            try:
                product = (
                    Product.objects
                    .select_for_update()
                    .get(
                        id=product_id
                    )
                )

            except Product.DoesNotExist:
                return Response(
                    {
                        'error':
                            'The selected product does not exist.'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            bill_items = (
                BillItem.objects
                .filter(
                    bill=bill,
                    product=product
                )
            )

            if not bill_items.exists():
                return Response(
                    {
                        'error':
                            'This product was not sold '
                            'on the selected invoice.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            sold_data = (
                bill_items.aggregate(
                    total=Sum(
                        'quantity'
                    )
                )
            )

            sold_quantity = (
                sold_data['total']
                or 0
            )

            returned_data = (
                ProductReturn.objects
                .filter(
                    bill=bill,
                    product=product
                )
                .aggregate(
                    total=Sum(
                        'quantity'
                    )
                )
            )

            already_returned = (
                returned_data['total']
                or 0
            )

            remaining_returnable = (
                sold_quantity
                - already_returned
            )

            if remaining_returnable <= 0:
                return Response(
                    {
                        'error':
                            'This product has already '
                            'been fully returned.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if quantity > remaining_returnable:
                return Response(
                    {
                        'error':
                            f'Only {remaining_returnable} '
                            f'unit(s) can still be returned.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            bill_item = (
                bill_items
                .order_by('id')
                .first()
            )

            refund_amount = (
                bill_item.price
                * Decimal(quantity)
            )

            product_return = (
                ProductReturn.objects.create(
                    bill=bill,
                    product=product,
                    quantity=quantity,
                    reason=reason,
                    refund_amount=refund_amount,
                )
            )

            # Restore stock.
            product.stock += quantity

            product.save(
                update_fields=[
                    'stock'
                ]
            )

            # Negative amount because a return
            # reduces business income.
            LedgerEntry.objects.create(
                entry_type='RETURN',
                description=(
                    f'Return for '
                    f'{bill.invoice_number} - '
                    f'{product.name}'
                ),
                amount=-refund_amount,
                bill=bill,
            )

            serializer = (
                ProductReturnSerializer(
                    product_return
                )
            )

            return Response(
                {
                    'message':
                        'Product return processed successfully.',

                    'return':
                        serializer.data,

                    'updated_stock':
                        product.stock,
                },
                status=status.HTTP_201_CREATED
            )

    except Exception as error:
        return Response(
            {
                'error':
                    'Unable to process product return.',

                'details':
                    str(error),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
from django.urls import (
    path,
    include,
)

from rest_framework.routers import DefaultRouter

from .views import (
    ProductViewSet,
    SupplierViewSet,
    StaffProfileViewSet,
    BillViewSet,
    ProductReturnViewSet,
    LedgerEntryViewSet,
    complete_sale,
    process_return,
    login_view,
)


router = DefaultRouter()


router.register(
    r'products',
    ProductViewSet,
    basename='product'
)


router.register(
    r'suppliers',
    SupplierViewSet,
    basename='supplier'
)


router.register(
    r'staff',
    StaffProfileViewSet,
    basename='staff'
)


router.register(
    r'bills',
    BillViewSet,
    basename='bill'
)


router.register(
    r'returns',
    ProductReturnViewSet,
    basename='return'
)


router.register(
    r'ledger',
    LedgerEntryViewSet,
    basename='ledger'
)


urlpatterns = [
    path(
        'login/',
        login_view,
        name='login'
    ),

    path(
        'complete-sale/',
        complete_sale,
        name='complete-sale'
    ),

    path(
        'process-return/',
        process_return,
        name='process-return'
    ),

    path(
        '',
        include(router.urls)
    ),
]
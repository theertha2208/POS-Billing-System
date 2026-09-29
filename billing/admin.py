from django.contrib import admin
from .models import (
    Supplier,
    Product,
    StaffProfile,
    Bill,
    BillItem,
    ProductReturn,
    LedgerEntry,
)


admin.site.register(Supplier)
admin.site.register(Product)
admin.site.register(StaffProfile)
admin.site.register(Bill)
admin.site.register(BillItem)
admin.site.register(ProductReturn)
admin.site.register(LedgerEntry)
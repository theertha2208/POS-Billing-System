from django import forms
from .models import Supplier, Product


class SupplierForm(forms.ModelForm):
    class Meta:
        model = Supplier
        fields = [
            'name',
            'contact_person',
            'phone',
            'email',
            'address',
        ]


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            'name',
            'product_code',
            'category',
            'supplier',
            'purchase_price',
            'selling_price',
            'stock',
        ]
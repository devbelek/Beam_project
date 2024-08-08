from django.contrib import admin
from .models import Category, Product, Customer


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


class ProductAdmin(admin.ModelAdmin):
    list_display = ('id',)


class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'phone')


admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Customer, CustomerAdmin)


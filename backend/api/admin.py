from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'company_name', 'role', 'company_type']
    search_fields = ['name', 'email', 'company_name']
    list_filter = ['company_type', 'role']

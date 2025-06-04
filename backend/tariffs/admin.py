from django.contrib import admin
from .models import Tariff


@admin.register(Tariff)
class TariffAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('price',)
    readonly_fields = ('created_at', 'updated_at') 
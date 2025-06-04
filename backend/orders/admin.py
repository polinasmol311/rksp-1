from django.contrib import admin
from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'project_name', 'tariff', 'status',
                   'total_price', 'deadline', 'created_at')
    list_filter = ('status', 'created_at', 'deadline', 'is_deleted')
    search_fields = ('project_name', 'project_description',
                    'user__username', 'user__email')
    raw_id_fields = ('user', 'tariff')
    readonly_fields = ('created_at', 'updated_at', 'total_price')
    ordering = ('-created_at',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'tariff') 
from rest_framework import serializers
from .models import Tariff


class TariffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tariff
        fields = ('id', 'name', 'description', 'price', 'features',
                 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at') 
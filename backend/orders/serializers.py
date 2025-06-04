from rest_framework import serializers
from .models import Order
from tariffs.serializers import TariffSerializer


class OrderSerializer(serializers.ModelSerializer):
    tariff_details = TariffSerializer(source='tariff', read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'user', 'tariff', 'tariff_details', 'status',
                 'project_name', 'project_description', 'reference_links',
                 'requirements', 'deadline', 'attachments', 'comments',
                 'total_price', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at', 'total_price')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['total_price'] = validated_data['tariff'].price
        return super().create(validated_data)


class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('status', 'project_name', 'project_description',
                 'reference_links', 'requirements', 'deadline',
                 'attachments', 'comments')

    def validate(self, attrs):
        instance = getattr(self, 'instance', None)
        if instance and instance.status == Order.Status.CANCELLED:
            raise serializers.ValidationError(
                "Cannot update a cancelled order."
            )
        return attrs 
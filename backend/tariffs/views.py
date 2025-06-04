from rest_framework import generics, permissions
from django_filters import rest_framework as filters
from .models import Tariff
from .serializers import TariffSerializer


class TariffFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = filters.NumberFilter(field_name="price", lookup_expr='lte')

    class Meta:
        model = Tariff
        fields = ['is_active', 'min_price', 'max_price']


class TariffListView(generics.ListAPIView):
    queryset = Tariff.objects.filter(is_active=True)
    serializer_class = TariffSerializer
    permission_classes = (permissions.AllowAny,)
    filterset_class = TariffFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'name']


class TariffDetailView(generics.RetrieveAPIView):
    queryset = Tariff.objects.filter(is_active=True)
    serializer_class = TariffSerializer
    permission_classes = (permissions.AllowAny,) 
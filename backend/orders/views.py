from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters import rest_framework as filters
from .models import Order
from .serializers import OrderSerializer, OrderUpdateSerializer


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user or request.user.is_staff


class OrderFilter(filters.FilterSet):
    status = filters.ChoiceFilter(choices=Order.Status.choices)
    created_at = filters.DateFromToRangeFilter()
    deadline = filters.DateFromToRangeFilter()

    class Meta:
        model = Order
        fields = ['status', 'created_at', 'deadline']


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filterset_class = OrderFilter
    search_fields = ['project_name', 'project_description']
    ordering_fields = ['created_at', 'deadline', 'total_price']

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.filter(is_deleted=False)
        return Order.objects.filter(user=self.request.user, is_deleted=False)


class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.filter(is_deleted=False)
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrAdmin)


class OrderUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.filter(is_deleted=False)
    serializer_class = OrderUpdateSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrAdmin)

    def perform_update(self, serializer):
        if self.request.user.is_staff:
            serializer.save()
        else:
            # Regular users can only update certain fields
            allowed_fields = {'project_name', 'project_description',
                            'reference_links', 'requirements',
                            'attachments', 'comments'}
            data = {k: v for k, v in serializer.validated_data.items()
                   if k in allowed_fields}
            serializer.save(**data)


class OrderDeleteView(generics.DestroyAPIView):
    queryset = Order.objects.filter(is_deleted=False)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrAdmin)

    def perform_destroy(self, instance):
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT) 
from django.urls import path
from . import views

app_name = 'tariffs'

urlpatterns = [
    path('', views.TariffListView.as_view(), name='tariff-list'),
    path('<int:pk>/', views.TariffDetailView.as_view(), name='tariff-detail'),
] 
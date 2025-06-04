from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Order
from tariffs.models import Tariff

User = get_user_model()


class OrderTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        self.admin = User.objects.create_superuser(
            username='admin',
            password='adminpass123',
            email='admin@example.com'
        )
        self.tariff = Tariff.objects.create(
            name='Basic Package',
            description='Basic web design package',
            price='999.99',
            features=['Responsive Design', 'SEO Optimization']
        )
        self.order_data = {
            'tariff': self.tariff.id,
            'project_name': 'Test Project',
            'project_description': 'A test project description',
            'requirements': 'Test requirements',
            'reference_links': ['https://example.com'],
            'deadline': '2024-12-31'
        }
        
        tokens = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(tokens.access_token)}')

    def test_create_order(self):
        url = reverse('orders:order-list-create')
        response = self.client.post(url, self.order_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(Order.objects.get().project_name, 'Test Project')

    def test_list_orders(self):
        Order.objects.create(
            user=self.user,
            tariff=self.tariff,
            project_name='Test Project 1',
            project_description='Description 1',
            requirements='Requirements 1',
            total_price=self.tariff.price
        )
        Order.objects.create(
            user=self.user,
            tariff=self.tariff,
            project_name='Test Project 2',
            project_description='Description 2',
            requirements='Requirements 2',
            total_price=self.tariff.price
        )
        
        url = reverse('orders:order-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_retrieve_order(self):
        order = Order.objects.create(
            user=self.user,
            tariff=self.tariff,
            project_name='Test Project',
            project_description='Description',
            requirements='Requirements',
            total_price=self.tariff.price
        )
        url = reverse('orders:order-detail', args=[order.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['project_name'], 'Test Project')

    def test_update_order(self):
        order = Order.objects.create(
            user=self.user,
            tariff=self.tariff,
            project_name='Test Project',
            project_description='Description',
            requirements='Requirements',
            total_price=self.tariff.price
        )
        url = reverse('orders:order-update', args=[order.id])
        update_data = {
            'project_name': 'Updated Project',
            'project_description': 'Updated description'
        }
        response = self.client.put(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.project_name, 'Updated Project')

    def test_delete_order(self):
        order = Order.objects.create(
            user=self.user,
            tariff=self.tariff,
            project_name='Test Project',
            project_description='Description',
            requirements='Requirements',
            total_price=self.tariff.price
        )
        url = reverse('orders:order-delete', args=[order.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        order.refresh_from_db()
        self.assertTrue(order.is_deleted)

    def test_admin_access(self):
        # Create an order for regular user
        order = Order.objects.create(
            user=self.user,
            tariff=self.tariff,
            project_name='Test Project',
            project_description='Description',
            requirements='Requirements',
            total_price=self.tariff.price
        )
        
        # Switch to admin user
        tokens = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(tokens.access_token)}')
        
        # Admin should be able to see all orders
        url = reverse('orders:order-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        # Admin should be able to update order status
        url = reverse('orders:order-update', args=[order.id])
        update_data = {'status': Order.Status.IN_PROGRESS}
        response = self.client.put(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.IN_PROGRESS) 
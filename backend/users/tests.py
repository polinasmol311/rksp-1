from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserTests(APITestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'password': 'testpass123',
            'password2': 'testpass123',
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'phone': '1234567890',
            'company_name': 'Test Company'
        }
        
        self.user = User.objects.create_user(
            username='existinguser',
            password='existingpass123',
            email='existing@example.com'
        )

    def get_tokens_for_user(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    def test_user_registration(self):
        url = reverse('users:register')
        response = self.client.post(url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)
        self.assertEqual(User.objects.latest('id').username, 'testuser')

    def test_user_login(self):
        url = reverse('users:token_obtain_pair')
        response = self.client.post(url, {
            'username': 'existinguser',
            'password': 'existingpass123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_detail(self):
        tokens = self.get_tokens_for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        url = reverse('users:user-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'existinguser')

    def test_user_update(self):
        tokens = self.get_tokens_for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        url = reverse('users:user-update')
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'phone': '9876543210'
        }
        response = self.client.put(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.phone, '9876543210')

    def test_user_delete(self):
        tokens = self.get_tokens_for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        url = reverse('users:user-delete')
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_deleted) 
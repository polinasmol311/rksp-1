from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Tariff


class TariffTests(APITestCase):
    def setUp(self):
        self.tariff = Tariff.objects.create(
            name='Basic Package',
            description='Basic web design package',
            price='999.99',
            features=['Responsive Design', 'SEO Optimization']
        )

    def test_list_tariffs(self):
        url = reverse('tariffs:tariff-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Basic Package')

    def test_retrieve_tariff(self):
        url = reverse('tariffs:tariff-detail', args=[self.tariff.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Basic Package')
        self.assertEqual(response.data['price'], '999.99')

    def test_filter_tariffs(self):
        Tariff.objects.create(
            name='Premium Package',
            description='Premium web design package',
            price='1999.99',
            features=['Responsive Design', 'SEO Optimization', 'Custom Animations']
        )
        
        url = reverse('tariffs:tariff-list')
        response = self.client.get(url, {'min_price': '1500'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Premium Package')

    def test_search_tariffs(self):
        url = reverse('tariffs:tariff-list')
        response = self.client.get(url, {'search': 'basic'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Basic Package') 
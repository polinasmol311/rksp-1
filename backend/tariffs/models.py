from django.db import models


class Tariff(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    features = models.JSONField(default=list)  # List of features included in the tariff
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Tariff'
        verbose_name_plural = 'Tariffs'
        ordering = ['price']

    def __str__(self):
        return f"{self.name} - ${self.price}" 
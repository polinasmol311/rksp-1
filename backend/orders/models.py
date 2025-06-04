from django.db import models
from django.conf import settings


class Order(models.Model):
    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    tariff = models.ForeignKey(
        'tariffs.Tariff',
        on_delete=models.PROTECT,
        related_name='orders'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW
    )
    project_name = models.CharField(max_length=200)
    project_description = models.TextField()
    reference_links = models.JSONField(default=list)  # List of reference website URLs
    requirements = models.TextField()
    deadline = models.DateField(null=True, blank=True)
    attachments = models.JSONField(default=list)  # List of attachment URLs
    comments = models.TextField(blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.project_name} ({self.status})"

    def soft_delete(self):
        self.is_deleted = True
        self.save()

    def restore(self):
        self.is_deleted = False
        self.save() 
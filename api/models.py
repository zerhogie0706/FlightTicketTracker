from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class Timestamp(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class BasicSetting(models.Model):
    basic_allowed = models.IntegerField(default=2)
    premium_allowed = models.IntegerField(default=10)


class UserProfile(Timestamp):
    LEVEL_CHOICES = [
        ('Basic', 'Basic'),
        ('Premium', 'Premium'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    level = models.CharField(max_length=32, choices=LEVEL_CHOICES, default='Basic')
    currency = models.CharField(max_length=3, default='TWD')
    phone_number = models.CharField(max_length=16)

    def __str__(self):
        return self.user.username


class TrackingRecord(Timestamp):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tracking_records')
    departure_id = models.CharField(max_length=8)
    arrival_id = models.CharField(max_length=8)
    outbound_date = models.DateField()
    return_date = models.DateField()
    airlines = models.CharField(max_length=8, null=True)
    expectation = models.IntegerField()
    lowest_price = models.IntegerField(null=True)
    current_lowest = models.IntegerField(null=True)
    is_active = models.BooleanField(default=True)

    def as_dict(self):
        return {
            "id": self.id,
            "departure_id": self.departure_id,
            "arrival_id": self.arrival_id,
            "outbound_date": self.outbound_date,
            "return_date": self.return_date,
            "airlines": self.airlines,
            "expectation": self.expectation,
            "lowest_price": self.lowest_price,
            "current_lowest": self.current_lowest,
        }

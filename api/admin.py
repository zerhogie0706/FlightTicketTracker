from django.contrib import admin
from .models import *

# Register your models here.
Models = [UserProfile, TrackingRecord, BasicSetting]
admin.site.register(Models)
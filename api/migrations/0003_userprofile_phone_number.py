# Generated by Django 5.1 on 2024-08-29 05:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_trackingrecord_current_lowest_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='phone_number',
            field=models.CharField(default='', max_length=16),
            preserve_default=False,
        ),
    ]

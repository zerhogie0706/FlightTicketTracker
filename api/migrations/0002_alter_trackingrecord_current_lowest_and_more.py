# Generated by Django 5.1 on 2024-08-29 05:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='trackingrecord',
            name='current_lowest',
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='trackingrecord',
            name='lowest_price',
            field=models.IntegerField(null=True),
        ),
    ]

# Generated by Django 2.2.18 on 2022-10-22 13:45
from django.contrib.postgres.operations import UnaccentExtension

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('schedule', '0008_remove_patient_phone_country_code'),
    ]

    operations = [
        UnaccentExtension(),
    ]

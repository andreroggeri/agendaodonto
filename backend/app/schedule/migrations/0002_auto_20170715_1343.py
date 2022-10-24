# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-07-15 16:43
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedule', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='schedule',
            name='notification_attempts',
        ),
        migrations.RemoveField(
            model_name='schedule',
            name='notification_status',
        ),
        migrations.AddField(
            model_name='dentist',
            name='sg_password',
            field=models.CharField(default='', max_length=255, verbose_name='Senha SMS Gateway'),
        ),
        migrations.AddField(
            model_name='dentist',
            name='sg_user',
            field=models.CharField(default='', max_length=255, verbose_name='Usuário SMS Gateway'),
        ),
        migrations.AddField(
            model_name='schedule',
            name='notification_task_id',
            field=models.CharField(default=None, max_length=50, null=True, verbose_name='ID Notificação'),
        ),
    ]
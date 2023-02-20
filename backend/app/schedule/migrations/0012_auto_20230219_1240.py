# Generated by Django 3.2.16 on 2023-02-19 15:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedule', '0011_alter_treatmentrequest_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='dentist',
            name='interodonto_password',
            field=models.CharField(default=None, max_length=255, null=True, verbose_name='Senha Interodonto'),
        ),
        migrations.AddField(
            model_name='dentist',
            name='interodonto_username',
            field=models.CharField(default=None, max_length=255, null=True, verbose_name='Usuário Interodonto'),
        ),
        migrations.AddField(
            model_name='treatmentrequest',
            name='patient_age',
            field=models.IntegerField(blank=True, default=None, null=True, verbose_name='Idade do paciente'),
        ),
    ]

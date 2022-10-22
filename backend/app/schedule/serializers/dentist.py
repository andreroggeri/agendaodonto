from rest_framework import serializers

from app.schedule.models.dentist import Dentist


class DentistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dentist
        fields = ('id', 'first_name', 'last_name', 'email', 'cro', 'sex', 'cro_state', 'device_token')

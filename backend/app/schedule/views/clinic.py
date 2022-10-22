from django.db.models import Q
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated

from app.schedule.models.clinic import Clinic
from app.schedule.models.patient import Patient
from app.schedule.serializers.clinic import ClinicSerializer, ClinicListSerializer
from app.schedule.serializers.patient import PatientSerializer


class ClinicList(ListCreateAPIView):
    """
    Lista de clinicas
    """
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Clinic.objects.filter(owner=self.request.user)

    def perform_create(self, serializer: ClinicSerializer):
        serializer.save(owner=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ClinicListSerializer
        else:
            return ClinicSerializer


class ClinicDetail(RetrieveUpdateDestroyAPIView):
    """
    Detalhes da clinica
    """
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Clinic.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ClinicListSerializer
        else:
            return ClinicSerializer


class ClinicPatients(ListAPIView):
    """
    Pacientes cadastrados na clinica
    """
    serializer_class = PatientSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = Patient.objects.filter(
            Q(clinic_id=self.kwargs.get('pk')),
            Q(clinic__dentists__pk=self.request.user.pk) |
            Q(clinic__owner=self.request.user)
        ).distinct()

        return queryset

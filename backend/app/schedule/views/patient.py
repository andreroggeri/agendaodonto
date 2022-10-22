from django.db.models import Q
from django_filters.rest_framework import FilterSet, CharFilter
from rest_framework import generics
from rest_framework import permissions

from app.schedule.models import Schedule
from app.schedule.models.patient import Patient
from app.schedule.serializers.patient import PatientSerializer, PatientListSerializer
from app.schedule.serializers.schedule import ScheduleSerializer


class PatientFilter(FilterSet):
    name = CharFilter(field_name='name', lookup_expr='icontains')
    last_name = CharFilter(field_name='last_name', lookup_expr='icontains')
    phone = CharFilter(field_name='phone', lookup_expr='icontains')
    full_name = CharFilter(field_name='full_name', method='search_by_full_name')

    def search_by_full_name(self, qs, name, value):
        for term in value.split():
            qs = qs.filter(Q(name__unaccent__icontains=term) | Q(last_name__unaccent__icontains=term))
        return qs

    class Meta:
        model = Patient
        fields = ['name', 'last_name', 'phone']


class PatientList(generics.ListCreateAPIView):
    """
    Lista de pacientes
    """
    permission_classes = (permissions.IsAuthenticated,)
    filter_class = PatientFilter

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PatientListSerializer
        else:
            return PatientSerializer

    def get_queryset(self):
        return Patient.objects.filter(
            Q(clinic__dentists__pk=self.request.user.pk) |
            Q(clinic__owner=self.request.user)
        ).distinct()


class PatientDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Detalhes do paciente
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PatientListSerializer
        else:
            return PatientSerializer

    def get_queryset(self):
        return Patient.objects.filter(
            Q(clinic__dentists__pk=self.request.user.pk) |
            Q(clinic__owner=self.request.user)
        ).distinct()


class PatientSchedule(generics.ListAPIView):
    """
    Agendamentos do paciente
    """
    serializer_class = ScheduleSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = Schedule.objects.filter(
            Q(patient=self.kwargs['pk']),
            Q(patient__clinic__owner=self.request.user) |
            Q(patient__clinic__dentists__in=[self.request.user]) |
            Q(dentist=self.request.user)
        ).distinct()

        return queryset

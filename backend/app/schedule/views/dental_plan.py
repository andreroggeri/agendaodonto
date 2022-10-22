from datetime import datetime

from django.db.models import Count, F
from django_filters.rest_framework import FilterSet, CharFilter
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from app.schedule.models import DentalPlan, Schedule
from app.schedule.serializers.dental_plan import DentalPlanSerializer


class DentalPlanFilter(FilterSet):
    name = CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = DentalPlan
        fields = ['name']


class DentalPlanList(ListCreateAPIView):
    """
    Lista de planos
    """
    serializer_class = DentalPlanSerializer
    queryset = DentalPlan.objects.all()
    permission_classes = (IsAuthenticated,)
    filter_class = DentalPlanFilter


class DentalPlanDetail(RetrieveUpdateDestroyAPIView):
    """
    Detalhe do plano
    """
    serializer_class = DentalPlanSerializer
    queryset = DentalPlan.objects.all()
    permission_classes = (IsAuthenticated,)


class DentalPlanStats(APIView):
    """
    Dados estatisticos de cada plano
    """

    permission_classes = (IsAuthenticated,)

    def get_stats(self, dentist, start_date: datetime, end_date: datetime):
        return Schedule.objects.filter(dentist=dentist) \
            .filter(date__date__range=(start_date, end_date)) \
            .values('patient__dental_plan__name') \
            .annotate(count=Count('*')) \
            .annotate(dental_plan=F('patient__dental_plan__name')) \
            .values('dental_plan', 'count')

    def get(self, request: Request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date is None or end_date is None:
            raise ValidationError({
                'error': 'start_date and end_date are required'
            })
        try:
            parsed_start_date = datetime.strptime(start_date, '%Y-%m-%d')
            parsed_end_date = datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError:
            raise ValidationError({
                'error': 'Invalid date provided'
            })

        return Response(self.get_stats(request.user, parsed_start_date, parsed_end_date))

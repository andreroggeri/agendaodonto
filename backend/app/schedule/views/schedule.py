import datetime

from dateutil.relativedelta import relativedelta
from django.db.models import Q
from django_filters import DateFromToRangeFilter
from django_filters.rest_framework import FilterSet
from rest_framework import permissions
from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListCreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from app.schedule.models import Dentist
from app.schedule.models import Schedule
from app.schedule.serializers import ScheduleListSerializer, ScheduleSerializer


class ScheduleFilter(FilterSet):
    date = DateFromToRangeFilter(field_name='date')

    class Meta:
        model = Schedule
        fields = ['date', 'status', 'dentist']


class ScheduleList(ListCreateAPIView):
    """
    Lista de agendametos
    """
    queryset = Schedule.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    filter_class = ScheduleFilter
    ordering = 'date'

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ScheduleListSerializer
        else:
            return ScheduleSerializer

    def get_queryset(self):
        return Schedule.objects.filter(
            Q(patient__clinic__owner=self.request.user) |
            Q(patient__clinic__dentists__in=[self.request.user]) |
            Q(dentist=self.request.user)
        ).distinct()


class ScheduleDetail(RetrieveUpdateDestroyAPIView):
    """
    Detalhes do agendamento
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Schedule.objects.filter(
            Q(patient__clinic__owner=self.request.user) |
            Q(patient__clinic__dentists__in=[self.request.user]) |
            Q(dentist=self.request.user)
        ).distinct()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ScheduleListSerializer
        else:
            return ScheduleSerializer


class ScheduleAttendance(APIView):
    @staticmethod
    def get_data(user: Dentist, date: datetime.datetime):
        data = {}
        current_date = date
        for _ in range(12):
            current_date = current_date - relativedelta(months=1)
            schedules = Schedule.objects \
                .filter(dentist=user) \
                .filter(date__year=current_date.year) \
                .filter(date__month=current_date.month)
            attendance = schedules.filter(status=1).count()
            absences = schedules.filter(status=2).count()
            cancellations = schedules.filter(status=3).count()
            ratio = 0 if attendance == 0 else attendance / (absences + cancellations + attendance)
            data[current_date.strftime('%Y-%m-01')] = {
                'attendances': attendance,
                'absences': absences,
                'cancellations': cancellations,
                'ratio': ratio
            }

        return data

    def get(self, request):
        request_date = request.query_params.get('date')
        if request_date:
            try:
                request_date = datetime.datetime.strptime(request_date, '%Y-%m-%d')
            except ValueError:
                request_date = datetime.datetime.now()
        else:
            request_date = datetime.datetime.now()

        return Response(self.get_data(request.user, request_date))


class ScheduleNotification(APIView):
    def update_schedule_status(self, user, schedule_id: int, new_status: int):
        schedule = Schedule.objects.filter(
            dentist=user,
            id=schedule_id
        ).first()

        if not schedule:
            return False

        schedule.notification_status = new_status
        schedule.save()
        return True

    def post(self, request, pk):
        schedule_id = int(pk)
        new_status = request.data.get('new_status', None)

        if new_status is not None:
            result = self.update_schedule_status(request.user, schedule_id, new_status)
            if result:
                return Response({'success': True}, status=200)
            else:
                return Response({'error': 'Unauthorized'}, status=403)
        else:
            return Response({'error': 'Bad request data'}, status=400)

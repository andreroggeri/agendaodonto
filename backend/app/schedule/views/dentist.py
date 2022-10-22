from rest_framework import permissions
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView

from app.schedule.models.dentist import Dentist
from app.schedule.serializers.dentist import DentistSerializer


class DentistList(ListAPIView):
    """
    Lista de Dentistas
    """
    serializer_class = DentistSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        cro = self.request.query_params.get('cro') if self.request.query_params.get('cro') else 0
        return Dentist.objects.filter(cro__contains=cro)


class DentistDetail(RetrieveUpdateAPIView):
    """
    Dentist view
    """
    serializer_class = DentistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

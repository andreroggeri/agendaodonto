from rest_framework import permissions
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from app.schedule.models.treatment_request import TreatmentRequest
from app.schedule.serializers.treatment_request import TreatmentRequestSerializer


class TreatmentRequestList(ListCreateAPIView):
    """
    Lista de solicitações de tratamento
    """
    queryset = TreatmentRequest.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = TreatmentRequestSerializer


class TreatmentRequestDetail(RetrieveUpdateDestroyAPIView):
    """
    Detalhes da solicitação de tratamento
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = TreatmentRequestSerializer

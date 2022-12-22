from rest_framework import permissions
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from app.schedule.models.treatment_request import TreatmentRequest
from app.schedule.permissions.api_key_permission import IsApiKeyValid
from app.schedule.serializers.treatment_request import TreatmentRequestSerializer


class TreatmentRequestList(ListCreateAPIView):
    """
    Lista de solicitações de tratamento
    """
    permission_classes = (permissions.IsAuthenticated | IsApiKeyValid,)
    serializer_class = TreatmentRequestSerializer

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return TreatmentRequest.objects.filter(dentist_phone=self.request.user.phone)
        else:
            return TreatmentRequest.objects.all()


class TreatmentRequestDetail(RetrieveUpdateDestroyAPIView):
    """
    Detalhes da solicitação de tratamento
    """
    permission_classes = (permissions.IsAuthenticated | IsApiKeyValid,)
    serializer_class = TreatmentRequestSerializer

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return TreatmentRequest.objects.filter(dentist_phone=self.request.user.phone)
        else:
            return TreatmentRequest.objects.all()

from django_filters import CharFilter
from django_filters.rest_framework import FilterSet
from rest_framework import permissions
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from app.schedule.models.treatment_request import TreatmentRequest, TreatmentRequestStatus
from app.schedule.permissions.api_key_permission import IsApiKeyValid
from app.schedule.serializers.treatment_request import TreatmentRequestSerializer
from app.schedule.tasks import submit_basic_treatment_request


class TreatmentRequestFilter(FilterSet):
    status = CharFilter(field_name='status')

    class Meta:
        model = TreatmentRequest
        fields = ['status']


class TreatmentRequestList(ListCreateAPIView):
    """
    Lista de solicitações de tratamento
    """
    permission_classes = (permissions.IsAuthenticated | IsApiKeyValid,)
    serializer_class = TreatmentRequestSerializer
    filter_class = TreatmentRequestFilter

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


class TreatmentRequestSubmit(APIView):
    def post(self, request, pk):
        treatment_request = TreatmentRequest.objects.get(pk=pk)
        treatment_request.status = TreatmentRequestStatus.SUBMITTING
        treatment_request.save()
        submit_basic_treatment_request.delay(pk)
        return Response(status=201)

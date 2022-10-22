from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, get_object_or_404
from rest_framework.permissions import IsAuthenticated

from app.finance.models import Transaction
from app.finance.serializers import TransactionSerializer
from app.schedule.models import Clinic


class InflowTransactionList(ListCreateAPIView):
    """
    Lista as transações de uma Clinica
    """
    serializer_class = TransactionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Transaction.objects \
            .filter(clinic__owner=self.request.user) \
            .filter(clinic=self.kwargs.get('clinic_id'))

    def perform_create(self, serializer: serializer_class):
        clinic = self._get_clinic()
        serializer.save(clinic=clinic)

    def list(self, request, *args, **kwargs):
        self._get_clinic()
        return super().list(request, *args, **kwargs)

    def _get_clinic(self) -> Clinic:
        return get_object_or_404(Clinic.objects
                                 .filter(owner=self.request.user)
                                 .filter(pk=self.kwargs.get('clinic_id')))


class InflowTransactionDetail(RetrieveUpdateDestroyAPIView):
    """
    Recupera/Apaga/Altera Transações de entrada (Crédito)
    """
    serializer_class = TransactionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Transaction.objects \
            .filter(clinic__owner=self.request.user) \
            .filter(clinic=self.kwargs.get('clinic_id'))

    def perform_update(self, serializer: serializer_class):
        clinic = get_object_or_404(Clinic.objects
                                   .filter(owner=self.request.user)
                                   .filter(pk=self.kwargs.get('clinic_id')))
        serializer.save(clinic=clinic)

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, get_object_or_404
from rest_framework.permissions import IsAuthenticated

from app.finance.models import TransactionType
from app.finance.serializers import TransactionTypeSerializer
from app.schedule.models import Clinic


def get_clinic_or_404(ctx):
    return get_object_or_404(Clinic, id=ctx.kwargs['clinic_id'], owner=ctx.request.user)


class TransactionTypeList(ListCreateAPIView):
    """
    Lista de Tipos de Transação
    """
    serializer_class = TransactionTypeSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return TransactionType.objects.filter(clinic__owner=self.request.user).filter(clinic=get_clinic_or_404(self))

    def perform_create(self, serializer):
        serializer.save(clinic=get_clinic_or_404(self))


class TransactionTypeDetail(RetrieveUpdateDestroyAPIView):
    """
    Recupera/Apaga/Altera Tipos de Transação
    """
    serializer_class = TransactionTypeSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return TransactionType.objects.filter(clinic__owner=self.request.user).filter(clinic=get_clinic_or_404(self))

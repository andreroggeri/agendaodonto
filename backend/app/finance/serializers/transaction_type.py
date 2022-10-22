from rest_framework.serializers import ModelSerializer

from app.finance.models import TransactionType


class TransactionTypeSerializer(ModelSerializer):
    class Meta:
        model = TransactionType
        fields = ('id', 'label', 'code')

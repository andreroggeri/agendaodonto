from rest_framework.serializers import ModelSerializer

from app.finance.models import Transaction


class TransactionSerializer(ModelSerializer):

    class Meta:
        model = Transaction
        fields = ('id', 'amount', 'payment_holder', 'service_beneficiary', 'description', 'date', 'type')

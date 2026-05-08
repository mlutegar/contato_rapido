from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for Client model with all required fields"""
    class Meta:
        model = Client
        fields = ['id', 'name', 'email', 'whatsapp', 'role', 'company_type', 'company_name']
        read_only_fields = ['id']


class GenerateTextSerializer(serializers.Serializer):
    """Serializer for validating generate text request body"""
    client_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        max_length=50,
        error_messages={
            'min_length': 'At least one client ID must be provided',
            'max_length': 'Cannot generate text for more than 50 clients at once'
        }
    )
    instruction = serializers.CharField(
        min_length=10,
        max_length=1000,
        error_messages={
            'min_length': 'Instruction must be at least 10 characters long',
            'max_length': 'Instruction cannot exceed 1000 characters'
        }
    )

    def validate_client_ids(self, value):
        """Validate that all client IDs exist in the database"""
        existing_ids = set(Client.objects.filter(id__in=value).values_list('id', flat=True))
        missing_ids = set(value) - existing_ids

        if missing_ids:
            raise serializers.ValidationError(
                f"The following client IDs do not exist: {', '.join(map(str, missing_ids))}"
            )

        return value

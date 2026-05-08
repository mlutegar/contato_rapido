from django.core.mail import send_mail
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Client
from .serializers import ClientSerializer, GenerateTextSerializer


class ClientViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing clients with optional filtering by role and company_type
    """
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

    def get_queryset(self):
        """Optionally filter clients by role and/or company_type"""
        queryset = super().get_queryset()

        role = self.request.query_params.get('role')
        company_type = self.request.query_params.get('company_type')

        if role:
            queryset = queryset.filter(role__iexact=role)

        if company_type:
            queryset = queryset.filter(company_type__iexact=company_type)

        return queryset


class FilterOptionsView(APIView):
    """Returns distinct values for role and company_type fields"""

    def get(self, request):
        """Get all distinct roles and company_types from the database"""
        roles = list(Client.objects.values_list('role', flat=True).distinct().order_by('role'))
        company_types = list(
            Client.objects.values_list('company_type', flat=True).distinct().order_by('company_type')
        )

        return Response({
            'roles': roles,
            'company_types': company_types
        })


class GenerateTextView(APIView):
    """Generates personalized sales messages (mock implementation)"""

    def post(self, request):
        """
        Generate personalized messages for clients (returns predefined examples)

        Request body:
        {
            "client_ids": [1, 2, 3],
            "instruction": "custom instruction for the message"
        }

        Returns:
        [
            {
                "client_id": 1,
                "name": "Client Name",
                "generated_text": "Generated message..."
            }
        ]
        """
        # Validate request body
        serializer = GenerateTextSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        client_ids = serializer.validated_data['client_ids']
        instruction = serializer.validated_data['instruction']

        # Fetch clients
        clients = Client.objects.filter(id__in=client_ids)

        # Mock predefined messages
        mock_messages = [
            "Prezado(a) {name},\n\nComo {role} da {company_name}, compreendo que buscar soluções inovadoras é essencial para o crescimento de uma empresa do setor de {company_type}. Gostaria de apresentar nossa abordagem que tem ajudado empresas como a sua a alcançarem resultados excepcionais.\n\nTeria disponibilidade para uma breve conversa de 15 minutos na próxima semana? Posso compartilhar alguns cases de sucesso do setor de {company_type} que acredito que serão do seu interesse.",

            "Olá, {name}!\n\nNotamos que a {company_name} tem se destacado no mercado de {company_type} e gostaríamos de explorar possíveis sinergias. Nossa solução já auxiliou diversos profissionais na posição de {role} a otimizarem processos e reduzirem custos significativamente.\n\nGostaria de saber mais sobre como podemos contribuir especificamente para os desafios atuais da {company_name}? Estou à disposição para agendar uma demonstração personalizada.",

            "Caro(a) {name},\n\nEspero que este e-mail o encontre bem. Como {role} da {company_name}, você certamente enfrenta o desafio de manter a competitividade no setor de {company_type}. Nossa empresa desenvolveu uma metodologia exclusiva que endereça exatamente esses pontos de dor.\n\nPosso enviar um material exclusivo sobre como empresas de {company_type} estão transformando seus processos? Ficaria feliz em adaptar o conteúdo according à sua realidade específica na {company_name}."
        ]

        results = []

        # Generate text for each client
        for i, client in enumerate(clients):
            # Use a predefined message based on client index (cycles through messages)
            message_template = mock_messages[i % len(mock_messages)]

            # Personalize the message
            generated_text = message_template.format(
                name=client.name.split()[0],  # Use first name only
                role=client.role,
                company_type=client.company_type,
                company_name=client.company_name
            )

            results.append({
                'client_id': client.id,
                'name': client.name,
                'generated_text': generated_text
            })

        return Response(results, status=status.HTTP_200_OK)


class SendEmailView(APIView):
    """Sends email to a client with the generated text"""

    def post(self, request):
        """
        Send email to a client

        Request body:
        {
            "client_id": 1,
            "text": "Generated message text...",
            "email": "client@example.com"
        }

        Returns:
        {"success": true}
        """
        client_id = request.data.get('client_id')
        text = request.data.get('text')
        email = request.data.get('email')

        if not all([client_id, text, email]):
            return Response(
                {'error': 'client_id, text, and email are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if client.email != email:
            return Response(
                {'error': 'Email does not match client email'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            send_mail(
                subject='Mensagem para você',
                message=text,
                from_email=None,
                recipient_list=[email],
                fail_silently=False,
            )
            return Response({'success': True}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

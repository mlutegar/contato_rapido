from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, FilterOptionsView, GenerateTextView, SendEmailView

# Create router for ViewSet
router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')

urlpatterns = [
    # ViewSet routes (including /api/clients/ and /api/clients/{id}/)
    path('', include(router.urls)),

    # Custom endpoints
    path('filters/', FilterOptionsView.as_view(), name='filter-options'),
    path('generate-text/', GenerateTextView.as_view(), name='generate-text'),
    path('send-email/', SendEmailView.as_view(), name='send-email'),
]

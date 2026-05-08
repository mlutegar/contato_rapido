from django.db import models


class Client(models.Model):
    name = models.CharField(max_length=200)
    email = models.CharField(max_length=255, unique=True)
    whatsapp = models.CharField(max_length=13)
    role = models.CharField(max_length=50)
    company_type = models.CharField(max_length=50)
    company_name = models.CharField(max_length=255)

    class Meta:
        verbose_name = "Client"
        verbose_name_plural = "Clients"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.company_name}"

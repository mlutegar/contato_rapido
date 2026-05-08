import pandas as pd
from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import Client


class Command(BaseCommand):
    help = 'Import clients from clients.csv file'

    def handle(self, *args, **kwargs):
        # Read CSV file
        csv_path = settings.BASE_DIR / 'clients.csv'

        if not csv_path.exists():
            self.stdout.write(
                self.style.ERROR(f'CSV file not found: {csv_path}')
            )
            return

        try:
            df = pd.read_csv(csv_path)
            self.stdout.write(f'Reading {len(df)} rows from {csv_path}')
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error reading CSV: {e}')
            )
            return

        # Get existing emails
        existing_emails = set(Client.objects.values_list('email', flat=True))
        self.stdout.write(f'Found {len(existing_emails)} existing clients in database')

        # Filter new clients
        new_clients = []
        skipped_emails = []

        for _, row in df.iterrows():
            if row['email'] not in existing_emails:
                new_clients.append(Client(
                    name=row['name'],
                    email=row['email'],
                    whatsapp=str(row['whatsapp']),  # Ensure whatsapp is string
                    role=row['role'],
                    company_type=row['company_type'],
                    company_name=row['company_name']
                ))
            else:
                skipped_emails.append(row['email'])

        # Bulk create new clients
        if new_clients:
            try:
                Client.objects.bulk_create(new_clients, batch_size=100)
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully imported {len(new_clients)} new clients')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error importing clients: {e}')
                )
                return
        else:
            self.stdout.write('No new clients to import')

        # Summary
        total = len(df)
        new_count = len(new_clients)
        skipped_count = len(skipped_emails)

        self.stdout.write('\n' + '='*50)
        self.stdout.write('IMPORT SUMMARY')
        self.stdout.write('='*50)
        self.stdout.write(f'Total rows in CSV: {total}')
        self.stdout.write(f'New clients imported: {new_count}')
        self.stdout.write(f'Skipped (already exists): {skipped_count}')
        self.stdout.write(f'Total clients in database: {Client.objects.count()}')
        self.stdout.write('='*50)

        if skipped_count > 0:
            self.stdout.write(f'\nSkipped emails: {", ".join(skipped_emails[:5])}')
            if skipped_count > 5:
                self.stdout.write(f'... and {skipped_count - 5} more')

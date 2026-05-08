import { Client, ClientFilters, FilterOptions, GeneratedTextResult } from '../types/index';

const BASE_URL = 'http://localhost:8173';

export const api = {
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await fetch(`${BASE_URL}/api/filters/`);
    if (!response.ok) throw new Error('Failed to fetch filter options');
    return response.json();
  },

  async getClients(filters?: ClientFilters): Promise<Client[]> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.company_type) params.append('company_type', filters.company_type);

    const url = `${BASE_URL}/api/clients/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch clients');
    return response.json();
  },

  async generateTexts(clientIds: number[], instruction: string): Promise<GeneratedTextResult[]> {
    const response = await fetch(`${BASE_URL}/api/generate-text/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_ids: clientIds, instruction }),
    });
    if (!response.ok) throw new Error('Failed to generate texts');
    return response.json();
  },

  async sendEmail(clientId: number, text: string, email: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/send-email/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, text, email }),
    });
    if (!response.ok) throw new Error('Failed to send email');
  },
};

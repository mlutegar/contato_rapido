export interface Client {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  role: string;
  company_type: string;
  company_name: string;
}

export interface FilterOptions {
  roles: string[];
  company_types: string[];
}

export interface ClientFilters {
  role?: string;
  company_type?: string;
}

export interface GeneratedTextResult {
  client_id: number;
  name: string;
  generated_text: string;
}

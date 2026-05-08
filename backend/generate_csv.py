import pandas as pd
import random
from pathlib import Path

# Brazilian first names
FIRST_NAMES = [
    'João', 'Maria', 'José', 'Ana', 'Carlos', 'Paulo', 'Luciana', 'Roberto',
    'Fernanda', 'Marcos', 'Patricia', 'Ricardo', 'Juliana', 'Luiz', 'Camila',
    'Pedro', 'Mariana', 'Gabriel', 'Bruna', 'Rafael', 'Carla', 'Felipe',
    'Amanda', 'Gustavo', 'Daniela', 'Thiago', 'Beatriz', 'André', 'Renata',
    'Eduardo', 'Larissa', 'Leonardo', 'Vanessa', 'Rodrigo', 'Priscila',
    'Fernando', 'Tatiana', 'Marcelo', 'Cristina', 'Lucas', 'Simone', 'Alexandre',
    'Monica', 'Rogério', 'Adriana', 'Sergio', 'Renata', 'Claudio', 'Veronica'
]

# Brazilian last names
LAST_NAMES = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Almeida',
    'Costa', 'Pereira', 'Lima', 'Gomes', 'Ribeiro', 'Martins', 'Carvalho',
    'Lopes', 'Barbosa', 'Araujo', 'Rocha', 'Nascimento', 'Dias', 'Nunes',
    'Mendes', 'Moreira', 'Teixeira', 'Vieira', 'Cardoso', 'Fernandes',
    'Cavalcanti', 'Correia', 'Pinto', 'Ramos', 'Borges', 'Monteiro'
]

# Brazilian area codes
AREA_CODES = ['11', '21', '31']  # SP, RJ, MG

# Roles
ROLES = [
    'CEO', 'CFO', 'CTO', 'Gerente Comercial', 'Diretor de Marketing',
    'Gerente de TI', 'Sócio-Proprietário', 'Coordenador de Compras'
]

# Company types
COMPANY_TYPES = [
    'Indústria', 'Varejo', 'Serviços', 'Tecnologia', 'Saúde',
    'Educação', 'Agronegócio', 'Financeiro'
]

# Company name patterns by type
COMPANY_PATTERNS = {
    'Indústria': [
        'Indústria {name}', '{name} Indústria e Comércio', 'Metalúrgica {name}',
        '{name} Produtos Industriais', 'Fábrica {name}', '{name} Componentes'
    ],
    'Varejo': [
        '{name} Supermercados', 'Lojas {name}', '{name} Varejo', 'Mega {name}',
        '{name} Atacado', '{name} Comércio'
    ],
    'Serviços': [
        '{name} Serviços', '{name} Soluções', '{name} Consultoria',
        '{name} Assistência', '{name} Manutenção', '{name} Serv'
    ],
    'Tecnologia': [
        '{name} Tech', '{name} Sistemas', '{name} Software',
        '{name} Digital Solutions', '{name} TI', '{name} Labs'
    ],
    'Saúde': [
        'Hospital {name}', 'Clínica {name}', '{name} Saúde',
        'Laboratório {name}', '{name} Médico', 'Centro {name}'
    ],
    'Educação': [
        'Escola {name}', '{name} Educação', 'Colégio {name}',
        '{name} Ensino', 'Faculdade {name}', '{name} Cursos'
    ],
    'Agronegócio': [
        'Fazenda {name}', '{name} Agro', 'Agro {name}',
        '{name} Agronegócio', '{name} Produtos Rurais', 'Sítio {name}'
    ],
    'Financeiro': [
        'Banco {name}', '{name} Financeira', '{name} Investimentos',
        '{name} Corretora', '{name} Capital', '{name} Crédito'
    ]
}

def generate_brazilian_client():
    """Generate a single Brazilian client record."""
    # Generate name
    first_name = random.choice(FIRST_NAMES)
    last_name1 = random.choice(LAST_NAMES)
    last_name2 = random.choice(LAST_NAMES)
    name = f"{first_name} {last_name1} {last_name2}"

    # Generate role
    role = random.choice(ROLES)

    # Generate company type and name
    company_type = random.choice(COMPANY_TYPES)
    company_pattern = random.choice(COMPANY_PATTERNS[company_type])
    company_base_name = random.choice(LAST_NAMES)
    company_name = company_pattern.format(name=company_base_name)

    # Generate email
    # Convert name to lowercase and replace spaces with dots
    name_parts = name.lower().split()
    email_username = '.'.join(name_parts)
    # Extract domain from company name (simplified)
    company_domain = company_name.lower().split()[0]
    email = f"{email_username}@{company_domain}.com.br"

    # Generate WhatsApp number (13 digits: 55 + area_code + 9-digit mobile)
    area_code = random.choice(AREA_CODES)
    # Generate 9-digit mobile number (standard Brazilian format)
    mobile_digits = '9' + ''.join([str(random.randint(0, 9)) for _ in range(8)])
    whatsapp = f"55{area_code}{mobile_digits}"

    return {
        'name': name,
        'email': email,
        'whatsapp': whatsapp,
        'role': role,
        'company_type': company_type,
        'company_name': company_name
    }

def main():
    """Generate CSV file with Brazilian client data."""
    # Generate 200 clients
    clients = [generate_brazilian_client() for _ in range(200)]

    # Create DataFrame
    df = pd.DataFrame(clients)

    # Save to CSV
    output_path = Path(__file__).parent / 'clients.csv'
    df.to_csv(output_path, index=False)

    print(f"[OK] Generated {len(clients)} Brazilian clients")
    print(f"[OK] Saved to: {output_path}")
    print(f"[OK] Columns: {', '.join(df.columns.tolist())}")

    # Show sample data
    print(f"\n[INFO] Sample data (first 3 rows):")
    print(df.head(3).to_string(index=False))

    # Verify data quality
    print(f"\n[OK] Data quality checks:")
    print(f"  - All emails have @: {df['email'].str.contains('@').all()}")
    print(f"  - All whatsapp start with 55: {df['whatsapp'].str.startswith('55').all()}")
    print(f"  - All whatsapp length is 13: {(df['whatsapp'].str.len() == 13).all()}")
    print(f"  - Unique emails: {df['email'].nunique()} == {len(df)}: {df['email'].nunique() == len(df)}")

if __name__ == '__main__':
    main()

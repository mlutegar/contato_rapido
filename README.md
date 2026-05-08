# Outreach MVP

A full-stack application with Django REST Framework backend and React TypeScript frontend.

## Project Structure

```
contatoVictor/
├── backend/              # Django + DRF backend
│   ├── outreach_backend/ # Django project settings
│   ├── api/              # Django app
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
├── frontend/             # React + TypeScript + Vite frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Backend Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your actual values:
```
ANTHROPIC_API_KEY=your_api_key_here
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_HOST_USER=your_email_user
EMAIL_HOST_PASSWORD=your_email_password
```

6. Run migrations:
```bash
python manage.py migrate
```

7. Start the development server:
```bash
python manage.py runserver 8173
```

The backend will be available at `http://localhost:8173`

## Frontend Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Running Both Servers

To run both servers simultaneously, open two separate terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8173
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework** - API toolkit
- **django-cors-headers** - CORS handling
- **python-dotenv** - Environment variable management
- **Anthropic SDK** - AI integration
- **SQLite** - Database (default)

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

## Development

### Backend Development
- Create new apps: `python manage.py startapp <app_name>`
- Run migrations: `python manage.py makemigrations` && `python manage.py migrate`
- Create superuser: `python manage.py createsuperuser`
- Access admin panel: `http://localhost:8173/admin`

### Frontend Development
- Component files go in `src/`
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## API Endpoints

The backend API will be available at `http://localhost:8173/api/` (to be implemented)

## License

This project is open source and available for educational purposes.

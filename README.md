# StockTake

StockTake is a full-stack inventory management application. It combines a React/Vite frontend, a Django REST API, PostgreSQL, and Firebase Authentication.

## Features

- Firebase email/password and Google authentication
- Product, category, supplier, warehouse, transaction, sales, and purchase-order management
- Role-based access for admins, managers, and staff
- Dashboard statistics, sales summaries, and low-stock alerts
- Swagger and ReDoc API documentation
- Docker Compose for local services
- Render deployment configuration for the backend and frontend

## Stack

- Frontend: React 18, Vite, React Router, Tailwind CSS, Axios, React Query
- Backend: Django 4.2, Django REST Framework, Gunicorn
- Authentication: Firebase Authentication and Firebase Admin SDK
- Data: SQLite for local development or PostgreSQL in production
- Hosting: Render, with Nginx available for Docker-based frontend hosting

## Project Layout

```text
StockTake_Project/
├── backend/
│   ├── StockTake/             # Django project configuration
│   ├── api/                   # REST API application
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/                   # React application
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── render.yaml
└── README.md
```

## Requirements

- Node.js 20 or later and npm
- Python 3.11 or later
- Docker and Docker Compose (optional)
- A Firebase project for authentication

## Local Development

### 1. Configure frontend variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

The Firebase values must come from the Firebase console. Do not commit real credentials or private service-account files.

### 2. Start the backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py runserver
```

The API runs at `http://localhost:8000`.

### 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

The frontend runs at `http://localhost:5173`.

### 4. Create an administrator

```bash
cd backend
.venv/bin/python manage.py createsuperuser
```

Firebase-authenticated users receive their application role through the API profile. The backend must have valid Firebase Admin credentials for production authentication.

## Docker Compose

Docker Compose starts the frontend, backend, PostgreSQL, and Redis services:

```bash
docker compose build
docker compose up -d
docker compose exec backend python manage.py migrate
docker compose ps
```

Useful commands:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
```

The Compose setup uses PostgreSQL at `db:5432` and Redis at `redis:6379`. A root `.env` file can provide Firebase and other local secrets; it is optional for Compose configuration validation but required for authentication.

## Frontend Routes

- `/login` - Firebase sign-in
- `/` - authenticated dashboard
- `/products` - product list and product creation
- `/inventory` - stock control
- `/sales` - record sales and view recent invoices
- `/reports` - sales analytics
- `/admin/users` - admin-only user role management

## API Routes

The backend base URL is `/api/`:

- `/api/products/`
- `/api/categories/`
- `/api/suppliers/`
- `/api/warehouses/`
- `/api/transactions/`
- `/api/sales/`
- `/api/purchase-orders/`
- `/api/users/`
- `/api/user/role/`

Service and documentation endpoints:

- `/` - API status information
- `/health/` - Render health check
- `/swagger/` - Swagger UI
- `/redoc/` - ReDoc
- `/admin/` - Django admin

## Testing and Builds

Backend checks and tests:

```bash
cd backend
.venv/bin/python manage.py check
.venv/bin/python manage.py test
```

Frontend production build:

```bash
cd frontend
npm run build
```

## Deploying to Render

The root `render.yaml` defines both services:

- `stocktake-api` builds from `backend` and runs Django with Gunicorn.
- `stocktake-frontend` builds from `frontend`, publishes `dist`, and rewrites browser routes to `index.html` for React Router.

Create a Render Blueprint from this repository. The frontend build uses:

```text
npm ci && npm run build
```

The deployed frontend uses this backend API:

```text
https://stockpulse-backend-2iy4.onrender.com/api
```

If Render assigns a different public frontend URL, add it to the backend `CORS_ALLOWED_ORIGINS` environment variable. Keep `DEBUG=false` and provide `DJANGO_SECRET_KEY`, `DATABASE_URL`, `FIREBASE_CREDENTIALS`, and the appropriate CORS and CSRF origins in Render.

## Security Notes

- Never commit Firebase service-account credentials, `.env` files, or production secrets.
- Use a strong `DJANGO_SECRET_KEY` in production.
- Keep `DEBUG=false` in production.
- Restrict `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` to real domains.
- Use HTTPS for deployed frontend and backend traffic.

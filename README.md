# StockTake

StockTake is an inventory and sales workspace for small teams. Staff can browse products and record sales; managers can maintain products and review low stock; admins can also review analytics and manage user roles.

## Features

- Firebase email/password and Google sign-in
- Role-aware dashboard and navigation for staff, managers, and admins
- Product catalogue, stock alerts, sales recording, and sales summaries
- Django REST API with Swagger and ReDoc documentation
- PostgreSQL in production, with SQLite available for local development
- Deployment configuration for Render and Vercel

## Stack

- Frontend: React 18, Vite, React Router, Tailwind CSS, Axios, React Query, Recharts
- Backend: Django 4.2, Django REST Framework, Gunicorn
- Authentication: Firebase Authentication and Firebase Admin SDK
- Database: PostgreSQL in production; SQLite for local development

## Repository layout

```text
StockTake_Project/
├── backend/                 # Django API
├── frontend/                # React/Vite single-page app
├── docker-compose.yml       # Local containers
├── render.yaml              # Render API and static-site blueprint
├── vercel.json              # Vercel config when deploying from repository root
└── README.md
```

## Requirements

- Node.js 20+ and npm
- Python 3.11+
- A Firebase project with Email/Password and Google providers enabled
- Docker Compose (optional)

## Local development

### Configure environment

Create `frontend/.env.local` with the Firebase web app configuration and local API URL:

```env
VITE_API_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Create `backend/.env` with local Django settings and Firebase Admin credentials:

```env
DEBUG=true
DJANGO_SECRET_KEY=replace-with-a-local-secret
FIREBASE_CREDENTIALS=<full Firebase Admin service account JSON>
```

Provide `FIREBASE_CREDENTIALS` as the complete JSON string (with private key newlines preserved or escaped). Never commit real credentials or `.env` files.

### Run the backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py runserver
```

The API is available at `http://localhost:8000`. In a separate terminal:

```bash
cd frontend
npm ci
npm run dev
```

The frontend is available at `http://localhost:5173`.

### Docker Compose

```bash
docker compose up --build
docker compose exec backend python manage.py migrate
```

The Compose stack includes the frontend, API, PostgreSQL, and Redis. Configure required Firebase and Django environment values before using authenticated features.

## Frontend routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/login` | Public | Sign in with Firebase |
| `/` | All signed-in users | Dashboard and quick links |
| `/products` | All signed-in users | Browse products; managers/admins can add products |
| `/sales` | All signed-in users | Record sales and view recent invoices |
| `/inventory` | Managers and admins | Review low-stock items |
| `/reports` | Admins | Sales and inventory summaries |
| `/admin/users` | Admins | Manage team roles |

## API endpoints

The API is mounted at `/api/`. Main resources include `/products/`, `/categories/`, `/suppliers/`, `/warehouses/`, `/transactions/`, `/sales/`, `/purchase-orders/`, and `/users/`.

Service endpoints are `/health/`, `/swagger/`, `/redoc/`, and `/admin/`. The backend root `/` provides API status information.

## Deploying the frontend to Vercel

Two project-root choices are supported:

1. **Repository root (recommended):** keep Vercel's Root Directory as `./`. The root `vercel.json` installs from `frontend`, runs its production build, publishes `frontend/dist`, and rewrites client-side routes to `index.html`.
2. **Frontend directory:** set Root Directory to `frontend`. The frontend `vercel.json` runs `npm ci` and `npm run build`, publishes `dist`, and applies the same single-page-app rewrite.

Configure these environment variables in Vercel for **Production, Preview, and Development** as needed:

```env
VITE_API_URL=https://your-backend-domain/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Vite embeds `VITE_*` values during the build, so changing them requires a new deployment. Add each deployed Vercel domain to Firebase Authentication's authorized domains. Also add the frontend origin to the backend's `CORS_ALLOWED_ORIGINS` and, where required, `CSRF_TRUSTED_ORIGINS`.

## Deploying the backend to Render

The root `render.yaml` defines a Django web service and a static frontend service. To deploy only the API, create the Blueprint and supply a PostgreSQL `DATABASE_URL`, `DJANGO_SECRET_KEY`, Firebase Admin `FIREBASE_CREDENTIALS`, and allowed frontend origins. The API health check is `/health/`.

When deploying the frontend separately to Vercel, configure `VITE_API_URL` with the Render API's `/api` URL and add the Vercel domain to the API's CORS and CSRF origin settings. Render's static frontend is optional if Vercel hosts the frontend.

## GitHub Actions and automatic deployment

GitHub Actions checks the Django backend, builds the Vite frontend, and builds both Docker images without publishing them to Docker Hub. Vercel and Render handle deployment through their Git integrations when those projects are connected to this repository and configured to deploy from `main`. The CI workflow does not require Docker Hub credentials or Render API secrets.

## Build and checks

```bash
cd frontend
npm ci
npm run build
```

```bash
cd backend
python manage.py check
```

## Security

- Never commit `.env` files, Firebase service-account JSON, or production secrets.
- Use a strong `DJANGO_SECRET_KEY`, `DEBUG=false`, HTTPS, and restricted host/origin lists in production.
- Firebase web config is public client configuration; protect access with Firebase authorized domains and backend authentication/permissions.

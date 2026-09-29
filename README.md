# 📊 StockPulse - Stock Management System

A full-stack stock management and portfolio tracking application built with React, Django, and Firebase.

## 🚀 Features

- **User Authentication**: Firebase authentication with email/password login
- **Stock Management**: Track and manage stock portfolios
- **Real-time Updates**: Live stock price updates (if configured)
- **User Dashboard**: Personalized dashboard for each user
- **Customer Management**: Manage customer accounts and profiles
- **Responsive Design**: Mobile-friendly interface
- **Dockerized**: Easy deployment with Docker Compose

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite
- **Firebase Authentication**
- **CSS3** with modern styling
- **Axios** for API calls
- **React Router** for navigation

### Backend
- **Django 4** with Django REST Framework
- **PostgreSQL** for production database
- **Redis** for caching and session management
- **JWT** or Session-based authentication

### DevOps
- **Docker** and **Docker Compose**
- **Nginx** for serving frontend
- **Gunicorn** for Django WSGI server

## 📋 Prerequisites

- **Docker** and **Docker Compose** installed
- **Firebase** account (for authentication)
- **Git** (for cloning the repository)
- At least **4GB RAM** and **10GB free disk space**

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd StockPulse_Project
```

### 2. Environment Variables

Create a `.env` file in the frontend directory:

```bash
nano frontend/.env
```

Add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Backend Configuration

Create a `.env` file in the backend directory (if needed):

```bash
nano backend/.env
```

```env
DEBUG=True
SECRET_KEY=your_django_secret_key
DATABASE_URL=postgresql://postgres:postgres@db:5432/stockpulse
REDIS_URL=redis://redis:6379/0
```

### 4. Build and Run with Docker

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Check if all containers are running
docker-compose ps
```

### 5. Database Migrations

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create a superuser (admin)
docker-compose exec backend python manage.py createsuperuser
```

### 6. Access the Application

- **Frontend**: http://localhost or http://192.168.0.101
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **Database**: localhost:5432 (PostgreSQL)
- **Redis**: localhost:6379

## 🎯 Usage

### Customer Login

1. Open http://localhost in your browser
2. Click on "Login" or "Sign Up"
3. Enter your credentials (or create a new account)
4. You'll be redirected to your dashboard

### Creating a Test User

```bash
# Create a test user via Django shell
docker-compose exec backend python manage.py shell

# In the Python shell:
from django.contrib.auth.models import User
User.objects.create_user('customer1', 'customer@example.com', 'password123')
exit()
```

### Viewing Stock Data

1. Log in as a customer
2. Navigate to the "Stocks" or "Dashboard" section
3. View stock lists, prices, and portfolio

## 📁 Project Structure

```
StockPulse_Project/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── firebase.js      # Firebase configuration
│   │   └── App.jsx          # Main App component
│   ├── .env                 # Environment variables
│   ├── Dockerfile           # Frontend Docker configuration
│   ├── nginx.conf           # Nginx configuration
│   └── package.json         # Dependencies
├── backend/                 # Django backend
│   ├── stockpulse/          # Main Django project
│   ├── api/                 # API endpoints
│   ├── manage.py            # Django management script
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Backend Docker configuration
├── docker-compose.yml       # Docker Compose configuration
└── README.md               # This file
```

## 🐳 Docker Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| Frontend | stockpulse-frontend | 80 | React app served by Nginx |
| Backend | stockpulse-backend | 8000 | Django API server |
| Database | stockpulse-db | 5432 | PostgreSQL database |
| Redis | stockpulse-redis | 6379 | Redis cache |

## 🔧 Common Commands

### Docker Management

```bash
# View all containers
docker-compose ps

# View logs for a specific service
docker-compose logs frontend
docker-compose logs backend

# Stop all containers
docker-compose down

# Stop and remove volumes (⚠️ removes all data)
docker-compose down -v

# Rebuild a specific service
docker-compose build --no-cache frontend

# Restart a service
docker-compose restart backend

# Execute commands in a container
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Django Management
# Run Django shell
docker-compose exec backend python manage.py shell

# Create a superuser
docker-compose exec backend python manage.py createsuperuser

# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic
```

## 🐛 Troubleshooting

### Common Issues

#### 1. **Firebase Authentication Error**
```
Uncaught FirebaseError: Firebase: Error (auth/invalid-api-key)
```
**Solution**: Ensure your `frontend/.env` file has valid Firebase credentials.

#### 2. **Port Already in Use**
```
ERROR: failed to bind host port 0.0.0.0:5432/tcp: address already in use
```
**Solution**: Stop the local PostgreSQL service:
sudo systemctl stop postgresql
```

#### 3. **Blank Page / App Not Loading**
- Check browser console (F12) for errors
- Verify all containers are running: `docker-compose ps`
- Check frontend logs: `docker-compose logs frontend`
- Ensure Firebase credentials are correct

#### 4. **Database Connection Issues**
# Restart the database
docker-compose restart db

# Check database logs
docker-compose logs db
```

#### 5. **Docker Build Fails**
```bash
# Restart Docker
sudo systemctl restart docker

# Pull images manually
docker pull node:18-alpine
docker pull python:3.10-slim
docker pull postgres:15
docker pull redis:alpine
```

### Network Issues

If you can't access the app:

```bash
# Check your IP address
ip addr show | grep -oP '(?<=inet\s)\d+\.\d+\.\d+\.\d+' | grep -v 127.0.0.1

# Try accessing via IP instead of localhost
http://YOUR_IP_ADDRESS
```

## 🔒 Security Notes

- **Change default passwords** in production
- **Enable HTTPS** with SSL certificates
- **Set `DEBUG=False`** in Django for production
- **Use environment variables** for sensitive data
- **Regularly update** dependencies

## 🚀 Deployment

### Production Checklist

1. Update `DEBUG=False` in Django settings
2. Set strong `SECRET_KEY`
3. Configure proper `ALLOWED_HOSTS`
4. Set up SSL/TLS certificate
5. Use a production database (managed PostgreSQL)
6. Set up proper logging
7. Configure CORS settings properly

### Using a Production Database

Update the backend `.env`:

```env
DATABASE_URL=postgresql://user:password@production-db-host:5432/stockpulse
```

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login/` | POST | User login |
| `/api/auth/register/` | POST | User registration |
| `/api/stocks/` | GET | List all stocks |
| `/api/stocks/:id/` | GET | Get stock details |
| `/api/portfolio/` | GET | User's portfolio |
| `/api/transactions/` | POST | Create transaction |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/development`)
3. Commit your changes (`git commit -m 'Add developement'`)
4. Push to the branch (`git push origin feature/development`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support, please contact:
- Email: janenyasoro@gmail.com


## Acknowledgments

- Firebase for authentication
- Docker for containerization
- React and Django communities
- All open-source contributors


# Design Studio Backend

This is the backend API for the Design Studio website. It's built with Django and Django REST Framework.

## Features

- User Authentication with JWT
- User Profile Management
- Order Management System
- Tariff Management
- Admin Interface
- API Documentation with Swagger/ReDoc
- PostgreSQL Database

## Prerequisites

- Python 3.8+
- PostgreSQL
- Virtual Environment

## Setup

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with the following content:
```
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000

# Database settings
DB_NAME=design_studio_db
DB_USER=postgres
DB_PASSWORD=your-password-here
DB_HOST=localhost
DB_PORT=5432

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=5
JWT_REFRESH_TOKEN_LIFETIME=1
```

5. Create the PostgreSQL database:
```sql
CREATE DATABASE design_studio_db;
```

6. Apply migrations:
```bash
python manage.py migrate
```

7. Create a superuser:
```bash
python manage.py createsuperuser
```

8. Run the development server:
```bash
python manage.py runserver
```

## API Documentation

- Swagger UI: http://localhost:8000/swagger/
- ReDoc: http://localhost:8000/redoc/

## API Endpoints

### Authentication
- POST /api/v1/users/token/ - Obtain JWT token
- POST /api/v1/users/token/refresh/ - Refresh JWT token
- POST /api/v1/users/register/ - Register new user

### User Management
- GET /api/v1/users/me/ - Get current user details
- PUT /api/v1/users/me/update/ - Update user profile
- DELETE /api/v1/users/me/delete/ - Delete user account

### Orders
- GET /api/v1/orders/ - List user's orders
- POST /api/v1/orders/ - Create new order
- GET /api/v1/orders/{id}/ - Get order details
- PUT /api/v1/orders/{id}/update/ - Update order
- DELETE /api/v1/orders/{id}/delete/ - Delete order

### Tariffs
- GET /api/v1/tariffs/ - List available tariffs
- GET /api/v1/tariffs/{id}/ - Get tariff details

## Testing

Run tests with:
```bash
pytest
```

## Admin Interface

Access the admin interface at http://localhost:8000/admin/ with your superuser credentials. 
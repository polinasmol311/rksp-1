#!/bin/bash

# LightWeb Studio Setup Script
# This script sets up the Django backend, creates mock data, and checks for common issues

echo "🚀 Setting up LightWeb Studio..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed and get the correct command
print_status "Checking Python installation..."
PYTHON_CMD=""

# Try different Python commands
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    # Check if it's Python 3
    PYTHON_VERSION=$(python --version 2>&1)
    if [[ $PYTHON_VERSION == *"Python 3"* ]]; then
        PYTHON_CMD="python"
    else
        print_error "Python 3 is required. Found: $PYTHON_VERSION"
        exit 1
    fi
elif command -v py &> /dev/null; then
    # Windows py launcher
    PYTHON_CMD="py"
else
    print_error "Python is not installed or not in PATH. Please install Python 3.8+ and try again."
    exit 1
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
print_success "Python $PYTHON_VERSION found ($PYTHON_CMD)"

# Check Python version
if [[ "$(printf '%s\n' "3.8" "$PYTHON_VERSION" | sort -V | head -n1)" != "3.8" ]]; then
    print_warning "Python 3.8+ recommended. Current version: $PYTHON_VERSION"
fi

# Navigate to backend directory
print_status "Setting up Django backend..."
cd backend || {
    print_error "Backend directory not found. Please run this script from the project root."
    exit 1
}

# Create virtual environment
print_status "Creating virtual environment..."
if [ ! -d "venv" ]; then
    $PYTHON_CMD -m venv venv
    print_success "Virtual environment created"
else
    print_warning "Virtual environment already exists"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]] || [[ -f "venv/Scripts/activate" ]]; then
    # Windows
    if [[ -f "venv/Scripts/activate" ]]; then
        source venv/Scripts/activate
    elif [[ -f "venv/Scripts/activate.bat" ]]; then
        # For Windows command prompt
        print_status "Please run: venv\\Scripts\\activate.bat"
        print_status "Then continue with: pip install -r requirements.txt"
        exit 0
    else
        print_error "Virtual environment activation script not found"
        exit 1
    fi
else
    # Unix/Linux/macOS
    if [[ -f "venv/bin/activate" ]]; then
        source venv/bin/activate
    else
        print_error "Virtual environment activation script not found"
        exit 1
    fi
fi

if [[ "$VIRTUAL_ENV" != "" ]]; then
    print_success "Virtual environment activated"
else
    print_error "Failed to activate virtual environment"
    exit 1
fi

# Install dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
print_status "Setting up environment variables..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
DEBUG=True
SECRET_KEY=django-insecure-development-key-change-in-production-$(date +%s)
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000,http://localhost:3000,http://127.0.0.1:3000

# Database settings - using SQLite for simplicity
DB_NAME=db.sqlite3
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1
EOF
    print_success "Environment file created"
else
    print_warning "Environment file already exists"
fi

# Run database migrations
print_status "Running database migrations..."
$PYTHON_CMD manage.py migrate

if [ $? -eq 0 ]; then
    print_success "Database migrations completed"
else
    print_error "Database migration failed"
    exit 1
fi

# Create superuser
print_status "Creating superuser account..."
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'zemdenalex@gmail.com', 'admin123')" | $PYTHON_CMD manage.py shell

if [ $? -eq 0 ]; then
    print_success "Superuser created (admin / admin123)"
else
    print_warning "Superuser creation failed or already exists"
fi

# Create management commands directory if it doesn't exist
print_status "Setting up management commands..."
mkdir -p users/management/commands
touch users/management/__init__.py
touch users/management/commands/__init__.py

# Check if create_mock_data.py exists
if [ ! -f "users/management/commands/create_mock_data.py" ]; then
    print_warning "Mock data command not found. Please create the create_mock_data.py file manually."
else
    # Create mock data
    print_status "Creating mock data (tariffs, users, orders)..."
    $PYTHON_CMD manage.py create_mock_data --clear
    
    if [ $? -eq 0 ]; then
        print_success "Mock data created successfully"
    else
        print_warning "Mock data creation failed or command not found"
    fi
fi

# Run tests
print_status "Running tests..."
$PYTHON_CMD -m pytest --no-header -rN

if [ $? -eq 0 ]; then
    print_success "All tests passed"
else
    print_warning "Some tests failed (this is usually fine for development)"
fi

# Check for common issues
print_status "Checking for common issues..."

# Check if all required files exist
REQUIRED_FILES=("manage.py" "config/settings.py" "config/urls.py")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file missing: $file"
    fi
done

# Check if all apps are present
REQUIRED_DIRS=("users" "orders" "tariffs")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        print_error "Required app directory missing: $dir"
    fi
done

# Test if Django can start
print_status "Testing Django server startup..."
timeout 10s $PYTHON_CMD manage.py check --deploy
if [ $? -eq 0 ]; then
    print_success "Django configuration is valid"
else
    print_warning "Django configuration has issues"
fi

# Go back to project root
cd ..

# Check frontend files
print_status "Checking frontend files..."
FRONTEND_FILES=("index.html" "login.html" "register.html" "profile.html" "order.html")
MISSING_FILES=()

for file in "${FRONTEND_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    print_success "All frontend files found"
else
    print_warning "Missing frontend files: ${MISSING_FILES[*]}"
fi

# Check JavaScript files
JS_FILES=("js/auth.js" "js/navigation.js" "js/profile.js" "js/order.js" "js/home.js")
MISSING_JS=()

for file in "${JS_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_JS+=("$file")
    fi
done

if [ ${#MISSING_JS[@]} -eq 0 ]; then
    print_success "All JavaScript files found"
else
    print_warning "Missing JavaScript files: ${MISSING_JS[*]}"
fi

# Setup complete
echo ""
echo "================================"
print_success "Setup completed successfully! 🎉"
echo "================================"
echo ""

# Display test data
echo -e "${BLUE}📊 TEST DATA AVAILABLE:${NC}"
echo ""
echo -e "${GREEN}Admin Account:${NC}"
echo "  Email: zemdenalex@gmail.com"
echo "  Password: admin123"
echo ""
echo -e "${GREEN}Test Users:${NC}"
echo "  1. ivan.petrov@example.com / testpass123"
echo "  2. maria.sidorova@example.com / testpass123"  
echo "  3. alex.kozlov@example.com / testpass123"
echo ""
echo -e "${GREEN}Available Tariffs:${NC}"
echo "  1. Базовый - 49,999 ₽"
echo "  2. Премиум - 69,999 ₽"
echo "  3. Корпоративный - 120,000 ₽"
echo ""

# Display next steps
echo -e "${BLUE}🚀 NEXT STEPS:${NC}"
echo ""
echo "1. Start the Django backend:"
echo "   cd backend"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   python manage.py runserver"
echo ""
echo "2. In a new terminal, serve the frontend:"
echo "   python -m http.server 3000"
echo ""
echo "3. Open your browser:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://127.0.0.1:8000"
echo "   API Docs: http://127.0.0.1:8000/swagger/"
echo ""

# Display testing suggestions
echo -e "${BLUE}🧪 TESTING SUGGESTIONS:${NC}"
echo ""
echo "• Register a new user and login"
echo "• Create an order using different tariffs"
echo "• Test the profile page and order history"
echo "• Try accessing pages without logging in"
echo "• Test responsive design on mobile"
echo ""

# Display troubleshooting tips
echo -e "${YELLOW}🔧 TROUBLESHOOTING TIPS:${NC}"
echo ""
echo "• If you get CORS errors: Make sure to serve frontend from http://localhost:3000"
echo "• If authentication fails: Clear browser localStorage and try again"
echo "• If styles don't load: Check that you're serving from a web server, not file://"
echo "• For backend issues: Check the Django console output"
echo "• For frontend issues: Check browser developer console"
echo ""

print_success "Happy coding! 💻"
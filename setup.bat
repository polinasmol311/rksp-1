@echo off
chcp 65001 >nul
echo 🚀 Настройка LightWeb Studio...
echo ================================

:: Проверка Python
echo [INFO] Проверка установки Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    py --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Python не найден. Установите Python 3.8+ и попробуйте снова.
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=py
    )
) else (
    set PYTHON_CMD=python
)

for /f "tokens=2" %%i in ('%PYTHON_CMD% --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [SUCCESS] Python %PYTHON_VERSION% найден

:: Переход в директорию backend
echo [INFO] Настройка Django backend...
if not exist "backend" (
    echo [ERROR] Директория backend не найдена. Запустите скрипт из корня проекта.
    pause
    exit /b 1
)
cd backend

:: Создание виртуального окружения
echo [INFO] Создание виртуального окружения...
if not exist "venv" (
    %PYTHON_CMD% -m venv venv
    echo [SUCCESS] Виртуальное окружение создано
) else (
    echo [WARNING] Виртуальное окружение уже существует
)

:: Активация виртуального окружения
echo [INFO] Активация виртуального окружения...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo [SUCCESS] Виртуальное окружение активировано
) else (
    echo [ERROR] Не удалось активировать виртуальное окружение
    pause
    exit /b 1
)

:: Установка зависимостей
echo [INFO] Установка Python зависимостей...
python -m pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Не удалось установить зависимости
    pause
    exit /b 1
) else (
    echo [SUCCESS] Зависимости установлены успешно
)

:: Создание .env файла
echo [INFO] Настройка переменных окружения...
if not exist ".env" (
    (
        echo DEBUG=True
        echo SECRET_KEY=django-insecure-development-key-change-in-production
        echo ALLOWED_HOSTS=localhost,127.0.0.1
        echo CORS_ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000,http://localhost:3000,http://127.0.0.1:3000
        echo.
        echo # Database settings - using SQLite for simplicity
        echo DB_NAME=db.sqlite3
        echo DB_USER=
        echo DB_PASSWORD=
        echo DB_HOST=
        echo DB_PORT=
        echo.
        echo # JWT Settings
        echo JWT_ACCESS_TOKEN_LIFETIME=60
        echo JWT_REFRESH_TOKEN_LIFETIME=1
    ) > .env
    echo [SUCCESS] Файл окружения создан
) else (
    echo [WARNING] Файл окружения уже существует
)

:: Применение миграций базы данных
echo [INFO] Применение миграций базы данных...
python manage.py migrate
if %errorlevel% neq 0 (
    echo [ERROR] Миграция базы данных не удалась
    pause
    exit /b 1
) else (
    echo [SUCCESS] Миграции базы данных завершены
)

:: Создание суперпользователя
echo [INFO] Создание аккаунта суперпользователя...
echo from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin'^).exists(^) or User.objects.create_superuser('admin', 'zemdenalex@gmail.com', 'admin123'^) | python manage.py shell
if %errorlevel% neq 0 (
    echo [WARNING] Создание суперпользователя не удалось или уже существует
) else (
    echo [SUCCESS] Суперпользователь создан (admin / admin123)
)

:: Создание директорий для команд управления
echo [INFO] Настройка команд управления...
if not exist "users\management" mkdir "users\management"
if not exist "users\management\commands" mkdir "users\management\commands"
if not exist "users\management\__init__.py" echo. 2>users\management\__init__.py
if not exist "users\management\commands\__init__.py" echo. 2>users\management\commands\__init__.py

:: Создание тестовых данных
echo [INFO] Создание тестовых данных...
if exist "users\management\commands\create_mock_data.py" (
    python manage.py create_mock_data --clear
    if %errorlevel% neq 0 (
        echo [WARNING] Создание тестовых данных не удалось
    ) else (
        echo [SUCCESS] Тестовые данные созданы успешно
    )
) else (
    echo [WARNING] Команда создания тестовых данных не найдена
)

:: Запуск тестов
echo [INFO] Запуск тестов...
python -m pytest --no-header -rN >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Некоторые тесты не прошли (обычно это нормально для разработки)
) else (
    echo [SUCCESS] Все тесты прошли
)

:: Проверка конфигурации Django
echo [INFO] Проверка запуска Django сервера...
python manage.py check --deploy >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Конфигурация Django имеет проблемы
) else (
    echo [SUCCESS] Конфигурация Django корректна
)

:: Возврат в корень проекта
cd ..

:: Проверка файлов фронтенда
echo [INFO] Проверка файлов фронтенда...
set MISSING_FILES=
if not exist "index.html" set MISSING_FILES=%MISSING_FILES% index.html
if not exist "login.html" set MISSING_FILES=%MISSING_FILES% login.html
if not exist "register.html" set MISSING_FILES=%MISSING_FILES% register.html
if not exist "profile.html" set MISSING_FILES=%MISSING_FILES% profile.html
if not exist "order.html" set MISSING_FILES=%MISSING_FILES% order.html

if "%MISSING_FILES%"=="" (
    echo [SUCCESS] Все файлы фронтенда найдены
) else (
    echo [WARNING] Отсутствующие файлы фронтенда:%MISSING_FILES%
)

:: Завершение настройки
echo.
echo ================================
echo [SUCCESS] Настройка завершена успешно! 🎉
echo ================================
echo.

:: Отображение тестовых данных
echo 📊 ДОСТУПНЫЕ ТЕСТОВЫЕ ДАННЫЕ:
echo.
echo Админ аккаунт:
echo   Email: zemdenalex@gmail.com
echo   Пароль: admin123
echo.
echo Тестовые пользователи:
echo   1. ivan.petrov@example.com / testpass123
echo   2. maria.sidorova@example.com / testpass123
echo   3. alex.kozlov@example.com / testpass123
echo.
echo Доступные тарифы:
echo   1. Базовый - 49,999 ₽
echo   2. Премиум - 69,999 ₽
echo   3. Корпоративный - 120,000 ₽
echo.

:: Отображение следующих шагов
echo 🚀 СЛЕДУЮЩИЕ ШАГИ:
echo.
echo 1. Запустите Django backend:
echo    cd backend
echo    venv/Scripts/activate
echo    python manage.py runserver
echo.
echo 2. В новом терминале запустите фронтенд:
echo    python -m http.server 3000
echo.
echo 3. Откройте браузер:
echo    Фронтенд: http://localhost:3000
echo    Backend API: http://127.0.0.1:8000
echo    API Документация: http://127.0.0.1:8000/swagger/
echo.

:: Советы по тестированию
echo 🧪 ПРЕДЛОЖЕНИЯ ПО ТЕСТИРОВАНИЮ:
echo.
echo • Зарегистрируйте нового пользователя и войдите
echo • Создайте заказ, используя разные тарифы
echo • Протестируйте страницу профиля и историю заказов
echo • Попробуйте доступ к страницам без входа в систему
echo • Протестируйте адаптивный дизайн на мобильных устройствах
echo.

:: Советы по устранению неполадок
echo 🔧 СОВЕТЫ ПО УСТРАНЕНИЮ НЕПОЛАДОК:
echo.
echo • При CORS ошибках: Убедитесь, что фронтенд запущен с http://localhost:3000
echo • При проблемах с аутентификацией: Очистите localStorage браузера и попробуйте снова
echo • Если стили не загружаются: Убедитесь, что используете веб-сервер, а не file://
echo • При проблемах с backend: Проверьте вывод консоли Django
echo • При проблемах с frontend: Проверьте консоль разработчика браузера
echo.

echo [SUCCESS] Удачного кодирования! 💻
pause
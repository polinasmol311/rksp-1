document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы формы
    const registerForm = document.getElementById('registerForm');
    const fullNameInput = document.getElementById('registerFullName');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('registerConfirmPassword');
    const closeButton = document.getElementById('closeButton');
    const popup = document.getElementById('popup');

    // Функция для валидации email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Функция для валидации пароля (минимум 8 символов, включая буквы и цифры)
    function isValidPassword(password) {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return passwordRegex.test(password);
    }

    // Функция для отображения ошибки
    function showError(input, message) {
        const field = input.parentElement;
        const existingError = field.querySelector('.error-message');
        
        if (!existingError) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            field.appendChild(errorDiv);
        }
        
        input.classList.add('register-form__input_error');
    }

    // Функция для удаления ошибки
    function removeError(input) {
        const field = input.parentElement;
        const existingError = field.querySelector('.error-message');
        
        if (existingError) {
            existingError.remove();
        }
        
        input.classList.remove('register-form__input_error');
    }

    // Обработчик отправки формы
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;

        // Очищаем предыдущие ошибки
        [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
            removeError(input);
        });

        // Валидация ФИО
        if (fullNameInput.value.trim().length < 2) {
            showError(fullNameInput, 'ФИО должно содержать не менее 2 символов');
            isValid = false;
        }

        // Валидация email
        if (!isValidEmail(emailInput.value.trim())) {
            showError(emailInput, 'Введите корректный email адрес');
            isValid = false;
        }

        // Валидация пароля
        if (!isValidPassword(passwordInput.value)) {
            showError(passwordInput, 'Пароль должен содержать минимум 8 символов, включая буквы и цифры');
            isValid = false;
        }

        // Проверка совпадения паролей
        if (passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordInput, 'Пароли не совпадают');
            isValid = false;
        }

        if (isValid) {
            try {
                // Создаем объект с данными пользователя
                const userData = {
                    fullName: fullNameInput.value.trim(),
                    email: emailInput.value.trim(),
                    password: passwordInput.value
                };

                // Отправляем данные на сервер
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                if (response.ok) {
                    // Успешная регистрация
                    alert('Регистрация успешно завершена!');
                    window.location.href = '/login.html';
                } else {
                    // Ошибка регистрации
                    alert(data.message || 'Произошла ошибка при регистрации');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Произошла ошибка при отправке данных');
            }
        }
    });

    // Обработчики для живой валидации
    emailInput.addEventListener('blur', () => {
        if (emailInput.value.trim()) {
            if (!isValidEmail(emailInput.value.trim())) {
                showError(emailInput, 'Введите корректный email адрес');
            } else {
                removeError(emailInput);
            }
        }
    });

    passwordInput.addEventListener('input', () => {
        if (passwordInput.value) {
            if (!isValidPassword(passwordInput.value)) {
                showError(passwordInput, 'Пароль должен содержать минимум 8 символов, включая буквы и цифры');
            } else {
                removeError(passwordInput);
            }
        }
    });

    confirmPasswordInput.addEventListener('input', () => {
        if (confirmPasswordInput.value) {
            if (passwordInput.value !== confirmPasswordInput.value) {
                showError(confirmPasswordInput, 'Пароли не совпадают');
            } else {
                removeError(confirmPasswordInput);
            }
        }
    });

    // Обработчик закрытия popup
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            popup.classList.remove('popup_visible');
        });
    }

    // Закрытие popup при клике на overlay
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target.classList.contains('popup__overlay')) {
                popup.classList.remove('popup_visible');
            }
        });
    }
});

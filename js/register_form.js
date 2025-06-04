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

    // Функция для валидации пароля (минимум 6 символов для соответствия Django настройкам)
    function isValidPassword(password) {
        return password.length >= 6;
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
        } else {
            existingError.textContent = message;
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

    // Функция для отображения общих ошибок
    function showGeneralError(message) {
        // Remove existing general error
        const existingError = registerForm.querySelector('.general-error');
        if (existingError) {
            existingError.remove();
        }

        // Create new error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'general-error error-message';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.marginBottom = '12px';
        errorDiv.textContent = message;
        
        // Insert before submit button
        const submitButton = registerForm.querySelector('.register-form__submit-button');
        registerForm.insertBefore(errorDiv, submitButton);
    }

    // Обработчик отправки формы
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;

        // Очищаем предыдущие ошибки
        [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
            removeError(input);
        });

        // Remove general error
        const existingError = registerForm.querySelector('.general-error');
        if (existingError) {
            existingError.remove();
        }

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
            showError(passwordInput, 'Пароль должен содержать минимум 6 символов');
            isValid = false;
        }

        // Проверка совпадения паролей
        if (passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordInput, 'Пароли не совпадают');
            isValid = false;
        }

        if (isValid) {
            try {
                // Создаем объект с данными пользователя в формате Django
                const fullName = fullNameInput.value.trim();
                const nameParts = fullName.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                const userData = {
                    username: emailInput.value.trim(), // Using email as username
                    email: emailInput.value.trim(),
                    password: passwordInput.value,
                    password2: confirmPasswordInput.value,
                    first_name: firstName,
                    last_name: lastName
                };

                // Отправляем данные через auth manager
                const result = await window.authManager.register(userData);

                if (result.success) {
                    // Показываем сообщение об успехе
                    showSuccessMessage();
                } else {
                    // Обработка ошибок валидации от сервера
                    if (result.error && typeof result.error === 'object') {
                        // Show field-specific errors
                        for (const [field, errors] of Object.entries(result.error)) {
                            if (field === 'username' || field === 'email') {
                                showError(emailInput, Array.isArray(errors) ? errors[0] : errors);
                            } else if (field === 'password') {
                                showError(passwordInput, Array.isArray(errors) ? errors[0] : errors);
                            } else if (field === 'first_name') {
                                showError(fullNameInput, Array.isArray(errors) ? errors[0] : errors);
                            } else if (field === 'non_field_errors') {
                                showGeneralError(Array.isArray(errors) ? errors[0] : errors);
                            }
                        }
                    } else {
                        showGeneralError('Произошла ошибка при регистрации');
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                showGeneralError('Произошла ошибка при отправке данных. Проверьте соединение.');
            }
        }
    });

    // Функция для отображения успешной регистрации
    function showSuccessMessage() {
        // Скрываем форму
        registerForm.style.display = 'none';
        
        // Создаем блок с сообщением об успехе
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.innerHTML = `
            <h2 class="form-success__title">Регистрация завершена!</h2>
            <p class="form-success__message">Теперь вы можете войти в свой аккаунт</p>
            <button class="register-form__submit-button" onclick="window.location.href='/login.html'" style="margin-top: 20px;">
                Войти в аккаунт
            </button>
        `;
        
        // Добавляем после welcome блока
        const welcome = document.querySelector('.welcome');
        welcome.parentNode.insertBefore(successDiv, welcome.nextSibling);
    }

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
                showError(passwordInput, 'Пароль должен содержать минимум 6 символов');
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
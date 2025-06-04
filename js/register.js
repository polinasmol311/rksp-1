document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const fullNameInput = document.getElementById('registerFullName');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('registerConfirmPassword');
    const submitButton = registerForm.querySelector('.register-form__submit-button');
    const closeButton = document.getElementById('closeButton');
    const popup = document.getElementById('popup');

    // Handle form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();

        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Basic validation
        let isValid = true;

        if (fullName.length < 2) {
            showFieldError(fullNameInput, 'ФИО должно содержать минимум 2 символа');
            isValid = false;
        }

        if (!isValidEmail(email)) {
            showFieldError(emailInput, 'Введите корректный email');
            isValid = false;
        }

        if (password.length < 6) {
            showFieldError(passwordInput, 'Пароль должен содержать минимум 6 символов');
            isValid = false;
        }

        if (password !== confirmPassword) {
            showFieldError(confirmPasswordInput, 'Пароли не совпадают');
            isValid = false;
        }

        if (!isValid) return;

        try {
            setLoadingState(true);
            
            // Prepare data for Django backend
            const nameParts = fullName.split(' ');
            const userData = {
                username: email, // Use email as username
                email: email,
                password: password,
                password2: confirmPassword,
                first_name: nameParts[0] || '',
                last_name: nameParts.slice(1).join(' ') || ''
            };

            const result = await window.authManager.register(userData);
            
            if (result.success) {
                showSuccessPage();
            } else {
                // Handle validation errors from Django
                if (result.error) {
                    handleBackendErrors(result.error);
                } else {
                    showGeneralError('Ошибка регистрации. Попробуйте еще раз.');
                }
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            showGeneralError('Ошибка соединения с сервером');
        } finally {
            setLoadingState(false);
        }
    });

    // Real-time validation
    emailInput.addEventListener('blur', () => {
        if (emailInput.value.trim() && !isValidEmail(emailInput.value.trim())) {
            showFieldError(emailInput, 'Введите корректный email');
        } else {
            clearFieldError(emailInput);
        }
    });

    passwordInput.addEventListener('input', () => {
        if (passwordInput.value && passwordInput.value.length < 6) {
            showFieldError(passwordInput, 'Пароль должен содержать минимум 6 символов');
        } else {
            clearFieldError(passwordInput);
        }
    });

    confirmPasswordInput.addEventListener('input', () => {
        if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
            showFieldError(confirmPasswordInput, 'Пароли не совпадают');
        } else {
            clearFieldError(confirmPasswordInput);
        }
    });

    // Close popup handlers
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            window.location.href = '/index.html';
        });
    }

    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target.classList.contains('popup__overlay')) {
                window.location.href = '/index.html';
            }
        });
    }

    // Helper functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.textContent = 'Регистрация...';
            submitButton.style.opacity = '0.7';
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Зарегистрироваться';
            submitButton.style.opacity = '1';
        }
    }

    function showFieldError(input, message) {
        clearFieldError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = `
            color: #ff4444;
            font-size: 14px;
            margin-top: 4px;
            padding-left: 20px;
        `;
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
        input.style.borderColor = '#ff4444';
    }

    function clearFieldError(input) {
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        input.style.borderColor = '';
    }

    function clearAllErrors() {
        const allErrors = registerForm.querySelectorAll('.field-error, .general-error');
        allErrors.forEach(error => error.remove());
        
        [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
            input.style.borderColor = '';
        });
    }

    function showGeneralError(message) {
        const existingError = registerForm.querySelector('.general-error');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'general-error';
        errorDiv.style.cssText = `
            color: #ff4444;
            text-align: center;
            margin: 10px 0;
            font-weight: 500;
        `;
        errorDiv.textContent = message;
        
        registerForm.insertBefore(errorDiv, submitButton);
    }

    function handleBackendErrors(errors) {
        // Handle field-specific errors from Django
        for (const [field, messages] of Object.entries(errors)) {
            const message = Array.isArray(messages) ? messages[0] : messages;
            
            switch (field) {
                case 'username':
                case 'email':
                    showFieldError(emailInput, message);
                    break;
                case 'password':
                    showFieldError(passwordInput, message);
                    break;
                case 'first_name':
                    showFieldError(fullNameInput, message);
                    break;
                case 'non_field_errors':
                    showGeneralError(message);
                    break;
                default:
                    showGeneralError(message);
            }
        }
    }

    function showSuccessPage() {
        // Hide the form
        registerForm.style.display = 'none';
        
        // Show success message
        const welcome = document.querySelector('.welcome');
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.innerHTML = `
            <h2 style="font-size: 28px; font-weight: 700; color: #27ce22; margin-bottom: 16px;">
                Регистрация завершена!
            </h2>
            <p style="font-size: 16px; color: #0a0908; margin-bottom: 20px;">
                Теперь вы можете войти в свой аккаунт
            </p>
            <button class="register-form__submit-button" onclick="window.location.href='/login.html'">
                Войти в аккаунт
            </button>
        `;
        
        welcome.parentNode.insertBefore(successDiv, welcome.nextSibling);
    }
});
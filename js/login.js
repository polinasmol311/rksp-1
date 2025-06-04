document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = loginForm.querySelector('.login-form__submit-button');
    const closeButton = document.getElementById('closeButton');
    const popup = document.getElementById('popup');

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Basic validation
        if (!email || !password) {
            showError('Пожалуйста, заполните все поля');
            return;
        }

        try {
            setLoadingState(true);
            
            // Use email as username for Django backend
            const result = await window.authManager.login(email, password);
            
            if (result.success) {
                // Get redirect URL from query parameters
                const urlParams = new URLSearchParams(window.location.search);
                const redirectTo = urlParams.get('redirect') || '/profile.html';
                
                showSuccess('Вход выполнен успешно!');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = redirectTo;
                }, 1000);
                
            } else {
                // Handle login errors
                if (result.error.detail) {
                    showError(result.error.detail);
                } else {
                    showError('Неверный email или пароль');
                }
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showError('Ошибка соединения с сервером');
        } finally {
            setLoadingState(false);
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

    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.location.href = '/index.html';
        }
    });

    // Focus email input
    setTimeout(() => {
        emailInput.focus();
    }, 300);

    function setLoadingState(isLoading) {
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.textContent = 'Вход...';
            submitButton.style.opacity = '0.7';
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Войти';
            submitButton.style.opacity = '1';
        }
    }

    function showSuccess(message) {
        removeErrors();
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            color: #27ce22;
            text-align: center;
            margin: 10px 0;
            font-weight: 500;
        `;
        successDiv.textContent = message;
        
        loginForm.insertBefore(successDiv, submitButton);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }

    function showError(message) {
        removeErrors();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            color: #ff4444;
            text-align: center;
            margin: 10px 0;
            font-weight: 500;
        `;
        errorDiv.textContent = message;
        
        loginForm.insertBefore(errorDiv, submitButton);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    function removeErrors() {
        const existingMessages = loginForm.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
    }
});
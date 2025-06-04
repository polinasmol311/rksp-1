class LoginPopup {
    constructor() {
        this.popup = document.getElementById('popup');
        this.closeButton = document.getElementById('closeButton');
        this.loginForm = document.getElementById('loginForm');
        this.registerLink = document.getElementById('registerLink');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.submitButton = this.loginForm.querySelector('.login-form__submit-button');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.focusEmailInput();
    }

    bindEvents() {
        // Закрытие попапа
        this.closeButton.addEventListener('click', () => this.closePopup());
        this.popup.querySelector('.popup__overlay').addEventListener('click', () => this.closePopup());
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Обработка формы
        this.loginForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Ссылка регистрации
        this.registerLink.addEventListener('click', (e) => this.handleRegisterClick(e));

        // Валидация в реальном времени
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        this.emailInput.addEventListener('input', () => this.clearError(this.emailInput));
        this.passwordInput.addEventListener('input', () => this.clearError(this.passwordInput));
    }

    closePopup() {
        this.popup.classList.remove('popup_visible');
        this.resetForm();
    }

    openPopup() {
        this.popup.classList.add('popup_visible');
        this.focusEmailInput();
    }

    handleKeydown(e) {
        if (e.key === 'Escape' && this.popup.classList.contains('popup_visible')) {
            this.closePopup();
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value.trim();

        try {
            this.setLoadingState(true);
            
            // Имитация API запроса
            await this.simulateLogin(email, password);
            
            this.showSuccessMessage(`Добро пожаловать! Email: ${email}`);
            this.closePopup();
            
        } catch (error) {
            this.showError('Ошибка входа. Проверьте данные и попробуйте снова.');
        } finally {
            this.setLoadingState(false);
        }
    }

    // handleRegisterClick(e) {
    //     e.preventDefault();
    //     alert('Переход на страницу регистрации...');
    //     // Здесь можно добавить логику перехода на страницу регистрации
    // }

    validateForm() {
        let isValid = true;

        if (!this.validateEmail()) {
            isValid = false;
        }

        if (!this.validatePassword()) {
            isValid = false;
        }

        return isValid;
    }

    validateEmail() {
        const email = this.emailInput.value.trim();
        
        if (!email) {
            this.showFieldError(this.emailInput, 'Введите email');
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showFieldError(this.emailInput, 'Введите корректный email');
            return false;
        }

        this.clearError(this.emailInput);
        return true;
    }

    validatePassword() {
        const password = this.passwordInput.value.trim();
        
        if (!password) {
            this.showFieldError(this.passwordInput, 'Введите пароль');
            return false;
        }

        if (password.length < 6) {
            this.showFieldError(this.passwordInput, 'Пароль должен содержать минимум 6 символов');
            return false;
        }

        this.clearError(this.passwordInput);
        return true;
    }

    showFieldError(input, message) {
        input.classList.add('login-form__input_error');
        
        let errorElement = input.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            input.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.classList.add('error-message_visible');
    }

    clearError(input) {
        input.classList.remove('login-form__input_error');
        const errorElement = input.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.classList.remove('error-message_visible');
        }
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.submitButton.disabled = true;
            this.submitButton.classList.add('login-form__submit-button_loading');
        } else {
            this.submitButton.disabled = false;
            this.submitButton.classList.remove('login-form__submit-button_loading');
        }
    }

    simulateLogin(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Имитация успешного входа
                if (email && password) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1500);
        });
    }

    showSuccessMessage(message) {
        alert(message);
        // Здесь можно добавить более красивое уведомление
    }

    showError(message) {
        alert(message);
        // Здесь можно добавить более красивое уведомление об ошибке
    }

    resetForm() {
        this.loginForm.reset();
        this.clearError(this.emailInput);
        this.clearError(this.passwordInput);
        this.setLoadingState(false);
    }

    focusEmailInput() {
        setTimeout(() => {
            this.emailInput.focus();
        }, 300);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Инициализация попапа
document.addEventListener('DOMContentLoaded', () => {
    const loginPopup = new LoginPopup();
    
    // Глобальная функция для открытия попапа (если нужно)
    window.openLoginPopup = () => loginPopup.openPopup();
});
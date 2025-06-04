document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load tariffs from backend
        await loadTariffs();
        
        // Setup form handlers
        setupOrderForm();
        
        // Check if user is logged in and show appropriate warning
        checkAuthAndShowWarning();
        
    } catch (error) {
        console.error('Error loading order page:', error);
        showError('Ошибка загрузки данных');
    }
});

// Check authentication and show warning if not logged in
function checkAuthAndShowWarning() {
    if (!window.authManager.isAuthenticated()) {
        showLoginWarning();
    }
}

// Show login warning for non-authenticated users
function showLoginWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'login-warning';
    warningDiv.style.cssText = `
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 12px;
        padding: 16px 24px;
        margin: 0 auto 24px;
        max-width: 1080px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;
        color: #856404;
    `;
    
    warningDiv.innerHTML = `
        <div>
            <strong>💡 Совет:</strong> Войдите в аккаунт, чтобы сохранить историю заказов и отслеживать их статус
        </div>
        <button onclick="window.location.href='/login.html?redirect=' + encodeURIComponent(window.location.pathname)" 
                style="background: #27ce22; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 500;">
            Войти
        </button>
    `;
    
    // Insert after the main title
    const mainTitle = document.querySelector('.main__title');
    if (mainTitle) {
        mainTitle.parentNode.insertBefore(warningDiv, mainTitle.nextSibling);
    }
}

// Load tariffs from backend
async function loadTariffs() {
    try {
        const tariffsData = await window.authManager.getTariffs();
        
        if (tariffsData.results && tariffsData.results.length > 0) {
            updateTariffsSection(tariffsData.results);
        }
        
    } catch (error) {
        console.error('Error loading tariffs:', error);
        // Keep default tariffs if backend fails
        showError('Не удалось загрузить тарифы с сервера, используются базовые тарифы');
    }
}

// Update tariffs section with backend data
function updateTariffsSection(tariffs) {
    const rateContainer = document.querySelector('.rate');
    if (!rateContainer) return;
    
    // Update the rate section HTML structure
    rateContainer.innerHTML = `
        <p class="rate-title">Шаг 2 — Выберите Тариф</p>
        <div class="rate__container">
            <div class="rate__nav rate__nav--left">
                <button class="rate__nav-btn" id="tariffsScrollLeft" onclick="scrollTariffs('left')">‹</button>
            </div>
            <section class="rate__section" id="tariffsSection"></section>
            <div class="rate__nav rate__nav--right">
                <button class="rate__nav-btn" id="tariffsScrollRight" onclick="scrollTariffs('right')">›</button>
            </div>
        </div>
    `;
    
    const rateSection = document.getElementById('tariffsSection');
    
    tariffs.forEach((tariff, index) => {
        const tariffBox = createTariffBox(tariff, index);
        rateSection.appendChild(tariffBox);
    });
    
    // Update navigation buttons
    updateTariffsNavigation();
}

// Scroll tariffs horizontally
window.scrollTariffs = function(direction) {
    const container = document.getElementById('tariffsSection');
    const cardWidth = 528 + 24; // card width + gap
    const scrollAmount = cardWidth; // scroll 1 card at a time
    
    if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    
    // Update navigation buttons after scroll
    setTimeout(updateTariffsNavigation, 300);
};

// Update tariffs navigation buttons state
function updateTariffsNavigation() {
    const container = document.getElementById('tariffsSection');
    const leftBtn = document.getElementById('tariffsScrollLeft');
    const rightBtn = document.getElementById('tariffsScrollRight');
    
    if (!container || !leftBtn || !rightBtn) return;
    
    const canScrollLeft = container.scrollLeft > 0;
    const canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);
    
    leftBtn.disabled = !canScrollLeft;
    rightBtn.disabled = !canScrollRight;
    
    // Show/hide navigation buttons based on content
    const needsNavigation = container.scrollWidth > container.clientWidth;
    leftBtn.style.display = needsNavigation ? 'flex' : 'none';
    rightBtn.style.display = needsNavigation ? 'flex' : 'none';
}

// Create tariff box element
function createTariffBox(tariff, index) {
    const tariffBox = document.createElement('div');
    tariffBox.className = 'rate__box';
    tariffBox.dataset.tariffId = tariff.id;
    
    // Create features list
    const featuresList = tariff.features.map(feature => 
        `<li class="rate__box-item">${feature}</li>`
    ).join('');
    
    tariffBox.innerHTML = `
        <div class="rate__box-title">${tariff.name}</div>
        <div class="rate__box-bio">${tariff.description}</div>
        <ul class="rate__box-list">
            ${featuresList}
        </ul>
        <div class="rate__box-bottom">
            <span class="rate__box-price">${Math.floor(tariff.price)} ₽</span>
            <a href="#" class="rate__box-order" onclick="selectTariff(${tariff.id})">
                <span class="rate__box-order--title">Выбрать</span>
            </a>
        </div>
    `;
    
    return tariffBox;
}

// Setup order form functionality
function setupOrderForm() {
    const form = document.querySelector('.main__form');
    const confirmButton = document.querySelector('.confirm__action-btn');
    
    if (confirmButton) {
        // Update button style
        confirmButton.style.background = '#0a0908';
        confirmButton.style.display = 'flex';
        confirmButton.style.alignItems = 'center';
        confirmButton.style.justifyContent = 'center';
        confirmButton.addEventListener('click', handleOrderSubmit);
    }
    
    // Track selected tariff
    window.selectedTariffId = null;
}

// Handle tariff selection
window.selectTariff = function(tariffId) {
    // Remove previous selection
    const previousSelected = document.querySelector('.rate__box.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
        previousSelected.style.border = '';
    }
    
    // Mark new selection
    const selectedBox = document.querySelector(`[data-tariff-id="${tariffId}"]`);
    if (selectedBox) {
        selectedBox.classList.add('selected');
        selectedBox.style.border = '3px solid #27ce22';
        window.selectedTariffId = tariffId;
        
        // Show feedback
        showSuccess('Тариф выбран');
        
        // Enable confirm button
        const confirmButton = document.querySelector('.confirm__action-btn');
        if (confirmButton) {
            confirmButton.style.opacity = '1';
            confirmButton.style.background = '#0a0908';
            confirmButton.disabled = false;
        }
    }
};

// Handle order form submission
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    // Check if user is logged in
    if (!window.authManager.isAuthenticated()) {
        showLoginRequiredModal();
        return;
    }
    
    // Validate form
    const validation = validateOrderForm();
    if (!validation.isValid) {
        showError(validation.message);
        return;
    }
    
    // Collect form data
    const orderData = collectOrderData();
    
    try {
        setButtonLoading(e.target, true);
        
        // Submit order to backend
        const result = await window.authManager.createOrder(orderData);
        
        showSuccessPage(result);
        
    } catch (error) {
        console.error('Error creating order:', error);
        showError('Ошибка при создании заказа: ' + error.message);
    } finally {
        setButtonLoading(e.target, false);
    }
}

// Show login required modal
function showLoginRequiredModal() {
    const modal = document.createElement('div');
    modal.className = 'login-required-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 16px; padding: 32px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);">
            <h3 style="font-size: 24px; font-weight: 600; margin-bottom: 16px; color: #0a0908;">Требуется авторизация</h3>
            <p style="font-size: 16px; color: #666; margin-bottom: 24px;">
                Для создания заказа необходимо войти в аккаунт или зарегистрироваться
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <button onclick="closeLoginModal()" style="padding: 12px 24px; border-radius: 12px; border: none; font-size: 16px; font-weight: 500; cursor: pointer; background: #6c757d; color: white; min-width: 100px;">
                    Отмена
                </button>
                <button onclick="window.location.href='/register.html?redirect=' + encodeURIComponent(window.location.pathname)" style="padding: 12px 24px; border-radius: 12px; border: none; font-size: 16px; font-weight: 500; cursor: pointer; background: #27ce22; color: white; min-width: 120px;">
                    Регистрация
                </button>
                <button onclick="window.location.href='/login.html?redirect=' + encodeURIComponent(window.location.pathname)" style="padding: 12px 24px; border-radius: 12px; border: none; font-size: 16px; font-weight: 500; cursor: pointer; background: #0a0908; color: white; min-width: 100px;">
                    Войти
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeLoginModal();
        }
    });
}

// Close login modal
window.closeLoginModal = function() {
    const modal = document.querySelector('.login-required-modal');
    if (modal) {
        modal.remove();
    }
};

// Validate order form
function validateOrderForm() {
    const companyName = document.getElementById('company-name')?.value.trim();
    const activityType = document.getElementById('activity-type')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    
    if (!companyName) {
        return { isValid: false, message: 'Введите название компании' };
    }
    
    if (!activityType) {
        return { isValid: false, message: 'Введите род деятельности' };
    }
    
    if (!phone) {
        return { isValid: false, message: 'Введите номер телефона' };
    }
    
    if (!email || !isValidEmail(email)) {
        return { isValid: false, message: 'Введите корректный email' };
    }
    
    if (!window.selectedTariffId) {
        return { isValid: false, message: 'Выберите тариф' };
    }
    
    return { isValid: true };
}

// Collect order form data
function collectOrderData() {
    const companyName = document.getElementById('company-name')?.value.trim();
    const activityType = document.getElementById('activity-type')?.value.trim();
    const additionalInfo = document.getElementById('additional-info')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const telegram = document.getElementById('telegram')?.value.trim();
    
    return {
        tariff: window.selectedTariffId,
        project_name: companyName,
        project_description: `Род деятельности: ${activityType}${additionalInfo ? '\n\nДополнительная информация: ' + additionalInfo : ''}`,
        requirements: `Контакты:\nТелефон: ${phone}\nEmail: ${email}${telegram ? '\nTelegram: ' + telegram : ''}`,
        reference_links: [],
        attachments: []
    };
}

// Show success page after order creation
function showSuccessPage(orderData) {
    const container = document.querySelector('.main .container');
    if (!container) return;
    
    // Replace entire container content
    container.innerHTML = `
        <div style="text-align: center; padding: 64px 0; min-height: 60vh;">
            <div style="background: #f8fff8; border: 2px solid #27ce22; border-radius: 16px; padding: 48px; max-width: 800px; margin: 0 auto;">
                <h1 style="font-size: 48px; font-weight: 800; color: #27ce22; margin-bottom: 24px;">
                    ✅ Заказ успешно создан!
                </h1>
                <p style="font-size: 24px; font-weight: 500; margin-bottom: 16px; color: #0a0908;">
                    Номер заказа: <strong>#${orderData.id}</strong>
                </p>
                <p style="font-size: 18px; margin-bottom: 48px; color: #666;">
                    В течение одного рабочего дня с вами свяжется наш менеджер для уточнения деталей проекта
                </p>
                <div style="display: flex; gap: 24px; justify-content: center; flex-wrap: wrap;">
                    <button class="success-btn success-btn--primary" onclick="window.location.href='/profile.html'">
                        Перейти в профиль
                    </button>
                    <button class="success-btn success-btn--secondary" onclick="window.location.href='/order.html'">
                        Создать еще заказ
                    </button>
                    <button class="success-btn success-btn--tertiary" onclick="window.location.href='/index.html'">
                        На главную
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add CSS for success buttons
    addSuccessButtonStyles();
}

// Add CSS styles for success buttons
function addSuccessButtonStyles() {
    if (document.getElementById('success-btn-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'success-btn-styles';
    style.textContent = `
        .success-btn {
            padding: 16px 32px;
            border-radius: 16px;
            border: none;
            font-size: 18px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 180px;
            height: 56px;
            font-family: 'RobotoFlex', sans-serif;
        }
        
        .success-btn--primary {
            background: #27ce22;
            color: white;
        }
        
        .success-btn--primary:hover {
            background: #22b81e;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(39, 206, 34, 0.3);
        }
        
        .success-btn--secondary {
            background: #0a0908;
            color: white;
        }
        
        .success-btn--secondary:hover {
            background: #434343;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(10, 9, 8, 0.3);
        }
        
        .success-btn--tertiary {
            background: transparent;
            color: #0a0908;
            border: 2px solid #0a0908;
        }
        
        .success-btn--tertiary:hover {
            background: #0a0908;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(10, 9, 8, 0.2);
        }
    `;
    document.head.appendChild(style);
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = 'Создание заказа...';
        button.style.opacity = '0.7';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Создать Заказ';
        button.style.opacity = '1';
    }
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        background: ${type === 'success' ? '#27ce22' : '#dc3545'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}
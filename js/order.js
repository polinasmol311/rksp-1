document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!window.authManager.requireAuth()) {
        return; // Will redirect to login
    }

    try {
        // Load tariffs from backend
        await loadTariffs();
        
        // Setup form handlers
        setupOrderForm();
        
    } catch (error) {
        console.error('Error loading order page:', error);
        showError('Ошибка загрузки данных');
    }
});

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
    const rateSection = document.querySelector('.rate__section');
    if (!rateSection) return;
    
    // Clear existing tariffs
    rateSection.innerHTML = '';
    
    tariffs.forEach((tariff, index) => {
        const tariffBox = createTariffBox(tariff, index);
        rateSection.appendChild(tariffBox);
    });
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
            confirmButton.disabled = false;
        }
    }
};

// Handle order form submission
async function handleOrderSubmit(e) {
    e.preventDefault();
    
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
    const container = document.querySelector('.main .conatiner, .main .container');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 64px 0;">
            <h1 style="font-size: 40px; font-weight: 800; color: #27ce22; margin-bottom: 24px;">
                Заказ успешно создан!
            </h1>
            <p style="font-size: 24px; font-weight: 500; margin-bottom: 32px;">
                Номер заказа: #${orderData.id}
            </p>
            <p style="font-size: 18px; margin-bottom: 48px;">
                В течение одного рабочего дня с вами свяжется наш менеджер
            </p>
            <div style="display: flex; gap: 16px; justify-content: center;">
                <button class="confirm__action-btn" onclick="window.location.href='/profile.html'">
                    Перейти в профиль
                </button>
                <button class="confirm__action-btn" onclick="window.location.href='/index.html'" 
                        style="background: #6c757d;">
                    На главную
                </button>
            </div>
        </div>
    `;
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
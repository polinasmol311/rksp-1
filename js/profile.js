document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication first
    if (!window.authManager.requireAuth()) {
        return; // Will redirect to login
    }

    try {
        // Load user profile and orders
        await Promise.all([
            loadUserProfile(),
            loadUserOrders()
        ]);
        
        // Setup form handlers
        setupProfileForm();
        
    } catch (error) {
        console.error('Error loading profile page:', error);
        if (error.message.includes('Authentication')) {
            window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
        } else {
            showError('Ошибка загрузки данных профиля');
        }
    }
});

// Load user profile data from backend
async function loadUserProfile() {
    try {
        const userData = await window.authManager.getUserProfile();
        
        // Fill form fields
        document.getElementById('user-name').value = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        document.getElementById('phone-number').value = userData.phone || '';
        document.getElementById('email').value = userData.email || '';
        
        // Update page title
        if (userData.first_name) {
            document.querySelector('.main__title').textContent = `Профиль - ${userData.first_name}`;
        }
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        throw error;
    }
}

// Load user orders from backend
async function loadUserOrders() {
    try {
        const ordersData = await window.authManager.getUserOrders();
        const ordersContainer = document.querySelector('.orders__scroll');
        
        if (ordersData.results && ordersData.results.length > 0) {
            ordersContainer.innerHTML = '';
            
            ordersData.results.forEach(order => {
                const orderCard = createOrderCard(order);
                ordersContainer.appendChild(orderCard);
            });
        } else {
            ordersContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 200px; color: #fffdfa; font-size: 18px;">
                    У вас пока нет заказов
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading orders:', error);
        const ordersContainer = document.querySelector('.orders__scroll');
        ordersContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 200px; color: #fffdfa; font-size: 18px;">
                Ошибка загрузки заказов
            </div>
        `;
    }
}

// Create order card HTML element
function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order__card';
    
    const createdDate = new Date(order.created_at).toLocaleDateString('ru-RU');
    const statusSteps = getOrderSteps(order);
    
    orderCard.innerHTML = `
        <div class="order__title">${order.project_name}</div>
        <div class="order__date">Заказ от ${createdDate}</div>
        <div class="order__steps">
            ${statusSteps.map(step => `
                <div class="order__steps-item">
                    <img src="/images/elements/ellipse_${step.completed ? 'green' : 'grey'}.svg" alt="ellipse" class="step__icon">
                    <span class="step__name">${step.name}</span>
                    <span class="step__date">${step.date || ''}</span>
                </div>
            `).join('')}
        </div>
        <a href="#" class="order__details-btn" onclick="showOrderDetails(${order.id})">
            <span class="order__details-btn--title">Подробнее</span>
        </a>
    `;
    
    return orderCard;
}

// Get order steps based on status
function getOrderSteps(order) {
    const createdDate = new Date(order.created_at).toLocaleDateString('ru-RU');
    
    return [
        {
            name: 'Заказ создан',
            completed: true,
            date: createdDate
        },
        {
            name: 'В работе',
            completed: order.status === 'IN_PROGRESS' || order.status === 'COMPLETED',
            date: order.status === 'IN_PROGRESS' || order.status === 'COMPLETED' ? createdDate : ''
        },
        {
            name: 'Завершен',
            completed: order.status === 'COMPLETED',
            date: order.status === 'COMPLETED' ? createdDate : ''
        }
    ];
}

// Setup profile form functionality
function setupProfileForm() {
    const form = document.querySelector('.main__form');
    
    // Add save and logout buttons
    addFormButtons(form);
    
    // Handle form submission
    form.addEventListener('submit', handleProfileUpdate);
}

// Add save and logout buttons to form
function addFormButtons(form) {
    // Check if buttons already exist
    if (form.querySelector('.profile-buttons')) return;
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'profile-buttons';
    buttonsContainer.style.cssText = `
        display: flex;
        gap: 16px;
        justify-content: center;
        margin-top: 32px;
    `;
    
    const saveButton = document.createElement('button');
    saveButton.className = 'confirm__action-btn';
    saveButton.textContent = 'Сохранить изменения';
    saveButton.type = 'submit';
    
    const logoutButton = document.createElement('button');
    logoutButton.className = 'confirm__action-btn';
    logoutButton.textContent = 'Выйти';
    logoutButton.type = 'button';
    logoutButton.style.backgroundColor = '#dc3545';
    logoutButton.onclick = handleLogout;
    
    buttonsContainer.appendChild(saveButton);
    buttonsContainer.appendChild(logoutButton);
    form.appendChild(buttonsContainer);
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('user-name').value.trim();
    const nameParts = fullName.split(' ');
    
    const updateData = {
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone-number').value.trim()
    };

    try {
        const submitButton = e.target.querySelector('button[type="submit"]');
        setButtonLoading(submitButton, true);
        
        await window.authManager.updateUserProfile(updateData);
        showSuccess('Профиль успешно обновлен');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Ошибка при обновлении профиля: ' + error.message);
    } finally {
        const submitButton = e.target.querySelector('button[type="submit"]');
        setButtonLoading(submitButton, false);
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        window.authManager.logout();
    }
}

// Set button loading state
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = 'Сохранение...';
        button.style.opacity = '0.7';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Сохранить изменения';
        button.style.opacity = '1';
    }
}

// Show order details (placeholder)
window.showOrderDetails = function(orderId) {
    alert(`Детали заказа #${orderId}\n(Функция в разработке)`);
};

// Show success notification
function showSuccess(message) {
    showNotification(message, 'success');
}

// Show error notification
function showError(message) {
    showNotification(message, 'error');
}

// Show notification
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
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}
// Updated profile.js with improved styling and custom logout confirmation
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
        const ordersContainer = document.querySelector('.orders');
        
        if (ordersData.results && ordersData.results.length > 0) {
            createOrdersSection(ordersData.results);
        } else {
            ordersContainer.innerHTML = `
                <div class="orders__title">История заказов</div>
                <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 200px; color: #fffdfa; font-size: 18px;">
                    У вас пока нет заказов
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading orders:', error);
        const ordersContainer = document.querySelector('.orders');
        ordersContainer.innerHTML = `
            <div class="orders__title">История заказов</div>
            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 200px; color: #fffdfa; font-size: 18px;">
                Ошибка загрузки заказов
            </div>
        `;
    }
}

// Create orders section with navigation
function createOrdersSection(orders) {
    const ordersContainer = document.querySelector('.orders');
    ordersContainer.innerHTML = `
        <div class="orders__title">История заказов</div>
        <div class="orders__container">
            <div class="orders__nav orders__nav--left">
                <button class="orders__nav-btn" id="ordersScrollLeft" onclick="scrollOrders('left')">‹</button>
            </div>
            <div class="orders__scroll" id="ordersScroll"></div>
            <div class="orders__nav orders__nav--right">
                <button class="orders__nav-btn" id="ordersScrollRight" onclick="scrollOrders('right')">›</button>
            </div>
        </div>
    `;
    
    const scrollContainer = document.getElementById('ordersScroll');
    
    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        scrollContainer.appendChild(orderCard);
    });
    
    // Update navigation buttons
    updateOrdersNavigation();
}

// Scroll orders horizontally
window.scrollOrders = function(direction) {
    const container = document.getElementById('ordersScroll');
    const cardWidth = 440 + 24; // card width + gap
    const scrollAmount = cardWidth * 2; // scroll 2 cards at a time
    
    if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    
    // Update navigation buttons after scroll
    setTimeout(updateOrdersNavigation, 300);
};

// Update navigation buttons state
function updateOrdersNavigation() {
    const container = document.getElementById('ordersScroll');
    const leftBtn = document.getElementById('ordersScrollLeft');
    const rightBtn = document.getElementById('ordersScrollRight');
    
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

// Add scroll listener to update navigation
document.addEventListener('DOMContentLoaded', () => {
    // Add scroll listener after orders are loaded
    setTimeout(() => {
        const container = document.getElementById('ordersScroll');
        if (container) {
            container.addEventListener('scroll', updateOrdersNavigation);
        }
    }, 1000);
});

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

// Add save and logout buttons to form with improved styling
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
    saveButton.className = 'profile-btn profile-btn--save';
    saveButton.textContent = 'Сохранить изменения';
    saveButton.type = 'submit';
    
    const logoutButton = document.createElement('button');
    logoutButton.className = 'profile-btn profile-btn--logout';
    logoutButton.textContent = 'Выйти';
    logoutButton.type = 'button';
    logoutButton.onclick = handleLogout;
    
    buttonsContainer.appendChild(saveButton);
    buttonsContainer.appendChild(logoutButton);
    form.appendChild(buttonsContainer);
    
    // Add CSS styles for the new buttons
    addProfileButtonStyles();
}

// Add CSS styles for profile buttons
function addProfileButtonStyles() {
    if (document.getElementById('profile-btn-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'profile-btn-styles';
    style.textContent = `
        .profile-btn {
            border-radius: 16px;
            padding: 12px 32px;
            min-width: 200px;
            height: 56px;
            font-weight: 500;
            font-size: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            font-family: 'RobotoFlex', sans-serif;
        }
        
        .profile-btn--save {
            background: #27ce22;
            color: #ffffff;
        }
        
        .profile-btn--save:hover {
            background: #22b81e;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(39, 206, 34, 0.3);
        }
        
        .profile-btn--logout {
            background: #0a0908;
            color: #ffffff;
        }
        
        .profile-btn--logout:hover {
            background: #434343;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(10, 9, 8, 0.3);
        }
        
        .profile-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        /* Custom logout modal */
        .logout-modal {
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
        }
        
        .logout-modal__content {
            background: #ffffff;
            border-radius: 16px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .logout-modal__title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #0a0908;
        }
        
        .logout-modal__text {
            font-size: 16px;
            color: #666;
            margin-bottom: 24px;
        }
        
        .logout-modal__buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
        }
        
        .logout-modal__btn {
            padding: 12px 24px;
            border-radius: 12px;
            border: none;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 100px;
        }
        
        .logout-modal__btn--confirm {
            background: #dc3545;
            color: white;
        }
        
        .logout-modal__btn--confirm:hover {
            background: #c82333;
        }
        
        .logout-modal__btn--cancel {
            background: #6c757d;
            color: white;
        }
        
        .logout-modal__btn--cancel:hover {
            background: #5a6268;
        }
    `;
    document.head.appendChild(style);
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

// Handle logout with custom modal
function handleLogout() {
    showLogoutModal();
}

// Show custom logout confirmation modal
function showLogoutModal() {
    const modal = document.createElement('div');
    modal.className = 'logout-modal';
    modal.innerHTML = `
        <div class="logout-modal__content">
            <h3 class="logout-modal__title">Подтвердите выход</h3>
            <p class="logout-modal__text">Вы уверены, что хотите выйти из аккаунта?</p>
            <div class="logout-modal__buttons">
                <button class="logout-modal__btn logout-modal__btn--cancel" onclick="closeLogoutModal()">
                    Отмена
                </button>
                <button class="logout-modal__btn logout-modal__btn--confirm" onclick="confirmLogout()">
                    Выйти
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeLogoutModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', handleLogoutEscape);
}

// Close logout modal
window.closeLogoutModal = function() {
    const modal = document.querySelector('.logout-modal');
    if (modal) {
        modal.remove();
    }
    document.removeEventListener('keydown', handleLogoutEscape);
};

// Confirm logout
window.confirmLogout = function() {
    closeLogoutModal();
    window.authManager.logout();
};

// Handle escape key for logout modal
function handleLogoutEscape(e) {
    if (e.key === 'Escape') {
        closeLogoutModal();
    }
}

// Set button loading state
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = 'Сохранение...';
        button.style.opacity = '0.6';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Сохранить изменения';
        button.style.opacity = '1';
    }
}

// Show order details (placeholder)
window.showOrderDetails = function(orderId) {
    showNotification('Детали заказа #' + orderId + ' (Функция в разработке)', 'info');
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
    
    let backgroundColor;
    switch (type) {
        case 'success':
            backgroundColor = '#27ce22';
            break;
        case 'error':
            backgroundColor = '#dc3545';
            break;
        case 'info':
            backgroundColor = '#17a2b8';
            break;
        default:
            backgroundColor = '#6c757d';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        background: ${backgroundColor};
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: 'RobotoFlex', sans-serif;
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
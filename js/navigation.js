// Navigation handler to manage authentication state across the site
document.addEventListener('DOMContentLoaded', () => {
    updateNavigationState();
});

function updateNavigationState() {
    const profileLink = document.querySelector('a[href="profile.html"]');
    const orderLinks = document.querySelectorAll('a[href="order.html"]');
    
    if (window.authManager && window.authManager.isAuthenticated()) {
        // User is logged in
        if (profileLink) {
            profileLink.textContent = 'профиль';
            profileLink.href = 'profile.html';
        }
        
        // Order links can work normally
        orderLinks.forEach(link => {
            link.href = 'order.html';
        });
        
    } else {
        // User is not logged in
        if (profileLink) {
            profileLink.textContent = 'войти';
            profileLink.href = 'login.html';
        }
        
        // Order links should redirect to login first
        orderLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'login.html?redirect=' + encodeURIComponent('order.html');
            });
        });
    }
}

// Function to handle profile link clicks
function handleProfileClick(e) {
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        e.preventDefault();
        window.location.href = 'login.html?redirect=' + encodeURIComponent('profile.html');
    }
}

// Add click handler to profile links
document.querySelectorAll('a[href="profile.html"]').forEach(link => {
    link.addEventListener('click', handleProfileClick);
});
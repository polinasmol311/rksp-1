// Basic authentication manager for connecting frontend to Django backend
class AuthManager {
    constructor() {
        // Update this URL to match your Django server
        this.baseURL = 'http://127.0.0.1:8000';
        this.tokenKey = 'access_token';
        this.refreshTokenKey = 'refresh_token';
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem(this.tokenKey);
        if (!token) return false;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            return payload.exp > now;
        } catch (e) {
            return false;
        }
    }

    // Get stored access token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Store tokens
    setTokens(accessToken, refreshToken) {
        localStorage.setItem(this.tokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    // Clear stored tokens
    clearTokens() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    // Make authenticated API request
    async makeAuthenticatedRequest(url, options = {}) {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('Authentication required');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const response = await fetch(url, { ...options, headers });
        
        if (response.status === 401) {
            // Token expired, clear tokens and redirect to login
            this.clearTokens();
            window.location.href = '/login.html';
            throw new Error('Authentication expired');
        }
        
        return response;
    }

    // Login user
    async login(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/users/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.setTokens(data.access, data.refresh);
                return { success: true, data };
            } else {
                const errorData = await response.json();
                return { success: false, error: errorData };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: { detail: 'Network error' } };
        }
    }

    // Register user
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/users/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const errorData = await response.json();
                return { success: false, error: errorData };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: { detail: 'Network error' } };
        }
    }

    // Get user profile
    async getUserProfile() {
        const response = await this.makeAuthenticatedRequest(`${this.baseURL}/api/v1/users/me/`);
        
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Failed to fetch user profile');
        }
    }

    // Update user profile
    async updateUserProfile(userData) {
        const response = await this.makeAuthenticatedRequest(`${this.baseURL}/api/v1/users/me/update/`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
        }
    }

    // Get user orders
    async getUserOrders() {
        const response = await this.makeAuthenticatedRequest(`${this.baseURL}/api/v1/orders/`);
        
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Failed to fetch user orders');
        }
    }

    // Create order
    async createOrder(orderData) {
        const response = await this.makeAuthenticatedRequest(`${this.baseURL}/api/v1/orders/`, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create order');
        }
    }

    // Get tariffs
    async getTariffs() {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/tariffs/`);
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to fetch tariffs');
            }
        } catch (error) {
            console.error('Error fetching tariffs:', error);
            throw error;
        }
    }

    // Logout user
    logout() {
        this.clearTokens();
        window.location.href = '/index.html';
    }

    // Check auth and redirect if needed
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        return true;
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();
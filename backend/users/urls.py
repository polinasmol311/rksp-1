from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='register'),
    
    # User management endpoints
    path('me/', views.UserDetailView.as_view(), name='user-detail'),
    path('me/update/', views.UserUpdateView.as_view(), name='user-update'),
    path('me/delete/', views.UserDeleteView.as_view(), name='user-delete'),
] 
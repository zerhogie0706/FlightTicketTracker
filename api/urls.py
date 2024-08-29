from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('login/', views.LoginAPIView.as_view(), name='login'),
    path('logout/', views.logout, name='logout'),
    path('signup/', views.SignUpAPIView.as_view(), name='signup'),
    path('test/', views.test, name='test'),
    # path('login/', views.login_view, name='login'),
]

router = DefaultRouter()
router.register(r'tracking_record', views.TrackingRecordViewSet)

urlpatterns += router.urls

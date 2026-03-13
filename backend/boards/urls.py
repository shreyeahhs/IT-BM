from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BoardViewSet, PostViewSet

router = DefaultRouter()
router.register(r'boards', BoardViewSet)
router.register(r'posts', PostViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

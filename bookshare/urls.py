from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # App APIs:
    path('api/', include('users.urls')),
    path('api/', include('books.urls')),
    path('api/', include('boards.urls')),
]

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User
from .models import Email

admin.site.register(Email)
admin.site.register(User, UserAdmin)
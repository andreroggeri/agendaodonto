from django.conf import settings
from rest_framework.permissions import BasePermission


class IsApiKeyValid(BasePermission):
    def has_permission(self, request, view):
        if settings.API_KEY is None:
            return False

        authorization = request.headers.get('Authorization')

        if authorization is not None and 'ApiKey' in authorization:
            _, key = authorization.split(' ')
            return key == settings.API_KEY
        return False

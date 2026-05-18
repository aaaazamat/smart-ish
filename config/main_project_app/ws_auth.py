"""
WebSocket uchun JWT autentifikatsiya middleware.

Brauzerlar WebSocket so'rovida custom header (Authorization) yuborolmaydi,
shuning uchun JWT token query string orqali uzatiladi:

    ws://host/ws/notifications/?token=<access_token>

Middleware token'ni tekshiradi va `scope['user']` ga User obyekti'ni
yoki AnonymousUser'ni qo'yadi. Consumer'da `self.scope['user']` orqali
foydalanish mumkin.
"""
import logging
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken

logger = logging.getLogger(__name__)


@database_sync_to_async
def _get_user(user_id: int):
    from main_project_app.models import User
    try:
        return User.objects.get(pk=user_id, is_active=True)
    except User.DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """JWT access token'ni query string'dan o'qib, scope['user'] ga qo'yadi."""

    async def __call__(self, scope, receive, send):
        scope["user"] = AnonymousUser()

        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token = params.get("token", [None])[0]

        if token:
            try:
                validated_token = UntypedToken(token)
                user_id = validated_token.get("user_id")
                if user_id:
                    scope["user"] = await _get_user(user_id)
            except (InvalidToken, TokenError) as e:
                logger.warning("WS JWT noto'g'ri: %s", e)
            except Exception as e:
                logger.warning("WS JWT xatosi: %s", e)

        return await super().__call__(scope, receive, send)

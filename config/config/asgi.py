"""
ASGI config for config project.

Bu fayl HTTP (Django) va WebSocket (Channels) protokollarini birga
yo'naltiradi. WebSocket so'rovlari JWT middleware orqali o'tib,
NotificationConsumer'ga keladi.
"""
import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from channels.security.websocket import AllowedHostsOriginValidator  # noqa: E402
from django.core.asgi import get_asgi_application  # noqa: E402

from main_project_app.routing import websocket_urlpatterns  # noqa: E402
from main_project_app.ws_auth import JWTAuthMiddleware  # noqa: E402


# Oddiy HTTP so'rovlari Django'ga
django_asgi_app = get_asgi_application()


# Asosiy router — HTTP va WebSocket'ni ajratadi
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddleware(URLRouter(websocket_urlpatterns))
    ),
})

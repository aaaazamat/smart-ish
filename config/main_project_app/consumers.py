"""
WebSocket consumer'lari — real-time bildirishnomalar uchun.

Foydalanuvchi WebSocket orqali ulanadi (`ws://host/ws/notifications/?token=...`),
JWT bilan autentifikatsiya qilinadi va o'z guruhiga (`user_<id>`) qo'shiladi.
Backend yangi bildirishnoma yaratganda, shu guruhga yuboriladi va consumer
clientga JSON xabar uzatadi.
"""
import logging
from channels.generic.websocket import AsyncJsonWebsocketConsumer

logger = logging.getLogger(__name__)


def user_group_name(user_id: int) -> str:
    """Foydalanuvchi WebSocket guruhi nomi (har bir user o'z guruhida)."""
    return f"user_{user_id}"


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """
    Bildirishnomalarni real-time yetkazib beruvchi WebSocket consumer.

    Hayot davomiyligi:
      1. Client ulanadi → JWT tekshiriladi → guruhga qo'shiladi
      2. Backend bildirishnoma yaratsa → channel_layer.group_send orqali keladi
      3. Consumer xabarni JSON ko'rinishida clientga uzatadi
      4. Client uzilganda → guruhdan chiqariladi

    Xato kodlari:
      4001 — JWT yo'q yoki noto'g'ri (autentifikatsiya muvaffaqiyatsiz)
    """

    async def connect(self):
        user = self.scope.get("user")
        if not user or user.is_anonymous:
            # Autentifikatsiya muvaffaqiyatsiz — close (4001 custom code)
            await self.close(code=4001)
            return

        self.user = user
        self.group_name = user_group_name(user.id)

        # Foydalanuvchini o'z guruhiga qo'shish
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Client'ga ulanish muvaffaqiyatli ekanini bildirish
        await self.send_json({
            "type": "connection_established",
            "user_id": user.id,
        })
        logger.info("WS ulanish: user_id=%s, group=%s", user.id, self.group_name)

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.info("WS uzildi: group=%s, code=%s", self.group_name, close_code)

    async def receive_json(self, content, **kwargs):
        """
        Client'dan kelgan xabarlar — hozircha faqat ping/pong support.
        Kelajakda "mark_read" kabi commandalarni qo'shish mumkin.
        """
        msg_type = content.get("type")
        if msg_type == "ping":
            await self.send_json({"type": "pong"})

    # ───── channel_layer'dan keladigan event handler'lar ─────

    async def notification_message(self, event):
        """
        `type: 'notification.message'` event'ini qabul qiladi va
        clientga JSON ko'rinishda uzatadi.

        event = {
          "type": "notification.message",
          "data": { ... serialized notification ... }
        }
        """
        await self.send_json({
            "type": "notification",
            "data": event["data"],
        })

    async def unread_count_update(self, event):
        """
        O'qilmagan bildirishnomalar soni o'zgarganda yuboriladi
        (masalan, foydalanuvchi bildirishnoma o'qiganida).
        """
        await self.send_json({
            "type": "unread_count",
            "count": event["count"],
        })

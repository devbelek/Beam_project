import json
from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("notifications", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("notifications", self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message', '')
        item_type = text_data_json.get('item_type', 'unknown')
        await self.channel_layer.group_send(
            "notifications",
            {
                'type': 'notification_message',
                'message': message,
                'item_type': item_type,
                'id': text_data_json.get('id', None),
                'name': text_data_json.get('name', 'Unknown'),
            }
        )

    async def notification_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event.get('message', ''),
            'item_type': event.get('item_type', 'unknown'),
            'id': event.get('id', None),
            'name': event.get('name', 'Unknown'),
        }))

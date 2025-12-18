from user_messages.models import Message

# 获取所有消息
messages = Message.objects.all()
print(f"Total messages: {messages.count()}")

# 遍历消息，打印媒体文件路径
for msg in messages:
    print(f"\nMessage ID: {msg.id}")
    print(f"Sender: {msg.sender.username if msg.sender else 'System'}")
    print(f"Recipient: {msg.recipient.username}")
    print(f"Content: {msg.content}")
    print(f"Image: {msg.image}")
    print(f"Image URL: {msg.image.url if msg.image else 'None'}")
    print(f"Video: {msg.video}")
    print(f"Video URL: {msg.video.url if msg.video else 'None'}")

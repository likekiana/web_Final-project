"""
私信应用视图
"""

from rest_framework import status, generics, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q

from accounts.models import User
from .models import Message
from .serializers import MessageSerializer, MessageListSerializer, MessageCreateSerializer, MessageConversationSerializer


class MessageViewSet(viewsets.ModelViewSet):
    """私信视图集"""
    
    serializer_class = MessageListSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete']
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """获取当前用户的私信列表"""
        return Message.objects.filter(
            Q(sender=self.request.user) | Q(recipient=self.request.user)
        ).order_by('-created_at')
    
    def get_serializer_class(self):
        """根据请求方法选择序列化器"""
        if self.action == 'create':
            return MessageCreateSerializer
        elif self.action == 'retrieve':
            return MessageSerializer
        return MessageListSerializer
    
    def list(self, request, *args, **kwargs):
        """获取私信列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取私信列表成功",
                "data": serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取私信列表成功",
            "data": serializer.data
        })
    
    def retrieve(self, request, *args, **kwargs):
        """获取私信详情"""
        instance = self.get_object()
        # 如果当前用户是收件人，标记为已读
        if instance.recipient == request.user:
            instance.mark_as_read()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "获取私信详情成功",
            "data": serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        """创建私信"""
        # 确保序列化器获取到请求上下文
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        # 创建私信
        message = serializer.save()
        
        serializer = MessageSerializer(message)
        return Response({
            "success": True,
            "message": "私信发送成功",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def partial_update(self, request, *args, **kwargs):
        """更新私信状态"""
        instance = self.get_object()
        
        # 只允许收件人标记为已读
        if instance.recipient == request.user:
            instance.mark_as_read()
            serializer = MessageSerializer(instance)
            return Response({
                "success": True,
                "message": "私信已标记为已读",
                "data": serializer.data
            })
        else:
            return Response({
                "success": False,
                "message": "只有收件人才能标记私信为已读",
                "error": {
                    "code": 403,
                    "details": "Permission denied"
                }
            }, status=status.HTTP_403_FORBIDDEN)
    
    def destroy(self, request, *args, **kwargs):
        """删除私信"""
        instance = self.get_object()
        instance.delete()
        return Response({
            "success": True,
            "message": "私信已删除",
            "data": None
        }, status=status.HTTP_200_OK)


class MessageConversationView(generics.ListAPIView):
    """获取与特定用户的对话"""
    
    serializer_class = MessageConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """获取与特定用户的对话"""
        other_user_id = self.kwargs.get('user_id')
        return Message.objects.filter(
            Q(sender=self.request.user, recipient_id=other_user_id) |
            Q(sender_id=other_user_id, recipient=self.request.user)
        ).order_by('created_at')
    
    def list(self, request, *args, **kwargs):
        """获取对话列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 将当前用户作为收件人的未读消息标记为已读
        from datetime import datetime
        queryset.filter(
            recipient=request.user,
            status=Message.Status.UNREAD
        ).update(
            status=Message.Status.READ,
            read_at=datetime.now()
        )
        
        serializer = self.get_serializer(queryset, many=True, context={'user': request.user})
        return Response({
            "success": True,
            "message": "获取对话成功",
            "data": serializer.data
        })


class MessageConversationListView(generics.ListAPIView):
    """获取对话列表"""
    
    serializer_class = MessageConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """获取对话列表"""
        # 获取所有对话用户
        messages = Message.objects.filter(
            Q(sender=self.request.user) | Q(recipient=self.request.user)
        ).order_by('-created_at')
        
        # 获取唯一的对话用户ID
        conversation_user_ids = set()
        current_user_id = self.request.user.id
        for message in messages:
            if message.sender == self.request.user:
                # 发送者是当前用户，对话用户是接收者
                if message.recipient.id != current_user_id:  # 过滤掉自己
                    conversation_user_ids.add(message.recipient.id)
            elif message.sender:
                # 发送者不是当前用户且不为空，对话用户是发送者
                if message.sender.id != current_user_id:  # 过滤掉自己
                    conversation_user_ids.add(message.sender.id)
        
        # 获取每个对话的最新消息
        latest_messages = []
        for user_id in conversation_user_ids:
            latest_message = Message.objects.filter(
                Q(sender=self.request.user, recipient_id=user_id) |
                Q(sender_id=user_id, recipient=self.request.user)
            ).order_by('-created_at').first()
            if latest_message:
                latest_messages.append(latest_message)
        
        # 按最新消息时间排序
        latest_messages.sort(key=lambda x: x.created_at, reverse=True)
        
        return latest_messages
    
    def list(self, request, *args, **kwargs):
        """获取对话列表"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'user': request.user})
        return Response({
            "success": True,
            "message": "获取对话列表成功",
            "data": serializer.data
        })


class MessageMarkAllReadView(generics.GenericAPIView):
    """标记所有私信为已读"""
    
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        """标记所有私信为已读"""
        # 获取所有未读私信
        messages = Message.objects.filter(
            recipient=request.user,
            status=Message.Status.UNREAD
        )
        
        # 标记为已读
        from datetime import datetime
        messages.update(
            status=Message.Status.READ,
            read_at=datetime.now()
        )
        
        return Response({
            "success": True,
            "message": "所有私信已标记为已读",
            "data": {
                "count": messages.count()
            }
        }, status=status.HTTP_200_OK)


class MessageCountView(generics.GenericAPIView):
    """获取未读私信数量"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """获取未读私信数量"""
        # 获取未读私信数量
        unread_count = Message.objects.filter(
            recipient=request.user,
            status=Message.Status.UNREAD
        ).count()
        
        return Response({
            "success": True,
            "message": "获取未读私信数量成功",
            "data": {
                "unread_count": unread_count
            }
        }, status=status.HTTP_200_OK)
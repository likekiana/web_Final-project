"""
用户认证应用视图
"""

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q

from .models import User
from .serializers import (
    UserSerializer, UserLoginSerializer, 
    UserProfileSerializer, UserListSerializer
)
from content.serializers import PostListSerializer
from content.models import Post


class UserRegisterView(generics.CreateAPIView):
    """用户注册视图"""
    
    serializer_class = UserSerializer
    permission_classes = []
    
    def create(self, request, *args, **kwargs):
        """处理用户注册请求"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # 生成JWT令牌
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "success": True,
            "message": "注册成功",
            "data": {
                "user": UserProfileSerializer(user, context={'request': request}).data,
                "token": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token)
                }
            }
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    """用户登录视图"""
    
    serializer_class = UserLoginSerializer
    permission_classes = []
    
    def post(self, request, *args, **kwargs):
        """处理用户登录请求"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 验证用户身份
        user = authenticate(
            username=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        
        if not user:
            return Response({
                "success": False,
                "message": "邮箱或密码错误",
                "error": {
                    "code": 401,
                    "details": "邮箱或密码错误"
                }
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # 检查用户状态
        if user.status != User.Status.ACTIVE:
            return Response({
                "success": False,
                "message": "账号已被封禁",
                "error": {
                    "code": 403,
                    "details": "账号已被封禁"
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        # 生成JWT令牌
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "success": True,
            "message": "登录成功",
            "data": {
                "user": UserProfileSerializer(user, context={'request': request}).data,
                "token": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token)
                }
            }
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """用户个人资料视图"""
    
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """获取当前登录用户"""
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        """获取用户资料"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response({
            "success": True,
            "message": "获取成功",
            "data": serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """更新用户资料"""
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            "success": True,
            "message": "更新成功",
            "data": serializer.data
        })


class UserDetailView(generics.RetrieveUpdateAPIView):
    """获取和更新指定用户信息视图"""
    
    serializer_class = UserProfileSerializer
    permission_classes = []
    queryset = User.objects.all()
    lookup_field = 'id'
    
    def retrieve(self, request, *args, **kwargs):
        """获取用户信息"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response({
            "success": True,
            "message": "获取成功",
            "data": serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """更新用户信息"""
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            "success": True,
            "message": "更新成功",
            "data": serializer.data
        })


class UserListView(generics.ListAPIView):
    """用户列表视图（管理员）"""
    
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    
    def get_queryset(self):
        """获取过滤后的用户列表"""
        queryset = super().get_queryset()
        
        # 搜索关键词
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) | 
                Q(email__icontains=search)
            )
        
        # 角色筛选
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        # 状态筛选
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """获取用户列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page_size = 10
        page_number = request.query_params.get('page', 1)
        
        try:
            page_number = int(page_number)
            if page_number < 1:
                page_number = 1
        except ValueError:
            page_number = 1
        
        # 计算偏移量
        offset = (page_number - 1) * page_size
        
        # 获取当前页数据
        page_queryset = queryset[offset:offset + page_size]
        
        # 序列化数据
        serializer = self.get_serializer(page_queryset, many=True)
        
        # 计算总页数
        total_items = queryset.count()
        total_pages = (total_items + page_size - 1) // page_size
        
        return Response({
            "success": True,
            "message": "获取成功",
            "data": {
                "users": serializer.data,
                "pagination": {
                    "currentPage": page_number,
                    "totalPages": total_pages,
                    "totalItems": total_items,
                    "pageSize": page_size
                }
            }
        })


class UserRoleUpdateView(generics.UpdateAPIView):
    """更新用户角色视图（管理员）"""
    
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        """更新用户角色"""
        instance = self.get_object()
        
        # 只允许更新角色
        if 'role' not in request.data:
            return Response({
                "success": False,
                "message": "请提供角色信息",
                "error": {
                    "code": 400,
                    "details": "请提供角色信息"
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(
            instance, 
            data={'role': request.data['role']}, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            "success": True,
            "message": "角色更新成功",
            "data": serializer.data
        })


class UserStatusUpdateView(generics.UpdateAPIView):
    """更新用户状态视图（管理员）"""
    
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        """更新用户状态"""
        instance = self.get_object()
        
        # 只允许更新状态
        if 'status' not in request.data:
            return Response({
                "success": False,
                "message": "请提供状态信息",
                "error": {
                    "code": 400,
                    "details": "请提供状态信息"
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(
            instance, 
            data={'status': request.data['status']}, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            "success": True,
            "message": "状态更新成功",
            "data": serializer.data
        })


class UserPasswordResetView(generics.UpdateAPIView):
    """重置用户密码视图（管理员）"""
    
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        """重置用户密码"""
        instance = self.get_object()
        
        # 只允许更新密码
        if 'password' not in request.data:
            return Response({
                "success": False,
                "message": "请提供新密码",
                "error": {
                    "code": 400,
                    "details": "请提供新密码"
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 更新密码
        instance.set_password(request.data['password'])
        instance.save()
        
        serializer = self.get_serializer(instance)
        
        return Response({
            "success": True,
            "message": "密码重置成功",
            "data": serializer.data
        })


class UserPostsView(generics.ListAPIView):
    """获取指定用户帖子列表视图"""
    
    serializer_class = PostListSerializer
    permission_classes = []
    
    def get_queryset(self):
        """获取指定用户的帖子列表"""
        user_id = self.kwargs.get('id')
        return Post.objects.filter(
            user_id=user_id,
            status='normal'
        ).order_by('-is_sticky', '-is_essential', '-created_at')
    
    def list(self, request, *args, **kwargs):
        """获取用户帖子列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page_size = 10
        page_number = request.query_params.get('page', 1)
        
        try:
            page_number = int(page_number)
            if page_number < 1:
                page_number = 1
        except ValueError:
            page_number = 1
        
        # 计算偏移量
        offset = (page_number - 1) * page_size
        
        # 获取当前页数据
        page_queryset = queryset[offset:offset + page_size]
        
        # 序列化数据
        serializer = self.get_serializer(page_queryset, many=True, context={'request': request})
        
        # 计算总页数
        total_items = queryset.count()
        total_pages = (total_items + page_size - 1) // page_size
        
        return Response({
            "success": True,
            "message": "获取成功",
            "data": {
                "posts": serializer.data,
                "pagination": {
                    "currentPage": page_number,
                    "totalPages": total_pages,
                    "totalItems": total_items,
                    "pageSize": page_size
                }
            }
        })

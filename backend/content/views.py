"""
内容管理应用视图
"""

from rest_framework import status, generics, parsers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Q
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid

from .models import Category, Post, Comment
from accounts.models import User
from ads.models import Advertisement
from reports.models import Report
from ai_audit.services import AIAuditService
from ai_audit.models import AuditResult
from .serializers import (
    CategorySerializer, CategoryListSerializer,
    PostSerializer, PostListSerializer,
    CommentSerializer, CommentListSerializer
)


class CategoryListView(generics.ListCreateAPIView):
    """板块列表视图"""
    
    serializer_class = CategoryListSerializer
    permission_classes = []
    queryset = Category.objects.all()
    ordering = ['order', 'name']
    
    def get_permissions(self):
        """根据请求方法设置权限"""
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return []
    
    def list(self, request, *args, **kwargs):
        """获取板块列表"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取成功",
            "data": serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        """创建板块"""
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = serializer.save()
        return Response({
            "success": True,
            "message": "创建成功",
            "data": CategorySerializer(category).data
        }, status=status.HTTP_201_CREATED)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """板块详情视图"""
    
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    lookup_field = 'id'
    
    def get_permissions(self):
        """根据请求方法设置权限"""
        if self.request.method in ['PUT', 'DELETE']:
            return [IsAdminUser()]
        return []
    
    def retrieve(self, request, *args, **kwargs):
        """获取板块详情"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "获取成功",
            "data": serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """更新板块"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        category = serializer.save()
        return Response({
            "success": True,
            "message": "更新成功",
            "data": CategorySerializer(category).data
        })
    
    def destroy(self, request, *args, **kwargs):
        """删除板块"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "success": True,
            "message": "删除成功",
            "data": None
        })


class PostListView(generics.ListCreateAPIView):
    """帖子列表视图"""
    
    serializer_class = PostListSerializer
    permission_classes = []
    queryset = Post.objects.all()
    ordering = ['-is_sticky', '-is_essential', '-created_at']
    
    def get_permissions(self):
        """根据请求方法设置权限"""
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return []
    
    def get_queryset(self):
        """获取过滤后的帖子列表"""
        queryset = super().get_queryset()
        
        # 关键词搜索
        keyword = self.request.query_params.get('keyword', None)
        if keyword:
            queryset = queryset.filter(
                Q(title__icontains=keyword) | 
                Q(content__icontains=keyword)
            )
        
        # 板块筛选
        category_id = self.request.query_params.get('categoryId', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # 类型筛选
        type = self.request.query_params.get('type', None)
        if type:
            queryset = queryset.filter(type=type)
        
        # 状态筛选（管理员可用）
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # 排序字段
        sort_by = self.request.query_params.get('sortBy', 'createdAt')
        order = self.request.query_params.get('order', 'desc')
        
        # 映射排序字段
        sort_field_map = {
            'createdAt': 'created_at',
            'likesCount': 'likes_count',
            'commentsCount': 'comments_count'
        }
        
        # 构建排序字段列表，始终将置顶和精华放在前面
        ordering = ['-is_sticky', '-is_essential']
        
        if sort_by in sort_field_map:
            sort_field = sort_field_map[sort_by]
            if order == 'desc':
                sort_field = f'-{sort_field}'
            ordering.append(sort_field)
        
        queryset = queryset.order_by(*ordering)
        
        # 检查请求路径，判断是否为管理员访问
        if 'admin' not in self.request.path:
            # 普通用户只显示正常状态的帖子
            queryset = queryset.filter(status='normal')
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """获取帖子列表"""
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
                "posts": serializer.data,
                "pagination": {
                    "currentPage": page_number,
                    "totalPages": total_pages,
                    "totalItems": total_items,
                    "pageSize": page_size
                }
            }
        })
    
    def create(self, request, *args, **kwargs):
        """创建帖子"""
        # 获取请求数据
        data = request.data.copy()
        
        # AI审核帖子内容，替换敏感词
        if 'content' in data:
            audit_service = AIAuditService()
            audit_result = audit_service.audit_content(data['content'])
            # 使用替换后的内容
            data['content'] = audit_result['clean_content']
        
        serializer = PostSerializer(data=data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
            post = serializer.save()
            
            # 保存审核结果
            AuditResult.objects.create(
                object_id=post.id,
                audit_type='post',
                violation_type=audit_result['violation_type'],
                confidence=audit_result['confidence'],
                has_violation=audit_result['has_violation'],
                sensitive_words=audit_result['sensitive_words'],
                violation_reason=audit_result['violation_reason']
            )
            
            # 如果检测到违规，更新帖子状态
            if audit_result['has_violation']:
                post.status = 'reported'
                post.save(update_fields=['status'])
                
            return Response({
                "success": True,
                "message": "创建成功" if not audit_result['has_violation'] else "帖子已提交，正在审核",
                "data": PostSerializer(post).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print("创建帖子失败:", str(e))
            return Response({
                "success": False,
                "message": "创建失败",
                "error": {
                    "code": 400,
                    "details": serializer.errors if hasattr(serializer, 'errors') else str(e)
                }
            }, status=status.HTTP_400_BAD_REQUEST)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """帖子详情视图"""
    
    serializer_class = PostSerializer
    queryset = Post.objects.all()
    lookup_field = 'id'
    
    def get_permissions(self):
        """根据请求方法设置权限"""
        if self.request.method in ['PUT', 'DELETE']:
            return [IsAuthenticated()]
        return []
    
    def retrieve(self, request, *args, **kwargs):
        """获取帖子详情"""
        instance = self.get_object()
        
        # 检查帖子状态，普通用户只能查看正常状态的帖子
        if instance.status != 'normal' and 'admin' not in request.path:
            return Response({
                "success": False,
                "message": "帖子不存在或已被隐藏",
                "error": {
                    "code": 404,
                    "details": "帖子不存在或已被隐藏"
                }
            }, status=status.HTTP_404_NOT_FOUND)
        
        # 增加浏览量
        instance.increment_views_count()
        
        # 记录浏览历史（如果用户已登录）
        if request.user.is_authenticated:
            from browsing_history.models import BrowsingHistory
            from django.utils import timezone
            # 使用get_or_create确保每个用户对每个帖子只有一条记录
            BrowsingHistory.objects.update_or_create(
                user=request.user,
                post=instance,
                defaults={'viewed_at': timezone.now()}
            )
        
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "获取成功",
            "data": serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """更新帖子"""
        instance = self.get_object()
        # 检查权限：只有帖子作者或管理员可以更新
        if instance.user != request.user and not request.user.is_staff:
            return Response({
                "success": False,
                "message": "无权限更新此帖子",
                "error": {
                    "code": 403,
                    "details": "无权限更新此帖子"
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(
            instance, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        post = serializer.save()
        return Response({
            "success": True,
            "message": "更新成功",
            "data": PostSerializer(post).data
        })
    
    def destroy(self, request, *args, **kwargs):
        """删除帖子"""
        instance = self.get_object()
        # 检查权限：只有帖子作者或管理员可以删除
        if instance.user != request.user and not request.user.is_staff:
            return Response({
                "success": False,
                "message": "无权限删除此帖子",
                "error": {
                    "code": 403,
                    "details": "无权限删除此帖子"
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        instance.delete()
        return Response({
            "success": True,
            "message": "删除成功",
            "data": None
        })


class PostPinView(generics.UpdateAPIView):
    """帖子置顶视图（管理员）"""
    
    serializer_class = PostSerializer
    permission_classes = [IsAdminUser]
    queryset = Post.objects.all()
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        """置顶帖子"""
        instance = self.get_object()
        instance.is_sticky = True
        instance.save(update_fields=['is_sticky'])
        return Response({
            "success": True,
            "message": "帖子已置顶",
            "data": PostSerializer(instance).data
        })


class PostUnpinView(generics.UpdateAPIView):
    """取消帖子置顶视图（管理员）"""
    
    serializer_class = PostSerializer
    permission_classes = [IsAdminUser]
    queryset = Post.objects.all()
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        """取消帖子置顶"""
        instance = self.get_object()
        instance.is_sticky = False
        instance.save(update_fields=['is_sticky'])
        return Response({
            "success": True,
            "message": "帖子已取消置顶",
            "data": PostSerializer(instance).data
        })


class AdminCommentListView(generics.ListAPIView):
    """管理员获取评论列表视图"""
    
    serializer_class = CommentSerializer
    permission_classes = [IsAdminUser]
    queryset = Comment.objects.all()
    ordering = ['-created_at']
    
    def get_queryset(self):
        """获取过滤后的评论列表"""
        queryset = super().get_queryset()
        
        # 关键词搜索
        keyword = self.request.query_params.get('keyword', None)
        if keyword:
            queryset = queryset.filter(
                Q(content__icontains=keyword) | 
                Q(post__title__icontains=keyword) | 
                Q(user__username__icontains=keyword)
            )
        
        # 帖子筛选
        post_id = self.request.query_params.get('postId', None)
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        # 用户筛选
        user_id = self.request.query_params.get('userId', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # 状态筛选
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """获取评论列表"""
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
                "comments": serializer.data,
                "pagination": {
                    "currentPage": page_number,
                    "totalPages": total_pages,
                    "totalItems": total_items,
                    "pageSize": page_size
                }
            }
        })


class AdminCommentDeleteView(generics.DestroyAPIView):
    """管理员删除评论视图"""
    
    serializer_class = CommentSerializer
    permission_classes = [IsAdminUser]
    queryset = Comment.objects.all()
    lookup_field = 'id'
    
    def destroy(self, request, *args, **kwargs):
        """删除评论"""
        instance = self.get_object()
        instance.delete()
        return Response({
            "success": True,
            "message": "评论已删除",
            "data": None
        })


class CommentListView(generics.ListCreateAPIView):
    """评论列表视图"""
    
    serializer_class = CommentListSerializer
    permission_classes = []
    queryset = Comment.objects.all()
    ordering = ['created_at']
    
    def get_permissions(self):
        """根据请求方法设置权限"""
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return []
    
    def get_queryset(self):
        """获取过滤后的评论列表"""
        queryset = super().get_queryset()
        
        # 帖子筛选
        post_id = self.request.query_params.get('postId', None)
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        # 用户筛选
        user_id = self.request.query_params.get('userId', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # 状态筛选
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # 检查请求路径，判断是否为管理员访问
        if 'admin' not in self.request.path:
            # 普通用户只显示正常状态的评论
            queryset = queryset.filter(status='normal')
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """获取评论列表"""
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
                "comments": serializer.data,
                "pagination": {
                    "currentPage": page_number,
                    "totalPages": total_pages,
                    "totalItems": total_items,
                    "pageSize": page_size
                }
            }
        })
    
    def create(self, request, *args, **kwargs):
        """创建评论"""
        # 获取请求数据
        data = request.data.copy()
        
        # AI审核评论内容，替换敏感词
        if 'content' in data:
            audit_service = AIAuditService()
            audit_result = audit_service.audit_content(data['content'])
            # 使用替换后的内容
            data['content'] = audit_result['clean_content']
        
        serializer = CommentSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        
        # 保存审核结果
        AuditResult.objects.create(
            object_id=comment.id,
            audit_type='comment',
            violation_type=audit_result['violation_type'],
            confidence=audit_result['confidence'],
            has_violation=audit_result['has_violation'],
            sensitive_words=audit_result['sensitive_words'],
            violation_reason=audit_result['violation_reason']
        )
        
        # 如果检测到违规，更新评论状态
        if audit_result['has_violation']:
            comment.status = 'reported'
            comment.save(update_fields=['status'])
            
        return Response({
            "success": True,
            "message": "创建成功" if not audit_result['has_violation'] else "评论已提交，正在审核",
            "data": CommentSerializer(comment).data
        }, status=status.HTTP_201_CREATED)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """评论详情视图"""
    
    serializer_class = CommentSerializer
    queryset = Comment.objects.all()
    lookup_field = 'id'
    
    def get_permissions(self):
        """根据请求方法设置权限"""
        if self.request.method in ['PUT', 'DELETE']:
            return [IsAuthenticated()]
        return []
    
    def get_queryset(self):
        """获取特定帖子下的评论"""
        queryset = super().get_queryset()
        post_id = self.kwargs.get('post_id')
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        return queryset
    
    def update(self, request, *args, **kwargs):
        """更新评论"""
        instance = self.get_object()
        # 检查权限：只有评论作者或管理员可以更新
        if instance.user != request.user and not request.user.is_staff:
            return Response({
                "success": False,
                "message": "无权限更新此评论",
                "error": {
                    "code": 403,
                    "details": "无权限更新此评论"
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(
            instance, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        return Response({
            "success": True,
            "message": "更新成功",
            "data": CommentSerializer(comment).data
        })
    
    def destroy(self, request, *args, **kwargs):
        """删除评论"""
        instance = self.get_object()
        # 检查权限：只有评论作者或管理员可以删除
        if instance.user != request.user and not request.user.is_staff:
            return Response({
                "success": False,
                "message": "无权限删除此评论",
                "error": {
                    "code": 403,
                    "details": "无权限删除此评论"
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        instance.delete()
        return Response({
            "success": True,
            "message": "删除成功",
            "data": None
        })


class PostCommentsView(generics.ListAPIView):
    """获取帖子的评论列表"""
    
    serializer_class = CommentListSerializer
    permission_classes = []
    
    def get_queryset(self):
        """获取指定帖子的评论列表"""
        post_id = self.kwargs.get('post_id')
        # 只返回正常状态帖子的评论
        return Comment.objects.filter(
            post_id=post_id, 
            status='normal',
            post__status='normal'
        ).order_by('created_at')
    
    def list(self, request, *args, **kwargs):
        """获取评论列表"""
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
                "comments": serializer.data,
                "pagination": {
                    "currentPage": page_number,
                    "totalPages": total_pages,
                    "totalItems": total_items,
                    "pageSize": page_size
                }
            }
        })


class PostCommentCreateView(generics.CreateAPIView):
    """在指定帖子下创建评论"""
    
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """创建评论"""
        post_id = self.kwargs.get('post_id')
        
        # 检查帖子状态，只有正常状态的帖子才能评论
        try:
            post = Post.objects.get(id=post_id)
            if post.status != 'normal':
                return Response({
                    "success": False,
                    "message": "帖子不存在或已被隐藏，无法评论",
                    "error": {
                        "code": 404,
                        "details": "帖子不存在或已被隐藏，无法评论"
                    }
                }, status=status.HTTP_404_NOT_FOUND)
        except Post.DoesNotExist:
            return Response({
                "success": False,
                "message": "帖子不存在，无法评论",
                "error": {
                    "code": 404,
                    "details": "帖子不存在，无法评论"
                }
            }, status=status.HTTP_404_NOT_FOUND)
        
        request.data['post'] = post_id
        serializer = CommentSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        return Response({
            "success": True,
            "message": "创建成功",
            "data": CommentSerializer(comment).data
        }, status=status.HTTP_201_CREATED)


class DashboardStatsView(generics.GenericAPIView):
    """仪表盘统计数据视图"""
    
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """获取统计数据"""
        from django.db.models import Count
        
        # 统计数据
        total_users = User.objects.count()
        total_posts = Post.objects.count()
        total_categories = Category.objects.count()
        total_ads = Advertisement.objects.count()
        
        # 待处理事项
        pending_posts = Post.objects.filter(status='pending').count()
        pending_reports = Report.objects.filter(status='pending').count()
        pending_ads = Advertisement.objects.filter(status='pending').count()
        
        # 最近动态（最近5条记录）
        
        # 最近5条帖子创建记录
        recent_posts = Post.objects.order_by('-created_at')[:5]
        recent_posts_data = [{"type": "post", "content": f"用户 {post.user.username} 发布了新帖子", "created_at": post.created_at} for post in recent_posts]
        
        # 最近5条广告创建记录
        recent_ads = Advertisement.objects.order_by('-created_at')[:5]
        recent_ads_data = [{"type": "ad", "content": f"商户 {ad.merchant.username} 发布了新广告", "created_at": ad.created_at} for ad in recent_ads]
        
        # 最近5条用户注册记录
        recent_users = User.objects.order_by('-created_at')[:5]
        recent_users_data = [{"type": "user", "content": f"用户 {user.username} 注册了账号", "created_at": user.created_at} for user in recent_users]
        
        # 合并并排序最近动态
        recent_activities = sorted(
            recent_posts_data + recent_ads_data + recent_users_data,
            key=lambda x: x["created_at"],
            reverse=True
        )[:5]  # 只取最近5条
        
        # 格式化最近动态
        formatted_activities = [activity["content"] for activity in recent_activities]
        
        return Response({
            "success": True,
            "message": "获取统计数据成功",
            "data": {
                "stats": {
                    "total_users": total_users,
                    "total_posts": total_posts,
                    "total_categories": total_categories,
                    "total_ads": total_ads
                },
                "pending_items": {
                    "pending_posts": pending_posts,
                    "pending_reports": pending_reports,
                    "pending_ads": pending_ads
                },
                "recent_activities": formatted_activities
            }
        })


class FileUploadView(generics.GenericAPIView):
    """文件上传视图，用于处理图片和视频的上传"""
    
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    
    def post(self, request):
        """处理文件上传请求"""
        try:
            # 获取上传的文件
            file = request.FILES.get('file')
            if not file:
                return Response({
                    "success": False,
                    "message": "请选择要上传的文件",
                    "error": {
                        "code": 400,
                        "details": "文件不能为空"
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 验证文件类型
            allowed_types = {
                'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                'video/mp4', 'video/mov', 'video/avi', 'video/quicktime'
            }
            if file.content_type not in allowed_types:
                return Response({
                    "success": False,
                    "message": "文件类型不允许",
                    "error": {
                        "code": 400,
                        "details": "只允许上传图片（JPG、PNG、GIF、WebP）和视频（MP4、MOV、AVI、QuickTime）文件"
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 验证文件大小
            max_size = 10 * 1024 * 1024  # 10MB
            if file.size > max_size:
                return Response({
                    "success": False,
                    "message": "文件大小超过限制",
                    "error": {
                        "code": 400,
                        "details": f"文件大小不能超过 {max_size / 1024 / 1024}MB"
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 生成唯一文件名
            ext = os.path.splitext(file.name)[1]
            unique_filename = f"{uuid.uuid4()}{ext}"
            
            # 根据文件类型确定保存路径
            if file.content_type.startswith('image/'):
                file_path = os.path.join('post_images', unique_filename)
            else:  # video/
                file_path = os.path.join('post_videos', unique_filename)
            
            # 保存文件
            file_url = default_storage.save(file_path, ContentFile(file.read()))
            
            # 构建完整的URL，包含域名
            from django.conf import settings
            # 获取请求的协议和域名
            protocol = 'https' if request.is_secure() else 'http'
            domain = request.get_host()
            full_url = f"{protocol}://{domain}{settings.MEDIA_URL}{file_url}"
            
            return Response({
                "success": True,
                "message": "文件上传成功",
                "data": {
                    "url": full_url,
                    "name": file.name,
                    "size": file.size,
                    "type": file.content_type
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"文件上传失败: {str(e)}")
            return Response({
                "success": False,
                "message": "文件上传失败",
                "error": {
                    "code": 500,
                    "details": str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

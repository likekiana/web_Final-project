"""
内容管理应用视图
"""

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Q

from .models import Category, Post, Comment
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
        
        # 排序字段
        sort_by = self.request.query_params.get('sortBy', 'createdAt')
        order = self.request.query_params.get('order', 'desc')
        
        # 映射排序字段
        sort_field_map = {
            'createdAt': 'created_at',
            'likesCount': 'likes_count',
            'commentsCount': 'comments_count'
        }
        
        if sort_by in sort_field_map:
            sort_field = sort_field_map[sort_by]
            if order == 'desc':
                sort_field = f'-{sort_field}'
            queryset = queryset.order_by(sort_field)
        
        # 只显示正常状态的帖子
        queryset = queryset.filter(status='normal')
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """获取帖子列表"""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取成功",
                "data": {
                    "posts": serializer.data,
                    "pagination": {
                        "currentPage": self.request.query_params.get('page', 1),
                        "totalPages": self.paginator.num_pages,
                        "totalItems": self.paginator.count,
                        "pageSize": self.paginator.per_page
                    }
                }
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取成功",
            "data": {
                "posts": serializer.data,
                "pagination": {
                    "currentPage": 1,
                    "totalPages": 1,
                    "totalItems": len(serializer.data),
                    "pageSize": len(serializer.data)
                }
            }
        })
    
    def create(self, request, *args, **kwargs):
        """创建帖子"""
        serializer = PostSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        post = serializer.save()
        return Response({
            "success": True,
            "message": "创建成功",
            "data": PostSerializer(post).data
        }, status=status.HTTP_201_CREATED)


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
        # 增加浏览量
        instance.increment_views_count()
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
        
        # 只显示正常状态的评论
        queryset = queryset.filter(status='normal')
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """获取评论列表"""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取成功",
                "data": {
                    "comments": serializer.data,
                    "pagination": {
                        "currentPage": self.request.query_params.get('page', 1),
                        "totalPages": self.paginator.num_pages,
                        "totalItems": self.paginator.count,
                        "pageSize": self.paginator.per_page
                    }
                }
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取成功",
            "data": {
                "comments": serializer.data,
                "pagination": {
                    "currentPage": 1,
                    "totalPages": 1,
                    "totalItems": len(serializer.data),
                    "pageSize": len(serializer.data)
                }
            }
        })
    
    def create(self, request, *args, **kwargs):
        """创建评论"""
        serializer = CommentSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        return Response({
            "success": True,
            "message": "创建成功",
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
        return Comment.objects.filter(
            post_id=post_id, 
            status='normal'
        ).order_by('created_at')
    
    def list(self, request, *args, **kwargs):
        """获取评论列表"""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取成功",
                "data": {
                    "comments": serializer.data,
                    "pagination": {
                        "currentPage": self.request.query_params.get('page', 1),
                        "totalPages": self.paginator.num_pages,
                        "totalItems": self.paginator.count,
                        "pageSize": self.paginator.per_page
                    }
                }
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取成功",
            "data": {
                "comments": serializer.data,
                "pagination": {
                    "currentPage": 1,
                    "totalPages": 1,
                    "totalItems": len(serializer.data),
                    "pageSize": len(serializer.data)
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
        request.data['post'] = post_id
        serializer = CommentSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        return Response({
            "success": True,
            "message": "创建成功",
            "data": CommentSerializer(comment).data
        }, status=status.HTTP_201_CREATED)

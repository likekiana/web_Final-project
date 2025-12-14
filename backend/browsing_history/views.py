from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import BrowsingHistory
from .serializers import BrowsingHistorySerializer


class BrowsingHistoryListAPIView(generics.ListAPIView):
    """用户浏览历史列表视图"""
    serializer_class = BrowsingHistorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # 暂时不使用分页，后续可以根据需求添加

    def get_queryset(self):
        """获取当前用户的浏览历史"""
        return BrowsingHistory.objects.filter(user=self.request.user).order_by('-viewed_at')
    
    def list(self, request, *args, **kwargs):
        """获取浏览历史列表"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取成功",
            "data": serializer.data
        })


class BrowsingHistoryClearAPIView(generics.DestroyAPIView):
    """清除用户浏览历史视图"""
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'  # 不使用pk，而是清除所有

    def get_queryset(self):
        """获取当前用户的浏览历史"""
        return BrowsingHistory.objects.filter(user=self.request.user)

    def delete(self, request, *args, **kwargs):
        """删除当前用户的所有浏览历史"""
        self.get_queryset().delete()
        return Response({
            "success": True,
            "message": "浏览历史已清空",
            "data": None
        }, status=status.HTTP_200_OK)

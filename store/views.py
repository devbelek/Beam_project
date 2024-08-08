from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import viewsets, status
from .models import Category, Product, Customer
from .serializers import CategorySerializer, ProductSerializer, CustomerSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.shortcuts import render
import logging
from .serializers import UserSerializer

logger = logging.getLogger(__name__)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class NotificationMixin:
    def send_notification(self, message, item_type, item):
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "notifications",
            {
                "type": "notification_message",
                "message": message,
                "item_type": item_type,
                "id": item.id,
                "name": getattr(item, 'name', 'Unknown'),
            },
        )


class CategoryViewSet(NotificationMixin, viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        category = serializer.save()
        self.send_notification(f"Создана новая категория: {category.name}", "category", category)

    def perform_update(self, serializer):
        category = serializer.save()
        self.send_notification(f"Категория обновлена: {category.name}", "category", category)

    def perform_destroy(self, instance):
        self.send_notification(f"Категория удалена: {instance.name}", "category", instance)
        instance.delete()


class ProductViewSet(NotificationMixin, viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        product = serializer.save()
        self.send_notification(f"Создан новый продукт: {product.name}", "product", product)

    def perform_update(self, serializer):
        product = serializer.save()
        self.send_notification(f"Продукт обновлен: {product.name}", "product", product)

    def perform_destroy(self, instance):
        self.send_notification(f"Продукт удален: {instance.name}", "product", instance)
        instance.delete()


class CustomerViewSet(NotificationMixin, viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        customer = serializer.save()
        self.send_notification(f"Создан новый клиент: {customer.user.username}", "customer", customer)

    def perform_update(self, serializer):
        customer = serializer.save()
        self.send_notification(f"Клиент обновлен: {customer.user.username}", "customer", customer)

    def perform_destroy(self, instance):
        self.send_notification(f"Клиент удален: {instance.user.username}", "customer", instance)
        instance.delete()


def index(request):
    return render(request, 'store/index.html')

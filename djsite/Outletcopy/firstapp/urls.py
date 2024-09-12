from django.conf.urls.static import static
from django.urls import path, include
from .views import *

urlpatterns = [
    path('', index, name='index'),
    path('contact/', contact, name='contact'),
    path('brandlist/', brandlist, name='brandlist'),
    path('product/<slug:slug>', productpage, name='product'),
    path('delivery/', delivery, name='delivery'),
    path('cart/', cart, name='cart'),
    path('catalog/', catalog, name='catalog'),
    path('cataloog/<slug:slug>/', subcatalog, name='subcatalog'),
]

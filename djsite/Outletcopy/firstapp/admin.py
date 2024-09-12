from django.contrib import admin
from .models import *


class AdminProduct(admin.ModelAdmin):
    list_display = ['pk', 'title', 'type', 'slug', 'price', ]
    prepopulated_fields = {'slug': ('title',), }
    list_display_links = ['title', 'slug', ]
    search_fields = ['title', 'slug', 'type',]


class AdminColor(admin.ModelAdmin):
    list_display = ['pk', 'title', 'slug', ]
    prepopulated_fields = {'slug': ('title',), }
    list_display_links = ['title', 'slug', ]
    search_fields = ['title', 'slug', ]


class AdminImagesForEach(admin.ModelAdmin):
    list_display = ['belongs_to', ]
    list_display_links = ['belongs_to', ]
    search_fields = ['belongs_to', ]


class AdminBrand(admin.ModelAdmin):
    list_display = ['pk', 'title', 'slug', ]
    prepopulated_fields = {'slug': ('title',), }
    list_display_links = ['title', 'slug', ]
    search_fields = ['title', 'slug', ]


admin.site.register(Brand, AdminBrand)
admin.site.register(Type, AdminColor)
admin.site.register(ProductImages, AdminImagesForEach)
admin.site.register(Color, AdminColor)
admin.site.register(Size, AdminColor)
admin.site.register(Category, AdminBrand)
admin.site.register(Product, AdminProduct)



from django.db import models
from django.urls import reverse


class Brand(models.Model):
    title = models.CharField(max_length=100, verbose_name='Title')
    slug = models.SlugField(max_length=500, unique=True, verbose_name='URL')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Brand'
        verbose_name_plural = 'Brands'
        ordering = ['-title', ]


class Type(models.Model):
    title = models.CharField(max_length=100, verbose_name='Title')
    slug = models.SlugField(max_length=500, unique=True, verbose_name='URL')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Type'
        verbose_name_plural = 'Types'
        ordering = ['-title', ]


class ProductImages(models.Model):

    image = models.ImageField(upload_to='tavar/%Y/%m/')
    belongs_to = models.ForeignKey(
        'Product',
        related_name='images',
        on_delete=models.SET_NULL,
        null=True,
        blank=False,
        verbose_name='Принадлежит'
    )

    def __str__(self):
        return self.belongs_to.title

    class Meta:
        verbose_name = 'Image'
        verbose_name_plural = 'Images'


class Color(models.Model):
    title = models.CharField(max_length=100, verbose_name='Title')
    slug = models.SlugField(max_length=500, unique=True, verbose_name='URL')
    color = models.CharField(max_length=100, verbose_name='Color')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Color'
        verbose_name_plural = 'Colors'
        ordering = ['-title', ]


class Size(models.Model):
    title = models.CharField(max_length=100, verbose_name='Title')
    slug = models.SlugField(max_length=500, unique=True, verbose_name='URL')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Size'
        verbose_name_plural = 'Sizes'
        ordering = ['-title', ]


class Category(models.Model):
    title = models.CharField(max_length=255, verbose_name='Title')
    slug = models.SlugField(max_length=500, unique=True, verbose_name='URL')

    type = models.ManyToManyField(
        Type,
        blank=False,
        related_name='category',
        verbose_name='Type'
    )

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['-title', ]


class Product(models.Model):

    gender = (
        ('men', 'men'),
        ('women', 'women'),
        ('child', 'child'),
    )
    seasons = (
        ('winter', 'winter'),
        ('summer', 'summer'),
        ('demiseason', 'demiseason'),
    )

    title = models.CharField(max_length=100, verbose_name='Title')
    slug = models.SlugField(max_length=100, unique=True, verbose_name='URL')

    price = models.IntegerField(default=0, verbose_name='Price')
    sale = models.IntegerField(default=0, verbose_name='Sale')
    season = models.CharField(max_length=50, default='summer', choices=seasons, verbose_name='Season')
    male = models.CharField(max_length=30, default='men', choices=gender, verbose_name='Gender')

    sale_price = models.IntegerField(default=0, blank=False, verbose_name='Sale price')

    description = models.TextField(verbose_name='Description')

    brand = models.ForeignKey(
        Brand,
        related_name='product',
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Brand'
    )
    colors = models.ManyToManyField(
        Color,
        blank=False,
        related_name='product',
        verbose_name='Color'
    )
    sizes = models.ManyToManyField(
        Size,
        blank=False,
        related_name='product',
        verbose_name='Size'
    )
    type = models.ForeignKey(
        Type,
        related_name='product',
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Type'

    )

    time_update = models.DateTimeField(auto_now=True)
    time_create = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['-time_create', '-title', ]

    def get_absolute_url(self):
        return reverse("firstapp:product", kwargs={
            'slug': self.slug
        })




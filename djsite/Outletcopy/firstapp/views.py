from django.shortcuts import render
from .models import *
import random
import datetime

products = Product.objects.all()
images = ProductImages.objects.all()
brands = Brand.objects.all()
categories = Category.objects.all()
size_list = Size.objects.all()
color_list = Color.objects.all()

products10 = products[:10:]
products5 = products[len(products)-5:len(products):]

month = datetime.datetime.now().strftime('%m')


def index(request):

    image_list = []
    image_list5 = []

    for item in products10:
        image_list.append(images.filter(belongs_to=item))

    for item in products5:
        image_list5.append(images.filter(belongs_to=item))

    list1 = products10[::]
    list2 = image_list[::]

    list3 = products5[::]
    list4 = image_list5[::]

    paired_lists = zip(list1, list2)
    paired_lists5 = zip(list3, list4)

    # Создаем новый список, соединяя элементы из пар
    list_together = [(item1, item2) for item1, item2 in paired_lists]
    list_together5 = [(item1, item2) for item1, item2 in paired_lists5]

    return render(request, 'firstapp/index.html', {
        'title': 'Hello world',
        'brands': brands,
        'products10': list_together,
        'products5': list_together5,
        'categories': categories,
    })


def brandlist(request):
    return render(request, 'firstapp/brands.html', {
        'title': "Brands",
        'brands': brands,
        'categories': categories,
    })


def contact(request):
    return render(request, 'firstapp/contacts.html', {
        'title': 'Contact',
        'brands': brands,
        'categories': categories,
    })


def productpage(request, slug):

    get_product = products.get(slug=slug)
    product_images = images.filter(belongs_to=get_product)

    return render(request, 'firstapp/product.html', {
        'title': 'Product',
        'product': get_product,
        'images': product_images,
        'brands': brands,
        'categories': categories,
    })


def delivery(request):
    return render(request, 'firstapp/delivery.html', {
        'title': 'Delivery',
        'brands': brands,
        'categories': categories,
    })


def cart(request):
    return render(request, 'firstapp/cart.html', {
        'title': 'Cart',
        'brands': brands,
        'categories': categories,
    })


def catalog(request):

    # for item in products:
    #     item.title = 'You can change title'
    #     item.save()

    res_image = {}
    image_list = []
    product_list = products[::]

    # product filters

    get_requests = request.GET
#    print(get_requests)
    # by brands

    get_by_brands = []

    for item in brands:
        if item.slug in get_requests:
            get_by_brands += products.filter(brand=item)

    if len(get_by_brands) > 0:
        product_list = get_by_brands[::]

    # by gender

    list_with_gender = []

    for item in product_list:
        if item.male == 'men' and 'man' in get_requests:
            list_with_gender.append(item)
        if item.male == 'women' and 'woman' in get_requests:
            list_with_gender.append(item)
        if item.male == 'child' and 'kids' in get_requests:
            list_with_gender.append(item)

    if len(list_with_gender) > 0:
        product_list = list_with_gender[::]

    # by size

    get_size = []
    get_size_list = []

    for item in size_list:
        if item.slug in get_requests:
            get_size.append(item)

    for item in get_size:
        for prod in product_list:
            if item in prod.sizes.all():
                get_size_list.append(prod)

    if len(get_size) > 0:
        product_list = get_size_list[::]

    # by color

    get_color = []
    get_color_list = []

    for item in color_list:
        if item.slug in get_requests:
            get_color.append(item)

    for item in get_color:
        for prod in product_list:
            if item in prod.colors.all():
                get_color_list.append(prod)

    if len(get_color_list) > 0:
        product_list = get_color_list[::]
    get_color = []

    # by new products or not

    get_news = []

    if 'oldproducts' in get_requests:
        for item in product_list:
            item_month = int(str(item.time_create)[5:7])
            if int(month) - 4 > item_month:
                get_news.append(item)
            print(item.time_create)

    if 'newproducts' in get_requests:
        for item in product_list:
            item_month = int(str(item.time_create)[5:7])
            if int(month) - 3 <= item_month:
                get_news.append(item)
            print(item.time_create)

    if len(get_news) > 0:
        product_list = get_news[::]

    # by season

    get_season = []

    # by price

    get_price = []

    if request.GET.get('catalogFilter_4_MIN') is not None and request.GET.get('catalogFilter_4_MIN') != '':
        get_min_price = int(request.GET.get('catalogFilter_4_MIN'))
    else:
        get_min_price = 2550

    if request.GET.get('catalogFilter_4_MAX') is not None and request.GET.get('catalogFilter_4_MAX') != '':
        get_max_price = int(request.GET.get('catalogFilter_4_MAX'))
    else:
        get_max_price = 1120000

    for item in product_list:
        if get_min_price <= int(item.sale_price) <= get_max_price :
            get_price.append(item)

    if len(get_price) > 0:
        product_list = get_price

    # end product filtering

    for item in product_list:
        # Этот код для облехчения задания для добавленя colors каждому продукту
        # if len(item.colors.all()) == 0 or True:
        #     random_count = random.randint(0, 3)
        #     ind = random_count
        #     random_sizes = []
        #     while ind > 0:
        #         random_size = color_list[random.randrange(0, len(color_list))]
        #         if random_size not in random_sizes:
        #             random_sizes.append(random_size)
        #             ind -= 1
        #     item.colors.set(random_sizes)
        #     item.save()

        image_list.append(images.filter(belongs_to=item))

    list1 = product_list[::]
    list2 = image_list[::]
    paired_lists = zip(list1, list2)

    # Создаем новый список, соединяя элементы из пар
    list_together = [(item1, item2) for item1, item2 in paired_lists]

#    print(brands, '  THIS WAS A GOOD PERSON')

    return render(request, 'firstapp/catalog.html', {
        'title': 'Catalog',
        'products': list_together[0: min(len(list_together), 32)],
        'images': res_image,
        'brands': brands,
        'categories': categories,
        'size_list': size_list,
        'color_list': color_list,
    })


def subcatalog(request, slug):

    chosen_types = ['final-sale', 'domashnij-tekstil', 'nizhnee-bele-i-kupalniki']

#
    res_image = {}
    image_list = []
    product_list = products[::]

    # product filters

    get_requests = request.GET
    #    print(get_requests)
    # by brands

    get_by_brands = []

    for item in brands:
        if item.slug in get_requests:
            get_by_brands += products.filter(brand=item)

    if len(get_by_brands) > 0:
        product_list = get_by_brands[::]

    # by gender

    list_with_gender = []

    for item in product_list:
        if item.male == 'men' and 'man' in get_requests:
            list_with_gender.append(item)
        if item.male == 'women' and 'woman' in get_requests:
            list_with_gender.append(item)
        if item.male == 'child' and 'kids' in get_requests:
            list_with_gender.append(item)

    if len(list_with_gender) > 0:
        product_list = list_with_gender[::]

    # by size

    get_size = []
    get_size_list = []

    for item in size_list:
        if item.slug in get_requests:
            get_size.append(item)

    for item in get_size:
        for prod in product_list:
            if item in prod.sizes.all():
                get_size_list.append(prod)

    if len(get_size) > 0:
        product_list = get_size_list[::]

    # by color

    get_color = []
    get_color_list = []

    for item in color_list:
        if item.slug in get_requests:
            get_color.append(item)

    for item in get_color:
        for prod in product_list:
            if item in prod.colors.all():
                get_color_list.append(prod)

    if len(get_color_list) > 0:
        product_list = get_color_list[::]
    get_color = []

    # by new products or not

    get_news = []

    if 'oldproducts' in get_requests:
        for item in product_list:
            item_month = int(str(item.time_create)[5:7])
            if int(month) - 4 > item_month:
                get_news.append(item)
            print(item.time_create)

    if 'newproducts' in get_requests:
        for item in product_list:
            item_month = int(str(item.time_create)[5:7])
            if int(month) - 3 <= item_month:
                get_news.append(item)
            print(item.time_create)

    if len(get_news) > 0:
        product_list = get_news[::]

    # by season

    get_season = []

    # by price

    get_price = []

    if request.GET.get('catalogFilter_4_MIN') is not None and request.GET.get('catalogFilter_4_MIN') != '':
        get_min_price = int(request.GET.get('catalogFilter_4_MIN'))
    else:
        get_min_price = 2550

    if request.GET.get('catalogFilter_4_MAX') is not None and request.GET.get('catalogFilter_4_MAX') != '':
        get_max_price = int(request.GET.get('catalogFilter_4_MAX'))
    else:
        get_max_price = 1120000

    for item in product_list:
        if get_min_price <= int(item.sale_price) <= get_max_price :
            get_price.append(item)

    if len(get_price) > 0:
        product_list = get_price

    # end product filtering

    # subcatalog

    list_product = []

    if str(slug) not in chosen_types:
        category = categories.get(slug=slug)
        c_type = category.type.all()
        for c_item in c_type:
            item = c_item
            for product in product_list:
                if product not in list_product and str(item) in str(product.type):
                    list_product.append(product)
    else:
        item = slug
        for product in product_list:
            if product not in list_product and str(item) in str(product.type):
                list_product.append(product)
        c_type = []

    if len(list_product) > 0:
        product_list = list_product

    # end subcatalog

    for item in product_list:
        # Этот код для облехчения задания для добавленя colors каждому продукту
        # if len(item.colors.all()) == 0 or True:
        #     random_count = random.randint(0, 3)
        #     ind = random_count
        #     random_sizes = []
        #     while ind > 0:
        #         random_size = color_list[random.randrange(0, len(color_list))]
        #         if random_size not in random_sizes:
        #             random_sizes.append(random_size)
        #             ind -= 1
        #     item.colors.set(random_sizes)
        #     item.save()

        image_list.append(images.filter(belongs_to=item))

    list1 = product_list[::]
    list2 = image_list[::]
    paired_lists = zip(list1, list2)

    # Создаем новый список, соединяя элементы из пар
    list_together = [(item1, item2) for item1, item2 in paired_lists]

#

    return render(request, 'firstapp/subcatalog.html', {
        'title': 'Catalog',
        'products': list_together[0: min(len(list_together), 32)],
        'images': res_image,
        'brands': brands,
        'types': c_type,
        'slug': slug,
        'categories': categories,
        'size_list': size_list,
        'color_list': color_list,
        'subslug': slug,
    })


function addProductToCart(product) {
  // Открытие базы данных
  var request = indexedDB.open("myDatabase", 1);

  // Создание хранилища объектов при обновлении версии базы данных
  request.onupgradeneeded = function() {
    var db = request.result;
    var store = db.createObjectStore("products", {keyPath: "id", autoIncrement: true});
  };

  // Проверка наличия товара с такими же p_id, color и size в базе данных
  request.onsuccess = function() {
    var db = request.result;
    var transaction = db.transaction("products", "readwrite");
    var store = transaction.objectStore("products");

    var getRequest = store.getAll();
    getRequest.onsuccess = function() {
      var products = getRequest.result;
      var existingProduct = products.find(function(p) {
        return p.p_id === product.p_id && p.color === product.color && p.size === product.size;
      });
      if (existingProduct) {
        // Товар с такими же p_id, color и size уже есть в базе данных
        // Увеличение количества товара на 1
        var updateRequest = store.put({
          ...existingProduct,
          quantity: existingProduct.quantity + 1
        });
        updateRequest.onsuccess = function() {
          getTotalQuantity();
          document.getElementById("alert_to_card").hidden = false;        
          document.getElementById("btn_to_cart").style.display = "none";
          document.getElementById("btn_remove_from_cart").style.display = "block";
        };
      } else {
        // Товара с такими же p_id, color и size нет в базе данных
        // Добавление нового товара
        var addRequest = store.add(product);
        addRequest.onsuccess = function() {
          getTotalQuantity();
          document.getElementById("alert_to_card").hidden = false;        
          document.getElementById("btn_to_cart").style.display = "none";
          document.getElementById("btn_remove_from_cart").style.display = "block";
        };
      }
    };
  };
}

function deleteProduct(productId) {
  // Открытие базы данных
  var request = indexedDB.open("myDatabase", 1);

  // Обработка успешного открытия базы данных
  request.onsuccess = function() {
      var db = request.result;
      var transaction = db.transaction("products", "readwrite");
      var store = transaction.objectStore("products");

      // Удаление товара из базы данных
      var deleteRequest = store.delete(productId);
      deleteRequest.onsuccess = function() {
          // Обработка успешного удаления товара
          // Например, удаление элемента из списка корзины
          var productElement = document.querySelector(`.basket__item[data-id="${productId}"]`);
          productElement.parentNode.removeChild(productElement);
          getAllProducts(function(products) {
            displayTotalPrice(products);
          });
          getTotalQuantity();
      };
  };
}


function getTotalQuantity() {
  // Открытие базы данных
  var request = indexedDB.open("myDatabase", 1);

  // Создание хранилища объектов при обновлении версии базы данных
  request.onupgradeneeded = function() {
    var db = request.result;
    var store = db.createObjectStore("products", {keyPath: "id", autoIncrement: true});
  };

  // Получение всех товаров из хранилища объектов
  request.onsuccess = function() {
    var db = request.result;
    var transaction = db.transaction("products", "readonly");
    var store = transaction.objectStore("products");
    
    var getAllRequest = store.getAll();
    
    // Обратная связь при успешном получении данных
    getAllRequest.onsuccess = function() {
      var products = getAllRequest.result;
      
      // Вычисление общего количества товаров
      var totalQuantity = 0;
      for (var i = 0; i < products.length; i++) {
        totalQuantity += products[i].quantity;
      }
      document.getElementById("totalQuantity_basket").innerHTML = totalQuantity;
    };
  };
}  

function displayAllProducts() {
  // Открытие базы данных
  var request = indexedDB.open("myDatabase", 1);

  // Создание хранилища объектов при обновлении версии базы данных
  request.onupgradeneeded = function() {
    var db = request.result;
    var store = db.createObjectStore("products", {keyPath: "id", autoIncrement: true});
  };

  // Получение списка всех товаров из базы данных
  request.onsuccess = function() {
    var db = request.result;
    var transaction = db.transaction("products", "readonly");
    var store = transaction.objectStore("products");

    var getRequest = store.getAll();
    getRequest.onsuccess = function() {
      var products = getRequest.result;
      products.forEach(function(product) {
        displayProduct(product);
      });
      displayTotalPrice(products);
    };
  };
}

function displayProduct(product) {
  var basketList = document.getElementById('basket__list');
  var productElement = document.createElement('div');
  productElement.className = 'basket__item';
  productElement.setAttribute('data-id', product.id);
  productElement.innerHTML = `
    <div class="basket__item-pic">
      <a href="/imgs/products/${product.image}">
        <img src="/imgs/products/${product.image}" alt="">
      </a>
    </div>
    <div class="basket__item-info">
      <a class="basket__item-name" href="/product?p=${product.p_id}">${product.name}</a>
      <div class="basket__item-chars">
        <div>
          <b>Цвет: </b>
          <span style="display: inline-block;">${product.color}</span>
        </div>
        <div>
          <b>Размер: </b>
          <span style="display: inline-block;">${product.size}</span>
        </div>
      </div>
    </div>
    <div class="basket__item-price">
      <span class="basket__title-col">ЦЕНА: </span> ${(product.price * 1).toLocaleString('ru-RU')} ₽
    </div>
    <div class="basket__item-quantity">
      <span class="basket__item-quantity-dec basket__btn basket__btn--secondary" id="btn_munis_${product.id}">—</span>
      <input id="qnt_${product.id}" class="basket__item-quantity-input form-control" type="number" name="QUANTITY" min="1" step="1" value="${product.quantity}">
      <span class="basket__item-quantity-inc basket__btn basket__btn--secondary" id="btn_plus_${product.id}">+</span>
    </div>
    <div class="basket__item-total">
      <span class="basket__title-col">СТОИМОСТЬ: </span>
      <span class="js-basket-item-subtotal">${(product.price * product.quantity).toLocaleString('ru-RU')}</span> ₽
    </div>
    <div class="basket__item-remove" data-id="${product.id}" title="Убрать товар из корзины" onClick="deleteProduct(${product.id});">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="20px" height="20px" viewBox="0 0 729.837 729.838" style="enable-background:new 0 0 729.837 729.838;" xml:space="preserve">
          <g>
              <g>
                  <g>
                      <path
                          d="M589.193,222.04c0-6.296,5.106-11.404,11.402-11.404S612,215.767,612,222.04v437.476c0,19.314-7.936,36.896-20.67,49.653 c-12.733,12.734-30.339,20.669-49.653,20.669H188.162c-19.315,0-36.943-7.935-49.654-20.669 c-12.734-12.734-20.669-30.313-20.669-49.653V222.04c0-6.296,5.108-11.404,11.403-11.404c6.296,0,11.404,5.131,11.404,11.404 v437.476c0,13.02,5.37,24.922,13.97,33.521c8.6,8.601,20.503,13.993,33.522,13.993h353.517c13.019,0,24.896-5.394,33.498-13.993 c8.624-8.624,13.992-20.503,13.992-33.498V222.04H589.193z"
                          fill="#D80027" />
                      <path
                          d="M279.866,630.056c0,6.296-5.108,11.403-11.404,11.403s-11.404-5.107-11.404-11.403v-405.07 c0-6.296,5.108-11.404,11.404-11.404s11.404,5.108,11.404,11.404V630.056z"
                          fill="#D80027" />
                      <path
                          d="M376.323,630.056c0,6.296-5.107,11.403-11.403,11.403s-11.404-5.107-11.404-11.403v-405.07 c0-6.296,5.108-11.404,11.404-11.404s11.403,5.108,11.403,11.404V630.056z"
                          fill="#D80027" />
                      <path
                          d="M472.803,630.056c0,6.296-5.106,11.403-11.402,11.403c-6.297,0-11.404-5.107-11.404-11.403v-405.07 c0-6.296,5.107-11.404,11.404-11.404c6.296,0,11.402,5.108,11.402,11.404V630.056L472.803,630.056z"
                          fill="#D80027" />
                      <path
                          d="M273.214,70.323c0,6.296-5.108,11.404-11.404,11.404c-6.295,0-11.403-5.108-11.403-11.404 c0-19.363,7.911-36.943,20.646-49.677C283.787,7.911,301.368,0,320.73,0h88.379c19.339,0,36.92,7.935,49.652,20.669 c12.734,12.734,20.67,30.362,20.67,49.654c0,6.296-5.107,11.404-11.403,11.404s-11.403-5.108-11.403-11.404 c0-13.019-5.369-24.922-13.97-33.522c-8.602-8.601-20.503-13.994-33.522-13.994h-88.378c-13.043,0-24.922,5.369-33.546,13.97 C278.583,45.401,273.214,57.28,273.214,70.323z"
                          fill="#D80027" />
                      <path
                          d="M99.782,103.108h530.273c11.189,0,21.405,4.585,28.818,11.998l0.047,0.048c7.413,7.412,11.998,17.628,11.998,28.818 v29.46c0,6.295-5.108,11.403-11.404,11.403h-0.309H70.323c-6.296,0-11.404-5.108-11.404-11.403v-0.285v-29.175 c0-11.166,4.585-21.406,11.998-28.818l0.048-0.048C78.377,107.694,88.616,103.108,99.782,103.108L99.782,103.108z M630.056,125.916H99.782c-4.965,0-9.503,2.02-12.734,5.274L87,131.238c-3.255,3.23-5.274,7.745-5.274,12.734v18.056h566.361 v-18.056c0-4.965-2.02-9.503-5.273-12.734l-0.049-0.048C639.536,127.936,635.021,125.916,630.056,125.916z"
                          fill="#D80027" />
                  </g>
              </g>
          </g>
      </svg>
    </div>`;
  basketList.appendChild(productElement);

 // Добавление обработчика события click для кнопки уменьшения количества товара
  var minusButton = document.getElementById(`btn_munis_${product.id}`);
  minusButton.addEventListener('click', function() {
  updateProductQuantity(product.id, "minus");
  });


// Добавление обработчика события click для кнопки увеличения количества товара
  var plusButton = document.getElementById(`btn_plus_${product.id}`);
  plusButton.addEventListener('click', function() {
  updateProductQuantity(product.id, "plus");
  });

  // Добавление обработчика события change для элемента input
  var quantityInput = document.getElementById(`qnt_${product.id}`);
  quantityInput.addEventListener('change', function() {
  var newQuantity = parseInt(quantityInput.value);
  if (newQuantity > 0) {
      updateProductQuantity_2(product.id, newQuantity);
  } else {
      quantityInput.value = 1;
      updateProductQuantity_2(product.id, 1);
  }
  });

}  

function displayTotalPrice(products) {
  var totalPrice = products.reduce(function(total, product) {
    return total + product.price * product.quantity;
  }, 0);
  var totalPriceElement = document.getElementById('b_total_price');
  totalPriceElement.textContent = totalPrice.toLocaleString('ru-RU');
  if(totalPrice > 0){
    document.getElementById(`btn_continue`).hidden = false;
  }else{
    document.getElementById(`btn_continue`).hidden = true;
  }
}


function clearCart() {
  // Открытие базы данных
  var request = indexedDB.open("myDatabase", 1);

  // Создание хранилища объектов при обновлении версии базы данных
  request.onupgradeneeded = function() {
    var db = request.result;
    var store = db.createObjectStore("products", {keyPath: "id", autoIncrement: true});
  };

  // Удаление всех товаров из хранилища объектов
  request.onsuccess = function() {
    var db = request.result;
    var transaction = db.transaction("products", "readwrite");
    var store = transaction.objectStore("products");
    
    var clearRequest = store.clear();
    
    // Обратная связь при успешном удалении
    clearRequest.onsuccess = function() {
      getTotalQuantity();
      document.getElementById('b_total_price').textContent = "0";
      document.getElementById(`btn_continue`).hidden = true;
      // Удаление всех товаров из HTML-страницы
      var basketList = document.getElementById('basket__list');
      var basketItems = basketList.querySelectorAll('.basket__item:not(.basket__item--head)');
      basketItems.forEach(function(item) {
      basketList.removeChild(item);
      });
    };
  };
}

function updateProductQuantity(productId, operation) {
  // Открытие базы данных
  var request = indexedDB.open("myDatabase", 1);

  // Создание хранилища объектов при обновлении версии базы данных
  request.onupgradeneeded = function() {
    var db = request.result;
    var store = db.createObjectStore("products", {keyPath: "id", autoIncrement: true});
  };

  // Обновление количества товара в базе данных
  request.onsuccess = function() {
    var db = request.result;
    var transaction = db.transaction("products", "readwrite");
    var store = transaction.objectStore("products");

    var getRequest = store.get(productId);
    getRequest.onsuccess = function() {
      var product = getRequest.result;
      if (operation === "minus" && product.quantity > 1) {
        product.quantity -= 1;
      } else if (operation === "plus") {
        product.quantity += 1;
      }

      var putRequest = store.put(product);
      putRequest.onsuccess = function() {
        // Обновление отображения количества товара на HTML-странице
        var quantityInput = document.getElementById(`qnt_${productId}`);
        quantityInput.value = product.quantity;

        // Обновление отображения суммы товара на HTML-странице
        var subtotalElement = document.querySelector(`[data-id="${productId}"] .js-basket-item-subtotal`);
        subtotalElement.textContent = (product.price * product.quantity).toLocaleString('ru-RU');

        // Обновление отображения общей суммы всех товаров в корзине
        getAllProducts(function(products) {
          displayTotalPrice(products);
        });
        getTotalQuantity();  
      };
    };
  };
}  

function updateProductQuantity_2(productId, quan) {
  // Открытие базы данных
  var request = indexedDB.open("myDatabase", 1);

  // Создание хранилища объектов при обновлении версии базы данных
  request.onupgradeneeded = function() {
    var db = request.result;
    var store = db.createObjectStore("products", {keyPath: "id", autoIncrement: true});
  };

  // Обновление количества товара в базе данных
  request.onsuccess = function() {
    var db = request.result;
    var transaction = db.transaction("products", "readwrite");
    var store = transaction.objectStore("products");

    var getRequest = store.get(productId);
    getRequest.onsuccess = function() {
      var product = getRequest.result;
      if (quan > 0) {
        product.quantity = quan;
      }

      var putRequest = store.put(product);
      putRequest.onsuccess = function() {
        // Обновление отображения количества товара на HTML-странице
        var quantityInput = document.getElementById(`qnt_${productId}`);
        quantityInput.value = product.quantity;

        // Обновление отображения суммы товара на HTML-странице
        var subtotalElement = document.querySelector(`[data-id="${productId}"] .js-basket-item-subtotal`);
        subtotalElement.textContent = (product.price * product.quantity).toLocaleString('ru-RU');

        // Обновление отображения общей суммы всех товаров в корзине
        getAllProducts(function(products) {
          displayTotalPrice(products);
        });
        getTotalQuantity();  
      };
    };
  };
}  

function getAllProducts(callback) {
  // Открытие базы данных
  var request = indexedDB.open("myDatabase", 1);

  // Создание хранилища объектов при обновлении версии базы данных
  request.onupgradeneeded = function() {
    var db = request.result;
    var store = db.createObjectStore("products", {keyPath: "id", autoIncrement: true});
  };

  // Получение списка всех товаров из базы данных
  request.onsuccess = function() {
    var db = request.result;
    var transaction = db.transaction("products", "readonly");
    var store = transaction.objectStore("products");

    var getRequest = store.getAll();
    getRequest.onsuccess = function() {
      var products = getRequest.result;
      callback(products);
    };
  };
} 


function alert_to_card_hid() {
      document.getElementById("alert_to_card").hidden = true;
  }
  
function zakaz() {
    var client_name = document.getElementById("client_name").value;
    var client_email = document.getElementById("client_email").value;
    var client_tel = document.getElementById("client_tel").value;
    var client_city = document.getElementById("client_city").value;
    var client_street = document.getElementById("client_street").value;
    var client_house = document.getElementById("client_house").value;
    var client_porch = document.getElementById("client_porch").value;
    var client_floor = document.getElementById("client_floor").value;
    var client_flat = document.getElementById("client_flat").value;
    var client_intercom = document.getElementById("client_intercom").value;
    var client_subway = document.getElementById("client_subway").value;
    var client_comment = document.getElementById("client_comment").value;
    var products;

  getAllProducts(function(products_s) {
    products = JSON.stringify(products_s);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api_outlet_v_1.php");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      if (xhr.status === 200) {
        document.getElementById("alert_to_card").hidden = false;
        document.getElementById("checkoutPopUp").style.display = "none";
        clearCart();
      }
    };
    xhr.send(
      "z=zakaz" +
      "&token=PPMFKQ2ojjdOIjf_251df55eQ2sdfdsfojefPHKLgdfj45bdRGRc8erdfdg34543fhy08KLHjhuf_fjish43iuk" +
      "&client_name=" + client_name +
      "&client_email=" + client_email +
      "&client_tel=" + client_tel +
      "&client_city=" + client_city +
      "&client_street=" + client_street +
      "&client_house=" + client_house +
      "&client_porch=" + client_porch +
      "&client_floor=" + client_floor +
      "&client_flat=" + client_flat +
      "&client_intercom=" + client_intercom +
      "&client_subway=" + client_subway +
      "&client_comment=" + client_comment +
      "&products=" + products
    );
  });
}



 getTotalQuantity();  
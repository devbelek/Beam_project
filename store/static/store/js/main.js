// Функция для получения CSRF токена из куки
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

// Настройка AJAX для включения CSRF токена
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

// WebSocket для уведомлений
const socket = new WebSocket('wss://beam-project-20lk.onrender.com/ws/notifications/');


socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    $('#notifications').prepend('<li class="list-group-item">' + data.message + '</li>');
};

// Функции CRUD
function createCategory() {
    const categoryName = prompt("Введите название категории:");
    if (categoryName) {
        $.post('/api/categories/', {name: categoryName}, function(data) {
            $('#categoryList').prepend(
                `<li class="list-group-item" data-id="${data.id}">
                    ${data.name}
                    <div>
                        <button class="btn btn-sm btn-warning" onclick="updateCategory(${data.id})">Обновить</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCategory(${data.id})">Удалить</button>
                    </div>
                </li>`
            );
        });
    }
}

function updateCategory(id) {
    const newName = prompt("Введите новое название категории:");
    if (newName) {
        $.ajax({
            url: `/api/categories/${id}/`,
            method: 'PUT',
            data: {name: newName},
            success: function(data) {
                $(`#categoryList li[data-id="${id}"]`).replaceWith(
                    `<li class="list-group-item" data-id="${data.id}">
                        ${data.name}
                        <div>
                            <button class="btn btn-sm btn-warning" onclick="updateCategory(${data.id})">Обновить</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCategory(${data.id})">Удалить</button>
                        </div>
                    </li>`
                );
            }
        });
    }
}

function deleteCategory(id) {
    if (confirm("Вы уверены, что хотите удалить эту категорию?")) {
        $.ajax({
            url: `/api/categories/${id}/`,
            method: 'DELETE',
            success: function() {
                $(`#categoryList li[data-id="${id}"]`).remove();
            }
        });
    }
}

function createProduct() {
    const productName = prompt("Введите название продукта:");
    const productDescription = prompt("Введите описание продукта:");
    const productPrice = prompt("Введите цену продукта:");
    const categoryId = prompt("Введите ID категории:");

    if (productName && productDescription && productPrice && categoryId) {
        $.post('/api/products/', {
            name: productName,
            description: productDescription,
            price: productPrice,
            category: categoryId
        }, function(data) {
            $('#productList').prepend(
                `<li class="list-group-item" data-id="${data.id}">
                    ${data.name} - $${data.price}
                    <div>
                        <button class="btn btn-sm btn-warning" onclick="updateProduct(${data.id})">Обновить</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${data.id})">Удалить</button>
                    </div>
                </li>`
            );
        });
    }
}

function updateProduct(id) {
    const newName = prompt("Введите новое название продукта:");
    const newDescription = prompt("Введите новое описание продукта:");
    const newPrice = prompt("Введите новую цену продукта:");
    const newCategoryId = prompt("Введите новый ID категории:");

    if (newName && newDescription && newPrice && newCategoryId) {
        const data = {
            name: newName,
            description: newDescription,
            price: newPrice,
            category: newCategoryId
        };

        $.ajax({
            url: `/api/products/${id}/`,
            method: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(data) {
                $(`#productList li[data-id="${id}"]`).replaceWith(
                    `<li class="list-group-item" data-id="${data.id}">
                        ${data.name} - $${data.price}
                        <div>
                            <button class="btn btn-sm btn-warning" onclick="updateProduct(${data.id})">Обновить</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${data.id})">Удалить</button>
                        </div>
                    </li>`
                );
            },
            error: function(xhr, status, error) {
                console.error("Ошибка обновления продукта:", xhr.responseText);
            }
        });
    }
}

function loadProducts() {
    $.ajax({
        url: 'http://127.0.0.1:8000/api/products/',
        type: 'GET',
        success: function(data) {
            const productsList = $('#productList');
            productsList.empty(); // Очистите текущий список

            data.forEach(product => {
                productsList.append(`
                    <li class="list-group-item" data-id="${product.id}">
                        ${product.name} - $${product.price}
                        <div>
                            <button class="btn btn-sm btn-warning" onclick="updateProduct(${product.id})">Обновить</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Удалить</button>
                        </div>
                    </li>
                `);
            });
        },
        error: function(xhr, status, error) {
            alert('Не удалось загрузить продукты: ' + xhr.responseText);
        }
    });
}

function deleteProduct(id) {
    if (confirm("Вы уверены, что хотите удалить этот продукт?")) {
        $.ajax({
            url: `/api/products/${id}/`,
            type: 'DELETE',
            success: function() {
                $(`#productList li[data-id="${id}"]`).remove();
            },
            error: function(xhr, status, error) {
                alert('Не удалось удалить продукт: ' + xhr.responseText);
            }
        });
    }
}

function createCustomer() {
    const username = prompt("Введите имя пользователя:");
    const email = prompt("Введите email:");
    const firstName = prompt("Введите имя:");
    const lastName = prompt("Введите фамилию:");
    const phone = prompt("Введите номер телефона:");

    if (username && email && firstName && lastName && phone) {
        const data = {
            user: {
                username: username,
                email: email,
                first_name: firstName,
                last_name: lastName
            },
            phone: phone
        };
        $.ajax({
            url: '/api/customers/',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                console.log("Успешный ответ:", response);
                $('#customerList').prepend(
                    `<li class="list-group-item" data-id="${response.id}">
                        ${response.user.username} (${response.user.email})
                        <div>
                            <button class="btn btn-sm btn-warning" onclick="updateCustomer(${response.id})">Обновить</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${response.id})">Удалить</button>
                        </div>
                    </li>`
                );
            },
            error: function(xhr, status, error) {
                console.error("Ошибка:", xhr.responseText);
                alert("Произошла ошибка при создании клиента. Проверьте консоль для деталей.");
            }
        });
    }
}

function updateCustomer(id) {
    const newUsername = prompt("Введите новое имя пользователя:");
    const newEmail = prompt("Введите новый email:");
    const newFirstName = prompt("Введите новое имя:");
    const newLastName = prompt("Введите новую фамилию:");
    const newPhone = prompt("Введите новый номер телефона:");

    if (newUsername && newEmail && newFirstName && newLastName && newPhone) {
        const data = {
            user: {
                username: newUsername,
                email: newEmail,
                first_name: newFirstName,
                last_name: newLastName
            },
            phone: newPhone
        };
        $.ajax({
            url: `/api/customers/${id}/`,
            method: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                $(`#customerList li[data-id="${id}"]`).replaceWith(
                    `<li class="list-group-item" data-id="${response.id}">
                        ${response.user.username} (${response.user.email})
                        <div>
                            <button class="btn btn-sm btn-warning" onclick="updateCustomer(${response.id})">Обновить</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${response.id})">Удалить</button>
                        </div>
                    </li>`
                );
            },
            error: function(xhr, status, error) {
                console.error("Ошибка обновления клиента:", xhr.responseText);
                alert("Произошла ошибка при обновлении клиента. Проверьте консоль для деталей.");
            }
        });
    }
}

function deleteCustomer(id) {
    if (confirm("Вы уверены, что хотите удалить этого клиента?")) {
        $.ajax({
            url: `/api/customers/${id}/`,
            method: 'DELETE',
            success: function() {
                $(`#customerList li[data-id="${id}"]`).remove();
            },
            error: function(xhr, status, error) {
                console.error("Ошибка удаления клиента:", xhr.responseText);
                alert("Произошла ошибка при удалении клиента. Проверьте консоль для деталей.");
            }
        });
    }
}

// Загрузка начальных данных
$.get('/api/categories/', function(data) {
    data.forEach(function(category) {
        $('#categoryList').append(
            `<li class="list-group-item" data-id="${category.id}">
                ${category.name}
                <div>
                    <button class="btn btn-sm btn-warning" onclick="updateCategory(${category.id})">Обновить</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">Удалить</button>
                </div>
            </li>`
        );
    });
});

$.get('/api/products/', function(data) {
    data.forEach(function(product) {
        $('#productList').append(
            `<li class="list-group-item" data-id="${product.id}">
                ${product.name} - $${product.price}
                <div>
                    <button class="btn btn-sm btn-warning" onclick="updateProduct(${product.id})">Обновить</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Удалить</button>
                </div>
            </li>`
        );
    });
});

$.get('/api/customers/', function(data) {
    data.forEach(function(customer) {
        $('#customerList').append(
            `<li class="list-group-item" data-id="${customer.id}">
                ${customer.user.username} (${customer.user.email})
                <div>
                    <button class="btn btn-sm btn-warning" onclick="updateCustomer(${customer.id})">Обновить</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">Удалить</button>
                </div>
            </li>`
        );
    });
});

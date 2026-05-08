// API 基础 URL
const API_BASE = 'http://localhost:8000/api';

// 全局变量
let currentUser = null;
let cart = [];
let currentProduct = null;

// ==================== 页面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    loadUserSession();
});

// ==================== 事件监听器设置 ====================
function setupEventListeners() {
    // 用户菜单
    document.getElementById('user-menu').addEventListener('click', function() {
        if (currentUser) {
            showUserMenu();
        } else {
            openModal('auth-modal');
        }
    });

    // 登录表单
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // 订单表单
    document.getElementById('order-form').addEventListener('submit', handleOrderSubmit);

    // 联系表单
    document.getElementById('contact-form').addEventListener('submit', handleContactSubmit);
}

// ==================== 产品管理 ====================
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('加载产品失败:', error);
        alert('加载产品失败，请稍后重试');
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">🏭</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="product-model">型号: ${product.model}</p>
                <div class="product-price">¥${product.price.toLocaleString()}</div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="viewProductDetail(${product.id})">查看详情</button>
                    <button class="btn btn-primary" onclick="quickAddToCart(${product.id})">加入购物车</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function viewProductDetail(productId) {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`);
        const product = await response.json();
        currentProduct = product;
        
        // 填充模态框
        document.getElementById('modal-product-name').textContent = product.name;
        document.getElementById('modal-product-model').textContent = `型号: ${product.model}`;
        document.getElementById('modal-product-description').textContent = product.description;
        document.getElementById('modal-product-price').textContent = `价格: ¥${product.price.toLocaleString()}`;
        
        // 填充规格信息
        const specsList = document.getElementById('modal-product-specs');
        specsList.innerHTML = '';
        for (const [key, value] of Object.entries(product.specifications)) {
            const li = document.createElement('li');
            li.textContent = `${key}: ${value}`;
            specsList.appendChild(li);
        }
        
        openModal('product-modal');
    } catch (error) {
        console.error('加载产品详情失败:', error);
        alert('加载产品详情失败');
    }
}

// ==================== 购物车管理 ====================
function addToCart() {
    if (!currentProduct) return;
    addToCartItem(currentProduct);
    closeModal('product-modal');
    alert('已添加到购物车');
}

function quickAddToCart(productId) {
    const products = document.querySelectorAll('.product-card');
    // 简单的购物车添加（在实际应用中应该获取产品详情）
    const item = {
        id: productId,
        name: `产品 ${productId}`,
        price: 0,
        quantity: 1
    };
    cart.push(item);
    updateCartDisplay();
    alert('已添加到购物车');
}

function addToCartItem(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    cartItemsDiv.innerHTML = '';
    
    let total = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div>
                <p>${item.name}</p>
                <p>¥${item.price} × ${item.quantity}</p>
            </div>
            <button class="btn" onclick="removeFromCart(${index})" style="padding: 5px 10px;">删除</button>
        `;
        cartItemsDiv.appendChild(itemDiv);
    });
    
    document.getElementById('cart-total').textContent = total.toLocaleString();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('active');
}

function closeCart() {
    document.getElementById('cart-sidebar').classList.remove('active');
}

async function checkout() {
    if (!currentUser) {
        alert('请先登录');
        openModal('auth-modal');
        return;
    }

    if (cart.length === 0) {
        alert('购物车为空');
        return;
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_email: currentUser.email,
                product_id: cart[0].id,
                quantity: cart[0].quantity,
                total_price: totalPrice
            })
        });

        if (response.ok) {
            alert('订单提交成功！');
            cart = [];
            updateCartDisplay();
            closeCart();
        } else {
            alert('订单提交失败，请稍后重试');
        }
    } catch (error) {
        console.error('订单提交失败:', error);
        alert('订单提交失败');
    }
}

// ==================== 用户认证 ====================
async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    try {
        const response = await fetch(`${API_BASE}/users/login?email=${email}&password=${password}`, {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = {
                id: data.user_id,
                email: data.email
            };
            localStorage.setItem('user', JSON.stringify(currentUser));
            alert('登录成功！');
            closeModal('auth-modal');
            updateUserMenu();
            form.reset();
        } else {
            alert('登录失败，邮箱或密码错误');
        }
    } catch (error) {
        console.error('登录失败:', error);
        alert('登录失败，请检查网络连接');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.querySelector('input[type="text"]').value;
    const email = form.querySelectorAll('input[type="email"]')[0].value;
    const company = form.querySelectorAll('input[type="text"]')[1].value;
    const phone = form.querySelector('input[type="tel"]').value;

    try {
        const response = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                company,
                phone
            })
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = {
                id: data.user.id,
                email: data.user.email
            };
            localStorage.setItem('user', JSON.stringify(currentUser));
            alert('注册成功！');
            closeModal('auth-modal');
            updateUserMenu();
            form.reset();
            switchTab('login');
        } else {
            alert('注册失败，请稍后重试');
        }
    } catch (error) {
        console.error('注册失败:', error);
        alert('注册失败，请检查网络连接');
    }
}

function loadUserSession() {
    const user = localStorage.getItem('user');
    if (user) {
        currentUser = JSON.parse(user);
        updateUserMenu();
    }
}

function updateUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (currentUser) {
        userMenu.textContent = `${currentUser.email} ▼`;
    } else {
        userMenu.textContent = '用户';
    }
}

function showUserMenu() {
    const menu = confirm(`欢迎, ${currentUser.email}!\n\n点击确定查看个人中心（演示功能）`);
    if (menu) {
        alert('个人中心功能开发中...');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    updateUserMenu();
    alert('已退出登录');
}

// ==================== 订单管理 ====================
async function handleOrderSubmit(e) {
    e.preventDefault();
    // 订单提交逻辑在 checkout() 中实现
}

// ==================== 其他功能 ====================
function handleContactSubmit(e) {
    e.preventDefault();
    alert('感谢您的留言，我们会尽快与您联系！');
    e.target.reset();
}

// ==================== 模态框控制 ====================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// 点击模态框外部关闭
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});

// ==================== 标签页切换 ====================
function switchTab(tabName) {
    // 隐藏所有表单
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // 取消所有标签页激活
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // 显示选定的表单和标签
    if (tabName === 'login') {
        document.getElementById('login-form').classList.add('active');
        document.querySelectorAll('.tab-button')[0].classList.add('active');
    } else if (tabName === 'register') {
        document.getElementById('register-form').classList.add('active');
        document.querySelectorAll('.tab-button')[1].classList.add('active');
    }
}

// ==================== 页面滚动 ====================
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// ==================== 购物车快捷键 ====================
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'c') {
        event.preventDefault();
        toggleCart();
    }
});

// 显示购物车快捷键提示
console.log('💡 提示: 按 Ctrl+C 快速打开/关闭购物车');

// Sample cryptocurrency data
const cryptoData = [
    { id: 1, name: "Bitcoin", symbol: "BTC", price: 51411.00, change: 2.34, marketCap: 1000000000000, icon: "BTC" },
    { id: 2, name: "Ethereum", symbol: "ETH", price: 2890.50, change: 1.56, marketCap: 347000000000, icon: "ETH" },
    { id: 3, name: "Tether", symbol: "USDT", price: 1.00, change: 0.01, marketCap: 95000000000, icon: "USDT" },
    { id: 4, name: "BNB", symbol: "BNB", price: 585.30, change: -0.45, marketCap: 89000000000, icon: "BNB" },
    { id: 5, name: "Solana", symbol: "SOL", price: 142.80, change: 5.23, marketCap: 63000000000, icon: "SOL" },
    { id: 6, name: "XRP", symbol: "XRP", price: 0.532, change: -1.23, marketCap: 29000000000, icon: "XRP" },
    { id: 7, name: "Cardano", symbol: "ADA", price: 0.452, change: 3.12, marketCap: 16000000000, icon: "ADA" },
    { id: 8, name: "Dogecoin", symbol: "DOGE", price: 0.123, change: 7.89, marketCap: 17500000000, icon: "DOGE" },
    { id: 9, name: "Polkadot", symbol: "DOT", price: 6.98, change: -2.34, marketCap: 8900000000, icon: "DOT" },
    { id: 10, name: "Polygon", symbol: "MATIC", price: 0.789, change: 4.56, marketCap: 7300000000, icon: "MATIC" }
];

// Cart state
let cart = [];
let currentTradeType = 'buy';

// DOM elements
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');
const overlay = document.getElementById('overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalAmount = document.getElementById('cart-total-amount');
const cartCount = document.querySelector('.cart-count');
const tradeTabs = document.querySelectorAll('.trade-tab');
const priceInput = document.getElementById('price');
const quantityInput = document.getElementById('quantity');
const totalInput = document.getElementById('total');
const buyButtons = document.querySelectorAll('.buy-btn');
const checkoutBtn = document.getElementById('checkout-btn');

// Initialize the app
function init() {
    renderCoinList();
    setupEventListeners();
    calculateTotal();
}

// Render the coin list
function renderCoinList() {
    const coinLists = document.querySelectorAll('.coin-list');
    
    coinLists.forEach(coinList => {
        // Skip the header row
        const existingRows = coinList.querySelectorAll('.coin-item');
        existingRows.forEach(row => row.remove());
        
        cryptoData.forEach(coin => {
            const coinItem = document.createElement('div');
            coinItem.className = 'coin-item';
            coinItem.innerHTML = `
                <div class="coin-info">
                    <div class="coin-icon">${coin.icon}</div>
                    <div>
                        <div class="coin-name">${coin.name}</div>
                        <div class="coin-symbol">${coin.symbol}/USDT</div>
                    </div>
                </div>
                <div>$${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div class="${coin.change >= 0 ? 'price-up' : 'price-down'}">${coin.change >= 0 ? '+' : ''}${coin.change}%</div>
                <div>$${(coin.marketCap / 1000000000).toFixed(1)}B</div>
                <div>
                    <button class="buy-btn" data-coin-id="${coin.id}">Buy</button>
                </div>
            `;
            coinList.appendChild(coinItem);
        });
    });
    
    // Re-attach event listeners to buy buttons
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', handleBuyClick);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Navigation tabs
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active tab
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Cart toggle
    cartBtn.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    overlay.addEventListener('click', toggleCart);

    // Trade tabs
    tradeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tradeType = tab.getAttribute('data-trade-type');
            
            // Update active trade tab
            tradeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update trade type
            currentTradeType = tradeType;
            updateTradeButton();
        });
    });

    // Price and quantity inputs
    priceInput.addEventListener('input', calculateTotal);
    quantityInput.addEventListener('input', calculateTotal);

    // Checkout button
    checkoutBtn.addEventListener('click', handleCheckout);
}

// Toggle cart sidebar
function toggleCart() {
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    renderCartItems();
}

// Handle buy button click
function handleBuyClick(event) {
    const coinId = parseInt(event.target.getAttribute('data-coin-id'));
    const coin = cryptoData.find(c => c.id === coinId);
    
    if (coin) {
        // Check if coin is already in cart
        const existingItem = cart.find(item => item.coin.id === coinId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                coin: coin,
                quantity: 1,
                price: coin.price
            });
        }
        
        // Update cart UI
        updateCartCount();
        renderCartItems();
        
        // Show success message
        alert(`Added ${coin.name} to your cart!`);
    }
}

// Update cart count in header
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Render cart items
function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message" style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        cartTotalAmount.textContent = '0.00 USDT';
        return;
    }
    
    let cartHTML = '';
    let totalAmount = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.quantity * item.price;
        totalAmount += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="coin-icon">${item.coin.icon}</div>
                    <div class="cart-item-details">
                        <h4>${item.coin.name}</h4>
                        <p>$${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" data-index="${index}" data-action="decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-index="${index}" data-action="increase">+</button>
                    <button class="quantity-btn" data-index="${index}" data-action="remove" style="margin-left: 10px; color: var(--danger);">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    cartTotalAmount.textContent = `${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', handleQuantityChange);
    });
}

// Handle quantity changes in cart
function handleQuantityChange(event) {
    const index = parseInt(event.target.getAttribute('data-index'));
    const action = event.target.getAttribute('data-action');
    
    if (action === 'increase') {
        cart[index].quantity += 1;
    } else if (action === 'decrease') {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
    } else if (action === 'remove') {
        cart.splice(index, 1);
    }
    
    updateCartCount();
    renderCartItems();
}

// Calculate total for trade form
function calculateTotal() {
    const price = parseFloat(priceInput.value) || 0;
    const quantity = parseFloat(quantityInput.value) || 0;
    const total = price * quantity;
    
    totalInput.value = total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Update trade button based on active tab
function updateTradeButton() {
    const tradeButton = document.querySelector('.trade-btn');
    
    if (currentTradeType === 'buy') {
        tradeButton.textContent = 'Buy BTC';
        tradeButton.className = 'trade-btn buy';
    } else {
        tradeButton.textContent = 'Sell BTC';
        tradeButton.className = 'trade-btn sell';
    }
}

// Handle checkout
function handleCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    alert(`Order placed successfully! Total: $${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    
    // Clear cart
    cart = [];
    updateCartCount();
    renderCartItems();
    toggleCart();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

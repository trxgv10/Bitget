// script.js - Cryptocurrency Exchange JavaScript

// Sample cryptocurrency data with pump/dump indicators
const cryptoData = [
    { id: 1, name: "Bitcoin", symbol: "BTC", price: 51411.00, change: 2.34, marketCap: 1000000000000, icon: "BTC", status: "pump" },
    { id: 2, name: "Ethereum", symbol: "ETH", price: 2890.50, change: 1.56, marketCap: 347000000000, icon: "ETH", status: "neutral" },
    { id: 3, name: "Tether", symbol: "USDT", price: 1.00, change: 0.01, marketCap: 95000000000, icon: "USDT", status: "neutral" },
    { id: 4, name: "BNB", symbol: "BNB", price: 585.30, change: -0.45, marketCap: 89000000000, icon: "BNB", status: "neutral" },
    { id: 5, name: "Solana", symbol: "SOL", price: 142.80, change: 5.23, marketCap: 63000000000, icon: "SOL", status: "pump" },
    { id: 6, name: "XRP", symbol: "XRP", price: 0.532, change: -1.23, marketCap: 29000000000, icon: "XRP", status: "dump" },
    { id: 7, name: "Cardano", symbol: "ADA", price: 0.452, change: 3.12, marketCap: 16000000000, icon: "ADA", status: "pump" },
    { id: 8, name: "Dogecoin", symbol: "DOGE", price: 0.123, change: 7.89, marketCap: 17500000000, icon: "DOGE", status: "pump" },
    { id: 9, name: "Polkadot", symbol: "DOT", price: 6.98, change: -2.34, marketCap: 8900000000, icon: "DOT", status: "dump" },
    { id: 10, name: "Polygon", symbol: "MATIC", price: 0.789, change: 4.56, marketCap: 7300000000, icon: "MATIC", status: "pump" },
    { id: 11, name: "Litecoin", symbol: "LTC", price: 82.15, change: -1.23, marketCap: 6100000000, icon: "LTC", status: "dump" },
    { id: 12, name: "Chainlink", symbol: "LINK", price: 18.42, change: 3.45, marketCap: 10800000000, icon: "LINK", status: "pump" },
    { id: 13, name: "Bitcoin Cash", symbol: "BCH", price: 412.36, change: -0.89, marketCap: 8100000000, icon: "BCH", status: "neutral" },
    { id: 14, name: "Avalanche", symbol: "AVAX", price: 36.78, change: 6.12, marketCap: 13800000000, icon: "AVAX", status: "pump" },
    { id: 15, name: "Uniswap", symbol: "UNI", price: 7.89, change: -2.34, marketCap: 5900000000, icon: "UNI", status: "dump" }
];

// Cart state
let cart = [];
let currentTradeType = 'buy';
let currentSelectedCoin = cryptoData[0]; // Default to Bitcoin

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
const availableInput = document.getElementById('available');
const checkoutBtn = document.getElementById('checkout-btn');
const searchInput = document.querySelector('.search-bar input');
const filterButtons = document.querySelectorAll('.filter-btn');

// Initialize the app
function init() {
    renderCoinList();
    setupEventListeners();
    calculateTotal();
    updateCartCount();
    simulateRealTimeData();
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
            coinItem.setAttribute('data-coin-id', coin.id);
            
            // Determine status indicator
            let statusIndicator = '';
            if (coin.status === 'pump') {
                statusIndicator = '<span class="pump-indicator pump"></span>';
            } else if (coin.status === 'dump') {
                statusIndicator = '<span class="pump-indicator dump"></span>';
            }
            
            coinItem.innerHTML = `
                <div class="coin-info">
                    <div class="coin-icon">${coin.icon}</div>
                    <div>
                        <div class="coin-name">${coin.name} ${statusIndicator}</div>
                        <div class="coin-symbol">${coin.symbol}/USDT</div>
                    </div>
                </div>
                <div class="coin-price">$${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div class="${coin.change >= 0 ? 'price-up' : 'price-down'}">${coin.change >= 0 ? '+' : ''}${coin.change}%</div>
                <div class="coin-marketcap">$${(coin.marketCap / 1000000000).toFixed(1)}B</div>
                <div>
                    <button class="buy-btn" data-coin-id="${coin.id}">Add to Cart</button>
                </div>
            `;
            coinList.appendChild(coinItem);
        });
    });
    
    // Re-attach event listeners to buy buttons
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', handleBuyClick);
    });
    
    // Add click event to coin items for selection
    document.querySelectorAll('.coin-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('buy-btn')) {
                const coinId = parseInt(item.getAttribute('data-coin-id'));
                selectCoin(coinId);
            }
        });
    });
}

// Select a coin for trading
function selectCoin(coinId) {
    const coin = cryptoData.find(c => c.id === coinId);
    if (coin) {
        currentSelectedCoin = coin;
        
        // Update the selected coin display in trade tab
        const selectedCoinElement = document.querySelector('.selected-coin');
        selectedCoinElement.innerHTML = `
            <div class="coin-icon">${coin.icon}</div>
            <div>
                <div class="coin-name">${coin.name}</div>
                <div class="coin-symbol">${coin.symbol}/USDT</div>
            </div>
        `;
        
        // Update the price input
        priceInput.value = coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        // Recalculate total
        calculateTotal();
        
        // Switch to trade tab
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector('.nav-tab[data-tab="trade"]').classList.add('active');
        document.getElementById('trade').classList.add('active');
        
        // Update chart placeholder
        const chartPlaceholder = document.querySelector('.chart-placeholder');
        chartPlaceholder.innerHTML = `
            <i class="fas fa-chart-line"></i>
            <p>Live chart for ${coin.name} (${coin.symbol})</p>
            <small>Chart would show real-time price movements here</small>
        `;
        
        showNotification(`Selected ${coin.name} for trading`);
    }
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
    
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            applyFilters(button.textContent);
        });
    });
    
    // Trade button
    document.querySelector('.trade-btn').addEventListener('click', handleTrade);
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const coinItems = document.querySelectorAll('.coin-item');
    
    coinItems.forEach(item => {
        const coinName = item.querySelector('.coin-name').textContent.toLowerCase();
        const coinSymbol = item.querySelector('.coin-symbol').textContent.toLowerCase();
        
        if (coinName.includes(searchTerm) || coinSymbol.includes(searchTerm)) {
            item.style.display = 'grid';
        } else {
            item.style.display = 'none';
        }
    });
}

// Apply filters
function applyFilters(filter) {
    const coinItems = document.querySelectorAll('.coin-item');
    
    coinItems.forEach(item => {
        const changeElement = item.querySelector('.price-up, .price-down');
        const changeText = changeElement.textContent;
        const isPositive = changeText.includes('+');
        
        switch(filter) {
            case 'Gainers':
                item.style.display = isPositive ? 'grid' : 'none';
                break;
            case 'Losers':
                item.style.display = !isPositive ? 'grid' : 'none';
                break;
            case 'Hot':
                // Show coins with high percentage change
                const changeValue = parseFloat(changeText.replace('+', '').replace('%', ''));
                item.style.display = Math.abs(changeValue) > 3 ? 'grid' : 'none';
                break;
            default:
                item.style.display = 'grid';
        }
    });
}

// Toggle cart sidebar
function toggleCart() {
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    renderCartItems();
}

// Handle buy button click
function handleBuyClick(event) {
    event.stopPropagation();
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
        showNotification(`Added ${coin.name} to your cart!`);
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
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
                <small>Add coins from the Markets tab</small>
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
        
        // Determine status indicator
        let statusIndicator = '';
        if (item.coin.status === 'pump') {
            statusIndicator = '<span class="pump-indicator pump" title="Pumping"></span>';
        } else if (item.coin.status === 'dump') {
            statusIndicator = '<span class="pump-indicator dump" title="Dumping"></span>';
        }
        
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="coin-icon">${item.coin.icon}</div>
                    <div class="cart-item-details">
                        <h4>${item.coin.name} ${statusIndicator}</h4>
                        <p>$${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <small>24h: ${item.coin.change >= 0 ? '+' : ''}${item.coin.change}%</small>
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
    const price = parseFloat(priceInput.value.replace(/,/g, '')) || 0;
    const quantity = parseFloat(quantityInput.value) || 0;
    const total = price * quantity;
    
    totalInput.value = total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Update fee and total payment
    const fee = total * 0.001; // 0.1% fee
    const totalPayment = total + fee;
    
    const orderSummary = document.querySelector('.order-summary');
    orderSummary.innerHTML = `
        <div class="summary-row">
            <span>Fee (0.1%)</span>
            <span>${fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</span>
        </div>
        <div class="summary-row">
            <span>You will ${currentTradeType === 'buy' ? 'pay' : 'receive'}</span>
            <span>${totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</span>
        </div>
    `;
}

// Update trade button based on active tab
function updateTradeButton() {
    const tradeButton = document.querySelector('.trade-btn');
    
    if (currentTradeType === 'buy') {
        tradeButton.textContent = `Buy ${currentSelectedCoin.symbol}`;
        tradeButton.className = 'trade-btn buy';
    } else {
        tradeButton.textContent = `Sell ${currentSelectedCoin.symbol}`;
        tradeButton.className = 'trade-btn sell';
    }
    
    // Update available balance message
    availableInput.value = currentTradeType === 'buy' ? '10,000.00' : `0.5 ${currentSelectedCoin.symbol}`;
}

// Handle trade execution
function handleTrade() {
    const price = parseFloat(priceInput.value.replace(/,/g, '')) || 0;
    const quantity = parseFloat(quantityInput.value) || 0;
    
    if (price <= 0 || quantity <= 0) {
        showNotification('Please enter valid price and quantity', 'danger');
        return;
    }
    
    const total = price * quantity;
    const fee = total * 0.001;
    const totalAmount = total + fee;
    
    showNotification(
        `${currentTradeType === 'buy' ? 'Buy' : 'Sell'} order placed for ${quantity} ${currentSelectedCoin.symbol} at $${price.toLocaleString()}`, 
        'success'
    );
    
    // Reset form
    quantityInput.value = '0.1';
    calculateTotal();
}

// Handle checkout
function handleCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'danger');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const fee = total * 0.001;
    const totalAmount = total + fee;
    
    showNotification(
        `Checkout successful! Total: $${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Fee: $${fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`, 
        'success'
    );
    
    // Clear cart
    cart = [];
    updateCartCount();
    renderCartItems();
    toggleCart();
}

// Simulate real-time data updates
function simulateRealTimeData() {
    setInterval(() => {
        // Randomly update some coin prices
        cryptoData.forEach(coin => {
            if (Math.random() > 0.7) { // 30% chance to update each coin
                const change = (Math.random() - 0.5) * 2; // -1% to +1%
                coin.price *= (1 + change/100);
                coin.change += change;
                
                // Update status based on change
                if (coin.change > 5) {
                    coin.status = 'pump';
                } else if (coin.change < -3) {
                    coin.status = 'dump';
                } else {
                    coin.status = 'neutral';
                }
                
                // Update market cap
                coin.marketCap = coin.price * (coin.marketCap / coin.price);
            }
        });
        
        // Re-render coin list if markets tab is active
        if (document.getElementById('markets').classList.contains('active') || 
            document.getElementById('home').classList.contains('active')) {
            renderCoinList();
        }
        
        // Update current selected coin if in trade tab
        if (document.getElementById('trade').classList.contains('active')) {
            const updatedCoin = cryptoData.find(c => c.id === currentSelectedCoin.id);
            if (updatedCoin && updatedCoin.price !== currentSelectedCoin.price) {
                currentSelectedCoin = updatedCoin;
                priceInput.value = currentSelectedCoin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                calculateTotal();
                
                // Update selected coin display
                const selectedCoinElement = document.querySelector('.selected-coin');
                selectedCoinElement.innerHTML = `
                    <div class="coin-icon">${currentSelectedCoin.icon}</div>
                    <div>
                        <div class="coin-name">${currentSelectedCoin.name}</div>
                        <div class="coin-symbol">${currentSelectedCoin.symbol}/USDT</div>
                    </div>
                `;
            }
        }
        
        // Update cart items if cart is open
        if (cartSidebar.classList.contains('active')) {
            cart.forEach(item => {
                const updatedCoin = cryptoData.find(c => c.id === item.coin.id);
                if (updatedCoin) {
                    item.coin = updatedCoin;
                    item.price = updatedCoin.price;
                }
            });
            renderCartItems();
        }
        
    }, 5000); // Update every 5 seconds
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        cryptoData,
        cart,
        init,
        renderCoinList,
        handleBuyClick,
        handleCheckout,
        calculateTotal
    };
}

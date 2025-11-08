// User Data Management
let userData = {
    balance: 0,
    assets: {},
    portfolio: {},
    pnl: {
        daily: 0,
        total: 0
    },
    orders: [],
    tradeHistory: []
};

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const depositBtn = document.getElementById('deposit-btn');
const withdrawBtn = document.getElementById('withdraw-btn');
const depositModal = document.getElementById('deposit-modal');
const withdrawModal = document.getElementById('withdraw-modal');
const closeButtons = document.querySelectorAll('.close');
const demoAmounts = document.querySelectorAll('.demo-amt');
const addCustomBtn = document.getElementById('add-custom');
const customAmountInput = document.getElementById('custom-amount');
const coinOptions = document.querySelectorAll('.coin-option');
const confirmWithdrawBtn = document.getElementById('confirm-withdraw');

// Navigation System
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const tabName = item.getAttribute('data-tab');
        
        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show corresponding tab content
        tabContents.forEach(tab => {
            tab.classList.remove('active');
            if (tab.id === tabName) {
                tab.classList.add('active');
            }
        });
    });
});

// Modal Management
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

// Deposit System
depositBtn.addEventListener('click', () => openModal(depositModal));
withdrawBtn.addEventListener('click', () => openModal(withdrawModal));

closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        closeModal(modal);
    });
});

// Demo Deposit Amounts
demoAmounts.forEach(btn => {
    btn.addEventListener('click', () => {
        const amount = parseFloat(btn.getAttribute('data-amount'));
        depositFunds(amount);
    });
});

addCustomBtn.addEventListener('click', () => {
    const amount = parseFloat(customAmountInput.value);
    if (amount && amount > 0) {
        depositFunds(amount);
        customAmountInput.value = '';
    }
});

// Coin Selection
coinOptions.forEach(option => {
    option.addEventListener('click', () => {
        coinOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        const coin = option.getAttribute('data-coin');
        updateWalletAddress(coin);
    });
});

// Update Wallet Address based on selected coin
function updateWalletAddress(coin) {
    const addresses = {
        'USDT': '0x742d35Cc6634C0532925a3b8Df5A3b8C8D1F6a5b',
        'BTC': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        'ETH': '0x742d35Cc6634C0532925a3b8Df5A3b8C8D1F6a5b'
    };
    
    document.getElementById('wallet-address').textContent = addresses[coin];
}

// Deposit Funds Function
function depositFunds(amount) {
    userData.balance += amount;
    
    if (!userData.assets.USDT) {
        userData.assets.USDT = 0;
    }
    userData.assets.USDT += amount;
    
    updateUI();
    closeModal(depositModal);
    
    // Show success message
    showNotification(`Successfully deposited ${amount} USDT`);
}

// Withdraw Funds Function
confirmWithdrawBtn.addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const address = document.getElementById('withdraw-address').value;
    const coin = document.getElementById('withdraw-coin').value;
    
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    if (!address) {
        showNotification('Please enter a wallet address', 'error');
        return;
    }
    
    if (amount > userData.balance) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    userData.balance -= amount;
    userData.assets.USDT -= amount;
    
    updateUI();
    closeModal(withdrawModal);
    
    showNotification(`Successfully withdrawn ${amount} USDT to ${address}`);
});

// Update UI with current data
function updateUI() {
    // Update balance displays
    const balanceElements = document.querySelectorAll('.amount, .total-value .amount');
    balanceElements.forEach(el => {
        el.textContent = `${userData.balance.toFixed(2)} USDT`;
    });
    
    const usdElements = document.querySelectorAll('.usd-value');
    usdElements.forEach(el => {
        el.textContent = `≈ ${userData.balance.toFixed(2)} USD`;
    });
    
    // Update available balance in withdraw modal
    document.getElementById('available-balance').textContent = `${userData.balance.toFixed(2)} USDT`;
    
    // Update assets list if we have assets
    updateAssetsList();
}

// Update Assets List
function updateAssetsList() {
    const assetsList = document.querySelector('.assets-list');
    const noAssets = document.querySelector('.no-assets');
    
    if (userData.balance > 0) {
        noAssets.style.display = 'none';
        // Here you would populate the assets list
    } else {
        noAssets.style.display = 'block';
    }
}

// Trading System
const buyBtn = document.querySelector('.btn-buy');
const sellBtn = document.querySelector('.btn-sell');

buyBtn.addEventListener('click', () => {
    const price = parseFloat(document.querySelector('.buy-section .price-input').value);
    const quantity = parseFloat(document.querySelector('.buy-section .quantity-input').value);
    
    if (quantity <= 0) {
        showNotification('Please enter a valid quantity', 'error');
        return;
    }
    
    const totalCost = price * quantity;
    
    if (totalCost > userData.balance) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    // Execute buy order
    userData.balance -= totalCost;
    
    if (!userData.portfolio.NPC) {
        userData.portfolio.NPC = 0;
    }
    userData.portfolio.NPC += quantity;
    
    // Record trade
    userData.tradeHistory.push({
        type: 'BUY',
        pair: 'NPC/USDT',
        price: price,
        quantity: quantity,
        total: totalCost,
        timestamp: new Date()
    });
    
    updateUI();
    showNotification(`Successfully bought ${quantity} NPC at ${price} USDT`);
});

sellBtn.addEventListener('click', () => {
    const price = parseFloat(document.querySelector('.sell-section .price-input').value);
    const quantity = parseFloat(document.querySelector('.sell-section .quantity-input').value);
    
    if (quantity <= 0) {
        showNotification('Please enter a valid quantity', 'error');
        return;
    }
    
    if (!userData.portfolio.NPC || userData.portfolio.NPC < quantity) {
        showNotification('Insufficient NPC balance', 'error');
        return;
    }
    
    // Execute sell order
    const totalValue = price * quantity;
    userData.balance += totalValue;
    userData.portfolio.NPC -= quantity;
    
    // Record trade
    userData.tradeHistory.push({
        type: 'SELL',
        pair: 'NPC/USDT',
        price: price,
        quantity: quantity,
        total: totalValue,
        timestamp: new Date()
    });
    
    updateUI();
    showNotification(`Successfully sold ${quantity} NPC at ${price} USDT`);
});

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#0ecb81' : '#f6465d'};
        color: ${type === 'success' ? '#000' : '#fff'};
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Copy Address Functionality
document.querySelector('.btn-copy').addEventListener('click', () => {
    const address = document.getElementById('wallet-address').textContent;
    navigator.clipboard.writeText(address).then(() => {
        showNotification('Address copied to clipboard');
    });
});

// Market Data Simulation (Real prices would come from API)
function simulateMarketData() {
    const changes = document.querySelectorAll('.change');
    changes.forEach(change => {
        if (Math.random() > 0.5) {
            change.classList.add('positive');
            change.classList.remove('negative');
            change.textContent = `+${(Math.random() * 3).toFixed(2)}%`;
        } else {
            change.classList.add('negative');
            change.classList.remove('positive');
            change.textContent = `-${(Math.random() * 2).toFixed(2)}%`;
        }
    });
}

// Initialize the application
function init() {
    updateUI();
    
    // Simulate market data updates every 5 seconds
    setInterval(simulateMarketData, 5000);
    
    // Set default coin
    updateWalletAddress('USDT');
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .coin-option.selected {
        background: #2a2a3e;
        border: 1px solid #0ecb81;
    }
`;
document.head.appendChild(style);

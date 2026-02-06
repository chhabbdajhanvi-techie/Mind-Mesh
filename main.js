/* ===================================
   SmartStock AI - Main Application
   =================================== */

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log(`%c SmartStock AI v${CONFIG.VERSION} `, 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 16px; padding: 10px; border-radius: 5px;');
    console.log('🎯 Award-Winning Inventory Management System');
    console.log('📊 Predictive Analytics Enabled');
    console.log('📸 Bill Scanner Ready');
    
    // Initialize all managers
    initializeApplication();
});

// Main initialization function
function initializeApplication() {
    try {
        // Initialize UI Manager
        uiManager.init();
        
        // Initialize Scanner
        scannerManager.init();
        
        // Render initial views
        inventoryManager.render();
        scannerManager.render();
        predictionsManager.render();
        
        // Update statistics
        uiManager.updateStats();
        
        // Check for seasonal alerts
        checkSeasonalAlerts();
        
        // Set up periodic updates
        setupPeriodicUpdates();
        
        console.log('✓ Application initialized successfully');
        
        // Show welcome message for first-time users
        if (isFirstVisit()) {
            showWelcomeMessage();
        }
        
    } catch (error) {
        console.error('Error initializing application:', error);
        uiManager.showNotification('⚠️ Error initializing application', 'error');
    }
}

// Check if this is the first visit
function isFirstVisit() {
    const visited = localStorage.getItem('smartstock_visited');
    if (!visited) {
        localStorage.setItem('smartstock_visited', 'true');
        return true;
    }
    return false;
}

// Show welcome message
function showWelcomeMessage() {
    setTimeout(() => {
        uiManager.showNotification('👋 Welcome to SmartStock AI! Your intelligent inventory companion.', 'info');
    }, 500);
}

// Check for seasonal alerts
function checkSeasonalAlerts() {
    const settings = dataManager.getSettings();
    if (!settings.seasonalAlerts) return;
    
    const insights = predictionsManager.getInsights();
    const criticalInsights = insights.filter(i => i.priority === 'critical');
    
    if (criticalInsights.length > 0) {
        setTimeout(() => {
            criticalInsights.forEach((insight, index) => {
                setTimeout(() => {
                    uiManager.showNotification(insight.message, 'warning');
                }, index * 3500); // Stagger notifications
            });
        }, 2000);
    }
}

// Setup periodic updates
function setupPeriodicUpdates() {
    // Update stats every 30 seconds (in case of external changes)
    setInterval(() => {
        uiManager.updateStats();
    }, 30000);
    
    // Check for low stock alerts every 5 minutes
    setInterval(() => {
        checkLowStockAlerts();
    }, 300000);
}

// Check for low stock alerts
function checkLowStockAlerts() {
    const settings = dataManager.getSettings();
    if (!settings.lowStockAlerts) return;
    
    const lowStockItems = dataManager.getLowStockItems();
    
    if (lowStockItems.length > 0) {
        console.log(`⚠️ ${lowStockItems.length} item(s) are low in stock`);
        
        // Show notification for critically low items (quantity < 5)
        const critical = lowStockItems.filter(item => item.quantity < 5);
        if (critical.length > 0) {
            uiManager.showNotification(
                `⚠️ ${critical.length} item(s) are critically low in stock!`,
                'warning'
            );
        }
    }
}

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInventory');
        if (searchInput) searchInput.focus();
    }
    
    // Ctrl/Cmd + N: Focus add item form
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const productName = document.getElementById('productName');
        if (productName) productName.focus();
    }
    
    // Ctrl/Cmd + E: Export data
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        uiManager.exportData();
    }
    
    // Escape: Close modal
    if (e.key === 'Escape') {
        uiManager.closeSettings();
    }
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Re-render charts on resize for proper scaling
        predictionsManager.render();
    }, 250);
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Refresh data when page becomes visible
        inventoryManager.render();
        uiManager.updateStats();
        predictionsManager.render();
    }
});

// Service worker registration (for PWA support - optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable PWA
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    uiManager.showNotification('⚠️ An error occurred. Check console for details.', 'error');
});

// Prevent accidental page close with unsaved changes
window.addEventListener('beforeunload', (e) => {
    const hasUnsavedBills = dataManager.getAllScannedBills().length > 0;
    if (hasUnsavedBills) {
        e.preventDefault();
        e.returnValue = 'You have unprocessed scanned bills. Are you sure you want to leave?';
        return e.returnValue;
    }
});

// Export global functions for inline onclick handlers
window.inventoryManager = inventoryManager;
window.scannerManager = scannerManager;
window.predictionsManager = predictionsManager;
window.uiManager = uiManager;

// Console commands for developers/debugging
window.SmartStock = {
    version: CONFIG.VERSION,
    
    getInventory: () => dataManager.getAllItems(),
    
    getStats: () => ({
        totalItems: dataManager.getTotalItems(),
        totalValue: dataManager.getTotalValue(),
        lowStock: dataManager.getLowStockCount(),
        predictedGrowth: dataManager.getPredictedGrowth()
    }),
    
    getInsights: () => predictionsManager.getInsights(),
    
    getRecommendations: () => predictionsManager.getReorderRecommendations(),
    
    exportData: () => dataManager.exportToJSON(),
    
    resetData: () => {
        if (confirm('Reset all data?')) {
            dataManager.resetAllData();
            location.reload();
        }
    },
    
    help: () => {
        console.log(`
SmartStock AI Developer Console
================================

Available commands:
- SmartStock.getInventory()      Get all inventory items
- SmartStock.getStats()           Get current statistics
- SmartStock.getInsights()        Get AI insights
- SmartStock.getRecommendations() Get reorder recommendations
- SmartStock.exportData()         Export all data as JSON
- SmartStock.resetData()          Reset all data
- SmartStock.help()               Show this help message

Keyboard Shortcuts:
- Ctrl/Cmd + K    Focus search
- Ctrl/Cmd + N    Focus add item form
- Ctrl/Cmd + E    Export data
- Escape          Close modal
        `);
    }
};

console.log('💡 Type SmartStock.help() for developer commands');
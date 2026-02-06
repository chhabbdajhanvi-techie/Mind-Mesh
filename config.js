/* ===================================
   SmartStock AI - Configuration
   =================================== */

const CONFIG = {
    // Application Settings
    APP_NAME: 'SmartStock AI',
    VERSION: '1.0.0',
    
    // Stock Level Thresholds
    STOCK_LEVELS: {
        LOW: 10,
        MEDIUM: 30,
        HIGH: Infinity
    },
    
    // Default Reorder Level
    DEFAULT_REORDER_LEVEL: 10,
    
    // Local Storage Keys
    STORAGE_KEYS: {
        INVENTORY: 'smartstock_inventory',
        SCANNED_BILLS: 'smartstock_scanned_bills',
        SETTINGS: 'smartstock_settings',
        NEXT_ID: 'smartstock_next_id'
    },
    
    // Seasonal Sales Multipliers (based on historical data)
    SEASONAL_DATA: {
        'Electronics': {
            winter: 1.3,   // +30% during winter (holiday shopping)
            spring: 1.0,   // Normal
            summer: 0.9,   // -10% during summer
            fall: 1.2      // +20% during fall (back to school)
        },
        'Clothing': {
            winter: 1.4,   // +40% during winter (seasonal clothing)
            spring: 1.1,   // +10% during spring
            summer: 0.8,   // -20% during summer
            fall: 1.3      // +30% during fall
        },
        'Food': {
            winter: 1.0,   // Consistent year-round
            spring: 1.0,
            summer: 1.1,   // +10% during summer (BBQ season)
            fall: 1.0
        },
        'Home': {
            winter: 0.9,   // -10% during winter
            spring: 1.3,   // +30% during spring (spring cleaning)
            summer: 1.2,   // +20% during summer (outdoor items)
            fall: 1.0      // Normal
        },
        'Sports': {
            winter: 0.8,   // -20% during winter
            spring: 1.3,   // +30% during spring (outdoor activities)
            summer: 1.4,   // +40% during summer (peak season)
            fall: 1.1      // +10% during fall
        },
        'Beauty': {
            winter: 1.2,   // +20% during winter (holiday gifts)
            spring: 1.0,   // Normal
            summer: 1.1,   // +10% during summer
            fall: 1.0      // Normal
        },
        'Books': {
            winter: 1.1,   // +10% during winter (holiday reading)
            spring: 1.0,   // Normal
            summer: 0.9,   // -10% during summer
            fall: 1.2      // +20% during fall (back to school)
        },
        'Toys': {
            winter: 1.5,   // +50% during winter (holiday season)
            spring: 0.9,   // -10% during spring
            summer: 1.0,   // Normal
            fall: 1.3      // +30% during fall (pre-holiday)
        }
    },
    
    // Categories
    CATEGORIES: [
        'Electronics',
        'Clothing',
        'Food',
        'Home',
        'Sports',
        'Beauty',
        'Books',
        'Toys'
    ],
    
    // File Upload Settings
    FILE_UPLOAD: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        MAX_FILES: 5
    },
    
    // UI Settings
    UI: {
        ANIMATION_DURATION: 300,
        CHART_ANIMATION_DURATION: 1000,
        NOTIFICATION_DURATION: 3000
    },
    
    // Simulation Settings (for demo purposes)
    SIMULATION: {
        ENABLE_OCR_SIMULATION: true,
        OCR_DELAY: 1500, // ms
        MOCK_ITEMS_POOL: [
            { name: 'USB Cable', category: 'Electronics', quantity: 10, price: 12.99 },
            { name: 'Notebook Set', category: 'Books', quantity: 15, price: 8.99 },
            { name: 'Water Bottle', category: 'Sports', quantity: 20, price: 14.99 },
            { name: 'LED Bulbs', category: 'Home', quantity: 12, price: 9.99 },
            { name: 'Face Mask Pack', category: 'Beauty', quantity: 25, price: 19.99 },
            { name: 'T-Shirt', category: 'Clothing', quantity: 8, price: 24.99 },
            { name: 'Protein Bar Box', category: 'Food', quantity: 30, price: 29.99 },
            { name: 'Board Game', category: 'Toys', quantity: 6, price: 34.99 }
        ]
    },
    
    // Export Settings
    EXPORT: {
        FILENAME_PREFIX: 'smartstock_inventory_',
        DATE_FORMAT: 'YYYY-MM-DD'
    }
};

// Helper function to get current season
function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
}

// Helper function to get seasonal multiplier
function getSeasonalMultiplier(category) {
    const season = getCurrentSeason();
    return CONFIG.SEASONAL_DATA[category]?.[season] || 1.0;
}

// Helper function to get seasonal indicator
function getSeasonalIndicator(multiplier) {
    if (multiplier >= 1.2) {
        return {
            class: 'season-high',
            text: '🔥 Peak Season',
            percentage: `+${((multiplier - 1) * 100).toFixed(0)}%`
        };
    }
    if (multiplier >= 1.0) {
        return {
            class: 'season-medium',
            text: '📈 Normal',
            percentage: multiplier > 1.0 ? `+${((multiplier - 1) * 100).toFixed(0)}%` : '0%'
        };
    }
    return {
        class: 'season-low',
        text: '📉 Off Season',
        percentage: `${((multiplier - 1) * 100).toFixed(0)}%`
    };
}

// Helper function to get stock level class
function getStockLevelClass(quantity, reorderLevel = CONFIG.DEFAULT_REORDER_LEVEL) {
    if (quantity < reorderLevel) return 'stock-low';
    if (quantity < CONFIG.STOCK_LEVELS.MEDIUM) return 'stock-medium';
    return 'stock-high';
}

// Helper function to get stock level text
function getStockLevelText(quantity, reorderLevel = CONFIG.DEFAULT_REORDER_LEVEL) {
    if (quantity < reorderLevel) return 'Low Stock ⚠️';
    if (quantity < CONFIG.STOCK_LEVELS.MEDIUM) return 'Medium Stock';
    return 'In Stock ✓';
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Helper function to format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
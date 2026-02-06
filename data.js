/* ===================================
   SmartStock AI - Data Management
   =================================== */

class DataManager {
    constructor() {
        this.inventory = [];
        this.scannedBills = [];
        this.nextId = 1;
        this.settings = this.getDefaultSettings();
        this.loadFromStorage();
    }

    // Default Settings
    getDefaultSettings() {
        return {
            darkMode: false,
            showAnimations: true,
            lowStockAlerts: true,
            seasonalAlerts: true
        };
    }

    // Initialize with sample data
    initializeSampleData() {
        this.inventory = [
            {
                id: 1,
                name: 'Wireless Headphones',
                sku: 'ELEC-WH-001',
                category: 'Electronics',
                quantity: 45,
                price: 79.99,
                reorderLevel: 15
            },
            {
                id: 2,
                name: 'Winter Jacket',
                sku: 'CLTH-WJ-002',
                category: 'Clothing',
                quantity: 12,
                price: 129.99,
                reorderLevel: 10
            },
            {
                id: 3,
                name: 'Coffee Beans',
                sku: 'FOOD-CB-003',
                category: 'Food',
                quantity: 8,
                price: 15.99,
                reorderLevel: 10
            },
            {
                id: 4,
                name: 'Yoga Mat',
                sku: 'SPRT-YM-004',
                category: 'Sports',
                quantity: 25,
                price: 29.99,
                reorderLevel: 12
            },
            {
                id: 5,
                name: 'Smart Watch',
                sku: 'ELEC-SW-005',
                category: 'Electronics',
                quantity: 18,
                price: 199.99,
                reorderLevel: 8
            },
            {
                id: 6,
                name: 'Garden Tools Set',
                sku: 'HOME-GT-006',
                category: 'Home',
                quantity: 15,
                price: 49.99,
                reorderLevel: 10
            },
            {
                id: 7,
                name: 'Moisturizer Cream',
                sku: 'BEAU-MC-007',
                category: 'Beauty',
                quantity: 32,
                price: 24.99,
                reorderLevel: 15
            },
            {
                id: 8,
                name: 'Best Seller Novel',
                sku: 'BOOK-BSN-008',
                category: 'Books',
                quantity: 22,
                price: 16.99,
                reorderLevel: 10
            }
        ];
        this.nextId = 9;
        this.saveToStorage();
    }

    // Load data from localStorage
    loadFromStorage() {
        try {
            const inventoryData = localStorage.getItem(CONFIG.STORAGE_KEYS.INVENTORY);
            const billsData = localStorage.getItem(CONFIG.STORAGE_KEYS.SCANNED_BILLS);
            const settingsData = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
            const nextIdData = localStorage.getItem(CONFIG.STORAGE_KEYS.NEXT_ID);

            if (inventoryData) {
                this.inventory = JSON.parse(inventoryData);
            } else {
                this.initializeSampleData();
            }

            if (billsData) {
                this.scannedBills = JSON.parse(billsData);
            }

            if (settingsData) {
                this.settings = { ...this.settings, ...JSON.parse(settingsData) };
            }

            if (nextIdData) {
                this.nextId = parseInt(nextIdData);
            }
        } catch (error) {
            console.error('Error loading data from storage:', error);
            this.initializeSampleData();
        }
    }

    // Save data to localStorage
    saveToStorage() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.INVENTORY, JSON.stringify(this.inventory));
            localStorage.setItem(CONFIG.STORAGE_KEYS.SCANNED_BILLS, JSON.stringify(this.scannedBills));
            localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
            localStorage.setItem(CONFIG.STORAGE_KEYS.NEXT_ID, this.nextId.toString());
        } catch (error) {
            console.error('Error saving data to storage:', error);
        }
    }

    // Inventory Methods
    addItem(item) {
        const newItem = {
            id: this.nextId++,
            ...item,
            reorderLevel: item.reorderLevel || CONFIG.DEFAULT_REORDER_LEVEL
        };
        this.inventory.push(newItem);
        this.saveToStorage();
        return newItem;
    }

    updateItem(id, updates) {
        const index = this.inventory.findIndex(item => item.id === id);
        if (index !== -1) {
            this.inventory[index] = { ...this.inventory[index], ...updates };
            this.saveToStorage();
            return this.inventory[index];
        }
        return null;
    }

    deleteItem(id) {
        const index = this.inventory.findIndex(item => item.id === id);
        if (index !== -1) {
            const deleted = this.inventory.splice(index, 1)[0];
            this.saveToStorage();
            return deleted;
        }
        return null;
    }

    getItem(id) {
        return this.inventory.find(item => item.id === id);
    }

    getAllItems() {
        return [...this.inventory];
    }

    updateQuantity(id, change) {
        const item = this.getItem(id);
        if (item) {
            item.quantity = Math.max(0, item.quantity + change);
            this.saveToStorage();
            return item;
        }
        return null;
    }

    searchItems(query) {
        const lowerQuery = query.toLowerCase();
        return this.inventory.filter(item =>
            item.name.toLowerCase().includes(lowerQuery) ||
            item.category.toLowerCase().includes(lowerQuery) ||
            (item.sku && item.sku.toLowerCase().includes(lowerQuery))
        );
    }

    filterByCategory(category) {
        if (!category) return this.inventory;
        return this.inventory.filter(item => item.category === category);
    }

    getLowStockItems() {
        return this.inventory.filter(item => item.quantity < item.reorderLevel);
    }

    // Scanned Bills Methods
    addScannedBill(bill) {
        const newBill = {
            id: Date.now(),
            ...bill,
            date: new Date().toISOString()
        };
        this.scannedBills.push(newBill);
        this.saveToStorage();
        return newBill;
    }

    deleteScannedBill(id) {
        const index = this.scannedBills.findIndex(bill => bill.id === id);
        if (index !== -1) {
            const deleted = this.scannedBills.splice(index, 1)[0];
            this.saveToStorage();
            return deleted;
        }
        return null;
    }

    getScannedBill(id) {
        return this.scannedBills.find(bill => bill.id === id);
    }

    getAllScannedBills() {
        return [...this.scannedBills];
    }

    // Statistics Methods
    getTotalItems() {
        return this.inventory.length;
    }

    getTotalValue() {
        return this.inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    }

    getLowStockCount() {
        return this.getLowStockItems().length;
    }

    getPredictedGrowth() {
        if (this.inventory.length === 0) return 0;
        
        const totalGrowth = this.inventory.reduce((sum, item) => {
            const multiplier = getSeasonalMultiplier(item.category);
            return sum + ((multiplier - 1) * 100);
        }, 0);
        
        return totalGrowth / this.inventory.length;
    }

    getCategoryData() {
        const categoryData = {};
        
        this.inventory.forEach(item => {
            if (!categoryData[item.category]) {
                categoryData[item.category] = {
                    quantity: 0,
                    value: 0,
                    items: []
                };
            }
            categoryData[item.category].quantity += item.quantity;
            categoryData[item.category].value += item.quantity * item.price;
            categoryData[item.category].items.push(item);
        });
        
        return categoryData;
    }

    // Settings Methods
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveToStorage();
        return this.settings;
    }

    getSettings() {
        return { ...this.settings };
    }

    // Reset Methods
    resetAllData() {
        this.inventory = [];
        this.scannedBills = [];
        this.nextId = 1;
        this.settings = this.getDefaultSettings();
        this.saveToStorage();
        this.initializeSampleData();
    }

    // Export Methods
    exportToJSON() {
        return {
            inventory: this.inventory,
            scannedBills: this.scannedBills,
            exportDate: new Date().toISOString(),
            version: CONFIG.VERSION
        };
    }

    exportToCSV() {
        const headers = ['ID', 'Name', 'SKU', 'Category', 'Quantity', 'Price', 'Reorder Level', 'Total Value'];
        const rows = this.inventory.map(item => [
            item.id,
            item.name,
            item.sku || '',
            item.category,
            item.quantity,
            item.price,
            item.reorderLevel,
            (item.quantity * item.price).toFixed(2)
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        return csvContent;
    }
}

// Create global instance
const dataManager = new DataManager();
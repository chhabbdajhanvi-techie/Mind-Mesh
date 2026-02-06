/* ===================================
   SmartStock AI - UI Management
   =================================== */

class UIManager {
    constructor() {
        this.notificationTimeout = null;
    }

    // Initialize UI components
    init() {
        this.setupEventListeners();
        this.updateStats();
        this.applySettings();
    }

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInventory');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                inventoryManager.setSearch(e.target.value);
            });
        }

        // Category filter
        const filterSelect = document.getElementById('filterCategory');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                inventoryManager.setFilter(e.target.value);
            });
        }

        // Add item form
        const addItemForm = document.getElementById('addItemForm');
        if (addItemForm) {
            addItemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddItem();
            });
        }

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }

        // Settings modal
        const closeSettings = document.getElementById('closeSettings');
        if (closeSettings) {
            closeSettings.addEventListener('click', () => {
                this.closeSettings();
            });
        }

        const saveSettings = document.getElementById('saveSettings');
        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        const resetData = document.getElementById('resetData');
        if (resetData) {
            resetData.addEventListener('click', () => {
                this.resetAllData();
            });
        }

        // Modal backdrop click
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    this.closeSettings();
                }
            });
        }
    }

    // Handle add item form submission
    handleAddItem() {
        const form = document.getElementById('addItemForm');
        const formData = new FormData(form);

        const itemData = {
            name: document.getElementById('productName').value.trim(),
            sku: document.getElementById('productSKU').value.trim() || null,
            category: document.getElementById('productCategory').value,
            quantity: parseInt(document.getElementById('productQuantity').value),
            price: parseFloat(document.getElementById('productPrice').value),
            reorderLevel: parseInt(document.getElementById('productReorder').value)
        };

        inventoryManager.addItem(itemData);
        form.reset();
    }

    // Update statistics dashboard
    updateStats() {
        const totalItems = dataManager.getTotalItems();
        const lowStock = dataManager.getLowStockCount();
        const totalValue = dataManager.getTotalValue();
        const predictedGrowth = dataManager.getPredictedGrowth();

        this.animateValue('totalItems', totalItems);
        this.animateValue('lowStock', lowStock);
        
        const valueElement = document.getElementById('totalValue');
        if (valueElement) {
            valueElement.textContent = formatCurrency(totalValue);
        }

        const growthElement = document.getElementById('predictedGrowth');
        if (growthElement) {
            const sign = predictedGrowth >= 0 ? '+' : '';
            growthElement.textContent = `${sign}${predictedGrowth.toFixed(1)}%`;
            growthElement.style.color = predictedGrowth >= 0 ? '#6bcf7f' : '#ff6b6b';
        }
    }

    // Animate number values
    animateValue(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;
        const difference = targetValue - currentValue;
        const duration = 500;
        const steps = 20;
        const stepValue = difference / steps;
        const stepDuration = duration / steps;

        let current = currentValue;
        let step = 0;

        const interval = setInterval(() => {
            step++;
            current += stepValue;

            if (step >= steps) {
                current = targetValue;
                clearInterval(interval);
            }

            element.textContent = Math.round(current);
        }, stepDuration);
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Clear existing notification
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }

        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            font-weight: 600;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto remove
        this.notificationTimeout = setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, CONFIG.UI.NOTIFICATION_DURATION);
    }

    // Get notification color by type
    getNotificationColor(type) {
        const colors = {
            success: '#6bcf7f',
            warning: '#ffd93d',
            error: '#ff6b6b',
            info: '#667eea'
        };
        return colors[type] || colors.info;
    }

    // Export data
    exportData() {
        const exportMenu = confirm('Export as CSV?\n\nOK = CSV\nCancel = JSON');
        
        if (exportMenu) {
            // Export as CSV
            const csv = dataManager.exportToCSV();
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${CONFIG.EXPORT.FILENAME_PREFIX}${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            this.showNotification('✓ Inventory exported as CSV', 'success');
        } else {
            // Export as JSON
            const json = JSON.stringify(dataManager.exportToJSON(), null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${CONFIG.EXPORT.FILENAME_PREFIX}${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
            this.showNotification('✓ Inventory exported as JSON', 'success');
        }
    }

    // Open settings modal
    openSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('active');
            this.loadSettingsToForm();
        }
    }

    // Close settings modal
    closeSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Load current settings to form
    loadSettingsToForm() {
        const settings = dataManager.getSettings();
        
        const darkMode = document.getElementById('darkMode');
        if (darkMode) darkMode.checked = settings.darkMode;
        
        const showAnimations = document.getElementById('showAnimations');
        if (showAnimations) showAnimations.checked = settings.showAnimations;
        
        const lowStockAlerts = document.getElementById('lowStockAlerts');
        if (lowStockAlerts) lowStockAlerts.checked = settings.lowStockAlerts;
        
        const seasonalAlerts = document.getElementById('seasonalAlerts');
        if (seasonalAlerts) seasonalAlerts.checked = settings.seasonalAlerts;
    }

    // Save settings
    saveSettings() {
        const newSettings = {
            darkMode: document.getElementById('darkMode')?.checked || false,
            showAnimations: document.getElementById('showAnimations')?.checked || true,
            lowStockAlerts: document.getElementById('lowStockAlerts')?.checked || true,
            seasonalAlerts: document.getElementById('seasonalAlerts')?.checked || true
        };

        dataManager.updateSettings(newSettings);
        this.applySettings();
        this.closeSettings();
        this.showNotification('✓ Settings saved', 'success');
    }

    // Apply settings to UI
    applySettings() {
        const settings = dataManager.getSettings();
        
        // Dark mode
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Animations
        if (!settings.showAnimations) {
            document.body.style.setProperty('--transition-speed', '0ms');
        } else {
            document.body.style.setProperty('--transition-speed', '300ms');
        }
    }

    // Reset all data
    resetAllData() {
        if (confirm('⚠️ This will delete all inventory and scanned bills.\n\nAre you sure?')) {
            if (confirm('This action cannot be undone. Continue?')) {
                dataManager.resetAllData();
                inventoryManager.render();
                scannerManager.render();
                predictionsManager.render();
                this.updateStats();
                this.closeSettings();
                this.showNotification('✓ All data has been reset', 'success');
            }
        }
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Create global instance
const uiManager = new UIManager();
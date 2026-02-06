/* ===================================
   SmartStock AI - Inventory Management
   =================================== */

class InventoryManager {
    constructor() {
        this.currentFilter = '';
        this.currentSearch = '';
    }

    // Render inventory list
    render() {
        const container = document.getElementById('inventoryList');
        if (!container) return;

        let items = dataManager.getAllItems();

        // Apply filters
        if (this.currentFilter) {
            items = items.filter(item => item.category === this.currentFilter);
        }

        // Apply search
        if (this.currentSearch) {
            const query = this.currentSearch.toLowerCase();
            items = items.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                (item.sku && item.sku.toLowerCase().includes(query))
            );
        }

        if (items.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <div style="font-size: 3em; margin-bottom: 15px;">📦</div>
                    <p>No items found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => this.createItemHTML(item)).join('');
    }

    // Create HTML for single item
    createItemHTML(item) {
        const stockClass = getStockLevelClass(item.quantity, item.reorderLevel);
        const stockText = getStockLevelText(item.quantity, item.reorderLevel);
        const multiplier = getSeasonalMultiplier(item.category);
        const seasonal = getSeasonalIndicator(multiplier);

        return `
            <div class="inventory-item fade-in" data-id="${item.id}">
                <div class="item-info">
                    <h3>${item.name}</h3>
                    ${item.sku ? `<div class="item-details">SKU: <span class="item-sku">${item.sku}</span></div>` : ''}
                    <div class="item-details">Category: ${item.category}</div>
                    <div class="item-details">Price: ${formatCurrency(item.price)} | Total: ${formatCurrency(item.quantity * item.price)}</div>
                    <div class="item-details">
                        <span class="stock-level ${stockClass}">${stockText}: ${item.quantity}</span>
                        <span class="seasonal-indicator ${seasonal.class}">${seasonal.text}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" onclick="inventoryManager.editItem(${item.id})">✏️ Edit</button>
                        <button class="btn-delete" onclick="inventoryManager.deleteItem(${item.id})">🗑️ Delete</button>
                    </div>
                </div>
                <div class="counter-controls">
                    <button class="counter-btn" onclick="inventoryManager.updateQuantity(${item.id}, -1)">−</button>
                    <div class="counter-display">${item.quantity}</div>
                    <button class="counter-btn" onclick="inventoryManager.updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
    }

    // Update quantity
    updateQuantity(id, change) {
        dataManager.updateQuantity(id, change);
        this.render();
        uiManager.updateStats();
        predictionsManager.render();
        
        // Check for low stock alert
        const item = dataManager.getItem(id);
        if (item && item.quantity < item.reorderLevel && dataManager.settings.lowStockAlerts) {
            uiManager.showNotification(`⚠️ ${item.name} is running low (${item.quantity} left)`, 'warning');
        }
    }

    // Add new item
    addItem(itemData) {
        const newItem = dataManager.addItem(itemData);
        this.render();
        uiManager.updateStats();
        predictionsManager.render();
        uiManager.showNotification(`✓ ${newItem.name} added to inventory`, 'success');
        return newItem;
    }

    // Edit item (simplified version - opens a prompt)
    editItem(id) {
        const item = dataManager.getItem(id);
        if (!item) return;

        const newName = prompt('Enter new name:', item.name);
        if (newName && newName.trim()) {
            dataManager.updateItem(id, { name: newName.trim() });
            this.render();
            uiManager.showNotification(`✓ ${newName} updated`, 'success');
        }
    }

    // Delete item
    deleteItem(id) {
        const item = dataManager.getItem(id);
        if (!item) return;

        if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
            dataManager.deleteItem(id);
            this.render();
            uiManager.updateStats();
            predictionsManager.render();
            uiManager.showNotification(`✓ ${item.name} deleted`, 'success');
        }
    }

    // Set search query
    setSearch(query) {
        this.currentSearch = query;
        this.render();
    }

    // Set category filter
    setFilter(category) {
        this.currentFilter = category;
        this.render();
    }

    // Clear filters
    clearFilters() {
        this.currentSearch = '';
        this.currentFilter = '';
        this.render();
    }
}

// Create global instance
const inventoryManager = new InventoryManager();
/* ===================================
   SmartStock AI - Bill Scanner
   =================================== */

class ScannerManager {
    constructor() {
        this.processingFiles = false;
    }

    // Initialize scanner
    init() {
        const scanArea = document.getElementById('scanArea');
        const fileInput = document.getElementById('fileInput');

        if (!scanArea || !fileInput) return;

        // Click to upload
        scanArea.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                fileInput.click();
            }
        });

        // Drag and drop events
        scanArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            scanArea.classList.add('dragover');
        });

        scanArea.addEventListener('dragleave', () => {
            scanArea.classList.remove('dragover');
        });

        scanArea.addEventListener('drop', (e) => {
            e.preventDefault();
            scanArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            this.processFiles(files);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.processFiles(files);
            e.target.value = ''; // Reset input
        });
    }

    // Process uploaded files
    async processFiles(files) {
        if (this.processingFiles) {
            uiManager.showNotification('⏳ Already processing files...', 'info');
            return;
        }

        if (files.length === 0) return;

        // Validate file count
        if (files.length > CONFIG.FILE_UPLOAD.MAX_FILES) {
            uiManager.showNotification(
                `⚠️ Maximum ${CONFIG.FILE_UPLOAD.MAX_FILES} files allowed at once`,
                'warning'
            );
            return;
        }

        // Validate file types and sizes
        const validFiles = [];
        for (const file of files) {
            if (!CONFIG.FILE_UPLOAD.ACCEPTED_TYPES.includes(file.type)) {
                uiManager.showNotification(
                    `⚠️ ${file.name} is not a supported file type`,
                    'warning'
                );
                continue;
            }
            if (file.size > CONFIG.FILE_UPLOAD.MAX_SIZE) {
                uiManager.showNotification(
                    `⚠️ ${file.name} is too large (max 10MB)`,
                    'warning'
                );
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        this.processingFiles = true;
        uiManager.showNotification('🔍 Processing files...', 'info');

        for (const file of validFiles) {
            await this.simulateOCR(file);
        }

        this.processingFiles = false;
        uiManager.showNotification(
            `✓ Processed ${validFiles.length} file(s)`,
            'success'
        );
    }

    // Simulate OCR processing (in real implementation, this would call an OCR API)
    async simulateOCR(file) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Randomly select 1-4 items from the mock pool
                const itemCount = Math.floor(Math.random() * 4) + 1;
                const mockItems = [];
                
                for (let i = 0; i < itemCount; i++) {
                    const randomItem = CONFIG.SIMULATION.MOCK_ITEMS_POOL[
                        Math.floor(Math.random() * CONFIG.SIMULATION.MOCK_ITEMS_POOL.length)
                    ];
                    mockItems.push({ ...randomItem });
                }

                const bill = {
                    filename: file.name,
                    filesize: file.size,
                    items: mockItems
                };

                dataManager.addScannedBill(bill);
                this.render();
                resolve();
            }, CONFIG.SIMULATION.OCR_DELAY);
        });
    }

    // Render scanned bills
    render() {
        const container = document.getElementById('scannedItems');
        if (!container) return;

        const bills = dataManager.getAllScannedBills();

        if (bills.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <h3>Recently Scanned</h3>
            ${bills.map(bill => this.createBillHTML(bill)).join('')}
        `;
    }

    // Create HTML for single bill
    createBillHTML(bill) {
        const date = new Date(bill.date);
        return `
            <div class="scanned-item fade-in">
                <div class="scanned-item-info">
                    <strong>📄 ${bill.filename}</strong>
                    <small>${formatDate(date)} • ${bill.items.length} item(s) detected</small>
                </div>
                <div class="scanned-item-actions">
                    <button class="btn-primary" style="padding: 8px 15px;" onclick="scannerManager.addBillToInventory(${bill.id})">
                        ➕ Add All
                    </button>
                    <button class="btn-delete" onclick="scannerManager.deleteBill(${bill.id})">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    // Add all items from bill to inventory
    addBillToInventory(billId) {
        const bill = dataManager.getScannedBill(billId);
        if (!bill) return;

        let addedCount = 0;
        bill.items.forEach(item => {
            // Check if item already exists
            const existing = dataManager.inventory.find(
                inv => inv.name.toLowerCase() === item.name.toLowerCase() &&
                       inv.category === item.category
            );

            if (existing) {
                // Update quantity
                dataManager.updateQuantity(existing.id, item.quantity);
            } else {
                // Add new item
                dataManager.addItem(item);
            }
            addedCount++;
        });

        inventoryManager.render();
        uiManager.updateStats();
        predictionsManager.render();
        
        uiManager.showNotification(
            `✓ Added ${addedCount} item(s) from ${bill.filename}`,
            'success'
        );
    }

    // Delete scanned bill
    deleteBill(billId) {
        const bill = dataManager.getScannedBill(billId);
        if (!bill) return;

        if (confirm(`Delete "${bill.filename}"?`)) {
            dataManager.deleteScannedBill(billId);
            this.render();
            uiManager.showNotification('✓ Bill deleted', 'success');
        }
    }

    // Clear all scanned bills
    clearAll() {
        if (confirm('Clear all scanned bills?')) {
            dataManager.scannedBills = [];
            dataManager.saveToStorage();
            this.render();
            uiManager.showNotification('✓ All bills cleared', 'success');
        }
    }
}

// Create global instance
const scannerManager = new ScannerManager();

// Global state
let currentTab = ‘snap’;
let detectedCount = 28;
let billItems = [];

// Tab switching
function switchTab(tab) {
currentTab = tab;

```
// Update tab buttons
document.getElementById('snapTab').classList.toggle('text-primary', tab === 'snap');
document.getElementById('snapTab').classList.toggle('border-primary', tab === 'snap');
document.getElementById('snapTab').classList.toggle('text-gray-500', tab !== 'snap');
document.getElementById('snapTab').classList.toggle('border-transparent', tab !== 'snap');

document.getElementById('billTab').classList.toggle('text-secondary', tab === 'bill');
document.getElementById('billTab').classList.toggle('border-secondary', tab === 'bill');
document.getElementById('billTab').classList.toggle('text-gray-500', tab !== 'bill');
document.getElementById('billTab').classList.toggle('border-transparent', tab !== 'bill');

// Update content
document.getElementById('snapContent').classList.toggle('hidden', tab !== 'snap');
document.getElementById('billContent').classList.toggle('hidden', tab !== 'bill');
```

}

// Snap-to-Stock: Handle file upload
function handleSnapUpload(event) {
const file = event.target.files[0];
if (!file) return;

```
const reader = new FileReader();
reader.onload = function(e) {
    // Show preview
    document.getElementById('snapImage').src = e.target.result;
    document.getElementById('snapPreview').classList.remove('hidden');
    
    // Show loading
    document.getElementById('snapLoading').classList.remove('hidden');
    document.getElementById('snapResults').classList.add('hidden');
    
    // Simulate AI processing
    setTimeout(() => {
        document.getElementById('snapLoading').classList.add('hidden');
        document.getElementById('snapResults').classList.remove('hidden');
        
        // Random count and confidence
        detectedCount = Math.floor(Math.random() * 25) + 15; // 15-40
        document.getElementById('detectedCount').textContent = detectedCount;
        
        const stars = ['⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
        document.getElementById('confidence').textContent = stars[Math.floor(Math.random() * stars.length)];
        
        updateSnapSummary();
    }, 2000);
};
reader.readAsDataURL(file);
```

}

// Adjust count
function adjustCount(delta) {
detectedCount = Math.max(1, detectedCount + delta);
document.getElementById(‘detectedCount’).textContent = detectedCount;
updateSnapSummary();
}

// Update snap summary
function updateSnapSummary() {
const product = document.getElementById(‘productSelect’).value;
const unit = document.getElementById(‘unitSelect’).value;

```
if (product) {
    let summary = `Adding: ${detectedCount} ${unit} of ${product}`;
    
    // Smart conversion hints
    if (unit === 'Litres' && product.includes('Milk')) {
        summary += ` (${detectedCount} pouches = ${detectedCount} litres)`;
    } else if (unit === 'Litres' && product.includes('Oil')) {
        summary += ` (${detectedCount} bottles = ${detectedCount} litres)`;
    } else if (unit === 'Kilograms' && product.includes('Salt')) {
        summary += ` (${detectedCount} packs = ${detectedCount} kg)`;
    }
    
    document.getElementById('snapSummary').textContent = `✅ ${summary}`;
} else {
    document.getElementById('snapSummary').textContent = '💡 Select product and unit to see summary';
}
```

}

// Listen to dropdown changes
document.addEventListener(‘DOMContentLoaded’, function() {
document.getElementById(‘productSelect’)?.addEventListener(‘change’, updateSnapSummary);
document.getElementById(‘unitSelect’)?.addEventListener(‘change’, updateSnapSummary);
});

// Add snap to inventory
function addSnapToInventory() {
const product = document.getElementById(‘productSelect’).value;
const unit = document.getElementById(‘unitSelect’).value;

```
if (!product) {
    alert('Please select a product!');
    return;
}

// Add to table
const tbody = document.getElementById('inventoryTableBody');
const newRow = tbody.insertRow(0);
newRow.className = 'hover:bg-gray-50 highlight';

newRow.innerHTML = `
    <td class="px-4 py-3 text-sm">${product}</td>
    <td class="px-4 py-3 text-sm text-center font-semibold">${detectedCount}</td>
    <td class="px-4 py-3 text-sm text-center">${unit}</td>
    <td class="px-4 py-3 text-sm text-center text-gray-500">Just now</td>
    <td class="px-4 py-3 text-sm text-center">
        <button class="text-blue-600 hover:text-blue-800 mr-2">✏️</button>
        <button class="text-red-600 hover:text-red-800">🗑️</button>
    </td>
`;

// Update stats
const totalStock = parseInt(document.getElementById('totalStock').textContent);
document.getElementById('totalStock').textContent = totalStock + detectedCount;

const todayUpdates = parseInt(document.getElementById('todayUpdates').textContent);
document.getElementById('todayUpdates').textContent = todayUpdates + 1;

// Show success
showToast(`✅ Added ${detectedCount} ${unit} of ${product} to inventory`);

// Reset
resetSnapForm();

// Scroll to table
setTimeout(() => {
    newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
}, 500);
```

}

function resetSnapForm() {
document.getElementById(‘snapFileInput’).value = ‘’;
document.getElementById(‘snapPreview’).classList.add(‘hidden’);
document.getElementById(‘snapResults’).classList.add(‘hidden’);
document.getElementById(‘productSelect’).value = ‘’;
document.getElementById(‘unitSelect’).value = ‘Pieces’;
}

// Bill Scanner: Handle file upload
function handleBillUpload(event) {
const file = event.target.files[0];
if (!file) return;

```
const reader = new FileReader();
reader.onload = function(e) {
    // Show preview
    document.getElementById('billImage').src = e.target.result;
    document.getElementById('billPreview').classList.remove('hidden');
    
    // Show loading
    document.getElementById('billLoading').classList.remove('hidden');
    document.getElementById('billResults').classList.add('hidden');
    
    // Simulate OCR processing
    setTimeout(() => {
        document.getElementById('billLoading').classList.add('hidden');
        document.getElementById('billResults').classList.remove('hidden');
        
        generateBillItems();
    }, 2500);
};
reader.readAsDataURL(file);
```

}

// Generate random bill items
function generateBillItems() {
const products = [
{ name: ‘Parle-G Biscuits (100g)’, qty: 50, unit: ‘Packets’, price: 5 },
{ name: ‘Coca Cola Bottle (250ml)’, qty: 24, unit: ‘Bottles’, price: 30 },
{ name: ‘Amul Milk Pouch (500ml)’, qty: 20, unit: ‘Litres’, price: 50 },
{ name: ‘Tata Salt (1kg)’, qty: 10, unit: ‘Kg’, price: 20 },
{ name: ‘Fortune Oil (1L)’, qty: 15, unit: ‘Litres’, price: 150 },
{ name: ‘Britannia Bread’, qty: 12, unit: ‘Pieces’, price: 35 },
{ name: ‘Lays Chips (50g)’, qty: 30, unit: ‘Packets’, price: 10 }
];

```
// Pick 3-5 random items
const numItems = Math.floor(Math.random() * 3) + 3; // 3-5 items
billItems = [];

for (let i = 0; i < numItems; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    billItems.push({
        name: randomProduct.name,
        qty: Math.floor(Math.random() * 30) + 10, // 10-40
        unit: randomProduct.unit,
        price: randomProduct.price
    });
}

renderBillTable();
```

}

// Render bill table
function renderBillTable() {
const tbody = document.getElementById(‘billTableBody’);
tbody.innerHTML = ‘’;

```
let total = 0;

billItems.forEach((item, index) => {
    const itemTotal = item.qty * item.price;
    total += itemTotal;
    
    const row = tbody.insertRow();
    row.innerHTML = `
        <td class="px-3 py-2">${item.name}</td>
        <td class="px-3 py-2 text-center font-semibold">${item.qty}</td>
        <td class="px-3 py-2 text-center">${item.unit}</td>
        <td class="px-3 py-2 text-right">₹${itemTotal.toLocaleString()}</td>
    `;
});

document.getElementById('billTotal').textContent = `₹${total.toLocaleString()}`;
```

}

// Add bill to inventory
function addBillToInventory() {
if (billItems.length === 0) {
alert(‘No items to add!’);
return;
}

```
const tbody = document.getElementById('inventoryTableBody');
let totalItems = 0;

billItems.forEach(item => {
    const newRow = tbody.insertRow(0);
    newRow.className = 'hover:bg-gray-50 highlight';
    
    newRow.innerHTML = `
        <td class="px-4 py-3 text-sm">${item.name}</td>
        <td class="px-4 py-3 text-sm text-center font-semibold">${item.qty}</td>
        <td class="px-4 py-3 text-sm text-center">${item.unit}</td>
        <td class="px-4 py-3 text-sm text-center text-gray-500">Just now</td>
        <td class="px-4 py-3 text-sm text-center">
            <button class="text-blue-600 hover:text-blue-800 mr-2">✏️</button>
            <button class="text-red-600 hover:text-red-800">🗑️</button>
        </td>
    `;
    
    totalItems += item.qty;
});

// Update stats
const totalStock = parseInt(document.getElementById('totalStock').textContent);
document.getElementById('totalStock').textContent = totalStock + totalItems;

const todayUpdates = parseInt(document.getElementById('todayUpdates').textContent);
document.getElementById('todayUpdates').textContent = todayUpdates + billItems.length;

// Show success
const total = document.getElementById('billTotal').textContent;
showToast(`✅ Added ${billItems.length} products (${totalItems} items) worth ${total} to inventory`);

// Reset
resetBillForm();

// Scroll to table
setTimeout(() => {
    document.getElementById('inventoryTableBody').rows[0].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}, 500);
```

}

function resetBillForm() {
document.getElementById(‘billFileInput’).value = ‘’;
document.getElementById(‘billPreview’).classList.add(‘hidden’);
document.getElementById(‘billResults’).classList.add(‘hidden’);
billItems = [];
}

// Toast notification
function showToast(message) {
const toast = document.getElementById(‘successToast’);
const toastMessage = document.getElementById(‘toastMessage’);

```
toastMessage.textContent = message;
toast.classList.remove('hidden');

setTimeout(() => {
    toast.classList.add('hidden');
}, 4000);
```

}

// Initialize
console.log(‘Hisaab AI loaded successfully!’);
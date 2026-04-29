let cart = [];
let products = [];

// Load products
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(productsToShow) {
    const tbody = document.getElementById('productsList');
    if (!tbody) return;
    
    tbody.innerHTML = productsToShow.map(product => `
        <tr>
            <td>${product.product_code}</td>
            <td>${product.name}</td>
            <td>${product.category || '-'}</td>
            <td class="${product.quantity <= product.min_stock ? 'low-stock' : ''}">${product.quantity}</td>
            <td>₹${product.price}</td>
            <td>
                <button class="btn-small" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn-small btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function searchProducts() {
    const searchTerm = document.getElementById('productSearch')?.value.toLowerCase();
    if (!searchTerm) {
        displayProducts(products);
        return;
    }
    
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.product_code.toLowerCase().includes(searchTerm)
    );
    displayProducts(filtered);
}

// Product CRUD operations
function showAddProductModal() {
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').style.display = 'block';
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('prodCode').value = product.product_code;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodCategory').value = product.category || '';
    document.getElementById('prodQuantity').value = product.quantity;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodCost').value = product.cost || '';
    document.getElementById('prodSupplier').value = product.supplier || '';
    document.getElementById('prodMinStock').value = product.min_stock;
    document.getElementById('productModal').style.display = 'block';
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (data.success) {
            alert('Product deleted successfully');
            loadProducts();
        } else {
            alert('Error deleting product');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Product form submission
if (document.getElementById('productForm')) {
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productId = document.getElementById('productId').value;
        const productData = {
            product_code: document.getElementById('prodCode').value,
            name: document.getElementById('prodName').value,
            category: document.getElementById('prodCategory').value,
            quantity: parseInt(document.getElementById('prodQuantity').value),
            price: parseFloat(document.getElementById('prodPrice').value),
            cost: parseFloat(document.getElementById('prodCost').value) || null,
            supplier: document.getElementById('prodSupplier').value,
            min_stock: parseInt(document.getElementById('prodMinStock').value)
        };
        
        const url = productId ? `/api/products/${productId}` : '/api/products';
        const method = productId ? 'PUT' : 'POST';
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(productId ? 'Product updated successfully' : 'Product added successfully');
                document.getElementById('productModal').style.display = 'none';
                loadProducts();
            } else {
                alert('Error saving product');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error saving product');
        }
    });
}

// Sales functionality
function searchProductsForSale() {
    const searchTerm = document.getElementById('productSearchSale')?.value.toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    
    if (!searchTerm) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.product_code.toLowerCase().includes(searchTerm)
    );
    
    if (filtered.length > 0) {
        resultsDiv.innerHTML = filtered.map(p => `
            <div class="search-result-item" onclick="addToCart(${p.id})">
                <strong>${p.product_code}</strong> - ${p.name} (₹${p.price}) | Stock: ${p.quantity}
            </div>
        `).join('');
        resultsDiv.style.display = 'block';
    } else {
        resultsDiv.style.display = 'none';
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.product_id === productId);
    
    if (existingItem) {
        if (existingItem.quantity + 1 > product.quantity) {
            alert('Not enough stock available');
            return;
        }
        existingItem.quantity++;
        existingItem.total = existingItem.quantity * existingItem.price;
    } else {
        if (product.quantity < 1) {
            alert('Product out of stock');
            return;
        }
        cart.push({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            total: product.price,
            stock: product.quantity
        });
    }
    
    updateCartDisplay();
    document.getElementById('productSearchSale').value = '';
    document.getElementById('searchResults').style.display = 'none';
}

function updateCartDisplay() {
    const tbody = document.getElementById('cartItems');
    if (!tbody) return;
    
    tbody.innerHTML = cart.map((item, index) => `
        <tr>
            <td>${item.name}</td>
            <td>₹${item.price}</td>
            <td>
                <button onclick="updateQuantity(${index}, -1)">-</button>
                ${item.quantity}
                <button onclick="updateQuantity(${index}, 1)">+</button>
            </td>
            <td>₹${item.total}</td>
            <td><button onclick="removeFromCart(${index})">×</button></td>
        </tr>
    `).join('');
    
    calculateTotals();
}

function updateQuantity(index, change) {
    const item = cart[index];
    const newQuantity = item.quantity + change;
    
    if (newQuantity < 1) {
        removeFromCart(index);
        return;
    }
    
    if (newQuantity > item.stock) {
        alert('Not enough stock available');
        return;
    }
    
    item.quantity = newQuantity;
    item.total = item.quantity * item.price;
    updateCartDisplay();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discount = parseFloat(document.getElementById('discount')?.value) || 0;
    const total = subtotal - discount;
    
    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('totalAmount').textContent = `₹${total}`;
}

async function completeSale() {
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discount = parseFloat(document.getElementById('discount')?.value) || 0;
    const total = subtotal - discount;
    const paidAmount = parseFloat(document.getElementById('paidAmount')?.value) || 0;
    
    if (paidAmount < total) {
        alert('Paid amount is less than total amount');
        return;
    }
    
    const saleData = {
        customer_name: document.getElementById('customerName')?.value || 'Walk-in Customer',
        items: cart,
        total_amount: total,
        discount: discount,
        paid_amount: paidAmount,
        payment_method: document.getElementById('paymentMethod')?.value
    };
    
    try {
        const response = await fetch('/api/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saleData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`Sale completed! Invoice: ${data.invoice_no}\nChange: ₹${paidAmount - total}`);
            cart = [];
            updateCartDisplay();
            loadProducts();
            document.getElementById('customerName').value = '';
            document.getElementById('discount').value = 0;
            document.getElementById('paidAmount').value = 0;
        } else {
            alert('Error completing sale');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error completing sale');
    }
}

// Modal close functionality
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = function() {
        document.getElementById('productModal').style.display = 'none';
    }
});

window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Search for sale
if (document.getElementById('productSearchSale')) {
    document.getElementById('productSearchSale').addEventListener('input', searchProductsForSale);
}

// Recalculate total when discount changes
if (document.getElementById('discount')) {
    document.getElementById('discount').addEventListener('input', calculateTotals);
}
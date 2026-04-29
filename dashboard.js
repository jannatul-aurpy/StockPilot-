let currentUser = null;

// Load dashboard data
async function loadDashboard() {
    try {
        // Check session
        const sessionRes = await fetch('/api/check-session');
        const sessionData = await sessionRes.json();
        
        if (!sessionData.loggedIn) {
            window.location.href = '/login.html';
            return;
        }
        
        currentUser = sessionData.user;
        
        // Load stats
        const statsRes = await fetch('/api/dashboard-stats');
        const stats = await statsRes.json();
        
        document.getElementById('totalProducts').textContent = stats.total_products?.count || 0;
        document.getElementById('lowStock').textContent = stats.low_stock?.count || 0;
        document.getElementById('todaySales').textContent = '₹' + (stats.total_sales?.total || 0);
        document.getElementById('inventoryValue').textContent = '₹' + (stats.total_value?.value || 0);
        
        // Load recent sales
        const salesRes = await fetch('/api/sales');
        const sales = await salesRes.json();
        displayRecentSales(sales.slice(0, 10));
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function displayRecentSales(sales) {
    const container = document.getElementById('recentSalesList');
    if (!container) return;
    
    if (sales.length === 0) {
        container.innerHTML = '<p>No sales yet</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr><th>Invoice No</th><th>Date</th><th>Customer</th><th>Total</th><th>Payment</th></tr>
            </thead>
            <tbody>
                ${sales.map(sale => `
                    <tr>
                        <td>${sale.invoice_no}</td>
                        <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
                        <td>${sale.customer_name || 'Walk-in'}</td>
                        <td>₹${sale.total_amount}</td>
                        <td>${sale.payment_method}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Load sales history
async function loadSalesHistory() {
    try {
        const response = await fetch('/api/sales');
        const sales = await response.json();
        
        const tbody = document.getElementById('salesHistoryList');
        if (tbody) {
            tbody.innerHTML = sales.map(sale => `
                <tr>
                    <td>${sale.invoice_no}</td>
                    <td>${new Date(sale.sale_date).toLocaleString()}</td>
                    <td>${sale.customer_name || 'Walk-in'}</td>
                    <td>₹${sale.total_amount}</td>
                    <td>${sale.payment_method}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading sales:', error);
    }
}

// Tab switching
document.querySelectorAll('.sidebar-menu li').forEach(item => {
    if (item.classList.contains('logout-btn')) {
        item.addEventListener('click', async () => {
            await fetch('/api/logout');
            window.location.href = '/login.html';
        });
    } else {
        item.addEventListener('click', () => {
            const tab = item.getAttribute('data-tab');
            
            // Update active state
            document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
            item.classList.add('active');
            
            // Show appropriate tab
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(`${tab}-tab`).classList.add('active');
            
            // Load data based on tab
            if (tab === 'dashboard') {
                loadDashboard();
            } else if (tab === 'products') {
                loadProducts();
            } else if (tab === 'sales-history') {
                loadSalesHistory();
            }
        });
    }
});

// Initialize
if (document.getElementById('dashboard-tab')) {
    loadDashboard();
    loadProducts();
}
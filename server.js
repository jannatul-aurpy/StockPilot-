const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: 'stockpilot_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'stockpilot'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
    
    // Create tables if not exists
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            role VARCHAR(20) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    const createProductsTable = `
        CREATE TABLE IF NOT EXISTS products (
            id INT PRIMARY KEY AUTO_INCREMENT,
            product_code VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(200) NOT NULL,
            category VARCHAR(100),
            quantity INT DEFAULT 0,
            price DECIMAL(10,2) NOT NULL,
            cost DECIMAL(10,2),
            supplier VARCHAR(200),
            min_stock INT DEFAULT 5,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    const createSalesTable = `
        CREATE TABLE IF NOT EXISTS sales (
            id INT PRIMARY KEY AUTO_INCREMENT,
            invoice_no VARCHAR(50) UNIQUE NOT NULL,
            user_id INT,
            customer_name VARCHAR(200),
            total_amount DECIMAL(10,2),
            discount DECIMAL(10,2) DEFAULT 0,
            paid_amount DECIMAL(10,2),
            payment_method VARCHAR(50),
            sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `;
    
    const createSaleItemsTable = `
        CREATE TABLE IF NOT EXISTS sale_items (
            id INT PRIMARY KEY AUTO_INCREMENT,
            sale_id INT,
            product_id INT,
            quantity INT,
            price DECIMAL(10,2),
            total DECIMAL(10,2),
            FOREIGN KEY (sale_id) REFERENCES sales(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `;
    
    db.query(createUsersTable, (err) => {
        if (err) console.error('Users table error:', err);
        else console.log('Users table ready');
    });
    
    db.query(createProductsTable, (err) => {
        if (err) console.error('Products table error:', err);
        else console.log('Products table ready');
    });
    
    db.query(createSalesTable, (err) => {
        if (err) console.error('Sales table error:', err);
        else console.log('Sales table ready');
    });
    
    db.query(createSaleItemsTable, (err) => {
        if (err) console.error('Sale items table error:', err);
        else console.log('Sale items table ready');
    });
});

// ============= AUTHENTICATION ROUTES =============

// Register endpoint
app.post('/api/register', async (req, res) => {
    const { username, email, password, full_name } = req.body;
    
    // Check if user exists
    db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, results) => {
        if (err) {
            return res.json({ success: false, message: 'Database error' });
        }
        
        if (results.length > 0) {
            return res.json({ success: false, message: 'Username or email already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        db.query('INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, full_name],
            (err, result) => {
                if (err) {
                    return res.json({ success: false, message: 'Registration failed' });
                }
                res.json({ success: true, message: 'Registration successful! Please login.' });
            }
        );
    });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }
        
        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }
        
        req.session.user = {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            role: user.role
        };
        
        res.json({ success: true, message: 'Login successful', redirect: '/dashboard.html' });
    });
});

// Check session
app.get('/api/check-session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// Logout
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// ============= PRODUCT ROUTES =============

// Get all products
app.get('/api/products', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    db.query('SELECT * FROM products ORDER BY id DESC', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Add product
app.post('/api/products', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { product_code, name, category, quantity, price, cost, supplier, min_stock } = req.body;
    
    db.query('INSERT INTO products (product_code, name, category, quantity, price, cost, supplier, min_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [product_code, name, category, quantity, price, cost, supplier, min_stock],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, id: result.insertId });
        }
    );
});

// Update product
app.put('/api/products/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { product_code, name, category, quantity, price, cost, supplier, min_stock } = req.body;
    
    db.query('UPDATE products SET product_code=?, name=?, category=?, quantity=?, price=?, cost=?, supplier=?, min_stock=? WHERE id=?',
        [product_code, name, category, quantity, price, cost, supplier, min_stock, req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        }
    );
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    db.query('DELETE FROM products WHERE id=?', [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// ============= SALE ROUTES =============

// Create sale
app.post('/api/sales', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { customer_name, items, total_amount, discount, paid_amount, payment_method } = req.body;
    const invoice_no = 'INV-' + Date.now();
    
    // Start transaction
    db.beginTransaction((err) => {
        if (err) throw err;
        
        // Insert sale
        db.query('INSERT INTO sales (invoice_no, user_id, customer_name, total_amount, discount, paid_amount, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [invoice_no, req.session.user.id, customer_name, total_amount, discount, paid_amount, payment_method],
            (err, result) => {
                if (err) {
                    return db.rollback(() => { res.status(500).json({ error: err.message }); });
                }
                
                const saleId = result.insertId;
                let completed = 0;
                
                // Insert sale items and update stock
                items.forEach(item => {
                    db.query('INSERT INTO sale_items (sale_id, product_id, quantity, price, total) VALUES (?, ?, ?, ?, ?)',
                        [saleId, item.product_id, item.quantity, item.price, item.total],
                        (err) => {
                            if (err) {
                                return db.rollback(() => { res.status(500).json({ error: err.message }); });
                            }
                            
                            // Update product stock
                            db.query('UPDATE products SET quantity = quantity - ? WHERE id = ?',
                                [item.quantity, item.product_id],
                                (err) => {
                                    if (err) {
                                        return db.rollback(() => { res.status(500).json({ error: err.message }); });
                                    }
                                    
                                    completed++;
                                    if (completed === items.length) {
                                        db.commit((err) => {
                                            if (err) {
                                                return db.rollback(() => { res.status(500).json({ error: err.message }); });
                                            }
                                            res.json({ success: true, invoice_no: invoice_no });
                                        });
                                    }
                                }
                            );
                        }
                    );
                });
            }
        );
    });
});

// Get sales
app.get('/api/sales', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    db.query('SELECT s.*, u.username FROM sales s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.sale_date DESC LIMIT 100',
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        }
    );
});

// Get dashboard stats
app.get('/api/dashboard-stats', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const queries = {
        total_products: 'SELECT COUNT(*) as count FROM products',
        low_stock: 'SELECT COUNT(*) as count FROM products WHERE quantity <= min_stock',
        total_sales: 'SELECT COUNT(*) as count, SUM(total_amount) as total FROM sales WHERE DATE(sale_date) = CURDATE()',
        total_value: 'SELECT SUM(quantity * price) as value FROM products'
    };
    
    let results = {};
    let completed = 0;
    
    for (let key in queries) {
        db.query(queries[key], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            results[key] = result[0];
            completed++;
            
            if (completed === Object.keys(queries).length) {
                res.json(results);
            }
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`StockPilot server running on http://localhost:${PORT}`);
});
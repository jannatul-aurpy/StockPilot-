-- Create Database
CREATE DATABASE IF NOT EXISTS stockpilot;
USE stockpilot;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
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
);

-- Sales Table
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
);

-- Sale Items Table
CREATE TABLE IF NOT EXISTS sale_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10,2),
    total DECIMAL(10,2),
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert Sample Data
INSERT INTO users (username, email, password, full_name, role) VALUES 
('admin', 'admin@stockpilot.com', '$2a$10$YourHashedPasswordHere', 'Administrator', 'admin');

-- Insert Sample Products
INSERT INTO products (product_code, name, category, quantity, price, cost, supplier, min_stock) VALUES
('PRD001', 'Laptop Dell XPS', 'Electronics', 15, 85000.00, 75000.00, 'Dell India', 5),
('PRD002', 'Wireless Mouse', 'Accessories', 50, 1200.00, 800.00, 'Logitech', 10),
('PRD003', 'Mechanical Keyboard', 'Accessories', 25, 3500.00, 2500.00, 'Corsair', 8),
('PRD004', 'Monitor 24"', 'Electronics', 12, 15000.00, 12000.00, 'Samsung', 5),
('PRD005', 'USB Cable', 'Accessories', 100, 250.00, 150.00, 'Local Supplier', 20);

-- Note: For password 'admin123' use this hash or create first user through registration
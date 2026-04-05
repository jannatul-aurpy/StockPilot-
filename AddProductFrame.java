package frames;

import dao.ProductDAO;
import models.Product;
import javax.swing.*;
import java.awt.*;

public class AddProductFrame extends JFrame {
    private int sellerId;
    private SellerDashboardFrame parentFrame;
    private JTextField nameField, priceField, stockField;
    private ProductDAO productDAO;
    
    public AddProductFrame(int sellerId, SellerDashboardFrame parentFrame) {
        this.sellerId = sellerId;
        this.parentFrame = parentFrame;
        productDAO = new ProductDAO();
        initComponents();
        setTitle("Add New Product");
        setSize(400, 300);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
    }
    
    private void initComponents() {
        setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 10, 10, 10);
        
        // Title
        JLabel titleLabel = new JLabel("Add New Product", JLabel.CENTER);
        titleLabel.setFont(new Font("Arial", Font.BOLD, 16));
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridwidth = 2;
        add(titleLabel, gbc);
        
        // Product Name
        gbc.gridwidth = 1;
        gbc.gridy = 1;
        gbc.gridx = 0;
        add(new JLabel("Product Name:"), gbc);
        nameField = new JTextField(15);
        gbc.gridx = 1;
        add(nameField, gbc);
        
        // Price
        gbc.gridy = 2;
        gbc.gridx = 0;
        add(new JLabel("Price:"), gbc);
        priceField = new JTextField(15);
        gbc.gridx = 1;
        add(priceField, gbc);
        
        // Stock
        gbc.gridy = 3;
        gbc.gridx = 0;
        add(new JLabel("Stock Quantity:"), gbc);
        stockField = new JTextField(15);
        gbc.gridx = 1;
        add(stockField, gbc);
        
        // Buttons
        JPanel buttonPanel = new JPanel();
        JButton saveBtn = new JButton("Save");
        JButton cancelBtn = new JButton("Cancel");
        
        saveBtn.addActionListener(e -> saveProduct());
        cancelBtn.addActionListener(e -> dispose());
        
        buttonPanel.add(saveBtn);
        buttonPanel.add(cancelBtn);
        
        gbc.gridy = 4;
        gbc.gridx = 0;
        gbc.gridwidth = 2;
        add(buttonPanel, gbc);
        
        pack();
    }
    
    private void saveProduct() {
        String name = nameField.getText();
        String priceStr = priceField.getText();
        String stockStr = stockField.getText();
        
        if (name.isEmpty() || priceStr.isEmpty() || stockStr.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Please fill all fields!");
            return;
        }
        
        try {
            double price = Double.parseDouble(priceStr);
            int stock = Integer.parseInt(stockStr);
            
            Product product = new Product();
            product.setName(name);
            product.setPrice(price);
            product.setStock(stock);
            product.setSellerId(sellerId);
            
            if (productDAO.addProduct(product)) {
                JOptionPane.showMessageDialog(this, "Product added successfully!");
                parentFrame.loadProducts();
                dispose();
            } else {
                JOptionPane.showMessageDialog(this, "Failed to add product!");
            }
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Enter valid price and stock!");
        }
    }
}
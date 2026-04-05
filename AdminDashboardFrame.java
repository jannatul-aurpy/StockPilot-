package frames;

import dao.ProductDAO;
import models.Product;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class AdminDashboardFrame extends JFrame {
    private JTable productTable;
    private DefaultTableModel tableModel;
    private ProductDAO productDAO;
    
    public AdminDashboardFrame() {
        productDAO = new ProductDAO();
        initComponents();
        loadProducts();
        setTitle("Admin Dashboard");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
    }
    
    private void initComponents() {
        setLayout(new BorderLayout());
        
        // Title
        JLabel titleLabel = new JLabel("Admin Dashboard - All Products", JLabel.CENTER);
        titleLabel.setFont(new Font("Arial", Font.BOLD, 18));
        add(titleLabel, BorderLayout.NORTH);
        
        // Table
        String[] columns = {"ID", "Product Name", "Price", "Stock", "Seller ID"};
        tableModel = new DefaultTableModel(columns, 0);
        productTable = new JTable(tableModel);
        add(new JScrollPane(productTable), BorderLayout.CENTER);
        
        // Buttons
        JPanel buttonPanel = new JPanel();
        JButton refreshBtn = new JButton("Refresh");
        JButton deleteBtn = new JButton("Delete Product");
        JButton logoutBtn = new JButton("Logout");
        
        refreshBtn.addActionListener(e -> loadProducts());
        deleteBtn.addActionListener(e -> deleteProduct());
        logoutBtn.addActionListener(e -> logout());
        
        buttonPanel.add(refreshBtn);
        buttonPanel.add(deleteBtn);
        buttonPanel.add(logoutBtn);
        add(buttonPanel, BorderLayout.SOUTH);
    }
    
    private void loadProducts() {
        tableModel.setRowCount(0);
        List<Product> products = productDAO.getAllProducts();
        for (Product p : products) {
            tableModel.addRow(new Object[]{
                p.getId(), p.getName(), p.getPrice(), p.getStock(), p.getSellerId()
            });
        }
    }
    
    private void deleteProduct() {
        int selectedRow = productTable.getSelectedRow();
        if (selectedRow >= 0) {
            int productId = (int) tableModel.getValueAt(selectedRow, 0);
            int confirm = JOptionPane.showConfirmDialog(this, "Delete this product?", "Confirm", JOptionPane.YES_NO_OPTION);
            if (confirm == JOptionPane.YES_OPTION) {
                if (productDAO.deleteProduct(productId)) {
                    JOptionPane.showMessageDialog(this, "Product deleted!");
                    loadProducts();
                } else {
                    JOptionPane.showMessageDialog(this, "Delete failed!");
                }
            }
        } else {
            JOptionPane.showMessageDialog(this, "Select a product to delete!");
        }
    }
    
    private void logout() {
        int confirm = JOptionPane.showConfirmDialog(this, "Logout?", "Confirm", JOptionPane.YES_NO_OPTION);
        if (confirm == JOptionPane.YES_OPTION) {
            new LoginFrame().setVisible(true);
            dispose();
        }
    }
}
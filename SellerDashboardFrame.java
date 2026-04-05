package frames;

import dao.ProductDAO;
import dao.SaleDAO;
import models.Product;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class SellerDashboardFrame extends JFrame {
    private int sellerId;
    private String sellerName;
    private JTable productTable;
    private DefaultTableModel tableModel;
    private ProductDAO productDAO;
    private SaleDAO saleDAO;
    private JLabel totalSalesLabel;
    
    public SellerDashboardFrame(int sellerId, String sellerName) {
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        productDAO = new ProductDAO();
        saleDAO = new SaleDAO();
        initComponents();
        loadProducts();
        updateTotalSales();
        setTitle("Seller Dashboard - " + sellerName);
        setSize(900, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
    }
    
    private void initComponents() {
        setLayout(new BorderLayout());
        
        // Top Panel
        JPanel topPanel = new JPanel(new GridLayout(1, 2));
        JLabel welcomeLabel = new JLabel("Welcome, " + sellerName, JLabel.LEFT);
        totalSalesLabel = new JLabel("Total Sales: $0.00", JLabel.RIGHT);
        totalSalesLabel.setFont(new Font("Arial", Font.BOLD, 14));
        topPanel.add(welcomeLabel);
        topPanel.add(totalSalesLabel);
        add(topPanel, BorderLayout.NORTH);
        
        // Table
        String[] columns = {"ID", "Product Name", "Price", "Stock"};
        tableModel = new DefaultTableModel(columns, 0);
        productTable = new JTable(tableModel);
        add(new JScrollPane(productTable), BorderLayout.CENTER);
        
        // Buttons
        JPanel buttonPanel = new JPanel();
        JButton addProductBtn = new JButton("Add Product");
        JButton sellBtn = new JButton("Sell Product");
        JButton refreshBtn = new JButton("Refresh");
        JButton logoutBtn = new JButton("Logout");
        
        addProductBtn.addActionListener(e -> openAddProductFrame());
        sellBtn.addActionListener(e -> sellProduct());
        refreshBtn.addActionListener(e -> {
            loadProducts();
            updateTotalSales();
        });
        logoutBtn.addActionListener(e -> logout());
        
        buttonPanel.add(addProductBtn);
        buttonPanel.add(sellBtn);
        buttonPanel.add(refreshBtn);
        buttonPanel.add(logoutBtn);
        add(buttonPanel, BorderLayout.SOUTH);
    }
    
    public void loadProducts() {
        tableModel.setRowCount(0);
        List<Product> products = productDAO.getProductsBySeller(sellerId);
        for (Product p : products) {
            tableModel.addRow(new Object[]{
                p.getId(), p.getName(), p.getPrice(), p.getStock()
            });
        }
    }
    
    private void openAddProductFrame() {
        AddProductFrame addFrame = new AddProductFrame(sellerId, this);
        addFrame.setVisible(true);
    }
    
    private void sellProduct() {
        int selectedRow = productTable.getSelectedRow();
        if (selectedRow >= 0) {
            int productId = (int) tableModel.getValueAt(selectedRow, 0);
            String productName = (String) tableModel.getValueAt(selectedRow, 1);
            double price = (double) tableModel.getValueAt(selectedRow, 2);
            int currentStock = (int) tableModel.getValueAt(selectedRow, 3);
            
            String quantityStr = JOptionPane.showInputDialog(this, 
                "Enter quantity to sell for " + productName + "\nStock available: " + currentStock);
            
            if (quantityStr != null) {
                try {
                    int quantity = Integer.parseInt(quantityStr);
                    if (quantity > 0 && quantity <= currentStock) {
                        double totalPrice = price * quantity;
                        int confirm = JOptionPane.showConfirmDialog(this, 
                            "Product: " + productName + "\nQuantity: " + quantity + 
                            "\nTotal: $" + totalPrice + "\nConfirm sale?", 
                            "Confirm Sale", JOptionPane.YES_NO_OPTION);
                        
                        if (confirm == JOptionPane.YES_OPTION) {
                            if (saleDAO.recordSale(productId, quantity, totalPrice, sellerId)) {
                                int newStock = currentStock - quantity;
                                productDAO.updateStock(productId, newStock);
                                JOptionPane.showMessageDialog(this, "Sale completed!\nTotal: $" + totalPrice);
                                loadProducts();
                                updateTotalSales();
                            } else {
                                JOptionPane.showMessageDialog(this, "Sale failed!");
                            }
                        }
                    } else {
                        JOptionPane.showMessageDialog(this, "Invalid quantity!");
                    }
                } catch (NumberFormatException e) {
                    JOptionPane.showMessageDialog(this, "Enter valid number!");
                }
            }
        } else {
            JOptionPane.showMessageDialog(this, "Select a product to sell!");
        }
    }
    
    private void updateTotalSales() {
        double total = saleDAO.getTotalSalesBySeller(sellerId);
        totalSalesLabel.setText("Total Sales: $" + String.format("%.2f", total));
    }
    
    private void logout() {
        int confirm = JOptionPane.showConfirmDialog(this, "Logout?", "Confirm", JOptionPane.YES_NO_OPTION);
        if (confirm == JOptionPane.YES_OPTION) {
            new LoginFrame().setVisible(true);
            dispose();
        }
    }
}

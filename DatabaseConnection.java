package database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import javax.swing.JOptionPane;

public class DatabaseConnection {
    // তোর MySQL সেটআপ অনুযায়ী এই লাইনগুলো ঠিক করবি
    private static final String URL = "jdbc:mysql://localhost:3306/ecommerce_db";
    private static final String USER = "root";
    private static final String PASSWORD = "";  // XAMPP ব্যবহার করলে ফাঁকা রাখবি
    
    private static Connection connection = null;
    
    public static Connection getConnection() {
        if (connection == null) {
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                connection = DriverManager.getConnection(URL, USER, PASSWORD);
                System.out.println("✅ Database Connected Successfully!");
            } catch (ClassNotFoundException | SQLException e) {
                JOptionPane.showMessageDialog(null, "❌ Database Connection Failed!\n" + e.getMessage());
                e.printStackTrace();
            }
        }
        return connection;
    }
    
    public static void closeConnection() {
        if (connection != null) {
            try {
                connection.close();
                System.out.println("Database Disconnected.");
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
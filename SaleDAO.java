package dao;

import database.DatabaseConnection;
import java.sql.*;

public class SaleDAO {
    
    public boolean recordSale(int productId, int quantity, double totalPrice, int sellerId) {
        String sql = "INSERT INTO sales (product_id, quantity, total_price, seller_id) VALUES (?, ?, ?, ?)";
        try (PreparedStatement pstmt = DatabaseConnection.getConnection().prepareStatement(sql)) {
            pstmt.setInt(1, productId);
            pstmt.setInt(2, quantity);
            pstmt.setDouble(3, totalPrice);
            pstmt.setInt(4, sellerId);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public double getTotalSalesBySeller(int sellerId) {
        String sql = "SELECT SUM(total_price) as total FROM sales WHERE seller_id = ?";
        try (PreparedStatement pstmt = DatabaseConnection.getConnection().prepareStatement(sql)) {
            pstmt.setInt(1, sellerId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return rs.getDouble("total");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }
}

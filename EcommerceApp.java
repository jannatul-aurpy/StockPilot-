package ecommerceapp;

import frames.LoginFrame;
import javax.swing.SwingUtilities;

public class EcommerceApp {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new LoginFrame().setVisible(true);
        });
    }
}
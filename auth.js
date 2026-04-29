// Registration handling
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('Registration form submitted'); // Debug log
        
        const fullName = document.getElementById('fullName').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!fullName || !username || !email || !password) {
            alert('Please fill all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        if (password.length < 4) {
            alert('Password must be at least 4 characters long');
            return;
        }
        
        const userData = {
            full_name: fullName,
            username: username,
            email: email,
            password: password
        };
        
        console.log('Sending registration data:', userData);
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            console.log('Server response:', data);
            
            if (data.success) {
                alert('Registration successful! Please login.');
                window.location.href = '/login.html';
            } else {
                alert('Registration failed: ' + data.message);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Network error. Please check if server is running.');
        }
    });
}

// Login handling
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            alert('Please enter username and password');
            return;
        }
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                window.location.href = data.redirect;
            } else {
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Network error. Please check if server is running.');
        }
    });
}

// Check authentication
function checkAuth() {
    fetch('/api/check-session')
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) {
                // User is logged in
                if (window.location.pathname.includes('login.html') || 
                    window.location.pathname.includes('register.html') ||
                    window.location.pathname === '/' ||
                    window.location.pathname === '/index.html') {
                    window.location.href = '/dashboard.html';
                }
            } else {
                // User is not logged in
                if (window.location.pathname.includes('dashboard.html')) {
                    window.location.href = '/login.html';
                }
            }
        })
        .catch(error => {
            console.error('Auth check error:', error);
        });
}

// Run auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);
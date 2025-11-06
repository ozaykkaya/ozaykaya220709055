// Login form handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // Simple authentication (in production, use secure authentication)
    if (username === 'admin' && password === 'admin123') {
        // Set session
        sessionStorage.setItem('adminLoggedIn', 'true');
        
        // Redirect to admin dashboard
        window.location.href = 'admin-dashboard.html';
    } else {
        errorMessage.style.display = 'block';
    }
});

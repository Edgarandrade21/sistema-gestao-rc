document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Credenciais padrão (em um sistema real, isso seria validado no backend)
    if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('isAuthenticated', 'true');
        window.location.href = 'index.html';
    } else {
        alert('Usuário ou senha incorretos!');
    }
}); 
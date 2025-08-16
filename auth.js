// Constantes
const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initAuthForms();
    checkAuthState();
});

function initAuthForms() {
    // Connexion
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            loginUser(email, password);
        });
    }
    
    // Inscription
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const user = {
                id: Date.now(),
                nom: document.getElementById('register-name').value.trim(),
                email: document.getElementById('register-email').value.trim(),
                password: document.getElementById('register-password').value,
                role: 'client'
            };
            registerUser(user);
        });
    }
    
    // Admin (optionnel)
    const adminForm = document.getElementById('admin-form');
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('admin-email').value.trim();
            const password = document.getElementById('admin-password').value;
            loginAdmin(email, password);
        });
    }
    
    // Basculer entre les formulaires
    document.querySelectorAll('.switch-tab').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetTab = this.dataset.tab;
            switchAuthTab(targetTab);
        });
    });
}

function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        redirectAfterLogin(user.role);
    } else {
        showAuthError('Email ou mot de passe incorrect');
    }
}

function loginAdmin(email, password) {
    // Dans une vraie application, utiliser un hash pour le mot de passe
    const ADMIN_CREDENTIALS = {
        email: 'admin@legourmet.com',
        password: 'admin123' // À remplacer par un hash en production
    };
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const adminUser = {
            id: 1,
            nom: 'Administrateur',
            email: email,
            role: 'admin'
        };
        
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
        redirectAfterLogin('admin');
    } else {
        showAuthError('Identifiants admin incorrects');
    }
}

function registerUser(newUser) {
    // Validation
    if (!validateUser(newUser)) return;
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    
    // Vérifier si l'email existe déjà
    if (users.some(u => u.email === newUser.email)) {
        showAuthError('Cet email est déjà utilisé');
        return;
    }
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Connecter automatiquement l'utilisateur
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    redirectAfterLogin(newUser.role);
}

function validateUser(user) {
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
        showAuthError('Veuillez entrer un email valide');
        return false;
    }
    
    // Validation mot de passe
    if (user.password.length < 6) {
        showAuthError('Le mot de passe doit contenir au moins 6 caractères');
        return false;
    }
    
    return true;
}

function redirectAfterLogin(role) {
    const redirectPath = role === 'admin' ? 'admin.html' : 'index.html';
    window.location.href = redirectPath;
}

function checkAuthState() {
    // Protéger les pages admin
    if (window.location.pathname.includes('admin.html')) {
        const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
        if (!user || user.role !== 'admin') {
            window.location.href = 'connexion.html';
        }
    }
    
    // Rediriger les utilisateurs connectés
    const authPages = ['connexion.html', 'inscription.html', 'login.html'];
    if (authPages.some(page => window.location.pathname.includes(page))) {
        const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
        if (user) {
            window.location.href = user.role === 'admin' ? 'admin.html' : 'index.html';
        }
    }
}

function switchAuthTab(tabName) {
    // Masquer tous les formulaires
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Afficher le formulaire sélectionné
    document.getElementById(`${tabName}-form`).classList.add('active');
    
    // Mettre à jour les onglets
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
}

function showAuthError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'auth-error';
    errorElement.textContent = message;
    
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        // Supprimer les anciennes erreurs
        const oldError = form.querySelector('.auth-error');
        if (oldError) oldError.remove();
        
        // Ajouter la nouvelle erreur
        form.prepend(errorElement.cloneNode(true));
    });
    
    // Animation
    setTimeout(() => {
        document.querySelectorAll('.auth-error').forEach(error => {
            error.style.opacity = '1';
        });
    }, 10);
}

// Déconnexion (à appeler depuis un bouton de déconnexion)
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'index.html';
}

// Exposer certaines fonctions globalement si nécessaire
window.authManager = {
    logout: logout,
    getCurrentUser: () => JSON.parse(localStorage.getItem(CURRENT_USER_KEY))
};
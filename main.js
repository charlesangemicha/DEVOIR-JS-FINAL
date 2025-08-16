// Gestion de l'affichage des boutons
function updateAuthButtons() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (currentUser) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        // Optionnel: Afficher le nom de l'utilisateur
        loginBtn.textContent = currentUser.nom || currentUser.email;
    } else {
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        loginBtn.textContent = "Connexion";
    }
}

// Gestion de la déconnexion
document.getElementById('logout-btn')?.addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    updateAuthButtons();
    window.location.href = 'index.html';
});

// Au chargement de la page
document.addEventListener('DOMContentLoaded', updateAuthButtons);
// Menu Mobile
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-under-title');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Fermer le menu après clic sur un lien
    document.querySelectorAll('.nav-under-title a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    });
}
// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
    PlatsManager.init();
    ReservationsManager.init();
    CommandesManager.init();
    MessagesManager.init();
    
    // Gestion de la navigation
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            // Afficher la section correspondante...
        });
    });
});
function ajouterSpecialite(nom, prix, image) {
    // 1. Récupère l'utilisateur
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert("Connectez-vous pour commander");
        window.location.href = "connexion.html";
        return;
    }

    // 2. Récupère le panier existant
    const panier = JSON.parse(localStorage.getItem(`panier_${user.email}`)) || [];
    
    // 3. Ajoute le nouvel article
    panier.push({
        nom: nom,
        prix: prix,
        image: image,
        quantite: 1
    });

    // 4. Sauvegarde
    localStorage.setItem(`panier_${user.email}`, JSON.stringify(panier));
    
    // 5. Redirige
    window.location.href = "commande.html";
}
// Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.querySelector('.toggle');
  const nav = document.querySelector('.nav-under-title');

  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('active');
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
});
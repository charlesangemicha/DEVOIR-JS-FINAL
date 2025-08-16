// Gestion complète des réservations (client + admin)
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation commune
    initDateRestrictions();
    
    // Partie Client
    if (document.getElementById('reservation-form')) {
        document.getElementById('reservation-form').addEventListener('submit', handleReservationSubmit);
    }
    
    // Partie Admin
    if (document.getElementById('reservations-table')) {
        loadReservations();
        setInterval(loadReservations, 30000); // Rafraîchissement auto
    }
});

/* ========== PARTIE CLIENT ========== */
function handleReservationSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: generateId(),
        nom: getValue('name'),
        email: getValue('email'),
        phone: getValue('phone'),
        date: getValue('date'),
        time: getValue('time'),
        personnes: parseInt(getValue('guests')),
        requests: getValue('special-requests'),
        statut: "En attente",
        createdAt: new Date().toISOString()
    };

    if (!validateReservation(formData)) return;

    saveReservation(formData);
    showReservationConfirmation(formData);
    e.target.reset();
}

/* ========== PARTIE ADMIN ========== */
function loadReservations() {
    const reservations = getReservations();
    const tbody = document.querySelector('#reservations-table tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = reservations.map(res => `
        <tr>
            <td>${formatDate(res.createdAt)}</td>
            <td>${res.nom}</td>
            <td>${res.date} ${res.time}</td>
            <td>${res.personnes}</td>
            <td class="status-${res.statut.toLowerCase().replace(' ', '-')}">
                ${res.statut}
            </td>
            <td class="actions">
                ${res.statut === 'En attente' ? `
                <button onclick="updateReservation('${res.id}', 'Confirmée')" 
                        class="btn-confirm">✓</button>` : ''}
                
                <button onclick="updateReservation('${res.id}', 'Annulée')" 
                        class="btn-cancel">✕</button>
                
                <button onclick="deleteReservation('${res.id}')" 
                        class="btn-delete">🗑</button>
            </td>
        </tr>
    `).join('');
}

/* ========== FONCTIONS PARTAGÉES ========== */
// Génération d'ID sécurisé
function generateId() {
    return crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now();
}

// Validation des données
function validateReservation(data) {
    const errors = [];
    
    if (!data.nom) errors.push("Nom requis");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push("Email invalide");
    if (new Date(data.date) < new Date()) errors.push("Date passée");
    if (data.personnes < 1 || data.personnes > 10) errors.push("Nombre de personnes invalide");
    
    if (errors.length) {
        alert("Erreurs :\n" + errors.join("\n"));
        return false;
    }
    return true;
}

// Sauvegarde
function saveReservation(reservation) {
    const reservations = getReservations();
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
}

// Récupération
function getReservations() {
    return JSON.parse(localStorage.getItem('reservations')) || [];
}

// Gestion des dates
function initDateRestrictions() {
    const dateInput = document.getElementById('date');
    if (!dateInput) return;
    
    dateInput.min = new Date().toISOString().split('T')[0];
    dateInput.addEventListener('change', function() {
        if (new Date(this.value).getDay() === 1) {
            alert("Fermé le lundi");
            this.value = '';
        }
    });
}

// Affichage
function showReservationConfirmation(reservation) {
    const confirmationHTML = `
        <div class="confirmation">
            <h3>✅ Réservation #${reservation.id.slice(0, 8)}</h3>
            <p><strong>${reservation.nom}</strong></p>
            <p>${reservation.personnes} personne(s) - ${reservation.date} à ${reservation.time}</p>
            <p><em>${reservation.requests || 'Aucune demande spéciale'}</em></p>
            <button onclick="location.reload()">Nouvelle réservation</button>
        </div>
    `;
    
    document.querySelector('main').innerHTML = confirmationHTML;
}

// Helpers
function getValue(id) {
    return document.getElementById(id)?.value.trim() || '';
}

function formatDate(isoString) {
    return new Date(isoString).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/* ========== INTERFACE ADMIN ========== */
// Fonctions globales pour les boutons admin
window.updateReservation = function(id, newStatus) {
    const reservations = getReservations();
    const index = reservations.findIndex(r => r.id === id);
    
    if (index !== -1) {
        reservations[index].statut = newStatus;
        localStorage.setItem('reservations', JSON.stringify(reservations));
        loadReservations();
    }
};

window.deleteReservation = function(id) {
    if (confirm('Supprimer définitivement ?')) {
        const updatedReservations = getReservations().filter(r => r.id !== id);
        localStorage.setItem('reservations', JSON.stringify(updatedReservations));
        loadReservations();
    }
};
// Gestion du formulaire de réservation
document.getElementById('reservation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Création de la réservation
    const reservation = {
        id: Date.now().toString(),
        nom: document.getElementById('name').value,
        email: document.getElementById('email').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        personnes: document.getElementById('guests').value,
        statut: "En attente"
    };

    // Sauvegarde
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));

    // Confirmation
    alert('Réservation enregistrée !');
    this.reset();
});
// Gestion du formulaire de réservation
document.getElementById('reservation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Création de la réservation
    const reservation = {
        id: Date.now().toString(),
        nom: document.getElementById('name').value,
        email: document.getElementById('email').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        personnes: document.getElementById('guests').value,
        statut: "En attente"
    };

    // Sauvegarde
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));

    // Confirmation
    alert('Réservation enregistrée !');
    this.reset();
});
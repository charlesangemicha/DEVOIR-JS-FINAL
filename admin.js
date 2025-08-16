// Gestion de la déconnexion
document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'connexion.html';
});
document.addEventListener('DOMContentLoaded', function() {
  // Gestion des onglets
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      // Désactive tous les onglets
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Active l'onglet cliqué
      this.classList.add('active');
      document.getElementById(this.dataset.tab).classList.add('active');
    });
  });

  // Charge les données initiales
  loadOrders();
  loadReservations();
  loadContacts();
  loadMenuItems();
  
  // Rafraîchissement automatique
  setInterval(() => {
    loadOrders();
    loadReservations();
    loadContacts();
  }, 30000);
});

/* ===== FONCTIONS DE CHARGEMENT ===== */

function loadOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const tbody = document.querySelector('#orders-table tbody');
  
  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>${order.id.substring(0, 8)}...</td>
      <td>${new Date(order.createdAt).toLocaleString('fr-FR')}</td>
      <td>${order.customer.name}</td>
      <td>${order.total.toFixed(2)}€</td>
      <td><span class="status ${getStatusClass(order.status)}">${order.status}</span></td>
      <td>
        ${order.status === 'En attente' ? `
          <button class="btn btn-accept" onclick="updateOrderStatus('${order.id}', 'Acceptée')">
            <i class="fas fa-check"></i> Accepter
          </button>
        ` : ''}
        ${order.status === 'Acceptée' ? `
          <button class="btn btn-deliver" onclick="updateOrderStatus('${order.id}', 'Livrée')">
            <i class="fas fa-truck"></i> Livrer
          </button>
        ` : ''}
        <button class="btn btn-cancel" onclick="updateOrderStatus('${order.id}', 'Annulée')">
          <i class="fas fa-times"></i> Annuler
        </button>
      </td>
    </tr>
  `).join('');
}


// Fonctions similaires pour loadReservations(), loadContacts(), loadMenuItems()
// ... (à compléter avec le code que je vous ai fourni précédemment)

/* ===== FONCTIONS UTILITAIRES ===== */

function getStatusClass(status) {
  const map = {
    'En attente': 'status-pending',
    'Acceptée': 'status-accepted', 
    'Livrée': 'status-delivered',
    'Annulée': 'status-cancelled'
  };
  return map[status] || '';
}

window.updateOrderStatus = function(id, status) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.id === id);
  
  if (order) {
    order.status = status;
    localStorage.setItem('orders', JSON.stringify(orders));
    loadOrders();
    alert(`Commande ${status.toLowerCase()} avec succès`);
  }
};
// admin.js - Version complète avec gestion du menu
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    loadAllData();
    initMenuForm();
    setInterval(loadAllData, 30000);
});
/* ===== GESTION ADMIN DES COMMANDES ===== */
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    setInterval(loadOrders, 30000); // Rafraîchissement auto
});

// Charge les commandes dans le tableau
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const tbody = document.querySelector('#orders-table tbody');
    
    tbody.innerHTML = orders.map(order => `
        <tr data-id="${order.id}" class="order-${order.status.replace(' ', '-').toLowerCase()}">
            <td>#${order.id.substring(0, 6)}</td>
            <td>${order.customer.name}</td>
            <td>${new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
            <td>${order.total.toFixed(2)}€</td>
            <td><span class="status-badge">${order.status}</span></td>
            <td class="actions">
                ${order.status === 'En attente' ? `
                <button class="btn-accept" onclick="handleOrderAction('${order.id}', 'Acceptée')">
                    ✓ Accepter
                </button>` : ''}
                
                <button class="btn-cancel" onclick="handleOrderAction('${order.id}', 'Annulée')">
                    ✕ Annuler
                </button>
                <button class="btn-view" onclick="viewOrderDetails('${order.id}')">
    👁 Voir
  </button>
                
                <button class="btn-delete" onclick="deleteOrder('${order.id}')">
                    🗑 Supprimer
                </button>
            </td>
        </tr>
    `).join('');
}
// Fonction pour afficher les détails
window.viewOrderDetails = function(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        const itemsDetails = order.items.map(item => 
            `${item.qty} × ${item.name} - ${(item.price * item.qty).toFixed(2)}€`
        ).join('\n');
        
        alert(`📋 Détails commande #${order.id.substring(0, 8)}\n
👤 Client: ${order.customer.name} (${order.customer.email})
📅 Date: ${new Date(order.createdAt).toLocaleString('fr-FR')}
🔄 Statut: ${order.status}\n
🍽 Articles:
${itemsDetails}\n
💶 Total: ${order.total.toFixed(2)}€`);
    }
};

// Gère les actions sur les commandes
window.handleOrderAction = function(orderId, action) {
    if (!confirm(`Voulez-vous vraiment ${action === 'Acceptée' ? 'accepter' : 'annuler'} cette commande ?`)) return;
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        // 1. Mise à jour du statut
        orders[orderIndex].status = action;
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // 2. Synchronisation client
        const userEmail = orders[orderIndex].customer.email;
        syncClientOrder(userEmail, orderId, action);
        
        // 3. Recharge l'affichage
        loadOrders();
        showAlert(`Commande marquée comme "${action}"`);
    }
};

// Suppression définitive
window.deleteOrder = function(orderId) {
    if (!confirm('Supprimer définitivement cette commande ?')) return;
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderToDelete = orders.find(o => o.id === orderId);
    const updatedOrders = orders.filter(o => o.id !== orderId);
    
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Supprime aussi dans l'historique client
    if (orderToDelete) {
        const userEmail = orderToDelete.customer.email;
        removeFromClientHistory(userEmail, orderId);
    }
    
    loadOrders();
    showAlert('Commande supprimée');
};

// Synchronise avec l'historique client
function syncClientOrder(userEmail, orderId, newStatus) {
    const clientKey = `commandes_${userEmail}`;
    const clientOrders = JSON.parse(localStorage.getItem(clientKey)) || [];
    
    const orderIndex = clientOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        clientOrders[orderIndex].statut = newStatus.toLowerCase();
        localStorage.setItem(clientKey, JSON.stringify(clientOrders));
    }
}

// Supprime de l'historique client
function removeFromClientHistory(userEmail, orderId) {
    const clientKey = `commandes_${userEmail}`;
    const clientOrders = JSON.parse(localStorage.getItem(clientKey)) || [];
    const updatedOrders = clientOrders.filter(o => o.id !== orderId);
    localStorage.setItem(clientKey, JSON.stringify(updatedOrders));
}

// Notification visuelle
function showAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'admin-alert';
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

/* ===== GESTION DU MENU ===== */
function initMenuForm() {
    const form = document.getElementById('menu-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveMenuItem();
    });

    document.getElementById('cancel-edit').addEventListener('click', resetMenuForm);
}

function saveMenuItem() {
    const form = document.getElementById('menu-form');
    const items = JSON.parse(localStorage.getItem('menu')) || [];
    
    const itemData = {
        id: form.elements['item-id'].value || crypto.randomUUID(),
        name: form.elements['item-name'].value.trim(),
        price: parseFloat(form.elements['item-price'].value),
        category: form.elements['item-category'].value,
        description: form.elements['item-description'].value.trim(),
        image: form.elements['item-image'].value.trim()
    };

    // Validation
    if (!itemData.name || isNaN(itemData.price) || !itemData.category) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    const index = items.findIndex(item => item.id === itemData.id);
    if (index >= 0) {
        items[index] = itemData; // Mise à jour
    } else {
        items.push(itemData); // Nouvel item
    }

    localStorage.setItem('menu', JSON.stringify(items));
    loadMenuItems();
    resetMenuForm();
    showNotification('Plat enregistré avec succès');
}

function loadMenuItems() {
    const items = JSON.parse(localStorage.getItem('menu')) || [];
    const tbody = document.querySelector('#menu-table tbody');
    
    tbody.innerHTML = items.map(item => `
        <tr data-id="${item.id}">
            <td>${item.name}</td>
            <td>${item.price.toFixed(2)}€</td>
            <td>${item.category}</td>
            <td class="actions">
                <button class="btn edit" onclick="editMenuItem('${item.id}')">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn delete" onclick="deleteMenuItem('${item.id}')">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </td>
        </tr>
    `).join('');
}
// Ajoutez cette fonction dans admin.js
function loadMenuItems() {
    const menuItems = JSON.parse(localStorage.getItem('menu')) || [];
    const tbody = document.querySelector('#menu-table tbody');
    
    tbody.innerHTML = menuItems.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.price.toFixed(2)}€</td>
            <td>${item.category}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editMenuItem('${item.id}')">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn btn-delete" onclick="deleteMenuItem('${item.id}')">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </td>
        </tr>
    `).join('');
}
window.viewOrderDetails = function(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        const itemsList = order.items.map(item => 
            `${item.qty} × ${item.name} - ${item.price.toFixed(2)}€`
        ).join('\n');
        
        alert(`Détails de la commande #${order.id}\n\n` +
              `Client: ${order.customer.name}\n` +
              `Email: ${order.customer.email}\n` +
              `Date: ${new Date(order.createdAt).toLocaleString('fr-FR')}\n\n` +
              `Articles:\n${itemsList}\n\n` +
              `Total: ${order.total.toFixed(2)}€`);
    }
};

// Et ajoutez ces fonctions
window.editMenuItem = function(id) {
    const items = JSON.parse(localStorage.getItem('menu')) || [];
    const item = items.find(i => i.id === id);
    
    if (item) {
        document.getElementById('item-id').value = item.id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-description').value = item.description || '';
        document.getElementById('item-image').value = item.image || '';
    }
};

window.deleteMenuItem = function(id) {
    if (confirm('Supprimer ce plat du menu ?')) {
        const items = JSON.parse(localStorage.getItem('menu')) || [];
        const updatedItems = items.filter(i => i.id !== id);
        localStorage.setItem('menu', JSON.stringify(updatedItems));
        loadMenuItems();
    }
};

window.editMenuItem = function(id) {
    const items = JSON.parse(localStorage.getItem('menu')) || [];
    const item = items.find(item => item.id === id);
    const form = document.getElementById('menu-form');

    if (item && form) {
        form.elements['item-id'].value = item.id;
        form.elements['item-name'].value = item.name;
        form.elements['item-price'].value = item.price;
        form.elements['item-category'].value = item.category;
        form.elements['item-description'].value = item.description;
        form.elements['item-image'].value = item.image;
        
        form.scrollIntoView({ behavior: 'smooth' });
    }
};

window.deleteMenuItem = function(id) {
    if (confirm('Supprimer définitivement ce plat du menu ?')) {
        const items = JSON.parse(localStorage.getItem('menu')) || [];
        const updatedItems = items.filter(item => item.id !== id);
        localStorage.setItem('menu', JSON.stringify(updatedItems));
        loadMenuItems();
        showNotification('Plat supprimé du menu');
    }
};

function resetMenuForm() {
    const form = document.getElementById('menu-form');
    if (form) {
        form.reset();
        form.elements['item-id'].value = '';
    }
}

/* ===== MODIFICATIONS À APPORTER ===== */
function loadAllData() {
    loadReservations();
    loadOrders();
    loadContacts();
    loadMenuItems(); // Ajouté ici
}

function initTabs() {
    // Ajouter l'onglet menu
    const tabs = `
        <button class="admin-tab" data-tab="menu">Menu</button>
        <!-- Vos autres onglets existants -->
    `;
    document.querySelector('.admin-tabs').innerHTML += tabs;
    
    // ... reste du code existant
}
// admin.js - Gestion complète de l'interface admin
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    loadAllData();
    setInterval(loadAllData, 30000); // Rafraîchissement auto toutes 30s
});

/* ===== STRUCTURE PRINCIPALE ===== */
function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Gestion de l'UI des onglets
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Affichage du contenu correspondant
            const target = tab.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(c => {
                c.classList.toggle('active', c.id === target);
            });
        });
    });
}

function loadAllData() {
    loadReservations();
    loadOrders();
    loadContacts();
    loadMenuItems();
}


/* ===== GESTION DES RÉSERVATIONS ===== */
/* === GESTION DES RÉSERVATIONS === */
/* ===== GESTION DES RÉSERVATIONS ===== */
/* ===== GESTION DES RÉSERVATIONS ===== */
function loadReservations() {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const tbody = document.querySelector('#reservations-table tbody');
    
    if (!tbody) return;

    tbody.innerHTML = reservations.map(res => {
        // Normalisation des données pour compatibilité
        const reservation = {
            id: res.id,
            fullName: res.fullName || res.nom || 'Non spécifié',
            email: res.email || 'Non spécifié',
            date: res.date || 'Non spécifié',
            time: res.time || 'Non spécifié',
            people: res.people || res.personnes || 0,
            status: res.status || res.statut || 'En attente',
            createdAt: res.createdAt || new Date().toISOString()
        };

        return `
        <tr data-id="${reservation.id}" class="status-${reservation.status.replace(' ', '-').toLowerCase()}">
            <td>${formatDate(reservation.createdAt)}</td>
            <td>${reservation.fullName}<br><small>${reservation.email}</small></td>
            <td>${reservation.date} à ${reservation.time}</td>
            <td>${reservation.people} pers.</td>
            <td>${renderReservationStatus(reservation.status)}</td>
            <td class="actions">
                ${reservation.status === 'En attente' ? `
                <button class="btn-confirm" onclick="updateReservation('${reservation.id}', 'Confirmée')">
                    ✓ Confirmer
                </button>` : ''}
                
                <button class="btn-cancel" onclick="updateReservation('${reservation.id}', 'Annulée')">
                    ✕ Annuler
                </button>
                
                <button class="btn-delete" onclick="deleteReservation('${reservation.id}')">
                    🗑 Supprimer
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

/* ===== FONCTIONS UTILITAIRES ===== */
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderReservationStatus(status) {
    const statusClass = status.replace(' ', '-').toLowerCase();
    const statusText = {
        'En attente': '⏳ En attente',
        'Confirmée': '✅ Confirmée',
        'Annulée': '❌ Annulée'
    }[status] || status;
    
    return `<span class="status-badge ${statusClass}">${statusText}</span>`;
}

/* ===== ACTIONS ADMIN ===== */
window.updateReservation = function(id, newStatus) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const index = reservations.findIndex(r => r.id === id);
    
    if (index !== -1) {
        // Mise à jour du statut (compatible avec les deux formats)
        if (reservations[index].statut) {
            reservations[index].statut = newStatus;
        } else {
            reservations[index].status = newStatus;
        }
        
        localStorage.setItem('reservations', JSON.stringify(reservations));
        loadReservations();
        showNotification(`Statut changé : ${newStatus}`);
    }
};

window.deleteReservation = function(id) {
    if (confirm('Supprimer définitivement cette réservation ?')) {
        const updated = JSON.parse(localStorage.getItem('reservations'))
                       .filter(r => r.id !== id);
        localStorage.setItem('reservations', JSON.stringify(updated));
        loadReservations();
        showNotification('Réservation supprimée');
    }
};

/* ===== INITIALISATION ===== */
document.addEventListener('DOMContentLoaded', function() {
    // Vérifie si on est sur la page admin
    if (document.getElementById('reservations-table')) {
        loadReservations();
        setInterval(loadReservations, 15000); // Rafraîchissement toutes les 15s
        
        // Crée le storage s'il n'existe pas
        if (!localStorage.getItem('reservations')) {
            localStorage.setItem('reservations', JSON.stringify([]));
        }
    }
});

/* ===== NOTIFICATIONS ===== */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <span>${message}</span>
        <span class="close-btn" onclick="this.parentElement.remove()">×</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}
/* ===== FONCTIONS UTILITAIRES ===== */
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderReservationStatus(status) {
    const statusClass = status.replace(' ', '-').toLowerCase();
    const statusText = {
        'En attente': '⏳ En attente',
        'Confirmée': '✅ Confirmée',
        'Annulée': '❌ Annulée'
    }[status] || status;
    
    return `<span class="status-badge ${statusClass}">${statusText}</span>`;
}

/* ===== ACTIONS ADMIN ===== */
window.updateReservation = function(id, newStatus) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const index = reservations.findIndex(r => r.id === id);
    
    if (index !== -1) {
        // Mise à jour du statut (compatible avec les deux formats)
        if (reservations[index].statut) {
            reservations[index].statut = newStatus;
        } else {
            reservations[index].status = newStatus;
        }
        
        localStorage.setItem('reservations', JSON.stringify(reservations));
        loadReservations();
        showNotification(`Statut changé : ${newStatus}`);
    }
};

window.deleteReservation = function(id) {
    if (confirm('Supprimer définitivement cette réservation ?')) {
        const updated = JSON.parse(localStorage.getItem('reservations'))
                       .filter(r => r.id !== id);
        localStorage.setItem('reservations', JSON.stringify(updated));
        loadReservations();
        showNotification('Réservation supprimée');
    }
};

/* ===== INITIALISATION ===== */
document.addEventListener('DOMContentLoaded', function() {
    // Vérifie si on est sur la page admin
    if (document.getElementById('reservations-table')) {
        loadReservations();
        setInterval(loadReservations, 15000); // Rafraîchissement toutes les 15s
        
        // Crée le storage s'il n'existe pas
        if (!localStorage.getItem('reservations')) {
            localStorage.setItem('reservations', JSON.stringify([]));
        }
    }
});

/* ===== NOTIFICATIONS ===== */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <span>${message}</span>
        <span class="close-btn" onclick="this.parentElement.remove()">×</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}
/* ===== FONCTIONS UTILITAIRES ===== */
function formatDate(isoString) {
    return new Date(isoString).toLocaleString('fr-FR');
}

function getStatusClass(status) {
    const statusClasses = {
        'En attente': 'pending',
        'Confirmée': 'confirmed',
        'Acceptée': 'accepted',
        'Livrée': 'completed',
        'Annulée': 'cancelled'
    };
    return statusClasses[status] || '';
}

function showNotification(message) {
    // Implémentez un système de notification (ex: toast)
    console.log('Notification:', message);
    alert(message); // Solution temporaire
}

/* ===== LIENS AVEC LES AUTRES PAGES ===== */
// Ces fonctions doivent correspondre à vos besoins spécifiques
window.updateOrderStatus = function(id, status) {
    // Implémentation similaire à updateReservationStatus
};

window.showOrderDetails = function(id) {
    // Afficher les détails d'une commande
};

window.deleteContact = function(id) {
    if (confirm('Supprimer ce message ?')) {
        const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
        const updatedContacts = contacts.filter(c => c.id !== id);
        localStorage.setItem('contacts', JSON.stringify(updatedContacts));
        loadContacts();
    }
};

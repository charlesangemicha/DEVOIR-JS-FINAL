const themeBtn = document.getElementById('theme-btn');
const sun = document.getElementById('sun');
const moon = document.getElementById('moon');

// Fonction pour appliquer le thème
function applyTheme(theme) {
    if (theme === 'dark') {
        sun.style.display = 'none';
        moon.style.display = 'block';
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = 'white';
    } else {
        sun.style.display = 'block';
        moon.style.display = 'none';
        document.body.style.backgroundColor = 'white';
        document.body.style.color = 'black';
    }
}

// Appliquer le thème au chargement
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

// Changement de thème au clic
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const newTheme = sun.style.display === 'block' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
}

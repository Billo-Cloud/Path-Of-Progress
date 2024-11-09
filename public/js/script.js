// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des onglets
    const tabs = document.querySelectorAll('.tabs li');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');
            switchTab(targetId);
        });
    });
});

// Fonction pour changer d'onglet
function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tabs li');
    const sections = document.querySelectorAll('.section');
    
    tabs.forEach(t => t.classList.remove('active'));
    sections.forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    
    document.querySelector(`.tabs li[data-tab="${tabId}"]`).classList.add('active');
    const targetSection = document.getElementById(tabId);
    targetSection.style.display = 'block';
    
    void targetSection.offsetWidth;
    targetSection.classList.add('active');
}
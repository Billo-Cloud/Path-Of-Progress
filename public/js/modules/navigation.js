// Fonction pour changer d'onglet
export function switchTab(tabId) {
    // Récupération des éléments
    const tabs = document.querySelectorAll('.tabs li');
    const sections = document.querySelectorAll('.section');
    
    // Masquer tous les onglets et retirer les classes actives
    tabs.forEach(tab => tab.classList.remove('active'));
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Activer l'onglet sélectionné
    const selectedTab = document.querySelector(`.tabs li[data-tab="${tabId}"]`);
    const selectedSection = document.getElementById(tabId);
    
    if (selectedTab && selectedSection) {
        selectedTab.classList.add('active');
        selectedSection.style.display = 'block';
        
        // Force le reflow pour l'animation
        void selectedSection.offsetWidth;
        selectedSection.classList.add('active');
    }

    // Mettre à jour les graphiques si nécessaire
    if (tabId === 'progress-chart') {
        window.updateCharts?.();
    }
}

// Initialisation de la navigation
export function initNavigation() {
    const tabs = document.querySelectorAll('.tabs li');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');
            switchTab(targetId);
        });
    });
}
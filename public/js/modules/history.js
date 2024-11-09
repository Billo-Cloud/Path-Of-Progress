// /public/js/modules/history.js

document.addEventListener('DOMContentLoaded', function() {
    initHistoryCharts();
    initTimeFilters();
    initExportButtons();
    initSearchAndFilters();
});

function initHistoryCharts() {
    // Graphique d'activité quotidienne
    const activityCtx = document.getElementById('activityChart')?.getContext('2d');
    if (activityCtx) {
        new Chart(activityCtx, {
            type: 'bar',
            data: {
                labels: getLast7Days(),
                datasets: [{
                    label: 'Quêtes complétées',
                    data: window.activityData || Array(7).fill(0),
                    backgroundColor: '#4CAF50',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Distribution par statistique
    const distributionCtx = document.getElementById('statsDistributionChart')?.getContext('2d');
    if (distributionCtx) {
        new Chart(distributionCtx, {
            type: 'doughnut',
            data: {
                labels: Object.values(window.stats).map(s => s.label),
                datasets: [{
                    data: calculateStatDistribution(),
                    backgroundColor: Object.values(window.stats).map(s => s.color)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    // Taux de complétion
    const completionCtx = document.getElementById('completionRateChart')?.getContext('2d');
    if (completionCtx) {
        new Chart(completionCtx, {
            type: 'line',
            data: {
                labels: getLast7Days(),
                datasets: [{
                    label: 'Taux de complétion',
                    data: calculateCompletionRates(),
                    borderColor: '#2196F3',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(33, 150, 243, 0.1)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => `${value}%`
                        }
                    }
                }
            }
        });
    }

    // Calendrier d'activité
    initActivityCalendar();
}

function initTimeFilters() {
    const timeFilters = document.querySelectorAll('.time-filter');
    timeFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            timeFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            updateHistoryView(this.dataset.period);
        });
    });
}

function initExportButtons() {
    document.querySelector('[onclick="exportData(\'pdf\')"]').addEventListener('click', () => exportToPDF());
    document.querySelector('[onclick="exportData(\'csv\')"]').addEventListener('click', () => exportToCSV());
}

function initSearchAndFilters() {
    const searchInput = document.querySelector('.search-input');
    const statFilter = document.querySelector('.filter-select');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => filterHistory(), 300));
    }

    if (statFilter) {
        statFilter.addEventListener('change', () => filterHistory());
    }
}

function initActivityCalendar() {
    const container = document.getElementById('activityCalendar');
    if (!container) return;

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const calendar = createCalendarGrid(year, month);
    container.innerHTML = calendar;

    // Ajouter les points d'activité
    if (window.questHistory) {
        window.questHistory.forEach(quest => {
            const date = new Date(quest.completedAt);
            const cell = document.querySelector(`[data-date="${date.toISOString().split('T')[0]}"]`);
            if (cell) {
                cell.classList.add('has-activity');
            }
        });
    }
}

// Fonctions utilitaires
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('fr-FR', { weekday: 'short' }));
    }
    return days;
}

function calculateStatDistribution() {
    if (!window.questHistory) return Array(Object.keys(window.stats).length).fill(0);
    
    const distribution = {};
    Object.keys(window.stats).forEach(key => distribution[key] = 0);
    
    window.questHistory.forEach(quest => {
        if (distribution[quest.stat] !== undefined) {
            distribution[quest.stat]++;
        }
    });
    
    return Object.values(distribution);
}

function calculateCompletionRates() {
    return getLast7Days().map(() => 
        Math.floor(Math.random() * 40) + 60 // Simulation - à remplacer par les vraies données
    );
}

function createCalendarGrid(year, month) {
    const date = new Date(year, month, 1);
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    
    let html = `<div class="calendar-header">${days.map(d => `<div>${d}</div>`).join('')}</div>`;
    html += '<div class="calendar-body">';
    
    // Remplir les cases vides du début
    let firstDay = date.getDay() || 7;
    for (let i = 1; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Ajouter les jours du mois
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day).toISOString().split('T')[0];
        html += `<div class="calendar-day" data-date="${currentDate}">${day}</div>`;
    }
    
    html += '</div>';
    return html;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function filterHistory() {
    const searchTerm = document.querySelector('.search-input').value.toLowerCase();
    const selectedStat = document.querySelector('.filter-select').value;
    
    const entries = document.querySelectorAll('.history-entry');
    entries.forEach(entry => {
        const matchesSearch = entry.querySelector('h4').textContent.toLowerCase().includes(searchTerm);
        const matchesStat = !selectedStat || entry.dataset.stat === selectedStat;
        
        entry.style.display = matchesSearch && matchesStat ? 'flex' : 'none';
    });
}

async function exportToPDF() {
    // Implémenter l'export PDF
    alert('Export PDF en cours de développement');
}

async function exportToCSV() {
    // Implémenter l'export CSV
    alert('Export CSV en cours de développement');
}

function updateHistoryView(period) {
    // Implémenter la mise à jour de la vue selon la période
    console.log('Mise à jour pour la période:', period);
}
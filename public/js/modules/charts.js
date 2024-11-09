let statsChart, activityChart, xpDistributionChart;

export function initCharts() {
    initStatsRadarChart();
    initActivityChart();
    initXPDistributionChart();
}

function initStatsRadarChart() {
    const ctx = document.getElementById('statsRadarChart');
    if (!ctx) return;

    statsChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: statsData.labels,
            datasets: [{
                label: 'Niveaux',
                data: statsData.values,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(76, 175, 80, 1)',
                pointBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    min: 0,
                    max: Math.max(...statsData.values) + 2,
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

function initActivityChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;

    const labels = getLast7Days();
    activityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quêtes Complétées',
                data: [3, 5, 2, 4, 6, 3, 4], // À remplacer par des données réelles
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }
        }
    });
}

function initXPDistributionChart() {
    const ctx = document.getElementById('xpDistributionChart');
    if (!ctx) return;

    xpDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: statsData.labels,
            datasets: [{
                data: statsData.values.map(v => v * 10), // Conversion en XP totale
                backgroundColor: [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
                    '#D4A373', '#FFD93D', '#FF8066', '#95D5B2'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function getLast7Days() {
    return Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    }).reverse();
}

export function updateCharts() {
    if (statsChart) {
        statsChart.data.datasets[0].data = statsData.values;
        statsChart.update();
    }
    if (activityChart) {
        // Mise à jour avec les dernières données d'activité
        activityChart.update();
    }
    if (xpDistributionChart) {
        xpDistributionChart.data.datasets[0].data = statsData.values.map(v => v * 10);
        xpDistributionChart.update();
    }
}

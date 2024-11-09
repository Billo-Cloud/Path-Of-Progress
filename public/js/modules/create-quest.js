// /js/modules/create-quest.js

// Auto-initialisation du module
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du module create-quest');
    initCreateQuest();
    
    // Ajouter le conteneur de notification s'il n'existe pas
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000;';
        document.body.appendChild(container);
    }
});

// Dans create-quest.js

function initCreateQuest() {
    const form = document.getElementById('createQuestForm');
    if (!form) return;

    const questNameInput = document.getElementById('quest-name');
    const questStatSelect = document.getElementById('quest-stat');
    const questDateInput = document.getElementById('quest-date');
    const questTimeSelect = document.getElementById('quest-time');
    const difficultyButtons = form.querySelectorAll('.difficulty-btn');
    let selectedDifficulty = 'facile';

    // Fonction de mise à jour de la prévisualisation
    function updatePreview() {
        // Mise à jour du titre
        document.getElementById('preview-title').textContent = questNameInput.value || 'Nom de la quête';

        // Mise à jour de la statistique
        const selectedStat = questStatSelect.value;
        if (selectedStat && window.stats[selectedStat]) {
            document.getElementById('preview-emoji').textContent = window.stats[selectedStat].emoji;
            document.getElementById('preview-stat').textContent = window.stats[selectedStat].label;
            document.getElementById('preview-stat').style.color = window.stats[selectedStat].color;
        }

        // Mise à jour de la difficulté
        const difficultyElement = document.getElementById('preview-difficulty');
        difficultyElement.textContent = selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
        difficultyElement.className = `quest-difficulty ${selectedDifficulty}`;

        // Mise à jour de l'XP
        const xpValues = { facile: 5, moyen: 10, difficile: 15 };
        document.getElementById('preview-xp').textContent = `+${xpValues[selectedDifficulty]} XP`;

        // Mise à jour de la planification
        const dateElement = document.getElementById('preview-date');
        const timeElement = document.getElementById('preview-time');
        
        if (questDateInput.value) {
            const date = new Date(questDateInput.value);
            dateElement.textContent = date.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
            });
        }

        const timeSlots = {
            'morning': '🌅 Matin',
            'afternoon': '☀️ Après-midi',
            'evening': '🌙 Soirée'
        };
        timeElement.textContent = timeSlots[questTimeSelect.value] || '';
    }

    // Événements pour la mise à jour en temps réel
    questNameInput.addEventListener('input', updatePreview);
    questStatSelect.addEventListener('change', updatePreview);
    questDateInput.addEventListener('change', updatePreview);
    questTimeSelect.addEventListener('change', updatePreview);

    // Gestion des boutons de difficulté
    difficultyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            
            selectedDifficulty = this.dataset.value;
            document.getElementById('selected-difficulty').value = selectedDifficulty;
            
            updatePreview();
        });
    });

    // Sélectionner le premier bouton par défaut
    difficultyButtons[0].classList.add('selected');

    // Mise à jour initiale de la prévisualisation
    updatePreview();

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const questData = {
            name: questNameInput.value.trim(),
            difficulty: selectedDifficulty,
            stat: questStatSelect.value,
            scheduledDate: questDateInput.value,
            timeSlot: questTimeSelect.value
        };

        if (!questData.name || !questData.stat || !questData.scheduledDate || !questData.timeSlot) {
            showNotification('error', 'Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        try {
            const response = await fetch('/api/create-quest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(questData)
            });

            const data = await response.json();

            if (data.success) {
                showNotification('success', 'Succès', 'Quête créée avec succès !');
                form.reset();
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                difficultyButtons[0].classList.add('selected');
                selectedDifficulty = 'facile';
                
                setTimeout(() => {
                    switchTab('quests');
                    location.reload();
                }, 1000);
            } else {
                showNotification('error', 'Erreur', data.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('error', 'Erreur', 'Une erreur est survenue');
        }
    });
}

// Fonction pour les notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    notification.textContent = message;
    
    document.getElementById('notification-container').appendChild(notification);
    
    // Animation d'apparition
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Disparition automatique
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showSuccessNotification() {
    const notification = document.createElement('div');
    notification.className = 'success-modal';
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        text-align: center;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    notification.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px">✨</div>
        <h3 style="margin: 0 0 10px 0">Quête créée avec succès !</h3>
        <p style="margin: 0; color: #666">Votre nouvelle quête a été ajoutée</p>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'apparition
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);

    // Disparition automatique
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 1500);
}

// Animations des éléments du formulaire
function animateFormElements(form) {
    const elements = form.querySelectorAll('.form-group, .form-actions');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function fadeOutForm(form, callback) {
    form.style.opacity = '0';
    form.style.transform = 'translateY(20px)';
    setTimeout(callback, 300);
}

function fadeInForm(form) {
    setTimeout(() => {
        form.style.opacity = '1';
        form.style.transform = 'translateY(0)';
    }, 10);
}

// Fonction globale pour la sélection de difficulté (nécessaire car appelée depuis l'HTML)
window.selectDifficulty = function(difficulty, button) {
    const hiddenInput = document.getElementById('selected-difficulty');
    if (hiddenInput) {
        hiddenInput.value = difficulty;
    }
    
    const buttons = document.querySelectorAll('.difficulty-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        btn.style.transform = 'scale(0.95)';
    });
    button.classList.add('selected');
    button.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
        buttons.forEach(btn => {
            btn.style.transform = 'scale(1)';
        });
    }, 200);
};

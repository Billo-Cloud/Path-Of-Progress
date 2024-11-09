export function initQuestCreation() {
    const form = document.getElementById('createQuestForm');
    if (!form) return;

    // Gestion des boutons de difficulté
    const difficultyButtons = form.querySelectorAll('.difficulty-btn');
    let selectedDifficulty = 'facile';

    difficultyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Retirer la classe selected de tous les boutons
            difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            // Ajouter la classe selected au bouton cliqué
            button.classList.add('selected');
            selectedDifficulty = button.dataset.value;
        });
    });

    // Sélectionner le bouton "Facile" par défaut
    difficultyButtons[0].classList.add('selected');

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const questName = document.getElementById('quest-name').value;
        const questStat = document.getElementById('quest-stat').value;

        if (!questName || !questStat) {
            showNotification('error', 'Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        try {
            const response = await fetch('/api/create-quest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: questName,
                    difficulty: selectedDifficulty,
                    stat: questStat
                })
            });

            const data = await response.json();

            if (data.success) {
                showNotification('success', 'Succès', 'Quête créée avec succès !');
                // Réinitialiser le formulaire
                form.reset();
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                difficultyButtons[0].classList.add('selected');
                // Rediriger vers l'onglet des quêtes
                setTimeout(() => {
                    switchTab('quests');
                    location.reload(); // Rafraîchir pour voir la nouvelle quête
                }, 1000);
            } else {
                showNotification('error', 'Erreur', data.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('error', 'Erreur', 'Une erreur est survenue lors de la création de la quête');
        }
    });
}

function showNotification(type, title, message) {
    // Créer un élément de notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;

    // Ajouter au container de notifications
    const container = document.querySelector('.notification-container') || 
        (() => {
            const cont = document.createElement('div');
            cont.className = 'notification-container';
            document.body.appendChild(cont);
            return cont;
        })();

    container.appendChild(notification);

    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => container.removeChild(notification), 300);
    }, 3000);
}
// Fonction de complétion de quête
window.completeQuest = async function(button) {
    // Si le bouton est désactivé, ne rien faire
    if (button.disabled) return;

    const questCard = button.closest('.quest-card');
    const questId = questCard.dataset.id;

    try {
        // Désactiver le bouton pendant la requête
        button.disabled = true;
        
        // Ajouter une classe pour l'animation de chargement
        questCard.classList.add('loading');

        const response = await fetch('/api/complete-quest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questId })
        });

        const data = await response.json();

        if (data.success) {
            // Ajouter les classes pour les animations
            questCard.classList.remove('loading');
            questCard.classList.add('completing');
            button.textContent = '✓ Complété';
            
            // Afficher les XP gagnés
            showXPGain(questCard, data.quest.xpReward);

            // Marquer la quête comme complétée
            questCard.classList.add('completed');

            // Si de nouveaux badges ont été débloqués
            if (data.newBadges && data.newBadges.length > 0) {
                setTimeout(() => {
                    showNewBadges(data.newBadges);
                }, 1000);
            }

            // Actualiser la page après un délai pour mettre à jour les stats
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } else {
            // Réactiver le bouton en cas d'erreur
            button.disabled = false;
            questCard.classList.remove('loading');
            showNotification('error', 'Erreur', data.message || 'Erreur lors de la complétion de la quête');
        }
    } catch (error) {
        console.error('Erreur:', error);
        button.disabled = false;
        questCard.classList.remove('loading');
        showNotification('error', 'Erreur', 'Une erreur est survenue');
    }
};

// Fonction pour afficher l'animation de gain d'XP
function showXPGain(questCard, xpAmount) {
    const xpPopup = document.createElement('div');
    xpPopup.className = 'xp-gain-popup';
    xpPopup.innerHTML = `+${xpAmount} XP`;
    
    questCard.appendChild(xpPopup);
    
    // Animation de montée et disparition
    setTimeout(() => {
        xpPopup.style.opacity = '0';
        xpPopup.style.transform = 'translateY(-20px)';
        setTimeout(() => xpPopup.remove(), 500);
    }, 1500);
}

// Fonction pour afficher les nouveaux badges
function showNewBadges(badges) {
    const badgePopup = document.createElement('div');
    badgePopup.className = 'badge-unlock-popup';
    badgePopup.innerHTML = `
        <div class="badge-unlock-content">
            <h3>🏆 Nouveau badge débloqué !</h3>
            ${badges.map(badge => `
                <div class="badge-item">
                    <span class="badge-icon">${badge.icon}</span>
                    <span class="badge-name">${badge.name}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    document.body.appendChild(badgePopup);
    
    setTimeout(() => {
        badgePopup.style.opacity = '0';
        setTimeout(() => badgePopup.remove(), 500);
    }, 3000);
}

// Initialiser les quêtes au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initQuestCreation();
});

window.completeQuest = async function(button) {
    if (button.disabled) return;

    const questCard = button.closest('.quest-card');
    const questId = questCard.dataset.id;

    try {
        button.disabled = true;
        questCard.classList.add('loading');

        const response = await fetch('/api/complete-quest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questId })
        });

        const data = await response.json();

        if (data.success) {
            // Animation de complétion
            questCard.classList.remove('loading');
            questCard.classList.add('completing');
            
            // Afficher les XP gagnés
            showXPGain(questCard, data.quest.xpReward);

            // Afficher les nouveaux badges si débloqués
            if (data.newBadges && data.newBadges.length > 0) {
                setTimeout(() => {
                    showNewBadges(data.newBadges);
                }, 1000);
            }

            // Animer la disparition de la carte
            setTimeout(() => {
                questCard.style.transform = 'translateX(100px)';
                questCard.style.opacity = '0';
                setTimeout(() => {
                    questCard.remove();
                    
                    // Vérifier s'il reste des quêtes
                    const remainingQuests = document.querySelectorAll('.quest-card').length;
                    if (remainingQuests === 0) {
                        const questsList = document.querySelector('.quests-list');
                        questsList.innerHTML = `
                            <div class="empty-state">
                                <div class="empty-icon">🎯</div>
                                <h3>Toutes les quêtes sont complétées !</h3>
                                <p>Créez une nouvelle quête pour continuer votre progression !</p>
                                <button onclick="switchTab('create-quest')" class="create-quest-btn">
                                    Créer une quête
                                </button>
                            </div>
                        `;
                    }
                }, 300);
            }, 1500);

        } else {
            button.disabled = false;
            questCard.classList.remove('loading');
            showNotification('error', 'Erreur', data.message || 'Erreur lors de la complétion de la quête');
        }
    } catch (error) {
        console.error('Erreur:', error);
        button.disabled = false;
        questCard.classList.remove('loading');
        showNotification('error', 'Erreur', 'Une erreur est survenue');
    }
};
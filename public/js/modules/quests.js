// /public/js/modules/quests.js

export function initQuestCards() {
    const cards = document.querySelectorAll('.quest-card');
    
    cards.forEach(card => {
        // Animation au survol
        card.addEventListener('mouseenter', () => {
            const emoji = card.querySelector('.quest-emoji');
            if (emoji) emoji.style.transform = 'scale(1.2) rotate(5deg)';
        });

        card.addEventListener('mouseleave', () => {
            const emoji = card.querySelector('.quest-emoji');
            if (emoji) emoji.style.transform = 'scale(1) rotate(0deg)';
        });

        // Timer si présent
        const timerElement = card.querySelector('.quest-timer');
        if (timerElement) {
            const duration = parseInt(timerElement.dataset.duration, 10);
            initTimer(timerElement, duration);
        }
    });
}

function initTimer(element, duration) {
    let timeLeft = duration * 60; // conversion en secondes
    const display = element.querySelector('.timer-display');
    let timerId = null;

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    element.querySelector('.timer-button')?.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            element.classList.remove('running');
            return;
        }

        element.classList.add('running');
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerId);
                element.classList.remove('running');
                element.classList.add('completed');
            }
        }, 1000);
    });
}

// Animation de complétion améliorée
function showCompletionAnimation(card) {
    card.classList.add('completing');
    
    // Créer l'effet de particules
    const particles = createParticles(card);
    document.body.appendChild(particles);
    
    setTimeout(() => {
        particles.remove();
        card.style.transform = 'translateX(100%)';
        card.style.opacity = '0';
        
        setTimeout(() => {
            card.remove();
        }, 300);
    }, 1000);
}

function createParticles(card) {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.pointerEvents = 'none';
    const rect = card.getBoundingClientRect();
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'completion-particle';
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;
        container.appendChild(particle);
    }
    
    return container;
}

// Export des fonctions
export { initQuestCards, showCompletionAnimation };
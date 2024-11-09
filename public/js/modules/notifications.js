export function showNotification(type, title, message) {
    const container = getNotificationContainer();
    const notification = createNotification(type, title, message);
    
    container.appendChild(notification);
    animateNotification(notification);
}

function getNotificationContainer() {
    let container = document.querySelector('.notification-container');
    
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    return container;
}

function createNotification(type, title, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = getNotificationIcon(type);
    
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    return notification;
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        case 'level-up': return '🎉';
        case 'xp-gain': return '⭐';
        default: return '📢';
    }
}

function animateNotification(notification) {
    // Disparition après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s forwards';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

import { showNotification } from './notifications.js';

export function initProfile() {
    initAvatarUpload();
    initEmojiSelection();
    initBadgeSystem();
}

function initAvatarUpload() {
    const avatarInput = document.getElementById('avatarInput');
    if (!avatarInput) return;

    avatarInput.addEventListener('change', handleAvatarUpload);
}

export async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifications
    if (!file.type.startsWith('image/')) {
        showNotification('error', 'Erreur', 'Veuillez sélectionner une image');
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
        showNotification('error', 'Erreur', 'L\'image ne doit pas dépasser 5MB');
        return;
    }

    // Afficher un aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('avatarPreview').src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await fetch('/api/upload-avatar', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            showNotification('success', 'Succès', 'Photo de profil mise à jour !');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Erreur upload:', error);
        showNotification('error', 'Erreur', 'Erreur lors de l\'upload');
    }
}

function initEmojiSelection() {
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    emojiButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const emoji = btn.textContent.trim();
            try {
                const response = await fetch('/api/update-emoji', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ emoji })
                });

                const data = await response.json();
                if (data.success) {
                    emojiButtons.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    showNotification('success', 'Succès', 'Emoji mis à jour !');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showNotification('error', 'Erreur', 'Impossible de mettre à jour l\'emoji');
            }
        });
    });
}

function initBadgeSystem() {
    document.querySelectorAll('.badge-item').forEach(badge => {
        badge.addEventListener('click', function() {
            const isLocked = this.classList.contains('locked');
            const badgeName = this.querySelector('.badge-name').textContent;
            const badgeDesc = this.querySelector('.badge-description').textContent;

            showNotification(
                isLocked ? 'info' : 'success',
                badgeName,
                isLocked ? `Pour débloquer : ${badgeDesc}` : 'Badge débloqué !'
            );
        });
    });
}

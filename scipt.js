// Variable de base pour stocker l'XP
let xp = 0;

// Fonction pour compléter une quête et augmenter l'XP
function completeQuest() {
    // Incrémente l'XP de 10 points à chaque fois
    xp += 10;

    // Met à jour la barre de progression et le texte
    document.getElementById('xp-bar').value = xp;
    document.getElementById('xp-label').textContent = `${xp} XP`;

    // Affiche un message lorsque le joueur atteint 100 XP
    if (xp >= 100) {
        alert("Félicitations ! Tu as atteint 100 XP !");
    }
}

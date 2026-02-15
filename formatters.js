/**
 * @file formatters.js
 * Fonctions utilitaires pour le formatage des données
 */

/**
 * Formate un nombre avec des suffixes (K, M, B)
 */
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toString();
}

/**
 * Formate une durée en millisecondes
 */
function formatTime(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    return { hours, minutes, seconds };
}

/**
 * Formate une durée en chaîne lisible
 */
function formatTimeString(milliseconds) {
    const { hours, minutes, seconds } = formatTime(milliseconds);
    return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Formate un pourcentage
 */
function formatPercentage(value, decimals = 1) {
    return (value * 100).toFixed(decimals) + '%';
}

// ⬇️⬇️⬇️ AJOUTEZ CETTE NOUVELLE FONCTION ICI ⬇️⬇️⬇️
/**
 * Formate les nombres pour l'affichage des dégâts flottants
 * (avec des espaces, ex: "1 234 567")
 */
function formatFloatingNumber(num) {
    if (num == null || isNaN(num)) {
        return '0';
    }
    // 'fr-FR' utilise l'espace comme séparateur de milliers.
    return Math.floor(num).toLocaleString('fr-FR');
}
// ⬆️⬆️⬆️ FIN DE L'AJOUT ⬆️⬆️


/**
 * Génère une clé de shard (basée sur la famille uniquement)
 */
function getShardKey(creatureName, rarity) {
    const familyName = EVOLUTION_FAMILIES[creatureName] || creatureName;
    return familyName;
}

// Export global
window.formatNumber = formatNumber;
window.formatTime = formatTime;
window.formatTimeString = formatTimeString;
window.formatPercentage = formatPercentage;
window.formatFloatingNumber = formatFloatingNumber;
window.getShardKey = getShardKey;
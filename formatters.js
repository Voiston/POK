/**
 * @file formatters.js
 * Fonctions utilitaires pour le formatage des données
 */

/**
 * Formate un nombre avec des suffixes (K, M, B)
 * Affichage global (2 décimales, ex: 9.84M)
 */
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return Math.floor(num).toString();
}

/**
 * Formate un nombre avec plus de précision pour le header
 * (alias de formatNumber pour garder la compatibilité)
 */
function formatNumberHeader(num) {
    return formatNumber(num);
}

// Reusable object to avoid allocations in game loops
const _timeFormatObj = { hours: 0, minutes: 0, seconds: 0 };

/**
 * Formate une durée en millisecondes
 * Mutates and returns a shared object to avoid GC pressure
 */
function formatTime(milliseconds) {
    _timeFormatObj.hours = Math.floor(milliseconds / 3600000);
    _timeFormatObj.minutes = Math.floor((milliseconds % 3600000) / 60000);
    _timeFormatObj.seconds = Math.floor((milliseconds % 60000) / 1000);

    return _timeFormatObj;
}

/**
 * Formate une durée en chaîne lisible
 */
function formatTimeString(milliseconds) {
    // Only one string allocation here, instead of one object + one string
    const h = Math.floor(milliseconds / 3600000);
    const m = Math.floor((milliseconds % 3600000) / 60000);
    const s = Math.floor((milliseconds % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
}

/**
 * Formate un pourcentage
 */
function formatPercentage(value, decimals = 1) {
    return (value * 100).toFixed(decimals) + '%';
}

// ⬇️⬇️⬇️ AJOUTEZ CETTE NOUVELLE FONCTION ICI ⬇️⬇️⬇️
// Cache the formatter to prevent creating it on every call 
// (toLocaleString creates a new Intl.NumberFormat instance internally if not cached)
const _floatingNumberFormatter = new Intl.NumberFormat('fr-FR');

/**
 * Formate les nombres pour l'affichage des dégâts flottants
 * (avec des espaces, ex: "1 234 567")
 */
function formatFloatingNumber(num) {
    if (num == null || isNaN(num)) {
        return '0';
    }
    return _floatingNumberFormatter.format(Math.floor(num));
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
window.formatNumberHeader = formatNumberHeader;
window.formatTime = formatTime;
window.formatTimeString = formatTimeString;
window.formatPercentage = formatPercentage;
window.formatFloatingNumber = formatFloatingNumber;
window.getShardKey = getShardKey;
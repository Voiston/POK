const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');

try {
    let content = fs.readFileSync(indexPath, 'utf-8');

    // Générer un numéro de version unique basé sur le timestamp actuel
    const version = Date.now();

    // Regex pour cibler les src="*.js" et href="*.css" locaux (qui ne commencent pas par http)
    // Il gère également le remplacement s'il y a déjà un paramètre ?v=...
    const regex = /(href|src)="((?!http)[^"?]+\.(?:js|css))(?:\?[^"]*)?"/g;

    let count = 0;
    const newContent = content.replace(regex, (match, attr, filename) => {
        count++;
        return `${attr}="${filename}?v=${version}"`;
    });

    // Sauvegarder les modifications dans index.html
    fs.writeFileSync(indexPath, newContent, 'utf-8');

    console.log(`\x1b[32m✔ Mise a jour reussie !\x1b[0m`);
    console.log(`${count} ressources locales pointees vers la version ?v=${version}`);
    console.log(`Les problemes de cache sur GitHub Pages devraient etre resolus !`);

} catch (error) {
    console.error(`\x1b[31mErreur lors de la mise à jour :\x1b[0m`, error.message);
}

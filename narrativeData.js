/**
 * @file narrativeData.js
 * Données narratives du moteur Professor Chen (Pokémon Idle satirique).
 * Script canonique : les chaînes ci-dessous sont les textes officiels.
 */

/** URL du sprite du Professeur Chen. Déposer votre image dans img/prof_chen.png (ex. 96x96 px). */
const CHEN_SPRITE_URL = 'img/prof_chen.png';

const narrativeData = {
    INTRO: "Salut ! Désolé, je ne t'avais pas entendu arriver, j'étais en train de regarder l'herbe pousser... Bienvenue dans le monde des Pokémon Incrémentaux. Ici, pas besoin de traverser des grottes sombres en longeant les murs sans Flash ou encore de martyriser tes chaussures de sport. Mon nouveau crédo ? Le moindre effort, la retraite approche ! Ici chaque seconde qui s'écoule, chaque battement de paupière, chaque soupir de ton Bulbizarre te rend plus fort. C'est mathématique ! Pourquoi s'embêter à lancer des Pokéballs quand on peut simplement attendre que les statistiques deviennent si grosses qu'elles défient les lois de la physique ? Le Temps, c'est des statistiques: chaque seconde, tu te renforces selon la puissance de ton équipe ! C'est lent au début, mais attends de voir dans trois jours, tu pourras soulever un Ronflex avec ton petit doigt. Allez, tu connais la musique, choisis vite ton starter que je puisse retourner à ma sieste.",

    INTRO_PARTS: [
        "Salut ! Désolé, je ne t'avais pas entendu arriver, j'étais en train de regarder l'herbe pousser... Bienvenue dans le monde des Pokémon Incrémentaux. Ici, pas besoin de traverser des grottes sombres sans Flash ou de martyriser tes chaussures de sport.",
        "Mon nouveau crédo ? Le moindre effort, la retraite approche ! Ici, chaque soupir de ton Bulbizarre te rend plus fort. C'est mathématique ! Pourquoi s'embêter à lancer des Pokéballs quand on peut attendre que les stats défient les lois de la physique ?",
        "Le Temps, c'est des statistiques : chaque seconde, tu te renforces ! C'est lent au début, mais dans trois jours, tu pourras soulever un Ronflex avec ton petit doigt. Allez, choisis vite ton starter que je puisse retourner à ma sieste."
    ],

    INFLATION_RANT: "Hop là ! Doucement le nouveau ! Tu croyais vraiment qu'on distribuait des reptiles de feu et des tortues à canons comme ça, en 2026 ? L'inflation est passée par là mon petit, les budgets de la Ligue ont fondu comme un Metamorph au soleil ! Maintenant, voilà à quoi ont droit les petits nouveaux dans ton genre.",

    INFLATION_RANT_PARTS: [
        "Hop là ! Doucement le nouveau ! Tu croyais vraiment qu'on distribuait des reptiles de feu et des tortues à canons comme ça, en 2026 ? L'inflation est passée par là mon petit, les budgets de la Ligue ont fondu comme un Metamorph au soleil !",
        "Maintenant, voilà à quoi ont droit les petits nouveaux dans ton genre."
    ],

    POST_CHOICE_RANT: "Quoi ? Tu fais la moue ? Écoute, un Papilusion ou un Dardargnan qui génèrent des stats pendant que tu manges tes céréales, c'est déjà un luxe ! De mon temps, les jeunes connaissaient la valeur du travail, il fallait user ses crampons dans les hautes herbes, grimper tout en haut du mont Argenté et pour les plus idiots même remonter la piste cyclable en contre-sens ! Soit content, qui sait, la prochaine génération aura peut-être droit à un Zarbi. Dès que tu auras accumulé quelques milliards de statistiques, on reparlera peut-être de ton Salamèche... Allez, au travail ! Ah, une dernière chose avant que je ne ferme l'œil... Tu vois ce bouton là-bas ? Celui qui affiche tes statistiques ? Ne le quitte pas des yeux. C'est ta nouvelle raison de vivre. Si le chiffre monte, c'est que tu deviens une légende. Si le chiffre s'arrête... c'est probablement que tu as oublié de nourrir ton insecte ridicule, ou que le jeu a planté. Dans les deux cas, ce n'est plus mon problème ! Allez, file ! Le monde des Pokémon n'attend que toi !",

    
    POST_CHOICE_RANTPARTS: [
        "Quoi ? Tu fais la moue ? Écoute, un Papilusion ou un Dardargnan qui génèrent des stats pendant que tu manges tes céréales, c'est déjà un luxe ! De mon temps, les jeunes connaissaient la valeur du travail, il fallait user ses crampons dans les hautes herbes, grimper tout en haut du mont Argenté et pour les plus idiots même remonter la piste cyclable en contre-sens !",
        "Sois content, qui sait, la prochaine génération aura peut-être droit à un Zarbi. Dès que tu auras accumulé quelques milliards de statistiques, on reparlera peut-être de ton Salamèche... Allez, au travail !",
        "Ah, une dernière chose avant que je ne ferme l'œil... Tu vois cette barre en haut ? Celle qui affiche tes statistiques ? Ne la quitte pas des yeux. C'est ta nouvelle raison de vivre. Pour l'instant, tu prends des sacrés roustes mais laisse le temps faire son oeuvre... ",
        "Si le chiffre monte, c'est que tu deviens une légende. Si le chiffre s'arrête... c'est probablement que tu as oublié de nourrir ton insecte ridicule, ou que le jeu a planté. Dans les deux cas, ce n'est plus mon problème ! Allez, file ! Le monde des Pokémon n'attend que toi !"
    ],

    POST_CHOICE_STARTER_RECEIVED: "Voilà, {starter} est à toi ! Prends-en soin.",

    MILESTONE_10K: "Tiens ? Tu es encore là ? J'ai cru entendre un bip... Ah, 10 000 de stats ! Pas mal pour quelqu'un qui a commencé avec un insecte asthmatique. Ton équipe commence à ressembler à quelque chose. Enfin, disons qu'on ne les confond plus avec de simples touffes d'herbe. Continue comme ça.",

    MILESTONE_100K: "Cent mille de stats ! Impressionnant ! J'ai dû ajuster mes lunettes pour vérifier le compteur. À ce stade, tes statistiques sont plus élevées que... Bref. Tu commences à bien progresser, mon petit. On raconte que si tu continues, tes Pokémons pourraient finir par apprendre des attaques sans même bouger de leur fauteuil. C'est ça, le progrès !",

    MILESTONE_1M: "Un million de stats ?! Par la barbe de Leviator, tu as réussi ! Le compteur de mon Labo commence à faire un bruit de friteuse en fin de vie. Tu as généré tellement de statistiques que j'ai pu recharger mon téléphone rien qu'en restant à côté de toi. Tu es officiellement plus rentable que la centrale de Lavanville. On approche doucement du moment où ton Salamèche ne sera plus un rêve... mais attention, n'oublie pas de respirer entre deux paliers !",

    BILLION_INTRO: "Un milliard ! Incroyable ! Le compteur du Labo vient d'exploser, j'ai de la fumée plein les rideaux, mais ça valait le coup ! Tu as prouvé que la paresse est la forme la plus pure de l'ambition. Comme promis, puisque tu as accumulé plus de puissance que dix Mewtwo en colère, voici enfin le trésor que tu convoites depuis le début. J'ai dû fouiller dans les archives poussiéreuses du sous-sol pour le retrouver !",

    BILLION_INTRO_PARTS: [
        "Un milliard ! Incroyable ! Le compteur du Labo vient d'exploser, j'ai de la fumée plein les rideaux, mais ça valait le coup ! Tu as prouvé que la paresse est la forme la plus pure de l'ambition.",
        "Comme promis, puisque tu as accumulé plus de puissance que dix Mewtwo en colère, voici enfin le trésor que tu convoites depuis le début. J'ai dû fouiller dans les archives poussiéreuses du sous-sol pour le retrouver !"
    ],

    BILLION_OUTRO: "Et voilà ! Un magnifique spécimen de niveau 1 ! Regarde-moi ces IVs... ils sont... euh... présents ! Je sais, je sais, ne me remercie pas. Je vois bien à ta tête que tu es ému de voir un Pokémon aussi 'compact' par rapport à tes milliards de stats actuelles. Quoi ? Ce soupir, c'était de la déception ? De mon temps, on savait se contenter de peu ! On commençait avec ça et on était bien content de ne pas se faire manger par un Rattata sauvage au premier tournant ! Aujourd'hui, vous voulez tout, tout de suite : des chiffres qui dépassent l'entendement, des bonus passifs... Tu te rends compte que ce petit Salamèche a plus de mérite que toute ton équipe de parasites qui génèrent des stats pendant que tu dors ? Allez, prends-le et essaie de ne pas l'écraser en marchant, il est un peu fragile.",

    BILLION_OUTRO_PARTS: [
        "Et voilà ! Un magnifique spécimen de niveau 1 ! Regarde-moi ces IVs... ils sont... euh... présents ! Je sais, je sais, ne me remercie pas. Je vois bien à ta tête que tu es ému de voir un Pokémon aussi 'compact' par rapport à tes milliards de stats actuelles.",
        "Quoi ? Ce soupir, c'était de la déception ? De mon temps, on savait se contenter de peu ! On commençait avec ça et on était bien content de ne pas se faire manger par un Rattata sauvage au premier tournant ! Aujourd'hui, vous voulez tout, tout de suite : des chiffres qui dépassent l'entendement, des bonus passifs...",
        "Tu te rends compte que ce petit Salamèche a plus de mérite que toute ton équipe de parasites qui génèrent des stats pendant que tu dors ? Allez, prends-le et essaie de ne pas l'écraser en marchant, il est un peu fragile."
    ],

    ACHIEVEMENT_DATA: {
        id: 'toutCaPourCa_1',
        title: "Tout ça pour ça ?",
        desc: "Obtenir un starter légendaire qui est 1 000 000 000 de fois plus faible que votre équipe actuelle.",
        reward: "+1% Patience (Useless Stat)"
    }
};

/** Fake starters (display only, click triggers inflation rant). */
const NARRATIVE_FAKE_STARTERS = [
    { key: 'grass', name: 'Bulbasaur', spriteId: 1 },
    { key: 'fire', name: 'Charmander', spriteId: 4 },
    { key: 'water', name: 'Squirtle', spriteId: 7 }
];

/** Real starters after inflation rant (Chenipan = Weedle, Aspicot = Caterpie). */
const NARRATIVE_REAL_STARTERS = [
    { key: 'weedle', name: 'Chenipan', displayName: 'Chenipan', spriteId: 13 },
    { key: 'caterpie', name: 'Caterpie', displayName: 'Aspicot', spriteId: 10 }
];

/** Milestone thresholds for totalStats (playerMainStats sum). */
const NARRATIVE_MILESTONES = [
    { value: 10_000, key: 'MILESTONE_10K' },
    { value: 100_000, key: 'MILESTONE_100K' },
    { value: 1_000_000, key: 'MILESTONE_1M' }
];

const NARRATIVE_BILLION = 1_000_000_000;

/** Ugly reveal stats text (spec). */
const NARRATIVE_UGLY_REVEAL_TEXT = "Level 1. HP: 12. Atk: 5. IVs: 0";

if (typeof window !== 'undefined') {
    window.CHEN_SPRITE_URL = CHEN_SPRITE_URL;
    window.narrativeData = narrativeData;
    window.NARRATIVE_FAKE_STARTERS = NARRATIVE_FAKE_STARTERS;
    window.NARRATIVE_REAL_STARTERS = NARRATIVE_REAL_STARTERS;
    window.NARRATIVE_MILESTONES = NARRATIVE_MILESTONES;
    window.NARRATIVE_BILLION = NARRATIVE_BILLION;
    window.NARRATIVE_UGLY_REVEAL_TEXT = NARRATIVE_UGLY_REVEAL_TEXT;
}

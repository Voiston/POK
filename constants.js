/**
 * @file constants.js
 * Toutes les constantes du jeu regroupées dans un seul fichier.
 */

const TYPES = {
    FIRE: 'fire',
    WATER: 'water',
    GRASS: 'grass',
    ELECTRIC: 'electric',
    NORMAL: 'normal',
    ROCK: 'rock',
    FLYING: 'flying',
    PSYCHIC: 'psychic',
    DARK: 'dark',
    STEEL: 'steel',
    DRAGON: 'dragon',
    FIGHTING: 'fighting',
    POISON: 'poison',
    GROUND: 'ground',
    BUG: 'bug',
    GHOST: 'ghost',
    ICE: 'ice',
    FAIRY: 'fairy'
};

/** Couleurs par type (fond + texte pour contraste) — modale créature, pillule move, etc. */
const TYPE_COLORS = {
    [TYPES.FIRE]: { bg: '#ff6b35', text: '#1a1a1a' },
    [TYPES.WATER]: { bg: '#4dabf7', text: '#1a1a1a' },
    [TYPES.GRASS]: { bg: '#51cf66', text: '#1a1a1a' },
    [TYPES.ELECTRIC]: { bg: '#ffd43b', text: '#1a1a1a' },
    [TYPES.NORMAL]: { bg: '#868e96', text: '#fafafa' },
    [TYPES.ROCK]: { bg: '#b8860b', text: '#fafafa' },
    [TYPES.FLYING]: { bg: '#87ceeb', text: '#1a1a1a' },
    [TYPES.PSYCHIC]: { bg: '#ff1493', text: '#fafafa' },
    [TYPES.DARK]: { bg: '#2c1e3f', text: '#fafafa' },
    [TYPES.STEEL]: { bg: '#b0b0b0', text: '#1a1a1a' },
    [TYPES.DRAGON]: { bg: '#7038f8', text: '#fafafa' },
    [TYPES.FIGHTING]: { bg: '#c03028', text: '#fafafa' },
    [TYPES.POISON]: { bg: '#a040a0', text: '#fafafa' },
    [TYPES.GROUND]: { bg: '#e0c068', text: '#1a1a1a' },
    [TYPES.BUG]: { bg: '#a8b820', text: '#1a1a1a' },
    [TYPES.GHOST]: { bg: '#705898', text: '#fafafa' },
    [TYPES.ICE]: { bg: '#98d8d8', text: '#1a1a1a' },
    [TYPES.FAIRY]: { bg: '#ee99ac', text: '#1a1a1a' }
};

const TYPE_EFFECTIVENESS = {
    [TYPES.NORMAL]: { [TYPES.ROCK]: 0.75, [TYPES.GHOST]: 0, [TYPES.STEEL]: 0.75 },
    [TYPES.FIRE]: { [TYPES.GRASS]: 1.5, [TYPES.ICE]: 1.5, [TYPES.BUG]: 1.5, [TYPES.STEEL]: 1.5, [TYPES.FIRE]: 0.75, [TYPES.WATER]: 0.75, [TYPES.ROCK]: 0.75, [TYPES.DRAGON]: 0.75 },
    [TYPES.WATER]: { [TYPES.FIRE]: 1.5, [TYPES.ROCK]: 1.5, [TYPES.GROUND]: 1.5, [TYPES.WATER]: 0.75, [TYPES.GRASS]: 0.75, [TYPES.DRAGON]: 0.75 },
    [TYPES.GRASS]: { [TYPES.WATER]: 1.5, [TYPES.ROCK]: 1.5, [TYPES.GROUND]: 1.5, [TYPES.FIRE]: 0.75, [TYPES.GRASS]: 0.75, [TYPES.POISON]: 0.75, [TYPES.FLYING]: 0.75, [TYPES.BUG]: 0.75, [TYPES.DRAGON]: 0.75, [TYPES.STEEL]: 0.75 },
    [TYPES.ELECTRIC]: { [TYPES.WATER]: 1.5, [TYPES.FLYING]: 1.5, [TYPES.GRASS]: 0.75, [TYPES.ELECTRIC]: 0.75, [TYPES.DRAGON]: 0.75, [TYPES.GROUND]: 0 },
    [TYPES.ICE]: { [TYPES.GRASS]: 1.5, [TYPES.GROUND]: 1.5, [TYPES.FLYING]: 1.5, [TYPES.DRAGON]: 1.5, [TYPES.FIRE]: 0.75, [TYPES.WATER]: 0.75, [TYPES.ICE]: 0.75, [TYPES.STEEL]: 0.75 },
    [TYPES.FIGHTING]: { [TYPES.NORMAL]: 1.5, [TYPES.ICE]: 1.5, [TYPES.ROCK]: 1.5, [TYPES.DARK]: 1.5, [TYPES.STEEL]: 1.5, [TYPES.POISON]: 0.75, [TYPES.FLYING]: 0.75, [TYPES.PSYCHIC]: 0.75, [TYPES.BUG]: 0.75, [TYPES.FAIRY]: 0.75, [TYPES.GHOST]: 0 },
    [TYPES.POISON]: { [TYPES.GRASS]: 1.5, [TYPES.FAIRY]: 1.5, [TYPES.POISON]: 0.75, [TYPES.GROUND]: 0.75, [TYPES.ROCK]: 0.75, [TYPES.GHOST]: 0.75, [TYPES.STEEL]: 0 },
    [TYPES.GROUND]: { [TYPES.FIRE]: 1.5, [TYPES.ELECTRIC]: 1.5, [TYPES.POISON]: 1.5, [TYPES.ROCK]: 1.5, [TYPES.STEEL]: 1.5, [TYPES.GRASS]: 0.75, [TYPES.BUG]: 0.75, [TYPES.FLYING]: 0 },
    [TYPES.FLYING]: { [TYPES.GRASS]: 1.5, [TYPES.FIGHTING]: 1.5, [TYPES.BUG]: 1.5, [TYPES.ELECTRIC]: 0.75, [TYPES.ROCK]: 0.75, [TYPES.STEEL]: 0.75 },
    [TYPES.PSYCHIC]: { [TYPES.FIGHTING]: 1.5, [TYPES.POISON]: 1.5, [TYPES.PSYCHIC]: 0.75, [TYPES.STEEL]: 0.75, [TYPES.DARK]: 0 },
    [TYPES.BUG]: { [TYPES.GRASS]: 1.5, [TYPES.PSYCHIC]: 1.5, [TYPES.DARK]: 1.5, [TYPES.FIRE]: 0.75, [TYPES.FIGHTING]: 0.75, [TYPES.POISON]: 0.75, [TYPES.FLYING]: 0.75, [TYPES.GHOST]: 0.75, [TYPES.STEEL]: 0.75, [TYPES.FAIRY]: 0.75 },
    [TYPES.ROCK]: { [TYPES.FIRE]: 1.5, [TYPES.ICE]: 1.5, [TYPES.FLYING]: 1.5, [TYPES.BUG]: 1.5, [TYPES.FIGHTING]: 0.75, [TYPES.GROUND]: 0.75, [TYPES.STEEL]: 0.75 },
    [TYPES.GHOST]: { [TYPES.PSYCHIC]: 1.5, [TYPES.GHOST]: 1.5, [TYPES.DARK]: 0.75, [TYPES.NORMAL]: 0, [TYPES.FIGHTING]: 0 },
    [TYPES.DRAGON]: { [TYPES.DRAGON]: 1.5, [TYPES.STEEL]: 0.75, [TYPES.FAIRY]: 0 },
    [TYPES.DARK]: { [TYPES.PSYCHIC]: 1.5, [TYPES.GHOST]: 1.5, [TYPES.FIGHTING]: 0.75, [TYPES.DARK]: 0.75, [TYPES.FAIRY]: 0.75 },
    [TYPES.STEEL]: { [TYPES.ROCK]: 1.5, [TYPES.ICE]: 1.5, [TYPES.FAIRY]: 1.5, [TYPES.FIRE]: 0.75, [TYPES.WATER]: 0.75, [TYPES.ELECTRIC]: 0.75, [TYPES.STEEL]: 0.75 },
    [TYPES.FAIRY]: { [TYPES.FIGHTING]: 1.5, [TYPES.DRAGON]: 1.5, [TYPES.DARK]: 1.5, [TYPES.FIRE]: 0.75, [TYPES.POISON]: 0.75, [TYPES.STEEL]: 0.75 },
};

const RARITY = {
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
};

/** Durées d'incubation de base par rareté (en millisecondes). Réduites par l'amélioration "Incubation rapide". */
const EGG_INCUBATION_BASE_MS = {
    [RARITY.COMMON]: 1 * 60 * 1000,           // 30 s (ex-5 min / 10)
    [RARITY.RARE]: 3 * 60 * 1000,             // 1 min 30 (ex-15 min / 10)
    [RARITY.EPIC]: 12 * 60 * 1000,       // 4 min 30 (ex-45 min / 10)
    [RARITY.LEGENDARY]: 60 * 60 * 1000    // 12 min (ex-2 h / 10)
};

const AUTO_INCUBATION_DEFAULT_PRIORITY = [
    RARITY.LEGENDARY,
    RARITY.EPIC,
    RARITY.RARE,
    RARITY.COMMON
];
const OFFLINE_INCUBATION_PREVIEW_LIMIT = 12;

const RARITY_MULTIPLIERS = {
    [RARITY.COMMON]: 1.0,
    [RARITY.RARE]: 1.1,
    [RARITY.EPIC]: 1.2,
    [RARITY.LEGENDARY]: 1.3
};

const XP_CURVE_MULTIPLIERS = {
    [RARITY.COMMON]: 1.0,
    [RARITY.RARE]: 1.1,
    [RARITY.EPIC]: 1.2,
    [RARITY.LEGENDARY]: 1.3
};

const RARITY_STAMINA_BONUS = {
    [RARITY.COMMON]: 1,
    [RARITY.RARE]: 1.25,
    [RARITY.EPIC]: 1.50,
    [RARITY.LEGENDARY]: 1.75
};

const RARITY_CHANCES = {
    [RARITY.COMMON]: 81.5,
    [RARITY.RARE]: 15,
    [RARITY.EPIC]: 3,
    [RARITY.LEGENDARY]: 0.5
};



const POKEMON_POOL = {
    [RARITY.COMMON]: {
        // --- CRITÈRES : Familles faibles, early-game, ou évolutions finales peu puissantes ---
        [TYPES.FIRE]: ['Slugma', 'Magcargo', 'Numel', 'Camerupt'],
        [TYPES.WATER]: ['Marill', 'Azumarill', 'Carvanha', 'Sharpedo', 'Goldeen', 'Seaking', 'Remoraid', 'Octillery', 'Wingull', 'Pelipper', 'Barboach', 'Whiscash', 'Luvdisc', 'Shellos', 'Gastrodon', 'Finneon', 'Lumineon', 'Wooper', 'Quagsire', 'Krabby', 'Kingler', 'Corphish', 'Crawdaunt', 'Qwilfish'],
        [TYPES.GRASS]: ['Hoppip', 'Skiploom', 'Jumpluff', 'Sunkern', 'Sunflora', 'Cacnea', 'Cacturne', 'Cherubi', 'Cherrim', 'Carnivine', 'Paras', 'Parasect'],
        [TYPES.ELECTRIC]: ['Voltorb', 'Electrode', 'Plusle', 'Minun', 'Pachirisu', 'Illumise', 'Volbeat'], // Illumise/Volbeat souvent associés
        [TYPES.NORMAL]: ['Granbull', 'Azurill', 'Snubbull', 'Rattata', 'Raticate', 'Sentret', 'Furret', 'Zigzagoon', 'Linoone', 'Bidoof', 'Bibarel', 'Hoothoot', 'Noctowl', 'Taillow', 'Swellow', 'Starly', 'Staravia', 'Staraptor', 'Meowth', 'Persian', 'Glameow', 'Purugly', 'Skitty', 'Delcatty', 'Buneary', 'Lopunny', 'Dunsparce', 'Castform', 'Kecleon', 'Spinda', 'Chatot', 'Stantler', 'Smeargle', 'Ditto', "Farfetch'd", 'Cleffa', 'Igglybuff', 'Doduo', 'Dodrio', 'Spearow', 'Fearow', 'Lickitung', 'Lickilicky', 'Aipom', 'Ambipom'],
        [TYPES.POISON]: ['Ekans', 'Arbok', 'Gulpin', 'Swalot', 'Seviper', 'Koffing', 'Weezing', 'Grimer', 'Muk', 'Stunky', 'Skuntank', 'Skorupi', 'Drapion', 'Croagunk', 'Toxicroak'],
        [TYPES.PSYCHIC]: ['Spoink', 'Grumpig', 'Chingling', 'Chimecho', 'Unown', 'Drowzee', 'Hypno'],
        [TYPES.ROCK]: ['Nosepass', 'Probopass', 'Sudowoodo', 'Bonsly', 'Lunatone', 'Solrock'],
        [TYPES.BUG]: ['Caterpie', 'Metapod', 'Butterfree', 'Weedle', 'Kakuna', 'Beedrill', 'Wurmple', 'Silcoon', 'Beautifly', 'Cascoon', 'Dustox', 'Kricketot', 'Kricketune', 'Burmy', 'Wormadam', 'Mothim', 'Combee', 'Vespiquen', 'Ledyba', 'Ledian', 'Spinarak', 'Ariados', 'Surskit', 'Masquerain', 'Nincada', 'Ninjask', 'Shedinja', 'Venonat', 'Venomoth'],
        [TYPES.GROUND]: ['Sandshrew', 'Sandslash', 'Diglett', 'Dugtrio', 'Phanpy', 'Donphan', 'Baltoy', 'Claydol', 'Hippopotas', 'Hippowdon'],
        [TYPES.FLYING]: [],
        [TYPES.FIGHTING]: ['Makuhita', 'Hariyama', 'Meditite', 'Medicham', 'Mankey', 'Primeape', 'Tyrogue', 'Hitmonlee', 'Hitmonchan', 'Hitmontop'],
        [TYPES.ICE]: ['Delibird', 'Snorunt', 'Glalie', 'Froslass'],
        [TYPES.GHOST]: ['Shuppet', 'Banette', 'Misdreavus', 'Mismagius', 'Drifloon', 'Drifblim'],
        [TYPES.DRAGON]: [],
        [TYPES.DARK]: ['Poochyena', 'Mightyena', 'Murkrow', 'Honchkrow'],
        [TYPES.STEEL]: ['Mawile']
    },

    [RARITY.RARE]: {
        // --- CRITÈRES : Bons Pokémon, mais pas "Top Tier" ou Starters ---
        [TYPES.FIRE]: ['Vulpix', 'Ninetales', 'Ponyta', 'Rapidash', 'Torkoal'],
        [TYPES.WATER]: ['Psyduck', 'Golduck', 'Wailmer', 'Wailord', 'Buizel', 'Floatzel', 'Mantyke', 'Mantine', 'Corsola', 'Relicanth', 'Clamperl', 'Huntail', 'Gorebyss', 'Chinchou', 'Lanturn'],
        [TYPES.GRASS]: ['Oddish', 'Gloom', 'Vileplume', 'Bellossom', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tangela', 'Tangrowth', 'Shroomish', 'Breloom', 'Tropius'],
        [TYPES.ELECTRIC]: ['Rotom', 'Electrike', 'Manectric'], // Rotom de base est Rare
        [TYPES.NORMAL]: ['Pidgeotto', 'Jigglypuff', 'Wigglytuff', 'Clefairy', 'Clefable', 'Pidgey', 'Pidgeot', 'Porygon', 'Porygon2', 'Porygon-Z', 'Miltank', 'Kangaskhan', 'Zangoose', 'Girafarig', 'Ursaring', 'Teddiursa', 'Whismur', 'Loudred', 'Exploud'],
        [TYPES.POISON]: ['Nidoran♀', 'Nidorina', 'Nidoqueen', 'Nidoran♂', 'Nidorino', 'Nidoking', 'Roselia', 'Budew', 'Roserade'],
        [TYPES.PSYCHIC]: ['Natu', 'Xatu', 'Mr. Mime', 'Mime Jr.', 'Jynx', 'Smoochum', 'Wobbuffet', 'Wynaut'],
        [TYPES.ROCK]: ['Omanyte', 'Omastar', 'Kabuto', 'Kabutops', 'Lileep', 'Cradily', 'Anorith', 'Armaldo', 'Cranidos', 'Rampardos', 'Shieldon', 'Bastiodon'],
        [TYPES.BUG]: ['Pinsir', 'Heracross', 'Yanma', 'Yanmega', 'Pineco', 'Forretress', 'Shuckle'],
        [TYPES.GROUND]: ['Cubone', 'Marowak', 'Trapinch', 'Vibrava', 'Flygon', 'Gligar', 'Gliscor'],
        [TYPES.FLYING]: [],
        [TYPES.FIGHTING]: [], // Déplacés en Common ou Epic
        [TYPES.ICE]: ['Dewgong', 'Seel'],
        [TYPES.GHOST]: ['Sableye', 'Spiritomb'],
        [TYPES.DRAGON]: ['Altaria', 'Swablu'],
        [TYPES.DARK]: ['Absol', 'Sneasel', 'Weavile', 'Houndour', 'Houndoom'],
        [TYPES.STEEL]: ['Skarmory', 'Bronzor', 'Bronzong']
    },

    [RARITY.EPIC]: {
        // --- CRITÈRES : Starters, Pseudo-légendaires, et Pokémon très forts (Toute la famille incluse) ---
        [TYPES.FIRE]: [
            'Charmander', 'Charmeleon', 'Charizard',
            'Cyndaquil', 'Quilava', 'Typhlosion',
            'Torchic', 'Combusken', 'Blaziken',
            'Chimchar', 'Monferno', 'Infernape',
            'Growlithe', 'Arcanine', 'Flareon',
            'Magby', 'Magmar', 'Magmortar'

        ],
        [TYPES.WATER]: [
            'Squirtle', 'Wartortle', 'Blastoise',
            'Totodile', 'Croconaw', 'Feraligatr',
            'Mudkip', 'Marshtomp', 'Swampert',
            'Piplup', 'Prinplup', 'Empoleon',
            'Magikarp', 'Gyarados',
            'Shellder', 'Cloyster',
            'Feebas', 'Milotic',
            'Horsea', 'Seadra', 'Kingdra',
            'Spheal', 'Sealeo', 'Walrein',
            'Lapras', 'Vaporeon',
            'Poliwag', 'Poliwhirl', 'Poliwrath', 'Politoed',
            'Slowpoke', 'Slowbro', 'Slowking',
            'Tentacool', 'Tentacruel',
            'Staryu', 'Starmie',
            'Lotad', 'Lombre', 'Ludicolo'
        ],
        [TYPES.GRASS]: [
            'Bulbasaur', 'Ivysaur', 'Venusaur',
            'Chikorita', 'Bayleef', 'Meganium',
            'Treecko', 'Grovyle', 'Sceptile',
            'Turtwig', 'Grotle', 'Torterra',
            'Exeggcute', 'Exeggutor',
            'Leafeon', 'Snover', 'Abomasnow',
            'Seedot', 'Nuzleaf', 'Shiftry'
        ],
        [TYPES.ELECTRIC]: [
            'Pichu', 'Pikachu', 'Raichu',
            'Elekid', 'Electabuzz', 'Electivire',
            'Magnemite', 'Magneton', 'Magnezone',
            'Mareep', 'Flaaffy', 'Ampharos',
            'Shinx', 'Luxio', 'Luxray',
            'Jolteon'
        ],
        [TYPES.NORMAL]: [
            'Eevee', 'Snorlax', 'Munchlax', 'Chansey', 'Blissey', 'Happiny', 'Togepi', 'Togetic', 'Togekiss', 'Tauros', 'Vigoroth', 'Slakoth', 'Slaking'
        ],
        [TYPES.POISON]: [
            'Gastly', 'Haunter', 'Gengar', 'Zubat', 'Golbat', 'Crobat'
        ],
        [TYPES.PSYCHIC]: [
            'Abra', 'Kadabra', 'Alakazam',
            'Ralts', 'Kirlia', 'Gardevoir', 'Gallade',
            'Espeon'
        ],
        [TYPES.ROCK]: [
            'Geodude', 'Graveler', 'Golem',
            'Aerodactyl',
            'Rhyhorn', 'Rhydon', 'Rhyperior',
            'Aron', 'Lairon', 'Aggron',
            'Larvitar', 'Pupitar', 'Tyranitar',
            'Onix', 'Steelix'
        ],
        [TYPES.BUG]: [
            'Scyther', 'Scizor'
        ],
        [TYPES.GROUND]: [
            'Gible', 'Gabite', 'Garchomp',
            'Swinub', 'Piloswine', 'Mamoswine'
        ],
        [TYPES.FLYING]: [],
        [TYPES.FIGHTING]: [
            'Machop', 'Machoke', 'Machamp',
            'Riolu', 'Lucario'
        ],
        [TYPES.ICE]: [
            'Glaceon'
        ],
        [TYPES.GHOST]: [
            'Duskull', 'Dusclops', 'Dusknoir'
        ],
        [TYPES.DRAGON]: [
            'Dratini', 'Dragonair', 'Dragonite',
            'Bagon', 'Shelgon', 'Salamence'
        ],
        [TYPES.DARK]: ['Umbreon'], // Tyranocif est en Roche, Dimoret en Rare (choix d'équilibrage sinon trop de Dark en Epic), Houndoom en Rare.
        [TYPES.STEEL]: [
            'Beldum', 'Metang', 'Metagross'
        ]
    },

    [RARITY.LEGENDARY]: {
        [TYPES.FIRE]: ['Moltres', 'Ho-Oh', 'Heatran', 'Entei'],
        [TYPES.WATER]: ['Kyogre', 'Palkia', 'Manaphy', 'Phione', 'Suicune'],
        [TYPES.GRASS]: ['Celebi', 'Shaymin'],
        [TYPES.ELECTRIC]: ['Zapdos', 'Raikou'],
        [TYPES.NORMAL]: ['Arceus', 'Regigigas'],
        [TYPES.PSYCHIC]: ['Mew', 'Mewtwo', 'Lugia', 'Deoxys', 'Uxie', 'Mesprit', 'Azelf', 'Cresselia', 'Jirachi'],
        [TYPES.ROCK]: ['Regirock'],
        [TYPES.ICE]: ['Articuno', 'Regice'],
        [TYPES.STEEL]: ['Registeel', 'Dialga'],
        [TYPES.GROUND]: ['Groudon'],
        [TYPES.DRAGON]: ['Rayquaza', 'Latios', 'Latias', 'Giratina', 'Dialga', 'Palkia'],
        [TYPES.DARK]: ['Darkrai']
    }
};


// À ajouter AVANT const PASSIVE_TALENTS
const POKEMON_SECONDARY_TYPES = {
    // --- GEN 1 ---
    'Bulbasaur': TYPES.POISON, 'Ivysaur': TYPES.POISON, 'Venusaur': TYPES.POISON,
    'Charizard': TYPES.FLYING, 'Butterfree': TYPES.FLYING,
    'Weedle': TYPES.POISON, 'Kakuna': TYPES.POISON, 'Beedrill': TYPES.POISON,
    'Pidgey': TYPES.FLYING, 'Pidgeotto': TYPES.FLYING, 'Pidgeot': TYPES.FLYING,
    'Spearow': TYPES.FLYING, 'Fearow': TYPES.FLYING,
    'Nidoqueen': TYPES.GROUND, 'Nidoking': TYPES.GROUND,
    'Jigglypuff': TYPES.FAIRY, 'Wigglytuff': TYPES.FAIRY,
    'Zubat': TYPES.FLYING, 'Golbat': TYPES.FLYING,
    'Oddish': TYPES.POISON, 'Gloom': TYPES.POISON, 'Vileplume': TYPES.POISON,
    'Paras': TYPES.GRASS, 'Parasect': TYPES.GRASS,
    'Venonat': TYPES.POISON, 'Venomoth': TYPES.POISON,
    'Poliwrath': TYPES.FIGHTING,
    'Tentacool': TYPES.POISON, 'Tentacruel': TYPES.POISON,
    'Geodude': TYPES.GROUND, 'Graveler': TYPES.GROUND, 'Golem': TYPES.GROUND,
    'Slowpoke': TYPES.PSYCHIC, 'Slowbro': TYPES.PSYCHIC,
    'Magnemite': TYPES.STEEL, 'Magneton': TYPES.STEEL,
    "Farfetch'd": TYPES.FLYING, 'Doduo': TYPES.FLYING, 'Dodrio': TYPES.FLYING,
    'Dewgong': TYPES.ICE, 'Cloyster': TYPES.ICE,
    'Gastly': TYPES.POISON, 'Haunter': TYPES.POISON, 'Gengar': TYPES.POISON,
    'Onix': TYPES.GROUND,
    'Exeggcute': TYPES.PSYCHIC, 'Exeggutor': TYPES.PSYCHIC,
    'Rhyhorn': TYPES.ROCK, 'Rhydon': TYPES.ROCK,
    'Starmie': TYPES.PSYCHIC, 'Mr. Mime': TYPES.FAIRY,
    'Scyther': TYPES.FLYING, 'Jynx': TYPES.PSYCHIC,
    'Gyarados': TYPES.FLYING, 'Lapras': TYPES.ICE,
    'Omanyte': TYPES.WATER, 'Omastar': TYPES.WATER,
    'Kabuto': TYPES.WATER, 'Kabutops': TYPES.WATER,
    'Aerodactyl': TYPES.FLYING, 'Articuno': TYPES.FLYING,
    'Zapdos': TYPES.FLYING, 'Moltres': TYPES.FLYING,
    'Dragonite': TYPES.FLYING,

    // --- GEN 2 ---
    'Ledyba': TYPES.FLYING, 'Ledian': TYPES.FLYING,
    'Spinarak': TYPES.POISON, 'Ariados': TYPES.POISON,
    'Crobat': TYPES.FLYING, 'Chinchou': TYPES.ELECTRIC, 'Lanturn': TYPES.ELECTRIC,
    'Cleffa': TYPES.FAIRY, 'Igglybuff': TYPES.FAIRY, 'Togepi': TYPES.FAIRY, 'Togetic': TYPES.FAIRY,
    'Natu': TYPES.FLYING, 'Xatu': TYPES.FLYING,
    'Azumarill': TYPES.FAIRY, 'Marill': TYPES.FAIRY,
    'Hoppip': TYPES.FLYING, 'Skiploom': TYPES.FLYING, 'Jumpluff': TYPES.FLYING,
    'Wooper': TYPES.GROUND, 'Quagsire': TYPES.GROUND,
    'Murkrow': TYPES.FLYING, 'Slowking': TYPES.PSYCHIC,
    'Girafarig': TYPES.PSYCHIC, 'Pineco': TYPES.BUG, 'Forretress': TYPES.STEEL,
    'Gligar': TYPES.FLYING, 'Steelix': TYPES.GROUND,
    'Qwilfish': TYPES.POISON, 'Scizor': TYPES.STEEL, 'Shuckle': TYPES.ROCK,
    'Heracross': TYPES.FIGHTING, 'Sneasel': TYPES.ICE,
    'Swinub': TYPES.GROUND, 'Piloswine': TYPES.GROUND, 'Corsola': TYPES.ROCK,
    'Delibird': TYPES.FLYING, 'Mantine': TYPES.FLYING, 'Skarmory': TYPES.FLYING,
    'Houndour': TYPES.FIRE, 'Houndoom': TYPES.FIRE, 'Kingdra': TYPES.DRAGON,
    'Larvitar': TYPES.GROUND, 'Pupitar': TYPES.GROUND, 'Tyranitar': TYPES.DARK,
    'Lugia': TYPES.FLYING, 'Ho-Oh': TYPES.FIRE, 'Celebi': TYPES.PSYCHIC,
    'Smoochum': TYPES.PSYCHIC, 'Magcargo': TYPES.ROCK,

    // --- GEN 3 ---
    'Combusken': TYPES.FIGHTING, 'Blaziken': TYPES.FIGHTING,
    'Marshtomp': TYPES.GROUND, 'Swampert': TYPES.GROUND,
    'Beautifly': TYPES.FLYING, 'Dustox': TYPES.POISON,
    'Lotad': TYPES.GRASS, 'Lombre': TYPES.GRASS, 'Ludicolo': TYPES.GRASS,
    'Taillow': TYPES.FLYING, 'Swellow': TYPES.FLYING,
    'Wingull': TYPES.FLYING, 'Pelipper': TYPES.FLYING,
    'Ralts': TYPES.FAIRY, 'Kirlia': TYPES.FAIRY, 'Gardevoir': TYPES.FAIRY,
    'Surskit': TYPES.WATER, 'Masquerain': TYPES.FLYING,
    'Breloom': TYPES.FIGHTING, 'Nincada': TYPES.GROUND,
    'Ninjask': TYPES.FLYING, 'Shedinja': TYPES.GHOST,
    'Sableye': TYPES.DARK, 'Mawile': TYPES.FAIRY,
    'Aron': TYPES.ROCK, 'Lairon': TYPES.ROCK, 'Aggron': TYPES.ROCK,
    'Meditite': TYPES.PSYCHIC, 'Medicham': TYPES.PSYCHIC,
    'Roselia': TYPES.POISON, 'Carvanha': TYPES.DARK, 'Sharpedo': TYPES.DARK,
    'Numel': TYPES.GROUND, 'Camerupt': TYPES.GROUND,
    'Vibrava': TYPES.DRAGON, 'Flygon': TYPES.DRAGON,
    'Cacnea': TYPES.DARK, 'Cacturne': TYPES.DARK,
    'Swablu': TYPES.FLYING, 'Altaria': TYPES.FLYING,
    'Barboach': TYPES.GROUND, 'Whiscash': TYPES.GROUND,
    'Baltoy': TYPES.PSYCHIC, 'Claydol': TYPES.PSYCHIC,
    'Lileep': TYPES.GRASS, 'Cradily': TYPES.GRASS,
    'Anorith': TYPES.BUG, 'Armaldo': TYPES.BUG,
    'Tropius': TYPES.FLYING, 'Spheal': TYPES.WATER,
    'Sealeo': TYPES.WATER, 'Walrein': TYPES.WATER,
    'Relicanth': TYPES.ROCK, 'Salamence': TYPES.FLYING,
    'Beldum': TYPES.PSYCHIC, 'Metang': TYPES.PSYCHIC, 'Metagross': TYPES.PSYCHIC,
    'Latias': TYPES.PSYCHIC, 'Latios': TYPES.PSYCHIC,
    'Rayquaza': TYPES.FLYING, 'Jirachi': TYPES.STEEL,


    // --- GEN 4 ---
    'Torterra': TYPES.GROUND, 'Monferno': TYPES.FIGHTING, 'Infernape': TYPES.FIGHTING,
    'Empoleon': TYPES.STEEL, 'Starly': TYPES.FLYING, 'Staravia': TYPES.FLYING,
    'Staraptor': TYPES.FLYING, 'Bibarel': TYPES.WATER,
    'Budew': TYPES.POISON, 'Roserade': TYPES.POISON,
    'Shieldon': TYPES.STEEL, 'Bastiodon': TYPES.STEEL,
    'Wormadam': TYPES.GRASS, 'Mothim': TYPES.FLYING,
    'Combee': TYPES.FLYING, 'Vespiquen': TYPES.FLYING,
    'Drifloon': TYPES.FLYING, 'Drifblim': TYPES.FLYING,
    'Honchkrow': TYPES.FLYING, 'Chingling': TYPES.PSYCHIC,
    'Stunky': TYPES.DARK, 'Skuntank': TYPES.DARK,
    'Bronzor': TYPES.PSYCHIC, 'Bronzong': TYPES.PSYCHIC,
    'Mime Jr.': TYPES.FAIRY, 'Chatot': TYPES.FLYING,
    'Spiritomb': TYPES.DARK, 'Gible': TYPES.GROUND,
    'Gabite': TYPES.GROUND, 'Garchomp': TYPES.GROUND,
    'Lucario': TYPES.STEEL, 'Skorupi': TYPES.BUG, 'Drapion': TYPES.DARK,
    'Croagunk': TYPES.FIGHTING, 'Toxicroak': TYPES.FIGHTING,
    'Snover': TYPES.ICE, 'Abomasnow': TYPES.ICE,
    'Weavile': TYPES.ICE, 'Magnezone': TYPES.STEEL,
    'Rhyperior': TYPES.ROCK, 'Togekiss': TYPES.FLYING,
    'Yanmega': TYPES.FLYING, 'Gliscor': TYPES.FLYING,
    'Mamoswine': TYPES.GROUND, 'Gallade': TYPES.FIGHTING,
    'Probopass': TYPES.STEEL, 'Froslass': TYPES.GHOST,
    'Rotom': TYPES.GHOST,
    'Dialga': TYPES.DRAGON, 'Palkia': TYPES.DRAGON,
    'Heatran': TYPES.STEEL, 'Giratina': TYPES.DRAGON,
    'Shaymin': TYPES.FLYING // Forme Céleste (Sky Forme), sinon pur Plante
};


// 1. Définition des attaques
const MOVES_DB = {
    // === NORMAL ===
    'Charge': { name: 'Charge', type: 'normal', category: 'physical', power: 40 },
    'Griffe': { name: 'Griffe', type: 'normal', category: 'physical', power: 40 },
    'Plaquage': { name: 'Plaquage', type: 'normal', category: 'physical', power: 85 },
    'Tranche': { name: 'Tranche', type: 'normal', category: 'physical', power: 70 },
    'Météores': { name: 'Météores', type: 'normal', category: 'special', power: 60 },
    'Ultralaser': { name: 'Ultralaser', type: 'normal', category: 'special', power: 150 },
    'Vive-Attaque': { name: 'Vive-Attaque', type: 'normal', category: 'physical', power: 40 },
    'Damoclès': { name: 'Damoclès', type: 'normal', category: 'physical', power: 120 },

    // === FEU (Fire) ===
    'Flammèche': { name: 'Flammèche', type: 'fire', category: 'special', power: 40 },
    'Lance-Flammes': { name: 'Lance-Flammes', type: 'fire', category: 'special', power: 90 },
    'Déflagration': { name: 'Déflagration', type: 'fire', category: 'special', power: 110 },
    'Poing de Feu': { name: 'Poing de Feu', type: 'fire', category: 'physical', power: 75 },
    'Roue de Feu': { name: 'Roue de Feu', type: 'fire', category: 'physical', power: 60 },
    'Boutefeu': { name: 'Boutefeu', type: 'fire', category: 'physical', power: 120 },
    'Canicule': { name: 'Canicule', type: 'fire', category: 'special', power: 95 },

    // === EAU (Water) ===
    'Pistolet à O': { name: 'Pistolet à O', type: 'water', category: 'special', power: 40 },
    'Surf': { name: 'Surf', type: 'water', category: 'special', power: 90 },
    'Hydrocanon': { name: 'Hydrocanon', type: 'water', category: 'special', power: 110 },
    'Cascade': { name: 'Cascade', type: 'water', category: 'physical', power: 80 },
    'Aqua-Jet': { name: 'Aqua-Jet', type: 'water', category: 'physical', power: 40 },
    'Pince-Masse': { name: 'Pince-Masse', type: 'water', category: 'physical', power: 100 },
    'Bulles d\'O': { name: 'Bulles d\'O', type: 'water', category: 'special', power: 65 },
    'Aqua-Brèche': { name: 'Aqua-Brèche', type: 'water', category: 'physical', power: 85 },

    // === PLANTE (Grass) ===
    'Fouet Lianes': { name: 'Fouet Lianes', type: 'grass', category: 'physical', power: 45 },
    'Tranch\'Herbe': { name: 'Tranch\'Herbe', type: 'grass', category: 'physical', power: 55 },
    'Lame-Feuille': { name: 'Lame-Feuille', type: 'grass', category: 'physical', power: 90 },
    'Méga-Sangsue': { name: 'Méga-Sangsue', type: 'grass', category: 'special', power: 75 },
    'Tempête Verte': { name: 'Tempête Verte', type: 'grass', category: 'special', power: 130 },
    'Éco-Sphère': { name: 'Éco-Sphère', type: 'grass', category: 'special', power: 90 },
    'Canon Graine': { name: 'Canon Graine', type: 'grass', category: 'physical', power: 80 },
    'Giga-Sangsue': { name: 'Giga-Sangsue', type: 'grass', category: 'special', power: 75 },

    // === ÉLECTRIK (Electric) ===
    'Éclair': { name: 'Éclair', type: 'electric', category: 'special', power: 40 },
    'Tonnerre': { name: 'Tonnerre', type: 'electric', category: 'special', power: 90 },
    'Fatal-Foudre': { name: 'Fatal-Foudre', type: 'electric', category: 'special', power: 110 },
    'Poing Éclair': { name: 'Poing Éclair', type: 'electric', category: 'physical', power: 75 },
    'Étincelle': { name: 'Étincelle', type: 'electric', category: 'physical', power: 65 },
    'Éclair Fou': { name: 'Éclair Fou', type: 'electric', category: 'physical', power: 90 },
    'Électacle': { name: 'Électacle', type: 'electric', category: 'physical', power: 120 },
    'Change Éclair': { name: 'Change Éclair', type: 'electric', category: 'special', power: 70 },

    // === GLACE (Ice) ===
    'Poudreuse': { name: 'Poudreuse', type: 'ice', category: 'special', power: 40 },
    'Laser Glace': { name: 'Laser Glace', type: 'ice', category: 'special', power: 90 },
    'Blizzard': { name: 'Blizzard', type: 'ice', category: 'special', power: 110 },
    'Poing Glace': { name: 'Poing Glace', type: 'ice', category: 'physical', power: 75 },
    'Crocs Givre': { name: 'Crocs Givre', type: 'ice', category: 'physical', power: 65 },
    'Avalanche': { name: 'Avalanche', type: 'ice', category: 'physical', power: 60 },
    'Éclats Glace': { name: 'Éclats Glace', type: 'ice', category: 'physical', power: 40 },
    'Lyophilisation': { name: 'Lyophilisation', type: 'ice', category: 'special', power: 70 },

    // === COMBAT (Fighting) ===
    'Poing-Karaté': { name: 'Poing-Karaté', type: 'fighting', category: 'physical', power: 50 },
    'Casse-Brique': { name: 'Casse-Brique', type: 'fighting', category: 'physical', power: 75 },
    'Close Combat': { name: 'Close Combat', type: 'fighting', category: 'physical', power: 120 },
    'Marto-Poing': { name: 'Marto-Poing', type: 'fighting', category: 'physical', power: 100 },
    'Aurasphère': { name: 'Aurasphère', type: 'fighting', category: 'special', power: 80 },
    'Exploforce': { name: 'Exploforce', type: 'fighting', category: 'special', power: 120 },
    'Vampipoing': { name: 'Vampipoing', type: 'fighting', category: 'physical', power: 75 },
    'Onde Vide': { name: 'Onde Vide', type: 'fighting', category: 'special', power: 40 },

    // === POISON ===
    'Dard-Venin': { name: 'Dard-Venin', type: 'poison', category: 'physical', power: 15 },
    'Bomb-Beurk': { name: 'Bomb-Beurk', type: 'poison', category: 'special', power: 90 },
    'Crochet Venin': { name: 'Crochet Venin', type: 'poison', category: 'physical', power: 50 },
    'Direct Toxik': { name: 'Direct Toxik', type: 'poison', category: 'physical', power: 80 },
    'Acidarmure': { name: 'Acidarmure', type: 'poison', category: 'special', power: 40 },

    // === SOL (Ground) ===
    'Séisme': { name: 'Séisme', type: 'ground', category: 'physical', power: 100 },
    'Piétisol': { name: 'Piétisol', type: 'ground', category: 'physical', power: 60 },
    'Tunnel': { name: 'Tunnel', type: 'ground', category: 'physical', power: 80 },
    'Telluriforce': { name: 'Telluriforce', type: 'ground', category: 'special', power: 90 },
    'Tourbi-Sable': { name: 'Tourbi-Sable', type: 'ground', category: 'special', power: 35 },

    // === VOL (Flying) ===
    'Cru-Ailes': { name: 'Cru-Ailes', type: 'flying', category: 'physical', power: 60 },
    'Aéropique': { name: 'Aéropique', type: 'flying', category: 'physical', power: 60 },
    'Rapace': { name: 'Rapace', type: 'flying', category: 'physical', power: 120 },
    'Vent Violent': { name: 'Vent Violent', type: 'flying', category: 'special', power: 110 },
    'Lame d\'Air': { name: 'Lame d\'Air', type: 'flying', category: 'special', power: 75 },

    // === PSY (Psychic) ===
    'Choc Mental': { name: 'Choc Mental', type: 'psychic', category: 'special', power: 50 },
    'Psyko': { name: 'Psyko', type: 'psychic', category: 'special', power: 90 },
    'Psyko-Boost': { name: 'Psyko-Boost', type: 'psychic', category: 'special', power: 140 },
    'Coupe Psycho': { name: 'Coupe Psycho', type: 'psychic', category: 'physical', power: 70 },
    'Zen Headbutt': { name: 'Zen Headbutt', type: 'psychic', category: 'physical', power: 80 },
    'Choc Psy': { name: 'Choc Psy', type: 'psychic', category: 'special', power: 80 },
    'Extrasenseur': { name: 'Extrasenseur', type: 'psychic', category: 'special', power: 80 },

    // === INSECTE (Bug) ===
    'Dard-Nuée': { name: 'Dard-Nuée', type: 'bug', category: 'physical', power: 25 },
    'Plaie-Croix': { name: 'Plaie-Croix', type: 'bug', category: 'physical', power: 80 },
    'Mégacorne': { name: 'Mégacorne', type: 'bug', category: 'physical', power: 120 },
    'Bourdon': { name: 'Bourdon', type: 'bug', category: 'special', power: 90 },
    'Rayon Signal': { name: 'Rayon Signal', type: 'bug', category: 'special', power: 75 },

    // === ROCHE (Rock) ===
    'Jet-Pierres': { name: 'Jet-Pierres', type: 'rock', category: 'physical', power: 50 },
    'Éboulement': { name: 'Éboulement', type: 'rock', category: 'physical', power: 75 },
    'Lame de Roc': { name: 'Lame de Roc', type: 'rock', category: 'physical', power: 100 },
    'Pouvoir Antique': { name: 'Pouvoir Antique', type: 'rock', category: 'special', power: 60 },
    'Gemme Lumière': { name: 'Gemme Lumière', type: 'rock', category: 'special', power: 80 },

    // === SPECTRE (Ghost) ===
    'Léchouille': { name: 'Léchouille', type: 'ghost', category: 'physical', power: 30 },
    'Griffe Ombre': { name: 'Griffe Ombre', type: 'ghost', category: 'physical', power: 70 },
    'Ball\'Ombre': { name: 'Ball\'Ombre', type: 'ghost', category: 'special', power: 80 },
    'Châtiment': { name: 'Châtiment', type: 'ghost', category: 'physical', power: 50 },
    'Revenant': { name: 'Revenant', type: 'ghost', category: 'physical', power: 120 },
    'Ombre Portée': { name: 'Ombre Portée', type: 'ghost', category: 'physical', power: 40 },

    // === DRAGON ===
    'Draco-Rage': { name: 'Draco-Rage', type: 'dragon', category: 'special', power: 40 },
    'Dracogriffe': { name: 'Dracogriffe', type: 'dragon', category: 'physical', power: 80 },
    'Colère': { name: 'Colère', type: 'dragon', category: 'physical', power: 120 },
    'Draco-Météor': { name: 'Draco-Météor', type: 'dragon', category: 'special', power: 130 },
    'Draco-Choc': { name: 'Draco-Choc', type: 'dragon', category: 'special', power: 85 },

    // === TÉNÈBRES (Dark) ===
    'Morsure': { name: 'Morsure', type: 'dark', category: 'physical', power: 60 },
    'Tranche-Nuit': { name: 'Tranche-Nuit', type: 'dark', category: 'physical', power: 70 },
    'Mâchouille': { name: 'Mâchouille', type: 'dark', category: 'physical', power: 80 },
    'Vibrobscur': { name: 'Vibrobscur', type: 'dark', category: 'special', power: 80 },
    'Dark Pulse': { name: 'Dark Pulse', type: 'dark', category: 'special', power: 80 },
    'Sabotage': { name: 'Sabotage', type: 'dark', category: 'physical', power: 65 },

    // === ACIER (Steel) ===
    'Griffe Acier': { name: 'Griffe Acier', type: 'steel', category: 'physical', power: 50 },
    'Queue de Fer': { name: 'Queue de Fer', type: 'steel', category: 'physical', power: 100 },
    'Poing Météor': { name: 'Poing Météor', type: 'steel', category: 'physical', power: 90 },
    'Luminocanon': { name: 'Luminocanon', type: 'steel', category: 'special', power: 80 },
    'Gyro Ball': { name: 'Gyro Ball', type: 'steel', category: 'physical', power: 75 },

    // === FÉE (Fairy) ===
    'Éclat Magique': { name: 'Éclat Magique', type: 'fairy', category: 'special', power: 80 },
    'Pouvoir Lunaire': { name: 'Pouvoir Lunaire', type: 'fairy', category: 'special', power: 95 },
    'Câlinerie': { name: 'Câlinerie', type: 'fairy', category: 'physical', power: 90 },
    'Doux Baiser': { name: 'Doux Baiser', type: 'fairy', category: 'special', power: 40 },
};

// 3. Compatibilité CT (comme dans les jeux Pokémon officiels)
// Chaque attaque liste les Pokémon qui peuvent l'apprendre via CT (TM/TR)
// Basé sur les learnsets TM/TR de BDSP, FRLG, SwSh - filtré aux espèces du jeu
const CT_COMPATIBILITY = {
    // === NORMAL ===
    'Charge': ['Caterpie', 'Metapod', 'Butterfree', 'Weedle', 'Kakuna', 'Beedrill', 'Rattata', 'Raticate', 'Pidgey', 'Pidgeotto', 'Pidgeot', 'Spearow', 'Fearow', 'Meowth', 'Persian', 'Doduo', 'Dodrio', 'Magikarp', 'Ditto', 'Eevee', 'Sentret', 'Furret', 'Zigzagoon', 'Linoone', 'Starly', 'Staravia', 'Staraptor', 'Bidoof', 'Bibarel', 'Glameow', 'Purugly', 'Skitty', 'Delcatty', 'Buneary', 'Lopunny', 'Azurill', 'Snubbull', 'Granbull', 'Hoothoot', 'Noctowl', 'Taillow', 'Swellow', 'Castform', 'Kecleon', 'Spinda', 'Dunsparce', 'Chatot', 'Aipom', 'Ambipom', 'Lickitung', 'Lickilicky', 'Chansey', 'Blissey', 'Happiny', 'Kangaskhan', 'Tauros', 'Snorlax', 'Munchlax', 'Togepi', 'Togetic', 'Togekiss', 'Clefairy', 'Clefable', 'Cleffa', 'Jigglypuff', 'Wigglytuff', 'Igglybuff', 'Miltank', 'Porygon', 'Porygon2', 'Porygon-Z', 'Slakoth', 'Vigoroth', 'Slaking', 'Smeargle', 'Stantler', 'Zangoose', 'Regigigas', 'Arceus'],
    'Griffe': ['Charmander', 'Charmeleon', 'Charizard', 'Squirtle', 'Wartortle', 'Blastoise', 'Pidgey', 'Pidgeotto', 'Pidgeot', 'Rattata', 'Raticate', 'Spearow', 'Fearow', 'Nidoran♀', 'Nidorina', 'Nidoqueen', 'Nidoran♂', 'Nidorino', 'Nidoking', 'Meowth', 'Persian', 'Mankey', 'Primeape', 'Growlithe', 'Arcanine', 'Machop', 'Machoke', 'Machamp', 'Geodude', 'Graveler', 'Golem', 'Cubone', 'Marowak', 'Rhyhorn', 'Rhydon', 'Rhyperior', 'Scyther', 'Eevee', 'Pichu', 'Pikachu', 'Raichu', 'Sentret', 'Furret', 'Aipom', 'Ambipom', 'Glameow', 'Purugly', 'Skitty', 'Delcatty', 'Buneary', 'Lopunny', 'Sneasel', 'Weavile', 'Teddiursa', 'Ursaring', 'Zangoose', 'Slakoth', 'Vigoroth', 'Slaking', 'Gible', 'Gabite', 'Garchomp', 'Riolu', 'Lucario', 'Shinx', 'Luxio', 'Luxray', 'Totodile', 'Croconaw', 'Feraligatr', 'Treecko', 'Grovyle', 'Sceptile', 'Torchic', 'Combusken', 'Blaziken', 'Mudkip', 'Marshtomp', 'Swampert', 'Poochyena', 'Mightyena', 'Zigzagoon', 'Linoone', 'Bagon', 'Shelgon', 'Salamence', 'Groudon', 'Rayquaza', 'Dialga', 'Palkia', 'Giratina', 'Darkrai'],
    'Plaquage': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Charmander', 'Charmeleon', 'Charizard', 'Squirtle', 'Wartortle', 'Blastoise', 'Pidgey', 'Pidgeotto', 'Pidgeot', 'Rattata', 'Raticate', 'Nidoran♀', 'Nidorina', 'Nidoqueen', 'Nidoran♂', 'Nidorino', 'Nidoking', 'Clefairy', 'Clefable', 'Jigglypuff', 'Wigglytuff', 'Zubat', 'Golbat', 'Crobat', 'Oddish', 'Gloom', 'Vileplume', 'Paras', 'Parasect', 'Meowth', 'Persian', 'Mankey', 'Primeape', 'Growlithe', 'Arcanine', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Machop', 'Machoke', 'Machamp', 'Geodude', 'Graveler', 'Golem', 'Ponyta', 'Rapidash', 'Slowpoke', 'Slowbro', 'Magnemite', 'Magneton', 'Magnezone', 'Farfetch\'d', 'Doduo', 'Dodrio', 'Grimer', 'Muk', 'Gastly', 'Haunter', 'Gengar', 'Drowzee', 'Hypno', 'Cubone', 'Marowak', 'Lickitung', 'Lickilicky', 'Koffing', 'Weezing', 'Rhyhorn', 'Rhydon', 'Rhyperior', 'Chansey', 'Blissey', 'Kangaskhan', 'Tauros', 'Eevee', 'Vaporeon', 'Jolteon', 'Flareon', 'Espeon', 'Umbreon', 'Leafeon', 'Glaceon', 'Porygon', 'Porygon2', 'Porygon-Z', 'Snorlax', 'Munchlax', 'Sentret', 'Furret', 'Hoothoot', 'Noctowl', 'Ledyba', 'Ledian', 'Spinarak', 'Ariados', 'Togepi', 'Togetic', 'Togekiss', 'Mareep', 'Flaaffy', 'Ampharos', 'Marill', 'Azumarill', 'Azurill', 'Aipom', 'Ambipom', 'Snubbull', 'Granbull', 'Teddiursa', 'Ursaring', 'Miltank', 'Slakoth', 'Vigoroth', 'Slaking', 'Whismur', 'Loudred', 'Exploud', 'Zangoose', 'Girafarig', 'Dunsparce', 'Stantler', 'Munchlax', 'Rhyperior', 'Regigigas'],
    'Tranche': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Charizard', 'Pidgey', 'Pidgeotto', 'Pidgeot', 'Nidoqueen', 'Nidoking', 'Persian', 'Growlithe', 'Arcanine', 'Poliwrath', 'Machamp', 'Farfetch\'d', 'Kingler', 'Scyther', 'Scizor', 'Pinsir', 'Lapras', 'Eevee', 'Vaporeon', 'Jolteon', 'Flareon', 'Espeon', 'Umbreon', 'Leafeon', 'Glaceon', 'Sentret', 'Furret', 'Hoothoot', 'Noctowl', 'Ledyba', 'Ledian', 'Scyther', 'Scizor', 'Murkrow', 'Honchkrow', 'Girafarig', 'Aipom', 'Ambipom', 'Sneasel', 'Weavile', 'Ursaring', 'Swablu', 'Altaria', 'Absol', 'Staravia', 'Staraptor', 'Bibarel', 'Luxio', 'Luxray', 'Leafeon', 'Glaceon', 'Gallade', 'Dialga', 'Palkia', 'Giratina', 'Rayquaza'],
    'Météores': ['Clefairy', 'Clefable', 'Cleffa', 'Jigglypuff', 'Wigglytuff', 'Igglybuff', 'Eevee', 'Vaporeon', 'Jolteon', 'Flareon', 'Espeon', 'Umbreon', 'Leafeon', 'Glaceon', 'Porygon', 'Porygon2', 'Porygon-Z', 'Togepi', 'Togetic', 'Togekiss', 'Natu', 'Xatu', 'Girafarig', 'Stantler', 'Smeargle', 'Ralts', 'Kirlia', 'Gardevoir', 'Plusle', 'Minun', 'Castform', 'Kecleon', 'Chimecho', 'Mesprit', 'Azelf', 'Uxie', 'Cresselia', 'Mew', 'Mewtwo', 'Deoxys', 'Jirachi', 'Arceus'],
    'Ultralaser': ['Blastoise', 'Charizard', 'Venusaur', 'Pidgeot', 'Nidoking', 'Nidoqueen', 'Clefable', 'Wigglytuff', 'Golbat', 'Crobat', 'Vileplume', 'Victreebel', 'Poliwrath', 'Alakazam', 'Machamp', 'Golem', 'Gengar', 'Electrode', 'Exeggutor', 'Marowak', 'Rhydon', 'Rhyperior', 'Chansey', 'Blissey', 'Kangaskhan', 'Gyarados', 'Lapras', 'Snorlax', 'Articuno', 'Zapdos', 'Moltres', 'Dragonite', 'Mewtwo', 'Mew', 'Meganium', 'Typhlosion', 'Feraligatr', 'Noctowl', 'Togekiss', 'Ampharos', 'Azumarill', 'Jumpluff', 'Sunflora', 'Misdreavus', 'Mismagius', 'Unown', 'Wobbuffet', 'Girafarig', 'Forretress', 'Dunsparce', 'Granbull', 'Quagsire', 'Scizor', 'Slaking', 'Exploud', 'Hariyama', 'Delcatty', 'Mawile', 'Aggron', 'Camerupt', 'Altaria', 'Walrein', 'Salamence', 'Metagross', 'Regirock', 'Regice', 'Registeel', 'Latias', 'Latios', 'Kyogre', 'Groudon', 'Rayquaza', 'Jirachi', 'Deoxys', 'Torterra', 'Infernape', 'Empoleon', 'Staraptor', 'Bibarel', 'Luxray', 'Rampardos', 'Bastiodon', 'Wormadam', 'Mothim', 'Vespiquen', 'Floatzel', 'Lopunny', 'Abomasnow', 'Weavile', 'Rhyperior', 'Togekiss', 'Yanmega', 'Gliscor', 'Mamoswine', 'Gallade', 'Probopass', 'Dusknoir', 'Froslass', 'Rotom', 'Dialga', 'Palkia', 'Giratina', 'Heatran', 'Regigigas', 'Cresselia', 'Phione', 'Manaphy', 'Darkrai', 'Shaymin', 'Arceus'],
    'Vive-Attaque': ['Pikachu', 'Raichu', 'Pidgey', 'Pidgeotto', 'Pidgeot', 'Rattata', 'Raticate', 'Sandshrew', 'Sandslash', 'Nidoran♀', 'Nidorina', 'Nidoqueen', 'Nidoran♂', 'Nidorino', 'Nidoking', 'Vulpix', 'Ninetales', 'Zubat', 'Golbat', 'Crobat', 'Goldeen', 'Seaking', 'Eevee', 'Vaporeon', 'Jolteon', 'Flareon', 'Espeon', 'Umbreon', 'Leafeon', 'Glaceon', 'Sentret', 'Furret', 'Hoothoot', 'Noctowl', 'Murkrow', 'Honchkrow', 'Sneasel', 'Weavile', 'Teddiursa', 'Ursaring', 'Zigzagoon', 'Linoone', 'Taillow', 'Swellow', 'Wingull', 'Pelipper', 'Surskit', 'Masquerain', 'Swablu', 'Altaria', 'Starly', 'Staravia', 'Staraptor', 'Buneary', 'Lopunny', 'Gible', 'Gabite', 'Garchomp', 'Riolu', 'Lucario', 'Shinx', 'Luxio', 'Luxray', 'Articuno', 'Zapdos', 'Moltres', 'Dragonite', 'Raikou', 'Entei', 'Suicune', 'Lugia', 'Ho-Oh', 'Latias', 'Latios', 'Rayquaza', 'Giratina'],
    'Damoclès': ['Venusaur', 'Charizard', 'Blastoise', 'Pidgeot', 'Nidoking', 'Nidoqueen', 'Arcanine', 'Poliwrath', 'Machamp', 'Golem', 'Rhydon', 'Rhyperior', 'Snorlax', 'Gyarados', 'Lapras', 'Dragonite', 'Meganium', 'Typhlosion', 'Feraligatr', 'Ampharos', 'Ursaring', 'Slaking', 'Aggron', 'Salamence', 'Metagross', 'Regirock', 'Regice', 'Registeel', 'Torterra', 'Infernape', 'Empoleon', 'Staraptor', 'Luxray', 'Rampardos', 'Bastiodon', 'Floatzel', 'Abomasnow', 'Weavile', 'Mamoswine', 'Garchomp', 'Rhyperior', 'Probopass', 'Dialga', 'Palkia', 'Giratina', 'Heatran', 'Regigigas', 'Groudon', 'Kyogre', 'Rayquaza', 'Arceus'],

    // === FEU ===
    'Flammèche': ['Charmander', 'Charmeleon', 'Charizard', 'Vulpix', 'Ninetales', 'Growlithe', 'Arcanine', 'Ponyta', 'Rapidash', 'Magmar', 'Magmortar', 'Flareon', 'Cyndaquil', 'Quilava', 'Typhlosion', 'Slugma', 'Magcargo', 'Houndour', 'Houndoom', 'Numel', 'Camerupt', 'Torkoal', 'Chimchar', 'Monferno', 'Infernape', 'Magby', 'Heatran', 'Entei', 'Moltres', 'Ho-Oh'],
    'Lance-Flammes': ['Charmander', 'Charmeleon', 'Charizard', 'Vulpix', 'Ninetales', 'Growlithe', 'Arcanine', 'Ponyta', 'Rapidash', 'Magmar', 'Magmortar', 'Flareon', 'Cyndaquil', 'Quilava', 'Typhlosion', 'Slugma', 'Magcargo', 'Houndour', 'Houndoom', 'Numel', 'Camerupt', 'Torkoal', 'Torchic', 'Combusken', 'Blaziken', 'Chimchar', 'Monferno', 'Infernape', 'Magby', 'Rotom', 'Heatran', 'Entei', 'Moltres', 'Ho-Oh', 'Magcargo', 'Camerupt'],
    'Déflagration': ['Charmander', 'Charmeleon', 'Charizard', 'Vulpix', 'Ninetales', 'Growlithe', 'Arcanine', 'Ponyta', 'Rapidash', 'Magmar', 'Magmortar', 'Flareon', 'Cyndaquil', 'Quilava', 'Typhlosion', 'Slugma', 'Magcargo', 'Houndour', 'Houndoom', 'Numel', 'Camerupt', 'Torkoal', 'Torchic', 'Combusken', 'Blaziken', 'Chimchar', 'Monferno', 'Infernape', 'Magby', 'Heatran', 'Entei', 'Moltres', 'Ho-Oh'],
    'Poing de Feu': ['Charmander', 'Charmeleon', 'Charizard', 'Mankey', 'Primeape', 'Machop', 'Machoke', 'Machamp', 'Magmar', 'Magmortar', 'Electabuzz', 'Electivire', 'Flareon', 'Tyrogue', 'Hitmonlee', 'Hitmonchan', 'Hitmontop', 'Cyndaquil', 'Quilava', 'Typhlosion', 'Totodile', 'Croconaw', 'Feraligatr', 'Torchic', 'Combusken', 'Blaziken', 'Chimchar', 'Monferno', 'Infernape', 'Magby', 'Riolu', 'Lucario', 'Elekid', 'Meditite', 'Medicham', 'Monferno', 'Infernape'],
    'Roue de Feu': ['Charmander', 'Charmeleon', 'Charizard', 'Ponyta', 'Rapidash', 'Vulpix', 'Ninetales', 'Growlithe', 'Arcanine', 'Magmar', 'Cyndaquil', 'Quilava', 'Typhlosion', 'Slugma', 'Magcargo', 'Houndour', 'Houndoom', 'Numel', 'Camerupt', 'Entei'],
    'Boutefeu': ['Charmander', 'Charmeleon', 'Charizard', 'Vulpix', 'Ninetales', 'Growlithe', 'Arcanine', 'Ponyta', 'Rapidash', 'Magmar', 'Magmortar', 'Flareon', 'Cyndaquil', 'Quilava', 'Typhlosion', 'Houndour', 'Houndoom', 'Numel', 'Camerupt', 'Torchic', 'Combusken', 'Blaziken', 'Chimchar', 'Monferno', 'Infernape', 'Magby', 'Entei', 'Moltres', 'Ho-Oh', 'Heatran'],
    'Canicule': ['Charmander', 'Charmeleon', 'Charizard', 'Vulpix', 'Ninetales', 'Growlithe', 'Arcanine', 'Ponyta', 'Rapidash', 'Magmar', 'Magmortar', 'Flareon', 'Cyndaquil', 'Quilava', 'Typhlosion', 'Slugma', 'Magcargo', 'Houndour', 'Houndoom', 'Numel', 'Camerupt', 'Torkoal', 'Torchic', 'Combusken', 'Blaziken', 'Chimchar', 'Monferno', 'Infernape', 'Heatran', 'Entei', 'Moltres', 'Ho-Oh'],

    // === EAU ===
    'Pistolet à O': ['Squirtle', 'Wartortle', 'Blastoise', 'Psyduck', 'Golduck', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Politoed', 'Tentacool', 'Tentacruel', 'Slowpoke', 'Slowbro', 'Slowking', 'Shellder', 'Cloyster', 'Krabby', 'Kingler', 'Horsea', 'Seadra', 'Kingdra', 'Goldeen', 'Seaking', 'Staryu', 'Starmie', 'Magikarp', 'Gyarados', 'Lapras', 'Vaporeon', 'Totodile', 'Croconaw', 'Feraligatr', 'Marill', 'Azumarill', 'Azurill', 'Wooper', 'Quagsire', 'Chinchou', 'Lanturn', 'Remoraid', 'Octillery', 'Mantine', 'Mantyke', 'Carvanha', 'Sharpedo', 'Wailmer', 'Wailord', 'Barboach', 'Whiscash', 'Shellos', 'Gastrodon', 'Finneon', 'Lumineon', 'Mudkip', 'Marshtomp', 'Swampert', 'Lotad', 'Lombre', 'Ludicolo', 'Wingull', 'Pelipper', 'Surskit', 'Masquerain', 'Feebas', 'Milotic', 'Spheal', 'Sealeo', 'Walrein', 'Corphish', 'Crawdaunt', 'Luvdisc', 'Buizel', 'Floatzel', 'Phione', 'Manaphy', 'Kyogre', 'Palkia', 'Suicune'],
    'Surf': ['Squirtle', 'Wartortle', 'Blastoise', 'Psyduck', 'Golduck', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Politoed', 'Tentacool', 'Tentacruel', 'Slowpoke', 'Slowbro', 'Slowking', 'Shellder', 'Cloyster', 'Krabby', 'Kingler', 'Horsea', 'Seadra', 'Kingdra', 'Goldeen', 'Seaking', 'Staryu', 'Starmie', 'Magikarp', 'Gyarados', 'Lapras', 'Vaporeon', 'Omanyte', 'Omastar', 'Kabuto', 'Kabutops', 'Totodile', 'Croconaw', 'Feraligatr', 'Marill', 'Azumarill', 'Wooper', 'Quagsire', 'Chinchou', 'Lanturn', 'Remoraid', 'Octillery', 'Mantine', 'Mantyke', 'Carvanha', 'Sharpedo', 'Wailmer', 'Wailord', 'Barboach', 'Whiscash', 'Shellos', 'Gastrodon', 'Finneon', 'Lumineon', 'Mudkip', 'Marshtomp', 'Swampert', 'Lotad', 'Lombre', 'Ludicolo', 'Wingull', 'Pelipper', 'Surskit', 'Masquerain', 'Feebas', 'Milotic', 'Spheal', 'Sealeo', 'Walrein', 'Corphish', 'Crawdaunt', 'Clamperl', 'Huntail', 'Gorebyss', 'Luvdisc', 'Buizel', 'Floatzel', 'Relicanth', 'Kyogre', 'Palkia', 'Manaphy', 'Phione', 'Suicune'],
    'Hydrocanon': ['Squirtle', 'Wartortle', 'Blastoise', 'Psyduck', 'Golduck', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Politoed', 'Tentacool', 'Tentacruel', 'Slowpoke', 'Slowbro', 'Slowking', 'Shellder', 'Cloyster', 'Krabby', 'Kingler', 'Horsea', 'Seadra', 'Kingdra', 'Goldeen', 'Seaking', 'Staryu', 'Starmie', 'Magikarp', 'Gyarados', 'Lapras', 'Vaporeon', 'Omanyte', 'Omastar', 'Kabuto', 'Kabutops', 'Totodile', 'Croconaw', 'Feraligatr', 'Marill', 'Azumarill', 'Wooper', 'Quagsire', 'Remoraid', 'Octillery', 'Carvanha', 'Sharpedo', 'Wailmer', 'Wailord', 'Barboach', 'Whiscash', 'Shellos', 'Gastrodon', 'Finneon', 'Lumineon', 'Mudkip', 'Marshtomp', 'Swampert', 'Lotad', 'Lombre', 'Ludicolo', 'Wingull', 'Pelipper', 'Feebas', 'Milotic', 'Spheal', 'Sealeo', 'Walrein', 'Corphish', 'Crawdaunt', 'Clamperl', 'Huntail', 'Gorebyss', 'Buizel', 'Floatzel', 'Kyogre', 'Palkia', 'Manaphy', 'Phione', 'Suicune'],
    'Cascade': ['Squirtle', 'Wartortle', 'Blastoise', 'Psyduck', 'Golduck', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Politoed', 'Tentacool', 'Tentacruel', 'Slowpoke', 'Slowbro', 'Slowking', 'Shellder', 'Cloyster', 'Krabby', 'Kingler', 'Horsea', 'Seadra', 'Kingdra', 'Goldeen', 'Seaking', 'Magikarp', 'Gyarados', 'Totodile', 'Croconaw', 'Feraligatr', 'Marill', 'Azumarill', 'Wooper', 'Quagsire', 'Remoraid', 'Octillery', 'Mantine', 'Mantyke', 'Carvanha', 'Sharpedo', 'Wailmer', 'Wailord', 'Barboach', 'Whiscash', 'Shellos', 'Gastrodon', 'Mudkip', 'Marshtomp', 'Swampert', 'Lotad', 'Lombre', 'Ludicolo', 'Wingull', 'Pelipper', 'Feebas', 'Milotic', 'Spheal', 'Sealeo', 'Walrein', 'Corphish', 'Crawdaunt', 'Buizel', 'Floatzel', 'Gible', 'Gabite', 'Garchomp', 'Kyogre', 'Palkia', 'Manaphy', 'Phione', 'Suicune'],
    'Aqua-Jet': ['Squirtle', 'Wartortle', 'Blastoise', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Shellder', 'Cloyster', 'Krabby', 'Kingler', 'Totodile', 'Croconaw', 'Feraligatr', 'Marill', 'Azumarill', 'Remoraid', 'Octillery', 'Carvanha', 'Sharpedo', 'Barboach', 'Whiscash', 'Shellos', 'Gastrodon', 'Mudkip', 'Marshtomp', 'Swampert', 'Lotad', 'Lombre', 'Ludicolo', 'Corphish', 'Crawdaunt', 'Buizel', 'Floatzel', 'Piplup', 'Prinplup', 'Empoleon', 'Phione', 'Manaphy'],
    'Pince-Masse': ['Krabby', 'Kingler', 'Corphish', 'Crawdaunt', 'Cloyster', 'Kabutops'],
    'Bulles d\'O': ['Squirtle', 'Wartortle', 'Blastoise', 'Psyduck', 'Golduck', 'Poliwag', 'Poliwhirl', 'Tentacool', 'Tentacruel', 'Shellder', 'Cloyster', 'Krabby', 'Kingler', 'Horsea', 'Seadra', 'Kingdra', 'Staryu', 'Starmie', 'Magikarp', 'Gyarados', 'Lapras', 'Vaporeon', 'Totodile', 'Croconaw', 'Feraligatr', 'Marill', 'Azumarill', 'Wooper', 'Quagsire', 'Remoraid', 'Octillery', 'Carvanha', 'Sharpedo', 'Wingull', 'Pelipper', 'Surskit', 'Masquerain', 'Barboach', 'Whiscash', 'Shellos', 'Gastrodon', 'Finneon', 'Lumineon', 'Buizel', 'Floatzel', 'Phione', 'Manaphy'],
    'Aqua-Brèche': ['Squirtle', 'Wartortle', 'Blastoise', 'Psyduck', 'Golduck', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Slowpoke', 'Slowbro', 'Shellder', 'Cloyster', 'Gyarados', 'Lapras', 'Totodile', 'Croconaw', 'Feraligatr', 'Marill', 'Azumarill', 'Wooper', 'Quagsire', 'Remoraid', 'Octillery', 'Carvanha', 'Sharpedo', 'Barboach', 'Whiscash', 'Shellos', 'Gastrodon', 'Mudkip', 'Marshtomp', 'Swampert', 'Lotad', 'Lombre', 'Ludicolo', 'Feebas', 'Milotic', 'Spheal', 'Sealeo', 'Walrein', 'Corphish', 'Crawdaunt', 'Buizel', 'Floatzel', 'Gible', 'Gabite', 'Garchomp', 'Kyogre', 'Palkia', 'Manaphy', 'Phione', 'Suicune'],

    // === PLANTE ===
    'Fouet Lianes': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tangela', 'Tangrowth', 'Chikorita', 'Bayleef', 'Meganium', 'Treecko', 'Grovyle', 'Sceptile', 'Turtwig', 'Grotle', 'Torterra', 'Hoppip', 'Skiploom', 'Jumpluff', 'Sunkern', 'Sunflora', 'Cacnea', 'Cacturne', 'Cherubi', 'Cherrim', 'Carnivine', 'Exeggcute', 'Exeggutor', 'Leafeon', 'Snover', 'Abomasnow', 'Seedot', 'Nuzleaf', 'Shiftry', 'Shroomish', 'Breloom', 'Roselia', 'Budew', 'Roserade', 'Tropius', 'Paras', 'Parasect', 'Celebi', 'Shaymin'],
    'Tranch\'Herbe': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Oddish', 'Gloom', 'Vileplume', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tangela', 'Tangrowth', 'Paras', 'Parasect', 'Chikorita', 'Bayleef', 'Meganium', 'Treecko', 'Grovyle', 'Sceptile', 'Turtwig', 'Grotle', 'Torterra', 'Hoppip', 'Skiploom', 'Jumpluff', 'Sunkern', 'Sunflora', 'Cacnea', 'Cacturne', 'Cherubi', 'Cherrim', 'Carnivine', 'Exeggcute', 'Exeggutor', 'Leafeon', 'Snover', 'Abomasnow', 'Seedot', 'Nuzleaf', 'Shiftry', 'Shroomish', 'Breloom', 'Roselia', 'Budew', 'Roserade', 'Tropius', 'Lileep', 'Cradily', 'Celebi', 'Shaymin'],
    'Lame-Feuille': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Oddish', 'Gloom', 'Vileplume', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tangela', 'Tangrowth', 'Paras', 'Parasect', 'Scyther', 'Scizor', 'Chikorita', 'Bayleef', 'Meganium', 'Treecko', 'Grovyle', 'Sceptile', 'Turtwig', 'Grotle', 'Torterra', 'Hoppip', 'Skiploom', 'Jumpluff', 'Sunkern', 'Sunflora', 'Cacnea', 'Cacturne', 'Cherubi', 'Cherrim', 'Carnivine', 'Exeggcute', 'Exeggutor', 'Leafeon', 'Snover', 'Abomasnow', 'Seedot', 'Nuzleaf', 'Shiftry', 'Shroomish', 'Breloom', 'Roselia', 'Budew', 'Roserade', 'Tropius', 'Leafeon', 'Celebi', 'Shaymin'],
    'Méga-Sangsue': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Oddish', 'Gloom', 'Vileplume', 'Bellossom', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Paras', 'Parasect', 'Chikorita', 'Bayleef', 'Meganium', 'Treecko', 'Grovyle', 'Sceptile', 'Turtwig', 'Grotle', 'Torterra', 'Hoppip', 'Skiploom', 'Jumpluff', 'Sunkern', 'Sunflora', 'Cacnea', 'Cacturne', 'Cherubi', 'Cherrim', 'Exeggcute', 'Exeggutor', 'Roselia', 'Budew', 'Roserade', 'Tropius', 'Shroomish', 'Breloom', 'Lileep', 'Cradily', 'Celebi', 'Shaymin'],
    'Tempête Verte': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Oddish', 'Gloom', 'Vileplume', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tangela', 'Tangrowth', 'Exeggcute', 'Exeggutor', 'Chikorita', 'Bayleef', 'Meganium', 'Treecko', 'Grovyle', 'Sceptile', 'Turtwig', 'Grotle', 'Torterra', 'Sunkern', 'Sunflora', 'Cacnea', 'Cacturne', 'Roselia', 'Budew', 'Roserade', 'Lileep', 'Cradily', 'Celebi', 'Shaymin'],
    'Éco-Sphère': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Oddish', 'Gloom', 'Vileplume', 'Bellossom', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tangela', 'Tangrowth', 'Exeggcute', 'Exeggutor', 'Chikorita', 'Bayleef', 'Meganium', 'Treecko', 'Grovyle', 'Sceptile', 'Turtwig', 'Grotle', 'Torterra', 'Hoppip', 'Skiploom', 'Jumpluff', 'Sunkern', 'Sunflora', 'Cacnea', 'Cacturne', 'Cherubi', 'Cherrim', 'Roselia', 'Budew', 'Roserade', 'Tropius', 'Shroomish', 'Breloom', 'Lileep', 'Cradily', 'Leafeon', 'Snover', 'Abomasnow', 'Celebi', 'Shaymin'],
    'Canon Graine': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Oddish', 'Gloom', 'Vileplume', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tangela', 'Tangrowth', 'Exeggcute', 'Exeggutor', 'Chikorita', 'Bayleef', 'Meganium', 'Treecko', 'Grovyle', 'Sceptile', 'Turtwig', 'Grotle', 'Torterra', 'Hoppip', 'Skiploom', 'Jumpluff', 'Sunkern', 'Sunflora', 'Cacnea', 'Cacturne', 'Cherubi', 'Cherrim', 'Carnivine', 'Shroomish', 'Breloom', 'Roselia', 'Budew', 'Roserade', 'Tropius', 'Lileep', 'Cradily', 'Leafeon', 'Snover', 'Abomasnow', 'Seedot', 'Nuzleaf', 'Shiftry', 'Celebi', 'Shaymin'],
    'Giga-Sangsue': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Oddish', 'Gloom', 'Vileplume', 'Bellossom', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Paras', 'Parasect', 'Chikorita', 'Bayleef', 'Meganium', 'Treecko', 'Grovyle', 'Sceptile', 'Turtwig', 'Grotle', 'Torterra', 'Hoppip', 'Skiploom', 'Jumpluff', 'Sunkern', 'Sunflora', 'Cacnea', 'Cacturne', 'Cherubi', 'Cherrim', 'Roselia', 'Budew', 'Roserade', 'Tropius', 'Shroomish', 'Breloom', 'Lileep', 'Cradily', 'Celebi', 'Shaymin'],

    // === ÉLECTRIK ===
    'Éclair': ['Pichu', 'Pikachu', 'Raichu', 'Magnemite', 'Magneton', 'Magnezone', 'Voltorb', 'Electrode', 'Electabuzz', 'Electivire', 'Jolteon', 'Elekid', 'Mareep', 'Flaaffy', 'Ampharos', 'Electrike', 'Manectric', 'Plusle', 'Minun', 'Pachirisu', 'Shinx', 'Luxio', 'Luxray', 'Rotom', 'Raikou', 'Zapdos'],
    'Tonnerre': ['Pichu', 'Pikachu', 'Raichu', 'Magnemite', 'Magneton', 'Magnezone', 'Voltorb', 'Electrode', 'Electabuzz', 'Electivire', 'Jolteon', 'Elekid', 'Mareep', 'Flaaffy', 'Ampharos', 'Electrike', 'Manectric', 'Plusle', 'Minun', 'Pachirisu', 'Shinx', 'Luxio', 'Luxray', 'Rotom', 'Chinchou', 'Lanturn', 'Raikou', 'Zapdos'],
    'Fatal-Foudre': ['Pichu', 'Pikachu', 'Raichu', 'Magnemite', 'Magneton', 'Magnezone', 'Voltorb', 'Electrode', 'Electabuzz', 'Electivire', 'Jolteon', 'Elekid', 'Mareep', 'Flaaffy', 'Ampharos', 'Electrike', 'Manectric', 'Plusle', 'Minun', 'Pachirisu', 'Shinx', 'Luxio', 'Luxray', 'Rotom', 'Chinchou', 'Lanturn', 'Raikou', 'Zapdos'],
    'Poing Éclair': ['Pikachu', 'Raichu', 'Electabuzz', 'Electivire', 'Machop', 'Machoke', 'Machamp', 'Magmar', 'Magmortar', 'Elekid', 'Meditite', 'Medicham', 'Riolu', 'Lucario', 'Hitmonchan', 'Hitmontop', 'Tyrogue'],
    'Étincelle': ['Pichu', 'Pikachu', 'Raichu', 'Magnemite', 'Magneton', 'Magnezone', 'Voltorb', 'Electrode', 'Electabuzz', 'Electivire', 'Jolteon', 'Mareep', 'Flaaffy', 'Ampharos', 'Electrike', 'Manectric', 'Shinx', 'Luxio', 'Luxray', 'Elekid', 'Raikou', 'Zapdos'],
    'Éclair Fou': ['Pichu', 'Pikachu', 'Raichu', 'Magnemite', 'Magneton', 'Magnezone', 'Voltorb', 'Electrode', 'Electabuzz', 'Electivire', 'Jolteon', 'Mareep', 'Flaaffy', 'Ampharos', 'Electrike', 'Manectric', 'Shinx', 'Luxio', 'Luxray', 'Elekid', 'Raikou', 'Zapdos'],
    'Électacle': ['Pichu', 'Pikachu', 'Raichu', 'Elekid'],
    'Change Éclair': ['Pichu', 'Pikachu', 'Raichu', 'Magnemite', 'Magneton', 'Magnezone', 'Voltorb', 'Electrode', 'Electabuzz', 'Electivire', 'Jolteon', 'Mareep', 'Flaaffy', 'Ampharos', 'Electrike', 'Manectric', 'Plusle', 'Minun', 'Pachirisu', 'Shinx', 'Luxio', 'Luxray', 'Rotom', 'Chinchou', 'Lanturn', 'Raikou', 'Zapdos'],

    // === GLACE ===
    'Poudreuse': ['Seel', 'Dewgong', 'Jynx', 'Smoochum', 'Lapras', 'Articuno', 'Delibird', 'Snorunt', 'Glalie', 'Froslass', 'Spheal', 'Sealeo', 'Walrein', 'Snover', 'Abomasnow', 'Glaceon', 'Sneasel', 'Weavile', 'Regice'],
    'Laser Glace': ['Dewgong', 'Cloyster', 'Jynx', 'Smoochum', 'Lapras', 'Articuno', 'Regice', 'Delibird', 'Snorunt', 'Glalie', 'Froslass', 'Spheal', 'Sealeo', 'Walrein', 'Snover', 'Abomasnow', 'Glaceon', 'Sneasel', 'Weavile', 'Palkia', 'Kyogre', 'Manaphy', 'Phione', 'Suicune'],
    'Blizzard': ['Dewgong', 'Cloyster', 'Jynx', 'Smoochum', 'Lapras', 'Articuno', 'Regice', 'Delibird', 'Snorunt', 'Glalie', 'Froslass', 'Spheal', 'Sealeo', 'Walrein', 'Snover', 'Abomasnow', 'Glaceon', 'Sneasel', 'Weavile', 'Slowbro', 'Slowking', 'Starmie', 'Tentacruel', 'Vaporeon', 'Palkia', 'Kyogre', 'Manaphy', 'Phione', 'Suicune'],
    'Poing Glace': ['Jynx', 'Smoochum', 'Hitmonchan', 'Hitmontop', 'Tyrogue', 'Sneasel', 'Weavile', 'Snorunt', 'Glalie', 'Froslass', 'Meditite', 'Medicham', 'Riolu', 'Lucario'],
    'Crocs Givre': ['Gyarados', 'Arcanine', 'Mightyena', 'Poochyena', 'Houndour', 'Houndoom', 'Sneasel', 'Weavile', 'Drapion', 'Gible', 'Gabite', 'Garchomp', 'Glaceon'],
    'Avalanche': ['Sandshrew', 'Sandslash', 'Geodude', 'Graveler', 'Golem', 'Onix', 'Steelix', 'Rhyhorn', 'Rhydon', 'Rhyperior', 'Swinub', 'Piloswine', 'Mamoswine', 'Snorunt', 'Glalie', 'Froslass', 'Abomasnow', 'Regice', 'Articuno'],
    'Éclats Glace': ['Dewgong', 'Cloyster', 'Jynx', 'Smoochum', 'Lapras', 'Articuno', 'Regice', 'Delibird', 'Snorunt', 'Glalie', 'Froslass', 'Spheal', 'Sealeo', 'Walrein', 'Snover', 'Abomasnow', 'Glaceon', 'Sneasel', 'Weavile'],
    'Lyophilisation': ['Dewgong', 'Cloyster', 'Jynx', 'Lapras', 'Articuno', 'Regice', 'Snorunt', 'Glalie', 'Froslass', 'Spheal', 'Sealeo', 'Walrein', 'Snover', 'Abomasnow', 'Glaceon', 'Lanturn', 'Wingull', 'Pelipper', 'Mantine', 'Mantyke', 'Kyogre', 'Suicune'],

    // === COMBAT ===
    'Poing-Karaté': ['Mankey', 'Primeape', 'Machop', 'Machoke', 'Machamp', 'Hitmonlee', 'Hitmonchan', 'Hitmontop', 'Tyrogue', 'Makuhita', 'Hariyama', 'Meditite', 'Medicham', 'Riolu', 'Lucario', 'Combusken', 'Blaziken', 'Monferno', 'Infernape', 'Breloom', 'Croagunk', 'Toxicroak', 'Gallade'],
    'Casse-Brique': ['Mankey', 'Primeape', 'Machop', 'Machoke', 'Machamp', 'Hitmonlee', 'Hitmonchan', 'Hitmontop', 'Tyrogue', 'Makuhita', 'Hariyama', 'Meditite', 'Medicham', 'Riolu', 'Lucario', 'Combusken', 'Blaziken', 'Monferno', 'Infernape', 'Breloom', 'Croagunk', 'Toxicroak', 'Gallade', 'Nidoking', 'Nidoqueen', 'Kangaskhan', 'Rhyhorn', 'Rhydon', 'Rhyperior', 'Tyranitar'],
    'Close Combat': ['Mankey', 'Primeape', 'Machop', 'Machoke', 'Machamp', 'Hitmonlee', 'Hitmonchan', 'Hitmontop', 'Tyrogue', 'Makuhita', 'Hariyama', 'Meditite', 'Medicham', 'Riolu', 'Lucario', 'Combusken', 'Blaziken', 'Monferno', 'Infernape', 'Breloom', 'Heracross', 'Gallade', 'Staravia', 'Staraptor', 'Hariyama'],
    'Marto-Poing': ['Machop', 'Machoke', 'Machamp', 'Hitmonchan', 'Hitmontop', 'Tyrogue', 'Makuhita', 'Hariyama', 'Meditite', 'Medicham', 'Riolu', 'Lucario', 'Combusken', 'Blaziken', 'Magmar', 'Magmortar', 'Electabuzz', 'Electivire'],
    'Aurasphère': ['Riolu', 'Lucario', 'Meditite', 'Medicham', 'Togekiss', 'Mew', 'Mewtwo', 'Deoxys'],
    'Exploforce': ['Machop', 'Machoke', 'Machamp', 'Hitmonlee', 'Hitmonchan', 'Hitmontop', 'Meditite', 'Medicham', 'Riolu', 'Lucario', 'Combusken', 'Blaziken', 'Alakazam', 'Kadabra', 'Abra', 'Jynx', 'Smoochum', 'Mr. Mime', 'Mime Jr.', 'Girafarig', 'Gardevoir', 'Kirlia', 'Ralts', 'Espeon', 'Mewtwo', 'Mew', 'Deoxys', 'Gallade'],
    'Vampipoing': ['Machop', 'Machoke', 'Machamp', 'Hitmonchan', 'Hitmontop', 'Tyrogue', 'Makuhita', 'Hariyama', 'Meditite', 'Medicham', 'Riolu', 'Lucario', 'Combusken', 'Blaziken', 'Breloom', 'Croagunk', 'Toxicroak', 'Gallade'],
    'Onde Vide': ['Machop', 'Machoke', 'Machamp', 'Hitmonchan', 'Hitmontop', 'Meditite', 'Medicham', 'Riolu', 'Lucario', 'Combusken', 'Blaziken', 'Breloom', 'Gallade', 'Abra', 'Kadabra', 'Alakazam', 'Mewtwo', 'Mew'],

    // === POISON ===
    'Dard-Venin': ['Weedle', 'Kakuna', 'Beedrill', 'Nidoran♀', 'Nidorina', 'Nidoqueen', 'Nidoran♂', 'Nidorino', 'Nidoking', 'Zubat', 'Golbat', 'Crobat', 'Oddish', 'Gloom', 'Vileplume', 'Venonat', 'Venomoth', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tentacool', 'Tentacruel', 'Grimer', 'Muk', 'Gastly', 'Haunter', 'Gengar', 'Spinarak', 'Ariados', 'Crobat', 'Roselia', 'Budew', 'Roserade', 'Gulpin', 'Swalot', 'Seviper', 'Skorupi', 'Drapion', 'Croagunk', 'Toxicroak', 'Stunky', 'Skuntank', 'Qwilfish', 'Dustox', 'Beautifly', 'Wormadam'],
    'Bomb-Beurk': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Oddish', 'Gloom', 'Vileplume', 'Bellossom', 'Weedle', 'Kakuna', 'Beedrill', 'Zubat', 'Golbat', 'Crobat', 'Venonat', 'Venomoth', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tentacool', 'Tentacruel', 'Grimer', 'Muk', 'Gastly', 'Haunter', 'Gengar', 'Koffing', 'Weezing', 'Nidoran♀', 'Nidorina', 'Nidoqueen', 'Nidoran♂', 'Nidorino', 'Nidoking', 'Roselia', 'Budew', 'Roserade', 'Gulpin', 'Swalot', 'Seviper', 'Croagunk', 'Toxicroak', 'Stunky', 'Skuntank', 'Qwilfish', 'Dustox', 'Wormadam'],
    'Crochet Venin': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Weedle', 'Kakuna', 'Beedrill', 'Nidoran♀', 'Nidorina', 'Nidoqueen', 'Nidoran♂', 'Nidorino', 'Nidoking', 'Zubat', 'Golbat', 'Crobat', 'Oddish', 'Gloom', 'Vileplume', 'Venonat', 'Venomoth', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Grimer', 'Muk', 'Gastly', 'Haunter', 'Gengar', 'Spinarak', 'Ariados', 'Roselia', 'Budew', 'Roserade', 'Gulpin', 'Swalot', 'Seviper', 'Skorupi', 'Drapion', 'Croagunk', 'Toxicroak', 'Stunky', 'Skuntank'],
    'Direct Toxik': ['Nidoran♀', 'Nidorina', 'Nidoqueen', 'Nidoran♂', 'Nidorino', 'Nidoking', 'Zubat', 'Golbat', 'Crobat', 'Oddish', 'Gloom', 'Vileplume', 'Venonat', 'Venomoth', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tentacool', 'Tentacruel', 'Grimer', 'Muk', 'Koffing', 'Weezing', 'Gastly', 'Haunter', 'Gengar', 'Spinarak', 'Ariados', 'Roselia', 'Budew', 'Roserade', 'Gulpin', 'Swalot', 'Seviper', 'Skorupi', 'Drapion', 'Croagunk', 'Toxicroak', 'Stunky', 'Skuntank', 'Qwilfish', 'Dustox'],
    'Acidarmure': ['Grimer', 'Muk', 'Tentacool', 'Tentacruel', 'Koffing', 'Weezing', 'Gulpin', 'Swalot', 'Trubbish', 'Garbodor', 'Skrelp', 'Dragalge'],

    // === SOL ===
    'Séisme': ['Sandshrew', 'Sandslash', 'Nidoqueen', 'Nidoking', 'Diglett', 'Dugtrio', 'Geodude', 'Graveler', 'Golem', 'Onix', 'Steelix', 'Cubone', 'Marowak', 'Rhyhorn', 'Rhydon', 'Rhyperior', 'Groudon', 'Phanpy', 'Donphan', 'Trapinch', 'Vibrava', 'Flygon', 'Baltoy', 'Claydol', 'Hippopotas', 'Hippowdon', 'Gible', 'Gabite', 'Garchomp', 'Swinub', 'Piloswine', 'Mamoswine', 'Marshtomp', 'Swampert', 'Torterra', 'Regirock', 'Regigigas'],
    'Piétisol': ['Sandshrew', 'Sandslash', 'Nidoqueen', 'Nidoking', 'Diglett', 'Dugtrio', 'Geodude', 'Graveler', 'Golem', 'Onix', 'Cubone', 'Marowak', 'Rhyhorn', 'Rhydon', 'Rhyperior', 'Phanpy', 'Donphan', 'Trapinch', 'Vibrava', 'Flygon', 'Baltoy', 'Claydol', 'Hippopotas', 'Hippowdon', 'Gible', 'Gabite', 'Garchomp', 'Swinub', 'Piloswine', 'Mamoswine', 'Torterra', 'Marshtomp', 'Swampert'],
    'Tunnel': ['Sandshrew', 'Sandslash', 'Nidoqueen', 'Nidoking', 'Diglett', 'Dugtrio', 'Geodude', 'Graveler', 'Golem', 'Onix', 'Steelix', 'Cubone', 'Marowak', 'Rhyhorn', 'Rhydon', 'Rhyperior', 'Phanpy', 'Donphan', 'Trapinch', 'Vibrava', 'Flygon', 'Baltoy', 'Claydol', 'Hippopotas', 'Hippowdon', 'Gible', 'Gabite', 'Garchomp', 'Swinub', 'Piloswine', 'Mamoswine', 'Wooper', 'Quagsire', 'Barboach', 'Whiscash', 'Shellos', 'Gastrodon', 'Torterra', 'Marshtomp', 'Swampert', 'Groudon'],
    'Telluriforce': ['Nidoqueen', 'Nidoking', 'Geodude', 'Graveler', 'Golem', 'Onix', 'Rhyhorn', 'Rhydon', 'Rhyperior', 'Baltoy', 'Claydol', 'Trapinch', 'Vibrava', 'Flygon', 'Gible', 'Gabite', 'Garchomp', 'Groudon', 'Regirock'],
    'Tourbi-Sable': ['Sandshrew', 'Sandslash', 'Diglett', 'Dugtrio', 'Geodude', 'Graveler', 'Golem', 'Wooper', 'Quagsire', 'Barboach', 'Whiscash', 'Shellos', 'Gastrodon', 'Baltoy', 'Claydol', 'Hippopotas', 'Hippowdon', 'Trapinch', 'Vibrava', 'Flygon', 'Marshtomp', 'Swampert', 'Torterra'],

    // === VOL ===
    'Cru-Ailes': ['Pidgey', 'Pidgeotto', 'Pidgeot', 'Spearow', 'Fearow', 'Zubat', 'Golbat', 'Crobat', 'Farfetch\'d', 'Doduo', 'Dodrio', 'Scyther', 'Scizor', 'Aerodactyl', 'Articuno', 'Zapdos', 'Moltres', 'Dragonite', 'Hoothoot', 'Noctowl', 'Ledyba', 'Ledian', 'Natu', 'Xatu', 'Yanma', 'Yanmega', 'Murkrow', 'Honchkrow', 'Gligar', 'Gliscor', 'Skarmory', 'Taillow', 'Swellow', 'Wingull', 'Pelipper', 'Swablu', 'Altaria', 'Starly', 'Staravia', 'Staraptor', 'Combee', 'Vespiquen', 'Drifloon', 'Drifblim', 'Chatot', 'Togekiss', 'Rayquaza', 'Latias', 'Latios', 'Lugia', 'Ho-Oh'],
    'Aéropique': ['Pidgey', 'Pidgeotto', 'Pidgeot', 'Spearow', 'Fearow', 'Zubat', 'Golbat', 'Crobat', 'Farfetch\'d', 'Doduo', 'Dodrio', 'Scyther', 'Scizor', 'Aerodactyl', 'Articuno', 'Zapdos', 'Moltres', 'Dragonite', 'Hoothoot', 'Noctowl', 'Natu', 'Xatu', 'Yanma', 'Yanmega', 'Murkrow', 'Honchkrow', 'Gligar', 'Gliscor', 'Skarmory', 'Taillow', 'Swellow', 'Swablu', 'Altaria', 'Starly', 'Staravia', 'Staraptor', 'Scyther', 'Scizor', 'Ninjask', 'Rayquaza', 'Latias', 'Latios', 'Lugia', 'Ho-Oh'],
    'Rapace': ['Pidgey', 'Pidgeotto', 'Pidgeot', 'Spearow', 'Fearow', 'Zubat', 'Golbat', 'Crobat', 'Farfetch\'d', 'Doduo', 'Dodrio', 'Scyther', 'Scizor', 'Aerodactyl', 'Articuno', 'Zapdos', 'Moltres', 'Dragonite', 'Hoothoot', 'Noctowl', 'Murkrow', 'Honchkrow', 'Skarmory', 'Taillow', 'Swellow', 'Swablu', 'Altaria', 'Staravia', 'Staraptor', 'Drifloon', 'Drifblim', 'Rayquaza', 'Latias', 'Latios', 'Lugia', 'Ho-Oh'],
    'Vent Violent': ['Butterfree', 'Pidgeot', 'Zubat', 'Golbat', 'Crobat', 'Farfetch\'d', 'Scyther', 'Articuno', 'Zapdos', 'Moltres', 'Dragonite', 'Hoothoot', 'Noctowl', 'Natu', 'Xatu', 'Yanma', 'Yanmega', 'Murkrow', 'Honchkrow', 'Mantine', 'Mantyke', 'Skarmory', 'Taillow', 'Swellow', 'Wingull', 'Pelipper', 'Swablu', 'Altaria', 'Staravia', 'Staraptor', 'Tropius', 'Drifloon', 'Drifblim', 'Chatot', 'Togekiss', 'Rayquaza', 'Latias', 'Latios', 'Lugia', 'Ho-Oh'],
    'Lame d\'Air': ['Pidgey', 'Pidgeotto', 'Pidgeot', 'Spearow', 'Fearow', 'Zubat', 'Golbat', 'Crobat', 'Butterfree', 'Scyther', 'Charizard', 'Dragonite', 'Hoothoot', 'Noctowl', 'Natu', 'Xatu', 'Yanma', 'Yanmega', 'Murkrow', 'Honchkrow', 'Mantine', 'Mantyke', 'Skarmory', 'Taillow', 'Swellow', 'Wingull', 'Pelipper', 'Swablu', 'Altaria', 'Tropius', 'Drifloon', 'Drifblim', 'Togekiss', 'Rayquaza', 'Latias', 'Latios', 'Lugia'],

    // === PSY ===
    'Choc Mental': ['Abra', 'Kadabra', 'Alakazam', 'Slowpoke', 'Slowbro', 'Slowking', 'Drowzee', 'Hypno', 'Exeggcute', 'Exeggutor', 'Starmie', 'Mr. Mime', 'Mime Jr.', 'Jynx', 'Smoochum', 'Mewtwo', 'Mew', 'Natu', 'Xatu', 'Espeon', 'Girafarig', 'Ralts', 'Kirlia', 'Gardevoir', 'Wobbuffet', 'Wynaut', 'Spoink', 'Grumpig', 'Chimecho', 'Chingling', 'Bronzor', 'Bronzong', 'Unown', 'Uxie', 'Mesprit', 'Azelf', 'Cresselia', 'Jirachi', 'Deoxys'],
    'Psyko': ['Abra', 'Kadabra', 'Alakazam', 'Slowpoke', 'Slowbro', 'Slowking', 'Drowzee', 'Hypno', 'Exeggcute', 'Exeggutor', 'Starmie', 'Mr. Mime', 'Mime Jr.', 'Jynx', 'Smoochum', 'Mewtwo', 'Mew', 'Natu', 'Xatu', 'Espeon', 'Girafarig', 'Ralts', 'Kirlia', 'Gardevoir', 'Wobbuffet', 'Wynaut', 'Spoink', 'Grumpig', 'Chimecho', 'Chingling', 'Bronzor', 'Bronzong', 'Uxie', 'Mesprit', 'Azelf', 'Cresselia', 'Jirachi', 'Deoxys', 'Gallade'],
    'Psyko-Boost': ['Deoxys'],
    'Coupe Psycho': ['Abra', 'Kadabra', 'Alakazam', 'Slowbro', 'Slowking', 'Exeggutor', 'Starmie', 'Mr. Mime', 'Mime Jr.', 'Jynx', 'Mewtwo', 'Mew', 'Natu', 'Xatu', 'Espeon', 'Ralts', 'Kirlia', 'Gardevoir', 'Gallade', 'Spoink', 'Grumpig', 'Bronzor', 'Bronzong', 'Cresselia', 'Jirachi', 'Deoxys'],
    'Zen Headbutt': ['Slowpoke', 'Slowbro', 'Slowking', 'Exeggcute', 'Exeggutor', 'Drowzee', 'Hypno', 'Lickitung', 'Lickilicky', 'Chansey', 'Blissey', 'Snorlax', 'Mew', 'Mewtwo', 'Girafarig', 'Ralts', 'Kirlia', 'Gardevoir', 'Meditite', 'Medicham', 'Beldum', 'Metang', 'Metagross', 'Chimecho', 'Bronzor', 'Bronzong', 'Riolu', 'Lucario', 'Gallade', 'Uxie', 'Mesprit', 'Azelf', 'Cresselia', 'Jirachi', 'Deoxys'],
    'Choc Psy': ['Abra', 'Kadabra', 'Alakazam', 'Slowpoke', 'Slowbro', 'Slowking', 'Drowzee', 'Hypno', 'Exeggcute', 'Exeggutor', 'Starmie', 'Mr. Mime', 'Mime Jr.', 'Jynx', 'Smoochum', 'Mewtwo', 'Mew', 'Natu', 'Xatu', 'Espeon', 'Girafarig', 'Ralts', 'Kirlia', 'Gardevoir', 'Spoink', 'Grumpig', 'Chimecho', 'Chingling', 'Bronzor', 'Bronzong', 'Uxie', 'Mesprit', 'Azelf', 'Cresselia', 'Jirachi', 'Deoxys', 'Gallade'],
    'Extrasenseur': ['Abra', 'Kadabra', 'Alakazam', 'Slowpoke', 'Slowbro', 'Slowking', 'Drowzee', 'Hypno', 'Exeggcute', 'Exeggutor', 'Starmie', 'Mr. Mime', 'Mime Jr.', 'Jynx', 'Smoochum', 'Mewtwo', 'Mew', 'Natu', 'Xatu', 'Espeon', 'Girafarig', 'Ralts', 'Kirlia', 'Gardevoir', 'Wobbuffet', 'Wynaut', 'Spoink', 'Grumpig', 'Chimecho', 'Chingling', 'Bronzor', 'Bronzong', 'Uxie', 'Mesprit', 'Azelf', 'Cresselia', 'Jirachi', 'Deoxys', 'Gallade'],

    // === INSECTE ===
    'Dard-Nuée': ['Caterpie', 'Metapod', 'Butterfree', 'Weedle', 'Kakuna', 'Beedrill', 'Paras', 'Parasect', 'Venonat', 'Venomoth', 'Scyther', 'Scizor', 'Pinsir', 'Ledyba', 'Ledian', 'Spinarak', 'Ariados', 'Yanma', 'Yanmega', 'Pineco', 'Forretress', 'Heracross', 'Wurmple', 'Silcoon', 'Beautifly', 'Cascoon', 'Dustox', 'Kricketot', 'Kricketune', 'Combee', 'Vespiquen', 'Surskit', 'Masquerain', 'Nincada', 'Ninjask', 'Shedinja', 'Burmy', 'Wormadam', 'Mothim', 'Scizor'],
    'Plaie-Croix': ['Paras', 'Parasect', 'Venonat', 'Venomoth', 'Scyther', 'Scizor', 'Pinsir', 'Ledyba', 'Ledian', 'Spinarak', 'Ariados', 'Heracross', 'Beautifly', 'Dustox', 'Masquerain', 'Ninjask', 'Shedinja', 'Vespiquen', 'Kricketune', 'Wormadam', 'Mothim'],
    'Mégacorne': ['Beedrill', 'Parasect', 'Venomoth', 'Pinsir', 'Heracross', 'Scyther', 'Scizor', 'Ledyba', 'Ledian', 'Spinarak', 'Ariados', 'Yanma', 'Yanmega', 'Forretress', 'Kricketune', 'Vespiquen'],
    'Bourdon': ['Butterfree', 'Beedrill', 'Venonat', 'Venomoth', 'Paras', 'Parasect', 'Scyther', 'Ledyba', 'Ledian', 'Spinarak', 'Ariados', 'Yanma', 'Yanmega', 'Pineco', 'Forretress', 'Heracross', 'Beautifly', 'Dustox', 'Masquerain', 'Kricketot', 'Kricketune', 'Combee', 'Vespiquen', 'Burmy', 'Wormadam', 'Mothim'],
    'Rayon Signal': ['Butterfree', 'Venonat', 'Venomoth', 'Paras', 'Parasect', 'Ledyba', 'Ledian', 'Spinarak', 'Ariados', 'Yanma', 'Yanmega', 'Illumise', 'Volbeat', 'Combee', 'Vespiquen', 'Kricketot', 'Kricketune'],

    // === ROCHE ===
    'Jet-Pierres': ['Geodude', 'Graveler', 'Golem', 'Onix', 'Steelix', 'Rhyhorn', 'Rhydon', 'Rhyperior', 'Omanyte', 'Omastar', 'Kabuto', 'Kabutops', 'Aerodactyl', 'Sudowoodo', 'Bonsly', 'Shuckle', 'Nosepass', 'Probopass', 'Lunatone', 'Solrock', 'Lileep', 'Cradily', 'Anorith', 'Armaldo', 'Cranidos', 'Rampardos', 'Shieldon', 'Bastiodon', 'Larvitar', 'Pupitar', 'Tyranitar', 'Regirock'],
    'Éboulement': ['Geodude', 'Graveler', 'Golem', 'Onix', 'Steelix', 'Rhyhorn', 'Rhydon', 'Rhyperior', 'Omanyte', 'Omastar', 'Kabuto', 'Kabutops', 'Aerodactyl', 'Sudowoodo', 'Bonsly', 'Shuckle', 'Nosepass', 'Probopass', 'Lunatone', 'Solrock', 'Lileep', 'Cradily', 'Anorith', 'Armaldo', 'Cranidos', 'Rampardos', 'Shieldon', 'Bastiodon', 'Larvitar', 'Pupitar', 'Tyranitar', 'Regirock', 'Groudon'],
    'Lame de Roc': ['Geodude', 'Graveler', 'Golem', 'Onix', 'Steelix', 'Rhyhorn', 'Rhydon', 'Rhyperior', 'Omanyte', 'Omastar', 'Kabuto', 'Kabutops', 'Aerodactyl', 'Sudowoodo', 'Bonsly', 'Nosepass', 'Probopass', 'Lunatone', 'Solrock', 'Lileep', 'Cradily', 'Anorith', 'Armaldo', 'Cranidos', 'Rampardos', 'Shieldon', 'Bastiodon', 'Larvitar', 'Pupitar', 'Tyranitar', 'Regirock'],
    'Pouvoir Antique': ['Geodude', 'Graveler', 'Golem', 'Onix', 'Rhyhorn', 'Rhydon', 'Rhyperior', 'Omanyte', 'Omastar', 'Kabuto', 'Kabutops', 'Aerodactyl', 'Lunatone', 'Solrock', 'Lileep', 'Cradily', 'Anorith', 'Armaldo', 'Baltoy', 'Claydol', 'Cranidos', 'Rampardos', 'Shieldon', 'Bastiodon', 'Regirock'],
    'Gemme Lumière': ['Geodude', 'Graveler', 'Golem', 'Onix', 'Rhyhorn', 'Rhydon', 'Omanyte', 'Omastar', 'Kabuto', 'Kabutops', 'Aerodactyl', 'Nosepass', 'Probopass', 'Lunatone', 'Solrock', 'Lileep', 'Cradily', 'Anorith', 'Armaldo', 'Cranidos', 'Rampardos', 'Shieldon', 'Bastiodon', 'Relicanth', 'Regirock'],

    // === SPECTRE ===
    'Léchouille': ['Gastly', 'Haunter', 'Gengar', 'Lickitung', 'Lickilicky', 'Duskull', 'Dusclops', 'Dusknoir'],
    'Griffe Ombre': ['Gastly', 'Haunter', 'Gengar', 'Misdreavus', 'Mismagius', 'Shuppet', 'Banette', 'Duskull', 'Dusclops', 'Dusknoir', 'Drifloon', 'Drifblim', 'Spiritomb', 'Sableye', 'Shedinja', 'Darkrai'],
    'Ball\'Ombre': ['Gastly', 'Haunter', 'Gengar', 'Misdreavus', 'Mismagius', 'Shuppet', 'Banette', 'Duskull', 'Dusclops', 'Dusknoir', 'Drifloon', 'Drifblim', 'Spiritomb', 'Sableye', 'Chimecho', 'Chingling', 'Rotom', 'Uxie', 'Mesprit', 'Azelf', 'Cresselia', 'Darkrai'],
    'Châtiment': ['Gastly', 'Haunter', 'Gengar', 'Misdreavus', 'Mismagius', 'Shuppet', 'Banette', 'Duskull', 'Dusclops', 'Dusknoir', 'Sableye', 'Spiritomb'],
    'Revenant': ['Gastly', 'Haunter', 'Gengar', 'Misdreavus', 'Mismagius', 'Shuppet', 'Banette', 'Duskull', 'Dusclops', 'Dusknoir', 'Drifloon', 'Drifblim', 'Spiritomb', 'Sableye', 'Darkrai'],
    'Ombre Portée': ['Gastly', 'Haunter', 'Gengar', 'Misdreavus', 'Mismagius', 'Shuppet', 'Banette', 'Duskull', 'Dusclops', 'Dusknoir', 'Shedinja', 'Spiritomb', 'Froslass'],

    // === DRAGON ===
    'Draco-Rage': ['Dratini', 'Dragonair', 'Dragonite', 'Horsea', 'Seadra', 'Kingdra', 'Gible', 'Gabite', 'Garchomp', 'Bagon', 'Shelgon', 'Salamence', 'Altaria', 'Swablu', 'Vibrava', 'Flygon', 'Rayquaza', 'Latias', 'Latios', 'Dialga', 'Palkia', 'Giratina'],
    'Dracogriffe': ['Dragonite', 'Kingdra', 'Gible', 'Gabite', 'Garchomp', 'Bagon', 'Shelgon', 'Salamence', 'Altaria', 'Swablu', 'Vibrava', 'Flygon', 'Rayquaza', 'Latias', 'Latios', 'Dialga', 'Palkia', 'Giratina'],
    'Colère': ['Dratini', 'Dragonair', 'Dragonite', 'Kingdra', 'Gible', 'Gabite', 'Garchomp', 'Bagon', 'Shelgon', 'Salamence', 'Altaria', 'Vibrava', 'Flygon', 'Rayquaza', 'Latias', 'Latios', 'Dialga', 'Palkia', 'Giratina'],
    'Draco-Météor': ['Dragonite', 'Kingdra', 'Salamence', 'Altaria', 'Flygon', 'Garchomp', 'Rayquaza', 'Latias', 'Latios', 'Dialga', 'Palkia', 'Giratina'],
    'Draco-Choc': ['Dratini', 'Dragonair', 'Dragonite', 'Horsea', 'Seadra', 'Kingdra', 'Gible', 'Gabite', 'Garchomp', 'Bagon', 'Shelgon', 'Salamence', 'Altaria', 'Swablu', 'Vibrava', 'Flygon', 'Rayquaza', 'Latias', 'Latios', 'Dialga', 'Palkia', 'Giratina'],

    // === TÉNÈBRES ===
    'Morsure': ['Rattata', 'Raticate', 'Zubat', 'Golbat', 'Crobat', 'Meowth', 'Persian', 'Growlithe', 'Arcanine', 'Tentacool', 'Tentacruel', 'Gyarados', 'Eevee', 'Umbreon', 'Hoothoot', 'Noctowl', 'Murkrow', 'Honchkrow', 'Poochyena', 'Mightyena', 'Sneasel', 'Weavile', 'Houndour', 'Houndoom', 'Tyranitar', 'Sableye', 'Carvanha', 'Sharpedo', 'Stunky', 'Skuntank', 'Skorupi', 'Drapion', 'Spiritomb', 'Darkrai'],
    'Tranche-Nuit': ['Rattata', 'Raticate', 'Zubat', 'Golbat', 'Crobat', 'Persian', 'Umbreon', 'Murkrow', 'Honchkrow', 'Poochyena', 'Mightyena', 'Sneasel', 'Weavile', 'Houndour', 'Houndoom', 'Tyranitar', 'Sableye', 'Carvanha', 'Sharpedo', 'Absol', 'Stunky', 'Skuntank', 'Skorupi', 'Drapion', 'Spiritomb', 'Darkrai'],
    'Mâchouille': ['Rattata', 'Raticate', 'Persian', 'Gyarados', 'Umbreon', 'Murkrow', 'Honchkrow', 'Poochyena', 'Mightyena', 'Sneasel', 'Weavile', 'Houndour', 'Houndoom', 'Tyranitar', 'Sableye', 'Carvanha', 'Sharpedo', 'Absol', 'Stunky', 'Skuntank', 'Skorupi', 'Drapion', 'Spiritomb', 'Darkrai'],
    'Vibrobscur': ['Rattata', 'Raticate', 'Meowth', 'Persian', 'Gastly', 'Haunter', 'Gengar', 'Umbreon', 'Murkrow', 'Honchkrow', 'Misdreavus', 'Mismagius', 'Sneasel', 'Weavile', 'Houndour', 'Houndoom', 'Tyranitar', 'Sableye', 'Carvanha', 'Sharpedo', 'Absol', 'Crawdaunt', 'Stunky', 'Skuntank', 'Skorupi', 'Drapion', 'Spiritomb', 'Darkrai'],
    'Dark Pulse': ['Rattata', 'Raticate', 'Meowth', 'Persian', 'Gastly', 'Haunter', 'Gengar', 'Umbreon', 'Murkrow', 'Honchkrow', 'Misdreavus', 'Mismagius', 'Sneasel', 'Weavile', 'Houndour', 'Houndoom', 'Tyranitar', 'Sableye', 'Carvanha', 'Sharpedo', 'Absol', 'Crawdaunt', 'Stunky', 'Skuntank', 'Skorupi', 'Drapion', 'Spiritomb', 'Darkrai'],
    'Sabotage': ['Rattata', 'Raticate', 'Meowth', 'Persian', 'Gastly', 'Haunter', 'Gengar', 'Umbreon', 'Murkrow', 'Honchkrow', 'Sneasel', 'Weavile', 'Houndour', 'Houndoom', 'Tyranitar', 'Sableye', 'Carvanha', 'Sharpedo', 'Absol', 'Stunky', 'Skuntank', 'Skorupi', 'Drapion', 'Spiritomb', 'Darkrai'],

    // === ACIER ===
    'Griffe Acier': ['Geodude', 'Graveler', 'Golem', 'Onix', 'Steelix', 'Magnemite', 'Magneton', 'Magnezone', 'Aron', 'Lairon', 'Aggron', 'Beldum', 'Metang', 'Metagross', 'Nosepass', 'Probopass', 'Bronzor', 'Bronzong', 'Riolu', 'Lucario', 'Scizor', 'Mawile', 'Skarmory', 'Registeel', 'Dialga', 'Jirachi'],
    'Queue de Fer': ['Geodude', 'Graveler', 'Golem', 'Onix', 'Steelix', 'Rhyhorn', 'Rhydon', 'Rhyperior', 'Magnemite', 'Magneton', 'Magnezone', 'Aron', 'Lairon', 'Aggron', 'Beldum', 'Metang', 'Metagross', 'Nosepass', 'Probopass', 'Bronzor', 'Bronzong', 'Lucario', 'Scizor', 'Mawile', 'Skarmory', 'Forretress', 'Registeel', 'Dialga', 'Jirachi'],
    'Poing Météor': ['Magnemite', 'Magneton', 'Magnezone', 'Aron', 'Lairon', 'Aggron', 'Beldum', 'Metang', 'Metagross', 'Nosepass', 'Probopass', 'Bronzor', 'Bronzong', 'Riolu', 'Lucario', 'Mawile', 'Registeel', 'Dialga', 'Jirachi'],
    'Luminocanon': ['Magnemite', 'Magneton', 'Magnezone', 'Aron', 'Lairon', 'Aggron', 'Beldum', 'Metang', 'Metagross', 'Nosepass', 'Probopass', 'Bronzor', 'Bronzong', 'Empoleon', 'Scizor', 'Forretress', 'Registeel', 'Dialga', 'Jirachi', 'Heatran'],
    'Gyro Ball': ['Geodude', 'Graveler', 'Golem', 'Onix', 'Steelix', 'Magnemite', 'Magneton', 'Magnezone', 'Aron', 'Lairon', 'Aggron', 'Beldum', 'Metang', 'Metagross', 'Nosepass', 'Probopass', 'Bronzor', 'Bronzong', 'Forretress', 'Pineco', 'Registeel', 'Dialga', 'Jirachi'],

    // === FÉE ===
    'Éclat Magique': ['Clefairy', 'Clefable', 'Cleffa', 'Jigglypuff', 'Wigglytuff', 'Igglybuff', 'Togepi', 'Togetic', 'Togekiss', 'Marill', 'Azumarill', 'Azurill', 'Snubbull', 'Granbull', 'Mime Jr.', 'Mr. Mime', 'Ralts', 'Kirlia', 'Gardevoir', 'Mawile', 'Mime Jr.', 'Cresselia', 'Mesprit', 'Uxie', 'Azelf', 'Jirachi', 'Mew', 'Celebi', 'Shaymin'],
    'Pouvoir Lunaire': ['Clefairy', 'Clefable', 'Cleffa', 'Jigglypuff', 'Wigglytuff', 'Igglybuff', 'Togepi', 'Togetic', 'Togekiss', 'Marill', 'Azumarill', 'Azurill', 'Snubbull', 'Granbull', 'Mr. Mime', 'Mime Jr.', 'Ralts', 'Kirlia', 'Gardevoir', 'Mawile', 'Sylveon', 'Cresselia', 'Jirachi', 'Mew', 'Celebi', 'Shaymin'],
    'Câlinerie': ['Clefairy', 'Clefable', 'Cleffa', 'Jigglypuff', 'Wigglytuff', 'Igglybuff', 'Togepi', 'Togetic', 'Togekiss', 'Snubbull', 'Granbull', 'Marill', 'Azumarill', 'Azurill', 'Mr. Mime', 'Mime Jr.', 'Ralts', 'Kirlia', 'Gardevoir', 'Mawile', 'Chansey', 'Blissey', 'Happiny', 'Cresselia', 'Jirachi', 'Mew'],
    'Doux Baiser': ['Clefairy', 'Clefable', 'Cleffa', 'Jigglypuff', 'Wigglytuff', 'Igglybuff', 'Togepi', 'Togetic', 'Togekiss', 'Snubbull', 'Granbull', 'Marill', 'Azumarill', 'Azurill', 'Mr. Mime', 'Mime Jr.', 'Ralts', 'Kirlia', 'Gardevoir', 'Chansey', 'Blissey', 'Happiny', 'Smoochum', 'Jynx', 'Cresselia', 'Mew']
};

// 4. Attribution des attaques par défaut aux Pokémon
// Chaque Pokémon peut avoir une attaque fixe (string) ou plusieurs possibilités (array), choisie à la création
const POKEMON_DEFAULT_MOVES = {
    // === GEN 1 - KANTO ===
    // Starters Plante
    'Bulbasaur': ['Fouet Lianes', 'Méga-Sangsue'],
    'Ivysaur': ['Tranch\'Herbe', 'Lame-Feuille', 'Méga-Sangsue'],
    'Venusaur': 'Éco-Sphère',          // Grass Special (SP.ATK élevé)

    // Starters Feu
    'Charmander': ['Flammèche', 'Roue de Feu'],
    'Charmeleon': ['Lance-Flammes', 'Poing de Feu'],
    'Charizard': ['Lance-Flammes', 'Boutefeu', 'Canicule'],  // Fire (SP.ATK ou ATK)

    // Starters Eau
    'Squirtle': ['Pistolet à O', 'Bulles d\'O'],
    'Wartortle': ['Surf', 'Cascade', 'Bulles d\'O'],
    'Blastoise': ['Hydrocanon', 'Surf', 'Cascade'],

    // Insectes de début
    'Caterpie': 'Charge',              // Normal Physical
    'Metapod': 'Charge',
    'Butterfree': 'Choc Mental',       // Psychic Special (SP.ATK élevé)
    'Weedle': 'Dard-Venin',            // Poison Physical
    'Kakuna': 'Dard-Venin',
    'Beedrill': 'Dard-Nuée',           // Bug Physical (ATK élevé)

    // Oiseaux
    'Pidgey': 'Cru-Ailes',             // Flying Physical
    'Pidgeotto': 'Cru-Ailes',
    'Pidgeot': 'Rapace',               // Flying Physical (ATK élevé)
    'Spearow': 'Cru-Ailes',
    'Fearow': 'Rapace',

    // Rongeurs
    'Rattata': 'Charge',               // Normal Physical
    'Raticate': 'Plaquage',

    // Serpents Poison
    'Ekans': 'Crochet Venin',          // Poison Physical
    'Arbok': 'Direct Toxik',

    // Ligne Pikachu
    'Pichu': ['Éclair', 'Vive-Attaque'],
    'Pikachu': ['Éclair', 'Tonnerre', 'Vive-Attaque', 'Éclair Fou'],
    'Raichu': ['Tonnerre', 'Fatal-Foudre', 'Éclair Fou'],

    // Sol
    'Sandshrew': 'Piétisol',           // Ground Physical
    'Sandslash': 'Séisme',
    'Diglett': 'Piétisol',
    'Dugtrio': 'Séisme',

    // Nidoran
    'Nidoran♀': 'Crochet Venin',
    'Nidorina': 'Direct Toxik',
    'Nidoqueen': 'Séisme',             // Ground Physical (ATK élevé)
    'Nidoran♂': 'Crochet Venin',
    'Nidorino': 'Direct Toxik',
    'Nidoking': 'Séisme',

    // Fée
    'Clefairy': 'Éclat Magique',       // Fairy Special (SP.ATK dominant)
    'Clefable': 'Pouvoir Lunaire',
    'Cleffa': 'Éclat Magique',
    'Jigglypuff': 'Éclat Magique',
    'Wigglytuff': 'Pouvoir Lunaire',
    'Igglybuff': 'Éclat Magique',

    // Renards Feu
    'Vulpix': 'Flammèche',
    'Ninetales': 'Lance-Flammes',

    // Chauves-souris
    'Zubat': 'Cru-Ailes',
    'Golbat': 'Cru-Ailes',
    'Crobat': 'Rapace',

    // Plantes Poison
    'Oddish': 'Méga-Sangsue',          // Grass Special
    'Gloom': 'Méga-Sangsue',
    'Vileplume': 'Éco-Sphère',
    'Bellossom': 'Éco-Sphère',

    // Insectes
    'Paras': 'Plaie-Croix',            // Bug Physical
    'Parasect': 'Plaie-Croix',
    'Venonat': 'Choc Mental',          // Psychic Special (Sp.ATK dominant)
    'Venomoth': 'Bourdon',             // Bug Special

    // Chats
    'Meowth': 'Griffe',                // Normal Physical
    'Persian': 'Tranche',

    // Canards
    'Psyduck': 'Choc Mental',          // Psychic Special (SP.ATK élevé)
    'Golduck': 'Psyko',

    // Singes Combat
    'Mankey': 'Poing-Karaté',          // Fighting Physical
    'Primeape': 'Close Combat',

    // Chiens Feu
    'Growlithe': 'Flammèche',
    'Arcanine': 'Boutefeu',            // Fire Physical (ATK élevé)

    // Grenouilles
    'Poliwag': 'Pistolet à O',
    'Poliwhirl': 'Surf',
    'Poliwrath': 'Cascade',            // Water Physical (ATK élevé)
    'Politoed': 'Surf',

    // Psy
    'Abra': 'Choc Mental',
    'Kadabra': 'Psyko',
    'Alakazam': 'Psyko',               // Psychic Special (SP.ATK très élevé)

    // Combat
    'Machop': 'Poing-Karaté',
    'Machoke': 'Casse-Brique',
    'Machamp': 'Close Combat',

    // Plantes Poison
    'Bellsprout': 'Fouet Lianes',
    'Weepinbell': 'Tranch\'Herbe',
    'Victreebel': 'Lame-Feuille',

    // Méduses
    'Tentacool': 'Surf',
    'Tentacruel': 'Surf',

    // Roches
    'Geodude': 'Jet-Pierres',
    'Graveler': 'Éboulement',
    'Golem': 'Séisme',

    // Chevaux Feu
    'Ponyta': 'Roue de Feu',
    'Rapidash': 'Boutefeu',

    // Slowpoke
    'Slowpoke': 'Surf',
    'Slowbro': 'Psyko',
    'Slowking': 'Psyko',

    // Magnétiques
    'Magnemite': 'Éclair',
    'Magneton': 'Tonnerre',
    'Magnezone': 'Tonnerre',

    // Oiseaux
    'Farfetch\'d': 'Cru-Ailes',
    'Doduo': 'Cru-Ailes',
    'Dodrio': 'Rapace',

    // Phoques
    'Seel': 'Surf',
    'Dewgong': 'Laser Glace',

    // Slimes
    'Grimer': 'Bomb-Beurk',
    'Muk': 'Bomb-Beurk',

    // Coquillages
    'Shellder': 'Cascade',
    'Cloyster': 'Laser Glace',

    // Spectres
    'Gastly': 'Ball\'Ombre',           // Ghost Special (SP.ATK dominant)
    'Haunter': 'Ball\'Ombre',
    'Gengar': 'Ball\'Ombre',

    // Serpent Roche
    'Onix': 'Jet-Pierres',
    'Steelix': 'Queue de Fer',

    // Psy
    'Drowzee': 'Choc Mental',
    'Hypno': 'Psyko',

    // Crabes
    'Krabby': 'Pince-Masse',           // Water Physical (ATK très élevé)
    'Kingler': 'Pince-Masse',

    // Électriques
    'Voltorb': 'Éclair',
    'Electrode': 'Tonnerre',

    // Œufs Plante
    'Exeggcute': 'Choc Mental',
    'Exeggutor': 'Psyko',

    // Osseux
    'Cubone': 'Piétisol',
    'Marowak': 'Séisme',

    // Combat
    'Hitmonlee': 'Close Combat',
    'Hitmonchan': 'Marto-Poing',
    'Hitmontop': 'Close Combat',
    'Tyrogue': 'Poing-Karaté',

    // Langue
    'Lickitung': 'Plaquage',
    'Lickilicky': 'Plaquage',

    // Poison Gaz
    'Koffing': 'Bomb-Beurk',
    'Weezing': 'Bomb-Beurk',

    // Rhino
    'Rhyhorn': 'Jet-Pierres',
    'Rhydon': 'Séisme',
    'Rhyperior': 'Séisme',

    // Rose
    'Chansey': 'Plaquage',
    'Blissey': 'Plaquage',
    'Happiny': 'Plaquage',

    // Plante
    'Tangela': 'Lame-Feuille',
    'Tangrowth': 'Lame-Feuille',

    // Kangourou
    'Kangaskhan': 'Plaquage',

    // Hippocampes
    'Horsea': 'Surf',
    'Seadra': 'Surf',
    'Kingdra': 'Draco-Choc',           // Dragon Special

    // Poissons
    'Goldeen': 'Cascade',
    'Seaking': 'Cascade',

    // Étoiles
    'Staryu': 'Surf',
    'Starmie': 'Psyko',

    // Mime
    'Mr. Mime': 'Psyko',
    'Mime Jr.': 'Choc Mental',

    // Mante
    'Scyther': 'Plaie-Croix',          // Bug Physical (ATK très élevé)
    'Scizor': 'Plaie-Croix',

    // Humanoïdes
    'Jynx': 'Psyko',
    'Smoochum': 'Choc Mental',

    // Électriques
    'Electabuzz': 'Poing Éclair',      // Electric Physical (ATK et SP.ATK proches)
    'Elekid': 'Éclair',
    'Electivire': 'Éclair Fou',

    // Feu
    'Magmar': 'Lance-Flammes',
    'Magby': 'Flammèche',
    'Magmortar': 'Lance-Flammes',

    // Insecte
    'Pinsir': 'Mégacorne',

    // Taureau
    'Tauros': 'Plaquage',

    // Poisson
    'Magikarp': 'Charge',
    'Gyarados': 'Cascade',             // Water Physical (ATK très élevé)

    // Glace
    'Lapras': 'Laser Glace',           // Ice Special (SP.ATK élevé)

    // Métamorphe
    'Ditto': 'Charge',

    // Évoli et évolutions
    'Eevee': 'Charge',
    'Vaporeon': 'Surf',                // Water Special (SP.ATK élevé)
    'Jolteon': 'Tonnerre',             // Electric Special
    'Flareon': 'Boutefeu',             // Fire Physical (ATK élevé)
    'Espeon': 'Psyko',                 // Psychic Special
    'Umbreon': 'Morsure',              // Dark Physical (DEF orienté mais Dark)
    'Leafeon': 'Lame-Feuille',         // Grass Physical (ATK élevé)
    'Glaceon': 'Laser Glace',          // Ice Special (SP.ATK élevé)

    // Virtuel
    'Porygon': 'Météores',
    'Porygon2': 'Météores',
    'Porygon-Z': 'Ultralaser',

    // Fossiles
    'Omanyte': 'Surf',
    'Omastar': 'Surf',
    'Kabuto': 'Cascade',
    'Kabutops': 'Cascade',
    'Aerodactyl': 'Lame de Roc',

    // Dormeur
    'Snorlax': 'Plaquage',
    'Munchlax': 'Plaquage',

    // Légendaires Oiseaux
    'Articuno': 'Blizzard',            // Ice Special
    'Zapdos': 'Fatal-Foudre',          // Electric Special
    'Moltres': 'Déflagration',         // Fire Special

    // Dragons
    'Dratini': 'Draco-Choc',
    'Dragonair': 'Draco-Choc',
    'Dragonite': 'Colère',             // Dragon Physical (ATK très élevé)

    // Légendaires Psy
    'Mewtwo': 'Psyko',
    'Mew': 'Psyko',

    // === GEN 2 - JOHTO ===
    'Chikorita': 'Fouet Lianes',
    'Bayleef': 'Tranch\'Herbe',
    'Meganium': 'Éco-Sphère',

    'Cyndaquil': 'Flammèche',
    'Quilava': 'Lance-Flammes',
    'Typhlosion': 'Lance-Flammes',

    'Totodile': 'Pistolet à O',
    'Croconaw': 'Cascade',
    'Feraligatr': 'Cascade',           // Water Physical (ATK élevé)

    'Sentret': 'Charge',
    'Furret': 'Plaquage',

    'Hoothoot': 'Cru-Ailes',
    'Noctowl': 'Lame d\'Air',

    'Ledyba': 'Dard-Nuée',
    'Ledian': 'Dard-Nuée',

    'Spinarak': 'Dard-Nuée',
    'Ariados': 'Plaie-Croix',

    'Chinchou': 'Éclair',
    'Lanturn': 'Tonnerre',

    'Togepi': 'Éclat Magique',
    'Togetic': 'Éclat Magique',
    'Togekiss': 'Pouvoir Lunaire',

    'Natu': 'Choc Mental',
    'Xatu': 'Psyko',

    'Mareep': 'Éclair',
    'Flaaffy': 'Éclair',
    'Ampharos': 'Tonnerre',

    'Marill': 'Cascade',
    'Azumarill': 'Cascade',
    'Azurill': 'Charge',

    'Sudowoodo': 'Jet-Pierres',
    'Bonsly': 'Jet-Pierres',

    'Hoppip': 'Méga-Sangsue',
    'Skiploom': 'Méga-Sangsue',
    'Jumpluff': 'Méga-Sangsue',

    'Aipom': 'Tranche',
    'Ambipom': 'Tranche',

    'Sunkern': 'Méga-Sangsue',
    'Sunflora': 'Éco-Sphère',

    'Yanma': 'Lame d\'Air',
    'Yanmega': 'Bourdon',

    'Wooper': 'Piétisol',
    'Quagsire': 'Séisme',

    'Murkrow': 'Morsure',
    'Honchkrow': 'Tranche-Nuit',

    'Misdreavus': 'Ball\'Ombre',
    'Mismagius': 'Ball\'Ombre',

    'Unown': 'Choc Mental',

    'Wobbuffet': 'Charge',
    'Wynaut': 'Charge',

    'Girafarig': 'Psyko',

    'Pineco': 'Plaie-Croix',
    'Forretress': 'Gyro Ball',

    'Dunsparce': 'Plaquage',

    'Gligar': 'Séisme',
    'Gliscor': 'Séisme',

    'Snubbull': 'Câlinerie',
    'Granbull': 'Câlinerie',

    'Qwilfish': 'Direct Toxik',

    'Shuckle': 'Jet-Pierres',

    'Heracross': 'Mégacorne',

    'Sneasel': 'Tranche-Nuit',
    'Weavile': 'Tranche-Nuit',

    'Teddiursa': 'Tranche',
    'Ursaring': 'Close Combat',

    'Slugma': 'Flammèche',
    'Magcargo': 'Lance-Flammes',

    'Swinub': 'Piétisol',
    'Piloswine': 'Séisme',
    'Mamoswine': 'Séisme',

    'Corsola': 'Pouvoir Antique',

    'Remoraid': 'Pistolet à O',
    'Octillery': 'Surf',

    'Delibird': 'Poudreuse',

    'Mantine': 'Surf',
    'Mantyke': 'Surf',

    'Skarmory': 'Griffe Acier',

    'Houndour': 'Flammèche',
    'Houndoom': 'Lance-Flammes',

    'Phanpy': 'Piétisol',
    'Donphan': 'Séisme',

    'Stantler': 'Zen Headbutt',

    'Smeargle': 'Charge',

    'Miltank': 'Plaquage',

    'Larvitar': 'Jet-Pierres',
    'Pupitar': 'Éboulement',
    'Tyranitar': 'Lame de Roc',

    // Légendaires Gen 2
    'Raikou': 'Tonnerre',
    'Entei': 'Lance-Flammes',
    'Suicune': 'Surf',
    'Lugia': 'Psyko',
    'Ho-Oh': 'Déflagration',
    'Celebi': 'Éco-Sphère',

    // === GEN 3 - HOENN ===
    'Treecko': 'Fouet Lianes',
    'Grovyle': 'Lame-Feuille',
    'Sceptile': 'Lame-Feuille',

    'Torchic': 'Flammèche',
    'Combusken': 'Boutefeu',
    'Blaziken': 'Boutefeu',            // Fire Physical (ATK très élevé)

    'Mudkip': 'Pistolet à O',
    'Marshtomp': 'Surf',
    'Swampert': 'Séisme',              // Ground Physical

    'Poochyena': 'Morsure',
    'Mightyena': 'Mâchouille',

    'Zigzagoon': 'Charge',
    'Linoone': 'Plaquage',

    'Wurmple': 'Dard-Nuée',
    'Silcoon': 'Charge',
    'Beautifly': 'Bourdon',
    'Cascoon': 'Charge',
    'Dustox': 'Bourdon',

    'Lotad': 'Surf',
    'Lombre': 'Surf',
    'Ludicolo': 'Éco-Sphère',

    'Seedot': 'Fouet Lianes',
    'Nuzleaf': 'Tranch\'Herbe',
    'Shiftry': 'Lame-Feuille',

    'Taillow': 'Cru-Ailes',
    'Swellow': 'Rapace',

    'Wingull': 'Cru-Ailes',
    'Pelipper': 'Surf',

    'Ralts': 'Choc Mental',
    'Kirlia': 'Choc Mental',
    'Gardevoir': 'Psyko',
    'Gallade': 'Close Combat',

    'Surskit': 'Surf',
    'Masquerain': 'Bourdon',

    'Shroomish': 'Méga-Sangsue',
    'Breloom': 'Close Combat',

    'Slakoth': 'Tranche',
    'Vigoroth': 'Tranche',
    'Slaking': 'Plaquage',

    'Nincada': 'Piétisol',
    'Ninjask': 'Plaie-Croix',
    'Shedinja': 'Griffe Ombre',

    'Whismur': 'Plaquage',
    'Loudred': 'Plaquage',
    'Exploud': 'Ultralaser',

    'Makuhita': 'Poing-Karaté',
    'Hariyama': 'Close Combat',

    'Aron': 'Jet-Pierres',
    'Lairon': 'Éboulement',
    'Aggron': 'Queue de Fer',

    'Meditite': 'Aurasphère',
    'Medicham': 'Aurasphère',

    'Electrike': 'Éclair',
    'Manectric': 'Tonnerre',

    'Plusle': 'Éclair',
    'Minun': 'Éclair',

    'Volbeat': 'Rayon Signal',
    'Illumise': 'Bourdon',

    'Budew': 'Méga-Sangsue',
    'Roselia': 'Méga-Sangsue',
    'Roserade': 'Éco-Sphère',

    'Gulpin': 'Bomb-Beurk',
    'Swalot': 'Bomb-Beurk',

    'Carvanha': 'Cascade',
    'Sharpedo': 'Cascade',

    'Wailmer': 'Surf',
    'Wailord': 'Surf',

    'Numel': 'Flammèche',
    'Camerupt': 'Séisme',

    'Torkoal': 'Lance-Flammes',

    'Spoink': 'Choc Mental',
    'Grumpig': 'Psyko',

    'Spinda': 'Plaquage',

    'Trapinch': 'Piétisol',
    'Vibrava': 'Draco-Choc',
    'Flygon': 'Séisme',

    'Cacnea': 'Dard-Nuée',
    'Cacturne': 'Tranche-Nuit',

    'Swablu': 'Cru-Ailes',
    'Altaria': 'Draco-Choc',

    'Zangoose': 'Tranche',
    'Seviper': 'Direct Toxik',

    'Lunatone': 'Psyko',
    'Solrock': 'Jet-Pierres',

    'Barboach': 'Piétisol',
    'Whiscash': 'Séisme',

    'Corphish': 'Pince-Masse',
    'Crawdaunt': 'Pince-Masse',

    'Baltoy': 'Choc Mental',
    'Claydol': 'Telluriforce',

    'Lileep': 'Pouvoir Antique',
    'Cradily': 'Pouvoir Antique',

    'Anorith': 'Plaie-Croix',
    'Armaldo': 'Plaie-Croix',

    'Feebas': 'Surf',
    'Milotic': 'Surf',

    'Castform': 'Météores',
    'Kecleon': 'Tranche',

    'Shuppet': 'Ball\'Ombre',
    'Banette': 'Griffe Ombre',

    'Duskull': 'Ball\'Ombre',
    'Dusclops': 'Ball\'Ombre',
    'Dusknoir': 'Griffe Ombre',

    'Tropius': 'Lame d\'Air',

    'Chimecho': 'Choc Mental',
    'Chingling': 'Choc Mental',

    'Absol': 'Tranche-Nuit',

    'Snorunt': 'Poudreuse',
    'Glalie': 'Laser Glace',
    'Froslass': 'Ball\'Ombre',

    'Spheal': 'Poudreuse',
    'Sealeo': 'Surf',
    'Walrein': 'Blizzard',

    'Clamperl': 'Surf',
    'Huntail': 'Cascade',
    'Gorebyss': 'Surf',

    'Relicanth': 'Lame de Roc',

    'Luvdisc': 'Surf',

    'Bagon': 'Dracogriffe',
    'Shelgon': 'Dracogriffe',
    'Salamence': 'Colère',

    'Beldum': 'Charge',
    'Metang': 'Poing Météor',
    'Metagross': 'Poing Météor',

    'Regirock': 'Lame de Roc',
    'Regice': 'Blizzard',
    'Registeel': 'Queue de Fer',

    'Latias': 'Psyko',
    'Latios': 'Draco-Météor',

    'Kyogre': 'Hydrocanon',
    'Groudon': 'Séisme',
    'Rayquaza': 'Colère',

    'Jirachi': 'Psyko',
    'Deoxys': 'Psyko-Boost',

    // === GEN 4 - SINNOH ===
    'Turtwig': 'Fouet Lianes',
    'Grotle': 'Tranch\'Herbe',
    'Torterra': 'Séisme',

    'Chimchar': 'Flammèche',
    'Monferno': 'Lance-Flammes',
    'Infernape': 'Close Combat',

    'Piplup': 'Pistolet à O',
    'Prinplup': 'Surf',
    'Empoleon': 'Surf',

    'Starly': 'Cru-Ailes',
    'Staravia': 'Cru-Ailes',
    'Staraptor': 'Rapace',

    'Bidoof': 'Charge',
    'Bibarel': 'Cascade',

    'Kricketot': 'Dard-Nuée',
    'Kricketune': 'Plaie-Croix',

    'Shinx': 'Étincelle',
    'Luxio': 'Étincelle',
    'Luxray': 'Éclair Fou',

    'Cranidos': 'Lame de Roc',
    'Rampardos': 'Lame de Roc',

    'Shieldon': 'Jet-Pierres',
    'Bastiodon': 'Queue de Fer',

    'Burmy': 'Charge',
    'Wormadam': 'Rayon Signal',

    'Combee': 'Dard-Nuée',
    'Vespiquen': 'Plaie-Croix',

    'Buizel': 'Aqua-Jet',
    'Floatzel': 'Cascade',

    'Cherubi': 'Méga-Sangsue',
    'Cherrim': 'Éco-Sphère',

    'Shellos': 'Surf',
    'Gastrodon': 'Telluriforce',

    'Drifloon': 'Ball\'Ombre',
    'Drifblim': 'Ball\'Ombre',

    'Buneary': 'Plaquage',
    'Lopunny': 'Plaquage',

    'Glameow': 'Tranche',
    'Purugly': 'Tranche',

    'Stunky': 'Morsure',
    'Skuntank': 'Mâchouille',

    'Bronzor': 'Choc Mental',
    'Bronzong': 'Psyko',

    'Gible': 'Dracogriffe',
    'Gabite': 'Dracogriffe',
    'Garchomp': 'Séisme',

    'Riolu': 'Aurasphère',
    'Lucario': 'Aurasphère',

    'Hippopotas': 'Piétisol',
    'Hippowdon': 'Séisme',

    'Skorupi': 'Dard-Nuée',
    'Drapion': 'Mâchouille',

    'Croagunk': 'Direct Toxik',
    'Toxicroak': 'Direct Toxik',

    'Finneon': 'Surf',
    'Lumineon': 'Surf',

    'Snover': 'Laser Glace',
    'Abomasnow': 'Blizzard',

    'Rotom': 'Éclair',

    'Uxie': 'Psyko',
    'Mesprit': 'Psyko',
    'Azelf': 'Psyko',

    'Dialga': 'Draco-Météor',
    'Palkia': 'Draco-Météor',
    'Heatran': 'Lance-Flammes',
    'Regigigas': 'Plaquage',
    'Giratina': 'Ball\'Ombre',
    'Cresselia': 'Psyko',
    'Phione': 'Surf',
    'Manaphy': 'Surf',
    'Darkrai': 'Dark Pulse',
    'Arceus': 'Ultralaser',

    // Fallback : Les Pokémon non listés utiliseront 'Charge' (physical normal)
};

/** Retourne le pool d'attaques par défaut pour un Pokémon (array). Gère string et array. */
function getDefaultMovesPool(pokemonName) {
    const val = POKEMON_DEFAULT_MOVES[pokemonName];
    if (!val) return ['Charge'];
    return Array.isArray(val) ? val : [val];
}

/** Vérifie si un Pokémon peut apprendre une attaque via CT */
function canLearnCT(pokemonName, moveName) {
    return (CT_COMPATIBILITY[moveName] || []).includes(pokemonName);
}

/** Préfixe des items CT dans l'inventaire */
const CT_ITEM_PREFIX = 'ct_';

const TOWER_SHOP_ITEMS = {
    permanentXP: {
        name: "Savoir Ancien (Permanent)",
        description: "Augmente de manière permanente tous les gains d'XP de +2%.",
        cost: 200,
        type: 'permanent',
        effect: { type: 'xp', value: 0.02 }
    },
    pensionSlot: {
        name: "Agrandissement de Pension",
        description: "+1 emplacement de pension permanent.",
        cost: 500,
        type: 'permanent',
        effect: { type: 'pensionSlot', value: 1 }
    },
    legendaryEgg: {
        name: "Œuf Légendaire Garanti",
        description: "Un œuf contenant une créature Légendaire.",
        cost: 1000,
        type: 'egg',
        rarity: RARITY.LEGENDARY,
        amount: 1
    },
    shinyCharm: {
        name: "Charme Shiny (30 min)",
        description: "Double vos chances de trouver un shiny pendant 30 minutes.",
        cost: 300,
        type: 'boost',
        duration: 1800000,
        effect: { type: 'shiny', value: 1.0 }
    },
    teamContribution: {
        name: "Synergie d'Équipe (Permanent)",
        description: "Augmente la contribution des stats de l'équipe principale de +1% par niveau (Max: +25%).",
        cost: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500],
        maxLevel: 25,
        type: 'permanent',
        effect: { type: 'team_contribution', value: 0.01 }
    },
    evolutionStone: {
        name: "Pierre d'Évolution Aléatoire",
        description: "Une pierre nécessaire pour faire évoluer certaines créatures.",
        cost: 400,
        type: 'item',
        item: 'evolution_stone'
    },

    talentReroll: {
        name: "Cristal de Réinitialisation",
        description: "Réassigne aléatoirement le talent passif d'une créature Epic ou Legendary.",
        cost: 1,
        type: 'consumable',
        item: 'talent_reroll'
    },
    talentChoice: {
        name: "Orbe de Maîtrise",
        description: "Choisissez manuellement le talent passif d'une créature Epic ou Legendary.",
        cost: 2,
        type: 'consumable',
        item: 'talent_choice'
    },
    'leftovers': {
        id: 'leftovers',
        name: "Restes (Objet Tenu)",
        description: "Soigne le porteur à chaque tour.",
        cost: 100 // Poussière
    },
    'choice_band': {
        name: "Bandeau Choix",
        description: "+25% ATK, mais -10% SPD.",
        effect: { attack_mult: 0.25, speed_mult: -0.10 },
        cost: 100 // Poussière
    },
    'expert_belt': {
        name: "Ceinture Pro",
        description: "+15% de dégâts si l'attaque est Super Efficace.",
        effect: { super_effective_bonus: 0.15 },
        cost: 100 // Poussière
    }
};

// ====== NOUVEAU : OBJETS TENUS ======
const HELD_ITEMS = {
    'leftovers': {
        name: "Restes",
        description: "Régénère 2% des PV max du compte chaque tour.",
        effect: { heal_percent: 0.02 },
        rarity: 'rare',    // ✅ AJOUTÉ
        icon: "🍎",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leftovers.png"
    },
    'choice_band': {
        name: "Bandeau Choix",
        description: "+50% ATK, mais bloqué sur une capacité (pas d'ultime).",
        effect: { attack_mult: 0.50, disable_ultimate: true },
        rarity: 'epic',    // ✅ AJOUTÉ
        icon: "🥊",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-band.png"
    },
    'expert_belt': {
        name: "Ceinture Pro",
        description: "+20% de dégâts si l'attaque est Super Efficace.",
        effect: { super_effective_bonus: 0.20 },
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/expert-belt.png",
        rarity: 'rare',    // ✅ AJOUTÉ
        icon: "🥋"         // ✅ AJOUTÉ
    },
    'life_orb': {
        name: "Orbe Vie",
        description: "+30% Dégâts, mais coûte 10% des PV max à chaque attaque.",
        effect: { damage_mult: 1.30, self_recoil: 0.10 },
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/life-orb.png",
        rarity: 'epic',    // ✅ AJOUTÉ
        icon: "🔮"         // ✅ AJOUTÉ
    },
    'rocky_helmet': {
        name: "Casque Brut",
        description: "Renvoie 15% des dégâts subis à l'attaquant.",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rocky-helmet.png",
        effect: { reflect_mult: 0.15 },
        rarity: 'rare',    // ✅ AJOUTÉ
        icon: "⛑️"         // ✅ AJOUTÉ
    },
    'lucky_egg': {
        name: "Œuf Chance",
        description: "Le porteur gagne +100% d'XP.",
        effect: { xp_bonus: 1.0 },
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-egg.png",
        rarity: 'legendary', // ✅ AJOUTÉ
        icon: "🥚"           // ✅ AJOUTÉ
    },
    'choice_scarf': {
        name: "Mouchoir Choix",
        description: "+50% Vitesse.",
        effect: { speed_mult: 0.50 },
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-scarf.png",
        rarity: 'epic',    // ✅ AJOUTÉ
        icon: "🧣"         // ✅ AJOUTÉ
    },
    'shell_bell': {
        name: "Grelot Coque",
        description: "Soigne 15% des dégâts infligés.",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shell-bell.png",
        effect: { lifesteal: 0.15 },
        rarity: 'rare',    // ✅ AJOUTÉ
        icon: "🔔"         // ✅ AJOUTÉ
    }
};

const TEAM_SYNERGIES = {
    'fire_power': {
        types: [TYPES.FIRE],
        min_count: 3,
        effect: { attack_mult: 0.20 },
        name: "Résonance Pyro",
        message: "L'équipe brûle d'ardeur ! (+20% ATK)"
    },
    'water_defense': {
        types: [TYPES.WATER],
        min_count: 3,
        effect: { defense_mult: 0.20, max_hp_mult: 0.10 },
        name: "Harmonie Hydro",
        message: "L'équipe coule comme l'eau ! (+20% DEF, +10% PV)"
    },
    'basic_synergy': {
        types: [TYPES.NORMAL],
        min_count: 4,
        effect: { exp_mult: 0.25 },
        name: "Simplicité",
        message: "L'adaptation est la clé ! (+25% XP)"
    },
    // --- NOUVELLES SYNERGIES ---
    'forest_growth': {
        types: [TYPES.GRASS],
        min_count: 3,
        effect: { max_hp_mult: 0.20, heal_mult: 0.20 }, // heal_mult est nouveau (à gérer plus tard si besoin)
        name: "Sève Vitale",
        message: "La nature vous protège ! (+20% PV)"
    },
    'electric_speed': {
        types: [TYPES.ELECTRIC],
        min_count: 3,
        effect: { speed_mult: 0.25 },
        name: "Surtension",
        message: "Rapide comme l'éclair ! (+25% SPD)"
    },
    'sky_lords': {
        types: [TYPES.FLYING, TYPES.DRAGON], // Synergie multi-type !
        min_count: 3,
        effect: { attack_mult: 0.10, speed_mult: 0.10 },
        name: "Maîtres du Ciel",
        message: "Domination aérienne ! (+10% ATK, +10% SPD)"
    },
    'steel_fortress': {
        types: [TYPES.STEEL, TYPES.ROCK],
        min_count: 3,
        effect: { defense_mult: 0.30 },
        name: "Forteresse",
        message: "Une défense impénétrable ! (+30% DEF)"
    },
    'steam_power': {
        name: "Vapeur Hurlante",
        types: [TYPES.FIRE, TYPES.WATER],
        min_count: 3, // Il faut 3 de CHAQUE type listé
        all_required: true, // ✅ NOUVEAU PARAMÈTRE
        effect: { attack_mult: 0.25, defense_mult: 0.25 },
        message: "L'alliance du Feu et de l'Eau crée une pression dévastatrice ! (+25% ATK/DEF)"
    },

    'nature_storm': {
        name: "Tempête Naturelle",
        types: [TYPES.GRASS, TYPES.ELECTRIC],
        min_count: 3,
        all_required: true,
        effect: { speed_mult: 0.30, max_hp_mult: 0.15 },
        message: "La foudre frappe la forêt ! (+30% SPD, +15% PV)"
    },

    'rainbow_force': {
        name: "Prisme Élémentaire",
        types: [TYPES.FIRE, TYPES.WATER, TYPES.ELECTRIC, TYPES.GRASS, TYPES.PSYCHIC, TYPES.NORMAL],
        min_count: 1, // 1 de CHAQUE type (Total 6)
        all_required: true,
        effect: { attack_mult: 0.15, defense_mult: 0.15, speed_mult: 0.15, max_hp_mult: 0.15 }, // Bonus partout
        message: "L'harmonie parfaite des éléments ! (+15% TOUTES STATS)"
    },

    'fortress_ultimate': {
        name: "Forteresse Imprenable",
        types: [TYPES.STEEL, TYPES.ROCK, TYPES.GROUND],
        min_count: 2, // 2 de chaque (2 Acier + 2 Roche + 2 Sol)
        all_required: true,
        effect: { defense_mult: 0.50 },
        message: "Une défense absolue ! (+50% DEF)"
    },
    'mind_body': {
        name: "Esprit & Matière",
        types: [TYPES.PSYCHIC, TYPES.FIGHTING],
        min_count: 2, // 2 Psy + 2 Combat
        all_required: true,
        effect: { attack_mult: 0.20, speed_mult: 0.15 },
        message: "La force brute guidée par l'esprit ! (+20% ATK, +15% SPD)"
    },

    'toxic_swarm': {
        name: "Essaim Toxique",
        types: [TYPES.BUG, TYPES.POISON],
        min_count: 2, // 2 Insecte + 2 Poison
        all_required: true,
        effect: { max_hp_mult: 0.20, defense_mult: 0.10 },
        message: "Une infestation impossible à éradiquer. (+20% PV, +10% DEF)"
    },

    'eclipse': {
        name: "Éclipse Totale",
        types: [TYPES.DARK, TYPES.FAIRY],
        min_count: 2, // 2 Ténèbres + 2 Fée
        all_required: true,
        effect: { attack_mult: 0.25, defense_mult: 0.10 },
        message: "L'union de la lumière et de l'ombre. (+25% ATK, +10% DEF)"
    },

    'permafrost': {
        name: "Permafrost",
        types: [TYPES.ICE, TYPES.STEEL],
        min_count: 2, // 2 Glace + 2 Acier
        all_required: true,
        effect: { defense_mult: 0.40 },
        message: "Une armure gelée impénétrable. (+40% DEF)"
    },

    'volcanic_storm': {
        name: "Orage Volcanique",
        types: [TYPES.FIRE, TYPES.ELECTRIC],
        min_count: 2,
        all_required: true,
        effect: { attack_mult: 0.30, speed_mult: 0.10 },
        message: "Une destruction rapide et explosive ! (+30% ATK, +10% SPD)"
    },

    // --- TRIOS LÉGENDAIRES (Difficiles à assembler) ---

    'ancient_power': {
        name: "Ère Jurassique",
        types: [TYPES.ROCK, TYPES.DRAGON, TYPES.FLYING],
        min_count: 1, // 1 de chaque
        all_required: true,
        effect: { attack_mult: 0.15, max_hp_mult: 0.15 },
        message: "La puissance des temps anciens. (+15% ATK/PV)"
    },

    'spirit_world': {
        name: "Outre-Monde",
        types: [TYPES.GHOST, TYPES.PSYCHIC, TYPES.DARK],
        min_count: 1, // 1 de chaque
        all_required: true,
        effect: { attack_mult: 0.20, speed_mult: 0.10 },
        message: "Les esprits s'éveillent... (+20% ATK, +10% SPD)"
    },

    // --- SYNERGIES DE FARM (Pour l'économie) ---

    'lucky_star': {
        name: "Bonne Étoile",
        types: [TYPES.NORMAL, TYPES.FAIRY],
        min_count: 3, // 3 Normal + 3 Fée (Équipe complète)
        all_required: true,
        effect: { pokedollars_mult: 0.50, exp_mult: 0.20 },
        message: "La fortune vous sourit ! (+50% $$$ et +20% XP)"
    }
};

/**
 * Bonus de collection — Bonus passifs basés sur la collection de familles complètes.
 * Principe "Maillon Faible" : niveau de bonus = min(prestige) parmi tous les membres requis.
 * Si un Pokémon manque ou a prestige 0 → bonus famille = 0.
 * Les valeurs dans effect sont par niveau (ex: crit_chance: 0.1 → +10% crit par niveau).
 */
/** Évolutions finales uniquement. Valeurs /10. Water Starters = 1% PV max par prestige. */
const COLLECTION_BONUSES = {
    'muscle_heads': {
        name: "Muscle Heads",
        pokemon: ['Machamp', 'Primeape', 'Hitmonlee', 'Hitmonchan', 'Hitmontop', 'Heracross', 'Hariyama', 'Medicham', 'Lucario', 'Toxicroak'],
        effect: { crit_chance: 0.01 }
    },
    'poltergeists': {
        name: "Poltergeists",
        pokemon: ['Gengar', 'Crobat', 'Mismagius', 'Banette', 'Sableye', 'Dusknoir', 'Drifblim', 'Spiritomb'],
        effect: { life_steal: 0.005 }
    },
    'thieves_guild': {
        name: "Thieves Guild",
        pokemon: ['Persian', 'Weavile', 'Houndoom', 'Honchkrow', 'Mightyena', 'Sharpedo', 'Skuntank', 'Purugly'],
        effect: { gold_mult: 0.02 }
    },
    'brainiacs': {
        name: "Brainiacs",
        pokemon: ['Alakazam', 'Hypno', 'Mr. Mime', 'Xatu', 'Espeon', 'Girafarig', 'Gardevoir', 'Gallade', 'Grumpig', 'Chimecho', 'Bronzong'],
        effect: { xp_mult: 0.05 }
    },
    'fire_starters': {
        name: "Fire Starters",
        pokemon: ['Charizard', 'Typhlosion', 'Blaziken', 'Infernape'],
        effect: { damage_mult: 0.01 }
    },
    'water_starters': {
        name: "Water Starters",
        pokemon: ['Blastoise', 'Feraligatr', 'Swampert', 'Empoleon'],
        effect: { max_hp_mult: 0.01 }
    },
    'grass_starters': {
        name: "Grass Starters",
        pokemon: ['Venusaur', 'Meganium', 'Sceptile', 'Torterra'],
        effect: { hp_regen_per_turn: 0.005 }
    },
    'forge_draconique': {
        name: "Forge draconique",
        pokemon: ['Dragonite', 'Salamence', 'Garchomp'],
        effect: { damage_mult: 0.015 }
    },
    'mur_d_acier': {
        name: "Mur d'acier",
        pokemon: ['Steelix', 'Aggron', 'Metagross', 'Skarmory', 'Forretress'],
        effect: { defense_mult: 0.01 }
    },
    'chasseurs_nocturnes': {
        name: "Chasseurs nocturnes",
        pokemon: ['Crobat', 'Weavile', 'Absol', 'Honchkrow', 'Umbreon', 'Noctowl'],
        effect: { crit_chance: 0.006 }
    },
    'menu_best_of': {
        name: "Menu Best Of",
        pokemon: ['Blissey', 'Rampardos', 'Steelix', 'Mewtwo', 'Shuckle', 'Ninjask'],
        effect: { max_hp_mult: 0.01, attack_mult: 0.01, defense_mult: 0.01, speed_mult: 0.01 } // +1% dans toutes les stats
    },
    'eco_plus': {
        name: "Eco+",
        pokemon: ['Shedinja', 'Smeargle', 'Jynx', 'Sudowoodo', 'Sharpedo', 'Torkoal'],
        effect: { max_hp_mult: 0.025, attack_mult: 0.025, defense_mult: 0.025, speed_mult: 0.025 } // +2.5% dans toutes les stats
    },
    'not_a_pikachu': {
        name: "Not A Pikachu",
        pokemon: ['Jolteon', 'Ampharos', 'Manectric', 'Plusle', 'Minun'],
        effect: { spattack_mult: 0.015 } // +1.5% attaque spéciale
    },
    'zzzzz': {
        name: "ZzZzZ",
        pokemon: ['Snorlax', 'Slaking', 'Slowbro'],
        effect: { leftovers_heal_mult: 0.005 } // +0.5% d'effet supplémentaire de l'objet "Restes"
    },
    'hm_slaves': {
        name: "HM SLaves",
        pokemon: ["Farfetch'd", "Furret", "Linoone", "Bibarel"],
        effect: { max_hp_mult: 0.01 } // +1% HP
    },
    'god_i_need_repel': {
        name: "god...I Need repel",
        pokemon: ["Zubat", "Geodude", "Tentacool", "Diglett"],
        effect: { respawn_delay_reduction: 25 } // -25ms délai de spawn
    },
    'directed_by_michael_bay': {
        name: "Directed by Michael Bay",
        pokemon: ["Electrode", "Forretress", "Weezing"],
        effect: { crit_damage_mult: 0.10 } // +10% dégâts critiques
    },
    'god_i_need_one_friend': {
        name: "God ... I need one friend",
        pokemon: ["Alakazam", "Machamp", "Golem", "Gengar"],
        effect: { egg_drop_chance: 0.005 } // +0.5% chance par niveau
    },
    'god_i_need_two_friends': {
        name: "God... I need two friends",
        pokemon: ["Politoed", "Slowking", "Steelix", "Scizor", "Kingdra", "Porygon2"],
        effect: { egg_drop_chance: 0.005 } // +0.5% chance par niveau
    },
    'three_friends': {
        name: "Three friends...",
        pokemon: ["Huntail", "Gorebyss"],
        effect: { bonus_shard_chance: 0.05 } // +5% chance par niveau
    },
    'forever_alone': {
        name: "Forever ALone",
        pokemon: ["Rhyperior", "Electivire", "Magmortar", "Porygon-Z", "Dusknoir"],
        effect: { bonus_shard_chance: 0.01 } // +1% chance par niveau
    },
    'out_of_this_world': {
        name: "Out of this World",
        pokemon: ["Clefairy", "Staryu", "Lunatone", "Solrock", "Deoxys"],
        effect: { expedition_time_reduction: 0.05 } // -5% temps d'expédition par niveau
    },
    'the_600_club': {
        name: "The 600 club",
        pokemon: ["Dragonite", "Tyranitar", "Salamence", "Metagross", "Garchomp"],
        effect: { damage_mult: 0.01 } // +1% dégâts
    }
};

const TOWER_RELICS = {
    'vampirism': {
        name: "Crocs de Vampire",
        icon: "🩸",
        // Valeurs : [Common, Rare, Epic, Legendary]
        values: {
            [RARITY.COMMON]: 0.02, // 2%
            [RARITY.RARE]: 0.04,   // 4%
            [RARITY.EPIC]: 0.06,   // 6%
            [RARITY.LEGENDARY]: 0.10 // 10%
        },
        // La description devient une fonction pour afficher la bonne valeur
        getDescription: (val) => `Soigne ${Math.round(val * 100)}% des dégâts infligés.`,
        // L'effet prend maintenant la valeur en paramètre
        effect: (game, val) => { game.towerState.buffs.lifesteal = (game.towerState.buffs.lifesteal || 0) + val; }
    },
    'glass_cannon': {
        name: "Canon de Verre",
        icon: "🔥",
        // Pour celui-ci, on stocke un objet {atk, def} par rareté
        values: {
            [RARITY.COMMON]: { atk: 0.15, def: 0.05 },
            [RARITY.RARE]: { atk: 0.25, def: 0.10 },
            [RARITY.EPIC]: { atk: 0.40, def: 0.15 },
            [RARITY.LEGENDARY]: { atk: 0.75, def: 0.25 }
        },
        getDescription: (val) => `+${Math.round(val.atk * 100)}% ATK, mais -${Math.round(val.def * 100)}% DEF.`,
        effect: (game, val) => {
            game.towerState.buffs.attack_mult = (game.towerState.buffs.attack_mult || 1) + val.atk;
            game.towerState.buffs.defense_mult = (game.towerState.buffs.defense_mult || 1) - val.def;
        }
    },
    'stone_wall': {
        name: "Mur de Pierre",
        icon: "🛡️",
        values: {
            [RARITY.COMMON]: 0.10,
            [RARITY.RARE]: 0.20,
            [RARITY.EPIC]: 0.35,
            [RARITY.LEGENDARY]: 0.60
        },
        getDescription: (val) => `+${Math.round(val * 100)}% DEF.`,
        effect: (game, val) => { game.towerState.buffs.defense_mult = (game.towerState.buffs.defense_mult || 1) + val; }
    },
    'vitality_burst': {
        name: "Soin d'Urgence",
        icon: "💖",
        immediate: true,
        values: {
            [RARITY.COMMON]: 0.20,
            [RARITY.RARE]: 0.35,
            [RARITY.EPIC]: 0.50,
            [RARITY.LEGENDARY]: 1.00 // Soin total !
        },
        getDescription: (val) => `Soigne immédiatement ${Math.round(val * 100)}% des PV de l'équipe.`,
        effect: (game, val) => {
            game.playerTeam.forEach(c => {
                if (c.isAlive()) {
                    const max = game.getPlayerMaxHp();
                    c.mainAccountCurrentHp = Math.min(max, (c.mainAccountCurrentHp || 0) + (max * val));
                }
            });
            logMessage(`Soin d'urgence : +${Math.round(val * 100)}% PV !`);
        }
    },
    'lucky_charm': {
        name: "Trèfle Porte-Bonheur",
        icon: "🍀",
        values: {
            [RARITY.COMMON]: 0.05,
            [RARITY.RARE]: 0.10,
            [RARITY.EPIC]: 0.15,
            [RARITY.LEGENDARY]: 0.25
        },
        getDescription: (val) => `+${Math.round(val * 100)}% Chance Critique.`,
        effect: (game, val) => { game.towerState.buffs.crit_chance = (game.towerState.buffs.crit_chance || 0) + val; }
    },
    'swift_boots': {
        name: "Bottes de Vitesse",
        icon: "👟",
        values: {
            [RARITY.COMMON]: 0.10,     // +10%
            [RARITY.RARE]: 0.20,       // +20%
            [RARITY.EPIC]: 0.35,       // +35%
            [RARITY.LEGENDARY]: 0.60   // +60%
        },
        getDescription: (val) => `+${Math.round(val * 100)}% Vitesse.`,
        effect: (game, val) => { game.towerState.buffs.speed_mult = (game.towerState.buffs.speed_mult || 1) + val; }
    },
    'spike_armor': {
        name: "Cotte d'Épines",
        icon: "🌵",
        values: {
            [RARITY.COMMON]: 0.05,     // 5% renvoyés
            [RARITY.RARE]: 0.10,       // 10%
            [RARITY.EPIC]: 0.20,       // 20%
            [RARITY.LEGENDARY]: 0.40   // 40%
        },
        getDescription: (val) => `Renvoie ${Math.round(val * 100)}% des dégâts subis à l'attaquant.`,
        effect: (game, val) => { game.towerState.buffs.reflect_percent = (game.towerState.buffs.reflect_percent || 0) + val; }
    },
    'predator_instinct': {
        name: "Instinct Prédateur",
        icon: "🐯",
        values: {
            [RARITY.COMMON]: 0.15,     // +15% dégâts
            [RARITY.RARE]: 0.25,       // +25%
            [RARITY.EPIC]: 0.50,       // +50%
            [RARITY.LEGENDARY]: 1.00   // +100% (Doublés !)
        },
        getDescription: (val) => `+${Math.round(val * 100)}% Dégâts si l'ennemi subit un effet de statut.`,
        effect: (game, val) => { game.towerState.buffs.status_dmg_bonus = (game.towerState.buffs.status_dmg_bonus || 0) + val; }
    },
    'shadow_cloak': {
        name: "Cape d'Ombre",
        icon: "👻",
        unique: true, // ✅ AJOUT : Empêche le cumul
        values: {
            [RARITY.COMMON]: 0.05,     // 5%
            [RARITY.RARE]: 0.10,       // 10%
            [RARITY.EPIC]: 0.15,       // 15%
            [RARITY.LEGENDARY]: 0.25   // 25%
        },
        getDescription: (val) => `+${Math.round(val * 100)}% de chance d'Esquiver une attaque. (Max 1)`,
        effect: (game, val) => { game.towerState.buffs.dodge_chance = (game.towerState.buffs.dodge_chance || 0) + val; }
    },
    'executioner': {
        name: "Hache d'Exécution",
        icon: "🪓",
        unique: true, // On garde le tag unique pour ne pas l'avoir 2 fois
        values: {
            // Ici on scale le % de dégâts bonus
            [RARITY.COMMON]: 0.15, // +15%
            [RARITY.RARE]: 0.25,
            [RARITY.EPIC]: 0.40,
            [RARITY.LEGENDARY]: 0.75 // +75% !
        },
        getDescription: (val) => `+${Math.round(val * 100)}% Dégâts si l'ennemi a < 50% PV. ( 1 seul exemplaire maximum)`,
        // Note: On stocke la valeur (pourcentage) au lieu de true/false
        effect: (game, val) => { game.towerState.buffs.execute_percent = (game.towerState.buffs.execute_percent || 0) + val; }
    }, 'golem_heart': {
        name: "Cœur de Golem",
        icon: "🤎",
        values: {
            [RARITY.COMMON]: 0.10,     // +10% PV
            [RARITY.RARE]: 0.20,       // +20%
            [RARITY.EPIC]: 0.35,       // +35%
            [RARITY.LEGENDARY]: 0.60   // +60%
        },
        getDescription: (val) => `+${Math.round(val * 100)}% PV Maximum.`,
        effect: (game, val) => { game.towerState.buffs.max_hp_mult = (game.towerState.buffs.max_hp_mult || 1) + val; }
    },

    // --- DANS [RARITY.RARE] ---
    'regeneration_ring': {
        name: "Anneau de Régénération",
        icon: "💍",
        values: {
            [RARITY.COMMON]: 0.01,     // 1% par tour
            [RARITY.RARE]: 0.02,       // 2%
            [RARITY.EPIC]: 0.03,       // 3%
            [RARITY.LEGENDARY]: 0.05   // 5%
        },
        getDescription: (val) => `Régénère ${Math.round(val * 100)}% des PV max à chaque attaque.`,
        effect: (game, val) => { game.towerState.buffs.regen_percent = (game.towerState.buffs.regen_percent || 0) + val; }
    }
};


// ✅ Tel quel dans le document, mais je suggère d'ajouter une description pour l'UI
const ARENAS = {
    1: {
        name: "Arène d'Argenta",
        requiredZone: 3,
        type: TYPES.ROCK,
        badge: "resilience", // Pierre donne de la Défense (Résilience)
        championName: "Pierre",
        teamLevel: 15,
        fixedTeam: ['Geodude', 'Graveler', 'Onix', 'Rhyhorn', 'Omastar', 'Golem']
    },
    2: {
        name: "Arène d'Azuria",
        requiredZone: 6,
        type: TYPES.WATER,
        badge: "vitality", // Ondine donne des PV (Vitalité)
        championName: "Ondine",
        teamLevel: 25,
        fixedTeam: ['Staryu', 'Goldeen', 'Psyduck', 'Seaking', 'Lapras', 'Starmie']
    },
    3: {
        name: "Arène de Carmin",
        requiredZone: 9,
        type: TYPES.ELECTRIC,
        badge: "fortune", // Major Bob (Vitesse/Efficacité) -> Fortune ($$$)
        championName: "Major Bob",
        teamLevel: 35,
        fixedTeam: ['Voltorb', 'Magnemite', 'Magneton', 'Electrode', 'Electabuzz', 'Raichu']
    },
    4: {
        name: "Arène de Céladopole",
        requiredZone: 12,
        type: TYPES.GRASS,
        badge: "wisdom", // Erika (Nature/Sagesse) -> XP (Sagesse)
        championName: "Erika",
        teamLevel: 45,
        fixedTeam: ['Tangela', 'Weepinbell', 'Gloom', 'Victreebel', 'Vileplume', 'Tangrowth']
    },
    5: {
        name: "Arène de Parmanie",
        requiredZone: 15,
        type: TYPES.POISON,
        badge: "pension", // Koga (Ninja/Technique) -> Pension
        championName: "Koga",
        teamLevel: 55,
        fixedTeam: ['Koffing', 'Muk', 'Weezing', 'Venomoth', 'Tentacruel', 'Crobat']
    },
    6: {
        name: "Arène de Safrania",
        requiredZone: 18,
        type: TYPES.PSYCHIC,
        badge: "prestige", // Morgane (Esprit) -> Prestige (Shards)
        championName: "Morgane",
        teamLevel: 65,
        fixedTeam: ['Kadabra', 'Mr. Mime', 'Hypno', 'Slowbro', 'Espeon', 'Alakazam']
    },
    7: {
        name: "Arène de Cramois'Île",
        requiredZone: 21,
        type: TYPES.FIRE,
        badge: "power", // Auguste (Feu) -> Puissance (Dégâts)
        championName: "Auguste",
        teamLevel: 75,
        fixedTeam: ['Growlithe', 'Ponyta', 'Rapidash', 'Ninetales', 'Magmar', 'Arcanine']
    },
    8: {
        name: "Arène de Jadielle",
        requiredZone: 24,
        type: TYPES.GROUND,
        badge: "master", // Giovanni (Le Boss) -> Maître (Slot équipe)
        championName: "Giovanni",
        teamLevel: 85,
        fixedTeam: ['Dugtrio', 'Nidoqueen', 'Nidoking', 'Rhydon', 'Sandslash', 'Rhyperior']
    }
};

const ACCOUNT_TALENTS = {
    vitality: {
        name: "Vitalite Renforcee",
        description: "+5% HP maximum du compte",
        effect: "hp_mult",
        value: 0.05
    },
    power: {
        name: "Puissance Accrue",
        description: "+5% degats finaux infliges",
        effect: "damage_mult",
        value: 0.05
    },
    resilience: {
        name: "Resilience",
        description: "-5% degats finaux recus",
        effect: "damage_reduction",
        value: 0.05
    },
    fortune: {
        name: "Fortune",
        description: "+10% Pokedollars gagnes",
        effect: "pokedollars_mult",
        value: 0.10
    },
    wisdom: {
        name: "Sagesse",
        description: "+10% XP gagnee",
        effect: "exp_mult",
        value: 0.10
    },
    pension: {
        name: "Pension Etendue",
        description: "+2 emplacements de pension",
        effect: "pension_slots",
        value: 2
    },
    prestige: {
        name: "Aura de Prestige", // Nouveau nom
        description: "+10% de chance de trouver des Shards bonus", // Nouvel effet
        effect: "shard_chance", // Nouvel effet à gérer (similaire à shardBonus)
        value: 0.10
    },
    master: {
        name: "Maitre Dresseur",
        description: "+1 emplacement dans l'equipe",
        effect: "team_slot",
        value: 1
    }
};

const EVOLUTIONS = {
    // --- GEN 1 (Kanto) ---
    'Bulbasaur': { level: 16, evolves_to: 'Ivysaur', new_type: TYPES.GRASS },
    'Ivysaur': { level: 32, evolves_to: 'Venusaur', new_type: TYPES.GRASS },
    'Charmander': { level: 16, evolves_to: 'Charmeleon', new_type: TYPES.FIRE },
    'Charmeleon': { level: 36, evolves_to: 'Charizard', new_type: TYPES.FIRE },
    'Squirtle': { level: 16, evolves_to: 'Wartortle', new_type: TYPES.WATER },
    'Wartortle': { level: 36, evolves_to: 'Blastoise', new_type: TYPES.WATER },
    'Caterpie': { level: 7, evolves_to: 'Metapod', new_type: TYPES.BUG },
    'Metapod': { level: 10, evolves_to: 'Butterfree', new_type: TYPES.BUG },
    'Weedle': { level: 7, evolves_to: 'Kakuna', new_type: TYPES.BUG },
    'Kakuna': { level: 10, evolves_to: 'Beedrill', new_type: TYPES.BUG },
    'Pidgey': { level: 18, evolves_to: 'Pidgeotto', new_type: TYPES.FLYING },
    'Pidgeotto': { level: 36, evolves_to: 'Pidgeot', new_type: TYPES.FLYING },
    'Rattata': { level: 20, evolves_to: 'Raticate', new_type: TYPES.NORMAL },
    'Spearow': { level: 20, evolves_to: 'Fearow', new_type: TYPES.FLYING },
    'Ekans': { level: 22, evolves_to: 'Arbok', new_type: TYPES.POISON },
    'Pikachu': { level: null, condition: 'thunder_stone', evolves_to: 'Raichu', new_type: TYPES.ELECTRIC },
    'Sandshrew': { level: 22, evolves_to: 'Sandslash', new_type: TYPES.GROUND },
    'Nidoran♀': { level: 16, evolves_to: 'Nidorina', new_type: TYPES.POISON },
    'Nidorina': { level: 32, condition: 'moon_stone', evolves_to: 'Nidoqueen', new_type: TYPES.POISON },
    'Nidoran♂': { level: 16, evolves_to: 'Nidorino', new_type: TYPES.POISON },
    'Nidorino': { level: 32, evolves_to: 'Nidoking', new_type: TYPES.POISON },
    'Clefairy': { level: 32, condition: 'moon_stone', evolves_to: 'Clefable', new_type: TYPES.NORMAL },
    'Vulpix': { level: null, condition: 'fire_stone', evolves_to: 'Ninetales', new_type: TYPES.FIRE },
    'Jigglypuff': { level: null, condition: 'moon_stone', evolves_to: 'Wigglytuff', new_type: TYPES.NORMAL },
    'Zubat': { level: 22, evolves_to: 'Golbat', new_type: TYPES.FLYING },
    'Golbat': { level: 32, evolves_to: 'Crobat', new_type: TYPES.FLYING },
    'Oddish': { level: 21, evolves_to: 'Gloom', new_type: TYPES.GRASS },
    'Gloom': {
        level: null,
        options: [
            { conditionItem: 'leaf_stone', evolves_to: 'Vileplume', new_type: TYPES.GRASS },
            { conditionItem: 'sun_stone', evolves_to: 'Bellossom', new_type: TYPES.GRASS }
        ]
    },
    'Paras': { level: 24, evolves_to: 'Parasect', new_type: TYPES.BUG },
    'Venonat': { level: 31, evolves_to: 'Venomoth', new_type: TYPES.BUG },
    'Diglett': { level: 26, evolves_to: 'Dugtrio', new_type: TYPES.GROUND },
    'Meowth': { level: 28, evolves_to: 'Persian', new_type: TYPES.NORMAL },
    'Psyduck': { level: 33, evolves_to: 'Golduck', new_type: TYPES.WATER },
    'Mankey': { level: 28, evolves_to: 'Primeape', new_type: TYPES.FIGHTING },
    'Growlithe': { level: null, condition: 'fire_stone', evolves_to: 'Arcanine', new_type: TYPES.FIRE },
    'Poliwag': { level: 25, evolves_to: 'Poliwhirl', new_type: TYPES.WATER },
    'Poliwhirl': { level: null, condition: 'water_stone', evolves_to: 'Poliwrath', new_type: TYPES.FIGHTING }, // Branching: King's Rock -> Politoed
    'Abra': { level: 16, evolves_to: 'Kadabra', new_type: TYPES.PSYCHIC },
    'Kadabra': { level: 36, evolves_to: 'Alakazam', new_type: TYPES.PSYCHIC },
    'Machop': { level: 28, evolves_to: 'Machoke', new_type: TYPES.FIGHTING },
    'Machoke': { level: null, condition: 'Trade', evolves_to: 'Machamp', new_type: TYPES.FIGHTING },
    'Bellsprout': { level: 21, evolves_to: 'Weepinbell', new_type: TYPES.GRASS },
    'Weepinbell': { level: null, condition: 'leaf_stone', evolves_to: 'Victreebel', new_type: TYPES.GRASS },
    'Tentacool': { level: 30, evolves_to: 'Tentacruel', new_type: TYPES.WATER },
    'Geodude': { level: 25, evolves_to: 'Graveler', new_type: TYPES.ROCK },
    'Graveler': { level: null, condition: 'Trade', evolves_to: 'Golem', new_type: TYPES.ROCK },
    'Ponyta': { level: 40, evolves_to: 'Rapidash', new_type: TYPES.FIRE },
    'Slowpoke': { level: 37, evolves_to: 'Slowbro', new_type: TYPES.WATER }, // Branching: King's Rock -> Slowking
    'Magnemite': { level: 30, evolves_to: 'Magneton', new_type: TYPES.STEEL },
    'Magneton': { level: null, condition: 'Magnetic Field', evolves_to: 'Magnezone', new_type: TYPES.STEEL }, // New Gen 4
    'Doduo': { level: 31, evolves_to: 'Dodrio', new_type: TYPES.FLYING },
    'Seel': { level: 34, evolves_to: 'Dewgong', new_type: TYPES.ICE },
    'Grimer': { level: 38, evolves_to: 'Muk', new_type: TYPES.POISON },
    'Shellder': { level: null, condition: 'water_stone', evolves_to: 'Cloyster', new_type: TYPES.ICE },
    'Gastly': { level: 25, evolves_to: 'Haunter', new_type: TYPES.GHOST },
    'Haunter': { level: null, condition: 'Trade', evolves_to: 'Gengar', new_type: TYPES.GHOST },
    'Onix': { level: null, condition: 'Metal Coat', evolves_to: 'Steelix', new_type: TYPES.STEEL },
    'Drowzee': { level: 26, evolves_to: 'Hypno', new_type: TYPES.PSYCHIC },
    'Krabby': { level: 28, evolves_to: 'Kingler', new_type: TYPES.WATER },
    'Voltorb': { level: 30, evolves_to: 'Electrode', new_type: TYPES.ELECTRIC },
    'Exeggcute': { level: null, condition: 'leaf_stone', evolves_to: 'Exeggutor', new_type: TYPES.GRASS },
    'Cubone': { level: 28, evolves_to: 'Marowak', new_type: TYPES.GROUND },
    'Lickitung': { level: 33, condition: 'Rollout', evolves_to: 'Lickilicky', new_type: TYPES.NORMAL }, // New Gen 4
    'Koffing': { level: 35, evolves_to: 'Weezing', new_type: TYPES.POISON },
    'Rhyhorn': { level: 42, evolves_to: 'Rhydon', new_type: TYPES.GROUND },
    'Rhydon': { level: null, condition: 'Protector', evolves_to: 'Rhyperior', new_type: TYPES.GROUND }, // New Gen 4
    'Chansey': { level: null, condition: 'Friendship', evolves_to: 'Blissey', new_type: TYPES.NORMAL },
    'Tangela': { level: 33, condition: 'Ancient Power', evolves_to: 'Tangrowth', new_type: TYPES.GRASS }, // New Gen 4
    'Horsea': { level: 32, evolves_to: 'Seadra', new_type: TYPES.WATER },
    'Seadra': { level: null, condition: 'Dragon Scale', evolves_to: 'Kingdra', new_type: TYPES.DRAGON },
    'Goldeen': { level: 33, evolves_to: 'Seaking', new_type: TYPES.WATER },
    'Staryu': { level: null, condition: 'water_stone', evolves_to: 'Starmie', new_type: TYPES.PSYCHIC },
    'Scyther': { level: null, condition: 'Metal Coat', evolves_to: 'Scizor', new_type: TYPES.BUG },
    'Electabuzz': { level: null, condition: 'Electirizer', evolves_to: 'Electivire', new_type: TYPES.ELECTRIC }, // New Gen 4
    'Magmar': { level: null, condition: 'Magmarizer', evolves_to: 'Magmortar', new_type: TYPES.FIRE }, // New Gen 4
    'Magikarp': { level: 20, evolves_to: 'Gyarados', new_type: TYPES.WATER },
    'Eevee': {
        level: null,
        options: [
            { conditionItem: 'thunder_stone', evolves_to: 'Jolteon', new_type: TYPES.ELECTRIC },
            { conditionItem: 'water_stone', evolves_to: 'Vaporeon', new_type: TYPES.WATER },
            { conditionItem: 'fire_stone', evolves_to: 'Flareon', new_type: TYPES.FIRE }
        ]
    },
    'Porygon': { level: null, condition: 'Upgrade', evolves_to: 'Porygon2', new_type: TYPES.NORMAL },
    'Porygon2': { level: null, condition: 'Dubious Disc', evolves_to: 'Porygon-Z', new_type: TYPES.NORMAL }, // New Gen 4
    'Omanyte': { level: 40, evolves_to: 'Omastar', new_type: TYPES.WATER },
    'Kabuto': { level: 40, evolves_to: 'Kabutops', new_type: TYPES.WATER },
    'Dratini': { level: 30, evolves_to: 'Dragonair', new_type: TYPES.DRAGON },
    'Dragonair': { level: 55, evolves_to: 'Dragonite', new_type: TYPES.DRAGON },

    // --- GEN 2 (Johto) ---
    'Chikorita': { level: 16, evolves_to: 'Bayleef', new_type: TYPES.GRASS },
    'Bayleef': { level: 32, evolves_to: 'Meganium', new_type: TYPES.GRASS },
    'Cyndaquil': { level: 14, evolves_to: 'Quilava', new_type: TYPES.FIRE },
    'Quilava': { level: 36, evolves_to: 'Typhlosion', new_type: TYPES.FIRE },
    'Totodile': { level: 18, evolves_to: 'Croconaw', new_type: TYPES.WATER },
    'Croconaw': { level: 30, evolves_to: 'Feraligatr', new_type: TYPES.WATER },
    'Sentret': { level: 15, evolves_to: 'Furret', new_type: TYPES.NORMAL },
    'Hoothoot': { level: 20, evolves_to: 'Noctowl', new_type: TYPES.FLYING },
    'Ledyba': { level: 18, evolves_to: 'Ledian', new_type: TYPES.BUG },
    'Spinarak': { level: 22, evolves_to: 'Ariados', new_type: TYPES.BUG },
    'Chinchou': { level: 27, evolves_to: 'Lanturn', new_type: TYPES.ELECTRIC },
    'Pichu': { level: null, condition: 'Friendship', evolves_to: 'Pikachu', new_type: TYPES.ELECTRIC },
    'Cleffa': { level: null, condition: 'Friendship', evolves_to: 'Clefairy', new_type: TYPES.NORMAL },
    'Igglybuff': { level: null, condition: 'Friendship', evolves_to: 'Jigglypuff', new_type: TYPES.NORMAL },
    'Togepi': { level: null, condition: 'Friendship', evolves_to: 'Togetic', new_type: TYPES.FAIRY },
    'Togetic': { level: null, condition: 'shiny_stone', evolves_to: 'Togekiss', new_type: TYPES.FAIRY }, // New Gen 4
    'Natu': { level: 25, evolves_to: 'Xatu', new_type: TYPES.PSYCHIC },
    'Mareep': { level: 15, evolves_to: 'Flaaffy', new_type: TYPES.ELECTRIC },
    'Flaaffy': { level: 30, evolves_to: 'Ampharos', new_type: TYPES.ELECTRIC },
    'Marill': { level: 18, evolves_to: 'Azumarill', new_type: TYPES.WATER },
    'Hoppip': { level: 18, evolves_to: 'Skiploom', new_type: TYPES.GRASS },
    'Skiploom': { level: 27, evolves_to: 'Jumpluff', new_type: TYPES.GRASS },
    'Aipom': { level: 32, condition: 'Double Hit', evolves_to: 'Ambipom', new_type: TYPES.NORMAL }, // New Gen 4
    'Sunkern': { level: null, condition: 'sun_stone', evolves_to: 'Sunflora', new_type: TYPES.GRASS },
    'Yanma': { level: 33, condition: 'Ancient Power', evolves_to: 'Yanmega', new_type: TYPES.BUG }, // New Gen 4
    'Wooper': { level: 20, evolves_to: 'Quagsire', new_type: TYPES.GROUND },
    'Murkrow': { level: null, condition: 'dusk_stone', evolves_to: 'Honchkrow', new_type: TYPES.DARK }, // New Gen 4
    'Misdreavus': { level: null, condition: 'dusk_stone', evolves_to: 'Mismagius', new_type: TYPES.GHOST }, // New Gen 4
    'Pineco': { level: 31, evolves_to: 'Forretress', new_type: TYPES.STEEL },
    'Gligar': { level: null, condition: 'Razor Fang (Night)', evolves_to: 'Gliscor', new_type: TYPES.GROUND }, // New Gen 4
    'Snubbull': { level: 23, evolves_to: 'Granbull', new_type: TYPES.NORMAL },
    'Sneasel': { level: null, condition: 'Razor Claw (Night)', evolves_to: 'Weavile', new_type: TYPES.ICE }, // New Gen 4
    'Teddiursa': { level: 30, evolves_to: 'Ursaring', new_type: TYPES.NORMAL },
    'Slugma': { level: 38, evolves_to: 'Magcargo', new_type: TYPES.FIRE },
    'Swinub': { level: 33, evolves_to: 'Piloswine', new_type: TYPES.ICE },
    'Piloswine': { level: null, condition: 'Ancient Power', evolves_to: 'Mamoswine', new_type: TYPES.ICE }, // New Gen 4
    'Remoraid': { level: 25, evolves_to: 'Octillery', new_type: TYPES.WATER },
    'Houndour': { level: 24, evolves_to: 'Houndoom', new_type: TYPES.DARK },
    'Phanpy': { level: 25, evolves_to: 'Donphan', new_type: TYPES.GROUND },
    'Tyrogue': { level: 20, evolves_to: 'Hitmonlee', new_type: TYPES.FIGHTING }, // Branching: Hitmonchan / Hitmontop based on stats
    'Smoochum': { level: 30, evolves_to: 'Jynx', new_type: TYPES.ICE },
    'Elekid': { level: 30, evolves_to: 'Electabuzz', new_type: TYPES.ELECTRIC },
    'Magby': { level: 30, evolves_to: 'Magmar', new_type: TYPES.FIRE },
    'Larvitar': { level: 30, evolves_to: 'Pupitar', new_type: TYPES.GROUND },
    'Pupitar': { level: 55, evolves_to: 'Tyranitar', new_type: TYPES.ROCK },

    // --- GEN 3 (Hoenn) ---
    'Treecko': { level: 16, evolves_to: 'Grovyle', new_type: TYPES.GRASS },
    'Grovyle': { level: 36, evolves_to: 'Sceptile', new_type: TYPES.GRASS },
    'Torchic': { level: 16, evolves_to: 'Combusken', new_type: TYPES.FIRE },
    'Combusken': { level: 36, evolves_to: 'Blaziken', new_type: TYPES.FIRE },
    'Mudkip': { level: 16, evolves_to: 'Marshtomp', new_type: TYPES.WATER },
    'Marshtomp': { level: 36, evolves_to: 'Swampert', new_type: TYPES.WATER },
    'Poochyena': { level: 18, evolves_to: 'Mightyena', new_type: TYPES.DARK },
    'Zigzagoon': { level: 20, evolves_to: 'Linoone', new_type: TYPES.NORMAL },
    'Wurmple': { level: 7, evolves_to: 'Silcoon', new_type: TYPES.BUG }, // Branching: Cascoon
    'Silcoon': { level: 10, evolves_to: 'Beautifly', new_type: TYPES.BUG },
    'Cascoon': { level: 10, evolves_to: 'Dustox', new_type: TYPES.BUG },
    'Lotad': { level: 14, evolves_to: 'Lombre', new_type: TYPES.WATER },
    'Lombre': { level: null, condition: 'water_stone', evolves_to: 'Ludicolo', new_type: TYPES.WATER },
    'Seedot': { level: 14, evolves_to: 'Nuzleaf', new_type: TYPES.GRASS },
    'Nuzleaf': { level: null, condition: 'leaf_stone', evolves_to: 'Shiftry', new_type: TYPES.GRASS },
    'Taillow': { level: 22, evolves_to: 'Swellow', new_type: TYPES.FLYING },
    'Wingull': { level: 25, evolves_to: 'Pelipper', new_type: TYPES.FLYING },
    'Ralts': { level: 20, evolves_to: 'Kirlia', new_type: TYPES.PSYCHIC },
    'Kirlia': {
        level: 30,
        evolves_to: 'Gardevoir',
        new_type: TYPES.PSYCHIC,
        options: [
            { level: 30, evolves_to: 'Gardevoir', new_type: TYPES.PSYCHIC },
            { conditionItem: 'dawn_stone', evolves_to: 'Gallade', new_type: TYPES.FIGHTING }
        ]
    },
    'Surskit': { level: 22, evolves_to: 'Masquerain', new_type: TYPES.FLYING },
    'Shroomish': { level: 23, evolves_to: 'Breloom', new_type: TYPES.FIGHTING },
    'Slakoth': { level: 18, evolves_to: 'Vigoroth', new_type: TYPES.NORMAL },
    'Vigoroth': { level: 36, evolves_to: 'Slaking', new_type: TYPES.NORMAL },
    'Nincada': { level: 20, evolves_to: 'Ninjask', new_type: TYPES.BUG }, // Special: Shedinja
    'Whismur': { level: 20, evolves_to: 'Loudred', new_type: TYPES.NORMAL },
    'Loudred': { level: 40, evolves_to: 'Exploud', new_type: TYPES.NORMAL },
    'Makuhita': { level: 24, evolves_to: 'Hariyama', new_type: TYPES.FIGHTING },
    'Azurill': { level: null, condition: 'Friendship', evolves_to: 'Marill', new_type: TYPES.WATER },
    'Nosepass': { level: null, condition: 'Magnetic Field', evolves_to: 'Probopass', new_type: TYPES.ROCK }, // New Gen 4
    'Skitty': { level: null, condition: 'moon_stone', evolves_to: 'Delcatty', new_type: TYPES.NORMAL },
    'Aron': { level: 32, evolves_to: 'Lairon', new_type: TYPES.STEEL },
    'Lairon': { level: 42, evolves_to: 'Aggron', new_type: TYPES.STEEL },
    'Meditite': { level: 37, evolves_to: 'Medicham', new_type: TYPES.FIGHTING },
    'Electrike': { level: 26, evolves_to: 'Manectric', new_type: TYPES.ELECTRIC },
    'Roselia': { level: null, condition: 'shiny_stone', evolves_to: 'Roserade', new_type: TYPES.GRASS }, // New Gen 4
    'Gulpin': { level: 26, evolves_to: 'Swalot', new_type: TYPES.POISON },
    'Carvanha': { level: 30, evolves_to: 'Sharpedo', new_type: TYPES.DARK },
    'Wailmer': { level: 40, evolves_to: 'Wailord', new_type: TYPES.WATER },
    'Numel': { level: 33, evolves_to: 'Camerupt', new_type: TYPES.FIRE },
    'Spoink': { level: 32, evolves_to: 'Grumpig', new_type: TYPES.PSYCHIC },
    'Trapinch': { level: 35, evolves_to: 'Vibrava', new_type: TYPES.DRAGON }, // Type change here
    'Vibrava': { level: 45, evolves_to: 'Flygon', new_type: TYPES.DRAGON },
    'Cacnea': { level: 32, evolves_to: 'Cacturne', new_type: TYPES.DARK },
    'Swablu': { level: 35, evolves_to: 'Altaria', new_type: TYPES.DRAGON },
    'Barboach': { level: 30, evolves_to: 'Whiscash', new_type: TYPES.GROUND },
    'Corphish': { level: 30, evolves_to: 'Crawdaunt', new_type: TYPES.DARK },
    'Baltoy': { level: 36, evolves_to: 'Claydol', new_type: TYPES.PSYCHIC },
    'Lileep': { level: 40, evolves_to: 'Cradily', new_type: TYPES.GRASS },
    'Anorith': { level: 40, evolves_to: 'Armaldo', new_type: TYPES.BUG },
    'Feebas': { level: null, condition: 'Beauty/Prism Scale', evolves_to: 'Milotic', new_type: TYPES.WATER },
    'Shuppet': { level: 37, evolves_to: 'Banette', new_type: TYPES.GHOST },
    'Duskull': { level: 37, evolves_to: 'Dusclops', new_type: TYPES.GHOST },
    'Dusclops': { level: null, condition: 'Reaper Cloth', evolves_to: 'Dusknoir', new_type: TYPES.GHOST }, // New Gen 4
    'Wynaut': { level: 15, evolves_to: 'Wobbuffet', new_type: TYPES.PSYCHIC },
    'Snorunt': {
        level: 42,
        evolves_to: 'Glalie',
        new_type: TYPES.ICE,
        options: [
            { level: 42, evolves_to: 'Glalie', new_type: TYPES.ICE },
            { conditionItem: 'dawn_stone', evolves_to: 'Froslass', new_type: TYPES.GHOST }
        ]
    },
    'Spheal': { level: 32, evolves_to: 'Sealeo', new_type: TYPES.ICE },
    'Sealeo': { level: 44, evolves_to: 'Walrein', new_type: TYPES.ICE },
    'Clamperl': { level: null, condition: 'Trade', evolves_to: 'Huntail', new_type: TYPES.WATER }, // Branching: Deep Sea Scale -> Gorebyss
    'Bagon': { level: 30, evolves_to: 'Shelgon', new_type: TYPES.DRAGON },
    'Shelgon': { level: 50, evolves_to: 'Salamence', new_type: TYPES.DRAGON },
    'Beldum': { level: 20, evolves_to: 'Metang', new_type: TYPES.STEEL },
    'Metang': { level: 45, evolves_to: 'Metagross', new_type: TYPES.STEEL },

    // --- GEN 4 (Sinnoh) - LE GROS MANQUE PRÉCÉDENT ---
    'Turtwig': { level: 18, evolves_to: 'Grotle', new_type: TYPES.GRASS },
    'Grotle': { level: 32, evolves_to: 'Torterra', new_type: TYPES.GROUND },
    'Chimchar': { level: 14, evolves_to: 'Monferno', new_type: TYPES.FIGHTING }, // Monferno gagne le type combat
    'Monferno': { level: 36, evolves_to: 'Infernape', new_type: TYPES.FIGHTING },
    'Piplup': { level: 16, evolves_to: 'Prinplup', new_type: TYPES.WATER },
    'Prinplup': { level: 36, evolves_to: 'Empoleon', new_type: TYPES.STEEL }, // Empoleon gagne le type acier
    'Starly': { level: 14, evolves_to: 'Staravia', new_type: TYPES.FLYING },
    'Staravia': { level: 34, evolves_to: 'Staraptor', new_type: TYPES.FLYING },
    'Bidoof': { level: 15, evolves_to: 'Bibarel', new_type: TYPES.WATER },
    'Kricketot': { level: 10, evolves_to: 'Kricketune', new_type: TYPES.BUG },
    'Shinx': { level: 15, evolves_to: 'Luxio', new_type: TYPES.ELECTRIC },
    'Luxio': { level: 30, evolves_to: 'Luxray', new_type: TYPES.ELECTRIC },
    'Budew': { level: null, condition: 'Friendship (Day)', evolves_to: 'Roselia', new_type: TYPES.GRASS },
    'Cranidos': { level: 30, evolves_to: 'Rampardos', new_type: TYPES.ROCK },
    'Shieldon': { level: 30, evolves_to: 'Bastiodon', new_type: TYPES.STEEL },
    'Burmy': { level: 20, evolves_to: 'Wormadam', new_type: TYPES.BUG }, // Branching: Male -> Mothim
    'Combee': { level: 21, condition: 'Female', evolves_to: 'Vespiquen', new_type: TYPES.FLYING },
    'Buizel': { level: 26, evolves_to: 'Floatzel', new_type: TYPES.WATER },
    'Cherubi': { level: 25, evolves_to: 'Cherrim', new_type: TYPES.GRASS },
    'Shellos': { level: 30, evolves_to: 'Gastrodon', new_type: TYPES.GROUND },
    'Drifloon': { level: 28, evolves_to: 'Drifblim', new_type: TYPES.GHOST },
    'Buneary': { level: null, condition: 'Friendship', evolves_to: 'Lopunny', new_type: TYPES.NORMAL },
    'Glameow': { level: 38, evolves_to: 'Purugly', new_type: TYPES.NORMAL },
    'Chingling': { level: null, condition: 'Friendship (Night)', evolves_to: 'Chimecho', new_type: TYPES.PSYCHIC },
    'Stunky': { level: 34, evolves_to: 'Skuntank', new_type: TYPES.DARK },
    'Bronzor': { level: 33, evolves_to: 'Bronzong', new_type: TYPES.STEEL },
    'Bonsly': { level: null, condition: 'Know Mimic', evolves_to: 'Sudowoodo', new_type: TYPES.ROCK },
    'Mime Jr.': { level: null, condition: 'Know Mimic', evolves_to: 'Mr. Mime', new_type: TYPES.PSYCHIC },
    'Happiny': { level: null, condition: 'oval_stone', evolves_to: 'Chansey', new_type: TYPES.NORMAL },
    'Gible': { level: 24, evolves_to: 'Gabite', new_type: TYPES.DRAGON },
    'Gabite': { level: 48, evolves_to: 'Garchomp', new_type: TYPES.DRAGON },
    'Munchlax': { level: null, condition: 'Friendship', evolves_to: 'Snorlax', new_type: TYPES.NORMAL },
    'Riolu': { level: null, condition: 'Friendship (Day)', evolves_to: 'Lucario', new_type: TYPES.STEEL }, // Lucario gagne Acier
    'Hippopotas': { level: 34, evolves_to: 'Hippowdon', new_type: TYPES.GROUND },
    'Skorupi': { level: 40, evolves_to: 'Drapion', new_type: TYPES.DARK }, // Drapion devient Poison/Tenebres
    'Croagunk': { level: 37, evolves_to: 'Toxicroak', new_type: TYPES.FIGHTING },
    'Finneon': { level: 31, evolves_to: 'Lumineon', new_type: TYPES.WATER },
    'Mantyke': { level: null, condition: 'Party with Remoraid', evolves_to: 'Mantine', new_type: TYPES.FLYING },
    'Snover': { level: 40, evolves_to: 'Abomasnow', new_type: TYPES.ICE },
    // --- GEN 3 FIXES (Manquants) ---
    'Skitty': { level: null, condition: 'moon_stone', evolves_to: 'Delcatty', new_type: TYPES.NORMAL },
    'Spoink': { level: 32, evolves_to: 'Grumpig', new_type: TYPES.PSYCHIC },
    'Swablu': { level: 35, evolves_to: 'Altaria', new_type: TYPES.DRAGON },
    'Corphish': { level: 30, evolves_to: 'Crawdaunt', new_type: TYPES.WATER },
    'Snorunt': {
        level: 42,
        evolves_to: 'Glalie',
        new_type: TYPES.ICE,
        options: [
            { level: 42, evolves_to: 'Glalie', new_type: TYPES.ICE },
            { conditionItem: 'dawn_stone', evolves_to: 'Froslass', new_type: TYPES.GHOST }
        ]
    },
    'Spheal': { level: 32, evolves_to: 'Sealeo', new_type: TYPES.ICE },
    'Sealeo': { level: 44, evolves_to: 'Walrein', new_type: TYPES.ICE },

    // --- GEN 4 : ÉVOLUTIONS D'ANCIENS POKEMON (Cross-Gen) ---
    'Magneton': { level: 30, evolves_to: 'Magnezone', new_type: TYPES.ELECTRIC }, // Champ Magnétique -> Niv 30
    'Lickitung': { level: 33, evolves_to: 'Lickilicky', new_type: TYPES.NORMAL }, // Apprend Roulade -> Niv 33
    'Tangela': { level: 33, evolves_to: 'Tangrowth', new_type: TYPES.GRASS }, // Pouv. Antique -> Niv 33
    'Aipom': { level: 32, evolves_to: 'Ambipom', new_type: TYPES.NORMAL }, // Coup Double -> Niv 32
    'Yanma': { level: 33, evolves_to: 'Yanmega', new_type: TYPES.BUG }, // Pouv. Antique -> Niv 33
    'Murkrow': { level: null, condition: 'dusk_stone', evolves_to: 'Honchkrow', new_type: TYPES.DARK },
    'Misdreavus': { level: null, condition: 'dusk_stone', evolves_to: 'Mismagius', new_type: TYPES.GHOST },
    'Sneasel': { level: 30, evolves_to: 'Weavile', new_type: TYPES.DARK }, // Griffe Rasoir -> Niv 30
    'Nosepass': { level: 30, evolves_to: 'Probopass', new_type: TYPES.ROCK }, // Champ Magnétique -> Niv 30
    'Dusclops': { level: 40, evolves_to: 'Dusknoir', new_type: TYPES.GHOST }, // Tissu Fauche -> Niv 40
    'Roselia': { level: null, condition: 'shiny_stone', evolves_to: 'Roserade', new_type: TYPES.GRASS },
    'Piloswine': { level: 33, evolves_to: 'Mamoswine', new_type: TYPES.ICE }, // Pouv. Antique -> Niv 33
    'Togetic': { level: null, condition: 'shiny_stone', evolves_to: 'Togekiss', new_type: TYPES.FAIRY },

    // --- GEN 4 : NOUVEAUX POKEMON SINNOH ---
    'Cranidos': { level: 30, evolves_to: 'Rampardos', new_type: TYPES.ROCK },
    'Shieldon': { level: 30, evolves_to: 'Bastiodon', new_type: TYPES.STEEL },
    'Burmy': { level: 20, evolves_to: 'Wormadam', new_type: TYPES.BUG }, // Femelle par défaut ici
    'Combee': { level: 21, evolves_to: 'Vespiquen', new_type: TYPES.BUG }, // Femelle par défaut
    'Buizel': { level: 26, evolves_to: 'Floatzel', new_type: TYPES.WATER },
    'Cherubi': { level: 25, evolves_to: 'Cherrim', new_type: TYPES.GRASS },
    'Shellos': { level: 30, evolves_to: 'Gastrodon', new_type: TYPES.WATER },
    'Drifloon': { level: 28, evolves_to: 'Drifblim', new_type: TYPES.GHOST },
    'Buneary': { level: 25, evolves_to: 'Lopunny', new_type: TYPES.NORMAL }, // Bonheur -> Niv 25
    'Glameow': { level: 38, evolves_to: 'Purugly', new_type: TYPES.NORMAL },
    'Stunky': { level: 34, evolves_to: 'Skuntank', new_type: TYPES.POISON },
    'Bronzor': { level: 33, evolves_to: 'Bronzong', new_type: TYPES.STEEL },
    'Munchlax': { level: 30, evolves_to: 'Snorlax', new_type: TYPES.NORMAL }, // Bonheur -> Niv 30
    'Riolu': { level: 25, evolves_to: 'Lucario', new_type: TYPES.FIGHTING }, // Bonheur -> Niv 25
    'Hippopotas': { level: 34, evolves_to: 'Hippowdon', new_type: TYPES.GROUND },
    'Skorupi': { level: 40, evolves_to: 'Drapion', new_type: TYPES.POISON },
    'Croagunk': { level: 37, evolves_to: 'Toxicroak', new_type: TYPES.FIGHTING },
    'Finneon': { level: 31, evolves_to: 'Lumineon', new_type: TYPES.WATER },
    'Mantyke': { level: 30, evolves_to: 'Mantine', new_type: TYPES.WATER }, // Avec Remoraid -> Niv 30
    'Snover': { level: 40, evolves_to: 'Abomasnow', new_type: TYPES.ICE },
};

const EVOLUTION_CONDITION_ITEM_MAP = {
    'Trade': 'trade_stone',
    'Thunder Stone': 'thunder_stone',
    'Fire Stone': 'fire_stone',
    'Water Stone': 'water_stone',
    'Leaf Stone': 'leaf_stone',
    'Moon Stone': 'moon_stone',
    'Sun Stone': 'sun_stone',
    'Shiny Stone': 'shiny_stone',
    'Dusk Stone': 'dusk_stone',
    'Dawn Stone': 'dawn_stone',
    'Oval Stone (Day)': 'oval_stone'
};

// Objets d'evolution hors "pierres" (evolutions specifiques par objet)
const EVOLUTION_SPECIAL_ITEM_IDS = [
    'metal_coat',
    'kings_rock',
    'dragon_scale',
    'upgrade',
    'prism_scale',
    'protector',
    'electirizer',
    'magmarizer',
    'reaper_cloth',
    'dubious_disc',
    'razor_claw',
    'razor_fang',
    'trade_stone'
];

const EVOLUTION_FAMILIES = {
    // Gen 1 - Starters
    'Bulbasaur': 'Bulbasaur', 'Ivysaur': 'Bulbasaur', 'Venusaur': 'Bulbasaur',
    'Charmander': 'Charmander', 'Charmeleon': 'Charmander', 'Charizard': 'Charmander',
    'Squirtle': 'Squirtle', 'Wartortle': 'Squirtle', 'Blastoise': 'Squirtle',

    // Gen 1 - Communs & Evolutions
    'Caterpie': 'Caterpie', 'Metapod': 'Caterpie', 'Butterfree': 'Caterpie',
    'Weedle': 'Weedle', 'Kakuna': 'Weedle', 'Beedrill': 'Weedle',
    'Pidgey': 'Pidgey', 'Pidgeotto': 'Pidgey', 'Pidgeot': 'Pidgey',
    'Rattata': 'Rattata', 'Raticate': 'Rattata',
    'Spearow': 'Spearow', 'Fearow': 'Spearow',
    'Ekans': 'Ekans', 'Arbok': 'Ekans',
    'Pichu': 'Pichu', 'Pikachu': 'Pichu', 'Raichu': 'Pichu', // Pichu base
    'Sandshrew': 'Sandshrew', 'Sandslash': 'Sandshrew',
    'Nidoran♀': 'Nidoran♀', 'Nidorina': 'Nidoran♀', 'Nidoqueen': 'Nidoran♀',
    'Nidoran♂': 'Nidoran♂', 'Nidorino': 'Nidoran♂', 'Nidoking': 'Nidoran♂',
    'Cleffa': 'Cleffa', 'Clefairy': 'Cleffa', 'Clefable': 'Cleffa', // Cleffa base
    'Vulpix': 'Vulpix', 'Ninetales': 'Vulpix',
    'Igglybuff': 'Igglybuff', 'Jigglypuff': 'Igglybuff', 'Wigglytuff': 'Igglybuff', // Igglybuff base
    'Zubat': 'Zubat', 'Golbat': 'Zubat', 'Crobat': 'Zubat',
    'Oddish': 'Oddish', 'Gloom': 'Oddish', 'Vileplume': 'Oddish', 'Bellossom': 'Oddish',
    'Paras': 'Paras', 'Parasect': 'Paras',
    'Venonat': 'Venonat', 'Venomoth': 'Venonat',
    'Diglett': 'Diglett', 'Dugtrio': 'Diglett',
    'Meowth': 'Meowth', 'Persian': 'Meowth',
    'Psyduck': 'Psyduck', 'Golduck': 'Psyduck',
    'Mankey': 'Mankey', 'Primeape': 'Mankey',
    'Growlithe': 'Growlithe', 'Arcanine': 'Growlithe',
    'Poliwag': 'Poliwag', 'Poliwhirl': 'Poliwag', 'Poliwrath': 'Poliwag', 'Politoed': 'Poliwag',
    'Abra': 'Abra', 'Kadabra': 'Abra', 'Alakazam': 'Abra',
    'Machop': 'Machop', 'Machoke': 'Machop', 'Machamp': 'Machop',
    'Bellsprout': 'Bellsprout', 'Weepinbell': 'Bellsprout', 'Victreebel': 'Bellsprout',
    'Tentacool': 'Tentacool', 'Tentacruel': 'Tentacool',
    'Geodude': 'Geodude', 'Graveler': 'Geodude', 'Golem': 'Geodude',
    'Ponyta': 'Ponyta', 'Rapidash': 'Ponyta',
    'Slowpoke': 'Slowpoke', 'Slowbro': 'Slowpoke', 'Slowking': 'Slowpoke',
    'Magnemite': 'Magnemite', 'Magneton': 'Magnemite', 'Magnezone': 'Magnemite',
    'Doduo': 'Doduo', 'Dodrio': 'Doduo',
    'Seel': 'Seel', 'Dewgong': 'Seel',
    'Grimer': 'Grimer', 'Muk': 'Grimer',
    'Shellder': 'Shellder', 'Cloyster': 'Shellder',
    'Gastly': 'Gastly', 'Haunter': 'Gastly', 'Gengar': 'Gastly',
    'Onix': 'Onix', 'Steelix': 'Onix',
    'Drowzee': 'Drowzee', 'Hypno': 'Drowzee',
    'Krabby': 'Krabby', 'Kingler': 'Krabby',
    'Voltorb': 'Voltorb', 'Electrode': 'Voltorb',
    'Exeggcute': 'Exeggcute', 'Exeggutor': 'Exeggcute',
    'Cubone': 'Cubone', 'Marowak': 'Cubone',
    'Tyrogue': 'Tyrogue', 'Hitmonlee': 'Tyrogue', 'Hitmonchan': 'Tyrogue', 'Hitmontop': 'Tyrogue', // Tyrogue base
    'Lickitung': 'Lickitung', 'Lickilicky': 'Lickitung',
    'Koffing': 'Koffing', 'Weezing': 'Koffing',
    'Rhyhorn': 'Rhyhorn', 'Rhydon': 'Rhyhorn', 'Rhyperior': 'Rhyhorn',
    'Happiny': 'Happiny', 'Chansey': 'Happiny', 'Blissey': 'Happiny', // Happiny base
    'Tangela': 'Tangela', 'Tangrowth': 'Tangela',
    'Kangaskhan': 'Kangaskhan',
    'Horsea': 'Horsea', 'Seadra': 'Horsea', 'Kingdra': 'Horsea',
    'Goldeen': 'Goldeen', 'Seaking': 'Goldeen',
    'Staryu': 'Staryu', 'Starmie': 'Staryu',
    'Mime Jr.': 'Mime Jr.', 'Mr. Mime': 'Mime Jr.', // Mime Jr. base
    'Scyther': 'Scyther', 'Scizor': 'Scyther',
    'Smoochum': 'Smoochum', 'Jynx': 'Smoochum', // Smoochum base
    'Elekid': 'Elekid', 'Electabuzz': 'Elekid', 'Electivire': 'Elekid', // Elekid base
    'Magby': 'Magby', 'Magmar': 'Magby', 'Magmortar': 'Magby', // Magby base
    'Pinsir': 'Pinsir',
    'Tauros': 'Tauros',
    'Magikarp': 'Magikarp', 'Gyarados': 'Magikarp',
    'Lapras': 'Lapras',
    'Ditto': 'Ditto',
    'Eevee': 'Eevee', 'Vaporeon': 'Eevee', 'Jolteon': 'Eevee', 'Flareon': 'Eevee', 'Espeon': 'Eevee', 'Umbreon': 'Eevee', 'Leafeon': 'Eevee', 'Glaceon': 'Eevee',
    'Porygon': 'Porygon', 'Porygon2': 'Porygon', 'Porygon-Z': 'Porygon',
    'Omanyte': 'Omanyte', 'Omastar': 'Omanyte',
    'Kabuto': 'Kabuto', 'Kabutops': 'Kabuto',
    'Aerodactyl': 'Aerodactyl',
    'Munchlax': 'Munchlax', 'Snorlax': 'Munchlax', // Munchlax base
    'Articuno': 'Articuno', 'Zapdos': 'Zapdos', 'Moltres': 'Moltres',
    'Dratini': 'Dratini', 'Dragonair': 'Dratini', 'Dragonite': 'Dratini',
    'Mewtwo': 'Mewtwo', 'Mew': 'Mew',

    // Gen 2
    'Chikorita': 'Chikorita', 'Bayleef': 'Chikorita', 'Meganium': 'Chikorita',
    'Cyndaquil': 'Cyndaquil', 'Quilava': 'Cyndaquil', 'Typhlosion': 'Cyndaquil',
    'Totodile': 'Totodile', 'Croconaw': 'Totodile', 'Feraligatr': 'Totodile',
    'Sentret': 'Sentret', 'Furret': 'Sentret',
    'Hoothoot': 'Hoothoot', 'Noctowl': 'Hoothoot',
    'Ledyba': 'Ledyba', 'Ledian': 'Ledyba',
    'Spinarak': 'Spinarak', 'Ariados': 'Spinarak',
    'Chinchou': 'Chinchou', 'Lanturn': 'Chinchou',
    'Togepi': 'Togepi', 'Togetic': 'Togepi', 'Togekiss': 'Togepi',
    'Natu': 'Natu', 'Xatu': 'Natu',
    'Mareep': 'Mareep', 'Flaaffy': 'Mareep', 'Ampharos': 'Mareep',
    'Azurill': 'Azurill', 'Marill': 'Azurill', 'Azumarill': 'Azurill', // Azurill base
    'Bonsly': 'Bonsly', 'Sudowoodo': 'Bonsly', // Bonsly base
    'Hoppip': 'Hoppip', 'Skiploom': 'Hoppip', 'Jumpluff': 'Hoppip',
    'Aipom': 'Aipom', 'Ambipom': 'Aipom',
    'Sunkern': 'Sunkern', 'Sunflora': 'Sunkern',
    'Yanma': 'Yanma', 'Yanmega': 'Yanma',
    'Wooper': 'Wooper', 'Quagsire': 'Wooper',
    'Murkrow': 'Murkrow', 'Honchkrow': 'Murkrow',
    'Misdreavus': 'Misdreavus', 'Mismagius': 'Misdreavus',
    'Unown': 'Unown',
    'Wynaut': 'Wynaut', 'Wobbuffet': 'Wynaut', // Wynaut base
    'Girafarig': 'Girafarig',
    'Pineco': 'Pineco', 'Forretress': 'Pineco',
    'Dunsparce': 'Dunsparce',
    'Gligar': 'Gligar', 'Gliscor': 'Gligar',
    'Snubbull': 'Snubbull', 'Granbull': 'Snubbull',
    'Qwilfish': 'Qwilfish',
    'Shuckle': 'Shuckle',
    'Heracross': 'Heracross',
    'Sneasel': 'Sneasel', 'Weavile': 'Sneasel',
    'Teddiursa': 'Teddiursa', 'Ursaring': 'Teddiursa',
    'Slugma': 'Slugma', 'Magcargo': 'Slugma',
    'Swinub': 'Swinub', 'Piloswine': 'Swinub', 'Mamoswine': 'Swinub',
    'Corsola': 'Corsola',
    'Remoraid': 'Remoraid', 'Octillery': 'Remoraid',
    'Delibird': 'Delibird',
    'Mantyke': 'Mantyke', 'Mantine': 'Mantyke', // Mantyke base
    'Skarmory': 'Skarmory',
    'Houndour': 'Houndour', 'Houndoom': 'Houndour',
    'Phanpy': 'Phanpy', 'Donphan': 'Phanpy',
    'Stantler': 'Stantler',
    'Smeargle': 'Smeargle',
    'Miltank': 'Miltank',
    'Raikou': 'Raikou', 'Entei': 'Entei', 'Suicune': 'Suicune',
    'Larvitar': 'Larvitar', 'Pupitar': 'Larvitar', 'Tyranitar': 'Larvitar',
    'Lugia': 'Lugia', 'Ho-Oh': 'Ho-Oh', 'Celebi': 'Celebi',

    // Gen 3
    'Treecko': 'Treecko', 'Grovyle': 'Treecko', 'Sceptile': 'Treecko',
    'Torchic': 'Torchic', 'Combusken': 'Torchic', 'Blaziken': 'Torchic',
    'Mudkip': 'Mudkip', 'Marshtomp': 'Mudkip', 'Swampert': 'Mudkip',
    'Poochyena': 'Poochyena', 'Mightyena': 'Poochyena',
    'Zigzagoon': 'Zigzagoon', 'Linoone': 'Zigzagoon',
    'Wurmple': 'Wurmple', 'Silcoon': 'Wurmple', 'Beautifly': 'Wurmple', 'Cascoon': 'Wurmple', 'Dustox': 'Wurmple',
    'Lotad': 'Lotad', 'Lombre': 'Lotad', 'Ludicolo': 'Lotad',
    'Seedot': 'Seedot', 'Nuzleaf': 'Seedot', 'Shiftry': 'Seedot',
    'Taillow': 'Taillow', 'Swellow': 'Taillow',
    'Wingull': 'Wingull', 'Pelipper': 'Wingull',
    'Ralts': 'Ralts', 'Kirlia': 'Ralts', 'Gardevoir': 'Ralts', 'Gallade': 'Ralts',
    'Surskit': 'Surskit', 'Masquerain': 'Surskit',
    'Shroomish': 'Shroomish', 'Breloom': 'Shroomish',
    'Slakoth': 'Slakoth', 'Vigoroth': 'Slakoth', 'Slaking': 'Slakoth',
    'Nincada': 'Nincada', 'Ninjask': 'Nincada', 'Shedinja': 'Nincada',
    'Whismur': 'Whismur', 'Loudred': 'Whismur', 'Exploud': 'Whismur',
    'Makuhita': 'Makuhita', 'Hariyama': 'Makuhita',
    'Nosepass': 'Nosepass', 'Probopass': 'Nosepass',
    'Skitty': 'Skitty', 'Delcatty': 'Skitty',
    'Sableye': 'Sableye', 'Mawile': 'Mawile',
    'Aron': 'Aron', 'Lairon': 'Aron', 'Aggron': 'Aron',
    'Meditite': 'Meditite', 'Medicham': 'Meditite',
    'Electrike': 'Electrike', 'Manectric': 'Electrike',
    'Plusle': 'Plusle', 'Minun': 'Minun',
    'Volbeat': 'Volbeat', 'Illumise': 'Illumise',
    'Budew': 'Budew', 'Roselia': 'Budew', 'Roserade': 'Budew', // Budew base
    'Gulpin': 'Gulpin', 'Swalot': 'Gulpin',
    'Carvanha': 'Carvanha', 'Sharpedo': 'Carvanha',
    'Wailmer': 'Wailmer', 'Wailord': 'Wailmer',
    'Numel': 'Numel', 'Camerupt': 'Numel',
    'Torkoal': 'Torkoal',
    'Spoink': 'Spoink', 'Grumpig': 'Spoink',
    'Trapinch': 'Trapinch', 'Vibrava': 'Trapinch', 'Flygon': 'Trapinch',
    'Cacnea': 'Cacnea', 'Cacturne': 'Cacnea',
    'Swablu': 'Swablu', 'Altaria': 'Swablu',
    'Zangoose': 'Zangoose', 'Seviper': 'Seviper',
    'Lunatone': 'Lunatone', 'Solrock': 'Solrock',
    'Barboach': 'Barboach', 'Whiscash': 'Barboach',
    'Corphish': 'Corphish', 'Crawdaunt': 'Corphish',
    'Baltoy': 'Baltoy', 'Claydol': 'Baltoy',
    'Lileep': 'Lileep', 'Cradily': 'Lileep',
    'Anorith': 'Anorith', 'Armaldo': 'Anorith',
    'Feebas': 'Feebas', 'Milotic': 'Feebas',
    'Castform': 'Castform',
    'Spinda': 'Spinda',
    'Kecleon': 'Kecleon',
    'Shuppet': 'Shuppet', 'Banette': 'Shuppet',
    'Duskull': 'Duskull', 'Dusclops': 'Duskull', 'Dusknoir': 'Duskull',
    'Tropius': 'Tropius',
    'Chingling': 'Chingling', 'Chimecho': 'Chingling', // Chingling base
    'Absol': 'Absol',
    'Snorunt': 'Snorunt', 'Glalie': 'Snorunt', 'Froslass': 'Snorunt',
    'Spheal': 'Spheal', 'Sealeo': 'Spheal', 'Walrein': 'Spheal',
    'Clamperl': 'Clamperl', 'Huntail': 'Clamperl', 'Gorebyss': 'Clamperl',
    'Relicanth': 'Relicanth',
    'Luvdisc': 'Luvdisc',
    'Bagon': 'Bagon', 'Shelgon': 'Bagon', 'Salamence': 'Bagon',
    'Beldum': 'Beldum', 'Metang': 'Beldum', 'Metagross': 'Beldum',
    'Regirock': 'Regirock', 'Regice': 'Regice', 'Registeel': 'Registeel',
    'Latias': 'Latias', 'Latios': 'Latios',
    'Kyogre': 'Kyogre', 'Groudon': 'Groudon', 'Rayquaza': 'Rayquaza',
    'Jirachi': 'Jirachi', 'Deoxys': 'Deoxys',

    // Gen 4 (selected)
    'Turtwig': 'Turtwig', 'Grotle': 'Turtwig', 'Torterra': 'Turtwig',
    'Chimchar': 'Chimchar', 'Monferno': 'Chimchar', 'Infernape': 'Chimchar',
    'Piplup': 'Piplup', 'Prinplup': 'Piplup', 'Empoleon': 'Piplup',
    'Starly': 'Starly', 'Staravia': 'Starly', 'Staraptor': 'Starly',
    'Bidoof': 'Bidoof', 'Bibarel': 'Bidoof',
    'Kricketot': 'Kricketot', 'Kricketune': 'Kricketot',
    'Shinx': 'Shinx', 'Luxio': 'Shinx', 'Luxray': 'Shinx',
    'Cranidos': 'Cranidos', 'Rampardos': 'Cranidos',
    'Shieldon': 'Shieldon', 'Bastiodon': 'Shieldon',
    'Burmy': 'Burmy', 'Wormadam': 'Burmy', 'Mothim': 'Burmy',
    'Combee': 'Combee', 'Vespiquen': 'Combee',
    'Pachirisu': 'Pachirisu',
    'Buizel': 'Buizel', 'Floatzel': 'Buizel',
    'Cherubi': 'Cherubi', 'Cherrim': 'Cherubi',
    'Shellos': 'Shellos', 'Gastrodon': 'Shellos',
    'Drifloon': 'Drifloon', 'Drifblim': 'Drifloon',
    'Buneary': 'Buneary', 'Lopunny': 'Buneary',
    'Glameow': 'Glameow', 'Purugly': 'Glameow',
    'Stunky': 'Stunky', 'Skuntank': 'Stunky',
    'Bronzor': 'Bronzor', 'Bronzong': 'Bronzor',
    'Chatot': 'Chatot',
    'Spiritomb': 'Spiritomb',
    'Gible': 'Gible', 'Gabite': 'Gible', 'Garchomp': 'Gible',
    'Riolu': 'Riolu', 'Lucario': 'Riolu',
    'Hippopotas': 'Hippopotas', 'Hippowdon': 'Hippopotas',
    'Skorupi': 'Skorupi', 'Drapion': 'Skorupi',
    'Croagunk': 'Croagunk', 'Toxicroak': 'Croagunk',
    'Carnivine': 'Carnivine',
    'Finneon': 'Finneon', 'Lumineon': 'Finneon',
    'Snover': 'Snover', 'Abomasnow': 'Snover',
    'Rotom': 'Rotom',
    'Uxie': 'Uxie', 'Mesprit': 'Mesprit', 'Azelf': 'Azelf',
    'Dialga': 'Dialga', 'Palkia': 'Palkia', 'Heatran': 'Heatran', 'Regigigas': 'Regigigas',
    'Giratina': 'Giratina', 'Cresselia': 'Cresselia', 'Phione': 'Phione', 'Manaphy': 'Manaphy',
    'Darkrai': 'Darkrai', 'Shaymin': 'Shaymin', 'Arceus': 'Arceus'
};

const POKEMON_SPRITE_IDS = {
    // Gen 1 - Starters
    'Bulbasaur': 1, 'Ivysaur': 2, 'Venusaur': 3,
    'Charmander': 4, 'Charmeleon': 5, 'Charizard': 6,
    'Squirtle': 7, 'Wartortle': 8, 'Blastoise': 9,

    // --- GEN 2 (Manquants) ---
    'Chikorita': 152, 'Bayleef': 153, 'Meganium': 154,
    'Cyndaquil': 155, 'Quilava': 156, 'Typhlosion': 157,
    'Totodile': 158, 'Croconaw': 159, 'Feraligatr': 160,
    'Bellossom': 182,
    'Politoed': 186,
    'Aipom': 190,
    'Yanma': 193,
    'Slowking': 199,
    'Unown': 201,
    'Girafarig': 203,
    'Dunsparce': 206,
    'Qwilfish': 211,
    'Mantine': 226,
    'Porygon2': 233,
    'Tyrogue': 236, 'Hitmontop': 237,
    'Smoochum': 238,
    'Elekid': 239,
    'Magby': 240,
    'Blissey': 242,

    // --- GEN 3 (Manquants) ---
    'Azurill': 298,
    'Spinda': 327,
    'Castform': 351,
    'Kecleon': 352,
    'Chimecho': 358,
    'Wynaut': 360,

    // --- GEN 4 (Manquants) ---
    'Burmy': 412, 'Wormadam': 413, 'Mothim': 414,

    // Gen 1 - Communs
    'Caterpie': 10, 'Metapod': 11, 'Butterfree': 12,
    'Weedle': 13, 'Kakuna': 14, 'Beedrill': 15,
    'Pidgey': 16, 'Pidgeotto': 17, 'Pidgeot': 18,
    'Rattata': 19, 'Raticate': 20,
    'Spearow': 21, 'Fearow': 22,
    'Ekans': 23, 'Arbok': 24,
    'Pikachu': 25, 'Raichu': 26,
    'Sandshrew': 27, 'Sandslash': 28,
    'Nidoran♀': 29, 'Nidorina': 30, 'Nidoqueen': 31,
    'Nidoran♂': 32, 'Nidorino': 33, 'Nidoking': 34,
    'Clefairy': 35, 'Clefable': 36,
    'Vulpix': 37, 'Ninetales': 38,
    'Jigglypuff': 39, 'Wigglytuff': 40,
    'Zubat': 41, 'Golbat': 42, 'Crobat': 169,
    'Oddish': 43, 'Gloom': 44, 'Vileplume': 45,
    'Paras': 46, 'Parasect': 47,
    'Venonat': 48, 'Venomoth': 49,
    'Diglett': 50, 'Dugtrio': 51,
    'Meowth': 52, 'Persian': 53,
    'Psyduck': 54, 'Golduck': 55,
    'Mankey': 56, 'Primeape': 57,
    'Growlithe': 58, 'Arcanine': 59,
    'Poliwag': 60, 'Poliwhirl': 61, 'Poliwrath': 62,
    'Abra': 63, 'Kadabra': 64, 'Alakazam': 65,
    'Machop': 66, 'Machoke': 67, 'Machamp': 68,
    'Bellsprout': 69, 'Weepinbell': 70, 'Victreebel': 71,
    'Tentacool': 72, 'Tentacruel': 73,
    'Geodude': 74, 'Graveler': 75, 'Golem': 76,
    'Ponyta': 77, 'Rapidash': 78,
    'Slowpoke': 79, 'Slowbro': 80,
    'Magnemite': 81, 'Magneton': 82,
    'Farfetch\'d': 83,
    'Doduo': 84, 'Dodrio': 85,
    'Seel': 86, 'Dewgong': 87,
    'Grimer': 88, 'Muk': 89,
    'Shellder': 90, 'Cloyster': 91,
    'Gastly': 92, 'Haunter': 93, 'Gengar': 94,
    'Onix': 95, 'Steelix': 208,
    'Drowzee': 96, 'Hypno': 97,
    'Krabby': 98, 'Kingler': 99,
    'Voltorb': 100, 'Electrode': 101,
    'Exeggcute': 102, 'Exeggutor': 103,
    'Cubone': 104, 'Marowak': 105,
    'Hitmonlee': 106, 'Hitmonchan': 107,
    'Lickitung': 108,
    'Koffing': 109, 'Weezing': 110,
    'Rhyhorn': 111, 'Rhydon': 112,
    'Chansey': 113,
    'Tangela': 114,
    'Kangaskhan': 115,
    'Horsea': 116, 'Seadra': 117, 'Kingdra': 230,
    'Goldeen': 118, 'Seaking': 119,
    'Staryu': 120, 'Starmie': 121,
    'Mr. Mime': 122,
    'Scyther': 123, 'Scizor': 212,
    'Jynx': 124,
    'Electabuzz': 125,
    'Magmar': 126,
    'Pinsir': 127,
    'Tauros': 128,
    'Magikarp': 129, 'Gyarados': 130,
    'Lapras': 131,
    'Ditto': 132,
    'Eevee': 133,
    'Vaporeon': 134, 'Jolteon': 135, 'Flareon': 136, 'Espeon': 196, 'Umbreon': 197,
    'Porygon': 137,
    'Omanyte': 138, 'Omastar': 139,
    'Kabuto': 140, 'Kabutops': 141,
    'Aerodactyl': 142,
    'Snorlax': 143,
    'Articuno': 144, 'Zapdos': 145, 'Moltres': 146,
    'Dratini': 147, 'Dragonair': 148, 'Dragonite': 149,
    'Mewtwo': 150, 'Mew': 151,
    'Sentret': 161, 'Furret': 162,
    'Hoothoot': 163, 'Noctowl': 164,
    'Ledyba': 165, 'Ledian': 166,
    'Spinarak': 167, 'Ariados': 168,
    'Chinchou': 170, 'Lanturn': 171,
    'Pichu': 172, 'Cleffa': 173, 'Igglybuff': 174,
    'Togepi': 175, 'Togetic': 176, 'Togekiss': 468,
    'Natu': 177, 'Xatu': 178,
    'Mareep': 179, 'Flaaffy': 180, 'Ampharos': 181,
    'Marill': 183, 'Azumarill': 184,
    'Sudowoodo': 185,
    'Hoppip': 187, 'Skiploom': 188, 'Jumpluff': 189,
    'Sunkern': 191, 'Sunflora': 192,
    'Wooper': 194, 'Quagsire': 195,
    'Murkrow': 198, 'Honchkrow': 430,
    'Misdreavus': 200, 'Mismagius': 429,
    'Wobbuffet': 202,
    'Pineco': 204, 'Forretress': 205,
    'Gligar': 207, 'Gliscor': 472,
    'Snubbull': 209, 'Granbull': 210,
    'Shuckle': 213,
    'Heracross': 214,
    'Sneasel': 215, 'Weavile': 461,
    'Teddiursa': 216, 'Ursaring': 217,
    'Slugma': 218, 'Magcargo': 219,
    'Swinub': 220, 'Piloswine': 221, 'Mamoswine': 473,
    'Corsola': 222,
    'Remoraid': 223, 'Octillery': 224,
    'Delibird': 225,
    'Skarmory': 227,
    'Houndour': 228, 'Houndoom': 229,
    'Phanpy': 231, 'Donphan': 232,
    'Stantler': 234,
    'Smeargle': 235,
    'Miltank': 241,
    'Raikou': 243, 'Entei': 244, 'Suicune': 245,
    'Larvitar': 246, 'Pupitar': 247, 'Tyranitar': 248,
    'Lugia': 249, 'Ho-Oh': 250, 'Celebi': 251,
    'Treecko': 252, 'Grovyle': 253, 'Sceptile': 254,
    'Torchic': 255, 'Combusken': 256, 'Blaziken': 257,
    'Mudkip': 258, 'Marshtomp': 259, 'Swampert': 260,
    'Poochyena': 261, 'Mightyena': 262,
    'Zigzagoon': 263, 'Linoone': 264,
    'Wurmple': 265, 'Silcoon': 266, 'Beautifly': 267, 'Cascoon': 268, 'Dustox': 269,
    'Lotad': 270, 'Lombre': 271, 'Ludicolo': 272,
    'Seedot': 273, 'Nuzleaf': 274, 'Shiftry': 275,
    'Taillow': 276, 'Swellow': 277,
    'Wingull': 278, 'Pelipper': 279,
    'Ralts': 280, 'Kirlia': 281, 'Gardevoir': 282, 'Gallade': 475,
    'Surskit': 283, 'Masquerain': 284,
    'Shroomish': 285, 'Breloom': 286,
    'Slakoth': 287, 'Vigoroth': 288, 'Slaking': 289,
    'Nincada': 290, 'Ninjask': 291, 'Shedinja': 292,
    'Whismur': 293, 'Loudred': 294, 'Exploud': 295,
    'Makuhita': 296, 'Hariyama': 297,
    'Nosepass': 299, 'Probopass': 476,
    'Skitty': 300, 'Delcatty': 301,
    'Sableye': 302, 'Mawile': 303,
    'Aron': 304, 'Lairon': 305, 'Aggron': 306,
    'Meditite': 307, 'Medicham': 308,
    'Electrike': 309, 'Manectric': 310,
    'Plusle': 311, 'Minun': 312,
    'Volbeat': 313, 'Illumise': 314,
    'Roselia': 315, 'Roserade': 407,
    'Gulpin': 316, 'Swalot': 317,
    'Carvanha': 318, 'Sharpedo': 319,
    'Wailmer': 320, 'Wailord': 321,
    'Numel': 322, 'Camerupt': 323,
    'Torkoal': 324,
    'Spoink': 325, 'Grumpig': 326,
    'Trapinch': 328, 'Vibrava': 329, 'Flygon': 330,
    'Cacnea': 331, 'Cacturne': 332,
    'Swablu': 333, 'Altaria': 334,
    'Zangoose': 335, 'Seviper': 336,
    'Lunatone': 337, 'Solrock': 338,
    'Barboach': 339, 'Whiscash': 340,
    'Corphish': 341, 'Crawdaunt': 342,
    'Baltoy': 343, 'Claydol': 344,
    'Lileep': 345, 'Cradily': 346,
    'Anorith': 347, 'Armaldo': 348,
    'Feebas': 349, 'Milotic': 350,
    'Shuppet': 353, 'Banette': 354,
    'Duskull': 355, 'Dusclops': 356, 'Dusknoir': 477,
    'Tropius': 357,
    'Absol': 359,
    'Snorunt': 361, 'Glalie': 362, 'Froslass': 478,
    'Spheal': 363, 'Sealeo': 364, 'Walrein': 365,
    'Clamperl': 366, 'Huntail': 367, 'Gorebyss': 368,
    'Relicanth': 369, 'Luvdisc': 370,
    'Bagon': 371, 'Shelgon': 372, 'Salamence': 373,
    'Beldum': 374, 'Metang': 375, 'Metagross': 376,
    'Regirock': 377, 'Regice': 378, 'Registeel': 379,
    'Latias': 380, 'Latios': 381,
    'Kyogre': 382, 'Groudon': 383, 'Rayquaza': 384,
    'Jirachi': 385, 'Deoxys': 386,
    'Turtwig': 387, 'Grotle': 388, 'Torterra': 389,
    'Chimchar': 390, 'Monferno': 391, 'Infernape': 392,
    'Piplup': 393, 'Prinplup': 394, 'Empoleon': 395,
    'Starly': 396, 'Staravia': 397, 'Staraptor': 398,
    'Bidoof': 399, 'Bibarel': 400,
    'Kricketot': 401, 'Kricketune': 402,
    'Shinx': 403, 'Luxio': 404, 'Luxray': 405,
    'Budew': 406,
    'Cranidos': 408, 'Rampardos': 409,
    'Shieldon': 410, 'Bastiodon': 411,
    'Combee': 415, 'Vespiquen': 416,
    'Pachirisu': 417,
    'Buizel': 418, 'Floatzel': 419,
    'Cherubi': 420, 'Cherrim': 421,
    'Shellos': 422, 'Gastrodon': 423,
    'Ambipom': 424,
    'Drifloon': 425, 'Drifblim': 426,
    'Buneary': 427, 'Lopunny': 428,
    'Glameow': 431, 'Purugly': 432,
    'Chingling': 433,
    'Stunky': 434, 'Skuntank': 435,
    'Bronzor': 436, 'Bronzong': 437,
    'Bonsly': 438, 'Mime Jr.': 439, 'Happiny': 440,
    'Chatot': 441, 'Spiritomb': 442,
    'Gible': 443, 'Gabite': 444, 'Garchomp': 445,
    'Munchlax': 446,
    'Riolu': 447, 'Lucario': 448,
    'Hippopotas': 449, 'Hippowdon': 450,
    'Skorupi': 451, 'Drapion': 452,
    'Croagunk': 453, 'Toxicroak': 454,
    'Carnivine': 455,
    'Finneon': 456, 'Lumineon': 457,
    'Mantyke': 458,
    'Snover': 459, 'Abomasnow': 460,
    'Magnezone': 462, 'Lickilicky': 463,
    'Rhyperior': 464, 'Tangrowth': 465,
    'Electivire': 466, 'Magmortar': 467,
    'Yanmega': 469, 'Leafeon': 470, 'Glaceon': 471,
    'Porygon-Z': 474,
    'Rotom': 479,
    'Uxie': 480, 'Mesprit': 481, 'Azelf': 482,
    'Dialga': 483, 'Palkia': 484, 'Heatran': 485, 'Regigigas': 486,
    'Giratina': 487, 'Cresselia': 488, 'Phione': 489, 'Manaphy': 490,
    'Darkrai': 491, 'Shaymin': 492, 'Arceus': 493,


    // Fallback pour les noms génériques
    'Ennemi': 25,
    'Boss': 150,
    'Epic': 144,
    'Dresseur': 25
};


const ROAMING_POKEMON = [
    'Raikou', 'Entei', 'Suicune', // Les Chiens Légendaires
    'Latias', 'Latios',           // Les Éons
    'Zapdos', 'Moltres', 'Articuno', // Les Oiseaux (si pas Boss de zone)
    'Cresselia', 'Mesprit'        // Les Fuyards de Sinnoh
];

// --- DÉFINITION DES POKÉBALLS (Mise à jour avec Rareté) ---
const BALLS = {
    'pokeball': {
        name: "Pokéball",
        catchMult: 1.0,
        price: 200,
        icon: "🔴", // On garde l'icône en secours
        // ✅ AJOUTER LA LIGNE IMAGE :
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
        rarity: 'common',
        description: "Taux de capture standard."
    },
    'greatball': {
        name: "Super Ball",
        catchMult: 2,
        price: 600,
        icon: "🔵",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png",
        rarity: 'rare',
        description: "Taux de capture x1.5."
    },
    'hyperball': {
        name: "Hyper Ball",
        catchMult: 4,
        price: 1500,
        icon: "⚫",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png", // Notez "ultra-ball" en anglais
        rarity: 'epic',
        description: "Taux de capture x2.0."
    },
    'masterball': {
        name: "Master Ball",
        catchMult: 999,
        price: 0,
        icon: "🟣",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png",
        rarity: 'legendary',
        description: "Capture garantie à 100%."
    }
};

// Taux de capture de base selon la rareté (une fois l'ennemi vaincu)
const CATCH_RATES = {
    [RARITY.COMMON]: 0.75,   // 70% avec une Pokéball standard
    [RARITY.RARE]: 0.50,     // 40%
    [RARITY.EPIC]: 0.25,     // 15%
    [RARITY.LEGENDARY]: 0.10 // 5%
};


// --- DÉFINITIONS DES TALENTS ---
const PASSIVE_TALENTS = {
    // --- EPIC ---
    mentor: {
        name: "Mentor",
        description: "+25% XP pour toute l'équipe (Cumulable)",
        rarity: RARITY.EPIC
    },
    collecteur: {
        name: "Collecteur",
        description: "+50% Pokédollars après victoire",
        rarity: RARITY.EPIC
    },
    epineux: {
        name: "Epineux",
        description: "Charge l'Ultime 2x plus vite en subissant des dégâts.",
        rarity: RARITY.EPIC
    },
    catalyseur: {
        name: "Catalyseur",
        description: "+2.5% chance effets de statut pour l'équipe",
        rarity: RARITY.EPIC
    },
    vengeance: { // C'était manquant
        name: "Vengeance",
        description: "Gagne de l'Attaque quand les PV sont bas (Max +50%)",
        rarity: RARITY.EPIC
    },
    adrenaline: { // C'était manquant
        name: "Adrénaline",
        description: "La jauge d'ultime se charge 2x plus vite",
        rarity: RARITY.EPIC
    },
    charmeur: { // Passé en EPIC pour être accessible
        name: "Charmeur",
        description: "+10% de chance de capture (si actif en combat)",
        rarity: RARITY.EPIC
    },

    // --- LEGENDARY ---
    aura: {
        name: "Aura de Commandement",
        description: "+10% ATK/DEF/SPD pour l'équipe",
        rarity: RARITY.LEGENDARY
    },
    maitre: {
        name: "Maître Élémentaire",
        description: "+20% dégâts du même type (STAB) pour l'équipe",
        rarity: RARITY.LEGENDARY
    },
    phoenix: {
        name: "Phénix",
        description: "25% chance d'éviter la mort et de se soigner",
        rarity: RARITY.LEGENDARY
    },
    catalyseur_supreme: {
        name: "Catalyseur Suprême",
        description: "+5% chance effets de statut pour l'équipe",
        rarity: RARITY.LEGENDARY
    },
    sniper: { // C'était manquant
        name: "Sniper",
        description: "Les Critiques infligent x3 dégâts et +20% chance Crit",
        rarity: RARITY.LEGENDARY
    },
    opportuniste: {
        name: "Opportuniste",
        description: "+50% Dégâts si la cible a un effet de statut",
        rarity: RARITY.EPIC
    },
    muraille: {
        name: "Muraille",
        description: "Convertit 10% des PV Max en Attaque bonus",
        rarity: RARITY.EPIC
    },
    intouchable: {
        name: "Intouchable",
        description: "-50% Dégâts reçus tant que les PV sont au maximum",
        rarity: RARITY.EPIC
    },
    vampire: {
        name: "Vampire",
        description: "Soigne 20% des dégâts infligés",
        rarity: RARITY.LEGENDARY
    },
    berserker: {
        name: "Berserker",
        description: "+5% Attaque cumulable à chaque tour (Max +50%)",
        rarity: RARITY.LEGENDARY
    }
};

// --- LISTES DE TIRAGE (C'est ici qu'il manquait des clés !) ---

// On inclut TOUS les talents épiques
const EPIC_TALENTS = [
    'mentor',
    'collecteur',
    'catalyseur',
    'vengeance',
    'adrenaline',
    'charmeur', 'opportuniste', 'muraille', 'intouchable'
];

// On inclut les Légendaires (et souvent on inclut aussi les Épiques pour diluer, 
// mais ici gardons les purs Légendaires pour que ce soit vraiment fort)
const LEGENDARY_TALENTS = [
    'aura',
    'maitre',
    'phoenix',
    'catalyseur_supreme',
    'sniper', 'vampire', 'berserker'
];



const STATUS_EFFECTS = {
    NONE: 'none',
    PARALYZED: 'paralyzed',
    FROZEN: 'frozen',
    BURNED: 'burned',
    POISONED: 'poisoned',
    STUNNED: 'stunned',
    // Nouveaux debuffs
    CONFUSED: 'confused',
    SCARED: 'scared',
    // Nouveaux buffs
    REINFORCED: 'reinforced',
    AGILE: 'agile',
    THORNY: 'thorny',
    ENRAGED: 'enraged',
    PUNCHER: 'puncher'
};

const STATUS_PROC_CHANCES = {
    [RARITY.COMMON]: 0.025,
    [RARITY.RARE]: 0.05,
    [RARITY.EPIC]: 0.075,
    [RARITY.LEGENDARY]: 0.10
};

const TYPE_TO_STATUS = {
    [TYPES.ELECTRIC]: STATUS_EFFECTS.PARALYZED,
    [TYPES.WATER]: STATUS_EFFECTS.FROZEN,
    [TYPES.FIRE]: STATUS_EFFECTS.BURNED,
    [TYPES.GRASS]: STATUS_EFFECTS.POISONED,
    [TYPES.NORMAL]: STATUS_EFFECTS.STUNNED,
    [TYPES.ROCK]: STATUS_EFFECTS.REINFORCED,
    [TYPES.FLYING]: STATUS_EFFECTS.AGILE,
    [TYPES.PSYCHIC]: STATUS_EFFECTS.CONFUSED,
    [TYPES.DARK]: STATUS_EFFECTS.SCARED,
    [TYPES.STEEL]: STATUS_EFFECTS.THORNY,
    [TYPES.DRAGON]: STATUS_EFFECTS.ENRAGED,
    [TYPES.FIGHTING]: STATUS_EFFECTS.PUNCHER
};

// ✅ AJOUTER CET OBJET : Ultimes spécifiques par Pokémon
// Vous pouvez remplir cet objet avec tous les ultimes uniques que vous souhaitez.
const POKEMON_ULTIMATE_ABILITIES = {
    // Exemples Légendaires
    'Mewtwo': {
        name: "Frappe Psychique",
        description: "Inflige 200% de dégâts qui ignorent 50% de la Défense de l'ennemi.",
        chargeNeeded: 120, // Coûte un peu plus cher
        effect: { type: 'DEFENSE_PENETRATION', value: 2.0, penetration: 0.5 }
    },
    'Charizard': {
        name: "Rafale Feu",
        description: "Inflige 180% de dégâts de Feu et garantit d'appliquer BRÛLURE.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.8, status: STATUS_EFFECTS.BURNED }
    },
    // Exemples Épiques
    'Gengar': {
        name: "Possession",
        description: "N'inflige pas de dégâts, mais applique EFFRAYÉ et EMPOISONNEMENT (dégâts x3).",
        chargeNeeded: 100,
        effect: { type: 'MULTI_BUFF', status: [STATUS_EFFECTS.SCARED, STATUS_EFFECTS.POISONED], statusMult: 3 }
    },
    'Alakazam': {
        name: "Distorsion",
        description: "Inflige 100% de dégâts et applique CONFUS. Charge l'ultime de 50% au prochain tour.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.0, status: STATUS_EFFECTS.CONFUSED, bonusCharge: 50 }
        // Note : "bonusCharge" est un nouvel effet que nous devrons peut-être implémenter
    },
    'Groudon': {
        name: "Magma",
        description: "Inflige 120% de dégâts et applique CONFUS. Charge l'ultime de 50% au prochain tour.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.2, status: STATUS_EFFECTS.BURNED, bonusCharge: 50 }
        // Note : "bonusCharge" est un nouvel effet que nous devrons peut-être implémenter
    },
    'Venusaur': {
        name: "Vampigraine",
        description: "Inflige 100% de dégâts et draine 50% des dégâts infligés en PV.",
        chargeNeeded: 100,
        effect: { type: 'LIFESTEAL', value: 1.0, steal: 0.5 }
    },
    'Blastoise': {
        name: "Hydro-Canon",
        description: "Inflige 160% de dégâts et applique RENFORCÉ (augmente la Défense).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.REINFORCED }
    },
    'Pikachu': {
        name: "Fatal-Foudre",
        description: "Inflige 150% de dégâts et garantit d'appliquer PARALYSIE.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.PARALYZED }
    },
    'Raichu': {
        name: "Fatal-Foudre",
        description: "Inflige 150% de dégâts et garantit d'appliquer PARALYSIE.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.PARALYZED }
    },
    'Snorlax': {
        name: "Giga-Impact",
        description: "Inflige 250% de dégâts, mais vous subissez 25% des dégâts infligés en retour.",
        chargeNeeded: 100,
        effect: { type: 'RECOIL', value: 2.5, recoil: 0.25 }
    },
    'Gyarados': {
        name: "Cascade",
        description: "Inflige 80% de dégâts, mais frappe 2 fois.",
        chargeNeeded: 100,
        effect: { type: 'MULTI_HIT', value: 0.8, hits: 2 }
    },
    'Dragonite': {
        name: "Draco-Charge",
        description: "Inflige 180% de dégâts et applique ENRAGÉ (augmente l'Attaque).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.8, status: STATUS_EFFECTS.ENRAGED }
    },
    'Articuno': {
        name: "Zéro Absolu",
        description: "Inflige 150% de dégâts et garantit d'appliquer GEL.",
        chargeNeeded: 120,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.FROZEN }
    },
    'Zapdos': {
        name: "Électrocution",
        description: "Inflige 100% de dégâts, frappe 2 fois, et applique PARALYSIE.",
        chargeNeeded: 120,
        effect: { type: 'MULTI_HIT', value: 1.0, hits: 2, status: STATUS_EFFECTS.PARALYZED }
        // Note : Il faudra modifier 'MULTI_HIT' dans performAttackWithBonus pour gérer ce "status" optionnel
    },
    'Moltres': {
        name: "Déflagration",
        description: "Inflige 200% de dégâts de Feu et garantit BRÛLURE.",
        chargeNeeded: 120,
        effect: { type: 'DAMAGE_AND_STATUS', value: 2.0, status: STATUS_EFFECTS.BURNED }
    },
    'Lugia': {
        name: "Aéroblast",
        description: "Inflige 160% de dégâts et applique AGILE (augmente l'esquive).",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.AGILE }
    },
    'Ho-Oh': {
        name: "Feu Sacré",
        description: "Inflige 170% de dégâts, garantit BRÛLURE, et se soigne de 15% des PV max.",
        chargeNeeded: 120,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.7, status: STATUS_EFFECTS.BURNED, selfHeal: 0.15 }
        // Note : "selfHeal" est un nouvel effet à ajouter dans le switch case de performUltimateAttack
    },
    'Tyranitar': {
        name: "Sable Volant",
        description: "Inflige 150% de dégâts et applique EFFRAYÉ (réduit l'Attaque ennemie).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.SCARED }
    },
    'Metagross': {
        name: "Poing Météore",
        description: "Inflige 160% de dégâts et applique RENFORCÉ (augmente la Défense).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.REINFORCED }
    },
    'Salamence': {
        name: "Vol-Dragon",
        description: "Inflige 170% de dégâts et applique AGILE (augmente l'esquive).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.7, status: STATUS_EFFECTS.AGILE }
    },
    'Garchomp': {
        name: "Double Frappe",
        description: "Inflige 100% de dégâts, mais frappe 2 fois.",
        chargeNeeded: 100,
        effect: { type: 'MULTI_HIT', value: 1.0, hits: 2 }
    },
    'Kyogre': {
        name: "Onde Originelle",
        description: "Inflige 180% de dégâts et applique GEL.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.8, status: STATUS_EFFECTS.FROZEN }
    },
    'Rayquaza': {
        name: "Draco Ascension",
        description: "Inflige 220% de dégâts qui ignorent 25% de la Défense de l'ennemi.",
        chargeNeeded: 120,
        effect: { type: 'DEFENSE_PENETRATION', value: 2.2, penetration: 0.25 }
    },
    'Dialga': {
        name: "Hurle-Temps",
        description: "Inflige 200% de dégâts et applique ÉTOURDI (ennemi passe son tour).",
        chargeNeeded: 120,
        effect: { type: 'DAMAGE_AND_STATUS', value: 2.0, status: STATUS_EFFECTS.STUNNED }
    },
    'Palkia': {
        name: "Spatio-Rift",
        description: "Inflige 170% de dégâts et applique CONFUS.",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.7, status: STATUS_EFFECTS.CONFUSED }
    },
    'Giratina': {
        name: "Revenant",
        description: "N'inflige pas de dégâts, mais applique EFFRAYÉ, CONFUS, et EMPOISONNEMENT.",
        chargeNeeded: 100,
        effect: { type: 'MULTI_BUFF', status: [STATUS_EFFECTS.SCARED, STATUS_EFFECTS.CONFUSED, STATUS_EFFECTS.POISONED] }
    },
    'Arceus': {
        name: "Jugement",
        description: "Inflige 250% de dégâts purs qui ignorent 25% de la Défense.",
        chargeNeeded: 130,
        effect: { type: 'DEFENSE_PENETRATION', value: 2.5, penetration: 0.25 }
    },
    'Arcanine': {
        name: "Vitesse Extrême",
        description: "Inflige 180% de dégâts et applique ENRAGÉ (augmente l'Attaque et la Vitesse).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.8, status: STATUS_EFFECTS.ENRAGED }
    },
    'Machamp': {
        name: "Poing-Karaté",
        description: "Frappe 4 fois, infligeant 60% de dégâts à chaque coup.",
        chargeNeeded: 100,
        effect: { type: 'MULTI_HIT', value: 0.6, hits: 4 }
    },
    'Lapras': {
        name: "Onde Boréale",
        description: "Inflige 120% de dégâts et a 100% de chance d'appliquer GEL.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.2, status: STATUS_EFFECTS.FROZEN }
    },
    'Vaporeon': {
        name: "Aqua-Régénération",
        description: "Restaure 40% des PV max du compte.",
        chargeNeeded: 120, // Les soins sont puissants
        effect: { type: 'HEAL', value: 0.40 }
    },
    'Jolteon': {
        name: "Hâte",
        description: "Applique AGILE (3 esquives) et PUNCHER (prochaine attaque x2).",
        chargeNeeded: 100,
        effect: { type: 'MULTI_BUFF', status: [STATUS_EFFECTS.AGILE, STATUS_EFFECTS.PUNCHER] }
    },
    'Flareon': {
        name: "Boutefeu",
        description: "Inflige 220% de dégâts, mais vous subissez 20% des dégâts infligés en retour.",
        chargeNeeded: 100,
        effect: { type: 'RECOIL', value: 2.2, recoil: 0.20 }
    },
    'Espeon': {
        name: "Psyko",
        description: "Inflige 160% de dégâts et applique CONFUS.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.CONFUSED }
    },
    'Umbreon': {
        name: "Regard Noir",
        description: "Inflige 140% de dégâts et applique EFFRAYÉ (réduit l'Attaque ennemie).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.4, status: STATUS_EFFECTS.SCARED }
    },
    'Typhlosion': {
        name: "Éruption",
        description: "Inflige 190% de dégâts et garantit BRÛLURE.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.9, status: STATUS_EFFECTS.BURNED }
    },
    'Feraligatr': {
        name: "Crocs Givre",
        description: "Inflige 150% de dégâts et draine 30% des dégâts en PV.",
        chargeNeeded: 100,
        effect: { type: 'LIFESTEAL', value: 1.5, steal: 0.3 }
    },
    'Sceptile': {
        name: "Lame-Feuille",
        description: "La prochaine attaque inflige 250% de dégâts.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_MULT', value: 2.5 }
    },
    'Blaziken': {
        name: "Pied Brûleur",
        description: "Inflige 180% de dégâts et applique PUNCHER (prochaine attaque x2).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.8, status: STATUS_EFFECTS.PUNCHER }
    },
    'Swampert': {
        name: "Séisme",
        description: "Inflige 160% de dégâts et applique RENFORCÉ.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.REINFORCED }
    },
    'Infernape': {
        name: "Close Combat",
        description: "Frappe 3 fois, infligeant 70% de dégâts à chaque coup.",
        chargeNeeded: 100,
        effect: { type: 'MULTI_HIT', value: 0.7, hits: 3 }
    },
    'Empoleon': {
        name: "Hydro-Armure",
        description: "Inflige 150% de dégâts et applique RENFORCÉ.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.REINFORCED }
    },
    'Gardevoir': {
        name: "Trou Noir",
        description: "Inflige 100% de dégâts et applique CONFUS et EFFRAYÉ.",
        chargeNeeded: 110,
        effect: { type: 'MULTI_BUFF', status: [STATUS_EFFECTS.CONFUSED, STATUS_EFFECTS.SCARED], value: 1.0 }
        // Note : Il faudra modifier 'MULTI_BUFF' pour qu'il gère 'value' (dégâts) en plus des statuts
    },
    'Lucario': {
        name: "Aurasphère",
        description: "La prochaine attaque inflige 300% de dégâts.",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_MULT', value: 3.0 }
    },
    'Nidoking': {
        name: "Force Colossale",
        description: "Inflige 170% de dégâts et applique RENFORCÉ.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.7, status: STATUS_EFFECTS.REINFORCED }
    },
    'Nidoqueen': {
        name: "Égide Royale",
        description: "Inflige 150% de dégâts et applique RENFORCÉ.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.REINFORCED }
    },
    'Vileplume': {
        name: "Poudre Dodo",
        description: "N'inflige pas de dégâts, mais garantit d'appliquer EMPOISONNEMENT et PARALYSIE.",
        chargeNeeded: 100,
        effect: { type: 'MULTI_BUFF', status: [STATUS_EFFECTS.POISONED, STATUS_EFFECTS.PARALYZED] }
    },
    'Poliwrath': {
        name: "Poing-Dynamique",
        description: "Inflige 150% de dégâts et applique CONFUS.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.CONFUSED }
    },
    'Scizor': {
        name: "Poing-Pistolet",
        description: "Frappe 3 fois, infligeant 70% de dégâts à chaque coup.",
        chargeNeeded: 100,
        effect: { type: 'MULTI_HIT', value: 0.7, hits: 3 }
    },
    'Heracross': {
        name: "Mégacorne",
        description: "La prochaine attaque inflige 300% de dégâts.",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_MULT', value: 3.0 }
    },
    'Crobat': {
        name: "Poison-Croix",
        description: "Inflige 120% de dégâts et applique EMPOISONNEMENT (dégâts x3).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.2, status: STATUS_EFFECTS.POISONED, statusMult: 3 }
    },
    'Ampharos': {
        name: "Rayon Signal",
        description: "Inflige 140% de dégâts et garantit PARALYSIE.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.4, status: STATUS_EFFECTS.PARALYZED }
    },
    'Flygon': {
        name: "Draco-Charge",
        description: "Inflige 100% de dégâts, frappe 2 fois.",
        chargeNeeded: 100,
        effect: { type: 'MULTI_HIT', value: 1.0, hits: 2 }
    },
    'Milotic': {
        name: "Anneau Hydro",
        description: "Restaure 35% des PV max du compte.",
        chargeNeeded: 110,
        effect: { type: 'HEAL', value: 0.35 }
    },
    'Absol': {
        name: "Coup Critique",
        description: "La prochaine attaque inflige 300% de dégâts.",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_MULT', value: 3.0 }
    },
    'Leafeon': {
        name: "Giga-Sangsue",
        description: "Inflige 120% de dégâts et draine 50% des dégâts infligés en PV.",
        chargeNeeded: 100,
        effect: { type: 'LIFESTEAL', value: 1.2, steal: 0.5 }
    },
    'Glaceon': {
        name: "Blizzard",
        description: "Inflige 140% de dégâts et garantit d'appliquer GEL.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.4, status: STATUS_EFFECTS.FROZEN }
    },
    'Togekiss': {
        name: "Lame d'Air",
        description: "Frappe 2 fois et a une chance d'ETOURDIR (Flinch).",
        chargeNeeded: 100,
        effect: { type: 'MULTI_HIT', value: 0.9, hits: 2, status: STATUS_EFFECTS.STUNNED }
    },

    'Gallade': {
        name: "Coupe Psycho",
        description: "Une attaque précise qui ignore 30% de la Défense adverse.",
        chargeNeeded: 90,
        effect: { type: 'DEFENSE_PENETRATION', value: 1.8, penetration: 0.3 }
    },

    'Rhyperior': {
        name: "Roc-Boulet",
        description: "Une attaque massive (250% Dégâts) qui inflige un léger recul.",
        chargeNeeded: 110,
        effect: { type: 'RECOIL', value: 2.5, recoil: 0.05 }
    },

    'Electivire': {
        name: "Poing-Éclair",
        description: "Frappe 3 fois et a une chance de PARALYSER.",
        chargeNeeded: 100,
        effect: { type: 'MULTI_HIT', value: 0.7, hits: 3, status: STATUS_EFFECTS.PARALYZED }
    },

    'Magmortar': {
        name: "Canon Floral",
        description: "Tire une boule de feu explosive (200% Dégâts) qui BRÛLE l'ennemi.",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_AND_STATUS', value: 2.0, status: STATUS_EFFECTS.BURNED }
    },

    'Dusknoir': {
        name: "Poing Ombre",
        description: "Une attaque inesquivable (160% Dégâts) qui rend l'ennemi CONFUS.",
        chargeNeeded: 90,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.CONFUSED }
    },

    'Magnezone': {
        name: "Luminocanon",
        description: "Inflige 180% de dégâts et applique RENFORCÉ.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.8, status: STATUS_EFFECTS.REINFORCED }
    },

    'Weavile': {
        name: "Tranche-Nuit",
        description: "Frappe 3 fois très rapidement (0.6x par coup).",
        chargeNeeded: 80, // Charge très vite
        effect: { type: 'MULTI_HIT', value: 0.6, hits: 3 }
    },

    'Porygon-Z': {
        name: "Ultralaser Bug",
        description: "Une attaque instable qui inflige 250% de dégâts mais rend CONFUS le lanceur (simulé).",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_MULT', value: 2.5 }
    },

    'Slaking': {
        name: "Paresse Royale",
        description: "Ne fait rien... puis frappe à 400% de dégâts !",
        chargeNeeded: 150, // Très long à charger
        effect: { type: 'DAMAGE_MULT', value: 4.0 }
    },

    'Darkrai': {
        name: "Trou Noir",
        description: "Plonge l'ennemi dans le cauchemar : Dégâts + ÉTOURDI (Passe son tour).",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.STUNNED }
    },

    'Heatran': {
        name: "Vortex Magma",
        description: "Piège la cible dans la lave (200% Dégâts) et la BRÛLE.",
        chargeNeeded: 120,
        effect: { type: 'DAMAGE_AND_STATUS', value: 2.0, status: STATUS_EFFECTS.BURNED }
    },

    'Regigigas': {
        name: "Presse",
        description: "Une force brute terrifiante. Inflige 350% de dégâts sans effet secondaire.",
        chargeNeeded: 140, // Très lent à charger (référence à Début Calme)
        effect: { type: 'DAMAGE_MULT', value: 3.5 }
    },

    'Cresselia': {
        name: "Danse-Lune",
        description: "Inflige peu de dégâts (80%) mais soigne massivement l'équipe (50% PV).",
        chargeNeeded: 130,
        effect: { type: 'DAMAGE_AND_STATUS', value: 0.8, status: STATUS_EFFECTS.REINFORCED, selfHeal: 0.5 }
    },

    // --- TANK & COLOSSES ---

    'Steelix': {
        name: "Queue de Fer",
        description: "Frappe lourdement (180% Dégâts) et augmente la Défense (RENFORCÉ).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.8, status: STATUS_EFFECTS.REINFORCED }
    },

    'Aggron': {
        name: "Fracass'Tête",
        description: "Une attaque suicidaire : 300% de dégâts, mais 20% de recul.",
        chargeNeeded: 110,
        effect: { type: 'RECOIL', value: 3.0, recoil: 0.2 }
    },

    'Walrein': {
        name: "Blizzard",
        description: "Inflige 160% de dégâts et applique GEL.",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.FROZEN }
    },

    'Mamoswine': {
        name: "Chute Glace",
        description: "Frappe 2 fois et a une chance d'ÉTOURDIR.",
        chargeNeeded: 100,
        effect: { type: 'MULTI_HIT', value: 0.9, hits: 2, status: STATUS_EFFECTS.STUNNED }
    },

    // --- ATTAQUANTS RAPIDES ---

    'Staraptor': {
        name: "Rapace",
        description: "Fonce à toute vitesse (250% Dégâts) mais subit 15% de recul.",
        chargeNeeded: 90,
        effect: { type: 'RECOIL', value: 2.5, recoil: 0.15 }
    },

    'Luxray': {
        name: "Éclair Fou",
        description: "Inflige 200% de dégâts (Recul 10%) et PARALYSE.",
        chargeNeeded: 100,
        // Note : Pour combiner Recul + Statut, on utilise DAMAGE_AND_STATUS avec une logique custom 
        // ou on accepte que RECOIL ne mette pas de statut. Ici on utilise RECOIL simple pour l'instant.
        effect: { type: 'RECOIL', value: 2.0, recoil: 0.1 }
    },

    'Weavile': {
        name: "Tranche-Nuit",
        description: "Frappe 3 fois très vite (Total 210%).",
        chargeNeeded: 80, // Très rapide
        effect: { type: 'MULTI_HIT', value: 0.7, hits: 3 }
    },

    'Yanmega': {
        name: "Bourdon",
        description: "Une onde sonore qui ignore 25% de la Défense.",
        chargeNeeded: 90,
        effect: { type: 'DEFENSE_PENETRATION', value: 1.6, penetration: 0.25 }
    },

    // --- SOUTIEN & TECH ---

    'Roserade': {
        name: "Bombe Beurk",
        description: "Inflige 150% de dégâts et EMPOISONNE (Dégâts x3).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.POISONED, statusMult: 3 }
    },

    'Honchkrow': {
        name: "Coup Bas",
        description: "Inflige 200% de dégâts. Si l'ennemi est blessé (<50%), inflige x1.5 (Simulé par CRIT).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_MULT', value: 2.0 } // Simple et efficace
    },

    'Spiritomb': {
        name: "Malédiction",
        description: "N'inflige pas de dégâts, mais applique EFFRAYÉ, CONFUS et EMPOISONNEMENT.",
        chargeNeeded: 100,
        effect: { type: 'MULTI_BUFF', status: [STATUS_EFFECTS.SCARED, STATUS_EFFECTS.CONFUSED, STATUS_EFFECTS.POISONED] }
    }
    ,// --- LÉGENDAIRES MANQUANTS (Johto & Hoenn) ---

    'Raikou': {
        name: "Fatal-Foudre",
        description: "Fait tomber la foudre (180% Dégâts) et PARALYSE à coup sûr.",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.8, status: STATUS_EFFECTS.PARALYZED }
    },
    'Entei': {
        name: "Éruption",
        description: "Un geyser de lave (150% Dégâts). Si le lanceur a tous ses PV, inflige x1.5 (Simulé par Critique).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 2.0, status: STATUS_EFFECTS.BURNED }
    },
    'Suicune': {
        name: "Vent Glacé",
        description: "Inflige 140% de dégâts et ralentit l'ennemi (Simulé par GEL ou ÉTOURDI).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.4, status: STATUS_EFFECTS.FROZEN }
    },
    'Celebi': {
        name: "Soin Naturel",
        description: "Inflige des dégâts magiques (120%) et soigne toute l'équipe de 30%.",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.2, status: STATUS_EFFECTS.REINFORCED, selfHeal: 0.3 }
    },
    'Regirock': {
        name: "Lame de Roc",
        description: "Une attaque à haut taux de critique (200% Dégâts) et augmente la Défense.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 2.0, status: STATUS_EFFECTS.REINFORCED }
    },
    'Regice': {
        name: "Laser Glace",
        description: "Inflige 160% de dégâts et a une très forte chance de GELER.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.FROZEN }
    },
    'Registeel': {
        name: "Mur de Fer",
        description: "N'inflige pas de dégâts, mais rend le lanceur invulnérable (RENFORCÉ + ÉPINEUX).",
        chargeNeeded: 90,
        effect: { type: 'MULTI_BUFF', status: [STATUS_EFFECTS.REINFORCED, STATUS_EFFECTS.THORNY] }
    },
    'Latias': {
        name: "Ball'Brume",
        description: "Inflige 160% de dégâts et réduit l'attaque ennemie (EFFRAYÉ).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.SCARED }
    },
    'Latios': {
        name: "Lumi-Éclat",
        description: "Inflige 180% de dégâts qui ignorent 20% de la Défense.",
        chargeNeeded: 100,
        effect: { type: 'DEFENSE_PENETRATION', value: 1.8, penetration: 0.2 }
    },
    'Jirachi': {
        name: "Carnareket",
        description: "Une attaque différée puissante (250% Dégâts).",
        chargeNeeded: 120,
        effect: { type: 'DAMAGE_MULT', value: 2.5 }
    },
    'Deoxys': {
        name: "Psycho Boost",
        description: "Une attaque dévastatrice (300% Dégâts) qui ignore 40% de la Défense.",
        chargeNeeded: 130,
        effect: { type: 'DEFENSE_PENETRATION', value: 3.0, penetration: 0.4 }
    },

    // --- LÉGENDAIRES (Sinnoh) ---

    'Uxie': {
        name: "Bâillement",
        description: "Endort l'ennemi (ÉTOURDI) et inflige des dégâts mentaux (120%).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.2, status: STATUS_EFFECTS.STUNNED }
    },
    'Mesprit': {
        name: "Extrasenseur",
        description: "Inflige 150% de dégâts et a une chance d'APEURER (Passe un tour).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.STUNNED }
    },
    'Azelf': {
        name: "Dernier Recours",
        description: "Une attaque désespérée (250% Dégâts) qui augmente l'Attaque (ENRAGÉ).",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_AND_STATUS', value: 2.5, status: STATUS_EFFECTS.ENRAGED }
    },
    'Manaphy': {
        name: "Lumi-Queue",
        description: "Augmente drastiquement l'Attaque (ENRAGÉ + PUNCHER) pour le prochain coup.",
        chargeNeeded: 100,
        effect: { type: 'MULTI_BUFF', status: [STATUS_EFFECTS.ENRAGED, STATUS_EFFECTS.PUNCHER] }
    },
    'Phione': {
        name: "Siphon",
        description: "Inflige 120% de dégâts et soigne 30% des dégâts infligés.",
        chargeNeeded: 90,
        effect: { type: 'LIFESTEAL', value: 1.2, steal: 0.3 }
    },
    'Shaymin': {
        name: "Fulmigraine",
        description: "Une explosion de lumière (200% Dégâts) qui ignore 30% de la Défense.",
        chargeNeeded: 110,
        effect: { type: 'DEFENSE_PENETRATION', value: 2.0, penetration: 0.3 }
    },

    // --- ÉPIQUES MANQUANTS (Fossiles, Évolutions, etc.) ---

    'Aerodactyl': {
        name: "Éboulement",
        description: "Inflige 160% de dégâts et peut apeurer (ÉTOURDI).",
        chargeNeeded: 90,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.STUNNED }
    },
    'Scyther': {
        name: "Taillade",
        description: "Frappe 4 fois très vite (0.5x par coup).",
        chargeNeeded: 80,
        effect: { type: 'MULTI_HIT', value: 0.5, hits: 4 }
    },
    'Pinsir': {
        name: "Guillotine",
        description: "Une attaque brutale à 300% de dégâts, mais lente à charger.",
        chargeNeeded: 130,
        effect: { type: 'DAMAGE_MULT', value: 3.0 }
    },
    'Kangaskhan': {
        name: "Uppercut",
        description: "Inflige 180% de dégâts et rend l'ennemi CONFUS.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.8, status: STATUS_EFFECTS.CONFUSED }
    },
    'Tauros': {
        name: "Charge",
        description: "Fonce dans le tas (200% Dégâts) mais subit 10% de recul.",
        chargeNeeded: 90,
        effect: { type: 'RECOIL', value: 2.0, recoil: 0.1 }
    },
    'Starmie': {
        name: "Surf",
        description: "Une vague qui frappe fort (170%) et restaure un peu de PV (10%).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.7, status: STATUS_EFFECTS.REINFORCED, selfHeal: 0.1 }
    },
    'Exeggutor': {
        name: "Bomb'Œuf",
        description: "Lance des bombes (180% Dégâts) qui explosent (CONFUS).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.8, status: STATUS_EFFECTS.CONFUSED }
    },
    'Kingdra': {
        name: "Draco-Météore",
        description: "Une pluie de météores (250% Dégâts) mais réduit l'attaque après (Simulé par chargement long).",
        chargeNeeded: 130,
        effect: { type: 'DAMAGE_MULT', value: 2.5 }
    },
    'Donphan': {
        name: "Roulade",
        description: "Frappe 3 fois en prenant de la vitesse (0.7x par coup).",
        chargeNeeded: 100,
        effect: { type: 'MULTI_HIT', value: 0.7, hits: 3 }
    },
    'Ursaring': {
        name: "Façade",
        description: "Une attaque violente (220%). Dégâts doublés si Ursaring a un statut (Logique interne).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 2.2, status: STATUS_EFFECTS.ENRAGED }
    },
    'Mismagius': {
        name: "Onde Folie",
        description: "Rend l'ennemi totalement CONFUS et EFFRAYÉ.",
        chargeNeeded: 90,
        effect: { type: 'MULTI_BUFF', status: [STATUS_EFFECTS.CONFUSED, STATUS_EFFECTS.SCARED] }
    },
    'Bronzong': {
        name: "Gyroballe",
        description: "Utilise son poids pour frapper (180% Dégâts) et se renforce.",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.8, status: STATUS_EFFECTS.REINFORCED }
    },
    'Drapion': {
        name: "Crocs Poison",
        description: "Inflige 140% de dégâts et EMPOISONNE gravement.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.4, status: STATUS_EFFECTS.POISONED }
    },
    'Hippowdon': {
        name: "Séisme",
        description: "Secoue la terre (200% Dégâts) et augmente sa Défense.",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_AND_STATUS', value: 2.0, status: STATUS_EFFECTS.REINFORCED }
    },
    'Abomasnow': {
        name: "Martobois",
        description: "Une frappe lourde (220% Dégâts) avec recul (15%).",
        chargeNeeded: 100,
        effect: { type: 'RECOIL', value: 2.2, recoil: 0.15 }
    },
    'Tangrowth': {
        name: "Méga-Fouet",
        description: "Une attaque puissante (190% Dégâts) qui peut étourdir.",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.9, status: STATUS_EFFECTS.STUNNED }
    },
    'Lickilicky': {
        name: "Explosion",
        description: "L'attaque ultime ! 400% de Dégâts, mais laisse le lanceur à 1 PV (Recul 99%).",
        chargeNeeded: 150,
        effect: { type: 'RECOIL', value: 4.0, recoil: 0.99 }
    },
    'Probopass': {
        name: "Élecanon",
        description: "Tire un rayon (150% Dégâts) qui PARALYSE à coup sûr.",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.PARALYZED }
    },
    'Rampardos': {
        name: "Fracass'Tête",
        description: "L'attaque roche la plus puissante (300% Dégâts), recul de 30%.",
        chargeNeeded: 120,
        effect: { type: 'RECOIL', value: 3.0, recoil: 0.3 }
    },
    'Bastiodon': {
        name: "Tête de Fer",
        description: "Une défense impénétrable (RENFORCÉ + ÉPINEUX) tout en frappant (100%).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.0, status: STATUS_EFFECTS.REINFORCED, statusMult: 1 } // + Épineux via talent si possible
    },
    'Floatzel': {
        name: "Aqua-Jet",
        description: "Frappe en premier (160% Dégâts) et devient AGILE.",
        chargeNeeded: 80,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.AGILE }
    },
    'Ambipom': {
        name: "Coup Double",
        description: "Frappe 2 fois avec précision.",
        chargeNeeded: 90,
        effect: { type: 'MULTI_HIT', value: 0.9, hits: 2 }
    },
    'Skuntank': {
        name: "Détricanon",
        description: "Inflige 150% de dégâts et EMPOISONNE.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.POISONED }
    },
    'Toxicroak': {
        name: "Direct Toxik",
        description: "Une frappe empoisonnée (160%) qui ignore 20% de la Défense.",
        chargeNeeded: 100,
        effect: { type: 'DEFENSE_PENETRATION', value: 1.6, penetration: 0.2 }
    },
    // --- DERNIERS LÉGENDAIRES MANQUANTS ---

    'Moltres': {
        name: "Piqué Incendiaire",
        description: "Une attaque aérienne brûlante (180% Dégâts) qui a une chance d'APEURER.",
        chargeNeeded: 110,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.8, status: STATUS_EFFECTS.STUNNED } // Piqué peut apeurer
    },

    'Zapdos': {
        name: "Coup d'Jus",
        description: "Une décharge électrique (160% Dégâts) qui touche tout le monde (Simulé par PARALYSIE garantie).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.PARALYZED }
    },

    'Articuno': {
        name: "Lyophilisation",
        description: "Une attaque glace spéciale (150% Dégâts) super efficace sur l'Eau (Simulé par critique).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.FROZEN }
    },

    'Mew': {
        name: "Métronome",
        description: "Fait n'importe quoi ! (Simulé : Dégâts aléatoires massifs entre 100% et 400%).",
        chargeNeeded: 90, // Charge vite pour le fun
        // Note : Nécessite une logique 'RANDOM_DMG', ici on simule une moyenne haute
        effect: { type: 'DAMAGE_MULT', value: 2.5 }
    },

    'Lugia': {
        name: "Aéroblast",
        description: "Un souffle destructeur (200% Dégâts) à haut taux de critique.",
        chargeNeeded: 120,
        effect: { type: 'DAMAGE_MULT', value: 2.0 } // Simple mais très fort
    },

    'Ho-Oh': {
        name: "Feu Sacré",
        description: "Brûle l'ennemi (180% Dégâts) et soigne le lanceur (Régénération).",
        chargeNeeded: 120,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.8, status: STATUS_EFFECTS.BURNED, selfHeal: 0.2 }
    },

    // --- AUTRES FAVORIS ---

    'Lucario': {
        name: "Vitesse Extrême",
        description: "Frappe en premier (150% Dégâts) et esquive la prochaine attaque (AGILE).",
        chargeNeeded: 90,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.AGILE }
    },

    'Sceptile': {
        name: "Tempête Verte",
        description: "Une attaque dévastatrice (250% Dégâts) mais baisse l'Attaque (Simulé par long chargement).",
        chargeNeeded: 130,
        effect: { type: 'DAMAGE_MULT', value: 2.5 }
    },

    'Swampert': {
        name: "Eau Croupie",
        description: "Inflige 160% de dégâts et ralentit la cible (GEL simulé).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.FROZEN }
    },

    'Infernape': {
        name: "Boutefeu",
        description: "Une charge suicidaire : 280% de dégâts, 15% de recul.",
        chargeNeeded: 110,
        effect: { type: 'RECOIL', value: 2.8, recoil: 0.15 }
    },

    'Empoleon': {
        name: "Bec Vrille",
        description: "Une attaque perçante qui ignore 30% de la Défense.",
        chargeNeeded: 100,
        effect: { type: 'DEFENSE_PENETRATION', value: 1.7, penetration: 0.3 }
    },

    'Torterra': {
        name: "Martobois",
        description: "Frappe lourdement (200% Dégâts) avec un léger recul.",
        chargeNeeded: 110,
        effect: { type: 'RECOIL', value: 2.0, recoil: 0.1 }
    },

    'Luxray': {
        name: "Rayon Chargé",
        description: "Inflige 140% de dégâts et augmente l'Attaque (ENRAGÉ).",
        chargeNeeded: 90,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.4, status: STATUS_EFFECTS.ENRAGED }
    },

    'Roserade': {
        name: "Danse-Fleur",
        description: "Attaque 3 tours de suite (Simulé par x3 Dégâts) puis devient CONFUS.",
        chargeNeeded: 120,
        // Astuce : On met un gros dégât unique qui simule 3 tours
        effect: { type: 'DAMAGE_AND_STATUS', value: 3.0, status: STATUS_EFFECTS.CONFUSED }
    },

    'Electivire': {
        name: "Poing-Éclair",
        description: "Frappe et PARALYSE à coup sûr.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.6, status: STATUS_EFFECTS.PARALYZED }
    },

    'Magmortar': {
        name: "Lance-Flammes",
        description: "Un classique brûlant (170% Dégâts + BRÛLURE).",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.7, status: STATUS_EFFECTS.BURNED }
    }
};

// ✅ AJOUTER CET OBJET : Ultimes génériques par Rareté (Fallback)
const GENERIC_ULTIMATES = {
    [RARITY.LEGENDARY]: {
        name: "Impact Légendaire",
        description: "Inflige 150% de dégâts et applique ENRAGÉ.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS', value: 1.5, status: STATUS_EFFECTS.ENRAGED }
    },
    [RARITY.EPIC]: {
        name: "Déchaînement",
        description: "Inflige 120% de dégâts et tente d'appliquer l'effet de statut de son type.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_AND_STATUS_TYPE', value: 1.2 } // Un nouvel effet que nous gérerons
    },
    [RARITY.RARE]: {
        name: "Frappe Puissante",
        description: "La prochaine attaque inflige 175% de dégâts.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_MULT', value: 1.75 }
    },
    [RARITY.COMMON]: {
        name: "Charge d'Énergie",
        description: "La prochaine attaque inflige 150% de dégâts.",
        chargeNeeded: 100,
        effect: { type: 'DAMAGE_MULT', value: 1.5 }
    }
};


// SYSTÈME DE QUÊTES


const QUEST_TYPES = {
    COMBAT: 'COMBAT',
    ECONOMY: 'ECONOMY',
    COLLECTION: 'COLLECTION',
    EXPLORATION: 'EXPLORATION',
    MASTERY: 'MASTERY',
    PRESTIGE: 'PRESTIGE',
    CHALLENGE: 'CHALLENGE'
};


const QUEST_DIFFICULTIES = {
    EASY: {
        name: 'Facile',
        color: '#10b981',
        icon: '🟢',
        rewardMultiplier: 1.0,
        rarityWeights: { common: 70, uncommon: 25, rare: 5 }
    },
    MEDIUM: {
        name: 'Moyen',
        color: '#3b82f6',
        icon: '🔵',
        rewardMultiplier: 1.8,
        rarityWeights: { common: 50, uncommon: 35, rare: 12, epic: 3 }
    },
    HARD: {
        name: 'Difficile',
        color: '#8b5cf6',
        icon: '🟣',
        rewardMultiplier: 3.2,
        rarityWeights: { uncommon: 40, rare: 35, epic: 20, legendary: 5 }
    },
    EXTREME: {
        name: 'Extrême',
        color: '#ec4899',
        icon: '🔴',
        rewardMultiplier: 5.0,
        rarityWeights: { rare: 30, epic: 40, legendary: 25, mythic: 5 }
    }
};

// Base rewards for generated (non-story) quests.
const QUEST_REWARD_BASE = {
    pokedollars: 250,
    tokens: 2
};

const ACHIEVEMENTS = {
    // Investisseur Avisé
    'upgradesPurchased_1': {
        title: "Investisseur Avisé I",
        desc: "Acheter 3 améliorations",
        target: 3,
        trackingKey: 'upgradesPurchased',
        rewards: { pokedollars: 5000, questTokens: 10 }
    },
    'upgradesPurchased_2': {
        title: "Investisseur Avisé II",
        desc: "Acheter 5 améliorations",
        target: 5,
        trackingKey: 'upgradesPurchased',
        rewards: { pokedollars: 10000, questTokens: 20 }
    },
    'upgradesPurchased_3': {
        title: "Investisseur Avisé III",
        desc: "Acheter 8 améliorations",
        target: 8,
        trackingKey: 'upgradesPurchased',
        rewards: { pokedollars: 20000, questTokens: 30, eggs: { [RARITY.RARE]: 1 } }
    },

    // Élevage Intensif
    'pensionCount_1': {
        title: "Élevage Intensif I",
        desc: "Avoir 3 créatures en pension",
        target: 3,
        trackingKey: 'pensionCount',
        rewards: { pokedollars: 5000, questTokens: 10 }
    },
    'pensionCount_2': {
        title: "Élevage Intensif II",
        desc: "Avoir 5 créatures en pension",
        target: 5,
        trackingKey: 'pensionCount',
        rewards: { pokedollars: 10000, questTokens: 20 }
    },
    'pensionCount_3': {
        title: "Élevage Intensif III",
        desc: "Avoir 8 créatures en pension",
        target: 8,
        trackingKey: 'pensionCount',
        rewards: { pokedollars: 20000, questTokens: 30, eggs: { [RARITY.RARE]: 1 } }
    },

    // Équipe d'Élite
    'teamPower_1': {
        title: "Équipe d'Élite I",
        desc: "Atteindre 10 000 de puissance d'équipe totale",
        target: 10000,
        trackingKey: 'teamPower',
        rewards: { pokedollars: 10000, questTokens: 15 }
    },
    'teamPower_2': {
        title: "Équipe d'Élite II",
        desc: "Atteindre 25 000 de puissance d'équipe totale",
        target: 25000,
        trackingKey: 'teamPower',
        rewards: { pokedollars: 20000, questTokens: 25 }
    },
    'teamPower_3': {
        title: "Équipe d'Élite III",
        desc: "Atteindre 50 000 de puissance d'équipe totale",
        target: 50000,
        trackingKey: 'teamPower',
        rewards: { pokedollars: 30000, questTokens: 35, eggs: { [RARITY.EPIC]: 1 } }
    },
    'teamPower_4': {
        title: "Équipe d'Élite III",
        desc: "Atteindre 100 000 de puissance d'équipe totale",
        target: 100000,
        trackingKey: 'teamPower',
        rewards: { pokedollars: 60000, questTokens: 35, eggs: { [RARITY.EPIC]: 3 } }
    },
    // Collectionneur de Badges
    'badgesEarned_1': {
        title: "Collectionneur de Badges I",
        desc: "Obtenir 1 badge d'arène",
        target: 1,
        trackingKey: 'badgesEarned',
        rewards: { questTokens: 50, eggs: { [RARITY.EPIC]: 1 } }
    },
    'badgesEarned_2': {
        title: "Collectionneur de Badges II",
        desc: "Obtenir 3 badges d'arène",
        target: 3,
        trackingKey: 'badgesEarned',
        rewards: { questTokens: 100, eggs: { [RARITY.EPIC]: 2 } }
    },
    'badgesEarned_3': {
        title: "Collectionneur de Badges III",
        desc: "Obtenir 5 badges d'arène",
        target: 5,
        trackingKey: 'badgesEarned',
        rewards: { questTokens: 150, eggs: { [RARITY.LEGENDARY]: 1 } }
    },
    // --- Professor Chen (narrative, unlocked manually) ---
    'toutCaPourCa_1': {
        title: "Tout ça pour ça ?",
        desc: "Obtenir un starter légendaire qui est 1 000 000 000 de fois plus faible que votre équipe actuelle.",
        target: 1,
        trackingKey: 'billionFinaleUnlocked',
        rewards: {}
    },
    // --- COLLECTION SHINY ---
    'shinyHunter_1': {
        title: "Chasseur d'Étoiles I", desc: "Capturer 1 Pokémon Shiny",
        target: 1, trackingKey: 'shiniesObtained',
        rewards: { questTokens: 50, eggs: { [RARITY.EPIC]: 1 } }
    },
    'shinyHunter_2': {
        title: "Chasseur d'Étoiles II", desc: "Capturer 10 Pokémon Shiny",
        target: 10, trackingKey: 'shiniesObtained',
        rewards: { questTokens: 200, eggs: { [RARITY.LEGENDARY]: 1 } }
    },
    'shinyHunter_3': {
        title: "Chasseur d'Étoiles III", desc: "Capturer 100 Pokémon Shiny",
        target: 100, trackingKey: 'shiniesObtained',
        rewards: { questTokens: 1000, items: { 'masterball': 1 } }
    },

    // --- PUISSANCE ULTIME (NIVEAUX) ---
    'levelMax_1': { title: "Puissance I", desc: "Avoir un Pokémon niveau 100", target: 100, trackingKey: 'highestLevelReached', rewards: { pokedollars: 50000 } },
    'levelMax_2': { title: "Puissance II", desc: "Avoir un Pokémon niveau 110", target: 110, trackingKey: 'highestLevelReached', rewards: { pokedollars: 100000 } },
    'levelMax_3': { title: "Puissance III", desc: "Avoir un Pokémon niveau 120", target: 120, trackingKey: 'highestLevelReached', rewards: { questTokens: 50 } },
    'levelMax_4': { title: "Puissance IV", desc: "Avoir un Pokémon niveau 130", target: 130, trackingKey: 'highestLevelReached', rewards: { questTokens: 100 } },
    'levelMax_5': { title: "Puissance V", desc: "Avoir un Pokémon niveau 140", target: 140, trackingKey: 'highestLevelReached', rewards: { eggs: { [RARITY.EPIC]: 1 } } },
    'levelMax_6': { title: "Puissance VI", desc: "Avoir un Pokémon niveau 150", target: 150, trackingKey: 'highestLevelReached', rewards: { eggs: { [RARITY.LEGENDARY]: 1 } } },
    'levelMax_7': { title: "Puissance VII", desc: "Avoir un Pokémon niveau 160", target: 160, trackingKey: 'highestLevelReached', rewards: { questTokens: 250 } },
    'levelMax_8': { title: "Puissance VIII", desc: "Avoir un Pokémon niveau 170", target: 170, trackingKey: 'highestLevelReached', rewards: { questTokens: 500 } },
    'levelMax_9': { title: "Puissance IX", desc: "Avoir un Pokémon niveau 180", target: 180, trackingKey: 'highestLevelReached', rewards: { items: { 'super_bonbon': 10 } } },
    'levelMax_10': { title: "Puissance X", desc: "Avoir un Pokémon niveau 190", target: 190, trackingKey: 'highestLevelReached', rewards: { items: { 'super_bonbon': 20 } } },
    'levelMax_11': { title: "Légende Vivante", desc: "Avoir un Pokémon niveau 200", target: 200, trackingKey: 'highestLevelReached', rewards: { items: { 'masterball': 3 } } },

    // --- PERFECTION (IV) ---
    'perfectIV_1': {
        title: "Génétique Parfaite", desc: "Obtenir un Pokémon avec 100% IV (Parfait)",
        target: 1, trackingKey: 'perfectIvCount',
        rewards: { questTokens: 500 }
    },
    'perfectShiny_1': {
        title: "Le Saint Graal", desc: "Obtenir un Shiny avec 100% IV (Parfait)",
        target: 1, trackingKey: 'perfectShinyCount',
        rewards: { questTokens: 5000, items: { 'masterball': 5 } }
    },

    // --- COMBATTANT ---
    'battleWins_1': { title: "Guerrier I", desc: "Gagner 1,000 combats", target: 1000, trackingKey: 'combatsWon', rewards: { questTokens: 50 } },
    'battleWins_2': { title: "Guerrier II", desc: "Gagner 10,000 combats", target: 10000, trackingKey: 'combatsWon', rewards: { questTokens: 200 } },
    'battleWins_3': { title: "Guerrier III", desc: "Gagner 100,000 combats", target: 100000, trackingKey: 'combatsWon', rewards: { questTokens: 1000 } },
    'battleWins_4': { title: "Dieu de la Guerre", desc: "Gagner 1,000,000 combats", target: 1000000, trackingKey: 'combatsWon', rewards: { questTokens: 5000 } },

    // --- TUEUR DE BOSS ---
    'bossKiller_1': { title: "Tueur de Boss I", desc: "Vaincre 10 Boss", target: 10, trackingKey: 'bossDefeated', rewards: { eggs: { [RARITY.RARE]: 1 } } },
    'bossKiller_2': { title: "Tueur de Boss II", desc: "Vaincre 100 Boss", target: 100, trackingKey: 'bossDefeated', rewards: { eggs: { [RARITY.EPIC]: 1 } } },
    'bossKiller_3': { title: "Tueur de Boss III", desc: "Vaincre 1,000 Boss", target: 1000, trackingKey: 'bossDefeated', rewards: { eggs: { [RARITY.LEGENDARY]: 1 } } },

    // --- CHASSEUR ÉPIQUE ---
    'epicKiller_1': { title: "Chasseur Épique I", desc: "Vaincre 25 Épiques", target: 25, trackingKey: 'epicDefeated', rewards: { pokedollars: 10000 } },
    'epicKiller_2': { title: "Chasseur Épique II", desc: "Vaincre 250 Épiques", target: 250, trackingKey: 'epicDefeated', rewards: { pokedollars: 50000 } },
    'epicKiller_3': { title: "Chasseur Épique III", desc: "Vaincre 2,500 Épiques", target: 2500, trackingKey: 'epicDefeated', rewards: { questTokens: 300 } },

    // --- PRESTIGE ---
    'prestigeMaster_1': { title: "Prestige I", desc: "Effectuer 10 Prestiges", target: 10, trackingKey: 'prestigeCount', rewards: { questTokens: 100 } },
    'prestigeMaster_2': { title: "Prestige II", desc: "Effectuer 50 Prestiges", target: 50, trackingKey: 'prestigeCount', rewards: { questTokens: 500 } },
    'prestigeMaster_3': { title: "Prestige III", desc: "Effectuer 250 Prestiges", target: 250, trackingKey: 'prestigeCount', rewards: { questTokens: 1000 } },
    'prestigeMaster_4': { title: "Prestige IV", desc: "Effectuer 1,000 Prestiges", target: 1000, trackingKey: 'prestigeCount', rewards: { questTokens: 5000 } },

    // --- RICHESSE CUMULÉE ---
    'moneyMaker_1': { title: "Millionnaire I", desc: "Gagner 100,000 Pokédollars (Total)", target: 100000, trackingKey: 'totalPokedollarsEarned', rewards: { questTokens: 20 } },
    'moneyMaker_2': { title: "Millionnaire II", desc: "Gagner 1M Pokédollars (Total)", target: 1000000, trackingKey: 'totalPokedollarsEarned', rewards: { questTokens: 100 } },
    'moneyMaker_3': { title: "Milliardaire I", desc: "Gagner 10M Pokédollars (Total)", target: 10000000, trackingKey: 'totalPokedollarsEarned', rewards: { questTokens: 500 } },
    'moneyMaker_4': { title: "Milliardaire II", desc: "Gagner 100M Pokédollars (Total)", target: 100000000, trackingKey: 'totalPokedollarsEarned', rewards: { questTokens: 2000 } },

    // --- TEAM ROCKET : BANQUE & CONFIANCE ---
    'rocket_vip_client_1': {
        title: "Client VIP",
        desc: "Atteindre le niveau de confiance 5 avec la Team Rocket.",
        target: 5,
        trackingKey: 'rocketTrustLevelMax',
        rewards: { questTokens: 300, items: { 'masterball': 1 } }
    },
    'rocket_shadow_rentier_1': {
        title: "Rentier de l'Ombre",
        desc: "Générer un total cumulé de 1 000 000$ en intérêts Team Rocket.",
        target: 1000000,
        trackingKey: 'totalRocketBankInterestGained',
        rewards: { questTokens: 750, items: { 'time_dust_1h': 2 } }
    },

    // --- TEAM ROCKET : PRÊTS & DETTES ---
    'rocket_bad_payer_1': {
        title: "Mauvais Payeur",
        desc: "Avoir une dette Team Rocket active pendant plus de 24h de temps réel.",
        target: 86400000,
        trackingKey: 'rocketLoanActiveRealtimeMs',
        rewards: { questTokens: 350 }
    },
    'rocket_debt_free_1': {
        title: "Libre de Dettes",
        desc: "Rembourser intégralement un prêt Team Rocket d'au moins 1 000 000$.",
        target: 1,
        trackingKey: 'rocketLargeLoansRepaid',
        rewards: { questTokens: 500, items: { 'talent_reroll': 2 } }
    },

    // --- TEAM ROCKET : STAKING ---
    'rocket_call_void_1': {
        title: "Appel du Vide",
        desc: "Atteindre le palier 8 de staking sans cliquer sur récupérer.",
        target: 1,
        trackingKey: 'rocketStakingTier8Reached',
        rewards: { questTokens: 250 }
    },
    'rocket_hold_up_century_1': {
        title: "Hold-up du Siècle",
        desc: "Récupérer avec succès ses gains au palier 9 ou plus.",
        target: 1,
        trackingKey: 'rocketStakingRecoveredTier9Plus',
        rewards: { questTokens: 500, items: { 'time_dust_3h': 1 } }
    },
    'rocket_miracle_survivor_1': {
        title: "Miraculé",
        desc: "Réussir une session de staking avec un risque final de 50% ou plus.",
        target: 1,
        trackingKey: 'rocketStakingRecoveredHighRisk',
        rewards: { questTokens: 450 }
    },
    'rocket_lesson_learned_1': {
        title: "Leçon Apprise",
        desc: "Se faire voler un objet de rareté Légendaire par la Team Rocket.",
        target: 1,
        trackingKey: 'rocketStakingLegendaryStolen',
        rewards: { questTokens: 200 }
    },

    // --- TEAM ROCKET : MACHINE À SOUS ---
    'rocketCasinoSpins_1': { title: "Joueur", desc: "Effectuer 10 spins à la machine Team Rocket", target: 10, trackingKey: 'rocketCasinoSpins', rewards: { pokedollars: 5000, questTokens: 15 } },
    'rocketCasinoSpins_2': { title: "Régulier", desc: "Effectuer 50 spins à la machine Team Rocket", target: 50, trackingKey: 'rocketCasinoSpins', rewards: { pokedollars: 15000, questTokens: 40 } },
    'rocketCasinoSpins_3': { title: "Accro", desc: "Effectuer 200 spins à la machine Team Rocket", target: 200, trackingKey: 'rocketCasinoSpins', rewards: { questTokens: 100, items: { 'evolution_stone': 1 } } },
    'rocketCasinoSpins_4': { title: "High Roller", desc: "Effectuer 500 spins à la machine Team Rocket", target: 500, trackingKey: 'rocketCasinoSpins', rewards: { questTokens: 250, items: { 'time_dust_1h': 1 } } },
    'rocketCasinoSpins_5': { title: "Maître du Casino", desc: "Effectuer 1000 spins à la machine Team Rocket", target: 1000, trackingKey: 'rocketCasinoSpins', rewards: { questTokens: 500, items: { 'masterball': 1 } } }
};

const HEADER_SKIN_DEFAULT_ID = 'classic_lab';

/**
 * Skins du header.
 * - `unlockAchievementId`: succès requis (null = skin sans condition)
 * - `imagePath`: PNG optionnel (tu pourras déposer tes fichiers à ces chemins)
 * - `colors`: fallback visuel même sans image
 * - `colors.fadeFallback`: optionnel, teinte de fondu dédiée pour le background global
 */
const HEADER_SKINS = {
    classic_lab: {
        id: 'classic_lab',
        name: 'Laboratoire Classique',
        description: 'Style d’origine, sobre et lisible.',
        unlockAchievementId: null,
        imagePath: '',
        colors: {
            bg: '#947864',
            border: '#5d4a3e',
            panelBg: '#bec3c6',
            panelBorder: '#3b3b3b',
            titleColor: '#5d4a3e',
            overlay: 'rgba(0,0,0,0.00)',
            glow: 'rgba(0,0,0,0.25)'
        }
    },
    skin_1: {
        id: 'skin_1',
        name: 'Skin 1',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-1.png',
        colors: {
            bg: '#28323f',
            border: '#1a212a',
            panelBg: '#b8c6d9',
            panelBorder: '#3b4f6b',
            titleColor: '#d9e8ff',
            overlay: 'rgba(15,23,42,0.18)',
            glow: 'rgba(59,130,246,0.25)'
        }
    },
    skin_2: {
        id: 'skin_2',
        name: 'Skin 2',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-2.png',
        colors: {
            bg: '#3f2d25',
            border: '#291b15',
            panelBg: '#dfc2ae',
            panelBorder: '#765242',
            titleColor: '#ffe4d3',
            overlay: 'rgba(41,27,21,0.20)',
            glow: 'rgba(180,83,9,0.25)'
        }
    },
    skin_3: {
        id: 'skin_3',
        name: 'Skin 3',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-3.png',
        colors: {
            bg: '#1f3b34',
            border: '#142622',
            panelBg: '#b5e0d4',
            panelBorder: '#2f6a5b',
            titleColor: '#d7fff3',
            overlay: 'rgba(20,38,34,0.18)',
            glow: 'rgba(34,197,94,0.24)'
        }
    },
    skin_4: {
        id: 'skin_4',
        name: 'Skin 4',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-4.png',
        colors: {
            bg: '#33225a',
            border: '#20143b',
            panelBg: '#d0c1f2',
            panelBorder: '#5e45a1',
            titleColor: '#ece2ff',
            overlay: 'rgba(32,20,59,0.20)',
            glow: 'rgba(139,92,246,0.28)'
        }
    },
    skin_5: {
        id: 'skin_5',
        name: 'Skin 5',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-5.png',
        colors: {
            bg: '#3f1f2e',
            border: '#28131d',
            panelBg: '#e7bfd2',
            panelBorder: '#7f3f62',
            titleColor: '#ffe0f0',
            overlay: 'rgba(40,19,29,0.20)',
            glow: 'rgba(236,72,153,0.26)'
        }
    },
    skin_6: {
        id: 'skin_6',
        name: 'Skin 6',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-6.png',
        colors: {
            bg: '#2f3521',
            border: '#1f2515',
            panelBg: '#d2dfb9',
            panelBorder: '#5f7740',
            titleColor: '#ecffd0',
            overlay: 'rgba(31,37,21,0.20)',
            glow: 'rgba(132,204,22,0.26)'
        }
    },
    skin_7: {
        id: 'skin_7',
        name: 'Skin 7',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-7.png',
        colors: {
            bg: '#1e2f3d',
            border: '#131e27',
            panelBg: '#b7d4e8',
            panelBorder: '#365c76',
            titleColor: '#dff2ff',
            overlay: 'rgba(19,30,39,0.20)',
            glow: 'rgba(56,189,248,0.24)'
        }
    },
    skin_8: {
        id: 'skin_8',
        name: 'Skin 8',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-8.png',
        colors: {
            bg: '#3a2d1f',
            border: '#241b12',
            panelBg: '#e4cfaa',
            panelBorder: '#7a5f35',
            titleColor: '#fff0d1',
            overlay: 'rgba(36,27,18,0.20)',
            glow: 'rgba(245,158,11,0.26)'
        }
    },
    skin_9: {
        id: 'skin_9',
        name: 'Skin 9',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-9.png',
        colors: {
            bg: '#21362a',
            border: '#14231b',
            panelBg: '#bfdfc8',
            panelBorder: '#3f7552',
            titleColor: '#defee8',
            overlay: 'rgba(20,35,27,0.20)',
            glow: 'rgba(74,222,128,0.24)'
        }
    },
    skin_10: {
        id: 'skin_10',
        name: 'Skin 10',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-10.png',
        colors: {
            bg: '#2f2741',
            border: '#1c1728',
            panelBg: '#cdc5e9',
            panelBorder: '#5b4a8e',
            titleColor: '#ece7ff',
            overlay: 'rgba(28,23,40,0.20)',
            glow: 'rgba(167,139,250,0.26)'
        }
    },
    skin_11: {
        id: 'skin_11',
        name: 'Skin 11',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-11.png',
        colors: {
            bg: '#382335',
            border: '#221520',
            panelBg: '#e1c1da',
            panelBorder: '#7a4168',
            titleColor: '#fbe3f5',
            overlay: 'rgba(34,21,32,0.20)',
            glow: 'rgba(244,114,182,0.25)'
        }
    },
    skin_12: {
        id: 'skin_12',
        name: 'Skin 12',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-12.png',
        colors: {
            bg: '#2d3a1f',
            border: '#1d2614',
            panelBg: '#d5e6b8',
            panelBorder: '#627c3f',
            titleColor: '#efffda',
            overlay: 'rgba(29,38,20,0.20)',
            glow: 'rgba(163,230,53,0.24)'
        }
    },
    skin_13: {
        id: 'skin_13',
        name: 'Skin 13',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-13.png',
        colors: {
            bg: '#1f3742',
            border: '#14222a',
            panelBg: '#bedde8',
            panelBorder: '#3f6e81',
            titleColor: '#def7ff',
            overlay: 'rgba(20,34,42,0.20)',
            glow: 'rgba(34,211,238,0.24)'
        }
    },
    skin_14: {
        id: 'skin_14',
        name: 'Skin 14',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-14.png',
        colors: {
            bg: '#3d2520',
            border: '#261713',
            panelBg: '#e7c3b9',
            panelBorder: '#7d4a3e',
            titleColor: '#ffe8e1',
            overlay: 'rgba(38,23,19,0.20)',
            glow: 'rgba(251,113,133,0.24)'
        }
    },
    skin_15: {
        id: 'skin_15',
        name: 'Skin 15',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-15.png',
        colors: {
            bg: '#243346',
            border: '#16202c',
            panelBg: '#c3d4ea',
            panelBorder: '#466184',
            titleColor: '#e4eeff',
            overlay: 'rgba(22,32,44,0.20)',
            glow: 'rgba(96,165,250,0.24)'
        }
    },
    skin_16: {
        id: 'skin_16',
        name: 'Skin 16',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-16.png',
        colors: {
            bg: '#3a2c24',
            border: '#241b16',
            panelBg: '#e3cdbf',
            panelBorder: '#785843',
            titleColor: '#fbeadf',
            overlay: 'rgba(36,27,22,0.20)',
            glow: 'rgba(251,146,60,0.24)'
        }
    },
    skin_17: {
        id: 'skin_17',
        name: 'Skin 17',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-17.png',
        colors: {
            bg: '#213225',
            border: '#152018',
            panelBg: '#c6dec9',
            panelBorder: '#486c4d',
            titleColor: '#e5fce8',
            overlay: 'rgba(21,32,24,0.20)',
            glow: 'rgba(74,222,128,0.22)'
        }
    },
    skin_18: {
        id: 'skin_18',
        name: 'Skin 18',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-18.png',
        colors: {
            bg: '#2e2640',
            border: '#1c1728',
            panelBg: '#d0c6e7',
            panelBorder: '#5d4e87',
            titleColor: '#ede7ff',
            overlay: 'rgba(28,23,40,0.20)',
            glow: 'rgba(196,181,253,0.22)'
        }
    },
    skin_19: {
        id: 'skin_19',
        name: 'Skin 19',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-19.png',
        colors: {
            bg: '#392432',
            border: '#231620',
            panelBg: '#e1c3d8',
            panelBorder: '#7a4766',
            titleColor: '#fde7f5',
            overlay: 'rgba(35,22,32,0.20)',
            glow: 'rgba(244,114,182,0.22)'
        }
    },
    skin_20: {
        id: 'skin_20',
        name: 'Skin 20',
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: 'img/header-skins/skin-20.png',
        colors: {
            bg: '#273428',
            border: '#18211a',
            panelBg: '#cde0c8',
            panelBorder: '#4f6d4a',
            titleColor: '#edffe8',
            overlay: 'rgba(24,33,26,0.20)',
            glow: 'rgba(134,239,172,0.22)'
        }
    },
    bronze_hunter: {
        id: 'bronze_hunter',
        name: 'Bronze Chasseur',
        description: 'Débloqué via Guerrier I.',
        unlockAchievementId: 'battleWins_1',
        imagePath: 'img/header-skins/bronze-hunter.png',
        colors: {
            bg: '#6a3f2a',
            border: '#3b1d12',
            panelBg: '#d8b596',
            panelBorder: '#5a3d2f',
            titleColor: '#f5d7be',
            overlay: 'rgba(0,0,0,0.22)',
            glow: 'rgba(106,63,42,0.45)'
        }
    },
    league_gold: {
        id: 'league_gold',
        name: 'Ligue Or',
        description: 'Débloqué via Collectionneur de Badges III.',
        unlockAchievementId: 'badgesEarned_3',
        imagePath: 'img/header-skins/league-gold.png',
        colors: {
            bg: '#7b5b16',
            fadeFallback: '#1f2a2f',
            border: '#4a3307',
            panelBg: '#f6d975',
            panelBorder: '#6c4f10',
            titleColor: '#ffe7a8',
            overlay: 'rgba(0,0,0,0.15)',
            glow: 'rgba(251,191,36,0.40)'
        }
    },
    shiny_prisma: {
        id: 'shiny_prisma',
        name: 'Shiny Prisma',
        description: 'Débloqué via Chasseur d’Étoiles II.',
        unlockAchievementId: 'shinyHunter_2',
        imagePath: 'img/header-skins/shiny-prisma.png',
        colors: {
            bg: '#3e2a7a',
            border: '#241246',
            panelBg: '#c7bbff',
            panelBorder: '#4f3b93',
            titleColor: '#e7dcff',
            overlay: 'rgba(64,32,128,0.22)',
            glow: 'rgba(139,92,246,0.42)'
        }
    },
    titan_obsidian: {
        id: 'titan_obsidian',
        name: 'Titan Obsidienne',
        description: 'Débloqué via Tueur de Boss III.',
        unlockAchievementId: 'bossKiller_3',
        imagePath: 'img/header-skins/titan-obsidian.png',
        colors: {
            bg: '#1d232c',
            border: '#0d1218',
            panelBg: '#9ea8b5',
            panelBorder: '#2d3948',
            titleColor: '#d8e0ea',
            overlay: 'rgba(0,0,0,0.28)',
            glow: 'rgba(29,35,44,0.50)'
        }
    },
    living_legend: {
        id: 'living_legend',
        name: 'Légende Vivante',
        description: 'Débloqué via niveau max 200.',
        unlockAchievementId: 'levelMax_11',
        imagePath: 'img/header-skins/living-legend.png',
        colors: {
            bg: '#4d1d12',
            border: '#2e0f09',
            panelBg: '#ffbfa9',
            panelBorder: '#7a2f21',
            titleColor: '#ffd6c7',
            overlay: 'rgba(122,47,33,0.16)',
            glow: 'rgba(239,68,68,0.35)'
        }
    },
    billionaire_neon: {
        id: 'billionaire_neon',
        name: 'Milliardaire Néon',
        description: 'Débloqué via Milliardaire II.',
        unlockAchievementId: 'moneyMaker_4',
        imagePath: 'img/header-skins/billionaire-neon.png',
        colors: {
            bg: '#10243d',
            border: '#061528',
            panelBg: '#9fd0ff',
            panelBorder: '#1f4f80',
            titleColor: '#d8ecff',
            overlay: 'rgba(16,36,61,0.18)',
            glow: 'rgba(59,130,246,0.38)'
        }
    },
    rocket_overlord: {
        id: 'rocket_overlord',
        name: 'Rocket Overlord',
        description: 'Débloqué via Client VIP.',
        unlockAchievementId: 'rocket_vip_client_1',
        imagePath: 'img/header-skins/rocket-overlord.png',
        colors: {
            bg: '#2f1212',
            border: '#180707',
            panelBg: '#f5b0b0',
            panelBorder: '#6b1f1f',
            titleColor: '#ffd7d7',
            overlay: 'rgba(47,18,18,0.26)',
            glow: 'rgba(239,68,68,0.40)'
        }
    },
    casino_emperor: {
        id: 'casino_emperor',
        name: 'Empereur Casino',
        description: 'Débloqué via Maître du Casino.',
        unlockAchievementId: 'rocketCasinoSpins_5',
        imagePath: 'img/header-skins/casino-emperor.png',
        colors: {
            bg: '#223018',
            border: '#111a0c',
            panelBg: '#c8efaa',
            panelBorder: '#3a5b25',
            titleColor: '#e3ffd1',
            overlay: 'rgba(34,48,24,0.20)',
            glow: 'rgba(34,197,94,0.35)'
        }
    }
};

// Slots de test supplémentaires (sans condition) : skin_21 à skin_50
for (let skinIndex = 21; skinIndex <= 50; skinIndex++) {
    HEADER_SKINS[`skin_${skinIndex}`] = {
        id: `skin_${skinIndex}`,
        name: `Skin ${skinIndex}`,
        description: 'Skin de test libre (sans condition).',
        unlockAchievementId: null,
        imagePath: `img/header-skins/skin-${skinIndex}.png`,
        colors: {
            bg: '#243447',
            border: '#16202a',
            panelBg: '#c3d4e6',
            panelBorder: '#3f5f7c',
            titleColor: '#e6f0ff',
            overlay: 'rgba(22,32,42,0.20)',
            glow: 'rgba(59,130,246,0.24)'
        }
    };
}


const QUEST_TEMPLATES = {
    [QUEST_TYPES.COMBAT]: [
        { title: "Combattant Débutant", desc: "Gagner {target} combats", target: [30, 60, 100], difficulty: 'EASY', trackingKey: 'combatsWon' },
        { title: "Série Victorieuse", desc: "Gagner {target} combats d'affilée", target: [5, 10, 20], difficulty: 'MEDIUM', trackingKey: 'winStreak', special: 'streak' },
        { title: "Domination Totale", desc: "Gagner {target} combats sans KO dans l'équipe", target: [3, 5, 10], difficulty: 'HARD', trackingKey: 'perfectWins', special: 'perfect' },
        { title: "Chasseur de Boss", desc: "Vaincre {target} Boss", target: [1, 3, 5], difficulty: 'HARD', trackingKey: 'bossDefeated' },
        { title: "Puissance Déchaînée", desc: "Utiliser {target} fois une capacité Ultime en combat", target: [3, 8, 15], difficulty: 'MEDIUM', trackingKey: 'ultimateUsed' }
    ],

    [QUEST_TYPES.ECONOMY]: [
        { title: "Collectionneur de Richesses", desc: "Gagner {target} Pokédollars au total", target: [2000, 8000, 16000], difficulty: 'EASY', trackingKey: 'totalPokedollarsEarned' },
        { title: "Économe", desc: "Accumuler {target} Pokédollars sans dépenser", target: [2000, 5000, 10000], difficulty: 'MEDIUM', trackingKey: 'currentMoney', special: 'savings' },
        { title: "Magnat des Shards", desc: "Collecter {target} shards au total", target: [10, 25, 50], difficulty: 'MEDIUM', trackingKey: 'totalShards' },
        { title: "Écologiste", desc: "Utiliser le Recycleur {target} fois", target: [2, 4, 8], difficulty: 'EASY', trackingKey: 'recyclerUsed' }
    ],

    [QUEST_TYPES.COLLECTION]: [
        { title: "Chasseur de Shinys", desc: "Obtenir {target} créatures Shiny", target: [1, 3, 5], difficulty: 'HARD', trackingKey: 'shiniesObtained' },
        { title: "Éleveur Légendaire", desc: "Obtenir {target} créatures Légendaires", target: [1, 2, 3], difficulty: 'HARD', trackingKey: 'legendariesObtainedDuringQuest', special: 'legendary_counter' },
        { title: "Arc-en-Ciel", desc: "Obtenir des créatures de {target} types différents", target: [5, 8, 11], difficulty: 'MEDIUM', trackingKey: 'newTypesDuringQuest', special: 'rainbow' },
        { title: "Collectionneur Expert", desc: "Ouvrir {target} œufs", target: [20, 40, 80], difficulty: 'EASY', trackingKey: 'eggsOpened' },
        { title: "Trappeur Assidu", desc: "Capturer {target} créatures manuellement", target: [5, 10, 20], difficulty: 'MEDIUM', trackingKey: 'creature_captured' },
        { title: "Chance de l'Éleveur", desc: "Faire éclore {target} œufs de rareté Rare ou supérieure", target: [2, 5, 10], difficulty: 'HARD', trackingKey: 'incubator_hatched_rare_plus' }
    ],

    [QUEST_TYPES.MASTERY]: [
        { title: "Entraîneur Dévoué", desc: "Faire monter une créature au niveau {target}", target: [25, 50, 75], difficulty: 'MEDIUM', trackingKey: 'maxCreatureLevel' },
        { title: "Tacticien", desc: "Utiliser {target} Boosts temporaires (Attaque+, Défense+...)", target: [3, 5, 10], difficulty: 'MEDIUM', trackingKey: 'statBoostUsed' },
        { title: "Fusion Parfaite", desc: "Réaliser {target} fusions de doublons", target: [5, 10, 20], difficulty: 'MEDIUM', trackingKey: 'fusion_completed' }
    ],

    [QUEST_TYPES.PRESTIGE]: [
        { title: "Renaissance", desc: "Effectuer {target} prestige", target: [5, 15, 50], difficulty: 'EXTREME', trackingKey: 'prestigeCount' }
    ],

    [QUEST_TYPES.CHALLENGE]: [
        { title: "Maître des Statuts", desc: "Infliger {target} effets de statut", target: [5, 12, 25], difficulty: 'MEDIUM', trackingKey: 'statusInflicted' },
        { title: "Survivant de la Tour", desc: "Atteindre l'étage {target} de la Tour de Combat", target: [10, 20, 30], difficulty: 'HARD', trackingKey: 'towerFloor' }
    ],

    [QUEST_TYPES.EXPLORATION]: [
        { title: "Aventurier", desc: "Lancer {target} expéditions", target: [1, 2, 3], difficulty: 'MEDIUM', trackingKey: 'expeditionLaunched' }
    ]
};




const ITEM_CATEGORIES = {
    VITAMIN: 'vitamin',      // Vitamines permanentes (PV Plus, Protéine, etc.)
    BOOST: 'boost',          // Boosts temporaires (Attaque+, Défense+, etc.)
    EVOLUTION: 'evolution',  // Pierres d'évolution
    SPECIAL: 'special'       // Objets spéciaux
};

// Vitamines : Augmentent les GAINS de stats par seconde (permanent)
const VITAMINS = {
    pv_plus: {
        name: "HP Up",
        description: "Augmente le gain de PV par seconde de +5% (permanent)",
        icon: "💊",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hp-up.png",
        rarity: 'rare',
        effect: {
            stat: 'hp',
            value: 0.05,        // +5% de gain par seconde
            duration: null      // Permanent
        }
    },
    proteine: {
        name: "Protein",
        description: "Augmente le gain d'Attaque par seconde de +5% (permanent)",
        icon: "🥤",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/protein.png",
        rarity: 'rare',
        effect: {
            stat: 'attack',
            value: 0.05,
            duration: null
        }
    },
    fer: {
        name: "Iron",
        description: "Augmente le gain de Défense par seconde de +5% (permanent)",
        icon: "⚙️",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/iron.png",
        rarity: 'rare',
        effect: {
            stat: 'defense',
            value: 0.05,
            duration: null
        }
    },
    calcium: {
        name: "Calcium",
        description: "Augmente le gain de Vitesse par seconde de +5% (permanent)",
        icon: "💉",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/calcium.png",
        rarity: 'rare',
        effect: {
            stat: 'speed',
            value: 0.05,
            duration: null
        }
    },
    calcium_spatk: {
        name: "Calcium (Att. Spé.)",
        description: "Augmente le gain d'Attaque Spéciale par seconde de +5% (permanent)",
        icon: "💉",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/calcium.png",
        rarity: 'rare',
        effect: {
            stat: 'spattack',
            value: 0.05,
            duration: null
        }
    },
    zinc: {
        name: "Zinc",
        description: "Augmente le gain de Défense Spéciale par seconde de +5% (permanent)",
        icon: "🔬",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/zinc.png",
        rarity: 'rare',
        effect: {
            stat: 'spdefense',
            value: 0.05,
            duration: null
        }
    },
    super_bonbon: {
        name: "Rare Candy",
        description: "Augmente TOUS les gains de stats par seconde de +3% (permanent)",
        icon: "🍬",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png",
        rarity: 'epic',
        effect: {
            stat: 'all',
            value: 0.03,
            duration: null
        }
    }
};

// Boosts : Augmentent les stats ACTUELLES temporairement
// Mécanique : le temps s'ajoute (réutilisation = +durée), pas le bonus. Tous les single-stat à 15%.
// Super Potion et Potion Max ne sont pas cumulables entre elles ; elles s'ajoutent en bonus aux single-stat.
const STAT_BOOSTERS = {
    attaque_plus: {
        name: "Attaque +",
        description: "+15% d'Attaque pendant 10 min (réutiliser = +temps)",
        icon: "⚔️",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-attack.png",
        rarity: 'common',
        effect: {
            stat: 'attack',
            value: 0.15,
            duration: 600000
        }
    },
    defense_plus: {
        name: "Défense +",
        description: "+15% de Défense pendant 10 min (réutiliser = +temps)",
        icon: "🛡️",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-defense.png",
        rarity: 'common',
        effect: {
            stat: 'defense',
            value: 0.15,
            duration: 600000
        }
    },
    attaque_speciale_plus: {
        name: "Att. Spé. +",
        description: "+15% d'Attaque Spéciale pendant 10 min (réutiliser = +temps)",
        icon: "💥",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-sp-atk.png",
        rarity: 'common',
        effect: {
            stat: 'spattack',
            value: 0.15,
            duration: 600000
        }
    },
    defense_speciale_plus: {
        name: "Déf. Spé. +",
        description: "+15% de Défense Spéciale pendant 10 min (réutiliser = +temps)",
        icon: "💠",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-sp-def.png",
        rarity: 'common',
        effect: {
            stat: 'spdefense',
            value: 0.15,
            duration: 600000
        }
    },
    vitesse_plus: {
        name: "Vitesse +",
        description: "+15% de Vitesse pendant 10 min (réutiliser = +temps)",
        icon: "💨",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-speed.png",
        rarity: 'common',
        effect: {
            stat: 'speed',
            value: 0.15,
            duration: 600000
        }
    },
    pv_plus_boost: {
        name: "PV +",
        description: "+15% de PV pendant 10 min (réutiliser = +temps)",
        icon: "❤️",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hyper-potion.png",
        rarity: 'common',
        effect: {
            stat: 'hp',
            value: 0.15,
            duration: 600000
        }
    },
    muscle_plus: {
        name: "Muscle +",
        description: "+15% d'Attaque pendant 10 min (réutiliser = +temps)",
        icon: "💪",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/muscle-band.png",
        rarity: 'rare',
        effect: {
            stat: 'attack',
            value: 0.15,
            duration: 600000
        }
    },
    garde_plus: {
        name: "Garde +",
        description: "+15% de Défense pendant 10 min (réutiliser = +temps)",
        icon: "🔰",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/guard-spec.png",
        rarity: 'rare',
        effect: {
            stat: 'defense',
            value: 0.15,
            duration: 600000
        }
    },
    super_potion: {
        name: "Super Potion",
        description: "+5% à toutes les stats pendant 15 min (cumul avec single-stat ; remplace Potion Max)",
        icon: "🧪",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png",
        rarity: 'epic',
        effect: {
            stat: 'all',
            value: 0.05,
            duration: 900000
        }
    },
    potion_max: {
        name: "Potion Max",
        description: "+10% à toutes les stats pendant 15 min (cumul avec single-stat ; remplace Super Potion)",
        icon: "⭐",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png",
        rarity: 'legendary',
        effect: {
            stat: 'all',
            value: 0.10,
            duration: 900000
        }
    },
    time_dust_1h: {
        name: "Time Dust I",
        description: "Ressource rare : applique instantanément l'équivalent de 1h de gains passifs de stats.",
        icon: "⌛",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/stardust.png",
        rarity: 'legendary',
        effect: {
            type: 'timeDust',
            hours: 1
        }
    },
    time_dust_3h: {
        name: "Time Dust II",
        description: "Ressource très rare : applique instantanément l'équivalent de 3h de gains passifs de stats.",
        icon: "⏳",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/star-piece.png",
        rarity: 'legendary',
        effect: {
            type: 'timeDust',
            hours: 3
        }
    },
    time_dust_9h: {
        name: "Time Dust III",
        description: "Ressource mythique : applique instantanément l'équivalent de 9h de gains passifs de stats.",
        icon: "🕰️",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/comet-shard.png",
        rarity: 'legendary',
        effect: {
            type: 'timeDust',
            hours: 9
        }
    }
};

// 1. Ajoute ces objets dans ta liste d'objets (ou fusionne avec ALL_ITEMS existant)
// Assure-toi que les clés 'old_rod' et 'surfboard' correspondent exactement à ce qu'on a mis dans getReachablePokemonInZone
const KEY_ITEMS = {
    'thunder_stone': {
        name: "Pierre Foudre",
        description: "Fait évoluer certaines espèces sensibles à l'électricité.",
        icon: "⚡",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-stone.png",
        rarity: 'rare',
        type: 'item'
    },
    'fire_stone': {
        name: "Pierre Feu",
        description: "Fait évoluer certaines espèces liées à l'élément feu.",
        icon: "🔥",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-stone.png",
        rarity: 'rare',
        type: 'item'
    },
    'water_stone': {
        name: "Pierre Eau",
        description: "Fait évoluer certaines espèces liées à l'élément eau.",
        icon: "💧",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/water-stone.png",
        rarity: 'rare',
        type: 'item'
    },
    'leaf_stone': {
        name: "Pierre Plante",
        description: "Fait évoluer certaines espèces liées à la nature.",
        icon: "🍃",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leaf-stone.png",
        rarity: 'rare',
        type: 'item'
    },
    'moon_stone': {
        name: "Pierre Lune",
        description: "Fait évoluer certaines espèces influencées par la lune.",
        icon: "🌙",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/moon-stone.png",
        rarity: 'rare',
        type: 'item'
    },
    'sun_stone': {
        name: "Pierre Soleil",
        description: "Fait évoluer certaines espèces sensibles à la lumière solaire.",
        icon: "☀️",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sun-stone.png",
        rarity: 'rare',
        type: 'item'
    },
    'shiny_stone': {
        name: "Pierre Éclat",
        description: "Fait évoluer certaines espèces grâce à son rayonnement pur.",
        icon: "✨",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shiny-stone.png",
        rarity: 'epic',
        type: 'item'
    },
    'dusk_stone': {
        name: "Pierre Nuit",
        description: "Fait évoluer certaines espèces liées aux ténèbres.",
        icon: "🌑",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dusk-stone.png",
        rarity: 'epic',
        type: 'item'
    },
    'dawn_stone': {
        name: "Pierre Aube",
        description: "Fait évoluer certaines espèces au potentiel latent.",
        icon: "🌅",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dawn-stone.png",
        rarity: 'epic',
        type: 'item'
    },
    'oval_stone': {
        name: "Pierre Ovale",
        description: "Fait évoluer certaines espèces particulières.",
        icon: "🥚",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/oval-stone.png",
        rarity: 'rare',
        type: 'item'
    },
    'metal_coat': {
        name: "Peau metal",
        description: "Objet d'evolution pour certaines especes.",
        icon: "⚙️",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/metal-coat.png",
        rarity: 'rare',
        type: 'item',
        evolutionItem: true
    },
    'kings_rock': {
        name: "Roche Royale",
        description: "Objet d'evolution utilise pour des evolutions specifiques.",
        icon: "👑",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kings-rock.png",
        rarity: 'rare',
        type: 'item',
        evolutionItem: true
    },
    'dragon_scale': {
        name: "Ecaille Draco",
        description: "Objet d'evolution pour certaines especes draconiques.",
        icon: "🐉",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dragon-scale.png",
        rarity: 'rare',
        type: 'item',
        evolutionItem: true
    },
    'upgrade': {
        name: "Ameliorateur",
        description: "Objet d'evolution technologique.",
        icon: "💿",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/up-grade.png",
        rarity: 'epic',
        type: 'item',
        evolutionItem: true
    },
    'prism_scale': {
        name: "Ecaille Bel'inne",
        description: "Objet d'evolution pour certaines especes marines.",
        icon: "🫧",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/prism-scale.png",
        rarity: 'epic',
        type: 'item',
        evolutionItem: true
    },
    'protector': {
        name: "Protecteur",
        description: "Objet d'evolution defensif.",
        icon: "🛡️",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/protector.png",
        rarity: 'epic',
        type: 'item',
        evolutionItem: true
    },
    'electirizer': {
        name: "Electriseur",
        description: "Objet d'evolution charge en electricite.",
        icon: "🔌",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/electirizer.png",
        rarity: 'epic',
        type: 'item',
        evolutionItem: true
    },
    'magmarizer': {
        name: "Magmariseur",
        description: "Objet d'evolution charge de chaleur.",
        icon: "🌋",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/magmarizer.png",
        rarity: 'epic',
        type: 'item',
        evolutionItem: true
    },
    'reaper_cloth': {
        name: "Tissu Fauche",
        description: "Objet d'evolution impregne d'energie spectrale.",
        icon: "🧵",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/reaper-cloth.png",
        rarity: 'epic',
        type: 'item',
        evolutionItem: true
    },
    'dubious_disc': {
        name: "CD Douteux",
        description: "Objet d'evolution aux donnees suspectes.",
        icon: "📀",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dubious-disc.png",
        rarity: 'epic',
        type: 'item',
        evolutionItem: true
    },
    'razor_claw': {
        name: "Griffe Rasoir",
        description: "Objet d'evolution tranchant.",
        icon: "🩸",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/razor-claw.png",
        rarity: 'rare',
        type: 'item',
        evolutionItem: true
    },
    'razor_fang': {
        name: "Croic Rasoir",
        description: "Objet d'evolution a dents acerees.",
        icon: "🦷",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/razor-fang.png",
        rarity: 'rare',
        type: 'item',
        evolutionItem: true
    },
    'trade_stone': {
        name: "Pierre d'échange",
        description: "Substitut aux évolutions par échange pour les espèces compatibles.",
        icon: "🔁",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/trade-stone.png",
        rarity: 'epic',
        type: 'item',
        evolutionItem: true
    },
    'old_rod': {
        name: "Canne à Pêche",
        description: "Permet d'attraper des Pokémon aquatiques dans les zones de pêche.",
        icon: "🎣",
        rarity: 'rare',
        type: 'key_item'
    },
    'surfboard': {
        name: "Planche de Surf",
        description: "Permet de rencontrer des Pokémon en naviguant sur l'eau.",
        icon: "🏄",
        rarity: 'legendary',
        type: 'key_item'
    },
    // ✅ AJOUT : Le Scope Sylphe manquait !
    'scope': {
        name: "Scope Sylphe",
        description: "Permet d'identifier les Pokémon Spectres invisibles.",
        icon: "🔭",
        rarity: 'epic',
        type: 'key_item'
    },
    // ✅ AJOUT : La Masterball manquait aussi (pour la quête finale)
    'masterball': {
        name: "Master Ball",
        description: "La Ball ultime. Capture n'importe quel Pokémon à coup sûr.",
        icon: "🟣", // Ou Ⓜ️
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png",
        rarity: 'legendary',
        type: 'consumable' // Notez le type si vous voulez l'utiliser plus tard
    }
};

// Fusionne ceci dans ALL_ITEMS à la fin du fichier constants.js :
// Object.assign(ALL_ITEMS, KEY_ITEMS); <--- Fais-le manuellement ou copie les blocs ci-dessus dans ALL_ITEMS

// 2. Quêtes Scénarisées — Tutoriel Linéaire ("Invisible Tutorial")
// Ordre strict : le joueur doit accomplir chaque mécanique consciemment pour avancer.
const STORY_QUEST_ORDER = [
    'training', 'recruitment', 'rarity_hunt', 'exploration', 'hoarding',
    'evolution', 'shop_improvements', 'pension_storage', 'vitamin_intake', 'stat_boost_used', 'equip_item',
    'synergy_discovery', 'genetics_stage_1', 'genetics_stage_2', 'genetics_stage_3', 'genetics_stage_4', 'duplicates_system', 'fusion_evolution', 'tower_climb', 'ultimate_intro', 'arena_first', 'the_wall', 'arena_second', 'rebirth', 'recycler_intro', 'collection_bonus', 'arena_third', 'first_expedition'

];

const STORY_QUESTS = {
    // Phase 1: The Basics
    'training': {
        id: 'story_training',
        title: "Entraînement du Starter",
        description: "Faites monter votre Pokémon de départ (Weedle ou Caterpie) d'au moins 1 niveau.",
        dialogue: "On commence par ton premier cobaye : ton starter. Garde-le en équipe et fais-le monter d'au moins 1 niveau en combat. C'est sur lui que tu vas tester toutes les mécaniques.",
        target: 1,
        trackingKey: 'starter_level_up',
        difficulty: 'EASY',
        rewards: { pokedollars: 200, tokens: 10 }
    },
    'recruitment': {
        id: 'story_recruitment',
        title: "Recrutement",
        description: "Capturez un Rattata en combat avec une Poké Ball.",
        dialogue: "Votre équipe a pris de l'ampleur. Il est temps d'élargir vos rangs : trouvez un Rattata en zone et capturez-le avec une Poké Ball !",
        target: 1,
        trackingKey: 'creature_captured',
        requiredSpecies: 'Rattata',
        difficulty: 'EASY',
        rewards: { items: { 'pokeball': 5 }, pokedollars: 300, tokens: 15 }
    },
    // Phase 2: Collection Depth
    'rarity_hunt': {
        id: 'story_rarity_hunt',
        title: "Chasse au Pidgey",
        description: "Capturez un Pidgey en combat.",
        dialogue: "J'aimerais que tu capture un pokémon classé rare. Un Pidgey fera parfaitement l'affaire pour compléter tes données. Repère-en un en zone et capture-le !",
        target: 1,
        trackingKey: 'creature_captured',
        requiredSpecies: 'Pidgey',
        difficulty: 'EASY',
        rewards: { items: { 'greatball': 3, 'scope': 1 }, pokedollars: 800, tokens: 25 }
    },
    'exploration': {
        id: 'story_exploration',
        title: "Exploration",
        description: "Il est temps d'explorer un peu plus les environs ! ",
        dialogue: "Le monde s'étend devant vous. Maîtrisez la Zone 1 pour débloquer la Zone 2.",
        target: 1,
        trackingKey: 'zone_2_visited',
        difficulty: 'EASY',
        rewards: { pokedollars: 500, tokens: 20 }
    },
    'hoarding': {
        id: 'story_hoarding',
        title: "Réserve",
        description: "Possédez au total 5 Pokémon différents.",
        dialogue: "J'ai besoin de plus de données. Agrandissez votre PC : équipe et stockage réunis, atteignez 5 Pokémon !",
        target: 5,
        trackingKey: 'totalOwned',
        difficulty: 'EASY',
        rewards: { pokedollars: 1000, tokens: 30 }
    },
    // Phase 2.5: Mécaniques intermédiaires
    'evolution': {
        id: 'story_evolution',
        title: "Première Évolution",
        description: "Faites évoluer un Pokémon (n'importe lequel).",
        dialogue: "Tes Pokémon peuvent évoluer en gagnant des niveaux. Fais évoluer au moins un d'entre eux pour valider cette quête !",
        target: 1,
        trackingKey: 'evolutionCount',
        difficulty: 'EASY',
        rewards: { pokedollars: 800, tokens: 25 }
    },
    'shop_improvements': {
        id: 'story_shop_improvements',
        title: "Boutique d'améliorations",
        description: "Achetez une amélioration de pension dans la boutique (onglet Améliorations).",
        dialogue: "La boutique propose des améliorations permanentes : plus de slots de pension, deuxième chance de capture, plus d'expérience et autres! Allez dans la Boutique, onglet « Améliorations », et achetez au moins une amélioration de pension !",
        target: 1,
        trackingKey: 'pensionUpgradeBought',
        difficulty: 'EASY',
        rewards: { pokedollars: 500, tokens: 20 }
    },
    'pension_storage': {
        id: 'story_pension_storage',
        title: "Pension & Stockage",
        description: "Mettez un Pokémon à la pension (depuis l'équipe ou le stockage).",
        dialogue: "La pension permet de faire contribuer des Pokémon sans les garder en équipe. Depuis l'onglet Équipe, envoyez au moins un Pokémon à la pension pour découvrir le système ! Désolé mais ici tes pokémons sont chastes, pas de petit en vu !",
        target: 1,
        trackingKey: 'pensionCount',
        difficulty: 'EASY',
        rewards: { pokedollars: 600, tokens: 22 }
    },
    'vitamin_intake': {
        id: 'story_vitamin',
        title: "Dopage Organisé",
        description: "Utilisez une Vitamine (HP UP, Protein, etc.).",
        dialogue: "Tes pokemons se renforcent, mais on peux accelérer tout ça ! Je t'ai donné ta première vitamine, tu te débrouillera pour les prochaines ! Ah, et attention si tu croise la police avec ça, je ne sais toujours pas si c'est légal...",
        target: 1,
        trackingKey: 'vitaminUsed',
        difficulty: 'EASY',
        rewards: { pokedollars: 400, tokens: 18 }
    },
    'stat_boost_used': {
        id: 'story_stat_boost',
        title: "Boost Temporaire",
        description: "Utilisez un boost temporaire (Défense +, Attaque +, PV +, etc.) depuis le sac.",
        dialogue: "En plus des vitamines permanentes, il existe des potions qui boostent tes stats pendant un temps limité. Défense +, Attaque +, Vitesse +... Tu en as reçu une pour tester. Utilise-la depuis le Sac : l'effet s'applique à toute l'équipe en combat. Réutiliser le même type = on ajoute du temps, pas du stack. Et non, ça ne remplace pas le café.",
        target: 1,
        trackingKey: 'statBoostUsed',
        difficulty: 'EASY',
        rewards: { pokedollars: 350, tokens: 16 }
    },
    'equip_item': {
        id: 'story_equip_item',
        title: "Fashion Victim",
        description: "Équipez un objet sur votre starter.",
        dialogue: "Ton starter se balade sans objet, c'est indigne d'un chercheur sérieux. Donne-lui les Restes que je viens de te donner, ça le remplumera peut-être un peu !",
        target: 1,
        trackingKey: 'heldItemEquipped',
        difficulty: 'EASY',
        rewards: { pokedollars: 500, tokens: 20 }
    },
    'tower_climb': {
        id: 'story_tower_climb',
        title: "Le Vertige",
        description: "Atteignez l'étage 5 de la Tour de Combat.",
        dialogue: "Tu vois cette tour immense qui gâche ma vue depuis mon labo ? Il paraît qu'il y a des puissants pokémons à combattre à l'intérieur. Je te donne un Ticket de Combat pour commencer ; les autres s'obtiennent en droppant sur les Boss. Grimpe au moins 5 étages. La Tour rapporte des Marques du Triomphe, à dépenser dans la boutique Tour pour des bonus permanents.",
        target: 5,
        trackingKey: 'towerFloor',
        difficulty: 'MEDIUM',
        rewards: { pokedollars: 1500, tokens: 45 }
    },
    'ultimate_intro': {
        id: 'story_ultimate_intro',
        title: "Attaque Ultime",
        description: "Lancez une attaque ultime en combat à l'aide du bouton Ultime (la jauge se charge à chaque attaque envoyée et reçue).",
        dialogue: "Chaque Pokémon dispose d'une attaque ultime : soin, buff, dégats dévastateur... La jauge d'ultime se remplit à chaque attaque que ton Pokémon envoie ou reçoit. Pour en voir le détail, ouvre la fiche du Pokémon (carte) : la description de son ultime y est indiquée. En combat, dès que la jauge est pleine, clique sur le bouton Ultime pour lancer l'attaque. Fais-le au moins une fois pour valider la quête.",
        target: 1,
        trackingKey: 'ultimateUsed',
        difficulty: 'EASY',
        rewards: { pokedollars: 600, tokens: 25 }
    },
    'arena_first': {
        id: 'story_arena_first',
        title: "Première Arène",
        description: "Battez la première arène pour obtenir votre premier badge.",
        dialogue: "Les arènes vous mettent au défi face à des champions. Ouvrez l'onglet Arènes, lancez la première arène disponible et remportez la victoire pour gagner un badge et des bonus permanents !",
        target: 1,
        trackingKey: 'badgesEarned',
        difficulty: 'MEDIUM',
        rewards: { pokedollars: 1200, tokens: 35 }
    },
    'synergy_discovery': {
        id: 'story_synergy',
        title: "Synergies d'équipe",
        description: "Activez n'importe quelle synergie d'équipe (ex. 3 Pokémon Feu = Résonance Pyro).",
        dialogue: "En alignant des types similaires en combat (ex. 3 Feu), vous activez des bonus passifs : Résonance Pyro, Harmonie Hydro... Composez une équipe qui déclenche au moins une synergie !",
        target: 1,
        trackingKey: 'synergyActive',
        difficulty: 'MEDIUM',
        rewards: { pokedollars: 1500, tokens: 40 }
    },
    'duplicates_system': {
        id: 'story_duplicates',
        title: "Doublons & Fusion",
        description: "Obtenez 5 doublons liés à la famille de votre starter (Weedle/Kakuna/Beedrill ou Caterpie/Metapod/Butterfree) qui déclenchent une fusion.",
        dialogue: "On va optimiser UNE seule lignée pour l’instant : celle de ton starter. Quand tu captures un Pokémon que tu possèdes déjà dans cette famille, il est fusionné avec l'existant : meilleurs IVs conservés, Shards gagnés, progression vers un monstre parfait. Capture au moins 5 doublons de la famille de ton starter pour voir la fusion en action. Il paraît que vous pourrez en attraper sur la route 2",
        target: 5,
        trackingKey: 'fusion_completed',
        difficulty: 'MEDIUM',
        rewards: { items: { 'old_rod': 1 }, tokens: 35 }
    },
    'fusion_evolution': {
        id: 'story_fusion_evolution',
        title: "Évolution Fusion",
        description: "Faites évoluer un Pokémon alors que vous possédez déjà sa forme évoluée pour déclencher une fusion évolutive.",
        dialogue: "Tu peux pousser l’optimisation encore plus loin : si tu fais évoluer un Pokémon alors que tu as déjà sa forme finale, le jeu ne garde pas deux copies. On applique une fusion évolutive : meilleurs IVs transférés, une partie de l’XP cumulée (50%) transmise et le prestige conservé. C’est comme polir la version définitive d’une espèce. Prépare une évolution dans une lignée où tu as déjà la forme d’après, puis lance l’évolution pour voir la fusion évoluer.",
        target: 1,
        trackingKey: 'evolution_fusion',
        difficulty: 'MEDIUM',
        rewards: { pokedollars: 1500, tokens: 40 }
    },
    'rebirth': {
        id: 'story_rebirth',
        title: "Renaissance",
        description: "Réalisez un prestige (prestigez un Pokémon pour la première fois).",
        dialogue: "La renaissance permet de repartir plus fort. Effectuez votre premier prestige pour boucler le tutoriel.",
        target: 1,
        trackingKey: 'prestigeCount',
        difficulty: 'HARD',
        rewards: { pokedollars: 3000, tokens: 100 }
    },
    // Phase 3: Avancé
    'the_wall': {
        id: 'story_the_wall',
        title: "Le Mur",
        description: "Vainquez un Boss de zone.",
        dialogue: "Un Boss bloque la route. C'est l'épreuve de force : battez-le pour prouver votre niveau.",
        target: 1,
        trackingKey: 'bossDefeated',
        difficulty: 'MEDIUM',
        rewards: { pokedollars: 2000, tokens: 50 }
    },
    'arena_second': {
        id: 'story_arena_second',
        title: "Deuxième Arène",
        description: "Battez la deuxième arène pour obtenir votre deuxième badge.",
        dialogue: "Le premier badge t’a donné goût à la gloire, pas vrai ? La deuxième arène est plus exigeante : meilleurs niveaux, meilleures synergies. Prépare une équipe adaptée au type du champion et remporte ton deuxième badge.",
        target: 2,
        trackingKey: 'badgesEarned',
        difficulty: 'MEDIUM',
        rewards: { pokedollars: 2200, tokens: 55 }
    },
    'recycler_intro': {
        id: 'story_recycler_intro',
        title: "Écologie Douteuse",
        description: "Utilisez le Recycleur pour transformer des Shards en Poussière.",
        dialogue: "Ton stockage déborde de fragments inutiles. Au lieu de les jeter dans la nature (ce qui est illégal), utilise mon Recycleur. Il broie... euh, 'transforme' les fragments en Poussière magique. C'est très écolo. Fais de la place !",
        target: 1,
        trackingKey: 'recyclerUsed',
        difficulty: 'EASY',
        rewards: { pokedollars: 600, tokens: 25 }
    },
    // Bonus de collection (Pokédex)
    'collection_bonus': {
        id: 'story_collection_bonus',
        title: "Bonus de collection",
        description: "Activez un bonus de collection dans le Pokédex (famille complète avec prestige).",
        dialogue: "Dans le Pokédex, onglet Bonus collection, certaines familles de Pokémon donnent des bonus si vous possédez tous les membres avec au moins 1 prestige. Complétez une famille et montez le prestige de chaque membre pour activer un bonus de collection !",
        target: 1,
        trackingKey: 'collectionBonusActive',
        difficulty: 'MEDIUM',
        rewards: { pokedollars: 2000, tokens: 55 }
    },
    'arena_third': {
        id: 'story_arena_third',
        title: "Troisième Arène",
        description: "Battez la troisième arène pour obtenir votre troisième badge.",
        dialogue: "À ce stade, les champions ne plaisantent plus. La troisième arène suppose que tu as commencé à optimiser IVs, objets tenus et synergies. Ajuste ton équipe, exploite tes buffs et décroche ton troisième badge pour prouver que tu n’es plus un débutant.",
        target: 3,
        trackingKey: 'badgesEarned',
        difficulty: 'HARD',
        rewards: { pokedollars: 2600, tokens: 70 }
    },
    'first_expedition': {
        id: 'story_first_expedition',
        title: "Délocalisation",
        description: "Lancez une expédition (Menu Expéditions).",
        dialogue: "Le Labo est trop petit pour tout ce monde. J'ai repéré des zones dangere... heu, exotiques. Envoie une équipe en expédition. Ils me rapportent des ressources, ils gagnent de l'XP, et surtout : ils ne sont pas là. Lance une expédition, n'importe laquelle.",
        target: 1,
        trackingKey: 'expeditionLaunched',
        difficulty: 'EASY',
        rewards: { pokedollars: 800, tokens: 30 }
    },
    'genetics_stage_1': {
        id: 'story_genetics_stage_1',
        title: "Manipulation Génétique I",
        description: "Faites éclore 3 œufs via incubateur.",
        dialogue: "Je suis chercheur à la Sylph SARL, antenne de Cramois'Île. Notre protocole de manipulation génétique exige des cycles stables. Fais éclore 3 œufs dans les incubateurs pour calibrer le système.",
        target: 3,
        trackingKey: 'incubator_hatched',
        difficulty: 'MEDIUM',
        rewards: {
            pokedollars: 2500,
            tokens: 40,
            unlocks: { autoIncubatorSlots: 1 }
        }
    },
    'genetics_stage_2': {
        id: 'story_genetics_stage_2',
        title: "Manipulation Génétique II",
        description: "Faites éclore 2 œufs Rare, Epic ou Légendaire via incubateur.",
        dialogue: "Bien. On passe aux lignées instables. Il me faut deux éclosions de qualité rare ou supérieure. Priorise les bons spécimens, pas les déchets.",
        target: 2,
        trackingKey: 'incubator_hatched_rare_plus',
        difficulty: 'MEDIUM',
        rewards: {
            pokedollars: 3000,
            tokens: 45,
            unlocks: { autoIncubatorSlots: 1 }
        }
    },
    'genetics_stage_3': {
        id: 'story_genetics_stage_3',
        title: "Manipulation Génétique III",
        description: "Achetez 1 niveau d'Incubation rapide et faites éclore 1 œuf Epic via incubateur.",
        dialogue: "On optimise le protocole: améliore la vitesse d'incubation en boutique puis valide une éclosion Epic. La théorie dit que ça devrait tenir. La théorie ment souvent.",
        target: 2,
        trackingKey: 'genetics_stage_3_combo',
        difficulty: 'HARD',
        specialParams: {
            requires: ['incubation_speed_upgraded', 'incubator_hatched_epic']
        },
        rewards: {
            pokedollars: 4000,
            tokens: 55,
            unlocks: { autoIncubatorSlots: 1 }
        }
    },
    'genetics_stage_4': {
        id: 'story_genetics_stage_4',
        title: "Manipulation Génétique IV",
        description: "Faites éclore 1 œuf Légendaire via incubateur.",
        dialogue: "Dernier test. Une éclosion légendaire en environnement automatisé et je signe l'autorisation complète. Si ça explose, je n'étais jamais là.",
        target: 1,
        trackingKey: 'incubator_hatched_legendary',
        difficulty: 'HARD',
        rewards: {
            pokedollars: 6000,
            tokens: 80,
            unlocks: { autoIncubatorSlots: 1 },
            eggs: { [RARITY.LEGENDARY]: 1 }
        }
    }
};

/** Guides détaillés par quête scénario — où cliquer, étapes, pour accompagner le joueur débutant. */
const STORY_QUEST_GUIDES = {
    story_training: {
        title: "Entraînement — Monter le starter",
        steps: [
            "Les pokémons combattent automatiquementà l'aide des statistiques globales du compte.",
            "Chacun attaque lorsque son attaque bar en bleu est complète. La vitesse à un impact réel ici, vous pouvez attaquer plusieurs fois d'affilé suivant votre vitesse !",
            "Laissez les combats se dérouler et remportez des victoires.",
            "Surveillez le niveau de votre starter : il doit gagner au moins 1 niveau pour valider la quête."
        ],
        where: "Zone de combat (en haut) → combats automatiques → le starter gagne de l’XP et finit par monter de niveau."
    },

    story_recruitment: {
        title: "Recrutement — Capturer un Rattata",
        steps: [
            "Sous l'interface de combat se trouve le bouton de capture.",
            "Un deuxième clic active le mode capture ciblée : cliquez sur « Rattata » pour ne cibler que lui.",
            "Combattez en zone jusqu'à affronter un Rattata, mettez-le K.O. : la fenêtre de capture s'ouvre.",
            "Choisissez une Poké Ball et validez. Une fois le Rattata capturé, la quête est validée."
        ],
        where: "Zone de combat → mode capture ciblée (Rattata) → vaincre un Rattata → fenêtre de capture → Poké Ball."
    },
    rocket_recruit_meowth: {
        title: "Team Rocket — Capturer Miaouss",
        steps: [
            "Ouvrez l'onglet Quêtes puis la section Missions Team Rocket.",
            "Activez le mode capture ciblée et sélectionnez Meowth/Miaouss.",
            "Vainquez-le puis capturez-le avec une Ball.",
            "Validez la récompense de quête pour gagner de la Confiance Team Rocket."
        ],
        where: "Combat → capture ciblée sur Meowth/Miaouss → capture réussie → onglet Quêtes."
    },
    rocket_capture_persian: {
        title: "Team Rocket — Capturer Persian",
        steps: [
            "Activez la capture ciblée et sélectionnez Persian.",
            "Combattez jusqu'à rencontrer Persian.",
            "Capturez-le avec une Ball adaptée.",
            "Validez la quête dans l'onglet Quêtes."
        ],
        where: "Combat → capture ciblée sur Persian → capture réussie."
    },
    rocket_first_stake: {
        title: "Team Rocket — Premier staking Push Your Luck",
        steps: [
            "Ouvrez l'onglet Team Rocket puis la section Staking Push Your Luck.",
            "Stakez un objet depuis votre inventaire pour démarrer une session.",
            "Laissez monter les paliers (x2 par cycle de 30s) en surveillant le risque de vol.",
            "Cliquez sur RÉCUPÉRER pour sécuriser l'objet et vos RJ."
        ],
        where: "Team Rocket → Staking Push Your Luck → Session active → RÉCUPÉRER."
    },
    story_exploration: {
        title: "Exploration — Passer en Zone 2 (changer de zone)",
        steps: [
            "Au dessus de la zone de combat vous trouverez un menu déroulant avec les différentes zones disponibles.",
            "Combattez tous les Pokémon de la zone pour faire monter leur tier, à chaque tier ils deviennent un peu plus puissant.",
            "A droite du selecteur de zone, vous pouvez obtenir le détail de votre progression dans la zone.",
            "Une fois la zone maîtrisée, la Zone 2 se débloque automatiquement dans le menu, il ne reste plus qu'à la selectionner"
        ],
        where: "Zone de combat → Zone 1 → combattre jusqu’à maîtrise et déblocage de la Zone 2 dans le sélecteur."
    },
    story_rarity_hunt: {
        title: "Chasse au Pidgey — Capturer un Pidgey",
        steps: [
            "Activez le mode capture ciblée (bouton de capture) et sélectionnez « Pidgey ».",
            "Combattez en zone jusqu'à affronter un Pidgey, mettez-le K.O. : la fenêtre de capture s'ouvre.",
            "Choisissez une Ball et validez. Une fois le Pidgey capturé, la quête est validée."
        ],
        where: "Zone de combat → mode capture ciblée (Pidgey) → vaincre un Pidgey → fenêtre de capture → Ball."
    },
    story_hoarding: {
        title: "Réserve — Avoir 5 Pokémon au total",
        steps: [
            "Pour obtenir de nouveaux pokémon, vous pouvez capturer des pokémon en combat ou ouvrir des œufs.",
            "Mais attention, dans ce jeu, vous ne pouvez pas avoir deux fois le même pokémon",
            "Il vous faut donc 5 pokémon différents en tout.",
            "Vous pouvez consulter votre stockage à gauche de l'écran."
        ],
        where: "Captures en combat (centre) + œufs (Extras). Total visible dans l’onglet Équipe (équipe + stockage)."
    },
    story_evolution: {
        title: "Première Évolution — Faire évoluer un Pokémon",
        steps: [
            "Les Pokémon évoluent en atteignant un certain niveau (ex. Chenipan niveau 7 → Chrysacier).",
            "Dans l'onglet Équipe (ou Stockage/Pension), cliquez sur un Pokémon qui peut évoluer.",
            "Dans la fiche, si le niveau requis est atteint, un bouton « Évoluer » apparaît.",
            "Cliquez sur « Évoluer » : n'importe quelle évolution valide la quête."
        ],
        where: "Onglet Équipe → cliquer sur un Pokémon → bouton Évoluer dans la fiche (niveau requis atteint)."
    },
    story_shop_improvements: {
        title: "Boutique d'améliorations — Acheter une amélioration de pension",
        steps: [
            "Ouvrez l'onglet Boutique en haut.",
            "Cliquez sur le sous-onglet «  Améliorations » (ou il s'ouvre automatiquement pour cette quête).",
            "Repérez l'amélioration « Pension Pokemon » (slots + transfert de stats).",
            "Achetez au moins un niveau avec vos Pokédollars."
        ],
        where: "Boutique → Améliorations → Pension Pokemon → Acheter."
    },
    story_pension_storage: {
        title: "Pension & Stockage — Mettre un Pokémon à la pension",
        steps: [
            "La pension est une zone où les Pokémon contribuent aux stats sans être en combat.",
            "Ils bénéficient également d'une petite partie de l'xp gagner par l'équipe",
            "Cliquez sur un Pokémon de l'équipe (ou du stockage), puis sur « Pension ».",
            "Une fois un Pokémon envoyé à la pension, la quête est validée."
        ],
        where: "Onglet Équipe → cliquer sur un Pokémon → Envoyer à la pension."
    },
    story_vitamin: {
        title: "Dopage Organisé — Utiliser une Vitamine",
        steps: [
            "Les Vitamines (PV Plus, Protéine, Fer, Calcium...) augmentent définitivement les gains de stats.",
            "Vous en avez reçu une pour tester. Ouvrez le Sac à dos et utilisez le HP UP.",
            "Les vitamines s'obtiennent en drop en combat à un faible taux",
            "Le bonus est additif.",
        ],
        where: "Sac à dos ou Boutique → utiliser une Vitamine (ex. PV Plus)."
    },
    story_stat_boost: {
        title: "Boost Temporaire — Utiliser un Défense + / Attaque + / etc.",
        steps: [
            "Les boosts temporaires (Défense +, Attaque +, PV +, Vitesse +, Att. Spé. +, Déf. Spé. +) augmentent une stat de l'équipe pendant un certain temps (ex. 10 min).",
            "Vous en avez reçu un pour tester. Ouvrez le Sac à dos, repérez un objet du type « Défense + » ou « PV + », etc., et utilisez-le.",
            "L'effet s'applique à toute l'équipe en combat. Réutiliser le même type de boost ajoute du temps de durée, sans cumuler le pourcentage.",
            "Une fois un boost consommé, la quête est validée."
        ],
        where: "Sac à dos (ou Boutique) → utiliser un boost temporaire (ex. Défense +, PV +)."
    },
    story_equip_item: {
        title: "Fashion Victim — Objet sur le starter",
        steps: [
            "Les objets tenus (Restes, Bandeau...) ont plusieurs effets, je te laisserai les découvrir par toi même.",
            "Vous avez reçu l'objet Restes. Cliquez sur votre starter et équipez l'objet.",
            "Les objets se drop à un taux très faible en combat."
        ],
        where: "Équipe → fiche du starter → Objet tenu → équiper Restes (ou autre)."
    },
    story_tower_climb: {
        title: "Le Vertige — Atteindre l'étage 5 de la Tour",
        steps: [
            "Un Ticket de Combat vous a été offert pour cette quête. Les autres tickets se dropent sur les Boss de zone.",
            "Ouvrez l'onglet Tour de Combat, utilisez un Ticket pour lancer une ascension et atteignez au moins l'étage 5 pour valider la quête.",
            "Chaque adversaire est plus fort que le précédent et tous les 10 étagess se trouve un boss qui permettra de choisir un bonus temporaire pour gravir encore plus d'étage.",
            "La tour permet d'obtenir des Marques du Triomphe que vous pourrez dépenser dans la boutique Tour de combat."
        ],
        where: "Tour de Combat → Lancer une ascension (ticket) → vaincre jusqu'à l'étage 5."
    },
    story_ultimate_intro: {
        title: "Attaque Ultime — Lancer un ultime en combat",
        steps: [
            "Chaque Pokémon a une attaque ultime (soin, buff, statut...). Pour en lire la description, ouvrez l'onglet Équipe, cliquez sur un Pokémon : sur sa fiche (carte), l'ultime et son effet sont indiqués.",
            "La jauge d'ultime se charge à chaque attaque envoyée par votre Pokémon et à chaque attaque qu'il reçoit.",
            "En combat de zone, repérez le bouton Ultime (souvent sous ou à côté du sprite). Il s'active quand la jauge est pleine.",
            "Cliquez sur le bouton Ultime pour lancer l'attaque ultime du Pokémon actif. Une fois l'ultime utilisé, la quête est validée."
        ],
        where: "Combat (zone ou arène) → laisser la jauge se remplir (attaques données/reçues) → bouton Ultime → cliquer pour lancer l'ultime."
    },
    story_arena_first: {
        title: "Première Arène — Obtenir le premier badge",
        steps: [
            "Rendez vous dans l'onglet Arènes afin de selectionner la première arène.",
            "En combat d'arène, vos pokémons se battent avec leur propre statistiques et l'équipe n'est pas modifiable pendant le combat!",
            "Chaque arène offre un bonus permanent.",
            "Vainquez tous les Pokémon du champion pour remporter le badge ; la quête se valide à la victoire."
        ],
        where: "Onglet Arènes → première arène → Lancer → vaincre l'équipe du champion."
    },
    story_arena_second: {
        title: "Deuxième Arène — Confirmer votre niveau",
        steps: [
            "Ouvrez l'onglet Arènes (menu principal).",
            "Assurez-vous d’avoir déjà battu la première arène (premier badge obtenu).",
            "Sélectionnez la deuxième arène dans la liste.",
            "Adaptez votre équipe au type du champion (types résistants, synergies, objets tenus) et remportez le combat pour obtenir votre deuxième badge."
        ],
        where: "Onglet Arènes → deuxième arène → lancer le combat et gagner pour atteindre 2 badges au total."
    },
    story_the_wall: {
        title: "Le Mur — Vaincre un Boss de zone",
        steps: [
            "Dans les combats de zone, vous pouvez rencontrer des ennemis Epic et des Boss.",
            "Ils sont bien evidemment plus puissants que les ennemis classiques mais vous pouvez obtenir des butins spécifiques dessus.",
            "Les ennemis Epic ont 2.5% de chance d'apparaitre et les Boss 1%."
        ],
        where: "Zone de combat → choisir une zone → enchaîner les combats jusqu’à l’apparition du Boss, puis le vaincre."
    },
    story_recycler_intro: {
        title: "Écologie Douteuse — Utiliser le Recycleur",
        steps: [
            "Les Shards s'obtiennent lors des captures de doublons comme nous l'avons vu précédemment.",
            "Ouvrez la Boutique, sous-onglet Recycleur et recycler ds Shards pour obtenir de la poussière d'essence",
            "Vous pourrez utiliser la poussière d'essence dans le shop."
        ],
        where: "Boutique → Recycleur → Recycler (au moins 1 shard)."
    },
    story_synergy: {
        title: "Synergies d'équipe — Activer une synergie (ex. Résonance Pyro)",
        steps: [
            "Les synergies d'équipe se déclenchent lorsque les prérequis sont remplis, par exemple 3 pokémon de type feu pour la Résonance Pyro.",
            "Composez une équipe qui respecte une des combinaisons de synergies. Vous trouverez la liste des synergies au dessus de votre zone d'équipe.",
            "Le bouton « Synergies » vert vous indique si une synergie est active, sinon il est grisé.",
            "Les bonus de synergies sont un moyen très efficace d'augmenter la puissance de l'équipe, mais les statistiques gagnées ne participent pas aux gains / sec",
        ],
        where: "Extras → Pokédex → sous-onglet Synergies. Compléter une famille (tous les Pokémon avec prestige ≥ 1) pour l’activer."
    },
    story_duplicates: {
        title: "Doublons & Fusion — Optimiser un Pokémon",
        steps: [
            "Rendez vous à la route 2 pour capturer des doublons de votre starter (Weedle ou Caterpie)",
            "Quand vous capturez un doublon, le jeu le compare à celui que vous avez déjà et garde les meilleurs IVs.",
            "En plus, la capture du doublon vous permet de gagner des Shards, utilisés plus tard pour les prestiges et le Recycleur.",
            "L'obtention de doublons vous permet donc d'optimiser vos pokémon de manière efficace.",
            "Capturer 5 Weedle ou Caterpie pour valider la quête, aidez vous du mode de capture ciblée."
        ],
        where: "Zone de combat → combats classiques puis captures. Les doublons se transforment automatiquement en fusion, avec transfert d’IV et gain de Shards."
    },
    story_fusion_evolution: {
        title: "Évolution Fusion — Optimiser une forme évoluée",
        steps: [
            "Vous devez posséder déjà la forme évoluée d'un Pokémon (ex. un Dracaufeu alors que vous avez un Reptincelle à faire évoluer).",
            "Faites monter en niveau le Pokémon de base (ex. Reptincelle) jusqu'au niveau d'évolution requis.",
            "Ouvrez sa fiche (Équipe, Stockage ou Pension) et cliquez sur « Évoluer ».",
            "Comme vous avez déjà la forme cible, le jeu déclenche une fusion évolutive : meilleurs IVs conservés, 50% de l'XP transférée, prestige conservé. Vous ne gardez qu'un seul Pokémon (la forme évoluée), optimisé.",
            "Une fois la fusion évolutive effectuée, la quête est validée."
        ],
        where: "Équipe / Stockage / Pension → fiche d'un Pokémon prêt à évoluer dont vous possédez déjà l'évolution → Évoluer."
    },
    story_rebirth: {
        title: "Renaissance — Premier prestige",
        steps: [
            "Le prestige est une des bases de l'optimisation de vos Pokémons. Lors du prestige, le pokémon conserve ses IVs, son talent, son ultime et son attaque.",
            "En échange d'un retour au niveau 1, le pokémon gagne 25% de statistiques ( Additive ) et la possibilité de monter 10 niveaux plus haut",
            "En plus de ça, chaque prestige octroie un jeton à dépenser dans l'une des statistiques du Pokémon, offrant +5% de stats (multiplicative)",
            "Validez le prestige : la quête « Renaissance » se valide au premier prestige effectué."
        ],
        where: "Onglet Équipe → cliquer sur un Pokémon → dans la fiche détaillée, bouton Prestige / Renaissance (niveau max requis)."
    },
    story_collection_bonus: {
        title: "Bonus de collection",
        steps: [
            "Ouvrez le Pokédex, puis le sous-onglet « Bonus collection ».",
            "Les Collections vous permettent de gagner des bonus selon les prestiges des Pokémons de la collection.",
            "Pour activer une collection : posséder tous les Pokémon de la famille et avoir au moins 1 prestige sur chacun.",
            "Le niveau de la collection est égale au plus petit prestige de la collection."
        ],
        where: "Pokédex → Bonus collection ; compléter une famille (tous les membres avec prestige ≥ 1) puis combattre."
    },
    story_arena_third: {
        title: "Troisième Arène — Maîtriser les mécaniques avancées",
        steps: [
            "Ouvrez l'onglet Arènes (menu principal).",
            "Vérifiez que vous avez déjà remporté les deux premières arènes (2 badges).",
            "Préparez une équipe optimisée : synergies d’équipe, objets tenus pertinents, quelques prestiges ou bonnes IVs.",
            "Lancez la troisième arène et remportez le combat pour décrocher votre troisième badge."
        ],
        where: "Onglet Arènes → troisième arène → lancer le combat et gagner pour atteindre 3 badges au total."
    },
    story_first_expedition: {
        title: "Délocalisation — Lancer une expédition",
        steps: [
            "Ouvrez l'onglet Expéditions. Des missions apparaissent de temps en temps, elles seront un précieux moyen de gagner certaines ressources",
            "Pour partir en expéditions, les pokémons doivent forcément se trouver dans le stockage et ne seront plus disponibles tant qu'ils ne seront pas rentrés.",
            "La puissance du pokémon est calculer à partir de ses statistiques."
        ],
        where: "Onglet Expéditions → choisir une mission → sélectionner des Pokémon → Lancer."
    },
    story_genetics_stage_1: {
        title: "Manipulation Génétique I — Démarrer l'automatisation",
        steps: [
            "Ouvrez l'onglet Extras puis localisez le panneau des incubateurs.",
            "Placez des œufs dans les incubateurs et attendez les éclosions.",
            "Faites éclore 3 œufs via incubateur pour valider l'étape.",
            "La récompense débloque l'auto-incubation de l'incubateur 1."
        ],
        where: "Extras → Incubateurs → placer des œufs et collecter les éclosions."
    },
    story_genetics_stage_2: {
        title: "Manipulation Génétique II — Prioriser la qualité",
        steps: [
            "Continuez à utiliser les incubateurs.",
            "Faites éclore 2 œufs de rareté Rare, Epic ou Légendaire.",
            "Les œufs Common ne comptent pas pour cette étape."
        ],
        where: "Extras → Incubateurs → favoriser les œufs rare+."
    },
    story_genetics_stage_3: {
        title: "Manipulation Génétique III — Vitesse + éclosion Epic",
        steps: [
            "Ouvrez Boutique → Améliorations.",
            "Achetez au moins 1 niveau de l'amélioration « Incubation rapide ».",
            "Puis faites éclore 1 œuf Epic via incubateur.",
            "Les deux conditions sont requises pour valider la quête."
        ],
        where: "Boutique → Améliorations (Incubation rapide), puis Extras → Incubateurs."
    },
    story_genetics_stage_4: {
        title: "Manipulation Génétique IV — Validation finale",
        steps: [
            "Obtenez un œuf Légendaire (drops, récompenses, boutique).",
            "Placez-le dans un incubateur et terminez l'éclosion.",
            "Valider cette étape débloque l'auto-incubation sur l'incubateur 4."
        ],
        where: "Extras → Incubateurs, avec un œuf Légendaire."
    }
};

// Base URL des sprites items PokeAPI (gen5 = HM/TM par type)
const POKEAPI_ITEMS_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/gen5";

// CT (Capsules Techniques) - pour affichage dans inventaire / récompenses (sprites PokeAPI gen5)
const CT_ITEMS_DISPLAY = {
    'ct_Surf': { name: "CT Surf", description: "Enseigne Surf.", icon: "🌊", img: `${POKEAPI_ITEMS_BASE}/hm-water.png` },
    'ct_Lance-Flammes': { name: "CT Lance-Flammes", description: "Enseigne Lance-Flammes.", icon: "🔥", img: `${POKEAPI_ITEMS_BASE}/hm-fire.png` },
    'ct_LanceFlammes': { name: "CT Lance-Flammes", description: "Enseigne Lance-Flammes.", icon: "🔥", img: `${POKEAPI_ITEMS_BASE}/hm-fire.png` },
    'ct_Tonnerre': { name: "CT Tonnerre", description: "Enseigne Tonnerre.", icon: "⚡", img: `${POKEAPI_ITEMS_BASE}/hm-electric.png` },
    'ct_Psyko': { name: "CT Psyko", description: "Enseigne Psyko.", icon: "🔮", img: `${POKEAPI_ITEMS_BASE}/hm-psychic.png` },
    'ct_Laser Glace': { name: "CT Laser Glace", description: "Enseigne Laser Glace.", icon: "❄️", img: `${POKEAPI_ITEMS_BASE}/hm-ice.png` },
    'ct_LaserGlace': { name: "CT Laser Glace", description: "Enseigne Laser Glace.", icon: "❄️", img: `${POKEAPI_ITEMS_BASE}/hm-ice.png` }
};

// Combiner tous les objets
const ALL_ITEMS = {
    ...VITAMINS,
    ...STAT_BOOSTERS,
    ...HELD_ITEMS,
    ...CT_ITEMS_DISPLAY,
    ...BALLS,
    'prism_iv': {
        name: "Prisme d'Optimisation",
        description: "Regénère les IVs d'une créature en conservant les meilleurs résultats.",
        icon: "💎",
        img: "img/Prism.png",
        rarity: 'legendary',
        type: 'consumable'
    },
    ...KEY_ITEMS	// ✅ C'est cette ligne qui manquait !
};







const SHOP_ITEMS = {
    xpBoost1h: {
        name: "Boost XP (1h)",
        description: "+20% XP pendant 1 heure",
        cost: 20,
        type: 'boost',
        duration: 3600000, // 1h en ms
        effect: { type: 'xp', value: 0.2 }
    },
    xpBoost24h: {
        name: "Boost XP (24h)",
        description: "+20% XP pendant 24 heures",
        cost: 120,
        type: 'boost',
        duration: 86400000, // 24h en ms
        effect: { type: 'xp', value: 0.2 }
    },
    moneyBoost1h: {
        name: "Boost Pokédollars (1h)",
        description: "+50% Pokédollars pendant 1 heure",
        cost: 25,
        type: 'boost',
        duration: 3600000,
        effect: { type: 'money', value: 0.5 }
    },
    eggDropBoost: {
        name: "Boost Drop Œufs (1h)",
        description: "+10% chance de drop d'œufs pendant 1 heure",
        cost: 30,
        type: 'boost',
        duration: 3600000,
        effect: { type: 'eggDrop', value: 0.1 }
    },
    shinyBoost: {
        name: "Charme Shiny (1h)",
        description: "x2 chance de shiny pendant 1 heure",
        cost: 150,
        type: 'boost',
        duration: 3600000,
        effect: { type: 'shiny', value: 1.0 }
    },
    commonEgg: {
        name: "Œuf Common x5",
        description: "Lot de 5 œufs Common",
        cost: 8,
        type: 'egg',
        rarity: RARITY.COMMON,
        amount: 5
    },
    rareEgg: {
        name: "Œuf Rare x3",
        description: "Lot de 3 œufs Rare",
        cost: 30,
        type: 'egg',
        rarity: RARITY.RARE,
        amount: 3
    },
    epicEgg: {
        name: "Œuf Epic",
        description: "1 œuf Epic garanti",
        cost: 80,
        type: 'egg',
        rarity: RARITY.EPIC,
        amount: 1
    },
    legendaryEgg: {
        name: "Œuf Légendaire",
        description: "1 œuf Légendaire garanti !",
        cost: 280,
        type: 'egg',
        rarity: RARITY.LEGENDARY,
        amount: 1
    },
    pensionSlot: {
        name: "Slot Pension Permanent",
        description: "+1 slot de pension définitif",
        cost: [220, 300, 380, 470, 560, 660, 770, 890, 1020, 1160],
        type: 'permanent',
        maxLevel: 10,
        effect: { type: 'pensionSlot', value: 1 }
    },
    permanentXP: {
        name: "Boost XP Permanent",
        description: "+5% XP permanent (cumulable)",
        cost: [220, 300, 380, 470, 560, 660, 770, 890, 1020, 1160],
        type: 'permanent',
        maxLevel: 10,
        effect: { type: 'permanentXP', value: 0.05 }
    },
    pokeball: {
        name: "Pokéball x5",
        description: "Taux de capture standard. (Lot de 5)",
        cost: 2, // 200 * 5
        type: 'item',
        item: 'pokeball',
        amount: 5
    },
    greatball: {
        name: "Super Ball x5",
        description: "Taux de capture x1.5. (Lot de 5)",
        cost: 5,
        type: 'item',
        item: 'greatball',
        amount: 5
    },
    hyperball: {
        name: "Hyper Ball x5",
        description: "Taux de capture x2.0. (Lot de 5)",
        cost: 12,
        type: 'item',
        item: 'hyperball',
        amount: 5
    },
    // La Masterball peut être un objet premium en Jetons
    masterball_token: {
        name: "Master Ball",
        description: "Capture garantie à 100%.",
        cost: 80, // Coût en Jetons
        type: 'item',
        item: 'masterball',
        amount: 1
    },
    // CT (Capsules Techniques) - Enseignent des attaques aux Pokémon compatibles
    ct_Surf: { name: "CT Surf", description: "Enseigne Surf à un Pokémon compatible.", cost: 25, type: 'ct', item: 'ct_Surf', moveName: 'Surf' },
    ct_LanceFlammes: { name: "CT Lance-Flammes", description: "Enseigne Lance-Flammes à un Pokémon compatible.", cost: 25, type: 'ct', item: 'ct_Lance-Flammes', moveName: 'Lance-Flammes' },
    ct_Tonnerre: { name: "CT Tonnerre", description: "Enseigne Tonnerre à un Pokémon compatible.", cost: 25, type: 'ct', item: 'ct_Tonnerre', moveName: 'Tonnerre' },
    ct_Psyko: { name: "CT Psyko", description: "Enseigne Psyko à un Pokémon compatible.", cost: 25, type: 'ct', item: 'ct_Psyko', moveName: 'Psyko' },
    ct_LaserGlace: { name: "CT Laser Glace", description: "Enseigne Laser Glace à un Pokémon compatible.", cost: 25, type: 'ct', item: 'ct_Laser Glace', moveName: 'Laser Glace' }
};

// ... (après la constante ZONE_ENEMY_POOLS)

const EXPEDITION_DEFINITIONS = {
    'explore_forest': {
        id: 'explore_forest',
        name: "Forêt Luxuriante",
        description: "Une zone dense nécessitant des capacités naturelles.",
        duration: 3600, // 1 heure
        requiredLevel: 5,
        teamSize: 1,
        difficulty: 1000, // Difficulté adaptée aux stats brutes (sans multiplicateur)
        rewardPool: {
            pokedollars: { min: 1000, max: 3000 },
            tokens: { min: 1, max: 3, chance: 0.4 },
            eggs: { [RARITY.COMMON]: { amount: 1, chance: 0.3 } },
            items: { 'pokeball': { amount: 2, chance: 0.5 }, 'leftovers': { amount: 1, chance: 0.01 }, 'ct_Surf': { amount: 1, chance: 0.08 } },
            // ✅ NOUVEAU NOM : 'requirements' au lieu de 'bonuses'
            // Plus de 'multiplier', plus de 'label' manuel
            requirements: [
                { type: 'type', value: TYPES.GRASS },
                { type: 'type', value: TYPES.BUG }
            ]
        }
    },
    'abandoned_powerplant': { // NOUVEAU
        id: 'abandoned_powerplant',
        name: "Centrale Abandonnée",
        description: "Des générateurs instables. Attention aux chocs !",
        duration: 7200, // 2 heures
        requiredLevel: 15,
        difficulty: 3000,
        teamSize: 1,
        rewardPool: {
            pokedollars: { min: 4000, max: 8000 },
            tokens: { min: 2, max: 5, chance: 0.6 },
            shards: { amount: 2, chance: 0.3 },
            items: { 'greatball': { amount: 2, chance: 0.4 }, 'ct_Tonnerre': { amount: 1, chance: 0.15 }, 'electirizer': { amount: 1, chance: 0.03 }, 'metal_coat': { amount: 1, chance: 0.02 } },
            requirements: [
                { type: 'type', value: TYPES.ELECTRIC },
                { type: 'type', value: TYPES.STEEL },
                { type: 'type', value: TYPES.WATER }
            ]
        }
    },
    'mine_cave': {
        id: 'mine_cave',
        name: "Grotte Scintillante",
        description: "Une mine profonde riche en minéraux et fossiles.",
        duration: 14400, // 4 heures
        requiredLevel: 25,
        difficulty: 6000,
        teamSize: 1,
        rewardPool: {
            pokedollars: { min: 8000, max: 15000 },
            tokens: { min: 5, max: 10, chance: 0.8 },
            eggs: { [RARITY.RARE]: { amount: 1, chance: 0.2 } },
            shards: { amount: 3, chance: 0.4 },
            items: { 'hard_stone': { amount: 1, chance: 0.1 }, 'talent_reroll': { amount: 1, chance: 0.05 }, 'kings_rock': { amount: 1, chance: 0.03 } },
            requirements: [
                { type: 'type', value: TYPES.ROCK },
                { type: 'type', value: TYPES.GROUND },
                { type: 'talent', value: 'robustesse' }
            ]
        }
    },
    'haunted_mansion': { // NOUVEAU
        id: 'haunted_mansion',
        name: "Manoir Hanté",
        description: "Un lieu effrayant où les objets disparaissent...",
        duration: 21600, // 6 heures
        requiredLevel: 40,
        difficulty: 12000,
        teamSize: 1,
        rewardPool: {
            pokedollars: { min: 15000, max: 30000 },
            tokens: { min: 10, max: 20, chance: 1.0 },
            eggs: { [RARITY.EPIC]: { amount: 1, chance: 0.1 } },
            items: { 'spell_tag': { amount: 1, chance: 0.1 }, 'talent_choice': { amount: 1, chance: 0.02 }, 'reaper_cloth': { amount: 1, chance: 0.03 } },
            requirements: [
                { type: 'type', value: TYPES.GHOST },
                { type: 'type', value: TYPES.DARK },
                { type: 'type', value: TYPES.PSYCHIC }
            ]
        }
    },
    'frozen_tundra': {
        id: 'frozen_tundra',
        name: "Toundra Gelée",
        description: "Un désert de glace mordant. Survivre demande du sang-froid.",
        duration: 10800, // 3 heures
        requiredLevel: 30,
        difficulty: 9000,
        teamSize: 2, // Escouade Duo
        rewardPool: {
            pokedollars: { min: 5000, max: 10000 },
            tokens: { min: 3, max: 7, chance: 0.7 },
            shards: { amount: 4, chance: 0.5 },
            items: { 'greatball': { amount: 3, chance: 0.4 }, 'never_melt_ice': { amount: 1, chance: 0.1 }, 'razor_claw': { amount: 1, chance: 0.025 } }, // Assurez-vous d'avoir cet item ou mettez-en un autre
            requirements: [
                { type: 'type', value: TYPES.ICE },
                { type: 'type', value: TYPES.WATER },
                { type: 'type', value: TYPES.STEEL }
            ]
        }
    },
    'sky_pillar': {
        id: 'sky_pillar',
        name: "Pilier Céleste",
        description: "Une tour qui touche les nuages. Seuls ceux qui volent peuvent l'atteindre.",
        duration: 1800, // 5 heures
        requiredLevel: 45,
        difficulty: 18000,
        teamSize: 1, // Solo Expert
        rewardPool: {
            pokedollars: { min: 12000, max: 25000 },
            tokens: { min: 8, max: 15, chance: 0.9 },
            eggs: { [RARITY.RARE]: { amount: 2, chance: 0.3 } },
            items: { 'sharp_beak': { amount: 1, chance: 0.1 }, 'choice_scarf': { amount: 1, chance: 0.05 }, 'dragon_scale': { amount: 1, chance: 0.02 } },
            requirements: [
                { type: 'type', value: TYPES.FLYING },
                { type: 'type', value: TYPES.DRAGON },
                { type: 'talent', value: 'sniper' }
            ]
        }
    },
    'ancient_ruins': {
        id: 'ancient_ruins',
        name: "Ruines Antiques",
        description: "Des énigmes millénaires protègent ce lieu sacré.",
        duration: 1440, // 4 heures
        requiredLevel: 50,
        difficulty: 22000,
        teamSize: 2, // Escouade Duo
        rewardPool: {
            pokedollars: { min: 20000, max: 40000 },
            tokens: { min: 10, max: 20, chance: 1.0 },
            shards: { amount: 6, chance: 0.6 },
            items: { 'talent_choice': { amount: 1, chance: 0.05 }, 'expert_belt': { amount: 1, chance: 0.08 }, 'protector': { amount: 1, chance: 0.03 } },
            requirements: [
                { type: 'type', value: TYPES.PSYCHIC },
                { type: 'type', value: TYPES.GROUND },
                { type: 'type', value: TYPES.ROCK }
            ]
        }
    },
    'dimensional_rift': {
        id: 'dimensional_rift',
        name: "Faille Dimensionnelle",
        description: "Le tissu de la réalité se déchire. Danger extrême !",
        duration: 4320, // 12 heures (Gros raid de nuit)
        requiredLevel: 80,
        difficulty: 24000, // Très difficile (nécessite 3 gros Pokémon)
        teamSize: 3, // Escouade Trio (Raid)
        rewardPool: {
            pokedollars: { min: 100000, max: 200000 },
            tokens: { min: 50, max: 100, chance: 1.0 },
            eggs: { [RARITY.LEGENDARY]: { amount: 1, chance: 0.05 } }, // 5% chance d'oeuf légendaire
            items: { 'masterball': { amount: 1, chance: 0.02 }, 'lucky_egg': { amount: 1, chance: 0.1 }, 'time_dust_1h': { amount: 1, chance: 0.01 }, 'time_dust_3h': { amount: 1, chance: 0.0025 }, 'time_dust_9h': { amount: 1, chance: 0.0005 } },
            requirements: [
                { type: 'type', value: TYPES.DRAGON },
                { type: 'type', value: TYPES.GHOST },
                { type: 'type', value: TYPES.PSYCHIC },
                { type: 'talent', value: 'phoenix' } // Talent très utile ici
            ]
        }
    },
    'fairy_garden': {
        id: 'fairy_garden',
        name: "Jardin Féerique",
        description: "Un lieu enchanteur mais trompeur.",
        duration: 7200, // 2 heures
        requiredLevel: 20,
        difficulty: 5000,
        teamSize: 1,
        rewardPool: {
            pokedollars: { min: 3000, max: 6000 },
            tokens: { min: 2, max: 5, chance: 0.5 },
            eggs: { [RARITY.RARE]: { amount: 1, chance: 0.2 } },
            items: { 'pokeball': { amount: 5, chance: 0.5 }, 'leftovers': { amount: 1, chance: 0.02 } },
            requirements: [
                { type: 'type', value: TYPES.FAIRY },
                { type: 'type', value: TYPES.GRASS },
                { type: 'talent', value: 'charmeur' }
            ]
        }
    },
    'scorching_desert': {
        id: 'scorching_desert',
        name: "Désert Impitoyable",
        description: "Des tempêtes de sable constantes cachent d'anciens trésors enfouis.",
        duration: 5400, // 1.5 heures
        requiredLevel: 22,
        difficulty: 5500,
        teamSize: 1,
        rewardPool: {
            pokedollars: { min: 4000, max: 7500 },
            tokens: { min: 2, max: 6, chance: 0.6 },
            shards: { amount: 2, chance: 0.4 },
            items: { 'soft_sand': { amount: 1, chance: 0.05 }, 'hyperball': { amount: 3, chance: 0.3 } },
            requirements: [
                { type: 'type', value: TYPES.GROUND },
                { type: 'type', value: TYPES.ROCK },
                { type: 'type', value: TYPES.FIRE }
            ]
        }
    },
    'miasma_swamp': {
        id: 'miasma_swamp',
        name: "Marais Miasmique",
        description: "Un bourbier toxique où la moindre égratignure peut être fatale.",
        duration: 9000, // 2.5 heures
        requiredLevel: 35,
        difficulty: 10000,
        teamSize: 2, // Escouade Duo
        rewardPool: {
            pokedollars: { min: 6000, max: 12000 },
            tokens: { min: 4, max: 8, chance: 0.7 },
            eggs: { [RARITY.RARE]: { amount: 1, chance: 0.25 } },
            items: { 'black_sludge': { amount: 1, chance: 0.05 }, 'greatball': { amount: 2, chance: 0.4 }, 'razor_fang': { amount: 1, chance: 0.025 } },
            requirements: [
                { type: 'type', value: TYPES.POISON },
                { type: 'type', value: TYPES.BUG },
                { type: 'type', value: TYPES.DARK }
            ]
        }
    },
    'deep_abyss': {
        id: 'deep_abyss',
        name: "Abysses Océaniques",
        description: "Une fosse marine insondable. La pression de l'eau y est écrasante.",
        duration: 18000, // 5 heures
        requiredLevel: 55,
        difficulty: 20000,
        teamSize: 2, // Escouade Duo
        rewardPool: {
            pokedollars: { min: 25000, max: 45000 },
            tokens: { min: 15, max: 25, chance: 0.9 },
            eggs: { [RARITY.EPIC]: { amount: 1, chance: 0.15 } },
            shards: { amount: 5, chance: 0.6 },
            items: { 'mystic_water': { amount: 1, chance: 0.08 }, 'hyperball': { amount: 3, chance: 0.5 }, 'time_dust_1h': { amount: 1, chance: 0.003 }, 'prism_scale': { amount: 1, chance: 0.025 } },
            requirements: [
                { type: 'type', value: TYPES.WATER },
                { type: 'type', value: TYPES.DARK },
                { type: 'talent', value: 'robustesse' } // Talent vital pour survivre à la pression
            ]
        }
    },
    'cyber_space': {
        id: 'cyber_space',
        name: "Réseau Virtuel",
        description: "Un espace numérique corrompu rempli de virus et de données rares.",
        duration: 10800, // 3 heures (Temps court mais difficulté brutale)
        requiredLevel: 65,
        difficulty: 26000,
        teamSize: 1, // Solo très difficile
        rewardPool: {
            pokedollars: { min: 35000, max: 55000 },
            tokens: { min: 25, max: 40, chance: 1.0 },
            shards: { amount: 8, chance: 0.7 },
            items: { 'upgrade': { amount: 1, chance: 0.05 }, 'talent_reroll': { amount: 1, chance: 0.1 }, 'time_dust_1h': { amount: 1, chance: 0.004 }, 'time_dust_3h': { amount: 1, chance: 0.001 }, 'dubious_disc': { amount: 1, chance: 0.025 } },
            requirements: [
                { type: 'type', value: TYPES.ELECTRIC },
                { type: 'type', value: TYPES.PSYCHIC },
                { type: 'type', value: TYPES.STEEL },
                { type: 'talent', value: 'sniper' }
            ]
        }
    },
    'meteor_crater': {
        id: 'meteor_crater',
        name: "Cratère Cosmique",
        description: "Le point d'impact d'une météorite. Une énergie extraterrestre en émane.",
        duration: 36000, // 10 heures (Gros raid de jour)
        requiredLevel: 75,
        difficulty: 28000,
        teamSize: 3, // Escouade Trio (Raid)
        rewardPool: {
            pokedollars: { min: 80000, max: 150000 },
            tokens: { min: 40, max: 80, chance: 1.0 },
            eggs: { [RARITY.LEGENDARY]: { amount: 1, chance: 0.03 }, [RARITY.EPIC]: { amount: 1, chance: 0.3 } },
            shards: { amount: 15, chance: 1.0 },
            items: { 'star_piece': { amount: 3, chance: 0.5 }, 'comet_shard': { amount: 1, chance: 0.1 }, 'time_dust_1h': { amount: 1, chance: 0.008 }, 'time_dust_3h': { amount: 1, chance: 0.002 }, 'time_dust_9h': { amount: 1, chance: 0.0004 } },
            requirements: [
                { type: 'type', value: TYPES.PSYCHIC },
                { type: 'type', value: TYPES.DRAGON },
                { type: 'type', value: TYPES.ROCK },
                { type: 'talent', value: 'phoenix' }
            ]
        }
    },
    'volcano_exp': {
        id: 'volcano_exp',
        name: "Cœur du Volcan",
        description: "Une chaleur extrême. Seuls les plus forts survivent.",
        duration: 28000, // 8 heures
        requiredLevel: 60,
        difficulty: 25000,
        teamSize: 1,
        rewardPool: {
            pokedollars: { min: 30000, max: 60000 },
            tokens: { min: 20, max: 40, chance: 1.0 },
            eggs: { [RARITY.LEGENDARY]: { amount: 1, chance: 0.01 } }, // Très rare chance de légendaire
            shards: { amount: 10, chance: 0.8 },
            items: { 'choice_band': { amount: 1, chance: 0.05 }, 'flame_orb': { amount: 1, chance: 0.05 }, 'time_dust_1h': { amount: 1, chance: 0.006 }, 'time_dust_3h': { amount: 1, chance: 0.0015 }, 'magmarizer': { amount: 1, chance: 0.02 } },
            requirements: [
                { type: 'type', value: TYPES.FIRE },
                { type: 'type', value: TYPES.DRAGON },
                { type: 'talent', value: 'collecteur' }
            ]
        }
    }
};

// --- SYSTÈME DE MAÎTRISE DES EXPÉDITIONS ---

const BIOME_MASTERY_LEVELS = {
    1: { xpRequired: 0, bonus: 0, desc: "Novice" },
    2: { xpRequired: 5, bonus: 0.05, desc: "Explorateur (-5% Temps)" },
    3: { xpRequired: 15, bonus: 0.10, desc: "Ranger (-10% Temps)" },
    4: { xpRequired: 30, bonus: 0.15, desc: "Guide (-15% Temps)" },
    5: { xpRequired: 50, bonus: 0.20, desc: "Maître du Biome (-20% Temps)" }
};

const BIOME_DISPLAY = {
    'FOREST': { name: "Forêt", icon: '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leaf-stone.png" class="icon-img" style="width:24px;height:24px;">' },
    'CAVE': { name: "Grotte", icon: '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/moon-stone.png" class="icon-img" style="width:24px;height:24px;">' },
    'CITY': { name: "Urbain", icon: '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/up-grade.png" class="icon-img" style="width:24px;height:24px;">' },
    'DARK': { name: "Ténèbres", icon: '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dusk-stone.png" class="icon-img" style="width:24px;height:24px;">' },
    'VOLCANO': { name: "Volcan", icon: '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-stone.png" class="icon-img" style="width:24px;height:24px;">' },
    'ICE': { name: "Glace", icon: '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ice-stone.png" class="icon-img" style="width:24px;height:24px;">' },
    'SKY': { name: "Ciel", icon: '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pretty-wing.png" class="icon-img" style="width:24px;height:24px;">' }
};

// Mapping : ID de l'expédition -> Type de Biome
const EXPEDITION_BIOMES = {
    // Missions de base
    'explore_forest': 'FOREST',
    'abandoned_powerplant': 'CITY',
    'mine_cave': 'CAVE',
    'haunted_mansion': 'DARK',
    'volcano_exp': 'VOLCANO',

    // Nouvelles missions avancées
    'frozen_tundra': 'ICE',
    'sky_pillar': 'SKY',
    'ancient_ruins': 'CAVE',    // Compte pour la maîtrise Grotte
    'dimensional_rift': 'DARK', // Compte pour la maîtrise Ténèbres
    'fairy_garden': 'FOREST'    // Compte pour la maîtrise Forêt
};

// --- STOCK DE L'ÉPICERIE (POKÉMART) ---
const POKEMART_ITEMS = {
    'pokeball_1': {
        name: "Pokéball",
        description: "Taux de capture standard (x1.0).",
        type: 'item',
        itemId: 'pokeball',
        amount: 1,
        cost: 200,
        icon: "🔴"
    },
    'pokeball_10': {
        name: "Pokéball x10",
        description: "Lot économique de 10 Pokéballs.",
        type: 'item',
        itemId: 'pokeball',
        amount: 10,
        cost: 1800, // 10% de réduction
        icon: "🔴"
    },
    'greatball_1': {
        name: "Super Ball",
        description: "Taux de capture amélioré (x1.5).",
        type: 'item',
        itemId: 'greatball',
        amount: 1,
        cost: 600,
        icon: "🔵"
    },
    'greatball_10': {
        name: "Super Ball x10",
        description: "Lot économique de 10 Super Balls.",
        type: 'item',
        itemId: 'greatball',
        amount: 10,
        cost: 5400,
        icon: "🔵"
    },
    'hyperball_1': {
        name: "Hyper Ball",
        description: "Excellent taux de capture (x2.0).",
        type: 'item',
        itemId: 'hyperball',
        amount: 1,
        cost: 1500,
        icon: "⚫"
    },
    'hyperball_10': {
        name: "Hyper Ball x10",
        description: "Lot économique de 10 Hyper Balls.",
        type: 'item',
        itemId: 'hyperball',
        amount: 10,
        cost: 13500,
        icon: "⚫"
    },
    'thunder_stone_1': {
        name: "Pierre Foudre",
        description: "Fait évoluer certaines espèces (ex: Pikachu, Evoli).",
        type: 'item',
        itemId: 'thunder_stone',
        amount: 1,
        cost: 3200,
        icon: "⚡"
    },
    'fire_stone_1': {
        name: "Pierre Feu",
        description: "Fait évoluer certaines espèces (ex: Vulpix, Caninos, Evoli).",
        type: 'item',
        itemId: 'fire_stone',
        amount: 1,
        cost: 3200,
        icon: "🔥"
    },
    'water_stone_1': {
        name: "Pierre Eau",
        description: "Fait évoluer certaines espèces (ex: Stari, Kokiyas, Evoli).",
        type: 'item',
        itemId: 'water_stone',
        amount: 1,
        cost: 3200,
        icon: "💧"
    },
    'leaf_stone_1': {
        name: "Pierre Plante",
        description: "Fait évoluer certaines espèces (ex: Ortide, Boustiflor).",
        type: 'item',
        itemId: 'leaf_stone',
        amount: 1,
        cost: 3200,
        icon: "🍃"
    },
    'moon_stone_1': {
        name: "Pierre Lune",
        description: "Fait évoluer certaines espèces (ex: Nidorina, Melofee).",
        type: 'item',
        itemId: 'moon_stone',
        amount: 1,
        cost: 3200,
        icon: "🌙"
    },
    'sun_stone_1': {
        name: "Pierre Soleil",
        description: "Fait évoluer certaines espèces (ex: Tournegrin, Ortide).",
        type: 'item',
        itemId: 'sun_stone',
        amount: 1,
        cost: 4200,
        icon: "☀️"
    },
    'shiny_stone_1': {
        name: "Pierre Éclat",
        description: "Fait évoluer certaines espèces (ex: Togetic, Roselia).",
        type: 'item',
        itemId: 'shiny_stone',
        amount: 1,
        cost: 5200,
        icon: "✨"
    },
    'dusk_stone_1': {
        name: "Pierre Nuit",
        description: "Fait évoluer certaines espèces (ex: Corboss, Magireve).",
        type: 'item',
        itemId: 'dusk_stone',
        amount: 1,
        cost: 5200,
        icon: "🌑"
    },
    'dawn_stone_1': {
        name: "Pierre Aube",
        description: "Fait évoluer certaines espèces (ex: Kirlia, Stalgamin).",
        type: 'item',
        itemId: 'dawn_stone',
        amount: 1,
        cost: 5200,
        icon: "🌅"
    },
    'oval_stone_1': {
        name: "Pierre Ovale",
        description: "Fait évoluer certaines espèces (ex: Ptiravi).",
        type: 'item',
        itemId: 'oval_stone',
        amount: 1,
        cost: 4200,
        icon: "🥚"
    }
};



// Taux de conversion des Shards en Poussière
const DUST_CONVERSION_RATES = {
    [RARITY.COMMON]: 1,
    [RARITY.RARE]: 5,
    [RARITY.EPIC]: 25,
    [RARITY.LEGENDARY]: 100
};



// Objets achetables avec de la Poussière
const DUST_SHOP_ITEMS = {
    'talent_reroll': {
        id: 'talent_reroll',
        name: "Cristal de Réinitialisation",
        description: "Réassigne aléatoirement le talent passif d'une créature.",
        cost: 500
    },
    'talent_choice': {
        id: 'talent_choice',
        name: "Orbe de Maîtrise",
        description: "Permet de choisir le talent passif d'une créature.",
        cost: 2500
    },
    'shiny_egg': {
        id: 'shiny_egg',
        name: "Fragment de Brillance",
        description: "Augmente de 10% les chances du prochain œuf d'être Shiny (non cumulable).",
        cost: 10000
    },
    'auto_catcher': {
        id: 'auto_catcher',
        name: "Module Porygon-Z (Auto-Catch)",
        description: "Automatise la capture selon vos filtres. Requiert le Badge Maître.",
        cost: 10000, // Prix élevé en Poussière
        requiredBadge: 'master' // Condition bloquante
    },
    'prism_iv_shop': {
        id: 'prism_iv', // L'ID de l'item à donner
        name: "Prisme d'Optimisation",
        description: "Relance les IVs d'un Pokémon (Garde le meilleur).",
        cost: 5000, // Très cher en poussière
        type: 'item',
        item: 'prism_iv',
        amount: 1
    },
    'time_dust_1h_shop': {
        id: 'time_dust_1h_shop',
        name: "Time Dust I",
        description: "Ressource très rare : +1h de gains passifs de stats instantanés.",
        cost: 18000,
        type: 'item',
        item: 'time_dust_1h',
        amount: 1
    },
    'time_dust_3h_shop': {
        id: 'time_dust_3h_shop',
        name: "Time Dust II",
        description: "Ressource très rare : +3h de gains passifs de stats instantanés.",
        cost: 50000,
        type: 'item',
        item: 'time_dust_3h',
        amount: 1
    },
    'time_dust_9h_shop': {
        id: 'time_dust_9h_shop',
        name: "Time Dust III",
        description: "Ressource mythique : +9h de gains passifs de stats instantanés.",
        cost: 135000,
        type: 'item',
        item: 'time_dust_9h',
        amount: 1
    },
    'trade_stone_shop': {
        id: 'trade_stone_shop',
        name: "Pierre d'échange",
        description: "Permet les évolutions normalement liées aux échanges.",
        cost: 18000,
        type: 'item',
        item: 'trade_stone',
        amount: 1
    }
};

// ============================================================
// TEAM ROCKET MODULE (Banque / Prêt / Staking / Casino)
// ============================================================
const TEAM_ROCKET_QUESTS = {
    'rocket_recruit_meowth': {
        id: 'rocket_recruit_meowth',
        title: "Patte Blanche",
        description: "Capturez un Miaouss pour prouver votre loyauté à la Team Rocket.",
        dialogue: "On n'engage pas n'importe qui. Ramène un Miaouss capturé en personne, et on parlera business.",
        target: 1,
        trackingKey: 'creature_captured',
        requiredSpecies: 'Meowth',
        difficulty: 'EASY',
        tags: ['team_rocket'],
        rewards: { pokedollars: 1200, tokens: 30, items: { 'greatball': 3 } }
    },
    'rocket_capture_persian': {
        id: 'rocket_capture_persian',
        title: "Ascension Féline",
        description: "Capturez un Persian pour montrer votre sérieux à la Team Rocket.",
        dialogue: "Miaouss, c'est l'entrée. Persian, c'est le niveau supérieur. Ramène-en un vivant.",
        target: 1,
        trackingKey: 'creature_captured',
        requiredSpecies: 'Persian',
        difficulty: 'MEDIUM',
        tags: ['team_rocket'],
        rewards: { pokedollars: 2500, tokens: 55, items: { 'hyperball': 2 } }
    },
    'rocket_first_stake': {
        id: 'rocket_first_stake',
        title: "Blanchiment Organisé",
        description: "Terminez 1 session de staking Push Your Luck Team Rocket.",
        dialogue: "Le vrai business, c'est le risque contrôlé. Lance une session et récupère avant le vol.",
        target: 1,
        trackingKey: 'rocket_staking_completed',
        difficulty: 'MEDIUM',
        tags: ['team_rocket'],
        rewards: { pokedollars: 3000, tokens: 65, items: { 'greatball': 5 } }
    },
    'rocket_spins_10': {
        id: 'rocket_spins_10',
        title: "Premiers Pas au Casino",
        description: "Effectuez 10 spins à la machine à sous Team Rocket.",
        dialogue: "La machine, c'est le cœur du business. Fais 10 tours et on verra si tu as de la chance.",
        target: 10,
        trackingKey: 'rocket_spins',
        difficulty: 'EASY',
        tags: ['team_rocket'],
        rewards: { pokedollars: 2000, tokens: 20 }
    },
    'rocket_spins_50': {
        id: 'rocket_spins_50',
        title: "Habitué des Rouleaux",
        description: "Effectuez 50 spins à la machine à sous Team Rocket.",
        dialogue: "Tu reviens ? Bien. 50 spins, et on te considère comme un des nôtres.",
        target: 50,
        trackingKey: 'rocket_spins',
        difficulty: 'MEDIUM',
        tags: ['team_rocket'],
        rewards: { pokedollars: 8000, tokens: 50, items: { 'greatball': 5 } }
    },
    'rocket_spins_100': {
        id: 'rocket_spins_100',
        title: "Cent Tours de Manivelle",
        description: "Effectuez 100 spins à la machine à sous Team Rocket.",
        dialogue: "Cent spins. Ça en fait du RJ dépensé. Prouve que tu tiens la distance.",
        target: 100,
        trackingKey: 'rocket_spins',
        difficulty: 'MEDIUM',
        tags: ['team_rocket'],
        rewards: { pokedollars: 15000, tokens: 80, items: { 'hyperball': 3 } }
    },
    'rocket_spins_250': {
        id: 'rocket_spins_250',
        title: "Machine à Sous Pro",
        description: "Effectuez 250 spins à la machine à sous Team Rocket.",
        dialogue: "250 spins, c'est du sérieux. Les gros bras font ça avant le déjeuner.",
        target: 250,
        trackingKey: 'rocket_spins',
        difficulty: 'HARD',
        tags: ['team_rocket'],
        rewards: { tokens: 150, items: { 'evolution_stone': 1 } }
    },
    'rocket_spins_500': {
        id: 'rocket_spins_500',
        title: "Marathon du Casino",
        description: "Effectuez 500 spins à la machine à sous Team Rocket.",
        dialogue: "Cinq cents. Tu es presque un vrai. Termine et on te récompense.",
        target: 500,
        trackingKey: 'rocket_spins',
        difficulty: 'HARD',
        tags: ['team_rocket'],
        rewards: { tokens: 300, items: { 'time_dust_1h': 1 } }
    }
};

const ROCKET_TRUST_LEVELS = {
    1: { requiredXp: 0, label: "Recrue" },
    2: { requiredXp: 1000, label: "Associé" },
    3: { requiredXp: 2600, label: "Lieutenant" },
    4: { requiredXp: 5200, label: "Capitaine" },
    5: { requiredXp: 9000, label: "Exécutif" }
};

const ROCKET_PUSH_STAKING_CONFIG = {
    cycleMs: 30000, // fallback / affichage (~30s)
    phaseDurationMinMs: 25000,
    phaseDurationMaxMs: 35000,
    multiplierMin: 2,
    multiplierMax: 3,
    offerRotationMs: 600000,
    // GPS = Gains Par Seconde (RJ/sec) de base avant multiplicateur de palier.
    gpsByCategory: {
        common: 2,
        uncommon: 4,
        rare: 16,
        legendary: 32
    },
    // Courbe de risque "Push Your Luck" : test effectué à la fin de chaque cycle de 30s.
    stealRiskByTierPercent: {
        1: 1,
        2: 2,
        3: 5,
        4: 10,
        5: 20,
        6: 40,
        7: 50,
        8: 65,
        9: 80,
        10: 95
    }
};

const ROCKET_CASINO_BALANCE_PRESETS = {
    // Équilibrage actuel (référence, unique preset).
    medium: {
        symbols: [
            { id: 'ID_1', key: 'zubat',   label: 'Nosferapti', weight: 60,   payMultiplier: 2,   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png' },
            { id: 'ID_2', key: 'koffing', label: 'Smogo',      weight: 45,   payMultiplier: 5,   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/109.png' },
            { id: 'ID_3', key: 'arbok',   label: 'Arbok',      weight: 30,   payMultiplier: 15,  sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/24.png' },
            { id: 'ID_4', key: 'red_gyarados', label: 'Léviator Rouge', weight: 22, payMultiplier: 50, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/130.png' },
            { id: 'ID_5', key: 'meowth',  label: 'Miaouss',    weight: 12,    payMultiplier: 500, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png' },
            { id: 'ID_6', key: 'giovanni',label: 'Giovanni',   weight: 6,  payMultiplier: 900, sprite: 'img/Giovanni.png' }
        ]
    }
};

const ROCKET_CASINO_ACTIVE_PRESET = 'medium';
const ROCKET_CASINO_CONFIG = {
    lineCostRJ: 250,
    defaultActivePaylines: 8,
    ...(ROCKET_CASINO_BALANCE_PRESETS[ROCKET_CASINO_ACTIVE_PRESET] || ROCKET_CASINO_BALANCE_PRESETS.medium)
};

// Paytable multi-récompenses pour les triples symboles de la machine Team Rocket.
// rewardType supportés: currency, item, quest_token, jackpot.
const SLOT_REWARDS = [
    // --- ID_1 / Nosferapti ---
    { symbolId: 'ID_1', weight: 100, rewardType: 'currency', targetId: 'pokedollars_scaled', amount: 1 },

    // --- ID_2 / Smogo ---
    { symbolId: 'ID_2', weight: 100, rewardType: 'currency', targetId: 'pokedollars_scaled', amount: 1.15 },
    { symbolId: 'ID_2', weight: 45, rewardType: 'quest_token', targetId: 'quest_token', amount: 8 },
    { symbolId: 'ID_2', weight: 30, rewardType: 'currency', targetId: 'marques_du_triomphe', amount: 10 },
    { symbolId: 'ID_2', weight: 25, rewardType: 'currency', targetId: 'essence_dust', amount: 60 },

    // --- ID_3 / Arbok ---
    { symbolId: 'ID_3', weight: 100, rewardType: 'currency', targetId: 'pokedollars_scaled', amount: 1.5 },
    { symbolId: 'ID_3', weight: 40, rewardType: 'quest_token', targetId: 'quest_token', amount: 16 },
    { symbolId: 'ID_3', weight: 35, rewardType: 'item', targetId: 'hyperball', amount: 2 },
    { symbolId: 'ID_3', weight: 25, rewardType: 'item', targetId: 'greatball', amount: 4 },

    // --- ID_4 / Léviator Rouge ---
    { symbolId: 'ID_4', weight: 100, rewardType: 'currency', targetId: 'pokedollars_scaled', amount: 2.0 },
    { symbolId: 'ID_4', weight: 25, rewardType: 'item', targetId: 'hyperball', amount: 6 },
    { symbolId: 'ID_4', weight: 22, rewardType: 'item', targetId: 'time_dust_1h', amount: 1 },
    { symbolId: 'ID_4', weight: 20, rewardType: 'item', targetId: 'leftovers', amount: 1 },
    { symbolId: 'ID_4', weight: 18, rewardType: 'quest_token', targetId: 'quest_token', amount: 25 },
    { symbolId: 'ID_4', weight: 15, rewardType: 'currency', targetId: 'marques_du_triomphe', amount: 50 },

    // --- ID_6 / Giovanni  ---
    { symbolId: 'ID_6', weight: 100, rewardType: 'currency', targetId: 'pokedollars_scaled', amount: 2.2 },
    { symbolId: 'ID_6', weight: 24, rewardType: 'item', targetId: 'masterball', amount: 1 },
    { symbolId: 'ID_6', weight: 22, rewardType: 'item', targetId: 'prism_iv', amount: 1 },
    { symbolId: 'ID_6', weight: 20, rewardType: 'item', targetId: 'time_dust_1h', amount: 2 },
    { symbolId: 'ID_6', weight: 18, rewardType: 'item', targetId: 'time_dust_3h', amount: 1 },
    { symbolId: 'ID_6', weight: 16, rewardType: 'item', targetId: 'choice_band', amount: 1 },
    { symbolId: 'ID_6', weight: 12, rewardType: 'item', targetId: 'leftovers', amount: 1 },
    { symbolId: 'ID_6', weight: 4, rewardType: 'item', targetId: 'metal_coat', amount: 1 },
    { symbolId: 'ID_6', weight: 4, rewardType: 'item', targetId: 'kings_rock', amount: 1 },
    { symbolId: 'ID_6', weight: 4, rewardType: 'item', targetId: 'dragon_scale', amount: 1 },
    { symbolId: 'ID_6', weight: 4, rewardType: 'item', targetId: 'upgrade', amount: 1 },
    { symbolId: 'ID_6', weight: 4, rewardType: 'item', targetId: 'prism_scale', amount: 1 },
    { symbolId: 'ID_6', weight: 4, rewardType: 'item', targetId: 'protector', amount: 1 },
    { symbolId: 'ID_6', weight: 4, rewardType: 'item', targetId: 'electirizer', amount: 1 },
    { symbolId: 'ID_6', weight: 4, rewardType: 'item', targetId: 'magmarizer', amount: 1 },
    { symbolId: 'ID_6', weight: 4, rewardType: 'item', targetId: 'reaper_cloth', amount: 1 },
    { symbolId: 'ID_6', weight: 4, rewardType: 'item', targetId: 'dubious_disc', amount: 1 },
    { symbolId: 'ID_6', weight: 4, rewardType: 'item', targetId: 'razor_claw', amount: 1 },
    { symbolId: 'ID_6', weight: 4, rewardType: 'item', targetId: 'razor_fang', amount: 1 },
    { symbolId: 'ID_6', weight: 4, rewardType: 'item', targetId: 'trade_stone', amount: 1 },

    // --- ID_5 / Miaouss Jackpot ---
    { symbolId: 'ID_5', weight: 100, rewardType: 'currency', targetId: 'pokedollars_scaled', amount: 2.5 },
    { symbolId: 'ID_5', weight: 18, rewardType: 'item', targetId: 'masterball', amount: 1 },
    { symbolId: 'ID_5', weight: 18, rewardType: 'item', targetId: 'prism_iv', amount: 1 },
    { symbolId: 'ID_5', weight: 18, rewardType: 'item', targetId: 'time_dust_1h', amount: 2 },
    { symbolId: 'ID_5', weight: 16, rewardType: 'item', targetId: 'time_dust_3h', amount: 1 },
    { symbolId: 'ID_5', weight: 12, rewardType: 'item', targetId: 'choice_band', amount: 1 },
    { symbolId: 'ID_5', weight: 18, rewardType: 'item', targetId: 'ct_Surf', amount: 1 },
    { symbolId: 'ID_5', weight: 18, rewardType: 'item', targetId: 'ct_Tonnerre', amount: 1 },
    { symbolId: 'ID_5', weight: 14, rewardType: 'item', targetId: 'ct_Psyko', amount: 1 },
    { symbolId: 'ID_5', weight: 12, rewardType: 'item', targetId: 'ct_Lance-Flammes', amount: 1 },
    { symbolId: 'ID_5', weight: 10, rewardType: 'item', targetId: 'ct_Laser Glace', amount: 1 },
    { symbolId: 'ID_5', weight: 100, rewardType: 'jackpot', targetId: 'miaouss_jackpot', amount: 1 }
];

// --- DÉFINITION DES ZONES (Noms, Niveaux, Difficulté) ---
const ZONES = {
    // DÉBUT (Badge 1)
    1: { name: "Bourg Palette", levelRange: [2, 5], multiplier: 1, maxTier: 10 },
    2: { name: "Route 22", levelRange: [3, 6], multiplier: 6, maxTier: 15 },
    3: { name: "Route 2", levelRange: [4, 7], multiplier: 18, maxTier: 20 },
    4: { name: "Forêt de Jade", levelRange: [5, 9], multiplier: 54, maxTier: 25, requiredEpics: 1 },

    // AZURIA (Badge 2)
    5: { name: "Route 3 (Vers Mont)", levelRange: [8, 12], multiplier: 162, maxTier: 30 },
    6: { name: "Mont Sélénite", levelRange: [10, 15], multiplier: 405, maxTier: 35, requiredBosses: 1 },
    7: { name: "Route 4 (Sortie)", levelRange: [12, 16], multiplier: 810, maxTier: 40 },
    8: { name: "Pont Pépite (Route 24)", levelRange: [14, 18], multiplier: 1539, maxTier: 45 },
    9: { name: "Cap d'Azuria (Route 25)", levelRange: [15, 20], multiplier: 2770, maxTier: 50 },

    // CARMIN (Badge 3)
    10: { name: "Route 5 (Pension)", levelRange: [16, 21], multiplier: 4710, maxTier: 55 },
    11: { name: "Route 6 (Sud)", levelRange: [17, 22], multiplier: 7534, maxTier: 60 },
    12: { name: "Cave Taupiqueur", levelRange: [18, 25], multiplier: 11302, maxTier: 65, requiredEpics: 2 },
    13: { name: "Route 11 (Est)", levelRange: [19, 24], multiplier: 15823, maxTier: 70 },

    // LAVANVILLE (Badge 4)
    14: { name: "Route 9 (Est Azuria)", levelRange: [20, 26], multiplier: 20570, maxTier: 75 },
    15: { name: "Route 10 (Centrale)", levelRange: [22, 28], multiplier: 24684, maxTier: 80 },
    16: { name: "Grotte Sombre", levelRange: [24, 30], multiplier: 27152, maxTier: 85, requiredBosses: 2 },
    17: { name: "Tour Pokémon", levelRange: [25, 32], multiplier: 29868, maxTier: 90, requiredEpics: 3 },
    18: { name: "Route 8 (Ouest)", levelRange: [26, 33], multiplier: 32855, maxTier: 95 },
    19: { name: "Route 7 (Céladopole)", levelRange: [27, 34], multiplier: 36140, maxTier: 100 },

    // PARMANIE (Badge 5 & 6)
    20: { name: "Piste Cyclable (R17)", levelRange: [28, 35], multiplier: 39754, maxTier: 100 },
    21: { name: "Pont Silence (R12-15)", levelRange: [30, 38], multiplier: 43730, maxTier: 100 },
    22: { name: "Parc Safari", levelRange: [32, 40], multiplier: 48103, maxTier: 100, requiredBosses: 3 },

    // CRAMOIS'ÎLE (Badge 7)
    23: { name: "Chenaux (Surf)", levelRange: [35, 42], multiplier: 52913, maxTier: 100 },
    24: { name: "Iles Écume", levelRange: [38, 45], multiplier: 58204, maxTier: 100, requiredBosses: 4 },
    25: { name: "Manoir Pokémon", levelRange: [40, 48], multiplier: 64025, maxTier: 100, requiredEpics: 5 },

    // LIGUE (Badge 8)
    26: { name: "Centrale (Optionnel)", levelRange: [42, 50], multiplier: 70427, maxTier: 100, requiredBosses: 5 },
    27: { name: "Route 23 (Victoire)", levelRange: [45, 55], multiplier: 77470, maxTier: 100 },
    28: { name: "Route Victoire", levelRange: [50, 60], multiplier: 85217, maxTier: 100, requiredBosses: 3 },

    // END GAME
    29: { name: "Caverne Azurée", levelRange: [60, 70], multiplier: 93739, maxTier: 100, requiredBosses: 4 },
    30: { name: "Monde Distorsion", levelRange: [70, 100], multiplier: 103113, maxTier: 100, requiredBosses: 5 }
};

// --- POPULATION DES ZONES (Avec Biomes pour Surf/Pêche) ---
const ZONE_POKEMON = {
    // Zone 1 : Route 1
    1: {
        land: ['Pidgey', 'Rattata'],
        fishing: ['Magikarp']
    },
    // Zone 2 : Route 22
    2: {
        land: ['Rattata', 'Spearow', 'Mankey', 'Nidoran♀', 'Nidoran♂'],
        water: ['Psyduck', 'Poliwag'],
        fishing: ['Magikarp', 'Goldeen']
    },
    // Zone 3 : Route 2
    3: {
        land: ['Pidgey', 'Rattata', 'Caterpie', 'Weedle'],
        fishing: ['Magikarp']
    },
    // Zone 4 : Forêt de Jade
    4: ['Caterpie', 'Metapod', 'Weedle', 'Kakuna', 'Pikachu', 'Pidgey', 'Pidgeotto'],

    // Zone 5 : Route 3
    5: {
        land: ['Pidgey', 'Spearow', 'Jigglypuff', 'Mankey', 'Sandshrew', 'Ekans'],
        fishing: ['Magikarp', 'Goldeen']
    },
    // Zone 6 : Mont Sélénite
    6: ['Zubat', 'Geodude', 'Paras', 'Clefairy'],

    // Zone 7 : Route 4
    7: {
        land: ['Rattata', 'Spearow', 'Ekans', 'Sandshrew', 'Mankey'],
        water: ['Psyduck', 'Slowpoke'],
        fishing: ['Magikarp', 'Krabby']
    },
    // Zone 8 : Route 24
    8: {
        land: ['Caterpie', 'Weedle', 'Pidgey', 'Abra', 'Bellsprout', 'Oddish', 'Venonat'],
        water: ['Psyduck', 'Goldeen'],
        fishing: ['Magikarp', 'Krabby']
    },
    // Zone 9 : Route 25
    9: {
        land: ['Caterpie', 'Weedle', 'Pidgey', 'Pidgeotto', 'Abra', 'Bellsprout', 'Oddish', 'Venonat'],
        fishing: ['Magikarp', 'Krabby', 'Kingler']
    },
    // Zone 10 : Route 5
    10: ['Pidgey', 'Rattata', 'Jigglypuff', 'Meowth', 'Mankey', 'Abra'],

    // Zone 11 : Route 6
    11: {
        land: ['Pidgey', 'Rattata', 'Jigglypuff', 'Meowth', 'Mankey', 'Psyduck'],
        water: ['Psyduck', 'Golduck'],
        fishing: ['Magikarp', 'Shellder']
    },
    // Zone 12 : Cave Taupiqueur
    12: ['Diglett', 'Dugtrio'],

    // Zone 13 : Route 11
    13: {
        land: ['Drowzee', 'Ekans', 'Sandshrew', 'Spearow'],
        water: ['Tentacool', 'Horsea'],
        fishing: ['Magikarp', 'Krabby', 'Horsea']
    },
    // Zone 14 : Route 9
    14: {
        land: ['Rattata', 'Spearow', 'Fearow', 'Ekans', 'Sandshrew', 'Nidoran♀', 'Nidoran♂'],
        water: ['Tentacool'],
        fishing: ['Magikarp', 'Krabby']
    },
    // Zone 15 : Route 10
    15: {
        land: ['Voltorb', 'Spearow', 'Ekans', 'Sandshrew', 'Magnemite'],
        water: ['Tentacool', 'Slowpoke'],
        fishing: ['Magikarp', 'Poliwag']
    },
    // Zone 16 : Grotte Sombre
    16: ['Zubat', 'Geodude', 'Machop', 'Onix', 'Graveler', 'Golbat', 'Cubone'],

    // Zone 17 : Tour Pokémon
    17: ['Gastly', 'Haunter', 'Cubone', 'Zubat', 'Golbat'],

    // Zone 18 : Route 8
    18: ['Pidgey', 'Meowth', 'Mankey', 'Growlithe', 'Vulpix', 'Abra', 'Kadabra'],

    // Zone 19 : Route 7
    19: ['Pidgey', 'Meowth', 'Mankey', 'Growlithe', 'Vulpix', 'Bellsprout', 'Oddish'],

    // Zone 20 : Piste Cyclable
    20: {
        land: ['Rattata', 'Raticate', 'Spearow', 'Fearow', 'Doduo', 'Dodrio', 'Snorlax', 'Grimer', 'Muk', 'Ponyta'],
        fishing: ['Magikarp', 'Shellder', 'Cloyster']
    },
    // Zone 21 : Pont Silence
    21: {
        land: ['Pidgey', 'Pidgeotto', 'Oddish', 'Gloom', 'Bellsprout', 'Weepinbell', 'Venonat', 'Ditto', 'Farfetch\'d'],
        water: ['Tentacool', 'Tentacruel', 'Slowpoke', 'Slowbro'],
        fishing: ['Magikarp', 'Poliwag', 'Seaking']
    },
    // Zone 22 : Parc Safari
    22: {
        land: ['Nidoran♀', 'Nidorina', 'Nidoran♂', 'Nidorino', 'Parasect', 'Venonat', 'Venomoth', 'Exeggcute', 'Rhyhorn', 'Kangaskhan', 'Scyther', 'Pinsir', 'Tauros', 'Chansey'],
        water: ['Psyduck', 'Slowpoke'],
        fishing: ['Magikarp', 'Dratini', 'Dragonair']
    },
    // Zone 23 : Chenaux
    23: {
        land: [], // Uniquement sur l'eau
        water: ['Tentacool', 'Tentacruel', 'Staryu', 'Starmie', 'Lapras'],
        fishing: ['Magikarp', 'Tentacool', 'Horsea', 'Seadra']
    },
    // Zone 24 : Iles Écume
    24: {
        land: ['Zubat', 'Golbat', 'Psyduck', 'Golduck', 'Slowpoke', 'Slowbro', 'Seel', 'Dewgong', 'Jynx'],
        water: ['Seel', 'Dewgong', 'Horsea', 'Seadra'],
        fishing: ['Magikarp', 'Krabby', 'Kingler']
    },
    // Zone 25 : Manoir Pokémon
    25: ['Raticate', 'Vulpix', 'Growlithe', 'Grimer', 'Muk', 'Koffing', 'Weezing', 'Ponyta', 'Rapidash', 'Magmar', 'Ditto'],

    // Zone 26 : Centrale
    26: ['Magnemite', 'Magneton', 'Voltorb', 'Electrode', 'Pikachu', 'Raichu', 'Electabuzz'],

    // Zone 27 : Route 23
    27: {
        land: ['Spearow', 'Fearow', 'Ekans', 'Arbok', 'Sandshrew', 'Sandslash', 'Nidorina', 'Nidorino', 'Mankey', 'Primeape'],
        water: ['Slowbro', 'Psyduck'],
        fishing: ['Magikarp', 'Poliwag', 'Poliwhirl']
    },
    // Zone 28 : Route Victoire
    28: ['Machop', 'Machoke', 'Geodude', 'Graveler', 'Onix', 'Zubat', 'Golbat', 'Venomoth', 'Marowak'],

    // Zone 29 : Caverne Azurée
    29: {
        land: ['Parasect', 'Kadabra', 'Alakazam', 'Raichu', 'Sandslash', 'Arbok', 'Gloom', 'Weepinbell', 'Ditto', 'Dodrio', 'Venomoth', 'Chansey', 'Wigglytuff'],
        water: ['Golduck', 'Slowbro'],
        fishing: ['Magikarp', 'Seaking', 'Gyarados', 'Dratini', 'Dragonair']
    },
    // Zone 30 : Monde Distorsion
    30: ['Mew', 'Porygon', 'Omanyte', 'Kabuto', 'Aerodactyl']
};

// CONFIGURATION DU RYTHME DE JEU
const GAME_SPEEDS = {
    // Temps pour remplir la barre ATB à vitesse normale (Plus c'est haut, plus c'est lent)
    // 1200ms = 1.2 secondes. C'est le rythme "humain" idéal.
    BASE_TURN_TIME: 800,

    // Temps d'attente une fois la barre pleine avant d'attaquer (Le "Métronome")
    // Permet de voir "Ah, il est prêt !"
    PRE_ATTACK_DELAY: 200,

    // Temps de pause PENDANT l'attaque (bloque l'ATB)
    // Doit être assez long pour voir le sprite bouger et le chiffre apparaître
    ANIMATION_LOCK: 200,

    // Durée de la transition CSS des barres de vie (Lissage)
    HEALTH_BAR_TRANSITION: '0.2s',

    // Temps entre la mort d'un ennemi et l'apparition du suivant
    RESPAWN_DELAY: 1000,

    // Limite par défaut de combats simulés par seconde pendant le rattrapage hors-ligne.
    // Utilisé pour éviter de surcharger le CPU si le joueur est resté absent très longtemps.
    OFFLINE_SIM_MAX_COMBATS_PER_SECOND: 300
};

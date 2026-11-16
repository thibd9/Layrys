  /* ================= Reference data ================= */
  const FORMATS = [
    { id:"pokemon", game:"Pokémon TCG", pub:"The Pokémon Company", w:63, h:88, r:3, group:"std", pack:{ cards:10, packs:36, note:"10 cartes / booster, 36 boosters par display (anglais) ; 5 cartes et 30 boosters au Japon ; coffret dresseur d'élite 9 boosters" }, finishes:["g-pkm-reverse","g-pkm-cosmos","g-pkm-sheen","g-pkm-texture","g-pkm-gold","g-pkm-rainbow","g-pkm-shattered","g-pkm-crosshatch","g-pkm-galaxy"] },
    { id:"mtg", game:"Magic: The Gathering", pub:"Wizards of the Coast", w:63, h:88, r:3, group:"std", pack:{ cards:14, packs:36, note:"Play Booster 14 cartes ; 36 boosters par display, 30 pour les sets récents ; Collector Booster 12 par display" }, finishes:["g-mtg-trad","g-mtg-etched","g-mtg-textured","g-mtg-surge","g-mtg-galaxy","g-mtg-halo","g-mtg-confetti","g-mtg-neon","g-mtg-gilded","g-mtg-oilslick","g-mtg-fracture","g-mtg-ripple","g-mtg-raised","g-mtg-doublerainbow","g-mtg-silverscreen","g-mtg-step"] },
    { id:"onepiece", game:"One Piece Card Game", pub:"Bandai", w:63, h:88, r:3, group:"std", pack:{ cards:12, packs:24, note:"12 cartes / booster, 24 boosters par display (288 cartes)" }, finishes:["g-op-parallel","g-op-sp","g-op-manga","g-op-treasure"] },
    { id:"lorcana", game:"Disney Lorcana", pub:"Ravensburger", w:63, h:88, r:3, group:"std", pack:{ cards:12, packs:24, note:"12 cartes / booster, 24 boosters par display" }, finishes:["g-lor-foil","g-lor-enchanted"] },
    { id:"digimon", game:"Digimon Card Game", pub:"Bandai", w:63, h:88, r:3, group:"std", pack:{ cards:12, packs:24, note:"12 cartes / booster, 24 boosters par display, souvent une carte box topper" }, finishes:["g-dgm-parallel","g-dgm-sec"] },
    { id:"dbsfw", game:"Dragon Ball Super · Fusion World", pub:"Bandai", w:63, h:88, r:3, group:"std", pack:{ cards:12, packs:24, note:"12 cartes / booster, 24 boosters par display (≈)" }, finishes:["g-dbs-scr","g-dbs-god"] },
    { id:"fab", game:"Flesh and Blood", pub:"Legend Story Studios", w:63, h:88, r:3, group:"std", pack:{ cards:16, packs:24, note:"15 cartes + 1 token / booster, 24 boosters par display ; une rainbow foil par booster" }, finishes:["g-fab-rainbow","g-fab-cold","g-fab-goldcold"] },
    { id:"swu", game:"Star Wars: Unlimited", pub:"Fantasy Flight Games", w:63, h:88, r:3, group:"std", pack:{ cards:16, packs:24, note:"16 cartes / booster, 24 boosters par display ; hyperspace foil ≈ 1 booster sur 24" }, finishes:["g-swu-hyperspace","g-swu-showcase","g-swu-prestige"] },
    { id:"unionarena", game:"Union Arena", pub:"Bandai", w:63, h:88, r:3, group:"std", pack:{ cards:8, packs:16, note:"8 cartes / booster, 16 boosters par display (≈)" }, finishes:["g-op-parallel","g-dgm-sec"] },
    { id:"weiss", game:"Weiss Schwarz", pub:"Bushiroad", w:63, h:88, r:3, group:"std", pack:{ cards:9, packs:16, note:"9 cartes / booster, 16 boosters par display (≈) ; cartes signées SP" }, finishes:["g-lor-foil","g-op-sp"] },
    { id:"duelmasters", game:"Duel Masters", pub:"Takara Tomy", w:63, h:88, r:3, group:"std", pack:{ cards:5, packs:30, note:"5 cartes / booster au Japon, 30 boosters par display (≈)" }, finishes:["g-ygo-secret","g-pkm-gold"] },
    { id:"fftcg", game:"Final Fantasy TCG", pub:"Square Enix", w:63, h:88, r:3, group:"std", pack:{ cards:12, packs:36, note:"12 cartes / booster, 36 boosters par display" }, finishes:["g-lor-foil","g-pkm-texture"] },
    { id:"gundam", game:"Gundam Card Game", pub:"Bandai", w:63, h:88, r:3, group:"std", pack:{ cards:12, packs:24, note:"12 cartes / booster, 24 boosters par display (≈, format Bandai standard)" }, finishes:["g-op-parallel","g-dgm-sec"] },
    { id:"riftbound", game:"Riftbound · League of Legends", pub:"Riot Games", w:63, h:88, r:3, group:"std", pack:{ cards:14, packs:24, note:"14 cartes / booster, 24 boosters par display (≈)" }, finishes:["g-lor-foil","g-swu-showcase"] },
    { id:"altered", game:"Altered", pub:"Equinox", w:63, h:88, r:3, group:"std", pack:{ cards:14, packs:36, note:"14 cartes / booster, 36 boosters par display (≈) ; cartes « unique » exemplaires uniques" }, finishes:["g-lor-foil"] },
    { id:"sorcery", game:"Sorcery: Contested Realm", pub:"Erik's Curiosa", w:63, h:88, r:3, group:"std", pack:{ cards:15, packs:36, note:"15 cartes / booster, 36 boosters par display (≈)" }, finishes:["g-mtg-trad"] },
    { id:"grandarchive", game:"Grand Archive", pub:"Weebs of the Shore", w:63, h:88, r:3, group:"std", pack:{ cards:12, packs:24, note:"12 cartes / booster, 24 boosters par display (≈)" }, finishes:["g-lor-foil","g-ygo-collectors"] },
    { id:"metazoo", game:"MetaZoo", pub:"MetaZoo Games", w:63, h:88, r:3, group:"std", pack:{ cards:10, packs:36, note:"10 cartes / booster, 36 boosters par display (≈)" }, finishes:["g-pkm-reverse","g-mtg-trad"] },
    { id:"shadowverse", game:"Shadowverse: Evolve", pub:"Bushiroad", w:63, h:88, r:3, group:"std", pack:{ cards:8, packs:16, note:"8 cartes / booster, 16 boosters par display (≈)" }, finishes:["g-lor-foil","g-mtg-etched"] },
    { id:"battlespirits", game:"Battle Spirits Saga", pub:"Bandai", w:63, h:88, r:3, group:"std", pack:{ cards:12, packs:24, note:"12 cartes / booster, 24 boosters par display (≈). La version japonaise historique est au petit format." }, finishes:["g-op-parallel","g-dbs-god"] },
    { id:"wixoss", game:"WIXOSS", pub:"Takara Tomy", w:63, h:88, r:3, group:"std", pack:{ cards:8, packs:20, note:"8 cartes / booster, 20 boosters par display (≈)" }, finishes:["g-ygo-secret"] },
    { id:"keyforge", game:"KeyForge", pub:"Ghost Galaxy", w:63, h:88, r:3, group:"std", pack:{ cards:37, packs:12, note:"decks uniques de 37 cartes, 12 decks par display ; pas de foil" }, finishes:[] },
    { id:"sports", game:"Cartes sportives (Topps, Panini)", pub:"divers", w:63.5, h:88.9, r:3, group:"std", pack:{ cards:8, packs:24, note:"2,5 × 3,5 pouces ; hobby box variable" }, finishes:["g-spt-refractor","g-spt-chrome"] },
    { id:"yugioh", game:"Yu-Gi-Oh! TCG / OCG", pub:"Konami", w:59, h:86, r:2.5, group:"jp", pack:{ cards:9, packs:24, note:"9 cartes / booster, 24 boosters par display (216 cartes)" }, finishes:["g-ygo-super","g-ygo-ultra","g-ygo-secret","g-ygo-prismatic","g-ygo-ultimate","g-ygo-ghost","g-ygo-gold","g-ygo-platinum","g-ygo-collectors","g-ygo-starlight","g-ygo-qcsr","g-ygo-prismcoll"] },
    { id:"rushduel", game:"Yu-Gi-Oh! Rush Duel", pub:"Konami", w:59, h:86, r:2.5, group:"jp", pack:{ cards:5, packs:30, note:"5 cartes / booster au Japon, 30 boosters par display (≈)" }, finishes:["g-ygo-super","g-ygo-ultra","g-ygo-secret"] },
    { id:"vanguard", game:"Cardfight!! Vanguard", pub:"Bushiroad", w:59, h:86, r:2.5, group:"jp", pack:{ cards:7, packs:16, note:"7 cartes / booster, 16 boosters par display (≈)" }, finishes:["g-lor-foil","g-op-sp"] },
    { id:"buddyfight", game:"Future Card Buddyfight", pub:"Bushiroad", w:59, h:86, r:2.5, group:"jp", pack:{ cards:5, packs:30, note:"5 cartes / booster, 30 boosters par display (≈)" }, finishes:["g-ygo-secret"] },
    { id:"poker", game:"Cartes à jouer · poker", pub:"—", w:63.5, h:88.9, r:3.2, group:"other", pack:{ cards:54, packs:12, note:"jeu de 52 cartes + jokers" }, finishes:[] },
    { id:"bridge", game:"Cartes à jouer · bridge", pub:"—", w:57, h:89, r:3, group:"other", pack:{ cards:52, packs:12, note:"format étroit" }, finishes:[] },
    { id:"tarot", game:"Tarot / oracle", pub:"—", w:70, h:120, r:4, group:"other", pack:{ cards:78, packs:6, note:"tarot 78 cartes ; aussi utilisé par des jeux de société" }, finishes:["g-mtg-gilded"] },
    { id:"skat", game:"Skat", pub:"—", w:59, h:91, r:3, group:"other", pack:{ cards:32, packs:12, note:"" }, finishes:[] },
    { id:"minieuro", game:"Mini euro (jeux de société)", pub:"—", w:44, h:68, r:2.5, group:"other", pack:{ cards:100, packs:1, note:"petites cartes de jeux de société" }, finishes:[] },
    { id:"miniusa", game:"Mini américain", pub:"—", w:41, h:63, r:2.5, group:"other", pack:{ cards:100, packs:1, note:"" }, finishes:[] },
    { id:"dixit", game:"Grand format (type Dixit)", pub:"—", w:80, h:120, r:4, group:"other", pack:{ cards:84, packs:1, note:"" }, finishes:[] },
    { id:"jumbo", game:"Jumbo / oversize", pub:"—", w:89, h:127, r:5, group:"other", pack:{ cards:1, packs:1, note:"cartes promotionnelles géantes (3,5 × 5 pouces)" }, finishes:["g-pkm-texture"] },
    { id:"square", game:"Carré", pub:"—", w:70, h:70, r:5, group:"other", pack:{ cards:1, packs:1, note:"stickers et cartes carrées" }, finishes:[] },
    { id:"custom", game:"Personnalisé", pub:"—", w:63, h:88, r:3, group:"other", pack:{ cards:10, packs:24, note:"dimensions libres" }, finishes:[] },
  ];
  /* old glossary ids used by FORMATS.finishes → print-process presets */
  const OLD_FINISH = { "g-pkm-reverse":"h-rainbow", "g-pkm-cosmos":"h-cosmic", "g-pkm-sheen":"h-lines", "g-pkm-texture":"h-etched", "g-pkm-gold":"h-goldboard", "g-pkm-rainbow":"h-oil", "g-pkm-shattered":"h-ice", "g-pkm-crosshatch":"h-etched-cross", "g-pkm-galaxy":"h-stars",
    "g-mtg-trad":"h-rainbow", "g-mtg-etched":"i-silver", "g-mtg-textured":"h-etched-cross", "g-mtg-surge":"h-lines", "g-mtg-galaxy":"h-stars", "g-mtg-halo":"h-lens", "g-mtg-confetti":"h-stars", "g-mtg-neon":"i-neon-pink", "g-mtg-gilded":"f-emboss-gold", "g-mtg-oilslick":"h-oil", "g-mtg-fracture":"h-crystal", "g-mtg-ripple":"h-lens", "g-mtg-raised":"e-image", "g-mtg-doublerainbow":"h-rainbow", "g-mtg-silverscreen":"h-silver", "g-mtg-step":"h-diamond",
    "g-op-parallel":"h-rainbow", "g-op-sp":"h-etched", "g-op-manga":"h-etched-cross", "g-op-treasure":"f-gold", "g-lor-foil":"h-rainbow", "g-lor-enchanted":"h-lens", "g-dgm-parallel":"h-rainbow", "g-dgm-sec":"h-secret", "g-dbs-scr":"h-etched", "g-dbs-god":"h-goldboard",
    "g-fab-rainbow":"h-rainbow", "g-fab-cold":"f-silver", "g-fab-goldcold":"f-gold", "g-swu-hyperspace":"h-rainbow", "g-swu-showcase":"f-gold", "g-swu-prestige":"f-emboss-gold", "g-spt-refractor":"h-prism", "g-spt-chrome":"h-silver",
    "g-ygo-super":"h-rainbow", "g-ygo-ultra":"f-gold", "g-ygo-secret":"h-secret", "g-ygo-prismatic":"h-prism", "g-ygo-ultimate":"e-image", "g-ygo-ghost":"i-silver", "g-ygo-gold":"f-gold", "g-ygo-platinum":"f-silver", "g-ygo-collectors":"h-etched", "g-ygo-starlight":"h-starlight", "g-ygo-qcsr":"h-crystal", "g-ygo-prismcoll":"h-prism" };
  for (const f of FORMATS) f.finishes = [...new Set(f.finishes.map(id => OLD_FINISH[id] || id))];
  const FORMAT_GROUPS = [["all","Tous"],["std","Standard 63 × 88"],["jp","Japonais 59 × 86"],["other","Autres formats"]];

  const PROTECTIONS = [
    { id:"none", name:"Aucune", sub:"carte nue", dims:"—" },
    { id:"sleeve", name:"Pochette souple", sub:"66 × 91 mm", dims:"Standard 66 × 91 mm (≈ 2 ⅝ × 3 ⅝ po) · japonais 62 × 89 mm · perfect fit intérieur 64 × 89 mm · finitions brillante, mate ou colorée" },
    { id:"toploader", name:"Toploader", sub:"76 × 101 mm · 35 pt", dims:"Extérieur 76 × 101 mm · intérieur ≈ 70 × 98 mm · 35 pt (≈ 0,9 mm) pour une carte en pochette · 55 pt et 130 pt pour les cartes épaisses" },
    { id:"onetouch", name:"One-touch magnétique", sub:"74 × 110 mm", dims:"Extérieur ≈ 74 × 110 mm · intérieur ≈ 68 × 95 mm · 35 pt carte nue ou en pochette, 55 pt foil épais ou perfect fit, 100 pt et plus pour les patchs" },
    { id:"slab", name:"Slab gradé", sub:"≈ 80 × 135 mm", dims:"PSA ≈ 80,5 × 136 × 6,25 mm · CGC ≈ 80 × 135 × 7,5 mm · BGS ≈ 83 × 131 × 8,5 mm (mesures relevées au pied à coulisse, variables selon les sources)" },
    { id:"binder", name:"Page de classeur", sub:"9 pochettes", dims:"9 pochettes (3 × 3) ≈ 360 cartes pour 20 pages · 12 pochettes (4 × 3) ≈ 480 · chargement latéral conseillé pour les cartes de valeur" },
  ];
  const PACK_OPTS = [
    { id:"booster", name:"Booster", sub:"sachet 67 × 117 mm" },
    { id:"display", name:"Display", sub:"boîte de boosters" },
    { id:"etb", name:"Coffret", sub:"type coffret dresseur" },
    { id:"deckbox", name:"Deck box", sub:"60 à 100 cartes" },
    { id:"shelf", name:"Vitrine", sub:"booster + display" },
  ];

  const SOURCES = [
    ["Trading card sizes (makesnapshots)", "https://www.makesnapshots.com/trading-card-sizes"],
    ["Are all TCG cards the same size? (Card Fit Lab)", "https://cardfitlab.com/guides/are-all-tcg-cards-the-same-size"],
    ["Japanese vs standard sizes (Vault X)", "https://blog.vaultx.com/2026/10/27/japanese-size-vs-standard-size-trading-cards-whats-the-difference/"],
    ["MTG card size guide (MakeProxyCard)", "https://makeproxycard.com/mtg-card-size-guide/"],
    ["Every Magic foil treatment explained (Misprint)", "https://www.misprint.com/posts/magic-foil-treatments-explained"],
    ["Special foils explained (TopDeck Cards)", "https://topdeckcards.ca/guides/special-foils-explained/"],
    ["All foil types in Magic (Tap and Sac)", "https://tapandsac.com/2022/08/all-foil-types-and-variants-in-magic-mtg"],
    ["Yu-Gi-Oh card rarities explained (Misprint)", "https://www.misprint.com/posts/yugioh-card-rarities-explained"],
    ["Yu-Gi-Oh rarities (Wargamer)", "https://www.wargamer.com/yugioh-trading-card-game/yugioh-card-rarities"],
    ["Pokémon rarity symbols (CGC)", "https://www.cgccards.com/news/article/12438/pokemon-rarity-symbols/"],
    ["Rarity (TCG) · Bulbapedia", "https://bulbapedia.bulbagarden.net/wiki/Rarity_(TCG)"],
    ["Guide to holo foil types (pokemonaaah)", "https://www.pokemonaaah.net/?p=5217"],
    ["One Piece TCG rarity system (TCGplayer)", "https://www.tcgplayer.com/content/article/The-One-Piece-TCG-Rarity-System-Explained/03a91348-97ba-47df-bf6b-d46352616f98/"],
    ["One Piece rarities C to Treasure Rare (bountytcg)", "https://www.bountytcg.app/en/blog/one-piece-tcg-rarities-explained"],
    ["Flesh and Blood rainbow vs cold foil", "https://gameandtechfocus.com/fab-tcg-rainbow-foil-vs-cold-foil-how-do-you-tell-the-difference/"],
    ["Star Wars Unlimited card variants (TCGplayer)", "https://www.tcgplayer.com/content/article/Every-Star-Wars-Unlimited-Card-Variant-Explained/3c87b044-6e30-4b6d-b39b-d4f1897cbeea/"],
    ["Booster pack (TCG) · Bulbapedia", "https://bulbapedia.bulbagarden.net/wiki/Booster_pack_(TCG)"],
    ["Packs per box MTG (Draftsim)", "https://draftsim.com/packs-per-box-mtg/"],
    ["How many packs in a booster box (tcgpax)", "https://tcgpax.com/guides/how-many-packs-in-a-booster-box"],
    ["Digimon booster boxes (Bandai)", "https://world.digimoncard.com/products/pack"],
    ["Booster pack dimensions (Dexerto)", "https://www.dexerto.com/pokemon/pokemon-tcg-packs-explained-amount-whats-inside-more-2443701/"],
    ["Booster box and ETB dimensions (Wetop)", "https://wetopacrylic.com/guide/etb-booster-box-dimensions/"],
    ["Sleeve size guide (Cardshellz)", "https://www.cardshellz.com/blogs/the-bunker/sleeve-size-guide"],
    ["Magnetic holders sizing in points (Safely Sleeved)", "https://safelysleeved.com/card-holders/magnetic"],
    ["PSA slab dimensions measured (Card Capsule)", "https://cardcapsule.com/blogs/blog/psa-slab-dimensions"],
    ["PSA & BGS slab dimensions (Card Guard)", "https://thecardguard.com.au/blogs/guides/psa-bgs-slab-dimensions"],
    ["Binder guide 9 vs 12 pockets (Binder Templates)", "https://bindertemplates.com/en/guias/binder-pockets"],
    ["Playing card dimensions tarot, mini (Qin Printing)", "https://www.qinprinting.com/blog/card-deck-sizes-explained/"],
    ["Holographic card effect in CSS (poke-holo, simeydotme)", "https://github.com/simeydotme/pokemon-cards-css"],
  ];

  /* ================= Effects catalogue ================= */
  const P = { NONE:0, STRIPES:1, HEX:2, SHARDS:3, RINGS:4, WAVES:5, GEO:6, CROSS:7, NEBULA:8, GRAIN:9, HEXLINES:10, BRUSHED:11, HOLO:12, ETCH_LINES:13, ETCH_CROSS:14, SUNBURST:15, GUILLOCHE:16, SCALES:17, DIAG:18, PRISM:19, STARLIGHT:20, CONFETTI:21, MANGA:22, CRACKED:23, SURGE:24, LEATHER:25, CANVAS:26, HAMMERED:27, CARBON:28, LINEN:29, KNURL:30, PLATE:31, CIRCUIT:32, DOTS:33, MARBLE:34, WOOD:35, FLOW:36, LENTICULAR:37, RIPPLE:38, SNAKE:39, HALO:40, STEP:41, DOTGRID:42 };
  const PATTERN_LABELS = { NONE:"Aucun", STRIPES:"Bandes", HEX:"Sequins hexagonaux", SHARDS:"Éclats (shattered)", RINGS:"Anneaux", WAVES:"Vagues", GEO:"Losanges", CROSS:"Croisillons", NEBULA:"Nébuleuse", GRAIN:"Grain", HEXLINES:"Nid d'abeille", BRUSHED:"Brossé", HOLO:"Holo vertical + scanlines", ETCH_LINES:"Gravure lignes ondulées", ETCH_CROSS:"Gravure hachures", SUNBURST:"Rayons", GUILLOCHE:"Guilloché", SCALES:"Écailles", DIAG:"Lignes fines droites", PRISM:"Prismatique (moiré)", STARLIGHT:"Micro-stries (starlight)", CONFETTI:"Confettis", MANGA:"Trame manga", CRACKED:"Cracked ice", SURGE:"Ondes (surge)", LEATHER:"Cuir / craquelé", CANVAS:"Toile tissée", HAMMERED:"Martelé", CARBON:"Carbone (sergé)", LINEN:"Lin", KNURL:"Moleté", PLATE:"Tôle larmée", CIRCUIT:"Circuit imprimé", DOTS:"Points en relief", MARBLE:"Marbre veiné", WOOD:"Bois", FLOW:"Film d'huile (flux)", LENTICULAR:"Lenticulaire", RIPPLE:"Ondulations d'eau", SNAKE:"Peau de serpent", HALO:"Halo (arcs)", STEP:"Marches (step)", DOTGRID:"Grille de points" };
  const PALETTES = ["Arc-en-ciel", "Film d'huile", "Pastel", "Or et argent", "Aurore boréale", "Feu", "Glace", "Nacre", "Émeraude et or", "Teinte unie (teinte métal)", "Rubis", "Saphir", "Émeraude", "Améthyste"];
  const B = { SCREEN:0, METAL:2, COLORIZE:3, NONE:6, VEIL:7 };
  const TINTS = { silver:[0.9,0.93,1.0], gold:[1.0,0.76,0.32], rose:[1.0,0.72,0.68], copper:[0.95,0.55,0.35], black:[0.35,0.36,0.42], bronze:[0.8,0.55,0.3], platinum:[0.86,0.88,0.9], red:[1.0,0.22,0.2], blue:[0.25,0.5,1.0], green:[0.2,0.85,0.5], purple:[0.6,0.35,1.0], teal:[0.15,0.85,0.85], pink:[1.0,0.45,0.75], white:[1.0,1.0,1.0] };
  const TINT_LABELS = { silver:"Argent", gold:"Or", rose:"Rose gold", copper:"Cuivre", black:"Métal noir", bronze:"Bronze", platinum:"Platine", red:"Rouge", blue:"Bleu", green:"Vert", purple:"Violet", teal:"Cyan", pink:"Rose", white:"Blanc" };
  const ACCENTS = [
    { type:0, label:"Dorure", css:"#e8b44a", tint:"gold" }, { type:1, label:"Argent", css:"#d9dde6", tint:"silver" }, { type:2, label:"Cuivre", css:"#c8793f", tint:"copper" },
    { type:3, label:"Rose gold", css:"#e8a79a", tint:"rose" }, { type:4, label:"Métal noir", css:"#3a3c46", tint:"black" },
    { type:9, label:"Rouge brillant", css:"#ff3b3b", tint:"red" }, { type:10, label:"Bleu brillant", css:"#3b78ff", tint:"blue" }, { type:11, label:"Vert brillant", css:"#2fd36b", tint:"green" },
    { type:12, label:"Violet brillant", css:"#9b5cff", tint:"purple" }, { type:13, label:"Cyan brillant", css:"#2fd9d9", tint:"teal" }, { type:14, label:"Rose brillant", css:"#ff6bb5", tint:"pink" }, { type:15, label:"Nacre blanche", css:"#f4f1ff", tint:"white" },
    { type:5, label:"Irisé", css:"linear-gradient(135deg,#ff7a59,#ffd84d,#4ef0a0,#4fc9ff,#b36bff)", tint:"gold" }, { type:6, label:"Vernis brillant", css:"radial-gradient(circle at 35% 30%,#fff,#9aa3b5 70%)", tint:"white" },
    { type:7, label:"Mat (retire)", css:"#5a5e6c", tint:"black" }, { type:8, label:"Néon", css:"#ff4dd2", tint:"pink" },
  ];

  const base = { pattern:P.NONE, scale:1, angle:0, bands:1, sparkle:0, specPow:16, foil:0.8, blend:B.SCREEN, tint:"silver", sat:1, glare:0.6, bump:1, relief:0.35, ink:1, mask:0, hue:0, palette:0,
    reliefSrc:0, imgRelief:1, blur:2, detail:0, cavity:0.3, depthSrc:0, depth:0, edgeFoil:0, flatOnly:0, maskInvert:0, maskThr:0.5, maskSoft:0.15, lightZ:0.6, warm:0,
    accent:0, accentType:0, accentMask:10, accentAmt:1, accentRelief:1, accentInvert:0, accentWithin:0, accentColor:"" };
  /* process: varnish | foil | holo | emboss | ink — the layer mask of every preset is the print mask of its process */
  const def = (cat, id, label, sub, note, o) => ({ cat, id, label, sub, note, ...base, ...o });
  const N = {
    varnish: "Vernis UV sélectif : zone en aplat ou en trame, traits ≥ 0,3 mm, réserve de 0,2 mm autour des textes fins. Le vernis 3D (sérigraphie épaisse 20 à 80 µm) demande des surfaces fermées.",
    foil: "Dorure à chaud : film métallisé pressé avec un cliché. Traits et contre-formes ≥ 0,3 mm, éviter les grands aplats sur papier texturé, 1 couleur de film par passage.",
    holo: "Film holographique : impression sur carton holographique ou film contrecollé ; les zones non holographiques reçoivent une sous-couche d'encre blanche. Motif choisi dans la gamme du fournisseur.",
    emboss: "Embossage / gaufrage : relief de 0,2 à 0,5 mm obtenu avec une forme et une contre-forme ; traits ≥ 0,5 mm. L'embossage peut être combiné à une dorure (gaufrage doré).",
    ink: "Encre spéciale : métallique (argent ou or Pantone), blanche de soutien sur support sombre ou transparent, fluo ou nacrée. Moins brillant qu'une dorure, mais sans contrainte de finesse.",
  };
  const PRESETS = [
    /* ---- vernis ---- */
    def("varnish", "v-gloss", "Vernis brillant sélectif", "spot UV", N.varnish, { blend:B.NONE, foil:0, relief:0, cavity:0, glare:1.3, specPow:28 }),
    def("varnish", "v-3d", "Vernis 3D en relief", "spot UV épais", N.varnish, { blend:B.NONE, foil:0, reliefSrc:3, imgRelief:2.2, blur:3, relief:1.0, cavity:0, glare:1.4, specPow:30, mask:9 }),
    def("varnish", "v-3d-image", "Vernis 3D sur l'image", "relief du dessin", N.varnish, { blend:B.NONE, foil:0, reliefSrc:1, imgRelief:1.6, blur:2.5, relief:0.9, cavity:0.3, glare:1.2, specPow:24 }),
    def("varnish", "v-texture-grain", "Vernis texturé sablé", "grain fin", N.varnish, { blend:B.NONE, foil:0, pattern:P.GRAIN, scale:120, bump:0.45, relief:0.9, cavity:0, glare:0.9, specPow:12 }),
    def("varnish", "v-texture-linen", "Vernis texturé lin", "toile", N.varnish, { blend:B.NONE, foil:0, pattern:P.LINEN, scale:120, bump:1.2, relief:0.9, cavity:0, glare:0.6, specPow:8 }),
    def("varnish", "v-texture-leather", "Vernis texturé cuir", "grain cuir", N.varnish, { blend:B.NONE, foil:0, pattern:P.LEATHER, scale:16, bump:1.2, relief:0.9, cavity:0, glare:0.6, specPow:8 }),
    def("varnish", "v-lines", "Vernis en lignes", "stries brillantes", N.varnish, { blend:B.NONE, foil:0, pattern:P.DIAG, scale:120, angle:-45, bump:1.4, relief:0.7, cavity:0, glare:1.0, specPow:16 }),
    def("varnish", "v-contours", "Vernis sur les contours", "traits brillants", N.varnish, { blend:B.NONE, foil:0, reliefSrc:2, imgRelief:1.4, blur:1, relief:0.8, cavity:0, glare:1.3, specPow:24, mask:10 }),
    /* ---- dorure à chaud ---- */
    def("foil", "f-gold", "Dorure or brillant", "film or", N.foil, { blend:B.METAL, tint:"gold", foil:1, sat:0.1, specPow:30, glare:0.7, pattern:P.GRAIN, scale:140, bump:0.015, relief:0.06, warm:0.3 }),
    def("foil", "f-gold-matte", "Dorure or mat", "film or satiné", N.foil, { blend:B.METAL, tint:"gold", foil:1, sat:0.05, specPow:8, glare:0.3, pattern:P.GRAIN, scale:140, bump:0.015, relief:0.06, warm:0.3 }),
    def("foil", "f-silver", "Dorure argent", "film argent", N.foil, { blend:B.METAL, tint:"silver", foil:1, sat:0.05, specPow:30, glare:0.7, pattern:P.GRAIN, scale:140, bump:0.015, relief:0.06 }),
    def("foil", "f-copper", "Dorure cuivre", "film cuivre", N.foil, { blend:B.METAL, tint:"copper", foil:1, sat:0.05, specPow:28, glare:0.6, pattern:P.GRAIN, scale:140, bump:0.015, relief:0.06, warm:0.4 }),
    def("foil", "f-rose", "Dorure rose gold", "film rose", N.foil, { blend:B.METAL, tint:"rose", foil:1, sat:0.05, specPow:28, glare:0.6, pattern:P.GRAIN, scale:140, bump:0.015, relief:0.06 }),
    def("foil", "f-black", "Dorure noire", "film noir brillant", N.foil, { blend:B.METAL, tint:"black", foil:1, sat:0.05, specPow:26, glare:0.9, pattern:P.GRAIN, scale:140, bump:0.015, relief:0.06 }),
    def("foil", "f-red", "Dorure rouge", "film rouge métallisé", N.foil, { blend:B.METAL, tint:"red", foil:1, sat:0.08, specPow:28, glare:0.6, pattern:P.GRAIN, scale:140, bump:0.015, relief:0.06 }),
    def("foil", "f-blue", "Dorure bleue", "film bleu métallisé", N.foil, { blend:B.METAL, tint:"blue", foil:1, sat:0.08, specPow:28, glare:0.6, pattern:P.GRAIN, scale:140, bump:0.015, relief:0.06 }),
    def("foil", "f-green", "Dorure verte", "film vert métallisé", N.foil, { blend:B.METAL, tint:"green", foil:1, sat:0.08, specPow:28, glare:0.6, pattern:P.GRAIN, scale:140, bump:0.015, relief:0.06 }),
    def("foil", "f-purple", "Dorure violette", "film violet métallisé", N.foil, { blend:B.METAL, tint:"purple", foil:1, sat:0.08, specPow:28, glare:0.6, pattern:P.GRAIN, scale:140, bump:0.015, relief:0.06 }),
    def("foil", "f-holo", "Dorure holographique", "film arc-en-ciel", N.foil, { blend:B.METAL, tint:"silver", foil:1, sat:1, bands:1.6, specPow:14, glare:0.6, pattern:P.STRIPES, scale:1.4, angle:28, bump:0.15, relief:0.05 }),
    def("foil", "f-holo-ice", "Dorure holo cracked ice", "film éclats", N.foil, { blend:B.METAL, tint:"silver", foil:1, sat:1, bands:1.4, specPow:14, glare:0.6, pattern:P.CRACKED, scale:5, bump:1.4, relief:0.3, sparkle:0.4 }),
    def("foil", "f-holo-dots", "Dorure holo sequins", "film à points", N.foil, { blend:B.METAL, tint:"silver", foil:1, sat:1, bands:1.2, specPow:14, glare:0.6, pattern:P.HEX, scale:52, bump:1.4, relief:0.2, sparkle:0.4 }),
    def("foil", "f-holo-glitter", "Dorure holo glitter", "film pailleté", N.foil, { blend:B.METAL, tint:"silver", foil:1, sat:0.9, bands:1.2, specPow:16, glare:0.6, pattern:P.GRAIN, scale:110, bump:0.25, relief:0.08, sparkle:0.6 }),
    def("foil", "f-emboss-gold", "Gaufrage doré", "dorure + relief", N.foil, { blend:B.METAL, tint:"gold", foil:1, sat:0.1, specPow:24, glare:0.7, reliefSrc:1, imgRelief:1.8, blur:2.5, relief:1.0, cavity:0.4, warm:0.3 }),
    /* ---- film holographique ---- */
    def("holo", "h-rainbow", "Holo arc-en-ciel", "film uni", N.holo, { pattern:P.STRIPES, scale:1.4, angle:28, bands:1.6, bump:0.15, relief:0.05, sparkle:0.08, specPow:5, foil:0.7, sat:0.9, ink:0.85, glare:0.45 }),
    def("holo", "h-lines", "Holo lignes (pillars)", "film à colonnes", N.holo, { pattern:P.LENTICULAR, scale:90, bands:1.4, bump:1.4, relief:0.5, specPow:10, foil:0.85, sat:0.9, glare:0.55 }),
    def("holo", "h-dots", "Holo points (sequins)", "film à points", N.holo, { pattern:P.HEX, scale:52, bands:1.2, bump:1.6, relief:0.2, sparkle:0.5, specPow:14, foil:1, glare:0.6 }),
    def("holo", "h-ice", "Holo cracked ice", "film éclats", N.holo, { pattern:P.CRACKED, scale:5, bands:1.5, bump:1.6, relief:0.4, sparkle:0.5, specPow:14, foil:1, glare:0.6 }),
    def("holo", "h-glitter", "Holo glitter / sable", "film pailleté", N.holo, { pattern:P.GRAIN, scale:110, bands:1.4, bump:0.25, relief:0.08, sparkle:0.6, specPow:10, foil:1, glare:0.5 }),
    def("holo", "h-stars", "Holo étoiles / confettis", "film à confettis", N.holo, { pattern:P.CONFETTI, scale:40, bands:1.6, bump:1.8, relief:0.3, sparkle:0.6, specPow:14, foil:1, glare:0.55 }),
    def("holo", "h-diamond", "Holo losanges", "film à losanges", N.holo, { pattern:P.GEO, scale:15, bands:1.4, bump:0.6, relief:0.4, specPow:12, foil:0.85, glare:0.55 }),
    def("holo", "h-lens", "Holo lentilles", "film à cercles", N.holo, { pattern:P.RINGS, scale:3, bands:1.8, bump:0.7, relief:0.4, sparkle:0.15, specPow:10, foil:0.85, ink:0.9, glare:0.55 }),
    def("holo", "h-crystal", "Holo cristal", "film à facettes", N.holo, { pattern:P.SHARDS, scale:11, bands:1.6, bump:1.8, relief:0.3, sparkle:0.5, specPow:22, foil:1, glare:0.6 }),
    def("holo", "h-cosmic", "Holo cosmos", "film nébuleuse", N.holo, { pattern:P.NEBULA, scale:2.6, bands:1.8, bump:0.9, relief:0.2, sparkle:0.5, specPow:8, foil:1, ink:0.9, glare:0.5 }),
    def("holo", "h-prism", "Holo prisme (grille)", "film prismatique", N.holo, { pattern:P.PRISM, scale:120, angle:-40, bands:1.4, bump:1.4, relief:0.6, sparkle:0.4, specPow:9, foil:0.9, glare:0.5 }),
    def("holo", "h-secret", "Holo diagonales fines", "type secret rare", N.holo, { pattern:P.DIAG, scale:150, angle:-45, bands:1.0, bump:1.3, relief:0.6, sparkle:0.35, specPow:10, foil:0.85, sat:0.9, glare:0.5 }),
    def("holo", "h-etched", "Holo gravé lignes", "textured foil", N.holo, { reliefSrc:5, pattern:P.ETCH_LINES, scale:110, angle:12, bump:1.4, imgRelief:0.6, blur:3, relief:0.8, flatOnly:1, foil:0.7, sat:0.55, bands:0.6, specPow:12, glare:0.6 }),
    def("holo", "h-etched-cross", "Holo gravé hachures", "textured foil", N.holo, { reliefSrc:5, pattern:P.ETCH_CROSS, scale:80, angle:45, bump:1.5, imgRelief:0.6, blur:3, relief:0.9, flatOnly:1, foil:0.8, sat:0.6, specPow:12, glare:0.6 }),
    def("holo", "h-starlight", "Holo micro-stries", "type starlight", N.holo, { pattern:P.STARLIGHT, scale:120, bands:1.2, bump:1.8, relief:0.5, sparkle:0.6, specPow:12, foil:1, sat:0.9, glare:0.55 }),
    def("holo", "h-oil", "Holo film d'huile", "film irisé diffus", N.holo, { pattern:P.FLOW, scale:2.2, bands:2.0, bump:0.7, palette:1, specPow:6, foil:0.85, sat:1, glare:0.5 }),
    def("holo", "h-silver", "Carton métallisé argent", "métallisé sous impression", N.holo, { ink:0.3, pattern:P.GRAIN, scale:140, bump:0.03, relief:0.08, specPow:36, blend:B.METAL, tint:"silver", foil:0.55, sat:0.05, glare:0.6 }),
    def("holo", "h-goldboard", "Carton métallisé or", "métallisé sous impression", N.holo, { ink:0.3, pattern:P.GRAIN, scale:140, bump:0.03, relief:0.08, specPow:36, blend:B.METAL, tint:"gold", foil:0.55, sat:0.1, glare:0.6, warm:0.3 }),
    /* ---- embossage ---- */
    def("emboss", "e-image", "Embossage de l'image", "relief positif", N.emboss, { blend:B.NONE, foil:0, reliefSrc:1, imgRelief:1.8, blur:2.5, relief:1.0, cavity:0.5, glare:0.5, specPow:12 }),
    def("emboss", "e-deboss", "Débossage de l'image", "relief en creux", N.emboss, { blend:B.NONE, foil:0, reliefSrc:1, imgRelief:-1.8, blur:2.5, relief:1.0, cavity:0.5, glare:0.5, specPow:12 }),
    def("emboss", "e-contours", "Contours gravés", "microgravure des traits", N.emboss, { blend:B.NONE, foil:0, reliefSrc:2, imgRelief:2.2, blur:1, relief:1.1, cavity:0.2, glare:0.6, specPow:14 }),
    def("emboss", "e-lines", "Gaufrage lignes", "stries en relief", N.emboss, { blend:B.NONE, foil:0, pattern:P.ETCH_LINES, scale:110, angle:12, bump:1.6, relief:0.9, cavity:0, glare:0.6, specPow:12, flatOnly:1 }),
    def("emboss", "e-cross", "Gaufrage hachures", "hachures en relief", N.emboss, { blend:B.NONE, foil:0, pattern:P.ETCH_CROSS, scale:80, angle:45, bump:1.5, relief:0.9, cavity:0, glare:0.6, specPow:12, flatOnly:1 }),
    def("emboss", "e-canvas", "Gaufrage toile", "trame toile", N.emboss, { blend:B.NONE, foil:0, pattern:P.CANVAS, scale:140, bump:0.9, relief:1.0, cavity:0.2, glare:0.5, specPow:10 }),
    def("emboss", "e-hammered", "Gaufrage martelé", "", N.emboss, { blend:B.NONE, foil:0, pattern:P.HAMMERED, scale:12, bump:1.6, relief:0.9, cavity:0.3, glare:0.6, specPow:14 }),
    def("emboss", "e-knurl", "Gaufrage moleté", "", N.emboss, { blend:B.NONE, foil:0, pattern:P.KNURL, scale:60, bump:1.3, relief:0.8, cavity:0, glare:0.6, specPow:16 }),
    def("emboss", "e-dots", "Gaufrage points", "", N.emboss, { blend:B.NONE, foil:0, pattern:P.DOTS, scale:40, bump:1.5, relief:0.9, cavity:0, glare:0.6, specPow:14 }),
    def("emboss", "e-bevel", "Embossage multi-niveaux", "biseau sur la zone", N.emboss, { blend:B.NONE, foil:0, reliefSrc:3, imgRelief:2.2, blur:3, relief:1.0, cavity:0, glare:0.6, specPow:20, mask:9 }),
    /* ---- encres ---- */
    def("ink", "i-silver", "Encre métallique argent", "Pantone 877", N.ink, { ink:0.3, blend:B.METAL, tint:"silver", foil:0.55, sat:0.05, specPow:8, glare:0.35, pattern:P.GRAIN, scale:140, bump:0.03, relief:0.08 }),
    def("ink", "i-gold", "Encre métallique or", "Pantone 871", N.ink, { ink:0.3, blend:B.METAL, tint:"gold", foil:0.55, sat:0.05, specPow:8, glare:0.35, pattern:P.GRAIN, scale:140, bump:0.03, relief:0.08, warm:0.3 }),
    def("ink", "i-copper", "Encre métallique cuivre", "Pantone 876", N.ink, { ink:0.3, blend:B.METAL, tint:"copper", foil:0.55, sat:0.05, specPow:8, glare:0.35, pattern:P.GRAIN, scale:140, bump:0.03, relief:0.08, warm:0.3 }),
    def("ink", "i-pearl", "Encre nacrée", "interférentielle", N.ink, { blend:B.VEIL, palette:7, foil:1, bands:0.8, specPow:10, glare:0.6, reliefSrc:1, imgRelief:0.6, blur:3, relief:0.3, ink:0.6 }),
    def("ink", "i-white", "Encre blanche", "soutien sur support sombre", N.ink, { blend:B.NONE, foil:0, relief:0, cavity:0, glare:0.4, accent:1, accentType:15, accentMask:5, accentAmt:0.9, accentRelief:0.3 }),
    def("ink", "i-neon-pink", "Encre fluo rose", "Pantone 806", N.ink, { blend:B.NONE, foil:0, relief:0, cavity:0, glare:0.4, accent:1, accentType:8, accentMask:10, accentAmt:1, accentRelief:0.3, accentColor:"#ff2d95", maskThr:0.4 }),
    def("ink", "i-neon-green", "Encre fluo verte", "Pantone 802", N.ink, { blend:B.NONE, foil:0, relief:0, cavity:0, glare:0.4, accent:1, accentType:8, accentMask:10, accentAmt:1, accentRelief:0.3, accentColor:"#39ff14", maskThr:0.4 }),
    def("ink", "i-neon-orange", "Encre fluo orange", "Pantone 811", N.ink, { blend:B.NONE, foil:0, relief:0, cavity:0, glare:0.4, accent:1, accentType:8, accentMask:10, accentAmt:1, accentRelief:0.3, accentColor:"#ff7a00", maskThr:0.4 }),
    def("ink", "i-none", "Impression seule", "sans finition", "Quadri CMJN sur carton black core 300 g, vernis machine.", { blend:B.NONE, foil:0, relief:0, cavity:0, glare:0, pattern:P.NONE }),
  ];
  const CATS = [["foil","Dorure à chaud"],["holo","Film holographique"],["varnish","Vernis sélectif"],["emboss","Embossage"],["ink","Encres spéciales"]];
  const CAT_LABEL = Object.fromEntries(CATS);
  const PRESET_BY_ID = Object.fromEntries(PRESETS.map(p => [p.id, p]));
  const ACCENT_PROCESS = t => (t === 6 ? "varnish" : t === 7 ? "none" : (t === 5 || t === 8 || t === 15) ? "ink" : "foil");
  const FINISH_GLOSSARY = [
    { game:"Pokémon", items:[["Reverse holo","Film holographique sur toute la carte sauf l'illustration.","h-rainbow"],["Cosmos holo","Film holographique nébuleuse dans la fenêtre d'illustration.","h-cosmic"],["Texture foil (illustration rare, hyper rare)","Film holographique gravé de lignes, relief tactile.","h-etched"],["Hyper rare or","Carton métallisé or sous impression.","h-goldboard"]] },
    { game:"Magic: The Gathering", items:[["Traditional foil","Film holographique arc-en-ciel sur toute la face.","h-rainbow"],["Etched foil","Encre métallique argent mate avec paillettes.","i-silver"],["Textured foil","Film holographique gravé en relief.","h-etched-cross"],["Surge / halo / ripple","Films holographiques à motifs dirigés.","h-lines"],["Galaxy / confetti","Films holographiques à étoiles ou confettis.","h-stars"],["Gilded","Dorure à chaud en relief sur le cadre.","f-emboss-gold"]] },
    { game:"Yu-Gi-Oh!", items:[["Super, ultra rare","Holo sur l'illustration, nom en dorure or.","f-gold"],["Secret rare","Film holographique à diagonales fines.","h-secret"],["Prismatic secret","Film holographique prismatique en grille.","h-prism"],["Ultimate rare","Embossage de l'illustration et des détails.","e-image"],["Ghost rare","Encre métallique argent pâle.","i-silver"],["Starlight, collector's","Film holographique micro-strié ou gravé sur toute la carte.","h-starlight"]] },
    { game:"One Piece, Lorcana, Flesh and Blood, Star Wars Unlimited", items:[["Parallel / alt art","Film holographique arc-en-ciel sur toute la carte.","h-rainbow"],["Manga rare, SP, treasure rare","Films holographiques gravés, parfois avec dorure des contours.","h-etched"],["Enchanted","Film holographique lentilles et ondulations.","h-lens"],["Cold foil","Dorure argent sur le cadre ou l'illustration.","f-silver"],["Hyperspace, showcase","Film holographique et cadre doré.","f-gold"]] },
  ];
  const BACK_STYLES = [["geo","Géométrique"],["cosmos","Cosmos"],["classic","Classique"],["minimal","Minimal"],["waves","Vagues"],["hex","Hexagones"],["sun","Soleil"],["shield","Blason"]];
  const FRAME_STYLES = { thin:"Bordure fine", classic:"Classique", fullart:"Full art", ornate:"Ornemental", double:"Double filet", window:"Fenêtre" };

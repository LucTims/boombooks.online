/**
 * Contenu de la page d'accueil « entreprise » (boombooks.shop/).
 *
 * Tout ce qui est susceptible de changer (liens Chariow, prix, chiffres,
 * quiz PGGI, FAQ, témoignages) est centralisé ici : aucune modification du
 * composant n'est nécessaire pour mettre à jour la page.
 */
import { WHATSAPP_NUMBER } from './whatsapp';

/* ── Liens Chariow ─────────────────────────────────────────────────────────
 * Tant qu'un lien est vide, le bouton renvoie vers WhatsApp avec un message
 * pré-rempli : aucun bouton n'est jamais « cassé ».
 */
export const CHARIOW_LINKS = {
    guideBrvm: '',        // Le Guide complet pour investir à la BRVM
    formationBrvm: '',    // Investir à la BRVM : de zéro à votre premier ordre
    argentTravaille: '',  // L'Argent qui travaille
    liberteFinanciere: '', // En route vers la liberté financière
    cabinet: '',          // Le Cabinet BoomBooks (ouverture de compte-titres)
};

export function whatsappLink(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_COMMUNITY_URL = whatsappLink(
    'Bonjour BoomBooks, je souhaite rejoindre la communauté et en savoir plus sur la Méthode PGGI.'
);

export const WHATSAPP_DISPLAY = '+237 674 246 355';

/* ── Hero (style Acquisition.com avec texte Diagnostic PGGI) ────────────── */
export const HERO_CONTENT = {
    title: 'L’Afrique s’enrichit. Et vous, à quelle étape êtes-vous ?',
    subtitle: 'Répondez à 7 questions et découvrez votre étape dans la Méthode PGGI, avec le premier pas à faire dès aujourd’hui.',
    ctaLabel: 'Faire mon test gratuit',
    rotatorWords: ['penser.', 'gagner.', 'gérer.', 'investir.'],
};

export function prefersReducedMotion() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ── Test gratuit en 7 questions (Diagnostic Méthode PGGI) ──────────────── */
export const PGGI_QUIZ_QUESTIONS = [
    {
        q: '1. Aujourd’hui, quelle phrase décrit le mieux votre rapport à l’argent ?',
        options: [
            { label: 'J’ai du mal à garder une discipline financière et je veux changer de mentalité', stage: 1 },
            { label: 'Je suis motivé(e), mais mes revenus actuels sont trop limités', stage: 2 },
            { label: 'Je gagne de l’argent, mais il file sans que je sache exactement où', stage: 3 },
            { label: 'J’épargne déjà régulièrement et je veux faire fructifier mon argent', stage: 4 },
        ],
    },
    {
        q: '2. À quelle fréquence lisez-vous ou vous formez-vous sur les finances et le business ?',
        options: [
            { label: 'Rarement, je ne sais pas quels livres choisir', stage: 1 },
            { label: 'Je cherche surtout des compétences pratiques pour gagner plus', stage: 2 },
            { label: 'Je lis parfois, mais j’ai besoin d’une méthode pour gérer mon budget', stage: 3 },
            { label: 'Je me documente déjà sur l’investissement et la Bourse (BRVM)', stage: 4 },
        ],
    },
    {
        q: '3. Quelle est votre situation concernant vos revenus mensuels ?',
        options: [
            { label: 'Je cherche encore ma voie et ma vision à long terme', stage: 1 },
            { label: 'Je veux développer une compétence rentable (vente, business, digital)', stage: 2 },
            { label: 'J’ai un revenu régulier mais je n’arrive pas à mettre de côté chaque mois', stage: 3 },
            { label: 'J’ai un revenu stable et une capacité d’épargne mensuelle', stage: 4 },
        ],
    },
    {
        q: '4. Suivez-vous un budget précis chaque mois ?',
        options: [
            { label: 'Non, je dépense au jour le jour sans plan précis', stage: 1 },
            { label: 'Pas vraiment, ma priorité est d’abord d’augmenter mes entrées d’argent', stage: 2 },
            { label: 'J’essaie, mais j’ai besoin d’un système simple qui fonctionne vraiment', stage: 3 },
            { label: 'Oui, mon budget est maîtrisé et je mets de l’argent de côté', stage: 4 },
        ],
    },
    {
        q: '5. Avez-vous déjà une épargne de sécurité mise de côté ?',
        options: [
            { label: 'Pas encore, je repars souvent de zéro', stage: 1 },
            { label: 'Très peu, mes revenus ne me le permettent pas encore', stage: 2 },
            { label: 'Je commence tout juste à constituer mon épargne', stage: 3 },
            { label: 'Oui, j’ai une épargne prête à être investie intelligemment', stage: 4 },
        ],
    },
    {
        q: '6. Que savez-vous de la Bourse Régionale (BRVM) ?',
        options: [
            { label: 'C’est encore flou, je préfère d’abord bâtir mes bases', stage: 1 },
            { label: 'Ça m’intéresse, mais je dois d’abord générer plus de cash', stage: 2 },
            { label: 'Je veux d’abord apprendre à structurer mes finances avant d’investir', stage: 3 },
            { label: 'Je veux comprendre comment ouvrir mon compte-titres et acheter mes premières actions', stage: 4 },
        ],
    },
    {
        q: '7. Quel est votre objectif numéro 1 pour les 30 prochains jours ?',
        options: [
            { label: 'Nourrir mon esprit avec les meilleurs livres de développement et finance', stage: 1 },
            { label: 'Suivre une formation concrète pour augmenter mes revenus', stage: 2 },
            { label: 'Reprendre le contrôle total de mon budget et de mon épargne', stage: 3 },
            { label: 'Passer à l’action à la BRVM (Guide, Formation ou ouverture de compte avec Le Cabinet)', stage: 4 },
        ],
    },
];

export const PGGI_QUIZ_RESULTS = {
    1: {
        num: 'Étape 01 · PENSER',
        title: 'Votre priorité : Bâtir un état d’esprit financier solide',
        desc: 'Tout commence dans la tête. Votre premier pas dès aujourd’hui est de nourrir votre esprit avec les livres fondamentaux sur l’argent, la discipline et la vision long terme.',
        primaryCta: { label: 'Explorer la Bibliothèque (+1 000 livres) →', to: '/livres' },
        secondaryCta: { label: 'Voir les formules d’abonnement (dès 1 500 FCFA)', to: '/abonnement' },
    },
    2: {
        num: 'Étape 02 · GAGNER',
        title: 'Votre priorité : Développer vos compétences et vos revenus',
        desc: 'Pour épargner et investir avec puissance, vous devez d’abord élargir votre capacité à gagner. Votre premier pas : vous former aux compétences les plus rentables.',
        primaryCta: { label: 'Découvrir nos Formations →', to: '/formations' },
        secondaryCta: { label: 'Explorer la Bibliothèque business', to: '/livres' },
    },
    3: {
        num: 'Étape 03 · GÉRER',
        title: 'Votre priorité : Structurer votre budget et faire travailler chaque franc',
        desc: 'Vous avez déjà une base, mais votre argent doit être dirigé avec une règle claire. Votre premier pas dès aujourd’hui : maîtriser votre gestion avec « L’Argent qui travaille ».',
        primaryCta: { label: 'Découvrir « L’Argent qui travaille » →', href: '#produits' },
        secondaryCta: { label: 'Parler à un conseiller sur WhatsApp', whatsapp: "Bonjour BoomBooks, j'ai fait le test PGGI (Étape 03 - Gérer) et je souhaite obtenir L'Argent qui travaille." },
    },
    4: {
        num: 'Étape 04 · INVESTIR',
        title: 'Votre priorité : Passer à l’action sur la BRVM',
        desc: 'Vous êtes prêt(e) à faire travailler votre argent en Bourse ! Votre premier pas dès aujourd’hui : maîtriser la BRVM avec notre Guide complet, notre Formation vidéo ou ouvrir votre compte-titres avec Le Cabinet.',
        primaryCta: { label: 'Voir le Guide & la Formation BRVM →', href: '#produits' },
        secondaryCta: { label: 'Ouvrir mon compte-titres avec Le Cabinet', href: '#cabinet' },
    },
};

/* ── Chiffres clés (barre de 4 indicateurs sous le Hero) ────────────────── */
export const HERO_STATS_BAR = [
    { value: '10 000+', label: 'Guides BRVM vendus' },
    { value: '1 000+', label: 'Livres numériques' },
    { value: '6', label: 'Pays africains' },
    { value: '50 000+', label: 'Personnes nous suivent' },
];

/* ── Ce qui vous attend (bandeau sous le hero) ──────────────────────────── */
export const PROMISE = {
    kicker: 'Ce qui vous attend',
    sub: 'Des livres, des formations et un accompagnement pensés pour l’Afrique, du premier livre lu à votre premier ordre en Bourse.',
};

/* ── Méthode PGGI (Carrousel 4 étapes inspiré Ramsey Stories) ────────────── */
export const PGGI_SECTION_HEADER = {
    eyebrow: 'Notre méthode exclusive',
    title: "C'est quoi la méthode PGGI ?",
    subtitle: '4 étapes pour atteindre la prospérité financière.',
    ctaPrompt: 'Envie de savoir à quelle étape vous vous situez aujourd’hui ?',
    ctaLabel: 'Faire mon test gratuit en 7 questions',
};

export const PGGI_STEPS = [
    {
        num: '01',
        tag: '01 · PENSER',
        name: 'PENSER',
        image: '/images/pggi/pggi-01-penser.jpg',
        imageAlt: 'Étape 1 Penser - Mindset financier et lecture quotidienne BoomBooks',
        quote: "Lire chaque jour a brisé la peur du manque et m'a enfin donné la discipline d'un bâtisseur.",
        line: 'Changer d’état d’esprit.',
        desc: 'Tout commence dans la tête. Des livres choisis pour changer votre rapport à l’argent et bâtir la discipline.',
        icon: 'psychology',
        color: '#0077C8',
        link: { label: 'La bibliothèque', to: '/livres' },
    },
    {
        num: '02',
        tag: '02 · GAGNER',
        name: 'GAGNER',
        image: '/images/pggi/pggi-02-gagner.jpg',
        imageAlt: 'Étape 2 Gagner - Compétences rentables et augmentation des revenus',
        quote: "On ne peut pas investir sans revenus réguliers. Développer des compétences pratiques a débloqué mon cash-flow.",
        line: 'Augmenter ses revenus.',
        desc: 'On n’épargne pas ce qu’on ne gagne pas. Développez des compétences rentables pour augmenter vos revenus.',
        icon: 'trending_up',
        color: '#0077C8',
        link: { label: 'Les formations', to: '/formations' },
    },
    {
        num: '03',
        tag: '03 · GÉRER',
        name: 'GÉRER',
        image: '/images/pggi/pggi-03-gerer.jpg',
        imageAlt: "Étape 3 Gérer - Budget maîtrisé et épargne de sécurité",
        quote: "Avant, tout s'évaporait. Avec un budget structuré, nous avons enfin sécurisé notre épargne et notre paix d'esprit.",
        line: 'Maîtriser son budget.',
        desc: 'Un budget simple et une épargne automatique : chaque franc reçoit enfin une mission.',
        icon: 'savings',
        color: '#0077C8',
        link: { label: "L'Argent qui travaille", href: '#produits' },
    },
    {
        num: '04',
        tag: '04 · INVESTIR',
        name: 'INVESTIR',
        image: '/images/pggi/pggi-04-investir.jpg',
        imageAlt: 'Étape 4 Investir - Bourse BRVM et dividendes réguliers',
        quote: "Acheter mes premières actions à la BRVM et recevoir mes premiers dividendes a changé ma vision de l'avenir.",
        line: 'Faire travailler son argent.',
        desc: 'Achetez vos premières actions à la BRVM, touchez des dividendes, accompagné jusqu’à votre premier ordre.',
        icon: 'show_chart',
        color: '#0077C8',
        link: { label: 'Guide, formation & Cabinet BRVM', href: '#produits' },
        featured: true,
    },
];

/* ── Produits phares + Le Cabinet (grille vitrine) ──────────────────────── */
export const PRODUCTS = [
    {
        id: 'guideBrvm',
        badge: 'Best-Seller',
        badgeColor: 'red',
        tag: 'Ebook · Étape 04 Investir',
        title: 'Le Guide complet BRVM',
        subtitle: 'Le Guide complet pour investir à la BRVM',
        text: 'Comprendre la Bourse régionale, choisir sa SGI, analyser une action et bâtir une stratégie de long terme.',
        price: 655,
        priceNote: 'Accès immédiat',
        cta: 'Obtenir le guide',
        visual: 'book-blue',
        image: '/images/landing/cover-guide-brvm.webp',
        coverTop: 'PLUS DE 10 000 LECTEURS EN AFRIQUE',
        coverLines: ['GUIDE', 'COMPLET', 'BRVM'],
        coverSub: 'INVESTIR EN BOURSE PAS À PAS',
    },
    {
        id: 'formationBrvm',
        badge: 'Formation Vidéo',
        badgeColor: 'blue',
        tag: 'Vidéo · Étape 04 Investir',
        title: 'Formation Investir à la BRVM',
        subtitle: 'Investir à la BRVM : de zéro à votre premier ordre',
        text: "Une formation vidéo pas à pas pour ouvrir votre compte, sélectionner vos premières actions et passer votre premier ordre en confiance.",
        price: 5000,
        priceNote: 'Accès à vie',
        cta: 'Voir la formation',
        visual: 'circle-video',
        image: '/images/landing/cover-formation-brvm.webp',
        coverTop: 'FORMATION COMPLÈTE PAS À PAS',
        coverLines: ['DE ZÉRO', 'AU 1ER ORDRE', 'BRVM'],
        coverSub: '100% PRATIQUE · SUR TÉLÉPHONE',
    },
    {
        id: 'argentTravaille',
        badge: 'Indispensable',
        badgeColor: 'red',
        tag: 'Livre · Étape 03 Gérer',
        title: "L'Argent qui travaille",
        subtitle: "L'Argent qui travaille pour vous",
        text: 'Reprendre le contrôle de vos finances : budget maîtrisé, épargne automatique et premiers placements intelligents.',
        price: null,
        priceNote: 'Format numérique',
        cta: 'Obtenir le livre',
        visual: 'circle-book',
        coverTop: 'MAÎTRISER SES FINANCES PERSONNELLES',
        coverLines: ["L'ARGENT", 'QUI', 'TRAVAILLE'],
        coverSub: 'BUDGET · ÉPARGNE · DISCIPLINE',
    },
];

/* ── Le Cabinet ─────────────────────────────────────────────────────────── */
export const CABINET = {
    badge: 'Accompagnement 1-à-1',
    eyebrow: 'Le Cabinet BoomBooks',
    title: 'Ouvrez votre compte-titres BRVM, accompagné pas à pas',
    text: "Un conseiller BoomBooks vous guide de A à Z : choix de la SGI agréée, constitution complète de votre dossier, premier dépôt et passage de votre premier ordre. Vous restez seul maître de votre argent.",
    price: 5000,
    priceNote: 'Accompagnement complet',
    cta: 'Être accompagné maintenant',
    points: [
        'Choix de la SGI adaptée à votre pays',
        'Constitution et vérification de votre dossier',
        'Suivi jusqu’à votre premier ordre en Bourse',
    ],
};

/* ── Bibliothèque : formules (identiques à /abonnement) ─────────────────── */
export const LIBRARY_PLANS = [
    {
        id: 'lecteur',
        badge: 'Essentiel',
        name: 'Formule Lecteur',
        price: 1500,
        text: 'Accès illimité à tout le catalogue de +1 000 livres en lecture en ligne.',
        features: ['+1 000 livres accessibles 24h/24', 'Lecture fluide sur téléphone & PC', 'Sans engagement'],
        cta: 'Choisir Lecteur',
    },
    {
        id: 'batisseur',
        badge: 'Le plus choisi',
        name: 'Formule Bâtisseur',
        price: 2500,
        text: 'Tout le catalogue + téléchargement hors-ligne dans notre application BoomRead.',
        features: ['Tout le plan Lecteur inclus', 'Lecture 100% hors-ligne (BoomRead)', 'Jusqu’à 5 livres hors-ligne simultanés'],
        cta: 'Choisir Bâtisseur',
        popular: true,
    },
    {
        id: 'discipline',
        badge: 'Complet + IA',
        name: 'Formule Discipliné',
        price: 5000,
        text: 'L’expérience intégrale : catalogue illimité, hors-ligne, Studio IA (Boomia) et support prioritaire.',
        features: ['Tout le plan Bâtisseur inclus', 'Accès illimité au Studio IA', 'Support WhatsApp prioritaire'],
        cta: 'Choisir Discipliné',
    },
];

/* ── Questions fréquentes ───────────────────────────────────────────────── */
export const LANDING_FAQS = [
    {
        q: "Qu'est-ce que la Méthode PGGI de BoomBooks ?",
        a: "La Méthode PGGI (Penser · Gagner · Gérer · Investir) est notre parcours en 4 étapes conçu pour l'Afrique francophone : d'abord transformer sa mentalité par la lecture (Penser), développer ses compétences pour augmenter ses revenus (Gagner), structurer son épargne (Gérer), puis investir concrètement à la Bourse Régionale des Valeurs Mobilières — BRVM (Investir).",
    },
    {
        q: 'Comment fonctionne l’accompagnement du Cabinet BoomBooks ?',
        a: "Pour 5 000 FCFA, un conseiller BoomBooks vous accompagne personnellement dans toutes les démarches d'ouverture de votre compte-titres auprès d'une SGI agréée : choix de la société de bourse, remplissage des formulaires, pièces justificatives et prise en main jusqu'à votre premier ordre. Vous déposez vos fonds directement auprès de la SGI : BoomBooks ne touche jamais à votre capital.",
    },
    {
        q: 'Puis-je toujours acheter ou lire des livres à l’unité ?',
        a: "Oui, absolument ! Toute notre librairie numérique (+1 000 livres à partir de 655 FCFA et nos packs à 2 500 FCFA) est accessible à tout moment sur boombooks.shop/livres, ou en accès illimité via nos formules d'abonnement dès 1 500 FCFA/mois.",
    },
    {
        q: 'Depuis quels pays puis-je investir à la BRVM et utiliser BoomBooks ?',
        a: "La BRVM est commune aux 8 pays de l'UEMOA (Côte d'Ivoire, Sénégal, Bénin, Burkina Faso, Mali, Niger, Togo, Guinée-Bissau) et reste ouverte aux investisseurs de toute l'Afrique francophone (Cameroun, Gabon, RDC, Congo, etc.) et de la diaspora. Tous nos livres et formations sont accessibles partout dans le monde sur téléphone.",
    },
];

/* ── Témoignages ──────────────────────────────────────────────────────────── */
export const TESTIMONIALS = [
    { quote: "[Témoignage à fournir — ce que BoomBooks a changé dans votre rapport à l'argent.]", name: 'Prénom N.', country: 'Pays', placeholder: true },
    { quote: '[Témoignage à fournir — votre premier investissement à la BRVM.]', name: 'Prénom N.', country: 'Pays', placeholder: true },
    { quote: '[Témoignage à fournir — la bibliothèque au quotidien.]', name: 'Prénom N.', country: 'Pays', placeholder: true },
];

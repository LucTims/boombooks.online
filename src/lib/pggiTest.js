/* ═══════════════════════════════════════════════════════════════════════
 * Test PGGI : questions, calcul du résultat, recommandations, enregistrement.
 * Une réponse = 1 point pour son étape (2 points pour la question 6) → 8 points.
 * ═══════════════════════════════════════════════════════════════════════ */
import { supabase } from './supabaseClient';
import { COUNTRIES } from './countries';
import { CHARIOW_LINKS, whatsappLink } from './landingContent';

/* Ordre officiel : sert aussi à départager les égalités */
export const STAGE_ORDER = ['penser', 'gagner', 'gerer', 'investir'];

export const STAGE_LABELS = {
    penser: 'PENSER',
    gagner: 'GAGNER',
    gerer: 'GÉRER',
    investir: 'INVESTIR',
};

export const QUESTIONS = [
    {
        id: 'q1',
        q: 'Quelle phrase vous ressemble le plus ?',
        options: [
            { label: '« L’argent, ce n’est pas pour les gens comme moi. »', stage: 'penser' },
            { label: '« Je voudrais gagner plus, mais je ne sais pas comment. »', stage: 'gagner' },
            { label: '« Je gagne de l’argent, mais il disparaît vite. »', stage: 'gerer' },
            { label: '« J’ai un peu d’argent de côté et je veux le faire grandir. »', stage: 'investir' },
        ],
    },
    {
        id: 'q2',
        q: 'Aujourd’hui, combien de revenus avez-vous ?',
        options: [
            { label: 'Je n’y ai jamais vraiment réfléchi', stage: 'penser' },
            { label: 'Aucun revenu régulier pour l’instant', stage: 'gagner' },
            { label: 'Un revenu, mais je n’arrive jamais au bout du mois', stage: 'gerer' },
            { label: 'Un ou plusieurs revenus, et il me reste de l’argent chaque mois', stage: 'investir' },
        ],
    },
    {
        id: 'q3',
        q: 'À la fin du mois, il vous reste…',
        options: [
            { label: 'Je préfère ne pas y penser', stage: 'penser' },
            { label: 'Rien, parce que je gagne trop peu', stage: 'gagner' },
            { label: 'Rien, et je ne sais pas où l’argent est passé', stage: 'gerer' },
            { label: 'Un peu, que je garde à la maison ou sur mon compte', stage: 'investir' },
        ],
    },
    {
        id: 'q4',
        q: 'Avez-vous des dettes (crédits, argent emprunté à des proches) ?',
        options: [
            { label: 'Les dettes, c’est normal, tout le monde en a', stage: 'penser' },
            { label: 'Non, mais je n’ai pas de revenu stable', stage: 'gagner' },
            { label: 'Oui, et elles me pèsent', stage: 'gerer' },
            { label: 'Non, et j’ai une épargne de sécurité', stage: 'investir' },
        ],
    },
    {
        id: 'q5',
        q: 'Si on vous donnait 100 000 FCFA aujourd’hui…',
        options: [
            { label: 'Je ne saurais pas quoi en faire', stage: 'penser' },
            { label: 'Je lancerais une petite activité', stage: 'gagner' },
            { label: 'Il serait parti avant la fin de la semaine', stage: 'gerer' },
            { label: 'Je le placerais pour qu’il rapporte', stage: 'investir' },
        ],
    },
    {
        id: 'q6',
        q: 'Qu’est-ce qui vous bloque le plus ?',
        weight: 2,
        options: [
            { label: 'Je doute de moi, je pense que la richesse n’est pas pour moi', stage: 'penser' },
            { label: 'Je n’ai pas d’idée pour gagner plus', stage: 'gagner' },
            { label: 'Je n’arrive pas à contrôler mes dépenses', stage: 'gerer' },
            { label: 'Je ne sais pas où ni comment investir', stage: 'investir' },
        ],
    },
    {
        id: 'q7',
        q: 'Dans 12 mois, vous aimeriez…',
        options: [
            { label: 'Avoir changé ma façon de voir l’argent', stage: 'penser' },
            { label: 'Avoir un revenu en plus', stage: 'gagner' },
            { label: 'Ne plus finir le mois à zéro et avoir un fonds d’urgence', stage: 'gerer' },
            { label: 'Posséder mes premières actions', stage: 'investir' },
        ],
    },
];

/* Mélange de Fisher-Yates : l'ordre des réponses change à chaque test */
function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function shuffledQuestions() {
    return QUESTIONS.map((q) => ({ ...q, options: shuffle(q.options) }));
}

/**
 * answers : tableau d'étapes ('penser'…) dans l'ordre des questions.
 * Retourne { scores, stage, secondStage }.
 */
export function computeResult(answers) {
    const scores = { penser: 0, gagner: 0, gerer: 0, investir: 0 };
    answers.forEach((stage, i) => {
        if (stage in scores) scores[stage] += QUESTIONS[i]?.weight || 1;
    });
    // Tri stable par score décroissant ; à égalité, l'ordre Penser → Investir l'emporte
    const ranked = [...STAGE_ORDER].sort(
        (a, b) => scores[b] - scores[a] || STAGE_ORDER.indexOf(a) - STAGE_ORDER.indexOf(b)
    );
    return { scores, stage: ranked[0], secondStage: ranked[1] };
}

/* ── Pays : l'Afrique francophone d'abord, puis tous les autres ── */
const PRIORITY_CODES = ['CI', 'CM', 'SN', 'BJ', 'TG', 'BF', 'ML', 'NE', 'GA', 'CG', 'CD', 'TD', 'CF', 'GN', 'GQ', 'GW', 'MG', 'FR'];
export const PRIORITY_COUNTRIES = PRIORITY_CODES.map((c) => COUNTRIES.find((x) => x.code === c)).filter(Boolean);
export const OTHER_COUNTRIES = COUNTRIES.filter((c) => !PRIORITY_CODES.includes(c.code));
export const findCountry = (code) => COUNTRIES.find((c) => c.code === code);

/* Bourse régionale : BVMAC pour la zone CEMAC, BRVM pour l'UEMOA (et par défaut) */
const CEMAC = ['CM', 'GA', 'CG', 'TD', 'CF', 'GQ'];
export const isCemac = (code) => CEMAC.includes(code);

export const SHOP_ORIGIN = 'https://boombooks.shop';

/* ── Recommandation affichée pour chaque étape ── */
export function getRecommendation(stage, countryCode) {
    switch (stage) {
        case 'penser':
            return {
                message: 'Avant de changer de compte en banque, on change de regard sur l’argent. C’est la base de tout le reste.',
                product: {
                    title: 'Réfléchissez et devenez riche',
                    price: 'Gratuit',
                    note: 'De Napoléon Hill · Le grand classique pour transformer votre regard sur l’argent.',
                    image: '/images/landing/livre-reflechissez-devenez-riche.jpg',
                    icon: 'auto_stories',
                    slug: 'reflechissez-et-devenez-riche-napoleon-hill-3',
                    cta: {
                        label: 'Obtenir gratuitement',
                        href: `${SHOP_ORIGIN}/book/reflechissez-et-devenez-riche-napoleon-hill-3`,
                    },
                },
                extra: null,
            };
        case 'gagner':
            return {
                message: 'Votre priorité est de créer un revenu, ou un deuxième revenu. Notre livre GAGNER arrive bientôt.',
                product: {
                    title: 'Le livre GAGNER',
                    price: 'Bientôt disponible',
                    note: 'Soyez parmi les premiers à le recevoir.',
                    image: null,
                    icon: 'rocket_launch',
                    cta: {
                        label: 'Être prévenu de la sortie',
                        href: whatsappLink('Bonjour BoomBooks, je veux être prévenu(e) de la sortie du livre GAGNER.'),
                    },
                },
                extra: { label: 'En attendant : voir la boutique BoomBooks', href: SHOP_ORIGIN },
            };
        case 'gerer':
            return {
                message: 'Vous savez gagner de l’argent. Le défi, c’est de le garder.',
                product: {
                    title: 'En route vers la liberté financière',
                    price: '655 FCFA',
                    note: 'Le livre pour reprendre le contrôle de votre budget.',
                    image: '/images/landing/livre-liberte-financiere.webp',
                    slug: 'en-route-vers-la-liberte-financiere-boombooks',
                    cta: {
                        label: 'Obtenir le livre',
                        href: `${SHOP_ORIGIN}/book/en-route-vers-la-liberte-financiere-boombooks`,
                    },
                },
                extra: null,
            };
        case 'investir':
        default: {
            const bvmac = isCemac(countryCode);
            const guide = bvmac ? 'Guide BVMAC' : 'Guide BRVM';
            const slug = bvmac
                ? 'guide-complet-pour-investir-a-la-bvmac-boombooks'
                : 'guide-complet-pour-investir-a-la-brvm-boombooks';
            return {
                message: 'Votre base est là. Il est temps de faire travailler votre argent, à votre rythme.',
                product: {
                    title: `Le ${guide} : investir à la Bourse`,
                    price: '655 FCFA',
                    note: bvmac ? 'La Bourse de l’Afrique centrale, expliquée pas à pas.' : 'La Bourse de l’Afrique de l’Ouest, expliquée pas à pas.',
                    // la couverture actuelle est celle du guide BRVM : pas d'image trompeuse pour la BVMAC
                    image: bvmac ? null : '/images/landing/livre-guide-brvm.webp',
                    icon: 'candlestick_chart',
                    slug,
                    cta: {
                        label: 'Obtenir le guide',
                        href: `${SHOP_ORIGIN}/book/${slug}`,
                    },
                },
                extra: {
                    label: 'Ensuite : la formation vidéo',
                    href: CHARIOW_LINKS.formationBrvm
                        || whatsappLink('Bonjour BoomBooks, je veux en savoir plus sur la formation vidéo pour investir en Bourse.'),
                },
            };
        }
    }
}

/* ── Lien WhatsApp prérempli avec l'étape du visiteur ── */
export function getStageWhatsAppLink(stage, firstName = '', countryCode = '') {
    const cleanName = firstName.trim();
    const intro = cleanName
        ? `Bonjour BoomBooks, je m'appelle ${cleanName}. Je viens de terminer le test PGGI`
        : 'Bonjour BoomBooks, je viens de terminer le test PGGI';
    const bvmac = isCemac(countryCode);

    switch (stage) {
        case 'penser':
            return whatsappLink(`${intro} et mon étape est PENSER. J'aimerais échanger avec vous pour bien démarrer et changer mon rapport à l'argent.`);
        case 'gagner':
            return whatsappLink(`${intro} et mon étape est GAGNER. J'aimerais vos conseils pour créer ou augmenter mes revenus.`);
        case 'gerer':
            return whatsappLink(`${intro} et mon étape est GÉRER. J'aimerais vos conseils pour mieux gérer mon budget et mon épargne.`);
        case 'investir':
        default:
            return whatsappLink(`${intro} et mon étape est INVESTIR (${bvmac ? 'BVMAC' : 'BRVM'}). J'aimerais être guidé(e) pour faire travailler mon argent.`);
    }
}

export const PENDING_PGGI_KEY = 'bb_pending_pggi';

export function detectCountryCode(countryNameOrCode = '') {
    const raw = String(countryNameOrCode || '').trim();
    if (raw.length === 2) {
        const matchByCode = COUNTRIES.find((c) => c.code === raw.toUpperCase());
        if (matchByCode) return matchByCode.code;
    }
    if (raw) {
        const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, "'");
        const target = norm(raw);
        const match = COUNTRIES.find((c) => norm(c.name) === target || norm(c.name).includes(target) || target.includes(norm(c.name)));
        if (match) return match.code;
    }
    try {
        const cached = localStorage.getItem('bb_user_country');
        if (cached && findCountry(cached.toUpperCase())) return cached.toUpperCase();
    } catch { /* ignore */ }
    return 'CI';
}

export function savePendingPggiTest(payload) {
    if (!payload?.stage || !STAGE_ORDER.includes(payload.stage)) return;
    try {
        localStorage.setItem(PENDING_PGGI_KEY, JSON.stringify({
            ...payload,
            completedAt: payload.completedAt || new Date().toISOString(),
        }));
    } catch { /* stockage indisponible */ }
}

export function readPendingPggiTest() {
    try {
        const raw = localStorage.getItem(PENDING_PGGI_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.stage && STAGE_ORDER.includes(parsed.stage) ? parsed : null;
    } catch {
        return null;
    }
}

export function clearPendingPggiTest() {
    try { localStorage.removeItem(PENDING_PGGI_KEY); } catch { /* ignore */ }
}

/**
 * Enregistre le diagnostic PGGI sur le profil Supabase de l'utilisateur connecté
 * (+ synchronisation dans pggi_leads et user_metadata).
 */
export async function saveAuthenticatedPggiTest(user, payload) {
    if (!user?.id || !payload?.stage || !STAGE_ORDER.includes(payload.stage)) {
        return { success: false };
    }
    const cleanCode = detectCountryCode(payload.countryCode || payload.countryName);
    const countryObj = findCountry(cleanCode);
    const countryName = payload.countryName || countryObj?.name || '';
    const cleanFirst = (payload.firstName || '').trim();
    const cleanWhatsapp = (payload.whatsapp || '').trim();

    try {
        const { data, error } = await supabase.rpc('save_my_pggi_test', {
            p_stage: payload.stage,
            p_second_stage: payload.secondStage || null,
            p_scores: payload.scores || {},
            p_answers: payload.answers || [],
            p_first_name: cleanFirst || null,
            p_country_code: cleanCode,
            p_country_name: countryName || null,
            p_whatsapp: cleanWhatsapp || null,
            p_consent: payload.consent ?? true,
        });
        if (error) throw error;

        const meta = user.user_metadata || {};
        const metaUpdates = { pggi_stage: payload.stage };
        if (cleanFirst && !meta.first_name) metaUpdates.first_name = cleanFirst;
        if (cleanWhatsapp && !meta.phone) metaUpdates.phone = cleanWhatsapp;
        if (countryName && !meta.country) metaUpdates.country = countryName;

        await supabase.auth.updateUser({ data: metaUpdates }).catch(() => {});
        return { success: Boolean(data?.success ?? true), stage: payload.stage };
    } catch (err) {
        console.warn('[test-pggi] saveAuthenticatedPggiTest failed:', err?.message || err);
        return { success: false, error: err };
    }
}

let pggiSyncInFlight = null;

/**
 * Synchronise un test PGGI effectué juste avant connexion/inscription, ou rattache
 * un diagnostic préalable laissé avec le même e-mail dans pggi_leads.
 */
export async function syncPendingPggiTest(user) {
    if (!user?.id) return null;
    if (pggiSyncInFlight) return pggiSyncInFlight;

    pggiSyncInFlight = (async () => {
        try {
            const pending = readPendingPggiTest();
            if (pending) {
                const res = await saveAuthenticatedPggiTest(user, pending);
                if (res?.success) {
                    clearPendingPggiTest();
                    return res;
                }
            }
            const { data } = await supabase.rpc('claim_my_pggi_by_email');
            return data || null;
        } catch (err) {
            console.warn('[test-pggi] syncPendingPggiTest failed:', err?.message || err);
            return null;
        } finally {
            pggiSyncInFlight = null;
        }
    })();

    return pggiSyncInFlight;
}

/* ── Enregistrement du contact (fonction Supabase submit_pggi_lead) ──
 * Le même numéro WhatsApp met à jour sa fiche au lieu d'en créer une autre.
 * Une erreur n'empêche jamais d'afficher le résultat. */
export async function saveLead(lead) {
    try {
        const { error } = await supabase.rpc('submit_pggi_lead', {
            p_first_name: lead.firstName,
            p_country_code: lead.countryCode,
            p_whatsapp: lead.whatsapp,
            p_email: lead.email || null,
            p_consent: lead.consent,
            p_stage: lead.stage,
            p_second_stage: lead.secondStage,
            p_scores: lead.scores,
            p_answers: lead.answers,
        });
        if (error) throw error;
        return true;
    } catch (err) {
        console.warn('[test-pggi] contact non enregistré :', err?.message || err);
        return false;
    }
}

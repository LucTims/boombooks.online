import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════
 *  BoomBooks — Système de conversion automatique de devises
 * ═══════════════════════════════════════════════════════════════
 *
 *  Monnaie de base en BDD : FCFA (XOF)
 *  Au chargement, on détecte le pays de l'utilisateur (via IP)
 *  puis on récupère le taux de change en temps réel.
 */

const CURRENCY_MAP = {
    // Zone FCFA (XOF) — pas de conversion
    BJ: { code: 'XOF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    BF: { code: 'XOF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    CI: { code: 'XOF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    GW: { code: 'XOF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    ML: { code: 'XOF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    NE: { code: 'XOF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    SN: { code: 'XOF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    TG: { code: 'XOF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    // Zone FCFA (XAF)
    CM: { code: 'XAF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    CF: { code: 'XAF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    TD: { code: 'XAF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    CG: { code: 'XAF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    GA: { code: 'XAF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    GQ: { code: 'XAF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' },
    // Autres pays africains
    CD: { code: 'CDF', symbol: 'FC',   locale: 'fr-CD', position: 'after' },
    GH: { code: 'GHS', symbol: 'GH₵',  locale: 'en-GH', position: 'before' },
    KE: { code: 'KES', symbol: 'KSh',  locale: 'en-KE', position: 'before' },
    MG: { code: 'MGA', symbol: 'Ar',   locale: 'fr-MG', position: 'after' },
    MR: { code: 'MRU', symbol: 'UM',   locale: 'ar-MR', position: 'after' },
    MZ: { code: 'MZN', symbol: 'MT',   locale: 'pt-MZ', position: 'after' },
    NG: { code: 'NGN', symbol: '₦',    locale: 'en-NG', position: 'before' },
    RW: { code: 'RWF', symbol: 'FRw',  locale: 'rw-RW', position: 'after' },
    TZ: { code: 'TZS', symbol: 'TSh',  locale: 'sw-TZ', position: 'before' },
    UG: { code: 'UGX', symbol: 'USh',  locale: 'en-UG', position: 'before' },
    ZM: { code: 'ZMW', symbol: 'ZK',   locale: 'en-ZM', position: 'before' },
    GN: { code: 'GNF', symbol: 'FG',   locale: 'fr-GN', position: 'after' },
    // Europe
    FR: { code: 'EUR', symbol: '€',    locale: 'fr-FR', position: 'after' },
    BE: { code: 'EUR', symbol: '€',    locale: 'fr-BE', position: 'after' },
    CH: { code: 'CHF', symbol: 'CHF',  locale: 'fr-CH', position: 'after' },
    DE: { code: 'EUR', symbol: '€',    locale: 'de-DE', position: 'after' },
    ES: { code: 'EUR', symbol: '€',    locale: 'es-ES', position: 'after' },
    IT: { code: 'EUR', symbol: '€',    locale: 'it-IT', position: 'after' },
    GB: { code: 'GBP', symbol: '£',    locale: 'en-GB', position: 'before' },
    // Amérique du Nord
    US: { code: 'USD', symbol: '$',    locale: 'en-US', position: 'before' },
    CA: { code: 'CAD', symbol: 'CA$',  locale: 'en-CA', position: 'before' },
    // Asie / Moyen-Orient
    MA: { code: 'MAD', symbol: 'MAD',  locale: 'fr-MA', position: 'after' },
    DZ: { code: 'DZD', symbol: 'DA',   locale: 'fr-DZ', position: 'after' },
    TN: { code: 'TND', symbol: 'DT',   locale: 'fr-TN', position: 'after' },
};

const DEFAULT_CURRENCY = { code: 'XOF', symbol: 'FCFA', locale: 'fr-FR', position: 'after' };

// Cache du taux de change pour ne pas refaire l'appel à chaque page
const RATE_CACHE_KEY = 'bb_exchange_rates';
const RATE_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 heures

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
    const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
    const [rate, setRate] = useState(1); // taux XOF → devise cible
    const [countryCode, setCountryCode] = useState(null);
    const [ready, setReady] = useState(false);

    // ── 1. Détecter le pays ──────────────────────────────────────
    useEffect(() => {
        // Vérifier si l'utilisateur a choisi manuellement une monnaie
        const saved = localStorage.getItem('bb_currency_override');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCurrency(parsed.currency);
                setRate(parsed.rate);
                setCountryCode(parsed.countryCode);
                setReady(true);
                return;
            } catch (_) {}
        }

        // Détection automatique via IP
        detectCountry();
    }, []);

    async function detectCountry() {
        try {
            // API gratuite, pas de clé requise, 45 req/min
            const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
            if (!res.ok) throw new Error('ipapi failed');
            const data = await res.json();
            const code = data.country_code || data.country;

            if (code) {
                setCountryCode(code);
                const cur = CURRENCY_MAP[code] || DEFAULT_CURRENCY;
                setCurrency(cur);

                if (cur.code === 'XOF' || cur.code === 'XAF') {
                    // Même monnaie, pas de conversion
                    setRate(1);
                    setReady(true);
                } else {
                    await fetchRate(cur.code);
                }
            } else {
                setReady(true);
            }
        } catch (err) {
            console.warn('[Currency] Détection IP échouée, FCFA par défaut:', err.message);
            setReady(true);
        }
    }

    // ── 2. Récupérer le taux de change ───────────────────────────
    async function fetchRate(targetCode) {
        const targetLower = targetCode.toLowerCase();
        // Vérifier le cache d'abord
        try {
            const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || '{}');
            if (cached[targetCode] && Date.now() - cached[targetCode].ts < RATE_CACHE_TTL) {
                setRate(cached[targetCode].rate);
                setReady(true);
                return;
            }
        } catch (_) {}

        // Fallback rates (toujours valables en cas de problème API)
        const fallbackRates = {
            EUR: 0.00152, USD: 0.00166, GBP: 0.00131, CAD: 0.00227,
            CHF: 0.00146,
            NGN: 2.52, GHS: 0.0247, KES: 0.2143, MAD: 0.0164,
            CDF: 4.65, GNF: 14.31, MGA: 7.48, RWF: 2.12,
            DZD: 0.223, TND: 0.00517, MRU: 0.066, MZN: 0.106,
            TZS: 4.39, UGX: 6.12, ZMW: 0.046,
        };

        try {
            // API gratuite de fawazahmed0 (aucune clé requise, mise à jour quotidienne)
            const res = await fetch(
                `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xof.json`,
                { signal: AbortSignal.timeout(5000) }
            );
            const data = await res.json();

            if (data?.xof?.[targetLower]) {
                const newRate = data.xof[targetLower];
                setRate(newRate);

                // Mettre en cache
                try {
                    const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || '{}');
                    cached[targetCode] = { rate: newRate, ts: Date.now() };
                    localStorage.setItem(RATE_CACHE_KEY, JSON.stringify(cached));
                } catch (_) {}
            } else if (fallbackRates[targetCode]) {
                setRate(fallbackRates[targetCode]);
            }
        } catch (err) {
            console.warn('[Currency] Taux de change indisponible:', err.message);
            if (fallbackRates[targetCode]) {
                setRate(fallbackRates[targetCode]);
            }
        }
        setReady(true);
    }

    // ── 3. Fonction de formatage (utilisée partout) ──────────────
    const formatPrice = useCallback((priceFCFA) => {
        const numericPrice = parseFloat(priceFCFA) || 0;

        if (currency.code === 'XOF' || currency.code === 'XAF') {
            return `${numericPrice.toLocaleString('fr-FR')} FCFA`;
        }

        const converted = numericPrice * rate;

        // Formater le nombre selon la locale
        let formatted;
        if (['EUR', 'USD', 'GBP', 'CAD', 'CHF'].includes(currency.code)) {
            formatted = converted.toFixed(2);
        } else {
            formatted = Math.round(converted).toLocaleString(currency.locale);
        }

        if (currency.position === 'before') {
            return `${currency.symbol}${formatted}`;
        }
        return `${formatted} ${currency.symbol}`;
    }, [currency, rate]);

    // ── 4. Prix FCFA en petit (toujours affiché en secondaire) ───
    const formatOriginal = useCallback((priceFCFA) => {
        const numericPrice = parseFloat(priceFCFA) || 0;
        return `${numericPrice.toLocaleString('fr-FR')} FCFA`;
    }, []);

    // ── 5. Forcer une monnaie manuellement ───────────────────────
    const setCurrencyManual = useCallback(async (code) => {
        const entry = Object.values(CURRENCY_MAP).find(c => c.code === code);
        if (!entry) return;

        // Remove override so fetchRate can work fresh
        localStorage.removeItem('bb_currency_override');
        localStorage.removeItem(RATE_CACHE_KEY);
        setCurrency(entry);

        if (entry.code === 'XOF' || entry.code === 'XAF') {
            setRate(1);
            localStorage.setItem('bb_currency_override', JSON.stringify({
                currency: entry, rate: 1, countryCode
            }));
        } else {
            // fetchRate will set the rate via setRate
            await fetchRate(entry.code);
            // Read the rate from cache since fetchRate already cached it
            try {
                const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || '{}');
                const newRate = cached[entry.code]?.rate || rate;
                localStorage.setItem('bb_currency_override', JSON.stringify({
                    currency: entry, rate: newRate, countryCode
                }));
            } catch (_) {}
        }
    }, [countryCode, rate]);

    const resetCurrency = useCallback(() => {
        localStorage.removeItem('bb_currency_override');
        detectCountry();
    }, []);

    const isConverted = currency.code !== 'XOF' && currency.code !== 'XAF';

    return (
        <CurrencyContext.Provider value={{
            currency,
            rate,
            countryCode,
            ready,
            isConverted,
            formatPrice,
            formatOriginal,
            setCurrencyManual,
            resetCurrency,
            CURRENCY_MAP,
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
    return ctx;
}

/**
 * Liste des devises disponibles pour le sélecteur manuel.
 */
export const AVAILABLE_CURRENCIES = [
    { code: 'XOF', label: 'FCFA (Franc CFA)', flag: '🇨🇮' },
    { code: 'EUR', label: 'Euro (€)',          flag: '🇪🇺' },
    { code: 'USD', label: 'Dollar US ($)',     flag: '🇺🇸' },
    { code: 'GBP', label: 'Livre Sterling (£)',flag: '🇬🇧' },
    { code: 'CAD', label: 'Dollar CA (CA$)',   flag: '🇨🇦' },
    { code: 'NGN', label: 'Naira (₦)',         flag: '🇳🇬' },
    { code: 'GHS', label: 'Cedi (GH₵)',        flag: '🇬🇭' },
    { code: 'KES', label: 'Shilling KE (KSh)', flag: '🇰🇪' },
    { code: 'CDF', label: 'Franc CG (FC)',     flag: '🇨🇩' },
    { code: 'MAD', label: 'Dirham (MAD)',      flag: '🇲🇦' },
    { code: 'CHF', label: 'Franc Suisse (CHF)',flag: '🇨🇭' },
];

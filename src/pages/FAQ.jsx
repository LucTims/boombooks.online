import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQS = [
    {
        section: "À propos de BoomBooks",
        items: [
            { q: "Qu'est-ce que BoomBooks ?", a: "BoomBooks est la librairie numérique premium dédiée aux lecteurs d'Afrique francophone. Nous proposons des milliers de livres numériques (PDF, EPUB) soigneusement sélectionnés — finance, leadership, développement personnel et fiction." },
            { q: "BoomBooks est-il disponible dans mon pays ?", a: "Oui ! BoomBooks accepte les paiements depuis 25 pays africains via Mobile Money (MTN, Orange, Moov, Wave...) — Cameroun, Côte d'Ivoire, Sénégal, Bénin, Togo, Mali, Ghana, Nigeria, et bien d'autres." },
            { q: "Quels formats de livres proposez-vous ?", a: "Nos livres sont disponibles en PDF (le plus courant) et EPUB. Vous pouvez les lire sur smartphone, tablette ou PC." },
        ]
    },
    {
        section: "Paiement & Sécurité",
        items: [
            { q: "Comment fonctionne le paiement ?", a: "BoomBooks utilise Chariow comme processeur sécurisé. Après avoir ajouté un livre, entrez votre numéro Mobile Money, et vous êtes redirigé vers Chariow pour finaliser. L'accès est immédiat après confirmation." },
            { q: "Mon paiement est-il sécurisé ?", a: "Absolument. Tous les paiements transitent par Chariow, certifié pour les transactions africaines. Vos données ne sont jamais stockées sur nos serveurs." },
            { q: "Puis-je obtenir un remboursement ?", a: "En raison de la nature numérique des produits (accès immédiat), les remboursements ne sont pas possibles après téléchargement. En cas de problème technique, contactez-nous à www.boombooks1@gmail.com." },
            { q: "Pourquoi mon paiement Mobile Money est bloqué ?", a: "Vérifiez que votre numéro est actif et que vous avez le solde suffisant. Si le problème persiste, contactez votre opérateur ou écrivez-nous." },
        ]
    },
    {
        section: "Mes livres & Téléchargement",
        items: [
            { q: "Comment accéder à mes livres après l'achat ?", a: "Allez dans « Ma Bibliothèque » dans le menu. Tous vos livres y apparaissent. Cliquez sur « Télécharger PDF » pour obtenir votre fichier. L'accès est immédiat dès la confirmation." },
            { q: "Mon livre n'apparaît pas — que faire ?", a: "Si le paiement est confirmé mais le livre n'apparaît pas, attendez 1-2 minutes. Si après 5 minutes rien ne s'affiche, contactez-nous avec votre référence de commande." },
            { q: "Puis-je lire mes livres sur plusieurs appareils ?", a: "Oui. Une fois téléchargé, le fichier vous appartient pour toujours — smartphone, tablette, PC, liseuse." },
        ]
    },
    {
        section: "Compte & Inscription",
        items: [
            { q: "Dois-je créer un compte pour acheter ?", a: "Oui, un compte est nécessaire pour accéder à votre bibliothèque. La création est gratuite et rapide — juste un email et un mot de passe." },
            { q: "J'ai oublié mon mot de passe — que faire ?", a: "Sur la page de connexion, cliquez sur « Mot de passe oublié ? » et entrez votre email. Vérifiez aussi vos spams." },
        ]
    },
    {
        section: "Support",
        items: [
            { q: "Comment contacter le support ?", a: "Email : www.boombooks1@gmail.com — WhatsApp : +237 6 74 24 63 55. Notre équipe répond sous 24h (jours ouvrés)." },
            { q: "Proposez-vous des packs de livres ?", a: "Oui ! Les packs BoomBooks regroupent plusieurs livres thématiques à prix réduit (jusqu'à -42%). Retrouvez-les sur la page d'accueil." },
        ]
    }
];

function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderBottom: '1px solid var(--color-border)' }}>
            <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', padding: 'var(--space-5) 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--color-text)', lineHeight: 1.4 }}>{q}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--color-primary)', flexShrink: 0, transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none' }}>expand_more</span>
            </button>
            {open && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.75, paddingBottom: 'var(--space-5)' }}>{a}</p>}
        </div>
    );
}

export default function FAQ() {
    return (
        <main style={{ paddingTop: 'var(--header-height)', minHeight: '100vh', background: 'var(--color-bg)' }}>
            <section style={{ background: 'var(--color-bg-light)', borderBottom: '1px solid var(--color-border)', padding: '60px 0', textAlign: 'center' }}>
                <div className="container">
                    <div>
                        <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>help_outline</span>
                    </div>
                    <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>Foire Aux Questions</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', maxWidth: 520, margin: '0 auto var(--space-6)' }}>
                        Toutes les réponses aux questions fréquentes sur BoomBooks.
                    </p>
                    <Link to="/" className="btn btn-outline">← Retour à l'accueil</Link>
                </div>
            </section>

            <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)', maxWidth: 800, margin: '0 auto' }}>
                {FAQS.map(section => (
                    <div key={section.section} style={{ marginBottom: 'var(--space-10)' }}>
                        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 4, height: 22, background: 'var(--color-primary)', borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
                            {section.section}
                        </h2>
                        <div className="card" style={{ padding: '0 var(--space-6)' }}>
                            {section.items.map(item => <FAQItem key={item.q} {...item} />)}
                        </div>
                    </div>
                ))}

                <div style={{ background: 'linear-gradient(135deg, var(--color-primary), #3b82f6)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', textAlign: 'center', color: '#fff' }}>
                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Vous n'avez pas trouvé votre réponse ?</h3>
                    <p style={{ opacity: 0.85, marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)' }}>Notre équipe est disponible 7j/7.</p>
                    <a href="mailto:www.boombooks1@gmail.com" className="btn" style={{ background: '#fff', color: 'var(--color-primary)', fontWeight: 700 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>mail</span>
                        www.boombooks1@gmail.com
                    </a>
                </div>
            </div>
        </main>
    );
}

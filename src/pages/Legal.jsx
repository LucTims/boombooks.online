import React from 'react';

export default function Legal() {
    return (
        <main className="page container" style={{ maxWidth: 860, padding: 'calc(var(--header-height) + var(--space-10)) var(--space-4) var(--space-10)', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>account_balance</span>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-1px' }}>Mentions Légales</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>En vigueur au {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            
            <div className="card" style={{ padding: 'var(--space-8)', lineHeight: 1.8, color: 'var(--color-text)' }}>
                <p style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>
                    Conformément aux dispositions relatives à la confiance dans l'économie numérique, il est porté à la connaissance des utilisateurs et visiteurs de la plateforme <strong>BoomBooks</strong> les présentes mentions légales.
                </p>

                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>1. Éditeur de la Plateforme</h2>
                <p style={{ marginBottom: 'var(--space-5)' }}>
                    Le site <strong>boombooks.shop</strong> ainsi que son application de lecture affiliée <strong>BoomRead</strong> sont édités et exploités par :<br />
                    <span style={{ display: 'block', padding: 'var(--space-4)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-3)', border: '1px solid var(--color-border)' }}>
                        <strong>Nom de l'entité :</strong> BoomBooks<br />
                        <strong>Contact direct (Email) :</strong> <a href="mailto:www.boombooks1@gmail.com" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>www.boombooks1@gmail.com</a><br />
                        <strong>Assistance (WhatsApp) :</strong> +237 6 74 24 63 55
                    </span>
                </p>

                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>2. Infrastructures et Hébergement</h2>
                <p style={{ marginBottom: 'var(--space-5)' }}>
                    L'architecture technique de notre plateforme s'appuie sur des leaders mondiaux garantissant sécurité, redondance et disponibilité continue :<br />
                    <br />
                    <strong>Hébergement Frontend et Déploiement :</strong> Vercel Inc. (San Francisco, CA, USA)<br />
                    <strong>Gestion des Bases de Données et Sécurité (Auth) :</strong> Supabase Inc.<br />
                    <strong>Traitement Sécurisé des Paiements :</strong> Chariow (Agréé Mobile Money)
                </p>

                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>3. Droit d'Auteur et Propriété Intellectuelle</h2>
                <p style={{ marginBottom: 'var(--space-5)' }}>
                    L'intégralité de la conception, de l'architecture logicielle, des marques (dont BoomBooks et BoomRead), logos, visuels et textes présents sur cette plateforme constitue une œuvre de l'esprit protégée par les lois internationales sur la propriété intellectuelle. Toute représentation, reproduction, ou exploitation partielle ou totale des contenus et services proposés, par quelque procédé que ce soit, sans l'autorisation préalable écrite de l'éditeur est formellement interdite et constitutive de contrefaçon.
                </p>

                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>4. Exclusion de Responsabilité</h2>
                <p style={{ marginBottom: 'var(--space-5)' }}>
                    BoomBooks décline toute responsabilité quant à l'utilisation qui pourrait être faite des informations et contenus présents sur la plateforme. Nous garantissons que les ouvrages (fichiers PDF et EPUB) sont exempts de virus au moment de la livraison sur notre interface cloud, mais il appartient à l'Utilisateur de prendre toutes les mesures appropriées pour protéger son propre matériel informatique.
                </p>

                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>5. Loi Applicable et Juridiction Compétente</h2>
                <p style={{ marginBottom: 'var(--space-5)' }}>
                    Les présentes mentions légales, ainsi que toute question relative à l'utilisation de la plateforme, sont assujetties aux lois en vigueur. En cas de litige ne pouvant être résolu à l'amiable, la compétence exclusive est attribuée aux tribunaux compétents du siège de BoomBooks.
                </p>
                
                <hr style={{ margin: 'var(--space-10) 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
                
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    Pour toute requête formelle, veuillez utiliser les coordonnées de contact ci-dessus.
                </p>
            </div>
        </main>
    );
}

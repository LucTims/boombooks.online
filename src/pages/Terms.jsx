import React, { useEffect } from 'react';

export default function Terms() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'calc(var(--header-height) + 40px) 20px 40px', fontFamily: 'Inter, sans-serif', color: '#334155', lineHeight: '1.8' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Termes et Conditions Générales (CGU / CGV)</h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>1. Objet</h2>
                <p>Les présentes Conditions Générales d'Utilisation et de Vente régissent l'utilisation de la plateforme BoomBooks et l'ensemble des transactions effectuées sur le site. En accédant au site et en créant un compte, vous acceptez pleinement et sans réserve les présentes conditions.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>2. Les Services BoomBooks</h2>
                <p>BoomBooks est une plateforme numérique innovante proposant deux services principaux :</p>
                <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
                    <li><strong>Boutique en ligne :</strong> Vente et téléchargement d'ebooks numériques au format PDF, EPUB ou autres formats spécifiés.</li>
                    <li><strong>BoomBooks Studio IA :</strong> Un service de création littéraire assisté par intelligence artificielle permettant aux utilisateurs de générer, éditer et publier leurs propres livres sur la plateforme.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>3. Achats et Téléchargements d'Ebooks</h2>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginTop: '16px', marginBottom: '8px' }}>3.1 Prix et Paiement</h3>
                <p>Les prix de nos ebooks sont indiqués dans la devise sélectionnée par l'utilisateur (FCFA, EUR, USD, etc.). Le paiement est exigible immédiatement à la commande. Nous utilisons des solutions de paiement sécurisées.</p>
                
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginTop: '16px', marginBottom: '8px' }}>3.2 Livraison Numérique</h3>
                <p>Les produits vendus étant des fichiers numériques, la livraison consiste en la mise à disposition d'un lien de téléchargement disponible immédiatement après confirmation du paiement dans l'espace "Mes Livres".</p>
                
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginTop: '16px', marginBottom: '8px' }}>3.3 Droit de Rétractation</h3>
                <p>Conformément à la législation sur les produits numériques immatériels, le droit de rétractation ne peut être exercé une fois que le fichier a été téléchargé ou que l'exécution de la livraison numérique a commencé. Tout achat de fichier téléchargé est définitif.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>4. Utilisation du BoomBooks Studio IA</h2>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginTop: '16px', marginBottom: '8px' }}>4.1 Création et Propriété</h3>
                <p>Les textes générés via le Studio IA sont destinés à assister l'utilisateur dans son processus créatif. En publiant un livre généré par IA sur la plateforme BoomBooks, l'utilisateur certifie avoir relu le contenu et en assume l'entière responsabilité éditoriale.</p>
                
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginTop: '16px', marginBottom: '8px' }}>4.2 Restrictions (Mode Bêta)</h3>
                <p>Durant sa phase Bêta, le service BoomBooks Studio IA permet la publication gratuite de livres. BoomBooks se réserve le droit de retirer tout livre contenant des propos illégaux, haineux, diffamatoires ou enfreignant les droits d'auteurs d'un tiers.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>5. Propriété Intellectuelle</h2>
                <p>Le contenu du site BoomBooks (logos, textes, charte graphique, bases de données) est la propriété exclusive de BoomBooks. Les ebooks achetés sont destinés à un usage strictement personnel. Toute revente, partage ou distribution illégale des œuvres numériques est strictement interdite et passible de poursuites.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>6. Modification des Conditions</h2>
                <p>BoomBooks se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés des changements majeurs. L'utilisation continue du site après modification vaut acceptation des nouvelles conditions.</p>
            </section>
        </div>
    );
}

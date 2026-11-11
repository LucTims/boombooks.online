import React, { useEffect } from 'react';

export default function Cookies() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'calc(var(--header-height) + 40px) 20px 40px', fontFamily: 'Inter, sans-serif', color: '#334155', lineHeight: '1.8' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Politique relative aux Cookies</h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>1. Qu'est-ce qu'un cookie ?</h2>
                <p>Un cookie est un petit fichier texte enregistré sur votre ordinateur, tablette ou smartphone lorsque vous visitez notre site web. Les cookies nous aident à mémoriser vos préférences, à comprendre comment vous utilisez notre site et à améliorer votre expérience de navigation.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>2. Les cookies que nous utilisons</h2>
                <p>BoomBooks utilise différentes catégories de cookies :</p>
                
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginTop: '16px', marginBottom: '8px' }}>Cookies Strictement Nécessaires</h3>
                <p>Ces cookies sont indispensables au fonctionnement du site. Ils vous permettent de naviguer sur le site et d'utiliser ses fonctionnalités essentielles (comme l'accès à votre compte sécurisé, la gestion de votre panier d'achat, et la mémorisation de votre devise préférée).</p>

                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginTop: '16px', marginBottom: '8px' }}>Cookies de Fonctionnalité (Studio IA)</h3>
                <p>Nous utilisons le stockage local (Local Storage) pour le <strong>BoomBooks Studio IA</strong> afin de sauvegarder automatiquement vos manuscrits et vos conversations avec l'IA. Ces données restent sur votre appareil pour éviter toute perte de votre travail si vous quittez la page accidentellement.</p>

                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginTop: '16px', marginBottom: '8px' }}>Cookies Analytiques et de Performance</h3>
                <p>Ils nous aident à comprendre comment les visiteurs interagissent avec notre site web en collectant et en signalant des informations de manière anonyme (ex: pages les plus visitées, temps passé sur le site).</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>3. Comment gérer vos cookies ?</h2>
                <p>Vous pouvez à tout moment choisir de désactiver ou de supprimer les cookies depuis les paramètres de votre navigateur internet. Voici comment procéder pour les navigateurs les plus courants :</p>
                <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
                    <li><strong>Google Chrome :</strong> Paramètres {'>'} Confidentialité et sécurité {'>'} Cookies et autres données des sites.</li>
                    <li><strong>Safari :</strong> Préférences {'>'} Confidentialité {'>'} Bloquer tous les cookies.</li>
                    <li><strong>Firefox :</strong> Options {'>'} Vie privée et sécurité {'>'} Cookies et données de sites.</li>
                </ul>
                <p>Veuillez noter que la désactivation des cookies strictement nécessaires peut vous empêcher d'acheter des livres ou d'utiliser correctement le BoomBooks Studio IA.</p>
            </section>
        </div>
    );
}

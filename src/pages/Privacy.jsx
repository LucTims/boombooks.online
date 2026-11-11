import React, { useEffect } from 'react';

export default function Privacy() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'calc(var(--header-height) + 40px) 20px 40px', fontFamily: 'Inter, sans-serif', color: '#334155', lineHeight: '1.8' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Politique de Confidentialité</h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>1. Introduction</h2>
                <p>Bienvenue sur BoomBooks. Nous accordons une importance primordiale à la confidentialité et à la sécurité de vos données personnelles. Cette Politique de Confidentialité décrit la manière dont nous collectons, utilisons, stockons et protégeons les informations que vous nous fournissez lorsque vous utilisez notre plateforme d'achat d'ebooks et notre service BoomBooks Studio IA.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>2. Données Collectées</h2>
                <p>Nous collectons les types d'informations suivants :</p>
                <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
                    <li><strong>Informations d'identification :</strong> Nom, prénom, adresse e-mail lors de la création d'un compte.</li>
                    <li><strong>Données de transaction :</strong> Historique des achats, livres téléchargés, et préférences de lecture (notez que les informations de carte bancaire sont traitées par nos prestataires de paiement sécurisés et ne sont pas stockées sur nos serveurs).</li>
                    <li><strong>Données d'utilisation (Studio IA) :</strong> Les prompts (requêtes), les genres, styles sélectionnés et les manuscrits générés via le BoomBooks Studio IA sont traités pour vous fournir le service, et peuvent être conservés sur votre espace cloud personnel (Supabase) pour vous permettre de retrouver vos créations.</li>
                    <li><strong>Données techniques :</strong> Adresse IP, type de navigateur, localisation géographique (pour l'adaptation de la devise et de la langue), et données de connexion.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>3. Utilisation de vos données</h2>
                <p>Les informations collectées sont utilisées pour :</p>
                <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
                    <li>Fournir, exploiter et améliorer nos services (boutique en ligne et Studio IA).</li>
                    <li>Traiter vos transactions et vous envoyer les confirmations d'achat et vos factures.</li>
                    <li>Personnaliser votre expérience utilisateur et vous recommander des livres adaptés à vos goûts.</li>
                    <li>Vous informer des mises à jour, offres promotionnelles (uniquement si vous y avez consenti).</li>
                    <li>Détecter, prévenir et traiter les problèmes techniques ou de sécurité (fraude, piratage).</li>
                </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>4. Partage des Données</h2>
                <p>Nous ne vendons ni ne louons vos données personnelles à des tiers. Cependant, nous pouvons partager certaines informations avec :</p>
                <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
                    <li><strong>Nos prestataires de services :</strong> (ex: Stripe pour le paiement, Supabase pour l'hébergement de la base de données, Groq pour la génération de texte par IA) qui agissent en notre nom et sont soumis à des obligations strictes de confidentialité.</li>
                    <li><strong>Les autorités légales :</strong> Si la loi l'exige ou pour protéger nos droits légaux.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>5. Sécurité de vos données</h2>
                <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles (chiffrement, accès sécurisé, protocoles SSL) pour protéger vos données contre l'accès non autorisé, l'altération, la divulgation ou la destruction. Toutefois, aucune méthode de transmission sur Internet n'est sûre à 100%.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>6. Vos Droits</h2>
                <p>Conformément aux lois applicables sur la protection des données (notamment le RGPD), vous disposez des droits suivants concernant vos informations :</p>
                <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
                    <li>Le droit d'accéder à vos données personnelles.</li>
                    <li>Le droit de rectifier des données inexactes ou incomplètes.</li>
                    <li>Le droit de demander la suppression de vos données ("droit à l'oubli").</li>
                    <li>Le droit de vous opposer au traitement de vos données pour des motifs légitimes.</li>
                </ul>
                <p>Pour exercer ces droits, veuillez nous contacter à l'adresse suivante : <strong>www.boombooks1@gmail.com</strong>.</p>
            </section>

        </div>
    );
}

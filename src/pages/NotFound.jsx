import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <main className="page container">
            <div className="empty-state">
                <div style={{ fontSize: 72, fontWeight: 800, color: 'var(--color-primary)', opacity: 0.3 }}>404</div>
                <h2 style={{ fontWeight: 700 }}>Page introuvable</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>La page que vous cherchez n'existe pas.</p>
                <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Retour à l'accueil</Link>
            </div>
        </main>
    );
}

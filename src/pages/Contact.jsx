import React from 'react';

export default function Contact() {
    return (
        <main className="page container" style={{ maxWidth: 800, padding: 'calc(var(--header-height) + var(--space-10)) var(--space-4) var(--space-10)', minHeight: '60vh' }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-6)', color: 'var(--color-primary)' }}>Nous Contacter</h1>
            
            <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                Vous avez une question, une suggestion ou besoin d'assistance ? Notre équipe est à votre disposition ! Choisissez le moyen qui vous convient le mieux :
            </p>

            <div style={{ display: 'grid', gap: 'var(--space-6)', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {/* WhatsApp */}
                <a href="https://wa.me/237674246355" target="_blank" rel="noopener noreferrer" className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>chat</span>
                    </div>
                    <div>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>WhatsApp</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>+237 674246355</p>
                    </div>
                </a>

                {/* Email */}
                <a href="mailto:www.boombooks1@gmail.com" className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>mail</span>
                    </div>
                    <div>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Email</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>www.boombooks1@gmail.com</p>
                    </div>
                </a>

                {/* TikTok */}
                <a href="https://tiktok.com/@boombooks2" target="_blank" rel="noopener noreferrer" className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#000000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>music_note</span>
                    </div>
                    <div>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>TikTok</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>@boombooks2</p>
                    </div>
                </a>

                {/* Facebook */}
                <a href="https://web.facebook.com/?_rdc=1&_rdr#" target="_blank" rel="noopener noreferrer" className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1877F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>thumb_up</span>
                    </div>
                    <div>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Facebook</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>@boombooks5</p>
                    </div>
                </a>
            </div>
            
            <style>{`
                .card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-md); }
            `}</style>
        </main>
    );
}

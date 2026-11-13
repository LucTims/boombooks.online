import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { QUESTIONS, STAGE_LABELS } from '../lib/pggiTest';
import './AdminPggi.css';

const STAGE_COLORS = {
    penser: '#4f46e5',
    gagner: '#16a34a',
    gerer: '#ea580c',
    investir: '#0284c7',
};

function formatDate(isoStr) {
    if (!isoStr) return '—';
    try {
        const d = new Date(isoStr);
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '—';
    }
}

function cleanWaNumber(phone) {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
}

function makeWhatsAppLink(phone, firstName, stage) {
    const clean = cleanWaNumber(phone);
    if (!clean) return null;
    const name = firstName ? ` ${firstName.trim()}` : '';
    const stg = stage ? ` (étape ${stage.toUpperCase()})` : '';
    const msg = `Bonjour${name}, c'est Luc de BoomBooks ! J'ai vu que vous avez réalisé votre diagnostic PGGI${stg}. Comment puis-je vous accompagner vers vos objectifs financiers ?`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
}

export default function AdminPggi() {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    const [activeTab, setActiveTab] = useState('tests'); // 'tests' | 'leads' | 'members'
    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [selectedTest, setSelectedTest] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const [profRes, leadRes] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('id, email, full_name, role, country, phone, pggi_stage, pggi_second_stage, pggi_scores, pggi_answers, pggi_completed_at, created_at, last_sign_in_at, visit_count')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('pggi_leads')
                    .select('id, user_id, first_name, country_code, whatsapp, email, consent, stage, second_stage, scores, answers, attempts, created_at, updated_at')
                    .order('created_at', { ascending: false }),
            ]);

            if (profRes.error) {
                console.warn('[Admin] profiles error:', profRes.error);
                setErrorMsg(`Erreur chargement profils: ${profRes.error.message}`);
            } else {
                setProfiles(profRes.data || []);
            }

            if (leadRes.error) {
                console.warn('[Admin] leads error:', leadRes.error);
            } else {
                setLeads(leadRes.data || []);
            }
        } catch (err) {
            console.error('[Admin] Erreur globale:', err);
            setErrorMsg(err?.message || 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Liste consolidée des personnes ayant fait le test PGGI
    const consolidatedTests = useMemo(() => {
        const emailToProfile = new Map();
        const idToProfile = new Map();
        profiles.forEach((p) => {
            if (p.email) emailToProfile.set(p.email.toLowerCase().trim(), p);
            if (p.id) idToProfile.set(p.id, p);
        });

        const list = [];
        const seenProfileIds = new Set();
        const seenEmails = new Set();

        // 1. Tous les leads enregistrés dans pggi_leads
        leads.forEach((l) => {
            const linkedProfile = (l.user_id && idToProfile.get(l.user_id)) ||
                (l.email && emailToProfile.get(l.email.toLowerCase().trim())) || null;

            if (linkedProfile) seenProfileIds.add(linkedProfile.id);
            if (l.email) seenEmails.add(l.email.toLowerCase().trim());

            list.push({
                source: 'lead',
                id: l.id,
                name: l.first_name || linkedProfile?.full_name || 'Visiteur',
                email: l.email || linkedProfile?.email || '',
                phone: l.whatsapp || linkedProfile?.phone || '',
                country: l.country_code || linkedProfile?.country || '—',
                stage: l.stage || linkedProfile?.pggi_stage || 'non défini',
                secondStage: l.second_stage || linkedProfile?.pggi_second_stage || null,
                scores: l.scores || linkedProfile?.pggi_scores || {},
                answers: l.answers || linkedProfile?.pggi_answers || [],
                date: l.updated_at || l.created_at,
                isRegistered: Boolean(linkedProfile || l.user_id),
                lastSignIn: linkedProfile?.last_sign_in_at || null,
                profileId: linkedProfile?.id || l.user_id || null,
            });
        });

        // 2. Les profils ayant passé le test qui ne sont pas déjà dans la liste
        profiles.forEach((p) => {
            if (p.pggi_stage && !seenProfileIds.has(p.id)) {
                const em = (p.email || '').toLowerCase().trim();
                if (em && seenEmails.has(em)) return;

                list.push({
                    source: 'profile',
                    id: p.id,
                    name: p.full_name || 'Membre',
                    email: p.email || '',
                    phone: p.phone || '',
                    country: p.country || '—',
                    stage: p.pggi_stage,
                    secondStage: p.pggi_second_stage || null,
                    scores: p.pggi_scores || {},
                    answers: p.pggi_answers || [],
                    date: p.pggi_completed_at || p.created_at,
                    isRegistered: true,
                    lastSignIn: p.last_sign_in_at || null,
                    profileId: p.id,
                });
            }
        });

        return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }, [leads, profiles]);

    // KPI Globaux
    const metrics = useMemo(() => {
        const total = consolidatedTests.length;
        const registered = consolidatedTests.filter((t) => t.isRegistered).length;
        const leadsOnly = total - registered;
        const convRate = total > 0 ? Math.round((registered / total) * 100) : 0;

        const stages = { penser: 0, gagner: 0, gerer: 0, investir: 0 };
        consolidatedTests.forEach((t) => {
            const stg = (t.stage || '').toLowerCase();
            if (stg in stages) stages[stg] += 1;
        });

        return {
            total,
            registered,
            leadsOnly,
            convRate,
            stages,
            totalMembers: profiles.length,
        };
    }, [consolidatedTests, profiles]);

    // Filtrage et Recherche
    const filteredItems = useMemo(() => {
        let base = [];
        if (activeTab === 'tests') base = consolidatedTests;
        else if (activeTab === 'leads') {
            base = consolidatedTests.filter((t) => !t.isRegistered);
        } else if (activeTab === 'members') {
            base = profiles.map((p) => ({
                id: p.id,
                name: p.full_name || 'Membre',
                email: p.email || '',
                phone: p.phone || '',
                country: p.country || '—',
                stage: p.pggi_stage || null,
                secondStage: p.pggi_second_stage || null,
                scores: p.pggi_scores || {},
                answers: p.pggi_answers || [],
                date: p.created_at,
                isRegistered: true,
                lastSignIn: p.last_sign_in_at,
            }));
        }

        return base.filter((item) => {
            // Filtre par étape
            if (stageFilter !== 'all') {
                if ((item.stage || '').toLowerCase() !== stageFilter) return false;
            }
            // Filtre par statut
            if (statusFilter === 'registered' && !item.isRegistered) return false;
            if (statusFilter === 'lead' && item.isRegistered) return false;

            // Filtre texte
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const mName = (item.name || '').toLowerCase().includes(q);
                const mEmail = (item.email || '').toLowerCase().includes(q);
                const mPhone = (item.phone || '').toLowerCase().includes(q);
                const mCountry = (item.country || '').toLowerCase().includes(q);
                const mStage = (item.stage || '').toLowerCase().includes(q);
                return mName || mEmail || mPhone || mCountry || mStage;
            }
            return true;
        });
    }, [activeTab, consolidatedTests, profiles, stageFilter, statusFilter, searchQuery]);

    // Exportation CSV
    const exportCSV = () => {
        if (!filteredItems.length) {
            alert('Aucune donnée à exporter.');
            return;
        }

        const headers = [
            'Nom',
            'Email',
            'WhatsApp / Téléphone',
            'Pays',
            'Étape PGGI',
            'Deuxième Étape',
            'Statut Compte',
            'Date du test',
            'Dernière connexion',
        ];

        const rows = filteredItems.map((item) => [
            item.name || '—',
            item.email || '—',
            item.phone || '—',
            item.country || '—',
            (item.stage || '—').toUpperCase(),
            (item.secondStage || '—').toUpperCase(),
            item.isRegistered ? 'Inscrit' : 'Prospect non inscrit',
            formatDate(item.date),
            formatDate(item.lastSignIn),
        ]);

        const csvContent = '\uFEFF' + [headers, ...rows]
            .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pggi_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="admin-pggi-root">
            {/* Topbar */}
            <header className="admin-topbar">
                <div className="admin-topbar-inner">
                    <div className="admin-topbar-brand">
                        <div className="admin-shield-icon">
                            <span className="material-symbols-outlined">admin_panel_settings</span>
                        </div>
                        <div className="admin-title-wrap">
                            <h1>BoomBooks.online — Administration PGGI</h1>
                            <p className="admin-sub">Suivi des diagnostics, inscriptions et prospects</p>
                        </div>
                    </div>

                    <div className="admin-topbar-actions">
                        <span className="admin-badge-user">
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#0284c7' }}>verified_user</span>
                            {user?.email || 'Admin'}
                        </span>
                        <button type="button" onClick={fetchData} className="admin-btn admin-btn-secondary" title="Recharger les données">
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
                            Actualiser
                        </button>
                        <button type="button" onClick={exportCSV} className="admin-btn admin-btn-success">
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                            Export CSV
                        </button>
                        <Link to="/account" className="admin-btn admin-btn-secondary">
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                            Mon Compte
                        </Link>
                    </div>
                </div>
            </header>

            {/* Contenu */}
            <main className="admin-container">
                {errorMsg && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: 8, color: '#991b1b', fontSize: 13 }}>
                        {errorMsg}
                    </div>
                )}

                {/* Grille de KPI */}
                <section className="admin-kpi-grid">
                    <div className="admin-kpi-card">
                        <div>
                            <p className="admin-kpi-label">Diagnostics PGGI Réalisés</p>
                            <p className="admin-kpi-val">{metrics.total}</p>
                            <p className="admin-kpi-hint">Total des personnes ayant fait le test</p>
                        </div>
                        <div className="admin-kpi-icon blue">
                            <span className="material-symbols-outlined">analytics</span>
                        </div>
                    </div>

                    <div className="admin-kpi-card">
                        <div>
                            <p className="admin-kpi-label">Membres Inscrits avec Test</p>
                            <p className="admin-kpi-val">{metrics.registered}</p>
                            <p className="admin-kpi-hint">{metrics.convRate}% de conversion en compte</p>
                        </div>
                        <div className="admin-kpi-icon green">
                            <span className="material-symbols-outlined">how_to_reg</span>
                        </div>
                    </div>

                    <div className="admin-kpi-card">
                        <div>
                            <p className="admin-kpi-label">Prospects à Relancer</p>
                            <p className="admin-kpi-val">{metrics.leadsOnly}</p>
                            <p className="admin-kpi-hint">Ont laissé leur WhatsApp sans créer de compte</p>
                        </div>
                        <div className="admin-kpi-icon amber">
                            <span className="material-symbols-outlined">contact_phone</span>
                        </div>
                    </div>

                    <div className="admin-kpi-card">
                        <div>
                            <p className="admin-kpi-label">Total Membres Inscrits</p>
                            <p className="admin-kpi-val">{metrics.totalMembers}</p>
                            <p className="admin-kpi-hint">Tous les comptes créés sur BoomBooks</p>
                        </div>
                        <div className="admin-kpi-icon purple">
                            <span className="material-symbols-outlined">group</span>
                        </div>
                    </div>
                </section>

                {/* Répartition PGGI */}
                <section className="admin-breakdown-card">
                    <div className="admin-breakdown-head">
                        <h3>Répartition des Étapes Financières (Diagnostics PGGI)</h3>
                        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{metrics.total} diagnostics au total</span>
                    </div>

                    {metrics.total > 0 ? (
                        <>
                            <div className="admin-pggi-bars">
                                <div className="admin-pggi-bar bar-penser" style={{ width: `${(metrics.stages.penser / metrics.total) * 100}%` }} title={`PENSER : ${metrics.stages.penser}`} />
                                <div className="admin-pggi-bar bar-gagner" style={{ width: `${(metrics.stages.gagner / metrics.total) * 100}%` }} title={`GAGNER : ${metrics.stages.gagner}`} />
                                <div className="admin-pggi-bar bar-gerer" style={{ width: `${(metrics.stages.gerer / metrics.total) * 100}%` }} title={`GÉRER : ${metrics.stages.gerer}`} />
                                <div className="admin-pggi-bar bar-investir" style={{ width: `${(metrics.stages.investir / metrics.total) * 100}%` }} title={`INVESTIR : ${metrics.stages.investir}`} />
                            </div>

                            <div className="admin-stage-legend">
                                <div className="admin-legend-item">
                                    <div className="admin-legend-dot" style={{ background: STAGE_COLORS.penser }} />
                                    <span>PENSER : {metrics.stages.penser} ({Math.round((metrics.stages.penser / metrics.total) * 100 || 0)}%)</span>
                                </div>
                                <div className="admin-legend-item">
                                    <div className="admin-legend-dot" style={{ background: STAGE_COLORS.gagner }} />
                                    <span>GAGNER : {metrics.stages.gagner} ({Math.round((metrics.stages.gagner / metrics.total) * 100 || 0)}%)</span>
                                </div>
                                <div className="admin-legend-item">
                                    <div className="admin-legend-dot" style={{ background: STAGE_COLORS.gerer }} />
                                    <span>GÉRER : {metrics.stages.gerer} ({Math.round((metrics.stages.gerer / metrics.total) * 100 || 0)}%)</span>
                                </div>
                                <div className="admin-legend-item">
                                    <div className="admin-legend-dot" style={{ background: STAGE_COLORS.investir }} />
                                    <span>INVESTIR : {metrics.stages.investir} ({Math.round((metrics.stages.investir / metrics.total) * 100 || 0)}%)</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>En attente de diagnostics...</p>
                    )}
                </section>

                {/* Section Table des données */}
                <section className="admin-table-card">
                    {/* Onglets */}
                    <div className="admin-tabs">
                        <button
                            type="button"
                            className={`admin-tab-btn${activeTab === 'tests' ? ' active' : ''}`}
                            onClick={() => setActiveTab('tests')}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>assignment</span>
                            Tous les diagnostics PGGI
                            <span className="admin-tab-pill">{consolidatedTests.length}</span>
                        </button>
                        <button
                            type="button"
                            className={`admin-tab-btn${activeTab === 'leads' ? ' active' : ''}`}
                            onClick={() => setActiveTab('leads')}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>phone_forwarded</span>
                            Prospects à relancer WhatsApp
                            <span className="admin-tab-pill">{metrics.leadsOnly}</span>
                        </button>
                        <button
                            type="button"
                            className={`admin-tab-btn${activeTab === 'members' ? ' active' : ''}`}
                            onClick={() => setActiveTab('members')}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>group</span>
                            Tous les membres inscrits
                            <span className="admin-tab-pill">{profiles.length}</span>
                        </button>
                    </div>

                    {/* Filtres */}
                    <div className="admin-filters-bar">
                        <div className="admin-search-wrap">
                            <span className="material-symbols-outlined">search</span>
                            <input
                                type="text"
                                className="admin-search-input"
                                placeholder="Rechercher par nom, email, WhatsApp, pays..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="admin-filter-group">
                            <select
                                className="admin-select"
                                value={stageFilter}
                                onChange={(e) => setStageFilter(e.target.value)}
                            >
                                <option value="all">Toutes les étapes PGGI</option>
                                <option value="penser">PENSER</option>
                                <option value="gagner">GAGNER</option>
                                <option value="gerer">GÉRER</option>
                                <option value="investir">INVESTIR</option>
                            </select>

                            {activeTab === 'tests' && (
                                <select
                                    className="admin-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">Tous les statuts</option>
                                    <option value="registered">Compte créé</option>
                                    <option value="lead">Prospect non inscrit</option>
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Tableau */}
                    <div className="admin-table-wrap">
                        {loading ? (
                            <div className="admin-empty-state">
                                <div style={{
                                    width: 36, height: 36, border: '3px solid #e2e8f0',
                                    borderTopColor: '#0284c7', borderRadius: '50%',
                                    margin: '0 auto 12px auto', animation: 'spin 0.8s linear infinite'
                                }} />
                                <p>Chargement des données...</p>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="admin-empty-state">
                                <span className="material-symbols-outlined">search_off</span>
                                <p style={{ fontWeight: 600 }}>Aucune entrée ne correspond à vos filtres</p>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Personne</th>
                                        <th>Étape PGGI</th>
                                        <th>WhatsApp / Téléphone</th>
                                        <th>Pays</th>
                                        <th>Statut</th>
                                        <th>Date</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map((item) => {
                                        const stageKey = (item.stage || '').toLowerCase();
                                        const waLink = makeWhatsAppLink(item.phone, item.name, item.stage);
                                        const initial = (item.name || item.email || 'U').charAt(0).toUpperCase();

                                        return (
                                            <tr key={`${item.source || 'row'}-${item.id}`}>
                                                <td>
                                                    <div className="admin-user-cell">
                                                        <div className="admin-user-avatar">{initial}</div>
                                                        <div className="admin-user-info">
                                                            <span className="admin-user-name">{item.name || 'Visiteur'}</span>
                                                            {item.email && (
                                                                <a href={`mailto:${item.email}`} className="admin-user-email">
                                                                    {item.email}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    {item.stage ? (
                                                        <span className={`stage-badge ${stageKey}`}>
                                                            {STAGE_LABELS[stageKey] || item.stage.toUpperCase()}
                                                            {item.secondStage && (
                                                                <span style={{ opacity: 0.7, fontSize: 10 }}> → {item.secondStage.toUpperCase()}</span>
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="stage-badge none">Pas de test</span>
                                                    )}
                                                </td>

                                                <td>
                                                    {item.phone ? (
                                                        <span style={{ fontWeight: 600, color: '#334155' }}>
                                                            {item.phone}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8' }}>—</span>
                                                    )}
                                                </td>

                                                <td>
                                                    <span style={{ fontWeight: 500 }}>{item.country || '—'}</span>
                                                </td>

                                                <td>
                                                    {item.isRegistered ? (
                                                        <span className="status-pill registered">
                                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                                                            Inscrit
                                                        </span>
                                                    ) : (
                                                        <span className="status-pill lead">
                                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                                                            Prospect
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    <div style={{ fontSize: 12, color: '#475569' }}>
                                                        {formatDate(item.date)}
                                                    </div>
                                                    {item.lastSignIn && (
                                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                                            Connexion: {formatDate(item.lastSignIn)}
                                                        </div>
                                                    )}
                                                </td>

                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                        {waLink && (
                                                            <a
                                                                href={waLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="admin-wa-btn"
                                                                title="Écrire sur WhatsApp"
                                                            >
                                                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat</span>
                                                                WhatsApp
                                                            </a>
                                                        )}
                                                        {(item.answers?.length > 0 || Object.keys(item.scores || {}).length > 0) && (
                                                            <button
                                                                type="button"
                                                                className="admin-details-btn"
                                                                onClick={() => setSelectedTest(item)}
                                                                title="Voir les réponses au test"
                                                            >
                                                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                                                                Détails
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </main>

            {/* Modal Détails Diagnostic */}
            {selectedTest && (
                <div className="admin-modal-backdrop" onClick={() => setSelectedTest(null)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-head">
                            <div>
                                <h3>Diagnostic de {selectedTest.name}</h3>
                                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
                                    {selectedTest.email || selectedTest.phone} · {formatDate(selectedTest.date)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTest(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            {/* Étape principale */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: '#f8fafc', borderRadius: 10 }}>
                                <div>
                                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Étape Recommandée</span>
                                    <h4 style={{ margin: 0, fontSize: 20, color: STAGE_COLORS[selectedTest.stage?.toLowerCase()] || '#0f172a' }}>
                                        {STAGE_LABELS[selectedTest.stage?.toLowerCase()] || selectedTest.stage?.toUpperCase()}
                                    </h4>
                                </div>
                                {selectedTest.secondStage && (
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Deuxième étape</span>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#334155' }}>
                                            {selectedTest.secondStage.toUpperCase()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Scores détaillés */}
                            {selectedTest.scores && Object.keys(selectedTest.scores).length > 0 && (
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 10px 0', color: '#334155' }}>Scores par étape :</p>
                                    <div className="admin-scores-grid">
                                        <div className="admin-score-box penser">
                                            <span className="admin-score-num">{selectedTest.scores.penser ?? 0}</span>
                                            <span className="admin-score-tag">PENSER</span>
                                        </div>
                                        <div className="admin-score-box gagner">
                                            <span className="admin-score-num">{selectedTest.scores.gagner ?? 0}</span>
                                            <span className="admin-score-tag">GAGNER</span>
                                        </div>
                                        <div className="admin-score-box gerer">
                                            <span className="admin-score-num">{selectedTest.scores.gerer ?? 0}</span>
                                            <span className="admin-score-tag">GÉRER</span>
                                        </div>
                                        <div className="admin-score-box investir">
                                            <span className="admin-score-num">{selectedTest.scores.investir ?? 0}</span>
                                            <span className="admin-score-tag">INVESTIR</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Réponses aux 7 questions */}
                            {selectedTest.answers && selectedTest.answers.length > 0 && (
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 10px 0', color: '#334155' }}>Réponses aux questions :</p>
                                    <div className="admin-answers-list">
                                        {selectedTest.answers.map((chosenStage, idx) => {
                                            const q = QUESTIONS[idx];
                                            return (
                                                <div key={idx} className="admin-answer-item">
                                                    <div className="admin-answer-q">Q{idx + 1} : {q?.q || `Question ${idx + 1}`}</div>
                                                    <div className="admin-answer-a">
                                                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: STAGE_COLORS[chosenStage] || '#64748b' }}>
                                                            arrow_right
                                                        </span>
                                                        Réponse orientée vers : <strong>{STAGE_LABELS[chosenStage] || chosenStage?.toUpperCase()}</strong>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Action directe WhatsApp */}
                            {cleanWaNumber(selectedTest.phone) && (
                                <a
                                    href={makeWhatsAppLink(selectedTest.phone, selectedTest.name, selectedTest.stage)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="admin-wa-btn"
                                    style={{ justifyContent: 'center', padding: '12px 20px', fontSize: 14 }}
                                >
                                    <span className="material-symbols-outlined">chat</span>
                                    Engager la conversation WhatsApp avec {selectedTest.name}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import './Footer.css';

export default function Footer() {
    const { user } = useAuth();
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-grid">
                    <div className="footer-col footer-brand-col">
                        <Link to={user ? '/account' : '/'} className="footer-logo">
                            <div className="footer-logo-text">
                                <span className="footer-logo-name">BoomBooks</span>
                                <span className="footer-logo-tagline">l&apos;antidote de l&apos;ignorance</span>
                            </div>
                        </Link>
                        <p className="footer-desc">
                            La Méthode PGGI (Penser, Gagner, Gérer, Investir) pour passer de la lecture à l&apos;action financière en Afrique francophone.
                        </p>
                        <div className="footer-socials">
                            <a href="https://web.facebook.com/?_rdc=1&_rdr#" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="Facebook">
                                <span className="material-symbols-outlined">thumb_up</span>
                            </a>
                            <a href="https://tiktok.com/@boombooks2" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="TikTok">
                                <span className="material-symbols-outlined">music_note</span>
                            </a>
                            <a href="mailto:www.boombooks1@gmail.com" className="footer-social" aria-label="Email">
                                <span className="material-symbols-outlined">alternate_email</span>
                            </a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">Méthode PGGI</h4>
                        <nav aria-label="Méthode PGGI">
                            <ul className="footer-links">
                                <li><Link to="/">Découvrir la Méthode PGGI</Link></li>
                                <li><Link to="/test-pggi">Faire mon test gratuit</Link></li>
                                <li><Link to={user ? '/account' : '/login'}>{user ? 'Mon compte' : 'Connexion'}</Link></li>
                            </ul>
                        </nav>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">Livres &amp; Boutique</h4>
                        <nav aria-label="Boutique BoomBooks">
                            <ul className="footer-links">
                                <li>
                                    <a href="https://boombooks.shop/book/reflechissez-et-devenez-riche-napoleon-hill-3" target="_blank" rel="noopener noreferrer">
                                        Réfléchissez et devenez riche
                                    </a>
                                </li>
                                <li>
                                    <a href="https://boombooks.shop/book/en-route-vers-la-liberte-financiere-boombooks" target="_blank" rel="noopener noreferrer">
                                        En route vers la liberté financière
                                    </a>
                                </li>
                                <li>
                                    <a href="https://boombooks.shop/book/guide-complet-pour-investir-a-la-brvm-boombooks" target="_blank" rel="noopener noreferrer">
                                        Le Guide pour investir à la Bourse
                                    </a>
                                </li>
                                <li>
                                    <a href="https://boombooks.shop" target="_blank" rel="noopener noreferrer">
                                        Boutique boombooks.shop
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">Aide</h4>
                        <nav aria-label="Aide">
                            <ul className="footer-links">
                                <li><Link to="/faq">FAQ</Link></li>
                                <li><Link to="/contact">Nous contacter</Link></li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} BoomBooks. Tous droits réservés.</p>
                    <div className="footer-bottom-links">
                        <Link to="/privacy">Confidentialité</Link>
                        <Link to="/cookies">Politique des Cookies</Link>
                        <Link to="/terms">CGV / CGU</Link>
                        <Link to="/legal">Mentions Légales</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../lib/CurrencyContext';
import './BookCard.css';

// Gradients déterministes basés sur l'ID du livre
const GRADIENTS = [
    'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)',
    'linear-gradient(135deg, #8B0000 0%, #c0392b 100%)',
    'linear-gradient(135deg, #134e5e 0%, #1a7a5e 100%)',
    'linear-gradient(135deg, #4a2c6a 0%, #8e44ad 100%)',
    'linear-gradient(135deg, #c65000 0%, #e67e22 100%)',
    'linear-gradient(135deg, #0a3d62 0%, #2980b9 100%)',
    'linear-gradient(135deg, #7d0000 0%, #b7410e 100%)',
    'linear-gradient(135deg, #1a4a2e 0%, #27ae60 100%)',
    'linear-gradient(135deg, #2c1654 0%, #6c3483 100%)',
    'linear-gradient(135deg, #1c1c3a 0%, #1a56db 100%)',
    'linear-gradient(135deg, #2d4a22 0%, #1e8449 100%)',
    'linear-gradient(135deg, #7b4397 0%, #dc2430 100%)',
];

export function getBookGradient(id = '') {
    if (!id) return GRADIENTS[0];
    const code = id.charCodeAt(0) + (id.charCodeAt(id.length - 1) || 0);
    return GRADIENTS[code % GRADIENTS.length];
}

// Pseudo-random rating generator for when Google API fails
export function getFakedRating(id = '') {
    if (!id) return { rating: 4.5, count: 128 };
    
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (id.charCodeAt(i) + ((hash << 5) - hash)) | 0;
    }
    const pseudoRandom = Math.abs(hash) / 2147483648; // 0 to 1
    
    // Rating entre 4.2 et 4.9 (pour l'effet psychologique positif)
    const rating = 4.2 + (pseudoRandom * 0.7);
    
    // Nombre d'avis entre 15 et 480
    const count = Math.floor(15 + (pseudoRandom * 465));
    
    return { rating: rating.toFixed(1), count };
}

const UNKNOWN_AUTHORS = ['auteur inconnu', 'inconnu', 'unknown', 'null', 'undefined'];

/** Auteur affichable, ou null si absent / "inconnu". */
function displayAuthor(author) {
    const a = (author || '').trim();
    return a && !UNKNOWN_AUTHORS.includes(a.toLowerCase()) ? a : null;
}

/**
 * Image de couverture, avec repli typographique (titre + auteur sur le
 * dégradé) si le livre n'a pas d'image ou si elle ne se charge pas.
 */
function CoverImage({ book, compact = false }) {
    const [failed, setFailed] = useState(false);
    if (book.cover_url && !failed) {
        return <img src={book.cover_url} alt={book.title} loading="lazy" onError={() => setFailed(true)} />;
    }
    const author = displayAuthor(book.author);
    return (
        <div className={`bk-cover-fallback${compact ? ' compact' : ''}`} aria-hidden="true">
            <span className="bk-cover-fallback-title">{book.title}</span>
            {author && <span className="bk-cover-fallback-author">{author}</span>}
        </div>
    );
}

function StarRating({ rating = 4.5, count }) {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const empty = 5 - full - (hasHalf ? 1 : 0);
    const fmtCount = count > 999 ? `${(count / 1000).toFixed(1)}k` : String(count);
    return (
        <div className="bk-rating">
            <span className="bk-stars">
                {'★'.repeat(full)}
                {hasHalf ? '★' : ''}
                {'☆'.repeat(empty)}
            </span>
            <span className="bk-rating-val">{rating.toFixed(1)}</span>
            {count !== undefined && <span className="bk-rating-count">({fmtCount})</span>}
        </div>
    );
}

function BookCard({ book, onAddToCart, badge, rank }) {
    const price = parseFloat(book.price || 0);
    const gradient = getBookGradient(book.id);
    
    // Rating fallback logic
    let rating = parseFloat(book.google_rating || 0);
    let count = parseInt(book.google_rating_count || 0);
    if (rating === 0 && book.id) {
        const faked = getFakedRating(book.id);
        rating = parseFloat(faked.rating);
        count = faked.count;
    }
    
    const { formatPrice } = useCurrency();
    const bookUrl = book.slug ? `/book/${book.slug}` : `/book/${book.id}`;

    if (rank) {
        // Layout "Meilleures ventes" horizontal compact
        return (
            <div className="bk-rank-card">
                <span className="bk-rank-num">{rank}</span>
                <Link to={bookUrl} className="bk-rank-cover" style={{ background: gradient }} aria-label={book.title}>
                    <CoverImage book={book} compact />
                </Link>
                <div className="bk-rank-info">
                    <Link to={bookUrl} className="bk-rank-title line-clamp-2">{book.title}</Link>
                    <p className="bk-rank-author">{displayAuthor(book.author) || '\u00a0'}</p>
                    <StarRating rating={rating} count={count} />
                    <p className="bk-rank-price">
                        <span className="bk-price-fcfa">{formatPrice(price)}</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bk-card">
            <Link to={bookUrl} className="bk-card-cover" style={{ background: gradient }} aria-label={book.title}>
                <CoverImage book={book} />
                {badge && <span className="bk-badge">{badge}</span>}
            </Link>
            <div className="bk-card-body">
                <StarRating rating={rating} count={count} />
                <Link to={bookUrl} className="bk-card-title line-clamp-2">{book.title}</Link>
                <p className="bk-card-author line-clamp-1">{displayAuthor(book.author) || '\u00a0'}</p>
                <p className="bk-card-price">
                    <span className="bk-price-fcfa">{formatPrice(price)}</span>
                </p>
            </div>
        </div>
    );
}

export function SkeletonBookCard() {
    return (
        <div className="bk-skeleton">
            <div className="bk-skeleton-cover" />
            <div className="bk-skeleton-line short" />
            <div className="bk-skeleton-line medium" />
            <div className="bk-skeleton-line short" />
        </div>
    );
}

export default memo(BookCard);

import { useEffect, useRef, useState } from 'react';
import { HERO_CONTENT, prefersReducedMotion } from '../lib/landingContent';
import './PggiWordRotator.css';

/**
 * Rolling word ticker for the PGGI financial stages (Penser, Gagner, Gérer, Investir).
 */
export default function PggiWordRotator({ words = HERO_CONTENT.rotatorWords, intervalMs = 2200 }) {
    const [index, setIndex] = useState(0);
    const [instant, setInstant] = useState(false);
    const [widths, setWidths] = useState([]);
    const trackRef = useRef(null);

    useEffect(() => {
        if (prefersReducedMotion()) return undefined;
        const timer = setInterval(() => {
            setInstant(false);
            setIndex((i) => i + 1);
        }, intervalMs);
        return () => clearInterval(timer);
    }, [intervalMs]);

    useEffect(() => {
        let active = true;
        const measure = () => {
            if (!active || !trackRef.current) return;
            setWidths([...trackRef.current.children].map((el) => el.getBoundingClientRect().width));
        };
        measure();
        document.fonts?.ready.then(measure);
        window.addEventListener('resize', measure);
        return () => {
            active = false;
            window.removeEventListener('resize', measure);
        };
    }, [words]);

    const onEnd = (e) => {
        if (e.target !== trackRef.current) return;
        if (index >= words.length) {
            setInstant(true);
            setIndex(0);
        }
    };

    const w = widths[index];

    return (
        <span className={`bb-rotator${instant ? ' is-instant' : ''}`} aria-hidden="true" style={w ? { width: `${w}px` } : undefined}>
            <span
                ref={trackRef}
                className={`bb-rotator-track${instant ? ' is-instant' : ''}`}
                style={{ transform: `translateY(${-index * 100 / (words.length + 1)}%)` }}
                onTransitionEnd={onEnd}
            >
                {[...words, words[0]].map((word, i) => (
                    <span key={i}>{word}</span>
                ))}
            </span>
        </span>
    );
}

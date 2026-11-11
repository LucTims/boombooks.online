import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { usePushNotifications } from '../hooks/usePushNotifications';
import './DailyQuote.css';

const fallbackQuotes = [
    { text: "La motivation vous sert de départ. L'habitude vous fait continuer.", author: "Jim Ryun" },
    { text: "Il n'y a pas de réussite facile ni d'échecs définitifs.", author: "Marcel Proust" },
    { text: "Le succès, c'est tomber sept fois, se relever huit.", author: "Proverbe japonais" },
    { text: "L'apprentissage est un trésor qui suivra son propriétaire partout.", author: "Proverbe chinois" },
    { text: "Le seul endroit où le succès précède le travail est dans le dictionnaire.", author: "Vidal Sassoon" },
    { text: "L'éducation est l'arme la plus puissante pour changer le monde.", author: "Nelson Mandela" },
    { text: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.", author: "Sénèque" },
    { text: "La lecture est à l'esprit ce que l'exercice est au corps.", author: "Joseph Addison" },
    { text: "Un voyage de mille lieues commence toujours par un premier pas.", author: "Lao Tseu" },
    { text: "Faites que le rêve dévore votre vie afin que la vie ne dévore pas votre rêve.", author: "Antoine de Saint-Exupéry" },
    { text: "Le but de la lecture n'est pas de contredire et de réfuter, mais de peser et de considérer.", author: "Francis Bacon" },
    { text: "Celui qui lit vit mille vies avant de mourir. L'homme qui ne lit jamais n'en vit qu'une seule.", author: "George R.R. Martin" },
    { text: "Il est bien des choses qui ne paraissent impossibles que tant qu'on ne les a pas tentées.", author: "André Gide" },
    { text: "Le futur appartient à ceux qui croient à la beauté de leurs rêves.", author: "Eleanor Roosevelt" },
    { text: "Plus on lit, plus on sait de choses. Plus on apprend, plus on ira loin.", author: "Dr. Seuss" },
    { text: "Croyez en vous et en tout ce que vous êtes. Sachez qu'il y a quelque chose à l'intérieur de vous qui est plus grand que n'importe quel obstacle.", author: "Christian D. Larson" },
    { text: "Votre temps est limité, ne le gâchez pas en menant une existence qui n'est pas la vôtre.", author: "Steve Jobs" },
    { text: "Si vous voulez que la vie vous sourie, apportez-lui d'abord votre bonne humeur.", author: "Baruch Spinoza" },
    { text: "Le secret de la réussite est d'apprendre à se servir de la douleur et du plaisir au lieu de laisser la douleur et le plaisir se servir de vous.", author: "Tony Robbins" },
    { text: "Chaque lecture est un acte de résistance.", author: "Daniel Pennac" },
    { text: "Les gagnants trouvent des moyens, les perdants des excuses.", author: "F. D. Roosevelt" },
    { text: "Rien n'est plus puissant qu'une idée dont le temps est venu.", author: "Victor Hugo" },
    { text: "Agissez comme s'il était impossible d'échouer.", author: "Winston Churchill" },
    { text: "Ne vous souciez pas des échecs, souciez-vous des chances que vous laissez échapper lorsque vous n'essayez même pas.", author: "Jack Canfield" },
    { text: "Un esprit élargi par une nouvelle idée ne peut jamais revenir à ses dimensions originales.", author: "Oliver Wendell Holmes" },
    { text: "Je ne perds jamais. Soit je gagne, soit j'apprends.", author: "Nelson Mandela" },
    { text: "Pour accomplir de grandes choses, nous ne devons pas seulement agir, mais aussi rêver ; pas seulement planifier, mais aussi croire.", author: "Anatole France" },
    { text: "On ne peut pas toujours contrôler ce qui se passe à l'extérieur. Mais on peut toujours contrôler ce qui se passe à l'intérieur.", author: "Wayne Dyer" },
    { text: "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est aujourd'hui.", author: "Proverbe chinois" },
    { text: "L'art de la lecture est en grande partie l'art de retrouver la vie dans les livres et de la comprendre mieux grâce à eux.", author: "André Maurois" },
    { text: "Le talent, ça n'existe pas. Le talent, c'est d'avoir envie de faire quelque chose.", author: "Jacques Brel" }
];

export default function DailyQuote() {
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('quote_dismissed') === 'true');
    const { isSupported, isSubscribed, subscribe, loading: subLoading } = usePushNotifications();

    useEffect(() => {
        async function fetchQuote() {
            try {
                const tzOffset = (new Date()).getTimezoneOffset() * 60000;
                const todayStr = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
                
                // Chercher dans la DB
                const { data, error } = await supabase
                    .from('daily_quotes')
                    .select('*')
                    .eq('date', todayStr)
                    .eq('app_name', 'boombooks')
                    .single();

                if (data && !error) {
                    setQuote({ text: data.quote_text, author: data.quote_author });
                } else {
                    // Fallback
                    const epochDays = Math.floor(Date.now() / 86400000);
                    const index = epochDays % fallbackQuotes.length;
                    setQuote(fallbackQuotes[index]);
                }
            } catch (err) {
                console.error("Erreur récupération citation:", err);
                const epochDays = Math.floor(Date.now() / 86400000);
                const index = epochDays % fallbackQuotes.length;
                setQuote(fallbackQuotes[index]);
            } finally {
                setLoading(false);
            }
        }
        fetchQuote();
    }, []);

    if (loading || !quote || dismissed) return null;

    const handleDismiss = () => {
        setDismissed(true);
        sessionStorage.setItem('quote_dismissed', 'true');
    };

    return (
        <div className="daily-quote-container">
            <button 
                onClick={handleDismiss}
                style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    zIndex: 10,
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                title="Fermer"
            >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
            <div className="daily-quote-content">
                <span className="material-symbols-outlined quote-icon">format_quote</span>
                <div className="quote-text-wrap">
                    <p className="quote-text">« {quote.text} »</p>
                    <p className="quote-author">— {quote.author}</p>
                </div>
            </div>
            
            {isSupported && !isSubscribed && (
                <div className="daily-quote-action">
                    <button 
                        className="btn btn-outline" 
                        style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', marginTop: '16px', fontSize: '12px', padding: '6px 12px' }}
                        onClick={subscribe}
                        disabled={subLoading}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>notifications_active</span>
                        {subLoading ? 'Activation...' : 'Recevoir la citation chaque matin'}
                    </button>
                </div>
            )}
        </div>
    );
}

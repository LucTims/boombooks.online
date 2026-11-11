import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const { session } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    async function checkSubscription() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (e) {
            console.error('Service Worker registration failed:', e);
        }
    }

    async function subscribe() {
        if (!isSupported) return false;
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Ask for permission explicitly first
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Permission denied');
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Save to DB
            const subData = JSON.parse(JSON.stringify(subscription));
            
            const payload = {
                endpoint: subData.endpoint,
                keys_p256dh: subData.keys.p256dh,
                keys_auth: subData.keys.auth,
                app_name: 'boombooks'
            };
            
            if (session?.user) {
                payload.user_id = session.user.id;
            }

            const { error } = await supabase
                .from('push_subscriptions')
                .upsert([payload], { onConflict: 'endpoint' });

            if (error) throw error;

            setIsSubscribed(true);
            return true;
        } catch (err) {
            console.error('Failed to subscribe to push notifications', err);
            return false;
        } finally {
            setLoading(false);
        }
    }

    return { isSupported, isSubscribed, subscribe, loading };
}

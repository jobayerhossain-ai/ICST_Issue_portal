import api from './api';
import { toast } from 'sonner';

// Check if push notifications are supported and why if not
export function getPushSupportStatus(): { supported: boolean; reason?: string } {
    const hasSW = 'serviceWorker' in navigator;
    const hasPush = 'PushManager' in window;
    const hasNotification = 'Notification' in window;

    if (hasSW && hasPush && hasNotification) {
        return { supported: true };
    }

    // iOS Safari specific check
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !hasPush) {
        return {
            supported: false,
            reason: 'iOS-PWA-REQUIRED'
        };
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return { supported: false, reason: 'HTTPS-REQUIRED' };
    }

    return { supported: false, reason: 'NOT-SUPPORTED' };
}

// Register Service Worker and subscribe to push notifications
export async function registerPushNotifications(): Promise<boolean> {
    const support = getPushSupportStatus();

    if (!support.supported) {
        console.warn('Push support check failed:', support.reason);

        // Only toast if it's a known issue we can help the user with
        if (support.reason === 'HTTPS-REQUIRED') {
            toast.error('Security Restriction', {
                description: 'Push notifications require HTTPS. Please use a secure connection.'
            });
        } else if (support.reason === 'iOS-PWA-REQUIRED') {
            toast.info('Setup Required', {
                description: 'To receive notifications on iPhone, tap "Share" and select "Add to Home Screen".'
            });
        } else {
            console.log('Push notifications not supported by this browser.');
        }
        return false;
    }

    try {
        // 1. Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // 2. Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return false;
        }

        // 3. Get VAPID public key
        const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!publicKey) {
            console.error('VITE_VAPID_PUBLIC_KEY is not defined in frontend .env');
            return false;
        }

        // 4. Subscribe to push
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
        });

        // 5. Send subscription to backend
        const subJSON = subscription.toJSON();
        await api.post('/user/push/subscribe', {
            subscription: {
                endpoint: subJSON.endpoint,
                keys: subJSON.keys
            }
        });

        console.log('✅ Push notifications subscribed');
        return true;
    } catch (err) {
        console.error('Push subscription error:', err);
        return false;
    }
}

// Unsubscribe from push notifications
export async function unregisterPushNotifications(): Promise<void> {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await api.post('/user/push/unsubscribe', {
                    endpoint: subscription.endpoint
                });
                await subscription.unsubscribe();
            }
        }
    } catch (err) {
        console.error('Push unsubscribe error:', err);
    }
}

// Check if already subscribed
export async function isPushSubscribed(): Promise<boolean> {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return false;
        const subscription = await registration.pushManager.getSubscription();
        return !!subscription;
    } catch {
        return false;
    }
}

// Helper: Convert VAPID key from base64 URL to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

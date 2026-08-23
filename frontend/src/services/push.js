/**
 * Push notification registration utilities.
 * Uses the native Web Push API with VAPID keys.
 */

import { notificationService } from './api';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/**
 * Convert a base64url VAPID key to a Uint8Array for pushManager.subscribe.
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Register the service worker. Returns the ServiceWorkerRegistration.
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers not supported.');
  }
  return navigator.serviceWorker.register('/sw.js');
}

/**
 * Subscribe to push notifications and register with backend.
 * Returns the PushSubscription backend record.
 */
export async function subscribeToPush(registration) {
  if (!VAPID_PUBLIC_KEY) {
    throw new Error('VAPID public key not configured.');
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  const json = subscription.toJSON();
  return notificationService.registerSubscription({
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  });
}

/**
 * Unsubscribe from push and delete from backend.
 */
export async function unsubscribeFromPush(registration) {
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }
}

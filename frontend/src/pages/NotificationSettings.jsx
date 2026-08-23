import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, Loader2 } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { notificationService } from '../services/api';
import { registerServiceWorker, subscribeToPush } from '../services/push';

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-card-sm shadow-lg border ${
        isError ? 'bg-status-refunded border-border text-ink' : 'bg-status-released border-border text-ink'
      }`}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm">{toast.message}</span>
        <button onClick={onClose} className="ml-2 text-fog hover:text-ink">×</button>
      </div>
    </motion.div>
  );
}

export default function NotificationSettings() {
  const { address } = useWallet();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [emailEnabled, setEmailEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [pushDenied, setPushDenied] = useState(false);
  const [pushSupported] = useState('PushManager' in window && 'serviceWorker' in navigator);

  useEffect(() => {
    if (!address) return;
    notificationService.getPreferences()
      .then((prefs) => {
        setEmailEnabled(prefs.email_enabled);
        setPushEnabled(prefs.push_enabled);
        setEmailAddress(prefs.email_address || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [address]);

  const handlePushToggle = async (enabled) => {
    if (enabled && pushSupported) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushDenied(true);
        return;
      }
      setPushDenied(false);
      try {
        const registration = await registerServiceWorker();
        await subscribeToPush(registration);
      } catch (e) {
        setToast({ type: 'error', message: 'Failed to register push notifications.' });
        return;
      }
    }
    setPushEnabled(enabled);
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      await notificationService.savePreferences({
        email_enabled: emailEnabled,
        push_enabled: pushEnabled,
        email_address: emailAddress || null,
      });
      setToast({ type: 'success', message: 'Preferences saved.' });
    } catch (e) {
      const detail = e.response?.data?.detail || 'Failed to save preferences.';
      setToast({ type: 'error', message: detail });
    } finally {
      setSaving(false);
    }
  };

  if (!address) {
    return (
      <div className="max-w-page mx-auto px-6 py-24 text-center">
        <p className="text-graphite">Connect your wallet to manage notification preferences.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-page mx-auto px-6 py-24 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <h1 className="text-heading font-medium text-ink mb-2 flex items-center gap-2">
        <Bell className="w-6 h-6 text-accent" /> Notification Settings
      </h1>
      <p className="text-sm text-graphite mb-8">Choose how you'd like to be notified about commission updates.</p>

      <div className="space-y-6">
        {/* Email */}
        <div className="p-5 rounded-card bg-surface border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-fog" />
              <span className="font-medium text-ink">Email Notifications</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={emailEnabled}
              onClick={() => setEmailEnabled(!emailEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailEnabled ? 'bg-accent' : 'bg-fog/30'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          {emailEnabled && (
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-canvas border border-border rounded-input text-sm text-ink focus:border-accent outline-none"
            />
          )}
        </div>

        {/* Push */}
        {pushSupported && (
          <div className="p-5 rounded-card bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-fog" />
                <span className="font-medium text-ink">Push Notifications</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={pushEnabled}
                onClick={() => handlePushToggle(!pushEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pushEnabled ? 'bg-accent' : 'bg-fog/30'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  pushEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            {pushDenied && (
              <p className="text-sm text-red-500">
                Notification permission denied. Please enable notifications in your browser settings.
              </p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-8 w-full px-4 py-3 bg-action text-action-text font-medium rounded-btn shadow-button hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>

      <AnimatePresence>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </AnimatePresence>
    </div>
  );
}

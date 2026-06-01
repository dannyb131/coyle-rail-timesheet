import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const installedHandler = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferred(null);
  };

  if (installed || !deferred) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#2d6a4f', color: '#fff', padding: '12px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      zIndex: 1000, boxShadow: '0 -2px 8px rgba(0,0,0,0.2)',
    }}>
      <span>Install this app for offline use</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setDeferred(null)}
          style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: 4, padding: '6px 14px', cursor: 'pointer' }}
        >Not now</button>
        <button
          onClick={handleInstall}
          style={{ background: '#fff', color: '#2d6a4f', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}
        >Install</button>
      </div>
    </div>
  );
}

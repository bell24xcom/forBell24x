'use client';

import { useEffect, useState } from 'react';

const DISMISS_KEY = 'vyaparsethu_install_banner_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && window.innerWidth <= 768;
}

function isAlreadyInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (!isMobileDevice() || isAlreadyInstalled()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleLater = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 mx-4 md:hidden">
      <div className="bg-[#0B1F45] border border-[#D4AF37] rounded-xl p-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <p className="text-white font-semibold text-sm">Install VyaparSethu</p>
            <p className="text-slate-300 text-xs">Works like an app — no download needed</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={handleLater} className="text-slate-400 text-xs px-2 py-1">
            Later
          </button>
          <button
            onClick={handleInstall}
            className="bg-[#D4AF37] text-[#0B1F45] text-xs font-bold px-3 py-2 rounded-lg"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

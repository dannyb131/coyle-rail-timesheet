import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

const CACHE = 'app-v6';
async function populateCache() {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(CACHE);
    const base = import.meta.env.BASE_URL;
    const urls = [base + 'index.html', base, base + 'favicon.svg', base + 'icon-192.png', base + 'icon-512.png', base + 'logo.jpg', base + 'manifest.webmanifest', base + 'registerSW.js'];
    document.querySelectorAll('link[rel=stylesheet], link[rel=icon], link[rel=apple-touch-icon]').forEach(el => {
      const u = (el as HTMLLinkElement).href;
      if (u) urls.push(u);
    });
    document.querySelectorAll('script[src]').forEach(el => {
      const u = (el as HTMLScriptElement).src;
      if (u) urls.push(u);
    });
    for (const u of [...new Set(urls)]) {
      if (!(await cache.match(u))) {
        const r = await fetch(u).catch(() => null);
        if (r && r.ok) cache.put(u, r);
      }
    }
  } catch {}
}
window.addEventListener('load', () => { setTimeout(populateCache, 2000); });

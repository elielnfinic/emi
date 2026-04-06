import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/firebase'
import App from './App'

// ── Service Worker registration ──────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed — app still works, just no offline support
    })
  })
}

// ── Sync <meta name="theme-color"> with the saved theme ─────────────────────
// The HTML has two entries (light/dark media-query). We also add a plain one
// so iOS Safari (which ignores media queries on theme-color) picks up the
// correct color immediately, even before React mounts.
;(function syncThemeColor() {
  const isDark = document.documentElement.classList.contains('dark')
  const color = isDark ? '#09090B' : '#F8F8FB'
  let plain = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])')
  if (!plain) {
    plain = document.createElement('meta')
    plain.name = 'theme-color'
    document.head.appendChild(plain)
  }
  plain.content = color
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

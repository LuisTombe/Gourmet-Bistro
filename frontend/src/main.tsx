import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initCoreWebVitals } from './utils/webVitals.ts';

createRoot(document.getElementById('root')!).render(<App />);

// Inicializar telemetría RUM de Core Web Vitals después de que la página esté lista
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    initCoreWebVitals();
  });
}

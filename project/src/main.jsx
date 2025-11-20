import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n/config';

// Suppress harmless "Tracking Prevention" warnings in development
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    // Filter out tracking prevention warnings (harmless browser privacy warnings)
    if (message.includes('Tracking Prevention blocked access to storage')) {
      return; // Suppress this warning
    }
    originalWarn.apply(console, args);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);


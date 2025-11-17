import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

// Initialize Tauri logging (development mode only)
if (import.meta.env.DEV) {
  import('@tauri-apps/plugin-log').then(({ attachConsole }) => {
    attachConsole().then(() => {
      console.log('📋 Tauri logging attached to browser console');
    });
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

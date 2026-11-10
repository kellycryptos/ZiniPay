import React from 'react';
import ReactDOM from 'react-dom/client';

(window as any).global = window;
(window as any).process = (window as any).process || { env: {} };

import App from './App.tsx';
import { ThemeProvider } from './lib/theme.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);

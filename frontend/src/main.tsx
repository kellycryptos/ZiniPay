import React from 'react';
import ReactDOM from 'react-dom/client';
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;
(window as any).global = window;

import App from './App.tsx';
import './index.css';
import '@near-wallet-selector/modal-ui/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

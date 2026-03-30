import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { WalletProvider } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

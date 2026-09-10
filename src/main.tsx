import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './features/auth/context/auth-provider';
import { I18nProvider } from './i18n';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <BrowserRouter>
          {/* Inside the router: AuthProvider's consumers navigate, and the
              401 handler relies on router-driven redirects. */}
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </I18nProvider>
  </React.StrictMode>,
);

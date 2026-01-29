import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

import { ThemeProvider } from './shared/context/ThemeContext';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
    <React.StrictMode>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </React.StrictMode>
);

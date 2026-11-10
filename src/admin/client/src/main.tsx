import React from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@gravity-ui/uikit';
import { BrowserRouter } from 'react-router-dom';

import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import { client } from './apollo';
import App from './App';

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

createRoot(container).render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <ThemeProvider theme="dark">
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ThemeProvider>
        </ApolloProvider>
    </React.StrictMode>,
);

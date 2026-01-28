import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

// 1. Get the root element from the HTML.
const rootElement = document.getElementById('root');

// 2. Create the root.
const root = ReactDOM.createRoot(rootElement);

// 3. Render the entire App.
// We wrap the App with AuthProvider so all components can access the user state.
root.render(
  <React.StrictMode>
    <BrowserRouter>
        <AuthProvider>
        <App />
        </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
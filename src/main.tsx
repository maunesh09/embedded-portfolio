/**
 * @file main.tsx
 * @brief Application entry point: picks the router and mounts React.
 * @details GitHub Pages builds use BrowserRouter with the repository base path.
 * The single-file preview build uses MemoryRouter because it has no real URL space.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from './App';
import { isPreview } from './lib/env';
import './styles/global.css';

/*
 * GitHub Pages: BrowserRouter with the repo base path. Deep links work because
 * the build copies index.html to 404.html (see scripts/postbuild.mjs).
 * The single-file preview build uses in-memory routing instead.
 */
const app = isPreview ? (
  <MemoryRouter>
    <App />
  </MemoryRouter>
) : (
  <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
    <App />
  </BrowserRouter>
);

createRoot(document.getElementById('root')!).render(<StrictMode>{app}</StrictMode>);

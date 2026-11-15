/**
 * @file postbuild.mjs
 * @brief Post-build step: copy dist/index.html to dist/404.html.
 * @details GitHub Pages serves 404.html for any unknown path. Serving the app shell there
 * lets deep links such as /repo/projects/x load the single-page app, whose router then
 * renders the right page, or its own 404 page.
 */

// GitHub Pages serves 404.html for unknown paths. Copying the app shell there
// lets deep links like /<repo>/projects/foo load the SPA, whose router then
// renders the right page (or its own 404 page).
import { copyFileSync, existsSync } from 'node:fs';
if (!existsSync('dist/index.html')) throw new Error('dist/index.html missing; run vite build first');
copyFileSync('dist/index.html', 'dist/404.html');
console.log('postbuild: wrote dist/404.html');

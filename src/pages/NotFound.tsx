/**
 * @file NotFound.tsx
 * @brief 404 page, also used for unknown project and article slugs.
 */

import { Link } from 'react-router-dom';
import { useMeta } from '../lib/useMeta';

/**
 * @brief Render the not-found page with routes back into the site (noindex).
 * @returns The page content, rendered inside the shared layout.
 */
export default function NotFound() {
  useMeta('Page not found', 'This page does not exist.', true);
  return (
    <div className="wrap page notfound">
      <p className="nf-code" aria-hidden="true">404</p>
      <h1>No device at this address</h1>
      <p className="lede">The page you asked for doesn’t exist. It may have moved when the site was reorganised.</p>
      <div className="actions">
        <Link to="/" className="btn btn-primary">Go to the home page</Link>
        <Link to="/projects" className="btn">Browse projects</Link>
      </div>
    </div>
  );
}

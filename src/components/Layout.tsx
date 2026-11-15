/**
 * @file Layout.tsx
 * @brief Site chrome: header with navigation, main region and footer.
 */

import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { site } from '../content/site';

const NAV = [
  { to: '/projects', label: 'Projects' },
  { to: '/expertise', label: 'Expertise' },
  { to: '/notebook', label: 'Notebook' },
  { to: '/about', label: 'About' },
  { to: '/resume', label: 'Resume' },
  { to: '/contact', label: 'Contact' },
];

/**
 * @brief The chip-shaped logo mark with the site initials.
 * @returns A decorative SVG (hidden from assistive technology).
 */
export function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="mark">
      {[7, 12, 16, 21].map((p) => (
        <g key={p}>
          <line x1={p} y1="1" x2={p} y2="5" />
          <line x1={p} y1="23" x2={p} y2="27" />
          <line x1="1" y1={p} x2="5" y2={p} />
          <line x1="23" y1={p} x2="27" y2={p} />
        </g>
      ))}
      <rect x="5" y="5" width="18" height="18" rx="2" />
      <text x="14" y="18.5" textAnchor="middle">{site.initials}</text>
    </svg>
  );
}

/**
 * @brief Shared page layout used by every route.
 * @details On each navigation it closes the mobile menu, scrolls to the top and moves
 * focus to the main region, so screen readers announce the new page.
 * @returns Header, the routed page (via Outlet) and footer.
 */
export function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
    // Move focus to the page on navigation so screen readers announce the new page.
    if (first.current) first.current = false;
    else mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="wrap header-inner">
          <Link to="/" className="brand">
            <Mark />
            <span className="brand-name">{(site.fullName ?? site.name).toUpperCase()}</span>
            <span className="brand-sub">embedded systems</span>
          </Link>
          <span className="run-led" title="Open to embedded firmware and hardware roles">
            <span aria-hidden="true" />
            Run: open to roles
          </span>
          <button type="button" className="menu-btn" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>
            {open ? 'Close' : 'Menu'}
          </button>
          <nav id="site-nav" className={`site-nav${open ? ' is-open' : ''}`} aria-label="Main">
            <ul>
              {NAV.map((n) => (
                <li key={n.to}>
                  <NavLink to={n.to}>{n.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="wrap footer-inner">
          <p>
            {site.fullName ?? site.name}, embedded systems engineer in {site.location}.
          </p>
          <ul>
            {site.contact.email && <li><a href={`mailto:${site.contact.email}`}>Email</a></li>}
            {site.contact.github && <li><a href={site.contact.github} rel="me noopener">GitHub</a></li>}
            {site.contact.linkedin && <li><a href={site.contact.linkedin} rel="me noopener">LinkedIn</a></li>}
            {site.contact.upwork && <li><a href={site.contact.upwork} rel="me noopener">Upwork</a></li>}
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
      </footer>
    </>
  );
}

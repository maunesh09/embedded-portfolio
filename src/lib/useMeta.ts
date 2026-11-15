/**
 * @file useMeta.ts
 * @brief Per-route document title, description and robots metadata.
 */

import { useEffect } from 'react';
import { site } from '../content/site';

/**
 * @brief Create or update one meta tag in the document head.
 * @param attr Which attribute identifies the tag: "name" or "property".
 * @param key The attribute value, e.g. "description" or "og:title".
 * @param value The content to set.
 */
function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

/**
 * @brief React hook that sets the page title and metadata for the current route.
 * @param title Page title, or null for the home page. The site name is appended.
 * @param description Meta and Open Graph description.
 * @param noindex When true, asks search engines not to index the page (404s, drafts).
 */
export function useMeta(title: string | null, description: string, noindex = false) {
  useEffect(() => {
    const who = site.fullName ?? site.name;
    const full = title ? `${title} | ${who}` : `${who} | Embedded systems engineer`;
    document.title = full;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', description);
    setMeta('name', 'robots', noindex ? 'noindex' : 'index,follow');
  }, [title, description, noindex]);
}

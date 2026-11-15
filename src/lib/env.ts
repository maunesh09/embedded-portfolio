/**
 * @file env.ts
 * @brief Build-time flags and the public-asset path helper.
 * @details Values come from Vite environment variables, so they are fixed at build time.
 */

/** Draft content (todo prompts, planned-article pages, template page) shows in dev and draft previews only. */
export const showDrafts = import.meta.env.DEV || import.meta.env.VITE_SHOW_DRAFTS === 'true';

/** Single-file preview build (in-memory routing, no base path). */
export const isPreview = import.meta.env.VITE_PREVIEW === 'true';

/**
 * @brief Resolve a file in /public against the deployed base path.
 * @details GitHub Pages project sites are served from "/repo-name/", so a bare
 * "/resume.pdf" would 404. This prefixes Vite's BASE_URL.
 * @param path Path inside /public, with or without a leading slash.
 * @returns The URL to use in href or src attributes.
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

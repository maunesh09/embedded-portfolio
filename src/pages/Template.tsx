/**
 * @file Template.tsx
 * @brief Development-only reference page showing every article block type.
 */

import type { Article } from '../content/types';
import { useMeta } from '../lib/useMeta';
import { ArticleView } from './Article';

/** Dev-only reference page showing every block an article can use. */
const demo: Article = {
  slug: 'template',
  title: 'Article template',
  summary: 'Reference for every content block available to notebook articles. This page is not linked or built into the live site.',
  status: 'draft',
  topics: ['Template'],
  outline: [],
  body: [
    { type: 'h', text: 'Prose and lists' },
    { type: 'p', text: 'Body text is set for long reading: a comfortable measure and generous line spacing. Headings of type "h" build the contents list on the left.' },
    { type: 'list', items: ['Bulleted list item', 'Another item with more words to show wrapping across the measure of the column'] },
    { type: 'h', text: 'Code' },
    {
      type: 'code',
      lang: 'c',
      caption: 'Example: checking a heartbeat deadline (template sample, not project code).',
      code: `#include <stdint.h>

/* Returns true when the peer has missed its deadline. */
static bool heartbeat_expired(uint32_t now_ms, uint32_t last_ms, uint32_t timeout_ms)
{
    return (uint32_t)(now_ms - last_ms) > timeout_ms; // wrap-safe
}
`,
    },
    { type: 'code', lang: 'json', code: '{ "type": "HEARTBEAT", "seq": 2, "ok": true }' },
    { type: 'h', text: 'Diagrams and tables' },
    { type: 'diagram', id: 'nordic-uart-frame', caption: 'Diagrams come from the shared registry in src/diagrams.', illustrative: true },
    { type: 'table', caption: 'Table caption', head: ['Signal', 'Pin', 'Notes'], rows: [['UART TX', 'P0.06', 'Example values'], ['UART RX', 'P0.08', 'Pull-up enabled']] },
    { type: 'h', text: 'Callouts and images' },
    { type: 'callout', tone: 'note', title: 'Note', text: 'Use for context the reader should not miss.' },
    { type: 'callout', tone: 'constraint', title: 'Constraint', text: 'Use for limits: licensing, hardware limits, things not yet verified.' },
    { type: 'image', alt: 'Scope capture', caption: 'Image', placeholderHint: 'Set src to a file in /public to show a real image.' },
  ],
};

/**
 * @brief Render the article template (noindex; only routed when drafts are shown).
 * @returns The page content, rendered inside the shared layout.
 */
export default function Template() {
  useMeta('Article template', demo.summary, true);
  return <ArticleView a={demo} />;
}

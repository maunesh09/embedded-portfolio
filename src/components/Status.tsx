/**
 * @file Status.tsx
 * @brief Status labels, tags and the missing-detail placeholder.
 */

import type { ArticleStatus, ProjectKind, Status } from '../content/types';

export const statusLabel: Record<Status, string> = {
  implemented: 'Implemented',
  'in-progress': 'In progress',
  planned: 'Planned',
  concept: 'Concept',
};

const articleLabel: Record<ArticleStatus, string> = { planned: 'Planned', draft: 'Draft', published: 'Published' };

export const kindLabel: Record<ProjectKind, string> = {
  professional: 'Professional work',
  personal: 'Personal project',
  learning: 'Learning project',
};

/**
 * @brief Pill showing a project or feature status.
 * @param status One of implemented, in-progress, planned or concept.
 * @returns A coloured status tag.
 */
export function StatusTag({ status }: { status: Status }) {
  return <span className={`tag tag-${status}`}>{statusLabel[status]}</span>;
}

/**
 * @brief Pill showing an article's publication state.
 * @param status One of planned, draft or published.
 * @returns A coloured status tag.
 */
export function ArticleTag({ status }: { status: ArticleStatus }) {
  return <span className={`tag tag-a-${status}`}>{articleLabel[status]}</span>;
}

/**
 * @brief Visible placeholder for a personal detail not yet filled in.
 * @details Used instead of inventing values, so gaps are obvious on the page.
 * @param what What to add, e.g. "job title".
 * @returns A dashed "Add …" marker.
 */
export function Missing({ what }: { what: string }) {
  return <span className="missing">Add {what}</span>;
}

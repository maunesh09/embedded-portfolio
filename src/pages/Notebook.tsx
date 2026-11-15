/**
 * @file Notebook.tsx
 * @brief Notebook index page.
 */

import { Link } from 'react-router-dom';
import { ArticleList } from '../components/ArticleList';
import { articles } from '../content/articles';
import { showDrafts } from '../lib/env';
import { useMeta } from '../lib/useMeta';

/**
 * @brief Render the list of notebook articles and their states.
 * @returns The page content, rendered inside the shared layout.
 */
export default function Notebook() {
  useMeta('Engineering notebook', 'Technical write-ups on embedded networking, BLE, hardware bring-up and verification.');
  const published = articles.filter((a) => a.status === 'published');
  return (
    <div className="wrap page">
      <header className="page-head">
        <h1>Engineering notebook</h1>
        <p className="lede">
          Longer write-ups on problems from my projects.{' '}
          {published.length === 0
            ? 'Nothing is published yet; these are the topics in progress.'
            : `${published.length} published so far.`}
        </p>
        {showDrafts && (
          <p className="dev-note">
            Dev only: <Link to="/notebook/template">article template</Link> shows every content block.
          </p>
        )}
      </header>
      <ArticleList articles={articles} />
    </div>
  );
}

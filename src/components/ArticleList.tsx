/**
 * @file ArticleList.tsx
 * @brief List of notebook articles with status and topics.
 */

import { Link } from 'react-router-dom';
import type { Article } from '../content/types';
import { showDrafts } from '../lib/env';
import { ArticleTag } from './Status';

/**
 * @brief Render notebook entries as a grid of cards.
 * @details Titles link to the article page only when it is published, or when drafts are shown.
 * @param articles The articles to list, in display order.
 * @returns The list element.
 */
export function ArticleList({ articles }: { articles: Article[] }) {
  return (
    <ul className="alist">
      {articles.map((a) => {
        const linkable = a.status === 'published' || showDrafts;
        return (
          <li key={a.slug}>
            <div className="alist-head">
              <ArticleTag status={a.status} />
              <span className="alist-topics">{a.topics.join(', ')}</span>
            </div>
            <h3>{linkable ? <Link to={`/notebook/${a.slug}`}>{a.title}</Link> : a.title}</h3>
            <p>{a.summary}</p>
          </li>
        );
      })}
    </ul>
  );
}

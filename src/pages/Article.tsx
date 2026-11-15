/**
 * @file Article.tsx
 * @brief Notebook article page and the shared article view.
 */

import { Link, useParams } from 'react-router-dom';
import { Blocks } from '../components/Blocks';
import { ArticleTag } from '../components/Status';
import { getArticle } from '../content/articles';
import { getProject } from '../content/projects';
import type { Article as A, Block } from '../content/types';
import { showDrafts } from '../lib/env';
import { useMeta } from '../lib/useMeta';
import NotFound from './NotFound';

/**
 * @brief Turn a heading into a URL fragment id.
 * @param s Heading text.
 * @returns Lower-case, hyphen-separated id.
 */
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/**
 * @brief Render an article: header, table of contents and body.
 * @details Planned and draft articles without a body show their outline instead.
 * @param a The article to render.
 * @returns The article element.
 */
export function ArticleView({ a }: { a: A }) {
  const related = a.relatedProject ? getProject(a.relatedProject) : undefined;
  const heads = (a.body ?? []).filter((b): b is { type: 'h'; text: string } => b.type === 'h');
  return (
    <article className="wrap page article">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/notebook">Notebook</Link>
      </nav>
      <header className="article-head">
        <div className="alist-head">
          <ArticleTag status={a.status} />
          <span className="alist-topics">{a.topics.join(', ')}</span>
          {a.published && <time dateTime={a.published}>{a.published}</time>}
        </div>
        <h1>{a.title}</h1>
        <p className="lede">{a.summary}</p>
      </header>
      <div className="article-body">
        {heads.length > 0 ? (
          <nav className="toc" aria-label="Contents">
            <ol>
              {heads.map((h) => (
                <li key={h.text}><a href={`#${slugify(h.text)}`}>{h.text}</a></li>
              ))}
            </ol>
          </nav>
        ) : (
          <div aria-hidden="true" />
        )}
        <div className="prose prose-long">
          {a.body ? (
            a.body.map((b, i) =>
              b.type === 'h' ? (
                <h2 key={i} id={slugify(b.text)}>{b.text}</h2>
              ) : (
                <Blocks key={i} blocks={[b as Block]} />
              ),
            )
          ) : (
            <>
              <p>This article is {a.status === 'planned' ? 'planned' : 'being drafted'}. The outline so far:</p>
              <ol className="outline">
                {a.outline.map((o) => <li key={o}>{o}</li>)}
              </ol>
            </>
          )}
          {related && (
            <p className="related">
              Related project: <Link to={`/projects/${related.slug}`}>{related.title}</Link>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * @brief Route component for /notebook/:slug.
 * @details Unpublished articles are only reachable when drafts are shown; otherwise
 * the 404 page renders.
 * @returns The page content.
 */
export default function Article() {
  const { slug = '' } = useParams();
  const a = getArticle(slug);
  const visible = a && (a.status === 'published' || showDrafts);
  useMeta(visible ? a.title : 'Article not found', visible ? a.summary : 'This article does not exist.', !visible || a.status !== 'published');
  if (!visible) return <NotFound />;
  return <ArticleView a={a} />;
}

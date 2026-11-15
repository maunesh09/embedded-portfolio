/**
 * @file ProjectDetail.tsx
 * @brief Project page built from the fixed ten-section structure.
 */

import { Link, useParams } from 'react-router-dom';
import { Blocks } from '../components/Blocks';
import { kindLabel, StatusTag } from '../components/Status';
import { projectSectionOrder } from '../content/articles';
import { getProject, projects } from '../content/projects';
import { site } from '../content/site';
import { showDrafts } from '../lib/env';
import { useMeta } from '../lib/useMeta';
import NotFound from './NotFound';

/**
 * @brief Render one project: title block, contents, sections and next-project link.
 * @details Sections without content are hidden; their todo prompts appear only when
 * drafts are shown. Unknown slugs render the 404 page.
 * @returns The page content.
 */
export default function ProjectDetail() {
  const { slug = '' } = useParams();
  const p = getProject(slug);
  useMeta(p?.title ?? 'Project not found', p?.summary ?? 'This project does not exist.', !p);
  if (!p) return <NotFound />;

  const visible = projectSectionOrder.filter(({ id }) => {
    const s = p.sections[id];
    return s && ((s.blocks && s.blocks.length > 0) || (showDrafts && s.todo?.length));
  });
  const idx = projects.indexOf(p);
  const next = projects[(idx + 1) % projects.length];

  return (
    <article className="wrap page project">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/projects">Projects</Link>
      </nav>
      <header className="titleblock">
        <div className="titleblock-main">
          <h1>{p.title}</h1>
          <p className="lede">{p.summary}</p>
        </div>
        <dl className="titleblock-meta">
          <div>
            <dt>Status</dt>
            <dd><StatusTag status={p.status} /></dd>
          </div>
          <div>
            <dt>Stage</dt>
            <dd>{p.phase}</dd>
          </div>
          {p.kind && (
            <div>
              <dt>Context</dt>
              <dd>{kindLabel[p.kind]}</dd>
            </div>
          )}
          <div>
            <dt>Domain</dt>
            <dd>{p.domains.join(', ')}</dd>
          </div>
          <div>
            <dt>Technology</dt>
            <dd>{p.tech.join(', ')}</dd>
          </div>
          {p.repo && site.contact.github && (
            <div>
              <dt>Source</dt>
              <dd><a href={`${site.contact.github.replace(/\/$/, '')}/${p.repo}`}>{p.repo}</a></dd>
            </div>
          )}
          {p.updated && (
            <div>
              <dt>Updated</dt>
              <dd><time dateTime={p.updated}>{p.updated}</time></dd>
            </div>
          )}
        </dl>
      </header>

      <div className="project-body">
        <nav className="toc" aria-label="On this page">
          <ol>
            {visible.map(({ id, title }) => (
              <li key={id}><a href={`#${id}`}>{title}</a></li>
            ))}
          </ol>
        </nav>
        <div className="prose">
          {visible.map(({ id, title }) => {
            const s = p.sections[id]!;
            const hasContent = !!s.blocks?.length;
            return (
              <section key={id} id={id} className="psec">
                <div className="psec-head">
                  <h2>{title}</h2>
                  {s.status && <StatusTag status={s.status} />}
                </div>
                {hasContent && <Blocks blocks={s.blocks!} />}
                {showDrafts && s.todo && s.todo.length > 0 && (
                  <aside className="todo" aria-label="Content still needed">
                    <h3>Needs your input (hidden on the live site{hasContent ? ' — this list only' : ''})</h3>
                    <ul>
                      {s.todo.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                  </aside>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {next && next !== p && (
        <nav className="next" aria-label="Next project">
          <span>Next project</span>
          <Link to={`/projects/${next.slug}`}>{next.title}</Link>
        </nav>
      )}
    </article>
  );
}

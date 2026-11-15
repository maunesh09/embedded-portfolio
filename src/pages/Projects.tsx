/**
 * @file Projects.tsx
 * @brief Projects page: filterable project channels and the GitHub repository list.
 */

import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProjectList } from '../components/ProjectList';
import { statusLabel } from '../components/Status';
import { projects } from '../content/projects';
import { repositories, site } from '../content/site';
import type { Status } from '../content/types';
import { useMeta } from '../lib/useMeta';

const ORDER: Status[] = ['implemented', 'in-progress', 'concept', 'planned'];

/**
 * @brief Render all projects with status and technology filters, then repositories.
 * @details Filtering is client-side. Repository names become links only when a GitHub
 * URL is set in site.ts.
 * @returns The page content.
 */
export default function Projects() {
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [q, setQ] = useState('');
  const searchId = useId();
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (status === 'all' || p.status === status) &&
        (!needle || [p.title, p.summary, ...p.tech, ...p.domains].join(' ').toLowerCase().includes(needle)),
    );
  }, [status, q]);
  useMeta('Projects', 'Embedded firmware, wireless and electronics hardware projects, each labelled with its real implementation status.');
  return (
    <div className="wrap page">
      <header className="page-head">
        <h1>Projects</h1>
        <p className="lede">
          Each project is labelled with where it actually stands. Professional work is described without proprietary detail;
          personal designs are marked as concepts until there’s hardware to show.
        </p>
      </header>
      <div className="filters">
        <div className="chips" role="group" aria-label="Filter by status">
          <button type="button" aria-pressed={status === 'all'} onClick={() => setStatus('all')}>
            All <span>{projects.length}</span>
          </button>
          {ORDER.filter((s) => projects.some((p) => p.status === s)).map((s) => (
            <button key={s} type="button" className={`chip-${s}`} aria-pressed={status === s} onClick={() => setStatus(s)}>
              {statusLabel[s]} <span>{projects.filter((p) => p.status === s).length}</span>
            </button>
          ))}
        </div>
        <div className="search">
          <label htmlFor={searchId}>Filter by technology</label>
          <input id={searchId} type="search" placeholder="e.g. nRF54, MQTT, OrCAD" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <p className="filter-count" aria-live="polite">
        {shown.length === projects.length ? `${shown.length} projects` : `${shown.length} of ${projects.length} projects`}
      </p>
      {shown.length ? (
        <ProjectList projects={shown} />
      ) : (
        <p className="empty">
          No projects match. <button type="button" className="linkish" onClick={() => { setStatus('all'); setQ(''); }}>Clear filters</button>
        </p>
      )}

      <section className="band-tight" aria-labelledby="repo-h">
        <h2 id="repo-h">Repositories</h2>
        <p className="section-lede">
          Firmware, SDK and hardware repositories on GitHub
          {!site.contact.github && ' (links appear once a GitHub URL is set in site.ts)'}.
        </p>
        <ul className="repos">
          {repositories.map((r) => (
            <li key={r.name}>
              <h3 className="repo-name">
                {site.contact.github ? <a href={`${site.contact.github.replace(/\/$/, '')}/${r.name}`}>{r.name}</a> : r.name}
              </h3>
              <p>{r.about}</p>
              <p className="repo-tags">
                {r.tags.join(', ')}
                {r.project && (
                  <>
                    {'. '}
                    <Link to={`/projects/${r.project}`}>Project write-up</Link>
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

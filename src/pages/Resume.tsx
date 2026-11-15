/**
 * @file Resume.tsx
 * @brief Resume page: summary, highlights, experience, education, skills and projects.
 */

import { Link } from 'react-router-dom';
import { Missing } from '../components/Status';
import { projects } from '../content/projects';
import { site, skillGroups } from '../content/site';
import { asset } from '../lib/env';
import { useMeta } from '../lib/useMeta';

/**
 * @brief Render the resume, with a PDF download when one is configured.
 * @details Missing details show placeholders. The page prints cleanly via print styles.
 * @returns The page content.
 */
export default function Resume() {
  useMeta('Resume', 'Resume: embedded firmware, BLE and electronics hardware experience, education and selected projects.');
  const pdf = site.resume.pdfPath;
  const core = skillGroups.filter((g) => g.id !== 'growing');
  return (
    <div className="wrap page resume">
      <header className="page-head resume-head">
        <div>
          <h1>Resume</h1>
          <p className="lede">{site.headline}</p>
        </div>
        <div className="resume-actions">
          {pdf ? (
            <a className="btn btn-primary" href={asset(pdf)} download>
              Download PDF
            </a>
          ) : (
            <p className="missing-block">
              PDF not added yet. Put it at <code>public/resume.pdf</code> and set <code>resume.pdfPath</code> in{' '}
              <code>site.ts</code>.
            </p>
          )}
          <button type="button" className="btn" onClick={() => window.print()}>
            Print this page
          </button>
        </div>
      </header>

      <section className="rsec">
        <h2>Summary</h2>
        <div className="rsec-body">
        <p>{site.intro}</p>
        <p>
          {site.experienceFacts.map((f) => `${f.value}: ${f.label}`).join('; ')}.
        </p>
        </div>
      </section>

      {site.achievements.length > 0 && (
        <section className="rsec">
          <h2>Highlights</h2>
          <div className="rsec-body">
            <ul className="bullets">
              {site.achievements.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </div>
        </section>
      )}

      <section className="rsec">
        <h2>Experience</h2>
        <div className="rsec-body">
        {site.experience.map((x, i) => (
          <div key={i} className="role">
            <div className="role-head">
              <h3>{x.role ?? <Missing what="job title" />}</h3>
              <p>
                {x.employer ?? <Missing what="employer" />}
                {x.location && <span>, {x.location}</span>}
              </p>
              <p className="role-period">{x.period ?? <Missing what="dates" />}</p>
            </div>
            <ul className="bullets">
              {x.highlights.map((h) => <li key={h}>{h}</li>)}
            </ul>
          </div>
        ))}
        </div>
      </section>

      <section className="rsec">
        <h2>Education</h2>
        <div className="rsec-body">
        {site.education.map((e) => (
          <div key={e.credential} className="role">
            <div className="role-head">
              <h3>{e.credential}</h3>
              <p>{e.institution}, {e.place}</p>
              <p className="role-period">{e.period ?? <Missing what="dates" />}</p>
            </div>
          </div>
        ))}
        </div>
      </section>

      <section className="rsec">
        <h2>Technical skills</h2>
        <div className="rsec-body">
        <dl className="rskills">
          {core.map((g) => (
            <div key={g.id}>
              <dt>{g.title}</dt>
              <dd>{g.skills.filter((s) => s.level === 'professional' || s.level === 'working').map((s) => s.name).join(', ')}</dd>
            </div>
          ))}
        </dl>
        </div>
      </section>

      <section className="rsec">
        <h2>Selected projects</h2>
        <div className="rsec-body">
        <ul className="rprojects">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link to={`/projects/${p.slug}`}>{p.title}</Link>
              <span>{p.summary}</span>
            </li>
          ))}
        </ul>
        </div>
      </section>
    </div>
  );
}

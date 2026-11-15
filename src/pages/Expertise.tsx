/**
 * @file Expertise.tsx
 * @brief Expertise page: grouped skills with honest proficiency levels.
 */

import type { Proficiency } from '../content/types';
import { proficiencyHelp, proficiencyLabel, skillGroups } from '../content/site';
import { useMeta } from '../lib/useMeta';

const LEVELS: Proficiency[] = ['professional', 'working', 'developing', 'exploring'];

/**
 * @brief Four-bar level meter with its label.
 * @param level The proficiency level.
 * @returns The level indicator.
 */
function Level({ level }: { level: Proficiency }) {
  const n = 4 - LEVELS.indexOf(level);
  return (
    <span className={`level level-${level}`}>
      <span className="level-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => <i key={i} className={i <= n ? 'on' : ''} />)}
      </span>
      {proficiencyLabel[level]}
    </span>
  );
}

/**
 * @brief Render skill groups with a key explaining each level.
 * @returns The page content, rendered inside the shared layout.
 */
export default function Expertise() {
  useMeta('Technical expertise', 'Embedded firmware, wireless connectivity, electronics hardware and system design skills, each with an honest experience level.');
  return (
    <div className="wrap page">
      <header className="page-head">
        <h1>Technical expertise</h1>
        <p className="lede">Grouped by the part of the product they apply to. Levels are deliberately conservative.</p>
        <dl className="level-key">
          {LEVELS.map((l) => (
            <div key={l}>
              <dt><Level level={l} /></dt>
              <dd>{proficiencyHelp[l]}</dd>
            </div>
          ))}
        </dl>
      </header>
      <div className="skill-groups">
        {skillGroups.map((g) => (
          <section key={g.id} className="skill-group" aria-labelledby={`sg-${g.id}`}>
            <div className="skill-group-head">
              <h2 id={`sg-${g.id}`}>{g.title}</h2>
              <p>{g.blurb}</p>
            </div>
            <ul className="skills">
              {g.skills.map((s) => (
                <li key={s.name}>
                  <span className="skill-name">
                    {s.name}
                    {s.note && <span className="skill-note">{s.note}</span>}
                  </span>
                  <Level level={s.level} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

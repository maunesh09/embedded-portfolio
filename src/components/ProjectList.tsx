/**
 * @file ProjectList.tsx
 * @brief Projects rendered as oscilloscope channels.
 * @details The trace shape encodes status: a square wave for implemented work, packet
 * bursts for work in progress, and a dashed ramp for concepts and plans.
 */

import { Link } from 'react-router-dom';
import type { Project, Status } from '../content/types';
import { Diagram } from '../diagrams';
import { kindLabel, StatusTag } from './Status';

/**
 * @brief Build the SVG path for a project's status trace.
 * @details The path is 600 units wide, twice the 300-unit viewBox, so the CSS scroll
 * animation can translate it by 300 and loop seamlessly.
 * @param status The project status.
 * @returns An SVG path "d" string.
 */
function wave(status: Status): string {
  const pts: string[] = [];
  if (status === 'implemented') {
    let y = 10;
    pts.push('M0,10');
    for (let x = 30; x <= 600; x += 30) pts.push(`H${x} V${(y = y === 10 ? 50 : 10)}`);
  } else if (status === 'in-progress') {
    // bursts: six half-cycles, then a quiet gap, like a radio sending packets
    pts.push('M0,30');
    for (let b = 0; b < 600; b += 120) {
      pts.push(`H${b} Q${b + 7.5},2 ${b + 15},30`);
      for (let x = b + 30; x <= b + 90; x += 15) pts.push(`T${x},30`);
    }
    pts.push('H600');
  } else {
    pts.push('M0,50');
    for (let x = 60; x <= 600; x += 60) pts.push(`L${x},10 V50`);
  }
  return pts.join(' ');
}

/**
 * @brief Render projects as channel rows with badge, summary, trace and metadata.
 * @param projects Projects to show, in order. Channel colours cycle CH1 to CH4.
 * @param thumbs When true, also show each project's diagram as a thumbnail.
 * @returns The list element.
 */
export function ProjectList({ projects, thumbs }: { projects: Project[]; thumbs?: boolean }) {
  return (
    <ul className={`plist chlist${thumbs ? ' plist-thumbs' : ''}`}>
      {projects.map((p, i) => {
        const ch = (i % 4) + 1;
        return (
          <li key={p.slug} className={`chrow chrow-${ch}`}>
            <span className={`ch-badge ch-badge-${ch}`} aria-hidden="true">CH{ch}</span>
            {thumbs && p.heroDiagram && (
              <Link to={`/projects/${p.slug}`} className="plist-thumb" tabIndex={-1} aria-hidden="true">
                <Diagram id={p.heroDiagram} />
              </Link>
            )}
            <div className="plist-main">
              <h3>
                <Link to={`/projects/${p.slug}`}>{p.title}</Link>
              </h3>
              <p>{p.summary}</p>
              <p className="plist-tech">{p.tech.join(', ')}</p>
            </div>
            <div className="ch-side">
              <svg viewBox="0 0 300 60" className={`ch-trace ch-trace-${p.status}`} aria-hidden="true" preserveAspectRatio="none">
                <g className="ch-scroll">
                  <path d={wave(p.status)} />
                </g>
              </svg>
              <dl className="plist-meta">
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
              </dl>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

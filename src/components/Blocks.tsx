/**
 * @file Blocks.tsx
 * @brief Renderer for the content blocks used in projects and articles.
 */

import type { Block } from '../content/types';
import { Diagram } from '../diagrams';
import { asset } from '../lib/env';
import { CodeBlock } from './CodeBlock';
import { ChannelSounding } from '../interactive/ChannelSounding';
import { ProtocolSim } from '../interactive/ProtocolSim';
import { StatusTag } from './Status';

/**
 * @brief Render a list of content blocks in order.
 * @param blocks Blocks from projects.ts or articles.ts.
 * @returns The rendered blocks.
 */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
    </>
  );
}

/**
 * @brief Render one content block according to its type.
 * @details Handles paragraphs, lists, tables, feature-status lists, diagrams,
 * interactive widgets, code, callouts and images (or labelled placeholders when an
 * image has no src).
 * @param b The block to render.
 * @returns The element for that block.
 */
function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case 'p':
      return <p>{b.text}</p>;
    case 'list':
      return (
        <ul className="bullets">
          {b.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <div className="table-wrap" tabIndex={0} role="group" aria-label={b.caption ?? 'Table'}>
          <table>
            {b.caption && <caption>{b.caption}</caption>}
            <thead>
              <tr>{b.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r) => (
                <tr key={r.join('|')}>
                  {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'features':
      return (
        <div className="features">
          {b.caption && <h4 className="features-cap">{b.caption}</h4>}
          <ul>
            {b.items.map((f) => (
              <li key={f.name}>
                <span className="features-name">
                  {f.name}
                  {f.note && <span className="features-note">{f.note}</span>}
                </span>
                <StatusTag status={f.status} />
              </li>
            ))}
          </ul>
        </div>
      );
    case 'diagram':
      return (
        <figure className="figure">
          <div className="figure-canvas">
            <Diagram id={b.id} />
          </div>
          <figcaption>
            {b.caption}
            {b.illustrative && <span className="figure-flag">Illustrative diagram, not a schematic of a specific product.</span>}
          </figcaption>
        </figure>
      );
    case 'interactive':
      return (
        <figure className="figure figure-interactive">
          <div className="interactive-badge">Interactive</div>
          {b.id === 'esp32-simulator' ? <ProtocolSim /> : <ChannelSounding />}
          <figcaption>{b.caption}</figcaption>
        </figure>
      );
    case 'code':
      return <CodeBlock code={b.code} lang={b.lang} caption={b.caption} />;
    case 'callout':
      return (
        <aside className={`callout callout-${b.tone}`}>
          <h4>{b.title}</h4>
          <p>{b.text}</p>
        </aside>
      );
    case 'image':
      return b.src ? (
        <figure className="figure">
          <img src={asset(b.src)} alt={b.alt} loading="lazy" decoding="async" />
          <figcaption>{b.caption}</figcaption>
        </figure>
      ) : (
        <figure className="figure figure-empty">
          <div className="placeholder" role="img" aria-label={`Placeholder: ${b.alt} not yet added`}>
            <span className="placeholder-title">{b.caption}: not yet added</span>
            {b.placeholderHint && <span className="placeholder-hint">{b.placeholderHint}</span>}
          </div>
        </figure>
      );
  }
}

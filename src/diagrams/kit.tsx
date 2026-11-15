/**
 * @file kit.tsx
 * @brief Shared SVG building blocks that give every diagram one visual language.
 * @details Block kinds: mcu, periph, fw, ext, debug, power. Link kinds: data, power,
 * debug, radio, audio. Colours come from CSS variables.
 */

import type { ReactNode } from 'react';

/**
 * Diagram visual language, used by every diagram on the site:
 *
 *   mcu     MCU / SoC        heavy teal outline with pin ticks
 *   periph  Peripheral       thin outline
 *   fw      Firmware module  filled panel, no outline
 *   ext     External system  dashed outline
 *   debug   Debug / test     dotted outline, small caps-free label
 *   power   Power block      copper outline
 *
 *   data    signal / data link     solid teal, arrowhead
 *   power   power link             dashed copper
 *   debug   debug link             dotted grey
 *   radio   wireless link          long-dash teal
 *   audio   audio link             solid copper, arrowhead
 */
export type BlockKind = 'mcu' | 'periph' | 'fw' | 'ext' | 'debug' | 'power';
export type LinkKind = 'data' | 'power' | 'debug' | 'radio' | 'audio';

/**
 * @brief Shared SVG definitions: arrowhead markers and the debug hatch pattern.
 * @returns An SVG defs element; include once per diagram.
 */
export function Defs() {
  return (
    <defs>
      {(['data', 'audio', 'debug'] as const).map((k) => (
        <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,1 L9,5 L0,9 z" className={`dg-arrow dg-arrow-${k}`} />
        </marker>
      ))}
      <pattern id="dg-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" className="dg-hatch" />
      </pattern>
    </defs>
  );
}

interface BlockProps {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string | string[];
  kind?: BlockKind;
  pins?: boolean;
}

/**
 * @brief Labelled rectangle representing a component or module.
 * @param x Left edge.
 * @param y Top edge.
 * @param w Width.
 * @param h Height.
 * @param label Main label.
 * @param sub One or more sub-labels under the main label.
 * @param kind Visual kind (mcu, periph, fw, ext, debug, power).
 * @param pins Draw pin ticks around the edge (always on for mcu).
 * @returns The block group.
 */
export function Block({ x, y, w, h, label, sub, kind = 'periph', pins }: BlockProps) {
  const subs = sub ? (Array.isArray(sub) ? sub : [sub]) : [];
  const lineH = 14;
  const total = 16 + subs.length * lineH;
  const top = y + h / 2 - total / 2 + 12;
  const ticks: ReactNode[] = [];
  if (pins || kind === 'mcu') {
    for (let py = y + 12; py < y + h - 6; py += 12) {
      ticks.push(<line key={`l${py}`} x1={x - 5} y1={py} x2={x} y2={py} className="dg-pin" />);
      ticks.push(<line key={`r${py}`} x1={x + w} y1={py} x2={x + w + 5} y2={py} className="dg-pin" />);
    }
    for (let px = x + 12; px < x + w - 6; px += 12) {
      ticks.push(<line key={`t${px}`} x1={px} y1={y - 5} x2={px} y2={y} className="dg-pin" />);
      ticks.push(<line key={`b${px}`} x1={px} y1={y + h} x2={px} y2={y + h + 5} className="dg-pin" />);
    }
  }
  return (
    <g className={`dg-block dg-${kind}`}>
      {ticks}
      <rect x={x} y={y} width={w} height={h} rx={kind === 'fw' ? 4 : kind === 'ext' ? 8 : 2} />
      <text x={x + w / 2} y={top} textAnchor="middle" className="dg-label">
        {label}
      </text>
      {subs.map((s, i) => (
        <text key={s} x={x + w / 2} y={top + lineH * (i + 1)} textAnchor="middle" className="dg-sub">
          {s}
        </text>
      ))}
    </g>
  );
}

interface LinkProps {
  points: [number, number][];
  kind?: LinkKind;
  label?: string;
  /** Label position; defaults to the midpoint of the first segment. */
  at?: [number, number];
  anchor?: 'start' | 'middle' | 'end';
  both?: boolean;
  arrow?: boolean;
}

/**
 * @brief Polyline connection between blocks.
 * @param points Polyline vertices.
 * @param kind Visual kind (data, power, debug, radio, audio).
 * @param label Optional label.
 * @param at Label position; defaults to the first segment's midpoint.
 * @param anchor Label text anchor.
 * @param both Arrowheads at both ends.
 * @param arrow Show an arrowhead (ignored for power and radio).
 * @returns The link group.
 */
export function Link({ points, kind = 'data', label, at, anchor = 'middle', both, arrow = true }: LinkProps) {
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  const marker = kind === 'power' || kind === 'radio' || !arrow ? undefined : `url(#arrow-${kind === 'audio' ? 'audio' : kind === 'debug' ? 'debug' : 'data'})`;
  const [a, b] = [points[0], points[1]];
  const pos = at ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 6];
  return (
    <g className={`dg-link dg-link-${kind}`}>
      <path d={d} markerEnd={marker} markerStart={both ? marker : undefined} />
      {label && (
        <text x={pos[0]} y={pos[1]} textAnchor={anchor} className="dg-linklabel">
          {label}
        </text>
      )}
    </g>
  );
}

/**
 * @brief Free-standing annotation text.
 * @param x X position.
 * @param y Baseline y.
 * @param children The text.
 * @param anchor Text anchor.
 * @returns An SVG text element.
 */
export function Note({ x, y, children, anchor = 'start' }: { x: number; y: number; children: string; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className="dg-note">
      {children}
    </text>
  );
}

/**
 * @brief Accessible, responsive SVG wrapper for a diagram.
 * @details Adds title and desc for screen readers, and a horizontally scrollable frame
 * with a hint on narrow screens.
 * @param w ViewBox width.
 * @param h ViewBox height.
 * @param title Accessible title.
 * @param desc Accessible description of what the diagram shows.
 * @param minWidth Minimum rendered width in pixels before scrolling.
 * @param children Diagram content.
 * @returns The wrapped SVG.
 */
export function Svg({ w, h, title, desc, minWidth = 560, children }: { w: number; h: number; title: string; desc: string; minWidth?: number; children: ReactNode }) {
  const id = title.replace(/\W+/g, '-').toLowerCase();
  return (
    <>
    <div className="dg-scroll" tabIndex={0} role="group" aria-label={`${title} (scrollable)`}>
      <svg viewBox={`0 0 ${w} ${h}`} className="dg" style={{ minWidth }} role="img" aria-labelledby={`${id}-t ${id}-d`}>
        <title id={`${id}-t`}>{title}</title>
        <desc id={`${id}-d`}>{desc}</desc>
        <Defs />
        {children}
      </svg>
    </div>
    <p className="dg-hint" aria-hidden="true">Scroll sideways to see the whole diagram.</p>
    </>
  );
}

const LEGEND: { k: string; label: string; swatch: ReactNode }[] = [
  { k: 'mcu', label: 'MCU / SoC', swatch: <rect x="2" y="3" width="18" height="12" className="dg-mcu-sw" /> },
  { k: 'periph', label: 'Peripheral', swatch: <rect x="2" y="3" width="18" height="12" className="dg-periph-sw" /> },
  { k: 'fw', label: 'Firmware module', swatch: <rect x="2" y="3" width="18" height="12" rx="3" className="dg-fw-sw" /> },
  { k: 'ext', label: 'External system', swatch: <rect x="2" y="3" width="18" height="12" rx="4" className="dg-ext-sw" /> },
  { k: 'data', label: 'Data / signal', swatch: <line x1="1" y1="9" x2="21" y2="9" className="dg-data-sw" /> },
  { k: 'radio', label: 'Wireless', swatch: <line x1="1" y1="9" x2="21" y2="9" className="dg-radio-sw" /> },
  { k: 'power', label: 'Power', swatch: <line x1="1" y1="9" x2="21" y2="9" className="dg-power-sw" /> },
  { k: 'audio', label: 'Audio', swatch: <line x1="1" y1="9" x2="21" y2="9" className="dg-audio-sw" /> },
  { k: 'debug', label: 'Debug / test', swatch: <line x1="1" y1="9" x2="21" y2="9" className="dg-debug-sw" /> },
];

/**
 * @brief Key explaining the block and link styles.
 * @param only Optional subset of keys to show.
 * @returns The legend list.
 */
export function Legend({ only }: { only?: string[] }) {
  const items = only ? LEGEND.filter((l) => only.includes(l.k)) : LEGEND;
  return (
    <ul className="dg-legend" aria-label="Diagram key">
      {items.map((l) => (
        <li key={l.k}>
          <svg width="22" height="18" aria-hidden="true">
            {l.swatch}
          </svg>
          {l.label}
        </li>
      ))}
    </ul>
  );
}

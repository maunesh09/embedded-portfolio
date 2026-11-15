/**
 * @file PcbExplorer.tsx
 * @brief Interactive two-layer circuit board used as a map of where the work happens.
 */

import { useState, type ReactNode } from 'react';
import { layers } from '../content/site';

/**
 * A two-layer board drawn as a system map. Each component group stands for a
 * part of a connected product; selecting one explains the work done there.
 * Signal pulses travel the copper: data in amber, power in cyan, RF in
 * magenta, debug in blue.
 */
type PartId = 'silicon' | 'firmware' | 'board' | 'link' | 'debug';

/**
 * @brief Look up the description text for a system layer.
 * @param id Layer id from site.ts (firmware, silicon, board or link).
 * @returns The layer text, or an empty string.
 */
const layerText = (id: string) => layers.find((l) => l.id === id)?.text ?? '';

const PARTS: { id: PartId; refs: string; name: string; text: string }[] = [
  { id: 'silicon', refs: 'U1, Y1', name: 'MCU and clock', text: layerText('silicon') },
  { id: 'firmware', refs: 'U4', name: 'Firmware in flash', text: layerText('firmware') },
  { id: 'link', refs: 'ANT1, L1, C5', name: 'Radio and antenna', text: `${layerText('link')} Currently: Bluetooth Channel Sounding on nRF54.` },
  { id: 'board', refs: 'J2, U3, C1, C2', name: 'Power and board', text: layerText('board') },
  {
    id: 'debug',
    refs: 'J1, D1',
    name: 'Debug and test',
    text: 'SWD and UART logging for bring-up, a scope and logic analyzer on the bench, and unit tests written for every project.',
  },
];

/**
 * @brief Draw a row or column of component pads.
 * @param x X of the first pad.
 * @param y Y of the first pad.
 * @param n Number of pads.
 * @param dx X step between pads.
 * @param dy Y step between pads.
 * @param w Pad width.
 * @param h Pad height.
 * @returns The pad rectangles.
 */
function Pins({ x, y, n, dx, dy, w, h }: { x: number; y: number; n: number; dx: number; dy: number; w: number; h: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + dx * i} y={y + dy * i} width={w} height={h} className="pcb-pad" />
      ))}
    </>
  );
}

/**
 * @brief Group of board elements that highlights together and selects an area.
 * @param id Which board area this group represents.
 * @param active The area currently hovered, or null.
 * @param set Callback to select an area (null clears the hover).
 * @param children The SVG elements in this group.
 * @returns An SVG group with hover and click handling.
 */
function Part({ id, active, set, children }: { id: PartId; active: PartId | null; set: (p: PartId | null) => void; children: ReactNode }) {
  return (
    <g
      className={`pcb-part${active === id ? ' is-on' : ''}${active && active !== id ? ' is-dim' : ''}`}
      onMouseEnter={() => set(id)}
      onMouseLeave={() => set(null)}
      onClick={() => set(id)}
    >
      {children}
    </g>
  );
}

/**
 * @brief Render the board, its area buttons and the description panel.
 * @details Hover previews an area; click or focus pins it. The button list is the
 * keyboard-accessible way to explore the board.
 * @returns The explorer element.
 */
export function PcbExplorer() {
  const [active, setActive] = useState<PartId | null>(null);
  const [pinned, setPinned] = useState<PartId>('silicon');
  const shown = PARTS.find((p) => p.id === (active ?? pinned))!;
  /**
   * @brief Preview an area and, when one is given, pin it as the shown area.
   * @param p Area to show, or null to clear the hover preview.
   */
  const set = (p: PartId | null) => {
    setActive(p);
    if (p) setPinned(p);
  };

  return (
    <div className="pcb">
      <div className="pcb-board dg-scroll" tabIndex={-1}>
        <svg viewBox="0 0 900 520" className="pcb-svg" role="img" aria-label="Circuit board with an MCU, flash memory, power regulator, USB connector, crystal, antenna, SWD debug header and LED, joined by copper traces.">
          <rect x="10" y="10" width="880" height="500" rx="18" className="pcb-mask" />
          <rect x="22" y="22" width="856" height="476" rx="12" className="pcb-edge" />
          {[
            [44, 44],
            [856, 44],
            [44, 476],
            [856, 476],
          ].map(([cx, cy]) => (
            <g key={`${cx}${cy}`}>
              <circle cx={cx} cy={cy} r="13" className="pcb-ring" />
              <circle cx={cx} cy={cy} r="7" className="pcb-hole" />
            </g>
          ))}
          <text x="60" y="500" className="pcb-silk">REV A, 2-LAYER</text>

          {/* ── Power ── */}
          <Part id="board" active={active} set={set}>
            <path d="M74,265 H140" className="pcb-cu pcb-cu-pwr" />
            <path d="M182,262 H250 V232 H360" className="pcb-cu pcb-cu-pwr" />
            <path d="M74,265 H140" className="pcb-pulse pcb-p-pwr" />
            <path d="M182,262 H250 V232 H360" className="pcb-pulse pcb-p-pwr" />
            <path d="M115,265 V300 M205,262 V300" className="pcb-cu" />
            <rect x="0" y="228" width="74" height="76" rx="6" className="pcb-metal" />
            <rect x="8" y="246" width="44" height="40" rx="10" className="pcb-usb" />
            <text x="22" y="324" className="pcb-silk">J2</text>
            <rect x="140" y="248" width="42" height="30" rx="2" className="pcb-ic" />
            <Pins x={146} y={240} n={3} dx={12} dy={0} w={6} h={8} />
            <Pins x={152} y={278} n={2} dx={18} dy={0} w={6} h={8} />
            <text x="146" y="236" className="pcb-silk">U3</text>
            <rect x="104" y="300" width="22" height="12" className="pcb-cap" />
            <rect x="194" y="300" width="22" height="12" className="pcb-cap" />
            <text x="100" y="330" className="pcb-silk">C1</text>
            <text x="192" y="330" className="pcb-silk">C2</text>
          </Part>

          {/* ── Clock + MCU ── */}
          <Part id="silicon" active={active} set={set}>
            <path d="M356,133 H384 V180" className="pcb-cu" />
            <rect x="300" y="120" width="56" height="26" rx="8" className="pcb-metal" />
            <text x="300" y="112" className="pcb-silk">Y1</text>
            <rect x="360" y="180" width="150" height="150" rx="4" className="pcb-ic pcb-mcu" />
            <Pins x={372} y={170} n={11} dx={12} dy={0} w={6} h={10} />
            <Pins x={372} y={330} n={11} dx={12} dy={0} w={6} h={10} />
            <Pins x={350} y={192} n={11} dx={0} dy={12} w={10} h={6} />
            <Pins x={510} y={192} n={11} dx={0} dy={12} w={10} h={6} />
            <circle cx="374" cy="194" r="4" className="pcb-dot" />
            <text x="435" y="252" textAnchor="middle" className="pcb-ic-text">U1</text>
            <text x="435" y="272" textAnchor="middle" className="pcb-ic-sub">MCU / SoC</text>
          </Part>

          {/* ── Flash over SPI ── */}
          <Part id="firmware" active={active} set={set}>
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <path d={`M520,${222 + i * 14} H${540 + i * 8} V${262 + i * 12} H600`} className="pcb-cu" />
                <path d={`M520,${222 + i * 14} H${540 + i * 8} V${262 + i * 12} H600`} className="pcb-pulse pcb-p-data" style={{ animationDelay: `${i * 0.18}s` }} />
              </g>
            ))}
            <rect x="606" y="248" width="84" height="62" rx="3" className="pcb-ic" />
            <Pins x={598} y={256} n={4} dx={0} dy={12} w={10} h={6} />
            <Pins x={690} y={256} n={4} dx={0} dy={12} w={10} h={6} />
            <text x="648" y="284" textAnchor="middle" className="pcb-ic-text">U4</text>
            <text x="648" y="300" textAnchor="middle" className="pcb-ic-sub">Flash</text>
          </Part>

          {/* ── RF ── */}
          <Part id="link" active={active} set={set}>
            <path d="M520,192 H560 L600,140 H700" className="pcb-cu pcb-cu-rf" />
            <path d="M520,192 H560 L600,140 H700" className="pcb-pulse pcb-p-rf" />
            <rect x="616" y="132" width="20" height="16" className="pcb-cap" />
            <rect x="650" y="132" width="20" height="16" className="pcb-ind" />
            <text x="612" y="124" className="pcb-silk">C5</text>
            <text x="648" y="124" className="pcb-silk">L1</text>
            <path d="M700,140 V70 H730 V120 H760 V70 H790 V120 H820 V70 H850 V140" className="pcb-cu pcb-ant" />
            <text x="790" y="160" className="pcb-silk">ANT1</text>
            <g className="pcb-waves">
              <path d="M862,60 a30,30 0 0 1 0,60" />
              <path d="M872,48 a44,44 0 0 1 0,84" />
            </g>
          </Part>

          {/* ── Debug ── */}
          <Part id="debug" active={active} set={set}>
            <path d="M420,340 V362 H630 V392" className="pcb-cu" />
            <path d="M456,340 V352 H660 V392" className="pcb-cu" />
            <path d="M420,340 V362 H630 V392" className="pcb-pulse pcb-p-dbg" />
            <path d="M456,340 V352 H660 V392" className="pcb-pulse pcb-p-dbg" style={{ animationDelay: '0.4s' }} />
            <path d="M350,312 H300 V420 H286" className="pcb-cu" />
            <rect x="600" y="392" width="160" height="64" rx="3" className="pcb-header" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <circle cx={630 + i * 25} cy={410} r="6" className="pcb-pin" />
                <circle cx={630 + i * 25} cy={438} r="6" className="pcb-pin" />
              </g>
            ))}
            <text x="600" y="476" className="pcb-silk">J1 SWD</text>
            <rect x="262" y="412" width="24" height="16" className="pcb-res" />
            <text x="258" y="404" className="pcb-silk">R1</text>
            <rect x="214" y="410" width="26" height="20" rx="3" className="pcb-led" />
            <text x="212" y="450" className="pcb-silk">D1</text>
          </Part>
        </svg>
      </div>

      <div className="pcb-side">
        <ul className="pcb-list" aria-label="Board areas">
          {PARTS.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={shown.id === p.id}
                onClick={() => set(p.id)}
                onFocus={() => setPinned(p.id)}
                onMouseEnter={() => setActive(p.id)}
                onMouseLeave={() => setActive(null)}
              >
                <span className="pcb-refs">{p.refs}</span>
                <span className="pcb-name">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="pcb-info" aria-live="polite">
          <span className="pcb-refs">{shown.refs}</span>
          <h3>{shown.name}</h3>
          <p>{shown.text}</p>
        </div>
      </div>
    </div>
  );
}

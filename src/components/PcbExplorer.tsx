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
  { id: 'silicon', refs: 'U1, Y1, C3, C4', name: 'MCU and clock', text: layerText('silicon') },
  { id: 'firmware', refs: 'U4', name: 'Firmware in flash', text: layerText('firmware') },
  { id: 'link', refs: 'ANT1, L1, C5', name: 'Radio and antenna', text: `${layerText('link')} Currently: Bluetooth Channel Sounding on nRF54.` },
  { id: 'board', refs: 'J2, U3, C1, C2, C6–C9', name: 'Power and board', text: layerText('board') },
  {
    id: 'debug',
    refs: 'J1, D1, TP1–TP7',
    name: 'Debug and test',
    text: 'SWD and UART logging for bring-up, test pads on the nets worth probing, a scope and logic analyzer on the bench, and unit tests written for every project.',
  },
];

/**
 * Ground stitching vias, kept deliberately sparse (20 in total). A ring around the edge
 * ties the top and bottom ground pours together, a short fence shields the RF feed, and
 * one field via sits in open copper.
 * The antenna area is a keep-out (no copper or vias near a PCB antenna), and the J2
 * connector and silkscreen text are left clear.
 */
const STITCH: Record<'perimeter' | 'rfFence' | 'field', [number, number][]> = {
  perimeter: [[140, 30], [290, 30], [470, 30], [250, 492], [400, 492], [550, 492], [700, 492], [28, 110], [28, 170], [28, 350], [28, 410], [752, 270], [752, 340], [752, 410]],
  rfFence: [],
  field: [],
};

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
 * @brief Ground via: a plated hole connecting a part to the ground plane.
 * @param x Via centre x.
 * @param y Via centre y.
 * @param r Annular ring radius; stitching vias use a smaller ring than part vias.
 * @returns The via drawing.
 */
function GndVia({ x, y, r = 5 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} className="pcb-ring" />
      <circle cx={x} cy={y} r={r * 0.44} className="pcb-hole" />
    </g>
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
        <svg viewBox="2 4 780 512" className="pcb-svg" role="img" aria-label="Circuit board with an MCU, flash memory, a voltage regulator fed by a battery connector, a crystal with load capacitors, decoupling capacitors, a vertical antenna, an SWD debug header, test pads and an LED, joined by copper traces.">
          <rect x="10" y="10" width="760" height="500" rx="18" className="pcb-mask" />
          <rect x="22" y="22" width="736" height="476" rx="12" className="pcb-edge" />
          {/* Three mounting holes: none in the antenna corner, where metal hardware would detune it */}
          {[
            [44, 44],
            [44, 476],
            [736, 476],
          ].map(([cx, cy]) => (
            <g key={`${cx}${cy}`}>
              <circle cx={cx} cy={cy} r="13" className="pcb-ring" />
              <circle cx={cx} cy={cy} r="7" className="pcb-hole" />
            </g>
          ))}
          <text x="60" y="500" className="pcb-silk">REV B, 2-LAYER</text>

          {/* ── Ground stitching (drawn under the parts) ── */}
          <g className="pcb-stitch" aria-hidden="true">
            {[...STITCH.perimeter, ...STITCH.rfFence, ...STITCH.field].map(([x, y]) => (
              <GndVia key={`${x},${y}`} x={x} y={y} r={3.6} />
            ))}
          </g>

          {/* ── Power: battery input, regulator, decoupling ── */}
          <Part id="board" active={active} set={set}>
            {/* J2: JST-PH 2-pin battery connector, leads leaving the board edge */}
            <path d="M0,244 C16,244 22,249 36,249" className="pcb-wire pcb-wire-red" />
            <path d="M0,278 C16,278 22,265 36,265" className="pcb-wire pcb-wire-black" />
            <rect x="76" y="248" width="12" height="10" className="pcb-pad" />
            <rect x="76" y="264" width="12" height="10" className="pcb-pad" />
            <rect x="36" y="237" width="40" height="40" rx="2" className="pcb-jst" />
            <rect x="68" y="232" width="8" height="6" className="pcb-jst" />
            <rect x="68" y="276" width="8" height="6" className="pcb-jst" />
            <rect x="41" y="243" width="10" height="12" className="pcb-jst-slot" />
            <rect x="41" y="259" width="10" height="12" className="pcb-jst-slot" />
            <text x="36" y="226" className="pcb-silk">J2 BATT</text>
            <text x="92" y="245" className="pcb-silk">+</text>

            {/*
              U3 regulator (SOT-23-5), pins facing J2: left side VIN, GND, EN; right side
              VOUT, NC. Battery + runs straight into VIN and battery − straight into GND.
              EN drops to a via and is tied to VIN on the bottom layer.
            */}
            <path d="M88,253 H142" className="pcb-cu pcb-cu-pwr" />
            <path d="M188,253 H250 V231 H350" className="pcb-cu pcb-cu-pwr" />
            <path d="M88,253 H142" className="pcb-pulse pcb-p-pwr" />
            <path d="M188,253 H250 V231 H350" className="pcb-pulse pcb-p-pwr" />
            <path d="M88,269 H142 M100,269 V279" className="pcb-cu" />
            <GndVia x={100} y={284} />
            <path d="M142,285 H131" className="pcb-cu" />
            <GndVia x={126} y={285} r={4} />

            <rect x="150" y="244" width="30" height="50" rx="2" className="pcb-ic" />
            <Pins x={142} y={250} n={3} dx={0} dy={16} w={8} h={6} />
            <Pins x={180} y={250} n={2} dx={0} dy={32} w={8} h={6} />
            <text x="152" y="238" className="pcb-silk">U3</text>

            {/*
              Capacitors on the power rail stand off the wide trace and connect through
              thin necks of equal width on both pads. Similar copper on each pad keeps
              reflow heating even, which avoids tombstoning.
            */}
            {/* C1: input capacitor at VIN */}
            <path d="M115,253 V236 M115,216 V210" className="pcb-cu" />
            <rect x="109" y="216" width="12" height="20" className="pcb-cap" />
            <GndVia x={115} y={205} />
            <text x="126" y="230" className="pcb-silk">C1</text>

            {/* C2: output capacitor at VOUT */}
            <path d="M215,253 V270 M215,290 V296" className="pcb-cu" />
            <rect x="209" y="270" width="12" height="20" className="pcb-cap" />
            <GndVia x={215} y={301} />
            <text x="226" y="286" className="pcb-silk">C2</text>

            {/* C9: 4.7 µF bulk capacitor at the U1 power entry */}
            <path d="M287,231 V248 M287,274 V280" className="pcb-cu" />
            <rect x="279" y="248" width="16" height="26" className="pcb-cap pcb-cap-bulk" />
            <GndVia x={287} y={285} />
            <text x="278" y="305" className="pcb-silk">C9</text>

            {/* C6, C7, C8: 100 nF decoupling, one beside each U1 VCC pin */}
            <path d="M330,231 V248 M330,268 V274" className="pcb-cu" />
            <rect x="324" y="248" width="12" height="20" className="pcb-cap" />
            <GndVia x={330} y={279} />
            <text x="322" y="299" className="pcb-silk">C6</text>

            <path d="M387,340 V350 M387,370 V377" className="pcb-cu" />
            <rect x="381" y="350" width="12" height="20" className="pcb-cap" />
            <GndVia x={387} y={382} />
            <text x="398" y="366" className="pcb-silk">C7</text>

            <path d="M520,315 H532 M552,315 H559" className="pcb-cu" />
            <rect x="532" y="309" width="20" height="12" className="pcb-cap" />
            <GndVia x={564} y={315} />
            <text x="534" y="338" className="pcb-silk">C8</text>
          </Part>

          {/* ── Clock + MCU ── */}
          <Part id="silicon" active={active} set={set}>
            {/* Y1 crystal beside U1's clock pins, C3/C4 load capacitors to ground */}
            <path d="M375,142 V170 M411,142 V170" className="pcb-cu" />
            <path d="M350,130 H365 M421,130 H436" className="pcb-cu" />
            <rect x="330" y="124" width="20" height="12" className="pcb-cap" />
            <rect x="436" y="124" width="20" height="12" className="pcb-cap" />
            <path d="M330,130 H325 M456,130 H461" className="pcb-cu" />
            <GndVia x={320} y={130} />
            <GndVia x={466} y={130} />
            <rect x="365" y="118" width="56" height="24" rx="6" className="pcb-metal" />
            <text x="385" y="111" className="pcb-silk">Y1</text>
            <text x="331" y="118" className="pcb-silk">C3</text>
            <text x="437" y="118" className="pcb-silk">C4</text>

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
            {/*
              SPI bus, U1 right-side pins 3–6 to U4 left-side pads 0–3, both on pin centres.
              Lower traces bend earlier (further left), so no horizontal run crosses
              another trace's vertical run.
            */}
            {[0, 1, 2, 3].map((i) => {
              const d = `M520,${231 + i * 12} H${568 - i * 8} V${259 + i * 12} H598`;
              return (
                <g key={i}>
                  <path d={d} className="pcb-cu" />
                  <path d={d} className="pcb-pulse pcb-p-data" style={{ animationDelay: `${i * 0.18}s` }} />
                </g>
              );
            })}
            <rect x="606" y="248" width="84" height="62" rx="3" className="pcb-ic" />
            <Pins x={598} y={256} n={4} dx={0} dy={12} w={10} h={6} />
            <Pins x={690} y={256} n={4} dx={0} dy={12} w={10} h={6} />
            <text x="648" y="284" textAnchor="middle" className="pcb-ic-text">U4</text>
            <text x="648" y="300" textAnchor="middle" className="pcb-ic-sub">Flash</text>
          </Part>

          {/* ── RF: straight feed, matching network, vertical antenna on the board edge ── */}
          <Part id="link" active={active} set={set}>
            <path d="M520,195 H640" className="pcb-cu pcb-cu-rf" />
            <path d="M520,195 H640" className="pcb-pulse pcb-p-rf" />
            <rect x="548" y="187" width="20" height="16" className="pcb-cap" />
            <rect x="590" y="187" width="20" height="16" className="pcb-ind" />
            <text x="549" y="181" className="pcb-silk">C5</text>
            <text x="592" y="181" className="pcb-silk">L1</text>
            <path d="M640,195 H750 V165 H690 V135 H750 V105 H690 V75 H750 V45" className="pcb-cu pcb-ant" />
            <text x="640" y="150" className="pcb-silk">ANT1</text>
            <g className="pcb-waves">
              <path d="M758,106 a14,14 0 0 1 0,28" />
              <path d="M760,98 a20,20 0 0 1 0,40" />
            </g>
          </Part>

          {/* ── Debug and test ── */}
          <Part id="debug" active={active} set={set}>
            {/* SWD to J1, with an in-line test pad on each line */}
            <path d="M423,340 V376 H470 V410" className="pcb-cu" />
            <path d="M459,340 V360 H520 V410" className="pcb-cu" />
            <path d="M423,340 V376 H470 V410" className="pcb-pulse pcb-p-dbg" />
            <path d="M459,340 V360 H520 V410" className="pcb-pulse pcb-p-dbg" style={{ animationDelay: '0.4s' }} />
            <circle cx="446" cy="376" r="6" className="pcb-tp" />
            <text x="424" y="397" className="pcb-silk">SWDIO</text>
            <circle cx="490" cy="360" r="6" className="pcb-tp" />
            <text x="528" y="376" className="pcb-silk">SWCLK</text>

            <rect x="440" y="410" width="160" height="64" rx="3" className="pcb-header" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <circle cx={470 + i * 25} cy={428} r="6" className="pcb-pin" />
                <circle cx={470 + i * 25} cy={456} r="6" className="pcb-pin" />
              </g>
            ))}
            <text x="608" y="446" className="pcb-silk">J1 SWD</text>

            {/* UART test pads from two U1 top-side pins */}
            <path d="M483,170 V152 M495,170 V160 H506 V152" className="pcb-cu" />
            <circle cx="483" cy="146" r="6" className="pcb-tp" />
            <circle cx="506" cy="146" r="6" className="pcb-tp" />
            <text x="477" y="134" className="pcb-silk">TX</text>
            <text x="500" y="134" className="pcb-silk">RX</text>

            {/* SPI clock test pad, on a short stub off the SCK line */}
            <path d="M568,231 H578" className="pcb-cu" />
            <circle cx="584" cy="231" r="6" className="pcb-tp" />
            <text x="594" y="235" className="pcb-silk">CLK</text>

            {/* Supply and ground test pads beside the regulator output */}
            <path d="M268,231 V212" className="pcb-cu" />
            <circle cx="268" cy="206" r="6" className="pcb-tp" />
            <text x="258" y="194" className="pcb-silk">3V3</text>
            <circle cx="298" cy="206" r="6" className="pcb-tp" />
            <text x="288" y="194" className="pcb-silk">GND</text>

            {/* Status LED */}
            <path d="M350,315 H300 V420 H286" className="pcb-cu" />
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

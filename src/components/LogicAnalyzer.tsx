/**
 * @file LogicAnalyzer.tsx
 * @brief Logic-analyzer capture that encodes real bytes as UART, SPI or I²C waveforms.
 */

import { useMemo, useRef, useState } from 'react';

/**
 * A logic-analyzer capture of real bytes. The waveforms are generated from the
 * text below using the actual framing rules of each protocol, and every byte
 * can be decoded by hovering or tabbing to it.
 */
type Proto = 'uart' | 'spi' | 'i2c';

interface Frame {
  start: number;
  end: number;
  byte: number;
  addr?: boolean;
}
interface Capture {
  channels: { name: string; levels: number[] }[];
  frames: Frame[];
  marks: { tick: number; label: string; ch: number }[];
  ticks: number;
  /** microseconds per bit */
  bitUs: number;
  rate: string;
  framing: string;
  order: string;
}

const I2C_ADDR = 0x48;

/**
 * @brief Encode bytes as a UART TX waveform (8N1, LSB first, idle high).
 * @details Time is sampled at two ticks per bit. Start and stop bits are marked.
 * @param bytes Bytes to send.
 * @returns Channel levels, decoded frames and markers for the capture.
 */
function buildUart(bytes: number[]): Capture {
  const tx: number[] = [];
  const frames: Frame[] = [];
  const marks: Capture['marks'] = [];
  /**
   * @brief Append a level to the TX line for n ticks.
   * @param v Line level, 0 or 1.
   * @param n Number of ticks, default 2 (one bit).
   */
  const push = (v: number, n = 2) => {
    for (let i = 0; i < n; i++) tx.push(v);
  };
  push(1, 6);
  for (const b of bytes) {
    const start = tx.length;
    marks.push({ tick: start + 1, label: 'S', ch: 0 });
    push(0);
    for (let i = 0; i < 8; i++) push((b >> i) & 1);
    marks.push({ tick: tx.length + 1, label: 'P', ch: 0 });
    push(1);
    frames.push({ start, end: tx.length, byte: b });
    push(1);
  }
  push(1, 4);
  return {
    channels: [{ name: 'TX', levels: tx }],
    frames,
    marks,
    ticks: tx.length,
    bitUs: 1e6 / 115200,
    rate: '115200 baud, 8N1',
    framing: 'Start bit, eight data bits, stop bit. Line idles high.',
    order: 'LSB first',
  };
}

/**
 * @brief Encode bytes as SPI mode 0 (CS, SCK, MOSI), MSB first.
 * @details Data changes while SCK is low and is sampled on the rising edge. CS stays low
 * for the whole transfer.
 * @param bytes Bytes to send.
 * @returns Channel levels and decoded frames for the capture.
 */
function buildSpi(bytes: number[]): Capture {
  const cs: number[] = [];
  const sck: number[] = [];
  const mosi: number[] = [];
  const frames: Frame[] = [];
  /**
   * @brief Append one tick to all three SPI lines.
   * @param c Chip-select level.
   * @param k Clock level.
   * @param m MOSI level.
   */
  const t = (c: number, k: number, m: number) => {
    cs.push(c);
    sck.push(k);
    mosi.push(m);
  };
  for (let i = 0; i < 4; i++) t(1, 0, 0);
  t(0, 0, 0);
  t(0, 0, 0);
  for (const b of bytes) {
    const start = cs.length;
    for (let i = 7; i >= 0; i--) {
      const bit = (b >> i) & 1;
      t(0, 0, bit);
      t(0, 1, bit);
    }
    frames.push({ start, end: cs.length, byte: b });
    t(0, 0, 0);
    t(0, 0, 0);
  }
  for (let i = 0; i < 4; i++) t(1, 0, 0);
  return {
    channels: [
      { name: 'CS', levels: cs },
      { name: 'SCK', levels: sck },
      { name: 'MOSI', levels: mosi },
    ],
    frames,
    marks: [],
    ticks: cs.length,
    bitUs: 1,
    rate: '1 MHz, mode 0',
    framing: 'Chip select held low; data sampled on each rising clock edge.',
    order: 'MSB first',
  };
}

/**
 * @brief Encode bytes as an I²C write to address 0x48.
 * @details Produces a start condition, the address byte with R/W = 0, each data byte
 * followed by an ACK, then a stop condition. SDA changes only while SCL is low,
 * except for start and stop.
 * @param bytes Data bytes to write.
 * @returns Channel levels, decoded frames and markers for the capture.
 */
function buildI2c(bytes: number[]): Capture {
  const scl: number[] = [];
  const sda: number[] = [];
  const frames: Frame[] = [];
  const marks: Capture['marks'] = [];
  /**
   * @brief Append one tick to SCL and SDA.
   * @param c SCL level.
   * @param d SDA level.
   */
  const t = (c: number, d: number) => {
    scl.push(c);
    sda.push(d);
  };
  for (let i = 0; i < 4; i++) t(1, 1);
  marks.push({ tick: scl.length, label: 'Start', ch: 1 });
  t(1, 0);
  /**
   * @brief Clock out one byte MSB first, followed by an ACK bit.
   * @param b The byte on the wire.
   * @param addr True when this is the address byte (decoded as "0x48 W").
   */
  const sendByte = (b: number, addr = false) => {
    const start = scl.length;
    for (let i = 7; i >= 0; i--) {
      const bit = (b >> i) & 1;
      t(0, bit);
      t(1, bit);
    }
    marks.push({ tick: scl.length, label: 'A', ch: 1 });
    t(0, 0);
    t(1, 0);
    frames.push({ start, end: scl.length, byte: addr ? I2C_ADDR : b, addr });
  };
  sendByte((I2C_ADDR << 1) | 0, true);
  bytes.forEach((b) => sendByte(b));
  t(0, 0);
  t(1, 0);
  marks.push({ tick: scl.length, label: 'Stop', ch: 1 });
  for (let i = 0; i < 4; i++) t(1, 1);
  return {
    channels: [
      { name: 'SCL', levels: scl },
      { name: 'SDA', levels: sda },
    ],
    frames,
    marks,
    ticks: scl.length,
    bitUs: 10,
    rate: '100 kHz, address 0x48',
    framing: 'Start condition, 7-bit address and write bit, then data; each byte acknowledged.',
    order: 'MSB first',
  };
}

const PROTOS: { id: Proto; label: string }[] = [
  { id: 'uart', label: 'UART' },
  { id: 'spi', label: 'SPI' },
  { id: 'i2c', label: 'I²C' },
];

const W = 1100;
const LABEL_W = 64;
const DECODE_Y = 16;
const CH_TOP = 66;
const CH_GAP = 54;
const SWING = 26;

/**
 * @brief Format a byte as 0xNN.
 * @param b Byte value.
 * @returns Upper-case hexadecimal string.
 */
const hex = (b: number) => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`;
/**
 * @brief Format a byte as two binary nibbles, e.g. "0111 0101".
 * @param b Byte value.
 * @returns Binary string.
 */
const bin = (b: number) => b.toString(2).padStart(8, '0').replace(/(\d{4})/, '$1 ');
/**
 * @brief Format a duration for the readout.
 * @param us Duration in microseconds.
 * @returns "12.3 µs", or milliseconds above 1000 µs.
 */
const fmtUs = (us: number) => (us >= 1000 ? `${(us / 1000).toFixed(2)} ms` : `${us.toFixed(1)} µs`);

/**
 * @brief Render the analyzer: protocol switch, trace screen, decode bubbles and readout.
 * @details Hovering the trace shows a time cursor and selects the byte under it; decode
 * bubbles are focusable so the capture can be read with the keyboard.
 * @param text Text whose characters are encoded and sent.
 * @returns The analyzer element.
 */
export function LogicAnalyzer({ text }: { text: string }) {
  const [proto, setProto] = useState<Proto>('uart');
  const [sel, setSel] = useState<number | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const bytes = useMemo(() => [...text].map((c) => c.charCodeAt(0) & 0xff), [text]);
  const cap = useMemo(() => (proto === 'uart' ? buildUart(bytes) : proto === 'spi' ? buildSpi(bytes) : buildI2c(bytes)), [proto, bytes]);

  const plotW = W - LABEL_W - 12;
  const tw = plotW / cap.ticks;
  /**
   * @brief Convert a tick index to an SVG x coordinate.
   * @param tick Tick index (two ticks per bit).
   * @returns X position in viewBox units.
   */
  const x = (tick: number) => LABEL_W + tick * tw;
  const H = CH_TOP + cap.channels.length * CH_GAP + 8;

  /**
   * @brief Build a step-waveform SVG path for one channel.
   * @param levels Line level for each tick.
   * @param base Y coordinate of the channel's high level.
   * @returns An SVG path "d" string.
   */
  const path = (levels: number[], base: number) => {
    /**
     * @brief Map a logic level to a y coordinate.
     * @param v Level, 0 or 1.
     * @returns Y position in viewBox units.
     */
    const y = (v: number) => base + (v ? 0 : SWING);
    let d = `M${x(0)},${y(levels[0])}`;
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] !== levels[i - 1]) d += ` L${x(i)},${y(levels[i - 1])} L${x(i)},${y(levels[i])}`;
    }
    return d + ` L${x(levels.length)},${y(levels[levels.length - 1])}`;
  };

  /**
   * @brief Convert a mouse x position to a (fractional) tick.
   * @param clientX Pointer x in viewport pixels.
   * @returns The tick under the pointer, or null outside the plot.
   */
  const tickAt = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    const vx = ((clientX - r.left) / r.width) * W;
    const t = (vx - LABEL_W) / tw;
    return t >= 0 && t <= cap.ticks ? t : null;
  };

  const frame = sel !== null ? cap.frames[sel] : null;
  /**
   * @brief Switch protocol and clear the selection and cursor.
   * @param p The protocol to show.
   */
  const change = (p: Proto) => {
    setProto(p);
    setSel(null);
    setCursor(null);
  };

  return (
    <div className="la">
      <div className="la-bar">
        <div className="la-title">
          <span className="la-led" aria-hidden="true" />
          Capture: “{text}” over {PROTOS.find((p) => p.id === proto)!.label}
        </div>
        <div className="la-protos" role="group" aria-label="Protocol">
          {PROTOS.map((p) => (
            <button key={p.id} type="button" aria-pressed={proto === p.id} onClick={() => change(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="la-rate">{cap.rate}</div>
      </div>

      <div className="la-screen dg-scroll" tabIndex={-1}>
        <svg
          key={proto}
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="la-svg"
          role="img"
          aria-label={`Logic analyzer trace of the text ${text} sent over ${proto.toUpperCase()}. ${cap.framing}`}
          onMouseMove={(e) => {
            const t = tickAt(e.clientX);
            setCursor(t);
            if (t !== null) {
              const i = cap.frames.findIndex((f) => t >= f.start && t < f.end);
              if (i >= 0) setSel(i);
            }
          }}
          onMouseLeave={() => setCursor(null)}
        >
          <defs>
            <clipPath id={`la-reveal-${proto}`}>
              <rect x="0" y="0" width={reduced ? W : 0} height={H}>
                {!reduced && <animate attributeName="width" from="0" to={W} dur="1.3s" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" keyTimes="0;1" />}
              </rect>
            </clipPath>
          </defs>

          {/* time grid: one line per byte-time */}
          {Array.from({ length: Math.floor(cap.ticks / 8) + 1 }, (_, i) => (
            <line key={i} x1={x(i * 8)} y1={DECODE_Y - 6} x2={x(i * 8)} y2={H - 4} className="la-grid" />
          ))}

          {frame && <rect x={x(frame.start)} y={DECODE_Y - 8} width={(frame.end - frame.start) * tw} height={H - DECODE_Y} className="la-sel" />}

          <g clipPath={`url(#la-reveal-${proto})`}>
            {cap.channels.map((c, i) => {
              const base = CH_TOP + i * CH_GAP;
              return (
                <g key={c.name}>
                  <text x={8} y={base + SWING / 2 + 4} className="la-ch">{c.name}</text>
                  <path d={path(c.levels, base)} className={`la-wave la-wave-${i}`} />
                </g>
              );
            })}
            {cap.marks.map((m, i) => (
              <text key={i} x={x(m.tick) + 2} y={CH_TOP + m.ch * CH_GAP - 5} className="la-mark">
                {m.label}
              </text>
            ))}
            {cap.frames.map((f, i) => {
              const x1 = x(f.start) + 2;
              const x2 = x(f.end) - 2;
              const label = f.addr ? `${hex(f.byte)} W` : `‘${String.fromCharCode(f.byte)}’ ${hex(f.byte)}`;
              return (
                <g
                  key={i}
                  className={`la-frame${sel === i ? ' is-sel' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-label={f.addr ? `Address ${hex(f.byte)}, write` : `Byte ${i + 1}: ${String.fromCharCode(f.byte)}, ${hex(f.byte)}`}
                  aria-pressed={sel === i}
                  onFocus={() => setSel(i)}
                  onClick={() => setSel(i)}
                >
                  <polygon
                    points={`${x1},${DECODE_Y + 13} ${x1 + 7},${DECODE_Y} ${x2 - 7},${DECODE_Y} ${x2},${DECODE_Y + 13} ${x2 - 7},${DECODE_Y + 26} ${x1 + 7},${DECODE_Y + 26}`}
                  />
                  <text x={(x1 + x2) / 2} y={DECODE_Y + 17.5} textAnchor="middle">{label}</text>
                </g>
              );
            })}
          </g>

          {cursor !== null && (
            <g className="la-cursor" pointerEvents="none">
              <line x1={x(cursor)} y1={DECODE_Y - 8} x2={x(cursor)} y2={H} />
              <text x={x(cursor) + (cursor > cap.ticks * 0.85 ? -6 : 6)} y={H - 6} textAnchor={cursor > cap.ticks * 0.85 ? 'end' : 'start'}>
                t = {fmtUs((cursor / 2) * cap.bitUs)}
              </text>
            </g>
          )}
        </svg>
      </div>

      <dl className="la-readout" aria-live="polite">
        {frame ? (
          <>
            <div>
              <dt>{frame.addr ? 'Address' : 'Character'}</dt>
              <dd>{frame.addr ? `${hex(frame.byte)} (write)` : `‘${String.fromCharCode(frame.byte)}’`}</dd>
            </div>
            <div>
              <dt>Hex</dt>
              <dd>{frame.addr ? hex((frame.byte << 1) | 0) : hex(frame.byte)}</dd>
            </div>
            <div>
              <dt>Binary</dt>
              <dd>{bin(frame.addr ? (frame.byte << 1) | 0 : frame.byte)}</dd>
            </div>
            <div>
              <dt>Bit order</dt>
              <dd>{cap.order}</dd>
            </div>
            <div>
              <dt>Frame time</dt>
              <dd>{fmtUs(((frame.end - frame.start) / 2) * cap.bitUs)}</dd>
            </div>
          </>
        ) : (
          <div className="la-hint">
            <dt>{cap.framing}</dt>
            <dd>Hover the trace, or tap or tab through the decoded bytes.</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

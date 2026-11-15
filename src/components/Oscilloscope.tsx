/**
 * @file Oscilloscope.tsx
 * @brief Four-channel oscilloscope used as the home-page hero.
 * @details Signals are simulated: an RF packet burst, a 5 kHz PWM output, a 16 kHz audio
 * tone and a 3V3 rail power-cycling. At the 100 µs/div reference timebase the readouts
 * match the drawn waveforms.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/**
 * A four-channel oscilloscope with simulated signals from embedded work:
 * an RF packet burst, a PWM output, a crystal oscillator and a power rail
 * cycling on and off. Channels, timebase and run/stop are real controls.
 */
interface Channel {
  id: 1 | 2 | 3 | 4;
  name: string;
  vdiv: string;
  offset: number;
  /**
   * @brief Signal model.
   * @param x Time in divisions at the 100 µs/div reference timebase.
   * @returns Amplitude in vertical divisions, before the channel offset.
   */
  fn: (x: number) => number;
  /**
   * @brief Measurements shown when this channel is selected.
   * @returns Label/value pairs, derived from the signal model at the reference timebase.
   */
  meas: () => [string, string][];
}

const TAU = Math.PI * 2;

const CHANNELS: Channel[] = [
  {
    id: 1,
    name: 'RF burst envelope',
    vdiv: '200 mV',
    offset: 2.2,
    fn: (x) => {
      const u = ((x % 10) + 10) % 10;
      if (u > 1 && u < 4.6) {
        const env = Math.min(1, (u - 1) * 4) * Math.min(1, (4.6 - u) * 4);
        return 1.4 * env * Math.sin(TAU * u * 5);
      }
      if (u > 6 && u < 7.6) {
        const env = Math.min(1, (u - 6) * 6) * Math.min(1, (7.6 - u) * 6);
        return 0.6 * env * Math.sin(TAU * u * 6);
      }
      return 0;
    },
    meas: () => [
      ['Burst', '360 µs'],
      ['Vpp', '560 mV'],
    ],
  },
  {
    id: 2,
    name: 'PWM, 25% duty',
    vdiv: '2 V',
    offset: 0.4,
    fn: (x) => {
      const u = ((x % 2) + 2) % 2;
      return u < 0.5 ? 0.8 : -0.8;
    },
    meas: () => [
      ['Freq', '5.00 kHz'],
      ['Duty', '25.0 %'],
      ['Vpp', '3.20 V'],
    ],
  },
  {
    id: 3,
    name: 'Audio tone, I²S out',
    vdiv: '500 mV',
    offset: -1.4,
    fn: (x) => 0.75 * Math.sin(TAU * x * 1.6),
    meas: () => [
      ['Freq', '16.0 kHz'],
      ['Vpp', '750 mV'],
    ],
  },
  {
    id: 4,
    name: '3V3 rail, power cycle',
    vdiv: '2 V',
    offset: -3.2,
    fn: (x) => {
      const u = ((x % 10) + 10) % 10;
      if (u < 0.6) return 0;
      if (u < 7) return 1.65 * (1 - Math.exp(-(u - 0.6) * 3)) + 0.04 * Math.sin(TAU * u * 9);
      return 1.65 * Math.exp(-(u - 7) * 2.2);
    },
    meas: () => [
      ['Rise 10–90%', '73 µs'],
      ['Vmax', '3.30 V'],
    ],
  },
];

const TIMEBASES = [
  { label: '50 µs', k: 0.5 },
  { label: '100 µs', k: 1 },
  { label: '200 µs', k: 2 },
  { label: '500 µs', k: 4 },
];

const W = 1000;
const H = 400;
const DIV_X = W / 10;
const DIV_Y = H / 8;
const N = 400;

/**
 * @brief Render the scope screen, front-panel controls and measurement bar.
 * @details While running, an animation frame loop advances a phase offset so traces
 * roll across the screen. It starts stopped when the visitor prefers reduced motion.
 * @param children Content overlaid on the screen (the hero copy).
 * @returns The oscilloscope element.
 */
export function Oscilloscope({ children }: { children?: ReactNode }) {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [on, setOn] = useState<Record<number, boolean>>({ 1: true, 2: false, 3: false, 4: true });
  const [focus, setFocus] = useState<1 | 2 | 3 | 4>(1);
  const [tb, setTb] = useState(1);
  const [running, setRunning] = useState(!reduced);
  const [phase, setPhase] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    /**
     * @brief Animation-frame callback that advances the trace phase.
     * @param now Timestamp from requestAnimationFrame, in milliseconds.
     */
    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      setPhase((p) => (p + dt * 0.0012) % 1000);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  const k = TIMEBASES[tb].k;
  const paths = useMemo(
    () =>
      CHANNELS.map((c) => {
        let d = '';
        for (let i = 0; i <= N; i++) {
          const xd = (i / N) * 10;
          const v = c.fn(xd * k + phase) + c.offset;
          const px = (xd * DIV_X).toFixed(1);
          const py = (H / 2 - v * DIV_Y).toFixed(1);
          d += (i ? 'L' : 'M') + px + ',' + py;
        }
        return d;
      }),
    [k, phase],
  );

  const fc = CHANNELS[focus - 1];
  /**
   * @brief Turn a channel on or off and make it the measured channel.
   * @details At least one channel always stays on.
   * @param id Channel number, 1 to 4.
   */
  const toggle = (id: 1 | 2 | 3 | 4) => {
    const next = { ...on, [id]: !on[id] };
    if (!Object.values(next).some(Boolean)) return;
    setOn(next);
    setFocus(id);
  };

  return (
    <div className="osc">
      <div className="osc-screen">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="osc-svg" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} x1={(i + 1) * DIV_X} y1={0} x2={(i + 1) * DIV_X} y2={H} className="osc-grat" />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={(i + 1) * DIV_Y} x2={W} y2={(i + 1) * DIV_Y} className="osc-grat" />
          ))}
          <line x1={W / 2} y1={0} x2={W / 2} y2={H} className="osc-axis" />
          <line x1={0} y1={H / 2} x2={W} y2={H / 2} className="osc-axis" />
          {CHANNELS.map((c, i) =>
            on[c.id] ? <path key={c.id} d={paths[i]} className={`osc-trace osc-ch${c.id}${focus === c.id ? ' is-focus' : ''}`} vectorEffect="non-scaling-stroke" /> : null,
          )}
        </svg>
        <div className="osc-hud">
          <span>
            {CHANNELS.filter((c) => on[c.id]).map((c) => (
              <b key={c.id} className={`osc-tag osc-tag${c.id}`}>CH{c.id} {c.vdiv}</b>
            ))}
          </span>
          <span>{TIMEBASES[tb].label}/div</span>
          <span className={running ? 'osc-run' : 'osc-stop'}>{running ? 'Run' : 'Stop'}</span>
        </div>
        <div className="osc-content">{children}</div>
      </div>

      <div className="osc-panel" role="group" aria-label="Oscilloscope controls">
        <div className="osc-chs">
          {CHANNELS.map((c) => (
            <button key={c.id} type="button" className={`osc-key osc-key${c.id}`} aria-pressed={on[c.id]} onClick={() => toggle(c.id)}>
              <span className="osc-key-id">CH{c.id}</span>
              <span className="osc-key-name">{c.name}</span>
            </button>
          ))}
        </div>
        <div className="osc-tb">
          <span className="osc-tb-label">Timebase</span>
          <div className="osc-tb-row">
            <button type="button" className="osc-knob" aria-label="Faster timebase" disabled={tb === 0} onClick={() => setTb(tb - 1)}>−</button>
            <output aria-live="polite">{TIMEBASES[tb].label}</output>
            <button type="button" className="osc-knob" aria-label="Slower timebase" disabled={tb === TIMEBASES.length - 1} onClick={() => setTb(tb + 1)}>+</button>
          </div>
        </div>
        <button type="button" className={`osc-runbtn${running ? ' is-running' : ''}`} aria-pressed={running} onClick={() => setRunning(!running)}>
          Run / Stop
          <span className="osc-runstate">{running ? 'Running' : 'Stopped'}</span>
        </button>
      </div>

      <dl className="osc-meas" aria-live="polite">
        <div>
          <dt>Measuring</dt>
          <dd className={`osc-tag${fc.id}`}>CH{fc.id} {fc.name}</dd>
        </div>
        {fc.meas().map(([a, b]) => (
          <div key={a}>
            <dt>{a}</dt>
            <dd>{b}</dd>
          </div>
        ))}
        <div className="osc-sim">
          <dt>Source</dt>
          <dd>Simulated signals</dd>
        </div>
      </dl>
    </div>
  );
}

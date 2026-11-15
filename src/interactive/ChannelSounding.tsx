/**
 * @file ChannelSounding.tsx
 * @brief Explainer for phase-based ranging, the principle behind Bluetooth Channel Sounding.
 * @details Data is simulated: tones every 2 MHz across 2402–2480 MHz.
 */

import { useId, useMemo, useState } from 'react';

/**
 * Explainer for phase-based ranging (the principle behind Bluetooth Channel
 * Sounding). Data is simulated: tones every 2 MHz across 2402–2480 MHz.
 */
const C = 299_792_458;
const FREQS = Array.from({ length: 40 }, (_, k) => (2402 + 2 * k) * 1e6);
const DF = 2e6;
const TWO_PI = Math.PI * 2;

// Deterministic Gaussian noise so the picture is stable while dragging.
/**
 * @brief Generate deterministic Gaussian noise samples.
 * @details Uses a fixed-seed linear congruential generator and the Box–Muller
 * transform, so the plot stays stable while sliders move.
 * @param n Number of samples.
 * @returns Samples with zero mean and unit variance.
 */
function noiseSeq(n: number) {
  let s = 12345;
  /**
   * @brief Next uniform pseudo-random number from the LCG.
   * @returns A value in [0, 1].
   */
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  return Array.from({ length: n }, () => {
    const u = Math.max(rnd(), 1e-9);
    const v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TWO_PI * v);
  });
}
const NOISE = noiseSeq(FREQS.length);
/**
 * @brief Wrap a phase into [0, 2π).
 * @param p Phase in radians.
 * @returns The wrapped phase.
 */
const wrap = (p: number) => ((p % TWO_PI) + TWO_PI) % TWO_PI;

/**
 * @brief Render the distance and noise sliders, results and the two phase plots.
 * @details For each tone the round-trip phase is 4π·f·d/c plus noise, observed modulo 2π.
 * The phases are unwrapped across frequency and fitted with least squares; the
 * slope gives the distance estimate d = slope·c/(4π).
 * @returns The explainer element.
 */
export function ChannelSounding() {
  const [d, setD] = useState(4);
  const [noiseDeg, setNoiseDeg] = useState(0);
  const idD = useId();
  const idN = useId();

  const r = useMemo(() => {
    const sigma = (noiseDeg * Math.PI) / 180;
    const wrapped = FREQS.map((f, i) => wrap((4 * Math.PI * f * d) / C + NOISE[i] * sigma));
    const unwrapped: number[] = [];
    wrapped.forEach((p, i) => {
      if (i === 0) return unwrapped.push(p);
      let q = p;
      const prev = unwrapped[i - 1];
      while (q - prev > Math.PI) q -= TWO_PI;
      while (q - prev < -Math.PI) q += TWO_PI;
      unwrapped.push(q);
    });
    const n = FREQS.length;
    const mx = FREQS.reduce((a, b) => a + b, 0) / n;
    const my = unwrapped.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    FREQS.forEach((f, i) => {
      num += (f - mx) * (unwrapped[i] - my);
      den += (f - mx) ** 2;
    });
    const slope = num / den;
    const est = (slope * C) / (4 * Math.PI);
    return { wrapped, unwrapped, slope, intercept: my - slope * mx, est };
  }, [d, noiseDeg]);

  // plot geometry
  const W = 640;
  const L = 46;
  const R = 12;
  const pw = W - L - R;
  /**
   * @brief Map a frequency to an x coordinate on the plots.
   * @param f Frequency in hertz.
   * @returns X position in viewBox units.
   */
  const px = (f: number) => L + ((f - FREQS[0]) / (FREQS[FREQS.length - 1] - FREQS[0])) * pw;
  const P1 = { top: 22, h: 120 };
  const P2 = { top: 190, h: 120 };
  const minU = Math.min(...r.unwrapped, r.intercept + r.slope * FREQS[0]);
  const maxU = Math.max(...r.unwrapped, r.intercept + r.slope * FREQS[FREQS.length - 1]);
  const span = Math.max(maxU - minU, 0.5);
  /**
   * @brief Map a wrapped phase to a y coordinate on the upper plot.
   * @param p Phase in radians, 0 to 2π.
   * @returns Y position in viewBox units.
   */
  const y1 = (p: number) => P1.top + P1.h - (p / TWO_PI) * P1.h;
  /**
   * @brief Map an unwrapped phase to a y coordinate on the lower plot, auto-scaled to the data.
   * @param p Unwrapped phase in radians.
   * @returns Y position in viewBox units.
   */
  const y2 = (p: number) => P2.top + P2.h - ((p - minU) / span) * P2.h;
  const err = (r.est - d) * 100;

  return (
    <div className="cs">
      <div className="cs-controls">
        <label htmlFor={idD}>
          Distance <output>{d.toFixed(1)} m</output>
        </label>
        <input id={idD} type="range" min={0.3} max={30} step={0.1} value={d} onChange={(e) => setD(+e.target.value)} />
        <label htmlFor={idN}>
          Phase noise <output>{noiseDeg}°</output>
        </label>
        <input id={idN} type="range" min={0} max={60} step={1} value={noiseDeg} onChange={(e) => setNoiseDeg(+e.target.value)} />
        <dl className="cs-out">
          <div>
            <dt>Estimated</dt>
            <dd>{r.est.toFixed(2)} m</dd>
          </div>
          <div>
            <dt>Error</dt>
            <dd className={Math.abs(err) > 50 ? 'cs-bad' : ''}>{err >= 0 ? '+' : ''}{err.toFixed(1)} cm</dd>
          </div>
          <div>
            <dt>Unambiguous range</dt>
            <dd>{(C / (2 * DF)).toFixed(0)} m</dd>
          </div>
        </dl>
        <p className="cs-note">
          Each tone’s round-trip phase is 4π·f·d / c, seen only modulo 2π. Unwrapping it across frequency gives a straight
          line whose slope is proportional to distance. Raise the noise and the unwrapping starts to fail, which is why real
          systems combine phase with timing and filtering.
        </p>
      </div>
      <div className="cs-plot dg-scroll">
        <svg viewBox={`0 0 ${W} 340`} className="dg" role="img" aria-label={`Simulated phase against frequency for ${d.toFixed(1)} metres. Estimated distance ${r.est.toFixed(2)} metres.`}>
          <text x={L} y={14} className="dg-note">Measured phase, wrapped to 0–2π</text>
          <rect x={L} y={P1.top} width={pw} height={P1.h} className="cs-frame" />
          {r.wrapped.map((p, i) => (
            <circle key={i} cx={px(FREQS[i])} cy={y1(p)} r={3} className="cs-dot" />
          ))}
          <text x={L - 6} y={P1.top + 4} textAnchor="end" className="dg-sub">2π</text>
          <text x={L - 6} y={P1.top + P1.h} textAnchor="end" className="dg-sub">0</text>

          <text x={L} y={P2.top - 8} className="dg-note">Unwrapped phase and fitted slope</text>
          <rect x={L} y={P2.top} width={pw} height={P2.h} className="cs-frame" />
          <line
            x1={px(FREQS[0])}
            y1={y2(r.intercept + r.slope * FREQS[0])}
            x2={px(FREQS[FREQS.length - 1])}
            y2={y2(r.intercept + r.slope * FREQS[FREQS.length - 1])}
            className="cs-fit"
          />
          {r.unwrapped.map((p, i) => (
            <circle key={i} cx={px(FREQS[i])} cy={y2(p)} r={3} className="cs-dot" />
          ))}
          {[2402, 2440, 2480].map((f) => (
            <text key={f} x={px(f * 1e6)} y={P2.top + P2.h + 16} textAnchor="middle" className="dg-sub">
              {f} MHz
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

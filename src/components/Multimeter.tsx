/**
 * @file Multimeter.tsx
 * @brief Digital multimeter whose dial switches between experience readings.
 */

import { useState } from 'react';
import { site } from '../content/site';

/** A digital multimeter whose dial switches between experience readings. */
const MODES = [
  { id: 'exp', dial: 'EXP', angle: -54, value: '2021', unit: '→ now', caption: 'Professional embedded work since 2021: firmware and electronics hardware together' },
  { id: 'focus', dial: 'FOCUS', angle: -18, value: 'BLE', unit: 'Zephyr', caption: 'Zephyr RTOS and Bluetooth LE, including Channel Sounding and deep sleep' },
  { id: 'edu', dial: 'EDU', angle: 18, value: 'B.E.', unit: '+ PG', caption: 'B.E. in Electronics and Communication (GTU) and postgraduate diploma in embedded systems (Conestoga)' },
  { id: 'loc', dial: 'LOC', angle: 54, value: 'KW', unit: 'ON', caption: `${site.location}. Open to embedded roles and freelance work.` },
] as const;

/**
 * @brief Render the meter: LCD readout, rotary dial with four positions and probe jacks.
 * @details Each dial position is a real button; the pointer rotates to the selected
 * position and the readout updates in an aria-live region.
 * @returns The multimeter element.
 */
export function Multimeter() {
  const [mode, setMode] = useState(0);
  const m = MODES[mode];
  return (
    <div className="dmm">
      <div className="dmm-lcd" aria-live="polite">
        <span className="dmm-mode">{m.dial}</span>
        <span className="dmm-value">{m.value}</span>
        <span className="dmm-unit">{m.unit}</span>
        <p className="dmm-cap">{m.caption}</p>
      </div>
      <div className="dmm-dial-wrap">
        <div className="dmm-dial" aria-hidden="true">
          <span className="dmm-pointer" style={{ transform: `rotate(${m.angle}deg)` }} />
        </div>
        <div className="dmm-modes" role="group" aria-label="Reading">
          {MODES.map((x, i) => (
            <button key={x.id} type="button" aria-pressed={mode === i} onClick={() => setMode(i)} style={{ ['--a' as string]: `${x.angle}deg` }}>
              {x.dial}
            </button>
          ))}
        </div>
      </div>
      <div className="dmm-jacks" aria-hidden="true">
        <span className="dmm-jack dmm-com">COM</span>
        <span className="dmm-jack dmm-vohm">VΩ</span>
      </div>
    </div>
  );
}

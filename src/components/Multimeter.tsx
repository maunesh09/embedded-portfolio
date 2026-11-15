/**
 * @file Multimeter.tsx
 * @brief Digital multimeter whose dial switches between experience readings.
 */

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { site } from '../content/site';

/** Dial positions, in order around the dial (angles in degrees, 0 = straight up). */
const MODES = [
  { id: 'exp', dial: 'EXP', angle: -54, value: '2021', unit: '→ now', caption: 'Professional embedded work since 2021: firmware and electronics hardware together' },
  { id: 'focus', dial: 'FOCUS', angle: -18, value: 'BLE', unit: 'Zephyr', caption: 'Zephyr RTOS and Bluetooth LE, including Channel Sounding and deep sleep' },
  { id: 'edu', dial: 'EDU', angle: 18, value: 'B.E.', unit: '+ PG', caption: 'B.E. in Electronics and Communication (GTU) and postgraduate diploma in embedded systems (Conestoga)' },
  { id: 'loc', dial: 'LOC', angle: 54, value: 'KW', unit: 'ON', caption: `${site.location}. Open to embedded roles and freelance work.` },
] as const;

/** Pointer travel, in pixels, below which a press counts as a click rather than a drag. */
const DRAG_THRESHOLD = 4;

/**
 * @brief Find the dial position closest to an angle.
 * @param deg Angle in degrees, 0 = straight up, positive = clockwise.
 * @returns Index into MODES of the nearest position.
 */
function nearestMode(deg: number): number {
  let best = 0;
  MODES.forEach((m, i) => {
    if (Math.abs(m.angle - deg) < Math.abs(MODES[best].angle - deg)) best = i;
  });
  return best;
}

/**
 * @brief Render the meter: LCD readout, a turnable rotary dial and probe jacks.
 * @details The knob is a real control. Click or tap advances to the next position,
 * dragging turns it and snaps to the nearest position, and arrow keys, Home and End
 * work when it is focused. The labels around it also select a position directly.
 * The readout updates in an aria-live region.
 * @returns The multimeter element.
 */
export function Multimeter() {
  const [mode, setMode] = useState(0);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const m = MODES[mode];

  /**
   * @brief Angle from the knob centre to a pointer position.
   * @param el The knob element.
   * @param clientX Pointer x in viewport pixels.
   * @param clientY Pointer y in viewport pixels.
   * @returns Angle in degrees, 0 = straight up, positive = clockwise.
   */
  const angleAt = (el: HTMLElement, clientX: number, clientY: number) => {
    const r = el.getBoundingClientRect();
    const dx = clientX - (r.left + r.width / 2);
    const dy = clientY - (r.top + r.height / 2);
    return (Math.atan2(dx, -dy) * 180) / Math.PI;
  };

  /**
   * @brief Start a press on the knob and capture the pointer for dragging.
   * @param e The pointer-down event.
   */
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
  };

  /**
   * @brief While pressed, turn the knob to the position nearest the pointer.
   * @param e The pointer-move event.
   */
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < DRAG_THRESHOLD) return;
    d.moved = true;
    setMode(nearestMode(angleAt(e.currentTarget, e.clientX, e.clientY)));
  };

  /**
   * @brief End a press: a press without dragging advances to the next position.
   * @param e The pointer-up event.
   */
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (d && !d.moved) setMode((i) => (i + 1) % MODES.length);
  };

  /**
   * @brief Keyboard control for the focused knob.
   * @details Right/Up turn clockwise, Left/Down anticlockwise, Home and End jump to
   * the ends, and Enter or Space advance like a click.
   * @param e The key-down event.
   */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = MODES.length - 1;
    const next: Record<string, number> = {
      ArrowRight: Math.min(mode + 1, last),
      ArrowUp: Math.min(mode + 1, last),
      ArrowLeft: Math.max(mode - 1, 0),
      ArrowDown: Math.max(mode - 1, 0),
      Home: 0,
      End: last,
      Enter: (mode + 1) % MODES.length,
      ' ': (mode + 1) % MODES.length,
    };
    if (e.key in next) {
      e.preventDefault();
      setMode(next[e.key]);
    }
  };

  return (
    <div className="dmm">
      <div className="dmm-lcd" aria-live="polite">
        <span className="dmm-mode">{m.dial}</span>
        <span className="dmm-value">{m.value}</span>
        <span className="dmm-unit">{m.unit}</span>
        <p className="dmm-cap">{m.caption}</p>
      </div>
      <div className="dmm-dial-wrap">
        <div
          className="dmm-dial"
          role="slider"
          tabIndex={0}
          aria-label="Meter dial"
          aria-valuemin={0}
          aria-valuemax={MODES.length - 1}
          aria-valuenow={mode}
          aria-valuetext={`${m.dial}: ${m.caption}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (drag.current = null)}
          onKeyDown={onKeyDown}
        >
          <span className="dmm-pointer" style={{ transform: `rotate(${m.angle}deg)` }} aria-hidden="true" />
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

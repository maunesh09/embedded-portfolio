/**
 * @file ProtocolSim.tsx
 * @brief Interactive model of the ESP32 emulator's heartbeat and acknowledgement logic.
 * @details A pure reducer drives a four-state machine (Unknown, Online, Late, Offline).
 * Message names are generic; this illustrates the logic, not the real protocol.
 */

import { useEffect, useReducer, useState } from 'react';
import { Esp32States, type SimState } from '../diagrams';

/** Interactive model of the heartbeat / acknowledgement logic (generic, for illustration). */
const LIMIT = 3;

interface Entry {
  n: number;
  text: string;
  tone: 'ok' | 'warn' | 'bad' | 'info';
}
interface S {
  state: SimState;
  missed: number;
  seq: number;
  heard: boolean;
  dropNext: boolean;
  linkUp: boolean;
  n: number;
  log: Entry[];
}
type A = { type: 'register' | 'heartbeat' | 'expire' | 'drop' | 'link' | 'step' | 'reset' };

const init: S = { state: 'unknown', missed: 0, seq: 1, heard: false, dropNext: false, linkUp: true, n: 0, log: [] };

/**
 * @brief Append an entry to the event log (newest first, last seven kept).
 * @param s Current simulator state.
 * @param text Log message.
 * @param tone Visual tone: ok, warn, bad or info.
 * @returns New state with the entry added.
 */
function add(s: S, text: string, tone: Entry['tone']): S {
  const n = s.n + 1;
  return { ...s, n, log: [{ n, text, tone }, ...s.log].slice(0, 7) };
}

/**
 * @brief Handle a REGISTER message from the client.
 * @details Accepted from Unknown or Offline: the client becomes Online. Ignored when
 * the link is down or the client is already registered.
 * @param s Current state.
 * @returns The next state.
 */
function register(s: S): S {
  if (!s.linkUp) return add(s, 'REGISTER not sent: client link is down', 'info');
  if (s.state === 'online' || s.state === 'late') return add(s, 'Already registered', 'info');
  return add({ ...s, state: 'online', missed: 0, heard: true }, 'REGISTER received, ACK sent', 'ok');
}

/**
 * @brief Handle a heartbeat from the client.
 * @details A delivered heartbeat is acknowledged, resets the missed count and marks the
 * client Online. When "drop next" is armed the heartbeat is lost instead.
 * @param s Current state.
 * @returns The next state.
 */
function heartbeat(s: S): S {
  if (!s.linkUp) return add(s, 'No heartbeat: client link is down', 'info');
  if (s.state === 'unknown' || s.state === 'offline') return add(s, `HEARTBEAT seq ${s.seq} ignored: client not registered`, 'warn');
  if (s.dropNext) return add({ ...s, dropNext: false }, `HEARTBEAT seq ${s.seq} lost in transit`, 'bad');
  return add({ ...s, state: 'online', missed: 0, heard: true, seq: s.seq + 1 }, `HEARTBEAT seq ${s.seq} received, ACK sent`, 'ok');
}

/**
 * @brief End the current heartbeat interval.
 * @details If no heartbeat arrived this interval, the missed count increases: the client
 * becomes Late, then Offline once the limit is reached.
 * @param s Current state.
 * @returns The next state.
 */
function expire(s: S): S {
  if (s.state === 'unknown' || s.state === 'offline') return { ...s, heard: false };
  if (s.heard) return { ...s, heard: false };
  const missed = s.missed + 1;
  if (missed >= LIMIT) return add({ ...s, missed, heard: false, state: 'offline' }, `${missed} intervals missed: client offline`, 'bad');
  return add({ ...s, missed, heard: false, state: 'late' }, `Interval missed (${missed} of ${LIMIT}): client late`, 'warn');
}

/**
 * @brief Simulator reducer: apply one user or timer action.
 * @details "step" is one automatic cycle: the client registers or sends a heartbeat
 * (when its link is up), then the interval ends.
 * @param s Current state.
 * @param a The action.
 * @returns The next state.
 */
function reducer(s: S, a: A): S {
  switch (a.type) {
    case 'register':
      return register(s);
    case 'heartbeat':
      return heartbeat(s);
    case 'expire':
      return expire(s);
    case 'drop':
      return { ...s, dropNext: !s.dropNext };
    case 'link':
      return add({ ...s, linkUp: !s.linkUp }, s.linkUp ? 'Client link down' : 'Client link restored', 'info');
    case 'step': {
      let t = s;
      if (t.linkUp) t = t.state === 'unknown' || t.state === 'offline' ? register(t) : heartbeat(t);
      return expire(t);
    }
    case 'reset':
      return init;
  }
}

const stateLabel: Record<SimState, string> = { unknown: 'Unknown', online: 'Online', late: 'Late', offline: 'Offline' };

/**
 * @brief Render the state diagram, counters, controls and event log.
 * @details "Run automatically" dispatches a step every 1.4 s.
 * @returns The simulator element.
 */
export function ProtocolSim() {
  const [s, dispatch] = useReducer(reducer, init);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => dispatch({ type: 'step' }), 1400);
    return () => window.clearInterval(id);
  }, [auto]);

  return (
    <div className="sim">
      <div className="sim-diagram">
        <Esp32States active={s.state} />
      </div>
      <div className="sim-panel">
        <dl className="sim-stats">
          <div>
            <dt>State</dt>
            <dd className={`sim-state sim-${s.state}`}>{stateLabel[s.state]}</dd>
          </div>
          <div>
            <dt>Missed</dt>
            <dd>
              {s.missed} of {LIMIT}
            </dd>
          </div>
          <div>
            <dt>Next seq</dt>
            <dd>{s.seq}</dd>
          </div>
          <div>
            <dt>Link</dt>
            <dd>{s.linkUp ? 'Up' : 'Down'}</dd>
          </div>
        </dl>

        <div className="sim-run">
          <button type="button" className="btn btn-primary" onClick={() => setAuto(!auto)} aria-pressed={auto}>
            {auto ? 'Pause' : 'Run automatically'}
          </button>
          {auto && <span key={s.n} className="sim-tick" aria-hidden="true" />}
        </div>

        <div className="sim-controls" role="group" aria-label="Manual events">
          <button type="button" className="btn" onClick={() => dispatch({ type: 'register' })}>Register</button>
          <button type="button" className="btn" onClick={() => dispatch({ type: 'heartbeat' })}>Send heartbeat</button>
          <button type="button" className="btn" onClick={() => dispatch({ type: 'expire' })}>End interval</button>
          <button type="button" className="btn" onClick={() => dispatch({ type: 'reset' })}>Reset</button>
        </div>
        <div className="sim-toggles">
          <label>
            <input type="checkbox" checked={s.dropNext} onChange={() => dispatch({ type: 'drop' })} />
            Drop the next heartbeat
          </label>
          <label>
            <input type="checkbox" checked={!s.linkUp} onChange={() => dispatch({ type: 'link' })} />
            Disconnect the client
          </label>
        </div>

        <ol className="sim-log" aria-live="polite" aria-label="Event log">
          {s.log.length === 0 && <li className="sim-empty">Press “Run automatically” or “Register” to start.</li>}
          {s.log.map((e) => (
            <li key={e.n} className={`sim-${e.tone}`}>
              <span className="sim-n">{e.n}</span>
              {e.text}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

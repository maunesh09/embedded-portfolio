/**
 * @file index.tsx
 * @brief Project diagrams and the registry that maps diagram ids to components.
 */

import type { ReactNode } from 'react';
import type { DiagramId } from '../content/types';
import { Block, Legend, Link, Note, Svg } from './kit';

/* Sequence-diagram helpers */
/**
 * @brief Dashed vertical lifeline for a sequence diagram.
 * @param x X position.
 * @param y1 Top.
 * @param y2 Bottom.
 * @returns An SVG line.
 */
function Lifeline({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return <line x1={x} y1={y1} x2={x} y2={y2} className="dg-lifeline" />;
}
/**
 * @brief One message arrow in a sequence diagram.
 * @param from Sender x.
 * @param to Receiver x.
 * @param y Y position.
 * @param label Message text.
 * @param lost Draw the message as lost halfway, ending in a cross.
 * @returns The message group.
 */
function Msg({ from, to, y, label, lost }: { from: number; to: number; y: number; label: string; lost?: boolean }) {
  const end = lost ? (from + to) / 2 : to;
  return (
    <g>
      <Link points={[[from, y], [end, y]]} arrow={!lost} label={label} at={[(from + end) / 2, y - 7]} />
      {lost && (
        <g className="dg-lost">
          <line x1={end - 6} y1={y - 6} x2={end + 6} y2={y + 6} />
          <line x1={end - 6} y1={y + 6} x2={end + 6} y2={y - 6} />
        </g>
      )}
    </g>
  );
}

/* ───────────── ESP32 ───────────── */

/**
 * @brief ESP32 emulator firmware structure (generic module names).
 * @returns The diagram and its legend.
 */
function Esp32Architecture() {
  return (
    <>
      <Svg w={660} h={330} title="ESP32 emulator firmware structure" desc="Wi-Fi and lwIP feed a UDP socket module, which passes datagrams to a cJSON codec, then to a per-client protocol state machine driven by timers. Protocol events are logged. Test clients connect over Wi-Fi.">
        <rect x={20} y={56} width={470} height={262} rx={6} className="dg-frame" />
        <Note x={32} y={308}>ESP32 running ESP-IDF and FreeRTOS</Note>
        <Block kind="fw" x={50} y={80} w={170} h={50} label="Wi-Fi + lwIP" sub="ESP-IDF networking" />
        <Block kind="fw" x={50} y={160} w={170} h={50} label="UDP socket I/O" sub="receive / send" />
        <Block kind="fw" x={50} y={240} w={170} h={50} label="JSON codec" sub="cJSON parse / build" />
        <Block kind="fw" x={270} y={80} w={180} h={50} label="Logging" sub="diagnostics" />
        <Block kind="fw" x={270} y={160} w={180} h={50} label="Timers" sub="heartbeat, timeout" />
        <Block kind="fw" x={270} y={240} w={180} h={50} label="Protocol state" sub="one state machine per client" />
        <Link points={[[135, 130], [135, 160]]} both />
        <Link points={[[135, 210], [135, 240]]} both />
        <Link points={[[220, 265], [270, 265]]} both />
        <Link points={[[360, 210], [360, 240]]} label="expiry" at={[368, 229]} anchor="start" />
        <Link kind="debug" points={[[450, 265], [472, 265], [472, 105], [450, 105]]} />
        <Link kind="radio" points={[[135, 80], [135, 34], [585, 34], [585, 110]]} label="Wi-Fi, UDP" at={[360, 27]} />
        <Block kind="ext" x={530} y={110} w={110} h={56} label="Test clients" sub="UDP peers" />
      </Svg>
      <Legend only={['fw', 'ext', 'data', 'radio', 'debug']} />
    </>
  );
}

/**
 * @brief Heartbeat and acknowledgement sequence, including a lost heartbeat and retry.
 * @returns The diagram.
 */
function Esp32Sequence() {
  const C = 150;
  const E = 490;
  return (
    <Svg w={640} h={410} title="Heartbeat and acknowledgement sequence" desc="Client registers and is acknowledged. Heartbeat 1 is acknowledged. Heartbeat 2 is lost; after the acknowledgement timeout the client retries and the retry is acknowledged. If no heartbeat arrives for N intervals the emulator marks the client offline.">
      <Block kind="ext" x={C - 70} y={14} w={140} h={42} label="Client" />
      <Block kind="fw" x={E - 70} y={14} w={140} h={42} label="ESP32 emulator" />
      <Lifeline x={C} y1={56} y2={380} />
      <Lifeline x={E} y1={56} y2={380} />
      <Msg from={C} to={E} y={96} label="REGISTER { id }" />
      <Msg from={E} to={C} y={132} label="ACK" />
      <Msg from={C} to={E} y={184} label="HEARTBEAT { seq: 1 }" />
      <Msg from={E} to={C} y={220} label="ACK { seq: 1 }" />
      <Msg from={C} to={E} y={272} label="HEARTBEAT { seq: 2 }" lost />
      <line x1={C - 14} y1={272} x2={C - 14} y2={318} className="dg-bracket" />
      <Note x={C - 22} y={299} anchor="end">ack timeout</Note>
      <Msg from={C} to={E} y={318} label="HEARTBEAT { seq: 2 } retry" />
      <Msg from={E} to={C} y={354} label="ACK { seq: 2 }" />
      <Note x={E + 12} y={395} anchor="middle">no heartbeat for N intervals: client marked offline</Note>
    </Svg>
  );
}

export type SimState = 'unknown' | 'online' | 'late' | 'offline';

/**
 * @brief Per-client protocol state machine.
 * @param active State to highlight (used by the simulator); none highlights nothing.
 * @returns The diagram.
 */
export function Esp32States({ active }: { active?: SimState }) {
  /**
   * @brief CSS class for a state node given the active state.
   * @param k The node's state.
   * @returns Class names for highlighting or dimming.
   */
  const st = (k: SimState) => `dg-state${active === k ? ' is-active' : ''}${active && active !== k ? ' is-idle' : ''}`;
  return (
    <Svg w={640} h={270} title="Per-client protocol state machine" desc="States: Unknown, Online, Late, Offline. Register moves Unknown to Online. Heartbeats keep a client Online. One missed interval moves it to Late; a heartbeat returns it to Online. N missed intervals move it to Offline; re-registering returns it to Online.">
      <circle cx={14} cy={148} r={5} className="dg-start" />
      <Link points={[[19, 148], [40, 148]]} />
      <g className={st('unknown')}><Block kind="fw" x={40} y={125} w={110} h={46} label="Unknown" /></g>
      <g className={st('online')}><Block kind="fw" x={220} y={125} w={120} h={46} label="Online" /></g>
      <g className={st('late')}><Block kind="fw" x={430} y={60} w={120} h={46} label="Late" /></g>
      <g className={st('offline')}><Block kind="fw" x={430} y={190} w={120} h={46} label="Offline" /></g>
      <Link points={[[150, 148], [220, 148]]} label="register / ACK" at={[195, 117]} />
      <Link points={[[245, 125], [245, 98], [285, 98], [285, 125]]} label="heartbeat / ACK" at={[265, 90]} />
      <Link points={[[340, 136], [385, 136], [385, 83], [430, 83]]} label="interval missed" at={[380, 70]} anchor="end" />
      <Link points={[[430, 96], [405, 96], [405, 158], [340, 158]]} label="heartbeat" at={[412, 130]} anchor="start" />
      <Link points={[[490, 106], [490, 190]]} label="N missed" at={[498, 152]} anchor="start" />
      <Link points={[[430, 213], [280, 213], [280, 171]]} label="re-register" at={[355, 230]} />
    </Svg>
  );
}

/* ───────────── Nordic ───────────── */

/**
 * @brief Zephyr-style layering for a BLE device with a UART host link.
 * @returns The diagram and its legend.
 */
function NordicArchitecture() {
  return (
    <>
      <Svg w={700} h={344} title="BLE and UART device firmware layering" desc="Inside an nRF52 or nRF54: an application thread owning device state above a UART protocol layer and a BLE GATT service; below those, a UART driver filling a ring buffer and the Bluetooth host and controller; all on the Zephyr kernel. A host processor connects over UART and a phone over BLE.">
        <rect x={150} y={24} width={400} height={310} rx={6} className="dg-frame dg-frame-mcu" />
        <Note x={162} y={326}>nRF52 / nRF54 SoC</Note>
        <Block kind="fw" x={170} y={44} w={360} h={46} label="Application" sub="owns device state, single event queue" />
        <Block kind="fw" x={170} y={120} w={170} h={46} label="UART protocol" sub="framing, parser" />
        <Block kind="fw" x={360} y={120} w={170} h={46} label="BLE service" sub="GATT characteristics" />
        <Block kind="fw" x={170} y={196} w={170} h={46} label="UART driver" sub="ISR into ring buffer" />
        <Block kind="fw" x={360} y={196} w={170} h={46} label="Bluetooth host" sub="and controller" />
        <Block kind="fw" x={170} y={266} w={360} h={36} label="Zephyr kernel" />
        <Link points={[[255, 120], [255, 90]]} both />
        <Link points={[[445, 120], [445, 90]]} both />
        <Link points={[[255, 196], [255, 166]]} both />
        <Link points={[[445, 196], [445, 166]]} both />
        <Block kind="ext" x={10} y={196} w={120} h={46} label="Host processor" />
        <Link points={[[130, 219], [170, 219]]} both label="UART" at={[150, 211]} />
        <Block kind="ext" x={580} y={196} w={110} h={46} label="Phone" sub="BLE central" />
        <Link kind="radio" points={[[530, 219], [580, 219]]} label="BLE" at={[555, 211]} />
      </Svg>
      <Legend only={['fw', 'ext', 'data', 'radio']} />
    </>
  );
}

/**
 * @brief BLE peripheral connection flow up to the first notification.
 * @returns The diagram.
 */
function NordicBleFlow() {
  const P = 150;
  const C = 490;
  return (
    <Svg w={640} h={380} title="BLE peripheral connection flow" desc="Peripheral advertises; central sends a connection request; MTU exchange; service discovery; central enables notifications by writing the CCCD; peripheral sends notifications.">
      <Block kind="fw" x={P - 75} y={14} w={150} h={42} label="Peripheral" sub="nRF device" />
      <Block kind="ext" x={C - 75} y={14} w={150} h={42} label="Central" sub="phone" />
      <Lifeline x={P} y1={56} y2={360} />
      <Lifeline x={C} y1={56} y2={360} />
      <Msg from={P} to={C} y={94} label="advertising" />
      <Msg from={C} to={P} y={130} label="connection request" />
      <Msg from={C} to={P} y={178} label="ATT MTU exchange" />
      <Msg from={P} to={C} y={210} label="MTU response" />
      <Msg from={C} to={P} y={254} label="service discovery" />
      <Msg from={C} to={P} y={296} label="write CCCD: enable notifications" />
      <Msg from={P} to={C} y={338} label="notification" />
    </Svg>
  );
}

/**
 * @brief Generic framed UART message layout.
 * @returns The diagram.
 */
function NordicUartFrame() {
  const fields: [string, string, number][] = [
    ['SOF', '1 byte', 80],
    ['LEN', '1 byte', 80],
    ['TYPE', '1 byte', 80],
    ['PAYLOAD', '0 – LEN bytes', 230],
    ['CRC-16', '2 bytes', 110],
  ];
  let x = 25;
  return (
    <Svg w={640} h={150} minWidth={520} title="Generic UART frame" desc="Start-of-frame byte, length, type, payload, and a 16-bit CRC.">
      {fields.map(([l, s, w]) => {
        const b = <Block key={l} kind={l === 'PAYLOAD' ? 'periph' : 'fw'} x={x} y={30} w={w} h={56} label={l} sub={s} />;
        x += w;
        return b;
      })}
      <Note x={25} y={118}>The receiver resynchronises on SOF; a CRC mismatch discards the frame.</Note>
    </Svg>
  );
}

/* ───────────── PCB ───────────── */

/**
 * @brief General board bring-up order.
 * @returns The diagram.
 */
function PcbBringup() {
  const steps: [string, string, 'periph' | 'power' | 'debug'][] = [
    ['Inspect', 'shorts, polarity', 'periph'],
    ['Power rails', 'voltage, ripple', 'power'],
    ['Clocks, reset', 'oscillator start', 'periph'],
    ['Debug port', 'SWD attach', 'debug'],
    ['Buses', 'I²C, SPI, UART', 'periph'],
    ['Radio', 'RF, antenna', 'periph'],
  ];
  return (
    <Svg w={690} h={150} minWidth={600} title="Board bring-up sequence" desc="Six steps in order: visual inspection and short checks, power rails, clocks and reset, debug port, communication buses, radio.">
      {steps.map(([l, s, k], i) => {
        const x = 8 + i * 114;
        return (
          <g key={l}>
            <text x={x} y={36} className="dg-step">{i + 1}</text>
            <Block kind={k} x={x} y={46} w={100} h={66} label={l} sub={s} />
            {i < steps.length - 1 && <Link points={[[x + 100, 79], [x + 114, 79]]} />}
          </g>
        );
      })}
    </Svg>
  );
}

/**
 * @brief Reference four-layer PCB stackup.
 * @returns The diagram.
 */
function PcbStackup() {
  const layers: [string, string, 'cu' | 'die', number][] = [
    ['L1', 'Signal and components', 'cu', 10],
    ['', 'Prepreg', 'die', 22],
    ['L2', 'Ground plane', 'cu', 10],
    ['', 'Core', 'die', 44],
    ['L3', 'Power plane', 'cu', 10],
    ['', 'Prepreg', 'die', 22],
    ['L4', 'Signal', 'cu', 10],
  ];
  let y = 24;
  return (
    <Svg w={560} h={200} minWidth={460} title="Reference four-layer stackup" desc="Signal on top, ground plane on layer 2, power on layer 3, signal on bottom, with prepreg and core between.">
      {layers.map(([n, l, k, h]) => {
        const r = (
          <g key={l + y}>
            <rect x={40} y={y} width={280} height={h} className={k === 'cu' ? 'dg-cu' : 'dg-die'} />
            {n && <text x={30} y={y + h / 2 + 4} textAnchor="end" className="dg-sub">{n}</text>}
            <text x={336} y={y + h / 2 + 4} className={k === 'cu' ? 'dg-label-sm' : 'dg-sub'}>{l}</text>
          </g>
        );
        y += h;
        return r;
      })}
      <Note x={40} y={186}>Solid ground directly under the top signal layer gives every trace a short return path.</Note>
    </Svg>
  );
}

/* ───────────── HDMI ───────────── */

/**
 * @brief HDMI ambient lighting and Auracast signal paths.
 * @returns The diagram and its legend.
 */
function HdmiSystem() {
  const ins = [0, 1, 2, 3];
  return (
    <>
      <Svg w={760} h={430} minWidth={640} title="HDMI ambient lighting system" desc="Four HDMI inputs enter a 4-to-1 switch, then a 1-to-2 splitter. One output passes to the TV. The other goes to an audio extractor and a scaler that outputs 720p to a USB capture device read by a Raspberry Pi CM4, which drives LED strips. Extracted audio goes over I2S to the CM4 and then over I2S to an nRF5340, which broadcasts it with Auracast.">
        {ins.map((i) => (
          <g key={i}>
            <Block kind="ext" x={10} y={40 + i * 50} w={90} h={36} label={`HDMI in ${i + 1}`} />
            <Link points={[[100, 58 + i * 50], [150, 105 + i * 15]]} />
          </g>
        ))}
        <Block x={150} y={90} w={100} h={80} label="HDMI switch" sub="4 : 1" />
        <Link points={[[250, 130], [290, 130]]} />
        <Block x={290} y={100} w={100} h={60} label="Splitter" sub="1 : 2" />
        <Link points={[[340, 100], [340, 53], [430, 53]]} label="pass-through" at={[350, 46]} anchor="start" />
        <Block kind="ext" x={430} y={30} w={110} h={46} label="TV" />
        <Link points={[[340, 160], [340, 175], [430, 175]]} />
        <Block x={430} y={150} w={110} h={50} label="Audio extractor" />
        <Link points={[[485, 200], [485, 230]]} />
        <Block x={430} y={230} w={110} h={50} label="Scaler" sub="any input to 720p" />
        <Link points={[[485, 280], [485, 310]]} />
        <Block x={430} y={310} w={110} h={46} label="USB capture" />
        <Link points={[[540, 333], [600, 333]]} label="USB" at={[570, 326]} />
        <Block kind="mcu" x={600} y={230} w={140} h={110} label="Raspberry Pi CM4" sub={['colour sampling', 'LED control']} />
        <Link kind="audio" points={[[540, 175], [585, 175], [585, 250], [600, 250]]} label="I²S / PCM" at={[546, 169]} anchor="start" />
        <Link kind="audio" points={[[700, 230], [700, 152]]} label="I²S" at={[708, 196]} anchor="start" />
        <Block kind="mcu" x={600} y={96} w={140} h={56} label="nRF5340" sub="LE Audio" />
        <Link kind="radio" points={[[670, 96], [670, 60]]} label="Auracast" at={[678, 82]} anchor="start" />
        <Block kind="ext" x={600} y={14} w={140} h={46} label="Auracast receivers" />
        <Link points={[[670, 340], [670, 372]]} label="LED data" at={[678, 360]} anchor="start" />
        <Block x={600} y={372} w={140} h={40} label="LED strips" />
        <Note x={150} y={410}>HDCP-protected sources cannot be captured on the processing path.</Note>
      </Svg>
      <Legend only={['mcu', 'periph', 'ext', 'data', 'audio', 'radio']} />
    </>
  );
}

/* ───────────── Cellular ───────────── */

/**
 * @brief The two cellular integration models: host MCU with AT commands, and an application on the module.
 * @returns The diagram and its legend.
 */
function CellularSystem() {
  return (
    <>
      <Svg w={720} h={330} minWidth={600} title="Cellular module integration models" desc="Top: a host MCU drives a Quectel MC60 over UART with AT commands; the MC60 provides GSM/GPRS and GNSS. Bottom: a Quectel BG952A-GL runs the application itself using QuecOpen. Both connect through the cellular network to an MQTT broker.">
        <Note x={20} y={40}>Host MCU with AT commands</Note>
        <Block kind="mcu" x={20} y={60} w={130} h={90} label="Host MCU" sub={['application', 'AT parser']} />
        <Link points={[[150, 105], [230, 105]]} both label="UART, AT" at={[190, 97]} />
        <Block x={230} y={60} w={140} h={90} pins label="Quectel MC60" sub={['GSM/GPRS', 'GNSS']} />
        <Note x={20} y={196}>Application on the module</Note>
        <Block kind="fw" x={20} y={216} w={130} h={60} label="QuecOpen app" sub="built with module SDK" />
        <Link kind="debug" points={[[150, 246], [230, 246]]} label="flashed to" at={[190, 238]} />
        <Block kind="mcu" x={230} y={200} w={140} h={92} label="Quectel BG952A-GL" sub={['LTE-M / NB-IoT', 'runs the app']} />
        <Block kind="ext" x={440} y={14} w={120} h={44} label="GNSS satellites" />
        <Link kind="radio" points={[[330, 60], [330, 36], [440, 36]]} label="GNSS" at={[385, 29]} />
        <Block kind="ext" x={440} y={130} w={120} h={60} label="Cellular network" sub="GSM, LTE-M, NB-IoT" />
        <Link kind="radio" points={[[370, 92], [405, 92], [405, 150], [440, 150]]} />
        <Link kind="radio" points={[[370, 246], [405, 246], [405, 172], [440, 172]]} />
        <Block kind="ext" x={590} y={130} w={120} h={60} label="MQTT broker" sub="cloud" />
        <Link points={[[560, 160], [590, 160]]} both label="MQTT" at={[575, 120]} />
      </Svg>
      <Legend only={['mcu', 'periph', 'fw', 'ext', 'data', 'radio']} />
    </>
  );
}

/* ───────────── DJ ───────────── */

/**
 * @brief Modular DJ controller master/module structure.
 * @returns The diagram and its legend.
 */
function DjSystem() {
  const mods: [string, string][] = [
    ['Deck module', 'jog, transport'],
    ['Mixer module', 'faders, EQ'],
    ['Effects module', 'encoders'],
    ['Further modules', 'same interface'],
  ];
  return (
    <>
      <Svg w={700} h={310} minWidth={600} title="Modular DJ controller structure" desc="A computer connects over USB to a master board acting as a USB MIDI and HID device. The master hosts a shared inter-board bus to deck, mixer, effects and further modules. A power block feeds the master board.">
        <Block kind="ext" x={20} y={40} w={120} h={50} label="Computer" sub="DJ software" />
        <Link points={[[140, 65], [220, 65]]} both label="USB" at={[180, 57]} />
        <Block kind="mcu" x={220} y={30} w={180} h={110} label="Master board" sub={['USB MIDI / HID', 'bus host']} />
        <Block kind="power" x={480} y={40} w={130} h={50} label="Power" sub="USB or external" />
        <Link kind="power" points={[[480, 65], [405, 65]]} />
        <Link points={[[310, 145], [310, 190]]} both />
        <line x1={105} y1={190} x2={555} y2={190} className="dg-bus" />
        <Note x={330} y={182} anchor="middle">shared inter-board bus</Note>
        {mods.map(([l, s], i) => (
          <g key={l}>
            <Link points={[[105 + i * 150, 190], [105 + i * 150, 230]]} both />
            <Block kind={i === 3 ? 'ext' : 'periph'} x={40 + i * 150} y={230} w={130} h={56} label={l} sub={s} />
          </g>
        ))}
      </Svg>
      <Legend only={['mcu', 'periph', 'ext', 'data', 'power']} />
    </>
  );
}

/**
 * @brief DJ controller audio signal path.
 * @returns The diagram.
 */
function DjAudioPath() {
  return (
    <Svg w={730} h={190} minWidth={620} title="DJ controller audio path" desc="Audio from the computer arrives over USB audio, passes through DSP and mixing, then a codec DAC, then splits to a headphone amplifier for headphones and a line driver for speakers.">
      <Block kind="ext" x={10} y={70} w={100} h={50} label="Computer" />
      <Link kind="audio" points={[[110, 95], [140, 95]]} />
      <Block kind="fw" x={140} y={70} w={100} h={50} label="USB audio" sub="class device" />
      <Link kind="audio" points={[[240, 95], [270, 95]]} />
      <Block x={270} y={70} w={100} h={50} label="DSP, mixing" />
      <Link kind="audio" points={[[370, 95], [400, 95]]} />
      <Block x={400} y={70} w={100} h={50} label="Codec" sub="DAC" />
      <Link kind="audio" points={[[500, 90], [515, 90], [515, 47], [530, 47]]} />
      <Link kind="audio" points={[[500, 100], [515, 100], [515, 147], [530, 147]]} />
      <Block x={530} y={24} w={90} h={46} label="Headphone amp" />
      <Block x={530} y={124} w={90} h={46} label="Line driver" />
      <Link kind="audio" points={[[620, 47], [640, 47]]} />
      <Link kind="audio" points={[[620, 147], [640, 147]]} />
      <Block kind="ext" x={640} y={24} w={80} h={46} label="Headphones" />
      <Block kind="ext" x={640} y={124} w={80} h={46} label="Speakers" />
    </Svg>
  );
}

export const diagrams: Record<DiagramId, () => ReactNode> = {
  'esp32-architecture': Esp32Architecture,
  'esp32-sequence': Esp32Sequence,
  'esp32-states': () => <Esp32States />,
  'nordic-architecture': NordicArchitecture,
  'nordic-ble-flow': NordicBleFlow,
  'nordic-uart-frame': NordicUartFrame,
  'pcb-bringup': PcbBringup,
  'pcb-stackup': PcbStackup,
  'hdmi-system': HdmiSystem,
  'dj-system': DjSystem,
  'dj-audio-path': DjAudioPath,
  'cellular-system': CellularSystem,
};

/**
 * @brief Render a diagram by id from the registry.
 * @param id Diagram id (see DiagramId in types.ts).
 * @returns The diagram.
 */
export function Diagram({ id }: { id: DiagramId }) {
  const D = diagrams[id];
  return <>{D()}</>;
}

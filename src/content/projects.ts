/**
 * @file projects.ts
 * @brief Project data. Each project fills only the sections it has real content for.
 */

import type { Project } from './types';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  PROJECTS
 *
 *  To add a project: copy one object below, change the slug, and fill in the
 *  sections you have real content for. Sections without `blocks` are hidden
 *  on the live site; their `todo` prompts show up in `npm run dev` so you know
 *  what's missing.
 *
 *  Images go in public/media/projects/{slug}/ and are referenced as
 *  { type: 'image', src: 'media/projects/{slug}/file.webp', ... }.
 *
 *  STARTER COPY: the text below was drafted from your stated background. Read
 *  every sentence and correct anything that doesn't match what you actually
 *  built — especially the feature statuses.
 * ────────────────────────────────────────────────────────────────────────────
 */
export const projects: Project[] = [
  /* ───────────────────────────── ESP32 UDP emulator ───────────────────────────── */
  {
    slug: 'esp32-udp-protocol-emulator',
    title: 'ESP32 UDP protocol emulator',
    summary:
      'An ESP-IDF application that plays one side of a JSON-over-UDP protocol, with heartbeats, acknowledgements, timers and explicit protocol state.',
    status: 'implemented',
    phase: 'Complete and in use',
    // kind: 'personal', // ← set to 'professional' or 'personal' if you want it shown
    domains: ['Embedded networking', 'Protocol design'],
    tech: ['ESP32', 'ESP-IDF', 'C', 'FreeRTOS', 'UDP', 'cJSON'],
    featured: true,
    heroDiagram: 'esp32-sequence',
    sections: {
      overview: {
        blocks: [
          {
            type: 'p',
            text: 'An emulator stands in for a networked device so the other side of a protocol can be developed and tested without the real hardware. This one runs on an ESP32 under ESP-IDF, exchanges JSON messages with clients over UDP, and tracks each client with its own protocol state, heartbeat timer and acknowledgement handling.',
          },
          {
            type: 'features',
            caption: 'Feature status',
            items: [
              { name: 'UDP client communication', status: 'implemented' },
              { name: 'JSON encode / decode with cJSON', status: 'implemented' },
              { name: 'Heartbeat and acknowledgement handling', status: 'implemented' },
              { name: 'Timer-driven protocol state', status: 'implemented' },
              { name: 'Network disconnection and recovery', status: 'implemented' },
              { name: 'Memory-allocation failure handling', status: 'implemented' },
            ],
          },
        ],
      },
      problem: {
        todo: [
          'What system does this emulate, at a level you can share publicly?',
          'Who uses the emulator and what did it let them test that they couldn’t before?',
          'Hard requirements: number of clients, heartbeat interval, timeout, message size, latency.',
        ],
      },
      role: {
        blocks: [
          {
            type: 'p',
            text: 'I wrote all of the emulator firmware and its unit tests on my own. Server and cloud-side software was built by someone else.',
          },
        ],
      },
      architecture: {
        blocks: [
          {
            type: 'p',
            text: 'Message handling is separated from transport and timing. Received datagrams are parsed into messages, the protocol layer decides what each message means for that client’s state, and timers drive heartbeats and timeouts independently of incoming traffic.',
          },
          {
            type: 'diagram',
            id: 'esp32-architecture',
            caption: 'Firmware structure. Module names are generic.',
            illustrative: true,
          },
          {
            type: 'diagram',
            id: 'esp32-sequence',
            caption: 'Heartbeat and acknowledgement exchange, including a lost heartbeat and retry. Message names are generic.',
            illustrative: true,
          },
          {
            type: 'diagram',
            id: 'esp32-states',
            caption: 'Per-client protocol state. Replace with the real states and transitions.',
            illustrative: true,
          },
          {
            type: 'interactive',
            id: 'esp32-simulator',
            caption: 'Interactive model of the heartbeat logic. Drop packets or disconnect the client to see how the state recovers.',
          },
        ],
        todo: ['Confirm the module boundaries and state names in the three diagrams match your implementation.'],
      },
      firmware: {
        todo: [
          'Task layout: which FreeRTOS tasks exist, their priorities and stack sizes.',
          'How cJSON allocations are bounded or freed on every error path.',
          'Timer type used (esp_timer, FreeRTOS software timers) and why.',
        ],
      },
      challenges: {
        todo: ['What was hardest? e.g. heap fragmentation, socket errors after Wi-Fi reconnects, timer drift.'],
      },
      debugging: {
        todo: ['One concrete bug: symptom, how you found it (logs, heap tracing, Wireshark), root cause, fix.'],
      },
      verification: {
        blocks: [{ type: 'p', text: 'I wrote unit tests for the firmware modules alongside the code.' }],
        todo: [
          'Name the test framework (Unity, CMock, ESP-IDF unit test app?) and what the tests cover.',
          'Only add results you measured: soak test duration, client count, packet-loss behaviour, heap watermark.',
        ],
      },
      lessons: {
        todo: ['What would you change in the protocol or firmware structure next time?'],
      },
    },
  },

  /* ───────────────────────────── Nordic BLE / Zephyr ───────────────────────────── */
  {
    slug: 'nordic-ble-zephyr',
    title: 'Nordic BLE and Zephyr firmware',
    summary:
      'BLE firmware for wearable badge devices on Nordic nRF52 and nRF54: Channel Sounding, deep-sleep power management and UART links to host processors.',
    status: 'in-progress',
    phase: 'Active development: Channel Sounding, deep sleep, badge devices',
    kind: 'professional',
    domains: ['Wireless', 'Embedded firmware'],
    tech: ['nRF52', 'nRF54', 'nRF Connect SDK', 'Zephyr', 'C', 'BLE', 'Channel Sounding', 'UART'],
    featured: true,
    heroDiagram: 'nordic-architecture',
    sections: {
      overview: {
        blocks: [
          {
            type: 'p',
            text: 'Most of my professional firmware work is on Nordic Semiconductor parts. My current work covers wearable badge devices: Bluetooth LE Channel Sounding for distance measurement on nRF54, deep-sleep power management, and UART links to other processors. This page describes that work in general terms, without product-specific or proprietary detail.',
          },
          {
            type: 'callout',
            tone: 'note',
            title: 'What this page does not show',
            text: 'No employer source code, customer names or internal product details. Diagrams describe common patterns, not a specific product.',
          },
          {
            type: 'features',
            caption: 'Status by area',
            items: [
              { name: 'BLE peripheral firmware on nRF52 / nRF54 (nRF SDK)', status: 'implemented' },
              { name: 'UART communication with a host processor', status: 'implemented' },
              { name: 'Wearable badge device firmware', status: 'in-progress' },
              { name: 'Bluetooth Channel Sounding (distance measurement)', status: 'in-progress', note: 'nRF54' },
              { name: 'Deep-sleep and wake-up power management', status: 'in-progress' },
              { name: 'nRF Connect SDK / Zephyr', status: 'in-progress' },
              { name: 'Published power-consumption measurements', status: 'planned' },
            ],
          },
        ],
      },
      role: {
        blocks: [
          {
            type: 'p',
            text: 'I’m the sole firmware developer on this work: the badge device firmware, including Channel Sounding and deep-sleep power management, and its unit tests. Server and cloud-side systems are built by someone else.',
          },
        ],
      },
      problem: {
        todo: ['What the badge needs to do, in shareable terms: ranging accuracy target, battery life target, update rate.'],
      },
      architecture: {
        status: 'concept',
        blocks: [
          {
            type: 'p',
            text: 'A typical structure for a BLE device that also talks to a host over UART: radio events and UART traffic both feed one application event queue, so a single thread owns the device state and the BLE and UART layers stay free of application logic.',
          },
          { type: 'diagram', id: 'nordic-architecture', caption: 'Zephyr-style layering for a BLE + UART device.', illustrative: true },
          { type: 'diagram', id: 'nordic-ble-flow', caption: 'Peripheral-role connection flow up to the first notification.', illustrative: true },
        ],
      },
      firmware: {
        status: 'concept',
        blocks: [
          {
            type: 'p',
            text: 'UART links between processors need framing so either side can recover from a dropped or corrupted byte. A common approach is a start byte, length, type, payload and CRC, with the receiver filling a ring buffer from the interrupt and a parser thread pulling complete frames out of it.',
          },
          { type: 'diagram', id: 'nordic-uart-frame', caption: 'Generic framed UART message.', illustrative: true },
        ],
        todo: [
          'Replace the generic frame with your real design if you can share it, or keep it labelled as generic.',
          'Memory and timing constraints you designed around (RAM budget, connection interval, ISR latency).',
        ],
      },
      challenges: {
        blocks: [
          {
            type: 'p',
            text: 'Channel Sounding estimates distance from radio phase rather than signal strength. Both devices exchange tones across many channels; because phase shifts in proportion to frequency times distance, the slope of phase against frequency gives the distance. The explainer below shows the principle with simulated data.',
          },
          {
            type: 'interactive',
            id: 'channel-sounding',
            caption: 'How phase-based ranging works. Simulated data to explain the principle, not measurements from a device.',
          },
        ],
        todo: ['A Channel Sounding, deep-sleep or UART problem you solved, described without proprietary detail.'],
      },
      debugging: { todo: ['Tools used: nRF Sniffer, RTT logging, logic analyzer on UART lines, Power Profiler Kit?', 'How you verify the device actually reaches deep sleep and wakes correctly.'] },
      verification: {
        blocks: [{ type: 'p', text: 'I write and maintain the unit tests for the firmware modules.' }],
        todo: [
          'Name the test framework (Ztest, Unity?) and what runs where: host, emulator or target.',
          'Only real results: throughput, reconnect behaviour, current draw — with test conditions.',
        ],
      },
      lessons: { todo: ['What moving from nRF SDK to nRF Connect SDK / Zephyr has taught you so far.'] },
    },
  },

  /* ───────────────────────────── PCB design ───────────────────────────── */
  {
    slug: 'electronics-hardware-pcb',
    title: 'Electronics hardware and PCB design',
    summary:
      'End-to-end hardware for life-safety communication products: OrCAD schematics, multilayer PCB layout, validation, BOMs and ECNs, integrated with my own firmware.',
    status: 'implemented',
    phase: 'Professional experience; sanitized material to be added',
    kind: 'professional',
    domains: ['Electronics hardware', 'Board bring-up'],
    tech: ['OrCAD', 'Multilayer PCB', 'BOM / ECN', 'Oscilloscope', 'Logic analyzer'],
    featured: true,
    heroDiagram: 'pcb-bringup',
    sections: {
      overview: {
        blocks: [
          {
            type: 'p',
            text: 'Alongside firmware, I’ve designed schematics and PCBs in OrCAD, including two- and four-layer boards, and then tested, debugged and integrated them with firmware. Working on both sides means design decisions — test points, debug headers, pin assignments — are made with bring-up already in mind.',
          },
          {
            type: 'image',
            alt: 'Board photograph',
            caption: 'Board photo',
            placeholderHint: 'Add a permitted, sanitized photo or render (logos and part markings removed if required).',
          },
        ],
      },
      role: {
        blocks: [
          {
            type: 'p',
            text: 'At CareHawk Life Safety Communications I own hardware development end to end: schematic design, multilayer PCB layout in OrCAD and validation, along with the BOMs, ECNs and technical documentation. I also write the firmware for these boards and its unit tests.',
          },
        ],
      },
      hardware: {
        status: 'concept',
        blocks: [
          {
            type: 'p',
            text: 'The bring-up order below is the general sequence for a new board: confirm power before anything else, then clocks and the debug port, and only then the buses and radio. Each step rules out a class of faults before adding the next.',
          },
          { type: 'diagram', id: 'pcb-bringup', caption: 'General board bring-up sequence.', illustrative: true },
          { type: 'diagram', id: 'pcb-stackup', caption: 'A common four-layer stackup, shown for reference — not a specific board.', illustrative: true },
        ],
        todo: [
          'Layout decisions you made on real boards: stackup, grounding, decoupling, RF keep-outs.',
          'Design-for-manufacturing and test choices: test-point strategy, panelization, assembly notes.',
        ],
      },
      debugging: {
        todo: ['A bring-up fault you found with the scope or logic analyzer — symptom, measurement, fix.'],
      },
      verification: {
        blocks: [
          {
            type: 'image',
            alt: 'Oscilloscope capture',
            caption: 'Measurement capture',
            placeholderHint: 'Add a real scope or logic-analyzer screenshot with the conditions noted (probe, bandwidth, load).',
          },
        ],
        todo: ['Replace the placeholder with a real capture, or remove this block.'],
      },
      lessons: { todo: ['What you now do differently on every new board.'] },
    },
  },

  /* ───────────────────────────── Cellular IoT ───────────────────────────── */
  {
    slug: 'cellular-iot-quectel',
    title: 'Cellular IoT with Quectel modules',
    summary:
      'Firmware for Quectel cellular modules: GSM/GPRS with GNSS and MQTT on the MC60, and on-module QuecOpen applications for the BG952A-GL.',
    status: 'implemented',
    phase: 'SDKs and firmware on GitHub',
    domains: ['Cellular IoT', 'Device-to-cloud'],
    tech: ['Quectel MC60', 'Quectel BG952A-GL', 'QuecOpen', 'GSM/GPRS', 'LTE-M / NB-IoT', 'GNSS', 'MQTT', 'AT commands', 'C'],
    featured: true,
    repo: 'QGTU_MC60_SDK',
    heroDiagram: 'cellular-system',
    sections: {
      overview: {
        blocks: [
          {
            type: 'p',
            text: 'Cellular modules can be driven two ways: from a host MCU sending AT commands over UART, or by running the application directly on the module’s own processor with an SDK such as QuecOpen. I’ve worked with Quectel modules both ways, covering network registration, data connections, GNSS positioning and MQTT telemetry to a cloud broker.',
          },
          {
            type: 'features',
            caption: 'Status',
            items: [
              { name: 'MC60 GSM/GPRS data connection', status: 'implemented' },
              { name: 'MC60 GNSS positioning', status: 'implemented' },
              { name: 'MQTT telemetry over cellular', status: 'implemented' },
              { name: 'BG952A-GL QuecOpen application build', status: 'implemented' },
              { name: 'BC660K NB-IoT SDK and documentation', status: 'implemented' },
            ],
          },
        ],
        todo: ['Confirm each status above and add what each device actually did.'],
      },
      role: {
        blocks: [
          {
            type: 'p',
            text: 'I developed the module firmware and its unit tests on my own. The MQTT broker and cloud-side services were built by someone else.',
          },
        ],
      },
      architecture: {
        blocks: [
          { type: 'diagram', id: 'cellular-system', caption: 'The two integration models: host MCU with AT commands, and an application running on the module.', illustrative: true },
          {
            type: 'table',
            caption: 'Modules',
            head: ['Module', 'Network', 'Work'],
            rows: [
              ['Quectel MC60', 'GSM/GPRS, with GNSS', 'SDK for GSM data, GPS and MQTT'],
              ['Quectel BG952A-GL', 'LTE-M / NB-IoT', 'QuecOpen SDK and dependencies for on-module applications'],
              ['Quectel BC660K', 'NB-IoT', 'SDK and documentation'],
            ],
          },
        ],
      },
      firmware: {
        todo: [
          'Connection state handling: registration, PDP context, reconnect after signal loss.',
          'How AT responses and unsolicited result codes are parsed.',
          'MQTT session handling: keep-alive, QoS, buffering while offline.',
        ],
      },
      debugging: { todo: ['A modem or network problem you tracked down, and how.'] },
      verification: {
        blocks: [{ type: 'p', text: 'I wrote unit tests for the firmware modules, including the parts that handle modem responses.' }],
        todo: ['Name the test framework and how modem responses were simulated in tests.'],
      },
      lessons: { todo: ['When you’d choose an on-module application over a host MCU, and why.'] },
    },
  },

  /* ───────────────────────────── MOBA industrial firmware ───────────────────────────── */
  {
    slug: 'moba-industrial-firmware',
    title: 'Fuel pump and machine control firmware',
    summary:
      'Bare-metal firmware for fuel pumps, machine control systems and displays at MOBA Mobile Automation, including an nRF52 RFID tag reader whose battery life I extended by 40%.',
    status: 'implemented',
    phase: 'Delivered, 2021–2022',
    kind: 'professional',
    featured: true,
    domains: ['Industrial firmware', 'IoT'],
    tech: ['Embedded C', 'Bare metal', 'nRF52', 'BLE', 'RFID', 'FOTA', 'Low power'],
    sections: {
      overview: {
        blocks: [
          {
            type: 'p',
            text: 'At MOBA Mobile Automation I developed firmware for fuel pumps, machine control systems and displays. Across nine delivered projects the work covered bare-metal programming, embedded communication protocols, IoT firmware architecture and firmware-over-the-air (FOTA) updates.',
          },
          {
            type: 'features',
            caption: 'Status',
            items: [
              { name: 'Fuel pump firmware', status: 'implemented' },
              { name: 'Machine control and display firmware', status: 'implemented' },
              { name: 'FOTA update support', status: 'implemented' },
              { name: 'nRF52 RFID tag reader: sleep-mode rework', status: 'implemented', note: '40% longer battery life' },
            ],
          },
        ],
      },
      role: {
        blocks: [
          {
            type: 'p',
            text: 'Embedded Software Developer, January 2021 to December 2022. I started as part of the firmware team; for the final nine months I was the sole developer on these projects, handling the firmware and its project management.',
          },
        ],
      },
      architecture: { todo: ['A shareable block diagram of one of the controllers: MCU, display, pump interfaces, communication links.'] },
      firmware: { todo: ['How FOTA worked: image transfer, validation, rollback.'] },
      challenges: {
        blocks: [
          {
            type: 'p',
            text: 'One device in the FDMS project was a battery-powered RFID tag reader built on a Nordic nRF52. The firmware I inherited made poor use of the chip’s sleep modes, so the reader spent far more time awake than it needed to.',
          },
          {
            type: 'p',
            text: 'I reworked the power management so the reader slept whenever it wasn’t actively reading or communicating, which extended battery life by 40%.',
          },
        ],
        todo: [
          'Which sleep modes you used (System ON idle vs System OFF) and what wakes the reader.',
          'How you measured the 40%: current profile before and after, test conditions.',
        ],
      },
      verification: { todo: ['Measurement setup for the power work, e.g. a power profiler, and a before/after current trace if you can share one.'] },
    },
  },

  /* ───────────────────────────── STM32 bootloader ───────────────────────────── */
  {
    slug: 'stm32-custom-bootloader',
    title: 'Custom STM32 bootloader',
    summary: 'A custom bootloader for STM32 microcontrollers, built to meet a project’s specific update requirements.',
    status: 'implemented',
    phase: 'Delivered',
    domains: ['Embedded firmware', 'Firmware updates'],
    tech: ['STM32', 'Embedded C', 'Bootloader', 'Flash memory'],
    sections: {
      overview: {
        blocks: [
          {
            type: 'p',
            text: 'A custom bootloader for STM32 microcontrollers, tailored to a project’s specific requirements for loading and updating application firmware.',
          },
        ],
        todo: ['Which project or employer this was for, at a level you can share.'],
      },
      architecture: { todo: ['Flash memory map: bootloader, application slot(s), metadata.', 'How the update image arrives (UART, CAN, cellular?) and is validated (CRC, signature).'] },
      firmware: { todo: ['Jump-to-application sequence: vector table relocation, peripheral reset, stack pointer.'] },
      verification: { todo: ['How you tested it: power-loss during update, corrupt images, rollback.'] },
    },
  },

  /* ───────────────────────────── HDMI ambient lighting ───────────────────────────── */
  {
    slug: 'hdmi-ambient-lighting',
    title: 'HDMI ambient lighting and Auracast audio',
    summary:
      'A personal hardware design: a 4-input HDMI switch whose second path feeds a Raspberry Pi CM4 that drives LED strips from screen colour, with audio broadcast over Auracast from an nRF5340.',
    status: 'concept',
    phase: 'Architecture and part selection',
    kind: 'personal',
    domains: ['System architecture', 'Video and audio'],
    tech: ['HDMI', 'Raspberry Pi CM4', 'nRF5340', 'LE Audio / Auracast', 'I²S', 'USB capture'],
    featured: true,
    heroDiagram: 'hdmi-system',
    sections: {
      overview: {
        blocks: [
          {
            type: 'p',
            text: 'Four HDMI sources go into a switch. The selected source is split in two: one copy goes straight to the TV, and the other is used for ambient lighting and audio. On that second path, audio is extracted and the video is downscaled to 720p, captured over USB by a Raspberry Pi Compute Module 4, and analysed for on-screen colour to drive LED strips. The extracted audio goes to an nRF5340 over I²S for broadcast as Auracast.',
          },
          {
            type: 'features',
            caption: 'Status',
            items: [
              { name: 'System architecture', status: 'in-progress' },
              { name: 'Part selection for switch, splitter and scaler', status: 'in-progress' },
              { name: 'CM4 colour detection and LED control', status: 'planned' },
              { name: 'nRF5340 Auracast broadcast', status: 'planned' },
              { name: 'Hardware prototype', status: 'planned' },
            ],
          },
        ],
      },
      problem: {
        blocks: [
          {
            type: 'list',
            items: [
              'Select one of four HDMI inputs and pass it to the TV untouched.',
              'Provide a second copy for processing without affecting the TV path.',
              'Scaler auto-detects the input timing and always outputs 720p to the capture device.',
              'Prefer parts with publicly available datasheets.',
              'Built as a learning project as much as a product.',
            ],
          },
        ],
      },
      role: {
        blocks: [{ type: 'p', text: 'Personal project: architecture, part selection, and the planned CM4 and nRF5340 firmware and its unit tests.' }],
      },
      architecture: {
        status: 'concept',
        blocks: [
          { type: 'diagram', id: 'hdmi-system', caption: 'Planned signal paths. Teal is video and data, copper is audio.', illustrative: false },
          {
            type: 'table',
            caption: 'Responsibilities',
            head: ['Block', 'Responsibility'],
            rows: [
              ['HDMI switch + splitter', 'Select 1 of 4 inputs; duplicate to TV path and processing path'],
              ['Audio extractor', 'Pull PCM audio from the processing path'],
              ['Scaler', 'Detect input timing; output fixed 720p'],
              ['USB capture', 'Present 720p video to the CM4 as a standard capture device'],
              ['Raspberry Pi CM4', 'Sample screen-edge colours, drive LED strips, route audio over I²S'],
              ['nRF5340', 'Receive I²S audio and broadcast it as an Auracast stream'],
            ],
          },
        ],
      },
      challenges: {
        blocks: [
          {
            type: 'callout',
            tone: 'constraint',
            title: 'HDCP and licensing',
            text: 'Passing protected content (streaming services, for example) through a switch or splitter requires HDCP-compliant silicon and licensing. Compliant capture devices will not output HDCP-protected video, so ambient lighting from protected sources is an open problem rather than a solved one. No HDMI 2.1 or HDCP compatibility is claimed.',
          },
          {
            type: 'callout',
            tone: 'constraint',
            title: 'Part availability',
            text: 'Several capable HDMI receivers and scalers are only documented under NDA and require HDMI adopter licensing. Part selection is favouring components with public datasheets, which narrows the options.',
          },
        ],
      },
      lessons: { todo: ['Add once the first prototype exists.'] },
    },
  },

  /* ───────────────────────────── Modular DJ controller ───────────────────────────── */
  {
    slug: 'modular-dj-controller',
    title: 'Modular DJ controller and audio system',
    summary:
      'A personal design for a DJ controller built from modular boards: a master board handling USB MIDI/HID, control modules on a shared bus, and an audio path through codec, mixing and output stages.',
    status: 'concept',
    phase: 'System concept',
    kind: 'personal',
    domains: ['Audio hardware', 'System architecture'],
    tech: ['USB MIDI', 'USB HID', 'Audio codec', 'DSP', 'Inter-board bus'],
    heroDiagram: 'dj-system',
    sections: {
      overview: {
        blocks: [
          {
            type: 'p',
            text: 'The controller is split into a master board and swappable control modules, so the layout can change without redesigning everything. The master board presents itself to a computer as a USB MIDI/HID device and collects control input from the modules over a shared bus. A separate audio path handles conversion, mixing, and headphone and speaker outputs.',
          },
          {
            type: 'features',
            caption: 'Status',
            items: [
              { name: 'Modular architecture', status: 'concept' },
              { name: 'Inter-board protocol', status: 'concept' },
              { name: 'Audio path and codec selection', status: 'concept' },
              { name: 'Prototype boards', status: 'planned' },
            ],
          },
        ],
      },
      role: {
        blocks: [{ type: 'p', text: 'Personal project: system architecture, and the planned firmware and its unit tests.' }],
      },
      architecture: {
        status: 'concept',
        blocks: [
          { type: 'diagram', id: 'dj-system', caption: 'Master/module structure.', illustrative: false },
          { type: 'diagram', id: 'dj-audio-path', caption: 'Planned audio signal path.', illustrative: false },
        ],
        todo: ['Choose the inter-board bus and note why (cable length, module count, hot-plug, noise).'],
      },
      hardware: {
        todo: ['Codec and DSP candidates, headphone amplifier, grounding strategy between modules.'],
      },
      verification: {
        todo: ['Planned hardware test strategy for each module and for audio quality.'],
      },
      lessons: { todo: ['Prototype roadmap: what gets built first and why.'] },
    },
  },
];

/**
 * @brief Look up a project by its URL slug.
 * @param slug The slug from the route, e.g. "esp32-udp-protocol-emulator".
 * @returns The project, or undefined when no project has that slug.
 */
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

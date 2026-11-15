/**
 * @file site.ts
 * @brief Site-wide personal content: identity, contact links, education, experience, skills.
 * @details Edit this file first. Values left null render as visible placeholders, never
 * as invented details or broken links.
 */

import type { Proficiency } from './types';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  SITE CONTENT — edit this file first.
 *
 *  Anything set to `null` renders as a clearly marked placeholder (or is
 *  hidden, for links), so the site never shows a fake email address, a broken
 *  link or an invented employer. Replace each `null` when you have the real
 *  value.
 * ────────────────────────────────────────────────────────────────────────────
 */
export const site = {
  /** Shown in the navigation, page titles and footer. */
  name: 'Maunesh',
  /** Add your surname here if you want it on the site, e.g. 'Maunesh Patel'. */
  fullName: 'Maunesh Solanki' as string | null,
  initials: 'M',

  headline: 'Embedded systems engineer working across firmware, BLE and electronics hardware.',
  intro:
    'I build connected devices by bringing firmware architecture, wireless communication, circuit design and hands-on validation together. I’m growing toward senior ownership of Zephyr- and BLE-based products.',

  location: 'Kitchener, Ontario, Canada',

  /** Public URL of the deployed site, used for Open Graph tags. e.g. "https://username.github.io/portfolio/" */
  siteUrl: null as string | null,

  contact: {
    email: 'mauneshsolanki@gmail.com' as string | null,
    github: 'https://github.com/maunesh09' as string | null,
    linkedin: 'https://www.linkedin.com/in/maunesh-solanki/' as string | null,
    upwork: 'https://www.upwork.com/freelancers/~01ae93db25ac68862d' as string | null,
  },

  resume: {
    /** Path inside /public. Put your PDF at public/resume.pdf and set this to 'resume.pdf'. */
    pdfPath: null as string | null,
  },

  /**
   * Stated from dated roles, not a computed total. Firmware and hardware are not split:
   * the current role covers both.
   */
  experienceFacts: [{ value: 'Since 2021', label: 'professional embedded work across firmware and electronics hardware' }],

  education: [
    {
      credential: 'Postgraduate diploma, Embedded Systems Development',
      institution: 'Conestoga College',
      place: 'Kitchener, Ontario, Canada',
      period: 'Jan 2023 – Apr 2024' as string | null,
    },
    {
      credential: 'Bachelor of Engineering, Electronics and Communication Engineering',
      institution: 'Silver Oak College of Engineering and Technology (Gujarat Technological University)',
      place: 'Ahmedabad, India',
      period: '2016 – 2020' as string | null,
    },
  ],

  /** Professional experience, newest first. Taken from LinkedIn, plus details stated directly. */
  experience: [
    {
      role: 'Electronics Hardware Developer' as string | null,
      employer: 'CareHawk Life Safety Communications' as string | null,
      period: 'May 2024 – present' as string | null,
      location: 'Kitchener-Waterloo, Ontario' as string | null,
      highlights: [
        'End-to-end hardware development: schematic design, multilayer PCB layout in OrCAD, and validation.',
        'Sole firmware developer for BLE badge devices on Nordic nRF54 and nRF52: Bluetooth Channel Sounding, deep-sleep power management and UART host links, with unit tests.',
        'Created and managed detailed BOMs, ECNs and technical documentation.',
        'Researched emerging technologies to improve performance and reduce cost on existing platforms.',
      ],
    },
    {
      role: 'Freelance Embedded Firmware Developer' as string | null,
      employer: 'Upwork' as string | null,
      period: 'Sep 2022 – Aug 2024' as string | null,
      location: 'Remote' as string | null,
      highlights: [
        'Embedded firmware projects for freelance clients, owning the firmware and unit tests while clients handled the server side.',
      ],
    },
    {
      role: 'Research and Development Intern' as string | null,
      employer: 'CareHawk Life Safety Communications' as string | null,
      period: 'Sep 2023 – Jan 2024' as string | null,
      location: 'Kitchener, Ontario' as string | null,
      highlights: ['Research and development on life-safety and emergency communication products.'],
    },
    {
      role: 'Embedded Software Developer' as string | null,
      employer: 'MOBA Mobile Automation' as string | null,
      period: 'Jan 2021 – Dec 2022' as string | null,
      location: 'Gujarat, India' as string | null,
      highlights: [
        'Firmware for fuel pumps, machine control systems and displays across nine delivered projects.',
        'Bare-metal programming, embedded communication protocols, IoT firmware architecture and FOTA updates.',
        'Part of the firmware team, then sole developer on these projects for the final nine months.',
        'Extended an nRF52 RFID tag reader’s battery life by 40% by reworking how the firmware used sleep modes.',
      ],
    },
    {
      role: 'Internet of Things Intern' as string | null,
      employer: 'Silver Touch Techlab' as string | null,
      period: 'Jun 2019 – Mar 2020' as string | null,
      location: 'Ahmedabad, India' as string | null,
      highlights: [] as string[],
    },
  ],

  /** Results you have stated. Only add measured, verifiable claims. */
  achievements: [
    'Reworked sleep-mode handling in an nRF52 RFID tag reader’s firmware, extending battery life by 40%.',
    'A custom bootloader for STM32 microcontrollers.',
    'Nine firmware projects delivered at MOBA Mobile Automation.',
  ],
} as const;

/* ─────────────────────────────── Skills ─────────────────────────────── */

export const proficiencyLabel: Record<Proficiency, string> = {
  professional: 'Used professionally',
  working: 'Working knowledge',
  developing: 'Developing',
  exploring: 'Exploring',
};

export const proficiencyHelp: Record<Proficiency, string> = {
  professional: 'Used in paid product work.',
  working: 'Used in real projects; not yet a daily tool.',
  developing: 'Actively building depth through projects.',
  exploring: 'Early study; on the roadmap.',
};

export interface SkillGroup {
  id: string;
  title: string;
  blurb: string;
  skills: { name: string; level: Proficiency; note?: string }[];
}

/**
 * Review every level below — this is a first pass from your stated background.
 * It's better to under-claim and be asked about it than the reverse.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: 'firmware',
    title: 'Embedded firmware',
    blurb: 'How the device behaves: tasks, state, drivers and what happens when something fails.',
    skills: [
      { name: 'Embedded C', level: 'professional' },
      { name: 'Bare-metal firmware', level: 'professional' },
      { name: 'FreeRTOS', level: 'professional', note: 'Including ESP-IDF’s FreeRTOS' },
      { name: 'Nordic nRF52 / nRF54 with nRF SDK', level: 'professional' },
      { name: 'Zephyr RTOS / nRF Connect SDK', level: 'developing', note: 'Current product work; main specialization goal' },
      { name: 'ESP32 / ESP-IDF', level: 'professional' },
      { name: 'STM32', level: 'professional' },
      { name: 'Arduino', level: 'professional' },
      { name: 'State machines and event-driven design', level: 'professional' },
      { name: 'Peripheral drivers and integration', level: 'professional' },
      { name: 'Fault handling and resource management', level: 'professional' },
      { name: 'Unit testing embedded C', level: 'professional', note: 'On every project' },
      { name: 'FOTA / OTA firmware updates', level: 'professional' },
      { name: 'Custom bootloaders (STM32)', level: 'professional' },
      { name: 'Low-power optimization', level: 'professional', note: '40% longer battery life on an nRF52 RFID reader' },
      { name: 'ARM / MCU assembly', level: 'working' },
      { name: 'Make and CMake build systems', level: 'working' },
      { name: 'Python for tooling and test automation', level: 'professional', note: 'Including Selenium' },
    ],
  },
  {
    id: 'connectivity',
    title: 'Wireless and connectivity',
    blurb: 'Getting data off the board reliably, and on-board buses between chips.',
    skills: [
      { name: 'Bluetooth Low Energy', level: 'professional' },
      { name: 'Bluetooth Channel Sounding', level: 'developing', note: 'nRF54, current work' },
      { name: 'Deep-sleep and low-power firmware', level: 'developing', note: 'Current work' },
      { name: 'Wi-Fi', level: 'professional' },
      { name: 'TCP/IP and UDP', level: 'professional' },
      { name: 'Device-to-cloud communication', level: 'professional' },
      { name: 'Ethernet', level: 'working' },
      { name: 'MQTT', level: 'working' },
      { name: 'Cellular IoT (Quectel MC60, BG952A-GL)', level: 'working' },
      { name: 'UART, SPI, I²C', level: 'professional' },
      { name: 'ADC / DAC, PWM, GPIO', level: 'professional' },
      { name: 'CAN', level: 'professional' },
      { name: 'One-Wire and Wiegand', level: 'professional' },
      { name: 'AT-command modem integration', level: 'working', note: 'Quectel MC60, BG952A-GL, BC660K' },
      { name: 'NB-IoT, LTE and GSM/GPRS', level: 'working' },
      { name: 'QuecOpen SDK (BG952A-GL)', level: 'working' },
      { name: 'GNSS module integration', level: 'working', note: 'MC60' },
    ],
  },
  {
    id: 'hardware',
    title: 'Electronics hardware',
    blurb: 'The board the firmware runs on, and proving it works.',
    skills: [
      { name: 'OrCAD schematic capture', level: 'professional' },
      { name: 'Two-layer PCB design', level: 'professional' },
      { name: 'Multilayer PCB design', level: 'professional' },
      { name: 'Board bring-up', level: 'professional' },
      { name: 'Oscilloscope and logic-analyzer debugging', level: 'professional' },
      { name: 'Hardware–firmware integration', level: 'professional' },
      { name: 'Analog and audio interfaces', level: 'professional' },
      { name: 'Raspberry Pi CM4 carrier / expansion boards', level: 'working' },
      { name: 'BOM and ECN management', level: 'professional' },
      { name: 'Hardware validation and documentation', level: 'professional' },
    ],
  },
  {
    id: 'systems',
    title: 'System design',
    blurb: 'Deciding what lives where, and how the pieces talk.',
    skills: [
      { name: 'Embedded networking and protocol design', level: 'professional' },
      { name: 'Connected-device architecture', level: 'professional' },
      { name: 'SIP-related communication systems', level: 'working' },
      { name: 'Hardware / firmware partitioning', level: 'working' },
      { name: 'System-level troubleshooting', level: 'professional' },
    ],
  },
  {
    id: 'growing',
    title: 'Growing areas',
    blurb: 'Where I’m deliberately building depth over the next few years.',
    skills: [
      { name: 'Zephyr and BLE product engineering', level: 'developing' },
      { name: 'RF and antenna integration', level: 'exploring' },
      { name: 'Automated embedded testing', level: 'developing' },
      { name: 'Embedded Linux, Buildroot, Yocto', level: 'exploring' },
      { name: 'Product certification and compliance', level: 'exploring' },
    ],
  },
];

/** The four layers shown in the home-page system map. */
export const layers = [
  {
    id: 'firmware',
    name: 'Firmware',
    text: 'Embedded C on bare metal, FreeRTOS and Zephyr. State machines, event-driven applications, drivers and fault handling.',
  },
  {
    id: 'silicon',
    name: 'Silicon',
    text: 'Nordic nRF52/nRF54, ESP32 and STM32, wired to sensors, audio and cellular modems over UART, SPI, I²C, CAN and I²S.',
  },
  {
    id: 'board',
    name: 'Board',
    text: 'OrCAD schematics and two- and four-layer PCBs: power rails, debug access, bring-up and measurement on the bench.',
  },
  {
    id: 'link',
    name: 'Link',
    text: 'BLE, Wi-Fi, Ethernet and cellular, carrying UDP, TCP and MQTT traffic between the device, phones and cloud services.',
  },
] as const;

export type LayerId = (typeof layers)[number]['id'];

/* ───────────────────────────── GitHub repositories ───────────────────────────── */

/**
 * Public repositories, listed on the Projects page. Links use
 * `${site.contact.github}/${name}` and only appear once contact.github is set.
 * `about` should match the repo's own description — check each one.
 * Move a repo into projects.ts when you want a full write-up page for it.
 */
export const repositories: { name: string; about: string; tags: string[]; project?: string }[] = [
  { name: 'RPi-CM4-Expansion-Board', about: 'Expansion board for the Raspberry Pi Compute Module 4.', tags: ['Hardware', 'CM4'] },
  { name: 'STM32ArmonMonitorCC', about: 'STM32-based monitoring project.', tags: ['STM32', 'C'] },
  { name: 'QUECTEL-BC660K', about: 'Quectel BC660K SDK and documentation.', tags: ['NB-IoT', 'Quectel'], project: 'cellular-iot-quectel' },
  { name: 'QuecOpen_BG952Agl', about: 'QuecOpen SDK and dependencies for the Quectel BG952A-GL.', tags: ['LTE-M', 'QuecOpen'], project: 'cellular-iot-quectel' },
  { name: 'QGTU_MC60_SDK', about: 'Quectel MC60 SDK for GSM, GPS and MQTT.', tags: ['GSM', 'GPS', 'MQTT'], project: 'cellular-iot-quectel' },
];

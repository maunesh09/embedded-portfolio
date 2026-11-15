/**
 * @file articles.ts
 * @brief Notebook article data and the fixed order of project-page sections.
 */

import type { Article, SectionId } from './types';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  ENGINEERING NOTEBOOK
 *
 *  Every entry starts as 'planned'. When you write one, add a `body`, set
 *  status to 'published' and add a `published` date. See the template page at
 *  /notebook/template (visible in `npm run dev`) for every block type.
 * ────────────────────────────────────────────────────────────────────────────
 */
export const articles: Article[] = [
  {
    slug: 'udp-heartbeat-acknowledgement',
    title: 'Designing robust heartbeat and acknowledgement mechanisms for embedded UDP systems',
    summary: 'UDP gives no delivery guarantee, so liveness and reliability have to be designed in. Timeouts, retries, sequence numbers and what “offline” should mean.',
    status: 'planned',
    topics: ['UDP', 'Protocol design', 'ESP-IDF'],
    relatedProject: 'esp32-udp-protocol-emulator',
    outline: [
      'Why UDP needs application-level liveness',
      'Choosing heartbeat interval and timeout',
      'Acknowledgements, sequence numbers and duplicates',
      'Retry limits and back-off',
      'Making “offline” a state, not an error',
    ],
  },
  {
    slug: 'esp-idf-memory-network-failures',
    title: 'Debugging memory allocation and network failures in ESP-IDF',
    summary: 'Heap tracing, watermark checks and socket error paths after Wi-Fi drops — finding failures that only show up after hours of running.',
    status: 'planned',
    topics: ['ESP-IDF', 'Debugging', 'Memory'],
    relatedProject: 'esp32-udp-protocol-emulator',
    outline: ['Symptoms that point to the heap', 'Heap tracing and task watermarks', 'Freeing cJSON on every path', 'Socket behaviour across Wi-Fi reconnects'],
  },
  {
    slug: 'zephyr-ble-peripheral',
    title: 'Designing a BLE peripheral with Zephyr and nRF Connect SDK',
    summary: 'Services, characteristics and the event flow from advertising to notifications, coming from the older nRF SDK.',
    status: 'planned',
    topics: ['Zephyr', 'BLE', 'Nordic'],
    relatedProject: 'nordic-ble-zephyr',
    outline: ['nRF SDK vs nRF Connect SDK mental model', 'Defining a GATT service', 'Connection parameters and MTU', 'Threading and work queues'],
  },
  {
    slug: 'low-power-ble-validation',
    title: 'Finding 40% more battery life in an nRF52 RFID reader',
    summary: 'Inherited firmware that barely slept: how I found where the current went, and what changed to extend battery life by 40%.',
    status: 'planned',
    topics: ['nRF52', 'Low power', 'Debugging'],
    relatedProject: 'moba-industrial-firmware',
    outline: ['The symptom: batteries that died too early', 'Measuring where the current goes', 'nRF52 sleep modes and wake sources', 'The rework and the result'],
  },
  {
    slug: 'stm32-custom-bootloader',
    title: 'Writing a custom bootloader for STM32',
    summary: 'Memory layout, image validation and the jump to the application: what a reliable bootloader has to get right.',
    status: 'planned',
    topics: ['STM32', 'Bootloader', 'Firmware updates'],
    relatedProject: 'stm32-custom-bootloader',
    outline: ['Planning the flash memory map', 'Receiving and validating an image', 'Jumping to the application safely', 'Surviving power loss mid-update'],
  },
  {
    slug: 'hardware-bring-up',
    title: 'Hardware bring-up: from power rails to peripheral communication',
    summary: 'A step-by-step order for bringing up a new board, and what each step rules out.',
    status: 'planned',
    topics: ['Hardware', 'Bring-up'],
    relatedProject: 'electronics-hardware-pcb',
    outline: ['Before power: visual and resistance checks', 'Rails and sequencing', 'Clocks and debug port', 'Buses one at a time', 'Radio last'],
  },
  {
    slug: 'pcb-for-debug-and-manufacturing',
    title: 'Designing a PCB for debugging and manufacturing',
    summary: 'Test points, debug headers and layout choices that make the first board easier to bring up and the hundredth easier to build.',
    status: 'planned',
    topics: ['PCB', 'DFM', 'Test'],
    relatedProject: 'electronics-hardware-pcb',
    outline: ['Test-point strategy', 'Debug access that survives the enclosure', 'Assembly-friendly layout', 'Reviewing a board before ordering'],
  },
  {
    slug: 'prototype-to-product-verification',
    title: 'From prototype to product: planning hardware verification and compliance',
    summary: 'What changes between a working prototype and a product that can be certified and shipped.',
    status: 'planned',
    topics: ['Verification', 'Compliance'],
    outline: ['Verification vs validation', 'Building a test plan', 'Pre-compliance testing', 'Certification for radio products'],
  },
];

/**
 * @brief Look up a notebook article by its URL slug.
 * @param slug The slug from the route.
 * @returns The article, or undefined when none matches.
 */
export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);

/** Fixed order and titles for project pages. */
export const projectSectionOrder: { id: SectionId; title: string }[] = [
  { id: 'overview', title: 'Overview' },
  { id: 'problem', title: 'Problem and requirements' },
  { id: 'role', title: 'My role' },
  { id: 'architecture', title: 'Architecture' },
  { id: 'hardware', title: 'Hardware design' },
  { id: 'firmware', title: 'Firmware design' },
  { id: 'challenges', title: 'Engineering challenges' },
  { id: 'debugging', title: 'Debugging and problem-solving' },
  { id: 'verification', title: 'Verification and test results' },
  { id: 'lessons', title: 'Lessons and next steps' },
];

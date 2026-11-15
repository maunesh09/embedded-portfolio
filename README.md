# Embedded systems portfolio

Personal portfolio for an embedded systems engineer: firmware, BLE and electronics hardware.
React, TypeScript and Vite, deployed as a static site on GitHub Pages. No backend, no API keys.

## Documentation

| Document | What it covers |
|---|---|
| `README.md` (this file) | Setup, deployment, editing content, adding projects, articles, images and diagrams |
| [`FLOW.md`](FLOW.md) | Architecture and workflow: runtime flow, content model, rendering pipeline, every interactive instrument, build, deployment, routing, drafts, accessibility |
| Source comments | Every source file has a Doxygen `@file` header, and every function has `@brief`, `@param` and `@returns` |
| `Doxyfile` | Generates browsable API docs from those comments |
| `public/media/projects/README.md` | Where project images go and how to reference them |

### Generating API documentation

Install [Doxygen](https://www.doxygen.nl/download.html) (for example `sudo apt install doxygen`,
`brew install doxygen`, or the Windows installer), then:

```bash
npm run docs        # writes docs/api/html/index.html
```

Doxygen has no TypeScript parser, so the `Doxyfile` runs every `.ts` and `.tsx` file
through `scripts/doxygen-filter.mjs` first. The filter uses the project's TypeScript
compiler to strip types and JSX while keeping every comment, and Doxygen then reads plain
JavaScript. Run `npm ci` before `npm run docs` so the compiler is installed.

Two known limits:
- Type-only declarations (interfaces and type aliases) disappear in that step, so they
  don't appear in the generated pages. Their source comments and FLOW.md's content model
  cover them.
- Doxygen can't match `@param` names to destructured component props (`{ articles }`), so
  it logs warnings to `docs/api/doxygen-warnings.log`. The rendered parameter tables are
  still correct.

`docs/api/` is generated output and is ignored by git. The zip includes a prebuilt copy
(`docs/api/html/index.html`) so you can browse it without installing Doxygen.

### Documenting new code

Give every new function a Doxygen block in the same style:

```ts
/**
 * @brief One line on what the function does.
 * @details Optional: why, or anything non-obvious.
 * @param name What the parameter means (for components: props.field).
 * @returns What comes back.
 */
```

New files start with a `@file` block naming the file and its purpose.

## Quick start

Requires Node.js 20 or newer.

```bash
npm ci            # install exact versions from package-lock.json
npm run dev       # local dev server at http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/ locally
npm run docs      # API docs from source comments (needs Doxygen)
```

`npm run dev` also shows **draft material** that is hidden on the live site:
"Needs your input" prompts on project pages, links to planned articles, and the
article template at `/notebook/template`.

## Deploying to GitHub Pages

1. Create a repository on GitHub and push this project to its `main` branch.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).

The workflow in `.github/workflows/deploy.yml` builds and deploys the site. It reads
the correct base path from the Pages configuration, so it works for both kinds of site:

| Repository name | Site URL | Base path |
|---|---|---|
| `portfolio` (any name) | `https://<username>.github.io/portfolio/` | `/portfolio/` |
| `<username>.github.io` | `https://<username>.github.io/` | `/` |

You don't need to edit any paths. If you later add a custom domain, configure it under
**Settings → Pages**; the base path becomes `/` automatically.

### How routing works on Pages

The site uses clean URLs (`/projects/nordic-ble-zephyr`, not `#/projects/...`). GitHub Pages
has no server-side routing, so `scripts/postbuild.mjs` copies `index.html` to `404.html`.
When someone opens a deep link, Pages serves that file, and the app's router renders the right
page, or the site's own 404 page if the address doesn't exist.

Trade-off: Pages returns HTTP status 404 for those deep links even though the page displays
correctly. Browsers and people don't notice; some search crawlers may index deep pages less
well. The home page is unaffected. If search ranking of individual project pages becomes
important, the next step would be pre-rendering each route to static HTML.

## Editing content

All content lives in `src/content/`. You shouldn't need to touch components to update the site.

| File | What it holds |
|---|---|
| `site.ts` | Name, headline, intro, contact links, resume path, education, experience, skills and levels, GitHub repository list |
| `projects.ts` | Project pages: status, summary, technologies, sections, diagrams, images |
| `articles.ts` | Engineering notebook entries, plus the fixed order of project-page sections |
| `types.ts` | Type definitions (rarely needs changes) |

### Filling in personal details

Every value set to `null` in `site.ts` shows as a dashed **"Add …"** marker, or is hidden
if it's a link. Nothing fake is ever displayed. Fill in:

- `contact.email`, `contact.github`, `contact.linkedin`, `contact.upwork`
- `fullName` if you want your surname shown
- `experience[0].role`, `employer`, `period`, `location` (add more entries for more roles)
- `education[].period`
- `siteUrl` (optional; the workflow already sets Open Graph URLs)

Setting `contact.github` also turns every repository name on the Projects page into a link.

### Adding the resume PDF

1. Save your resume as `public/resume.pdf`.
2. In `site.ts`, set `resume: { pdfPath: 'resume.pdf' }`.

The Resume page then shows a **Download PDF** button. Until then it explains what's missing.
The Resume page also prints cleanly (navigation hidden) via **Print this page**.

### Reviewing skill levels

Skills in `site.ts` use four levels: `professional`, `working`, `developing`, `exploring`.
They're a first pass from your stated background. Go through them and adjust any that
overstate or understate your experience.

## Adding a project

1. In `src/content/projects.ts`, copy an existing project object and give it a new `slug`.
2. Set `status` (`implemented`, `in-progress`, `planned`, `concept`) and, optionally, `kind`
   (`professional`, `personal`, `learning`). Set `featured: true` to show it on the home page.
3. Fill in only the sections you have real content for. Every project page uses the same
   ten-section structure, in this order:
   overview, problem, role, architecture, hardware, firmware, challenges, debugging,
   verification, lessons.
4. A section with `blocks` is published. A section with only `todo` prompts is hidden on the
   live site and shown in `npm run dev` as a reminder.

```ts
{
  slug: 'my-new-project',
  title: 'My new project',
  summary: 'One sentence shown in lists.',
  status: 'in-progress',
  phase: 'Prototype board assembled',
  kind: 'personal',
  domains: ['Wireless'],
  tech: ['nRF54L15', 'Zephyr', 'C'],
  repo: 'my-new-project',          // optional: links to github.com/<you>/my-new-project
  sections: {
    overview: { blocks: [{ type: 'p', text: '...' }] },
    verification: { todo: ['Add current measurements with test conditions.'] },
  },
}
```

### Content blocks

Sections and articles are built from blocks:

| Block | Use |
|---|---|
| `{ type: 'p', text }` | Paragraph |
| `{ type: 'list', items }` | Bulleted list |
| `{ type: 'table', caption, head, rows }` | Table; first column is a row header |
| `{ type: 'features', caption, items }` | Feature list with a status tag per item |
| `{ type: 'diagram', id, caption, illustrative }` | A diagram from `src/diagrams/index.tsx` |
| `{ type: 'code', lang: 'c' \| 'json' \| 'text', code, caption }` | Syntax-highlighted code |
| `{ type: 'callout', tone: 'note' \| 'constraint', title, text }` | Highlighted note or constraint |
| `{ type: 'image', src, alt, caption, placeholderHint }` | Image; omit `src` to show a placeholder |
| `{ type: 'interactive', id, caption }` | An interactive widget: `esp32-simulator` or `channel-sounding` |

### Images

Put images in `public/media/projects/<slug>/` and reference them without a leading slash, e.g.
`src: 'media/projects/my-new-project/board.webp'`. Paths are resolved against the deployed base
path automatically. Use WebP or optimised JPEG, about 1600 px wide at most.

Only publish photos and schematics you're permitted to share. Remove customer names, logos
or part markings where required.

### Adding a diagram

Diagrams are hand-built SVG components in `src/diagrams/index.tsx`, using shared parts from
`src/diagrams/kit.tsx`. They follow one visual language:

| Element | Drawn as |
|---|---|
| MCU / SoC | Heavy teal outline with pin ticks |
| Peripheral | Thin outline |
| Firmware module | Filled panel |
| External system | Dashed outline |
| Debug / test | Dotted, hatched |
| Power block / link | Copper |
| Data link | Solid teal with arrow |
| Wireless link | Long-dash teal |
| Audio link | Solid copper |

To add one: write a component using `<Svg>`, `<Block>`, `<Link>` and `<Note>`, register it in
the `diagrams` object at the bottom of the file, and add its ID to `DiagramId` in `types.ts`.
Keep the `title` and `desc` meaningful: screen readers read them.

## Interactive pieces

The site is styled as an embedded engineer's bench ("Phosphor"): a warm instrument
panel where scope channel colours carry meaning (CH1 amber, CH2 cyan, CH3 magenta,
CH4 blue).

| Where | Component | What it does |
|---|---|---|
| Home hero | `src/components/Oscilloscope.tsx` | Four simulated channels (RF burst, PWM, audio tone, power rail) with channel toggles, timebase and Run/Stop; measurements match the drawn signals |
| Home | `src/components/Multimeter.tsx` | Rotary dial switches between experience, education and location readings |
| Home | `src/components/LogicAnalyzer.tsx` | Encodes your name as real UART, SPI or I²C waveforms; hover or tab to decode each byte |
| Home | `src/components/PcbExplorer.tsx` | A two-layer board (Rev B): battery connector, regulator, MCU with crystal and decoupling, flash, vertical antenna, SWD header and test pads; pulses travel the copper; selecting a part explains the work done there |
| Projects | `src/components/ProjectList.tsx` | Projects as scope channels; trace shape shows status (square = implemented, bursts = in progress, dashed = concept) |
| ESP32 project | `src/interactive/ProtocolSim.tsx` | Heartbeat/ACK state machine you can drive, drop packets in, or disconnect |
| Nordic project | `src/interactive/ChannelSounding.tsx` | Phase-based ranging explainer with distance and noise sliders (simulated data) |
| Projects page | `src/pages/Projects.tsx` | Filter by status and technology |

All animation stops when the visitor's system asks for reduced motion (the scope starts
stopped), and every control works from the keyboard.

## Writing a notebook article

1. Find the entry in `src/content/articles.ts`.
2. Add a `body` array. Use `{ type: 'h', text: 'Heading' }` for section headings (they build
   the table of contents), plus any of the content blocks above.
3. Set `status: 'published'` and `published: '2026-11-01'`.

Planned and draft articles are listed with their label but aren't linked on the live site.
See `/notebook/template` in `npm run dev` for every block rendered.

## Project structure

```
README.md, FLOW.md             Documentation (see "Documentation" above)
Doxyfile                       API documentation settings (npm run docs)
.github/workflows/deploy.yml   GitHub Pages build and deploy
public/                        Static files: favicon, Open Graph image, resume, project images
scripts/postbuild.mjs          Copies index.html to 404.html for deep links
scripts/doxygen-filter.mjs     Converts TypeScript to JavaScript for Doxygen (npm run docs)
src/
  content/                     All editable content
  interactive/                 Heartbeat simulator, Channel Sounding explainer
  components/                  Layout, lists, blocks, status tags, code blocks
  diagrams/                    SVG diagram kit, project diagrams, home-page system map
  lib/                         Base-path helper, page metadata, syntax highlighter
  pages/                       One component per route
  styles/global.css            Design tokens and all styles
```

## Design notes

- **Colour carries meaning.** Amber is signal and data; cyan is power and audio. Scope
  channel colours are reused consistently across the instruments and diagrams.
- **Status is always explicit.** Projects and individual features carry one of four labels,
  and illustrative diagrams say so in their caption.
- **Type:** Martian Mono for headings and instrument readouts, Inter Tight for body text.
  Both load from Google Fonts with system fallbacks.
- **Theme:** a single dark instrument theme; the oscilloscope screen, analyzer and board
  are designed to be read in it.
- **Accessibility:** skip link, visible focus states, keyboard-operable system map,
  descriptive SVG titles, reduced-motion support, focus moved to the page on navigation.

## Optional: single-file preview build

```bash
npm run build:preview
```

Builds one self-contained `dist-preview/index.html` with draft material visible and in-memory
routing. It's for sharing a review copy, not for deployment.

/**
 * @file types.ts
 * @brief Shared content types for projects, articles and content blocks.
 */

// Shared content types. Edit content in site.ts, projects.ts and articles.ts —
// you should rarely need to touch this file.

/** Implementation status. Used for whole projects and for individual features. */
export type Status = 'implemented' | 'in-progress' | 'planned' | 'concept';

/** Where the work came from. Leave undefined if you'd rather not say. */
export type ProjectKind = 'professional' | 'personal' | 'learning';

/** How established a skill is. Keep these honest — reviewers notice. */
export type Proficiency = 'professional' | 'working' | 'developing' | 'exploring';

/** IDs of the diagrams registered in src/diagrams/index.ts */
export type DiagramId =
  | 'esp32-architecture'
  | 'esp32-sequence'
  | 'esp32-states'
  | 'nordic-architecture'
  | 'nordic-ble-flow'
  | 'nordic-uart-frame'
  | 'pcb-bringup'
  | 'pcb-stackup'
  | 'hdmi-system'
  | 'dj-system'
  | 'dj-audio-path'
  | 'cellular-system';

/** Interactive widgets that can be embedded in a section. */
export type InteractiveId = 'esp32-simulator' | 'channel-sounding';

/** Content blocks used inside project sections and articles. */
export type Block =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | {
      type: 'table';
      caption?: string;
      head: string[];
      rows: string[][];
    }
  | { type: 'features'; caption?: string; items: { name: string; status: Status; note?: string }[] }
  | { type: 'diagram'; id: DiagramId; caption: string; illustrative?: boolean }
  | { type: 'interactive'; id: InteractiveId; caption: string }
  | { type: 'code'; lang: 'c' | 'text' | 'json'; code: string; caption?: string }
  | { type: 'callout'; tone: 'note' | 'constraint'; title: string; text: string }
  | {
      type: 'image';
      /** Path inside /public, e.g. "projects/pcb/board-top.webp". Leave src empty to show a placeholder. */
      src?: string;
      alt: string;
      caption: string;
      /** What should go here once you have permitted, sanitized material. */
      placeholderHint?: string;
    };

/** The fixed project-page structure. Order is set in src/content/projectSections.ts */
export type SectionId =
  | 'overview'
  | 'problem'
  | 'role'
  | 'architecture'
  | 'hardware'
  | 'firmware'
  | 'challenges'
  | 'debugging'
  | 'verification'
  | 'lessons';

export interface ProjectSection {
  status?: Status;
  blocks?: Block[];
  /**
   * Prompts for content you still need to write. A section with no blocks is
   * hidden on the live site; its prompts appear only in dev / draft previews.
   */
  todo?: string[];
}

export interface Project {
  slug: string;
  title: string;
  /** One sentence shown in lists. */
  summary: string;
  status: Status;
  /** Short phrase describing where the project currently is. */
  phase: string;
  kind?: ProjectKind;
  domains: string[];
  tech: string[];
  featured?: boolean;
  /** Diagram shown on the project list and home page. */
  heroDiagram?: DiagramId;
  sections: Partial<Record<SectionId, ProjectSection>>;
  /** GitHub repository name; linked when site.contact.github is set. */
  repo?: string;
  /** Only shown when set. ISO date, e.g. "2026-10-25". */
  updated?: string;
}

export type ArticleStatus = 'planned' | 'draft' | 'published';

export interface Article {
  slug: string;
  title: string;
  summary: string;
  status: ArticleStatus;
  topics: string[];
  /** Planned headings. Shown as the outline for planned / draft articles. */
  outline: string[];
  /** Body content, once written. Headings ("h") drive the table of contents. */
  body?: (Block | { type: 'h'; text: string })[];
  published?: string;
  relatedProject?: string;
}

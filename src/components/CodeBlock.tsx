/**
 * @file CodeBlock.tsx
 * @brief Syntax-highlighted, keyboard-scrollable code figure.
 */

import { highlight } from '../lib/highlight';

/**
 * @brief Render a code snippet with token colouring and an optional caption.
 * @param code Source code to display.
 * @param lang Language used for highlighting: "c", "json" or "text".
 * @param caption Optional caption shown under the code.
 * @returns A figure containing the highlighted code.
 */
export function CodeBlock({ code, lang, caption }: { code: string; lang: 'c' | 'json' | 'text'; caption?: string }) {
  const tokens = highlight(code.replace(/\n$/, ''), lang);
  return (
    <figure className="code">
      <pre tabIndex={0} aria-label={caption ?? `${lang} code`}>
        <code>
          {tokens.map((t, i) => (t.t === 'plain' ? t.v : <span key={i} className={`hl-${t.t}`}>{t.v}</span>))}
        </code>
      </pre>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

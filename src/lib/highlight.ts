/**
 * @file highlight.ts
 * @brief Minimal syntax highlighter for C and JSON code blocks.
 * @details Avoids shipping a full highlighting library for a handful of snippets.
 */

/**
 * Tiny syntax highlighter for C and JSON code blocks — avoids shipping a
 * full highlighting library for a handful of snippets.
 */
export type Token = { t: 'kw' | 'type' | 'str' | 'num' | 'com' | 'pre' | 'fn' | 'plain'; v: string };

const KEYWORDS = new Set(
  'if else for while do switch case default break continue return goto sizeof typedef struct union enum static const volatile extern inline true false NULL'.split(' '),
);
const TYPES = /^(void|char|short|int|long|float|double|bool|unsigned|signed|size_t|u?int(8|16|32|64)_t|[a-z_]+_t)$/;

const RULES: [Token['t'], RegExp][] = [
  ['com', /^(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/],
  ['pre', /^#[^\n]*/],
  // \x22 and \x27 are " and ': written as escapes so documentation tools don't read a string literal here
  ['str', /^(\x22(\\.|[^\x22\\])*\x22|\x27(\\.|[^\x27\\])*\x27)/],
  ['num', /^(0x[0-9a-fA-F]+|\d+(\.\d+)?)[uUlLfF]*/],
  ['plain', /^[A-Za-z_]\w*/],
  ['plain', /^\s+/],
  ['plain', /^[\s\S]/],
];

/**
 * @brief Split source code into typed tokens for colouring.
 * @details Rules are tried in order at the current position; the first match wins.
 * Identifiers are then classified as keywords, types or function names.
 * @param code Source text to tokenize.
 * @param lang "c", "json" or "text" ("text" returns the code as one plain token).
 * @returns Tokens in source order; concatenating their values reproduces the input.
 */
export function highlight(code: string, lang: 'c' | 'json' | 'text'): Token[] {
  if (lang === 'text') return [{ t: 'plain', v: code }];
  const out: Token[] = [];
  let rest = code;
  while (rest.length) {
    for (const [kind, re] of RULES) {
      const m = rest.match(re);
      if (!m) continue;
      const v = m[0];
      let t: Token['t'] = kind;
      if (lang === 'json' && (kind === 'pre' || kind === 'com')) t = 'plain';
      if (kind === 'plain' && /^[A-Za-z_]/.test(v)) {
        if (lang === 'json') t = v === 'true' || v === 'false' || v === 'null' ? 'kw' : 'plain';
        else if (KEYWORDS.has(v)) t = 'kw';
        else if (TYPES.test(v)) t = 'type';
        else if (/^\s*\(/.test(rest.slice(v.length))) t = 'fn';
      }
      out.push({ t, v });
      rest = rest.slice(v.length);
      break;
    }
  }
  return out;
}

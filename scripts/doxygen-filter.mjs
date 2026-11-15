/**
 * @file doxygen-filter.mjs
 * @brief Doxygen INPUT_FILTER: converts TypeScript/TSX to plain JavaScript for Doxygen.
 * @details Doxygen has no TypeScript parser, and its JavaScript parser misreads type
 * annotations and JSX (dropping functions and inventing members). This filter runs each
 * file through the TypeScript compiler's transpileModule, which strips types and turns
 * JSX into plain function calls while keeping every comment, so Doxygen sees ordinary
 * JavaScript with the original Doxygen blocks.
 *
 * Two adjustments keep the generated pages accurate:
 * - Doc blocks on nested (indented) helper functions become plain comments. Doxygen
 *   cannot document local functions and would otherwise merge their @param lines into,
 *   or over, the enclosing function's documentation. They stay as Doxygen blocks in
 *   the source.
 * - In Markdown files, links that point at in-page heading anchors (a hash target) become
 *   plain text, because Doxygen does not create GitHub-style heading anchors.
 *
 * Usage (set in Doxyfile): INPUT_FILTER = "node scripts/doxygen-filter.mjs"
 * Doxygen appends the file path as the last argument and reads stdout.
 */
import { readFileSync } from 'node:fs';
import ts from 'typescript';

/**
 * @brief Prepare one input file for Doxygen.
 * @param file Path of the file to filter.
 * @param source The file's contents.
 * @returns Filtered JavaScript for .ts/.tsx, Markdown with anchor links flattened for
 *          .md, or the source unchanged for anything else.
 */
function filter(file, source) {
  if (/\.md$/.test(file)) return source.replace(/\[([^\]]+)\]\(#[^)]+\)/g, '$1');
  if (!/\.tsx?$/.test(file)) return source;
  const out = ts.transpileModule(source, {
    fileName: file,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      removeComments: false,
    },
  });
  return demoteNestedDocs(out.outputText);
}

/**
 * @brief Turn doc blocks that start indented (nested helpers) into plain comments.
 * @param js Transpiled JavaScript.
 * @returns The same code with indented doc-block openers changed to plain comment openers.
 */
function demoteNestedDocs(js) {
  return js.replace(/^([ \t]+)\/\*\*(?!\/)/gm, '$1/*');
}

const file = process.argv[process.argv.length - 1];
process.stdout.write(filter(file, readFileSync(file, 'utf8')));

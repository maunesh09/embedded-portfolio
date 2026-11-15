/**
 * @file vite.config.ts
 * @brief Vite build configuration.
 * @details "production" mode builds the deployable site into dist/ using BASE_PATH.
 * "preview" mode builds one self-contained HTML file into dist-preview/.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// BASE_PATH is set by the GitHub Actions workflow from the Pages configuration:
//   project site  -> "/<repo-name>/"
//   user site     -> "/" (repo named <username>.github.io) or a custom domain
// Locally it defaults to "/".
export default defineConfig(({ mode }) => {
  const isPreview = mode === 'preview';
  return {
    base: isPreview ? './' : process.env.BASE_PATH || '/',
    plugins: isPreview ? [react(), viteSingleFile()] : [react()],
    build: {
      outDir: isPreview ? 'dist-preview' : 'dist',
      sourcemap: false,
    },
  };
});

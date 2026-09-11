import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves a project site from /<repo-name>/, so asset URLs
  // need that prefix baked in at build time.
  base: '/3D-to-Gif/',
  plugins: [react()],
})

import manifest from './manifest';
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
});

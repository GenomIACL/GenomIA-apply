import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import netlify from '@netlify/vite-plugin';

export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    // The Netlify plugin only injects environment variables for sites linked
    // through the Netlify API, so load .env here and hand it to the function
    // runtime through process.env (same variables Netlify injects on deploy).
    Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  }

  return {
    // netlify() serves netlify/functions/postular inside `vite dev`, so the
    // apply flow works locally without the Netlify CLI. It does nothing during
    // `vite build`; this project has no edge functions, and emulating them
    // needs a Deno server we don't have.
    plugins: [react(), netlify({ edgeFunctions: { enabled: false } })],
  };
});

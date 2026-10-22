import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function workerApiDevPlugin(): Plugin {
  return {
    name: 'worker-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url.startsWith('/api') || req.url.startsWith('/health'))) {
          try {
            const workerModule = await server.ssrLoadModule('/worker.ts');
            const worker = workerModule.default;

            const protocol = req.headers['x-forwarded-proto'] || 'http';
            const host = req.headers.host || 'localhost:3000';
            const fullUrl = `${protocol}://${host}${req.url}`;

            let body: any = null;
            if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
              }
              body = Buffer.concat(chunks);
            }

            const headers = new Headers();
            for (const [key, val] of Object.entries(req.headers)) {
              if (val) {
                if (Array.isArray(val)) {
                  val.forEach(v => headers.append(key, v));
                } else {
                  headers.set(key, val);
                }
              }
            }

            const request = new Request(fullUrl, {
              method: req.method,
              headers,
              body: body && body.length > 0 ? body : undefined,
            });

            const response = await worker.fetch(request, {
              GEMINI_API_KEY: process.env.GEMINI_API_KEY,
              SERVICE_NAME: 'science-of-gifts-image-studio',
            });

            res.statusCode = response.status;
            response.headers.forEach((value: string, name: string) => {
              res.setHeader(name, value);
            });

            const arrayBuffer = await response.arrayBuffer();
            res.end(Buffer.from(arrayBuffer));
          } catch (err: any) {
            console.error('[Worker Dev Middleware Error]', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err?.message || 'Dev server worker error' }));
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), workerApiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

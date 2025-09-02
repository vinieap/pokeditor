import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { createReadStream, existsSync } from "fs";
import { join } from "path";

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    // Add middleware to handle static assets before React Router
    {
      name: 'static-assets-middleware',
      configureServer(server) {
        server.middlewares.use('/sprites', (req, res, next) => {
          if (req.url) {
            const filePath = join(process.cwd(), 'public', 'sprites', req.url);
            if (existsSync(filePath)) {
              const ext = req.url.split('.').pop()?.toLowerCase();
              let contentType = 'application/octet-stream';
              
              switch (ext) {
                case 'png': contentType = 'image/png'; break;
                case 'jpg': case 'jpeg': contentType = 'image/jpeg'; break;
                case 'gif': contentType = 'image/gif'; break;
                case 'svg': contentType = 'image/svg+xml'; break;
                case 'webp': contentType = 'image/webp'; break;
                case 'avif': contentType = 'image/avif'; break;
              }
              
              res.setHeader('Content-Type', contentType);
              
              // Enhanced caching strategy for development
              if (req.url.includes('/optimized/') || contentType.startsWith('image/')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
              } else {
                res.setHeader('Cache-Control', 'public, max-age=3600');
              }
              
              // CORS headers for development
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
              
              createReadStream(filePath).pipe(res);
              return;
            }
          }
          next();
        });
      },
    },
    reactRouter(),
    tsconfigPaths(),
  ],
  server: {
    fs: {
      allow: ['..']
    }
  },
  publicDir: 'public',
});

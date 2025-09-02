import { createRequestHandler } from "react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

interface Env {
  ASSETS: Fetcher;
  NODE_ENV?: string;
  VALUE_FROM_CLOUDFLARE?: string;
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    // In development, let Vite handle everything except React Router routes
    if (import.meta.env.DEV) {
      return requestHandler(request, {
        cloudflare: { env, ctx },
      });
    }
    
    const url = new URL(request.url);
    
    // In production, handle static assets (sprites, images, etc.)
    if (url.pathname.startsWith('/sprites/') || 
        url.pathname.startsWith('/images/') ||
        url.pathname.startsWith('/data/') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.gif') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.avif') ||
        url.pathname.endsWith('.webp') ||
        url.pathname.endsWith('.json') ||
        url.pathname.endsWith('.ico')) {
      
      // Try to fetch from static assets first
      try {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) {
          // Add appropriate caching headers based on asset type
          const response = new Response(assetResponse.body, assetResponse);
          
          // Determine cache duration based on file type
          let cacheControl = 'public, max-age=31536000, immutable'; // 1 year for images
          let etag = `"${Date.now()}"`; // Simple ETag based on timestamp
          
          if (url.pathname.endsWith('.json')) {
            // Data files - cache for 1 hour, allow revalidation
            cacheControl = 'public, max-age=3600, must-revalidate';
          } else if (url.pathname.includes('/sprites/')) {
            // Sprites - cache aggressively since they rarely change
            cacheControl = 'public, max-age=31536000, immutable';
            
            // Add responsive image headers for sprites
            if (url.pathname.endsWith('.webp') || url.pathname.endsWith('.avif')) {
              response.headers.set('Vary', 'Accept');
            }
          }
          
          // Set caching headers
          response.headers.set('Cache-Control', cacheControl);
          response.headers.set('ETag', etag);
          
          // Add CORS headers for cross-origin requests
          response.headers.set('Access-Control-Allow-Origin', '*');
          response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          
          // Handle conditional requests
          const ifNoneMatch = request.headers.get('If-None-Match');
          if (ifNoneMatch && ifNoneMatch === etag) {
            return new Response(null, { 
              status: 304,
              headers: response.headers 
            });
          }
          
          return response;
        }
      } catch (error) {
        // Fall through to 404 if asset fetch fails
        console.error('Asset fetch error:', error);
      }
      
      return new Response('Not Found', { status: 404 });
    }
    
    // Handle all other requests through React Router
    try {
      const response = await requestHandler(request, {
        cloudflare: { env, ctx },
      });
      
      // Add security and performance headers for HTML responses
      if (response.headers.get('Content-Type')?.includes('text/html')) {
        const enhancedResponse = new Response(response.body, response);
        
        // Security headers
        enhancedResponse.headers.set('X-Content-Type-Options', 'nosniff');
        enhancedResponse.headers.set('X-Frame-Options', 'DENY');
        enhancedResponse.headers.set('X-XSS-Protection', '1; mode=block');
        enhancedResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Cache HTML for 5 minutes in production, allow stale while revalidate
        if (import.meta.env.PROD) {
          enhancedResponse.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
        }
        
        return enhancedResponse;
      }
      
      return response;
    } catch (error) {
      console.error('Request handler error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;

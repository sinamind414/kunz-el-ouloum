import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Fable 5 audit - security headers (sans dépendance helmet pour rester offline-light)
  app.use((_, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    // CSP minimale offline-first : la télémétrie Supabase optionnelle est autorisée via connect-src.
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' data:",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'none'",
      ].join('; ')
    );
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      mode: process.env.NODE_ENV || "development",
      tutor: "offline",
      dataVersion: "github-500qcm-v1-fable5-full",
      uptime: Math.round(process.uptime()),
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Cache static assets 1y, index.html no-cache
    app.use(express.static(distPath, {
      maxAge: '1y',
      etag: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
    // Catch-all SPA sauf les routes /api/* (pour ne pas casser une future API).
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Error handler global : log serveur + réponse 500 sans stack en production.
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[server error]', err?.message || err);
    if (res.headersSent) return;
    res.status(500).json({
      status: "error",
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : (err?.message || "Internal Server Error"),
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Kunz El Ouloum server starting on port ${PORT} - offline tutor active`);
  });
}

startServer().catch((err) => {
  console.error('[server fatal]', err);
  process.exit(1);
});

// ============================================================
// deploy/ecosystem.config.cjs — PM2 (exemple)
// Multi-instances derrière nginx (round-robin) pour monter en
// charge ; en dessous de ~50k élèves une SEULE instance suffit.
//   pm2 start deploy/ecosystem.config.cjs
// ⚠ PostgreSQL recommandé dès que plusieurs instances partagent
//   les données (DATABASE_URL) ; SQLite (WAL) convient mono-
//   instance (les écritures restent sérialisées par le fichier).
// ============================================================
module.exports = {
  apps: [
    {
      name: 'kunz-el-ouloum',
      script: 'dist/server.cjs',
      instances: process.env.INSTANCES || 2, // cluster multi-cœurs
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        TRUST_PROXY: '1',
        // En production : DATABASE_URL=postgres://user:pass@host:5432/boussole
        // + JWT_SECRET fort + ADMIN_EMAIL/ADMIN_PASSWORD (puis les modifier).
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      merge_logs: true,
      time: true,
    },
  ],
};

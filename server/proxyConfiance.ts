// proxyConfiance.ts — l'avertissement TRUST_PROXY (audit externe, 15/10/2026).
//
// `app.set('trust proxy', 1)` fait venir `req.ip` de l'en-tête
// X-Forwarded-For. Derrière un nginx/Caddy qui ÉCRASE cet en-tête, c'est
// l'IP réelle de l'élève — nécessaire aux limiteurs d'IP (login,
// réinitialisation). Exposé directement, le champ est forgeable à chaque
// requête et tous les limiteurs sont contournables. docker-compose.yml a
// longtemps combiné les deux (`TRUST_PROXY: '1'` + `ports: 3000:3000`) ;
// le compose lie désormais le port sur 127.0.0.1, et ce module journalise
// l'avertissement au démarrage pour tout autre mode de déploiement.

export function avertissementProxy(
  env: { TRUST_PROXY?: string } = process.env,
): string | null {
  if ((env.TRUST_PROXY ?? '').trim() !== '1') return null;
  return (
    '[confiance proxy] TRUST_PROXY=1 : req.ip vient de X-Forwarded-For.\n' +
    "[confiance proxy] N'activez ce mode QUE derrière un reverse proxy qui ÉCRASE cet\n" +
    '[confiance proxy] en-tête. Exposé directement, il est forgeable par le client : les\n' +
    '[confiance proxy] limiteurs d\'IP (login, réinitialisation) peuvent être contournés.'
  );
}

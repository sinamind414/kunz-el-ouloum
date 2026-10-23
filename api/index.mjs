// api/index.mjs — point d'entrée serverless Vercel (24/10/2026).
// Le serveur Express complet (auth élèves, facturation/licences, dashboards)
// est exporté par dist/server.cjs en mode VERCEL : pas de listen, la
// plateforme appelle le handler à chaque requête (cold start une seule fois).
import { handlerVercel } from '../dist/server.cjs';

export default handlerVercel;

import { loadFullAppConfig } from "../../data/subjects.js";

// Les audits exhaustifs chargent volontairement tous les payloads. Le navigateur,
// lui, n'importe qu'une année à la demande via loadYear().
export const APP_CONFIG = await loadFullAppConfig();

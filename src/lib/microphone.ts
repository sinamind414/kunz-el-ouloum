// src/lib/microphone.ts — MOTEUR NATIF DE DICTÉE (APK Android, hors ligne)
//
// POURQUOI CE FICHIER EXISTE
// La Web Speech API du navigateur (`webkitSpeechRecognition`) :
//   · n'existe PAS dans la WebView Android → sur l'APK, le bouton « micro »
//     de la leçon interactive et de l'épreuve était DÉSACTIVÉ (constat du
//     propriétaire sur le téléphone) ;
//   · sur Chrome, elle envoie l'audio aux serveurs de Google → contredit la
//     promesse « en mode invité, rien ne quitte votre téléphone ».
//
// Un plugin NATIF (android/app/src/main/java/…/speech/SpeechToTextPlugin.java)
// utilise le moteur du système EN MODE SUR APPAREIL : la reconnaissance
// tourne dans le téléphone, AUCUN réseau n'est utilisé, aucune donnée ne
// sort. Ce module l'interroge ; `Dictaphone.tsx` garde son chemin navigateur
// inchangé et ne bascule sur le natif que si le plugin répond.
//
// AUCUNE REQUÊTE RÉSEAU N'EST EMISE PAR CE MODULE.

/** Réponse du plugin natif. */
export interface InfoMoteurNatif {
  /** Un moteur de reconnaissance sur l'appareil est-il utilisable ? */
  available: boolean;
  /** La reconnaissance se fait-elle dans l'appareil (hors ligne) ? */
  surAppareil: boolean;
  /** Locale proposée par le système (ar par défaut). */
  langue?: string;
}

export interface ResultatMicro {
  /** Texte dicté (vide si rien n'a été dit). */
  texte: string;
  /** Message d'explication (arabe) en cas d'échec, sinon null. */
  message: string | null;
}

/** Interface du plugin natif (miroir de SpeechToTextPlugin.java). */
export interface PluginNatif {
  isAvailable(): Promise<InfoMoteurNatif>;
  start(options: { langue: string }): Promise<void>;
  stop(): Promise<{ texte: string }>;
  cancel(): Promise<void>;
  addListener?(evenement: string, cb: (e: { texte: string }) => void): void;
  removeAllListeners?(evenement: string): Promise<void>;
}

const EVENEMENT_PARTIEL = 'partiel';

/**
 * Instance du plugin natif, ou null s'il est absent (web, ou APK sans le
 * plugin). Le module `@capacitor/core` est importé DYNAMIQUEQUEMENT : il ne
 * doit pas entrer dans le bundle web.
 */
export async function moteurNatif(): Promise<PluginNatif | null> {
  try {
    const cap = await import('@capacitor/core');
    const plugins = (cap as unknown as { Plugins?: Record<string, unknown> }).Plugins;
    const candidat = plugins?.SpeechToText as PluginNatif | undefined;
    if (candidat && typeof candidat.isAvailable === 'function') return candidat;
    // Pont Capacitor v5+ : registerPlugin crée un proxy même si le plugin
    // natif est absent — on le teste donc par l'appel (échec => pas de plugin).
    const proxy = cap.registerPlugin<PluginNatif>('SpeechToText');
    await proxy.isAvailable();
    return proxy;
  } catch {
    return null;
  }
}

/**
 * Le moteur natif est-il utilisable (reconnaissance SUR APPAREIL) ?
 * Renvoie null quand le plugin est absent ou quand la reconnaissance
 * hors ligne n'est pas possible sur cet appareil.
 */
export async function moteurNatifDisponible(): Promise<InfoMoteurNatif | null> {
  const natif = await moteurNatif();
  if (!natif) return null;
  try {
    const info = await natif.isAvailable();
    if (info?.available) return info;
    return null;
  } catch {
    return null;
  }
}

/**
 * Dicter via le moteur natif.
 * @param langue locale de reconnaissance (« ar » par défaut — فصحى)
 * @param surPartiel appelé à chaque fragment provisoire (affichage en direct)
 */
export async function dicterNatif(
  langue = 'ar',
  surPartiel?: (texte: string) => void,
): Promise<ResultatMicro> {
  const natif = await moteurNatif();
  if (!natif) {
    return { texte: '', message: 'الإملاء الصوتي على الجهاز غير متاح هنا' };
  }
  try {
    const info = await natif.isAvailable();
    if (!info?.available) {
      return {
        texte: '',
        message:
          'التعرّف على الكلام غير متاح على هذا الجهاز دون اتصال — اكتب إجابتك بدلًا من ذلك',
      };
    }
    if (natif.addListener) {
      natif.addListener(EVENEMENT_PARTIEL, (e) => {
        if (e?.texte) surPartiel?.(e.texte);
      });
    }
    await natif.start({ langue });
    const final = await natif.stop();
    if (natif.removeAllListeners) await natif.removeAllListeners(EVENEMENT_PARTIEL);
    return { texte: (final?.texte ?? '').trim(), message: null };
  } catch (err) {
    const message = err instanceof Error && err.message ? err.message : null;
    return { texte: '', message: message ?? 'تعذّر الاستماع' };
  }
}

// src/components/__tests__/cablageMicrophoneApk.lock.test.ts
// VERROU DE CÂBLAGE — dictée vocale sur l'APK (moteur natif hors ligne)
//
// Ce que ce verrou fige (lecture des sources — le plugin Java et le manifeste
// ne sont pas exécutables en jsdom) :
//
//   1. l'APK DÉCLARE les permissions micro (sans elles, la WebView ne peut
//      rien capter et Capacitor ne peut pas les demander) ;
//   2. le plugin natif est ENREGISTRÉ dans MainActivity (sans cela, la WebView
//      n'a pas de Web Speech API et le bouton micro reste mort sur l'APK) ;
//   3. le plugin utilise le moteur SUR APPAREIL et NE bascule JAMAIS sur le
//      moteur réseau : c'est ce qui tient la promesse « rien ne quitte le
//      téléphone » (politique de confidentialité §3) ;
//   4. le Morchid (tuteur) affiche le micro dans sa barre de saisie ;
//   5. le Dictaphone reste branché sur les champs de réponse écrite.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '../../..');
const lire = (chemin: string): string => readFileSync(resolve(ROOT, chemin), 'utf8');

const MANIFESTE = 'android/app/src/main/AndroidManifest.xml';
const ACTIVITE = 'android/app/src/main/java/com/sinamind414/kunzelouloum/MainActivity.java';
const PLUGIN = 'android/app/src/main/java/com/sinamind414/kunzelouloum/speech/SpeechToTextPlugin.java';

describe('câblage de la dictée vocale sur l’APK', () => {
  it('le manifeste déclare les permissions micro', () => {
    const manifeste = lire(MANIFESTE);
    expect(manifeste).toContain('android.permission.RECORD_AUDIO');
    expect(manifeste).toContain('android.permission.MODIFY_AUDIO_SETTINGS');
  });

  it('MainActivity enregistre le plugin natif', () => {
    const activite = lire(ACTIVITE);
    expect(activite).toContain('registerPlugin(SpeechToTextPlugin.class)');
    expect(activite).toContain('import com.sinamind414.kunzelouloum.speech.SpeechToTextPlugin;');
  });

  it('le plugin utilise le moteur SUR APPAREIL, jamais le moteur réseau', () => {
    const plugin = lire(PLUGIN);
    expect(plugin).toContain('SpeechRecognizer.createOnDeviceSpeechRecognizer');
    expect(plugin).toContain('isOnDeviceRecognitionAvailable');
    expect(plugin).toContain('EXTRA_PREFER_OFFLINE');
    // Interdit : createSpeechRecognizer (moteur réseau de Google).
    expect(plugin).not.toContain('SpeechRecognizer.createSpeechRecognizer(');
  });

  it('le plugin expose le contrat attendu par le web', () => {
    const plugin = lire(PLUGIN);
    for (const methode of ['isAvailable', 'start', 'stop', 'cancel']) {
      expect(plugin, `méthode native manquante : ${methode}`).toContain(methode);
    }
    expect(plugin).toContain('notifyListeners');
  });

  it('le Morchid affiche le micro dans sa barre de saisie', () => {
    const tuteur = lire('src/components/AITutorView.tsx');
    expect(tuteur).toContain("import Dictaphone from './Dictaphone'");
    expect(tuteur).toContain('zone="tutor-chat"');
  });

  it('les champs de réponse écrite restent équipés du micro', () => {
    // 18 sites de dictée au 2026-11-10 (leçon interactive, épreuve, Meftah,
    // méthodologie, Tadwin, Tahlil) : le composant unique est branché partout.
    const fichiers = [
      'src/components/ActiveLessonView.tsx',
      'src/components/Bac2025ExamView.tsx',
      'src/components/MeftahView.tsx',
      'src/components/MethodologyCompilerView.tsx',
      'src/components/TadwinView.tsx',
      'src/components/TahlilWall.tsx',
    ];
    let total = 0;
    for (const f of fichiers) {
      const source = lire(f);
      expect(source, `${f} : Dictaphone non importé`).toContain("from './Dictaphone'");
      total += (source.match(/<Dictaphone/g) || []).length;
    }
    expect(total, 'moins de 15 champs de réponse écrite équipés du micro').toBeGreaterThanOrEqual(15);
  });
});

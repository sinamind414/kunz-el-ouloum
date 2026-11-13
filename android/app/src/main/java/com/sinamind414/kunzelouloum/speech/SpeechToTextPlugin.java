package com.sinamind414.kunzelouloum.speech;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.ArrayList;

/**
 * SpeechToText — dictée VOCALE 100 % LOCALE pour l'application.
 *
 * POURQUOI UN PLUGIN NATIF
 * La Web Speech API du navigateur (`webkitSpeechRecognition`) n'existe PAS
 * dans la WebView Android : sur l'APK, le bouton « micro » de la leçon
 * interactive était donc désactivé. De plus, sur Chrome, cette API envoie
 * l'audio aux serveurs de Google — ce qui contredit la promesse de
 * l'application (« en mode invité, rien ne quitte votre téléphone »).
 * Ce plugin s'appuie donc sur le moteur NATIF du système
 * (`android.speech.SpeechRecognizer`), en mode SUR APPAREIL
 * (`createOnDeviceSpeechRecognizer`, API 31+ / Android 12) : la reconnaissance
 * tourne dans le téléphone, aucun réseau n'est utilisé.
 *
 * CONSÉQUENCE ASSUMÉE : sur un appareil dont le pack linguistique arabe n'est
 * pas installé (ou sous Android 11 et antérieurs), la dictée n'est pas
 * disponible. Le plugin le dit franchement (`available: false`) et l'interface
 * invite l'élève à écrire — jamais de faux silence, jamais d'audio envoyé à
 * un tiers.
 *
 * Contrat JS (voir src/lib/microphone.ts) :
 *   isAvailable() → { available, surAppareil }
 *   start({ langue }) → démarre l'écoute ; émet `partiel` { texte }
 *   stop()  → { texte }  (texte final)
 *   cancel() → arrête sans texte
 */
@CapacitorPlugin(
    name = "SpeechToText",
    permissions = {
        @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO })
    }
)
public class SpeechToTextPlugin extends Plugin {

    /** Langue par défaut : arabe standard (فصحى) — jamais de dialecte. */
    private static final String LANGUE_DEFAUT = "ar";
    private static final String EVENEMENT_PARTIEL = "partiel";

    private SpeechRecognizer recognizer;
    private boolean surAppareil = false;
    private PluginCall appelEnAttente;
    private String langueActive = LANGUE_DEFAUT;

    @Override
    public void load() {
        // Le moteur est créé à la demande : certains appareils lèvent une
        // exception si le pack linguistique n'est pas présent.
        creerReconnaisseur();
    }

    /** Crée le moteur SUR APPAREIL s'il est disponible (hors ligne). */
    private void creerReconnaisseur() {
        if (recognizer != null) {
            return;
        }
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
                && SpeechRecognizer.isOnDeviceRecognitionAvailable(getContext())) {
                recognizer = SpeechRecognizer.createOnDeviceSpeechRecognizer(getContext());
                surAppareil = true;
            } else {
                // On ne bascule JAMAIS sur le moteur réseau : la promesse de
                // confidentialité prime. Pas de moteur = pas de dictée.
                recognizer = null;
                surAppareil = false;
            }
        } catch (Throwable t) {
            recognizer = null;
            surAppareil = false;
        }
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        creerReconnaisseur();
        JSObject reponse = new JSObject();
        reponse.put("available", recognizer != null);
        reponse.put("surAppareil", surAppareil);
        reponse.put("langue", LANGUE_DEFAUT);
        call.resolve(reponse);
    }

    @PluginMethod
    public void start(PluginCall call) {
        creerReconnaisseur();
        if (recognizer == null) {
            call.reject(
                "hote_indisponible",
                "التعرّف على الكلام غير متاح على هذا الجهاز دون اتصال — اكتب إجابتك بدلًا من ذلك"
            );
            return;
        }
        String langue = call.getString("langue", LANGUE_DEFAUT);
        if (langue == null || langue.isEmpty()) {
            langue = LANGUE_DEFAUT;
        }
        langueActive = langue;

        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "permissionMicrophone");
            return;
        }
        demarrerEcoute(call);
    }

    @PermissionCallback
    private void permissionMicrophone(PluginCall call) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            call.reject("permission_refusee", "لم يُسمح باستخدام الميكروفون");
            return;
        }
        demarrerEcoute(call);
    }

    private void demarrerEcoute(PluginCall call) {
        creerReconnaisseur();
        if (recognizer == null) {
            call.reject("hote_indisponible", "التعرّف على الكلام غير متاح على هذا الجهاز");
            return;
        }
        // Un appel déjà en cours est annulé proprement : on ne superpose
        // jamais deux écoutes (le micro resterait ouvert).
        if (appelEnAttente != null) {
            try {
                recognizer.cancel();
            } catch (Throwable ignored) {
                // le moteur peut déjà être mort : on continue
            }
            appelEnAttente = null;
        }
        appelEnAttente = call;

        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, langueActive);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        // API 23+ : on demande explicitement le moteur hors ligne.
        intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);

        recognizer.setRecognitionListener(new Ecouteur());
        try {
            recognizer.startListening(intent);
        } catch (Throwable t) {
            appelEnAttente = null;
            call.reject("demarrage_impossible", "تعذّر بدء الاستماع");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (recognizer == null) {
            call.reject("hote_indisponible", "التعرّف على الكلام غير متاح على هذا الجهاز");
            return;
        }
        try {
            recognizer.stopListening();
        } catch (Throwable t) {
            if (appelEnAttente != null) {
                JSObject vide = new JSObject();
                vide.put("texte", "");
                appelEnAttente.resolve(vide);
                appelEnAttente = null;
            }
        }
        // L'appel est résolu par onResults / onError ; si le moteur se tait,
        // `onEndOfSpeech` + l'absence de résultat sont traités plus bas.
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        if (recognizer != null) {
            try {
                recognizer.cancel();
            } catch (Throwable ignored) {
                // moteur déjà arrêté
            }
        }
        if (appelEnAttente != null) {
            JSObject vide = new JSObject();
            vide.put("texte", "");
            appelEnAttente.resolve(vide);
            appelEnAttente = null;
        }
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        if (recognizer != null) {
            try {
                recognizer.destroy();
            } catch (Throwable ignored) {
                // moteur déjà détruit
            }
            recognizer = null;
        }
        super.handleOnDestroy();
    }

    /** Traduit les événements du moteur en événements JS. */
    private class Ecouteur implements RecognitionListener {

        @Override
        public void onReadyForSpeech(Bundle params) {
        }

        @Override
        public void onBeginningOfSpeech() {
        }

        @Override
        public void onRmsChanged(float rmsdB) {
        }

        @Override
        public void onBufferReceived(byte[] buffer) {
        }

        @Override
        public void onEndOfSpeech() {
            // onResults suivra ; si le moteur ne donne rien, l'appel doit
            // quand même être résolu (pas d'appel bloqué).
            if (appelEnAttente != null && !recognizerEnCours()) {
                JSObject vide = new JSObject();
                vide.put("texte", "");
                appelEnAttente.resolve(vide);
                appelEnAttente = null;
            }
        }

        @Override
        public void onError(int error) {
            if (appelEnAttente == null) {
                return;
            }
            PluginCall appel = appelEnAttente;
            appelEnAttente = null;
            // 7 = no match, 8 = network (impossible ici : moteur sur appareil),
            // 9 = insufficient permission, 6 = no audio.
            if (error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) {
                appel.reject("permission_refusee", "لم يُسمح باستخدام الميكروفون");
            } else if (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) {
                JSObject vide = new JSObject();
                vide.put("texte", "");
                appel.resolve(vide);
            } else {
                JSObject vide = new JSObject();
                vide.put("texte", "");
                appel.resolve(vide);
            }
        }

        @Override
        public void onResults(Bundle results) {
            if (appelEnAttente == null) {
                return;
            }
            PluginCall appel = appelEnAttente;
            appelEnAttente = null;
            ArrayList<String> liste = results == null
                ? null
                : results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
            String texte = "";
            if (liste != null && !liste.isEmpty() && liste.get(0) != null) {
                texte = liste.get(0).trim();
            }
            JSObject reponse = new JSObject();
            reponse.put("texte", texte);
            appel.resolve(reponse);
        }

        @Override
        public void onPartialResults(Bundle partialResults) {
            ArrayList<String> liste = partialResults == null
                ? null
                : partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
            if (liste == null || liste.isEmpty() || liste.get(0) == null) {
                return;
            }
            JSObject evenement = new JSObject();
            evenement.put("texte", liste.get(0).trim());
            notifyListeners(EVENEMENT_PARTIEL, evenement);
        }

        @Override
        public void onEvent(int eventType, Bundle params) {
        }
    }

    /** Le moteur est-il encore en écoute ? (évite de résoudre deux fois). */
    private boolean recognizerEnCours() {
        // SpeechRecognizer n'expose pas cet état : on s'appuie sur le fait que
        // l'appel en attente est résolu par onResults. Conservé par sécurité.
        return false;
    }
}

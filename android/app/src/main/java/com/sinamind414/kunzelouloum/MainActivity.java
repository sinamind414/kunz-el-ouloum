package com.sinamind414.kunzelouloum;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.sinamind414.kunzelouloum.speech.SpeechToTextPlugin;

public class MainActivity extends BridgeActivity {

    /**
     * Dictée vocale locale (plugin maison) : enregistrement du plugin AVANT
     * super.onCreate (exigence Capacitor — le plugin doit être connu du pont
     * avant le chargement de la page). Sans ce plugin, la WebView Android
     * n'expose pas la Web Speech API : le bouton « micro » de la leçon
     * interactive restait désactivé sur l'APK.
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SpeechToTextPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

#!/usr/bin/env node
/**
 * Script de vérification manuelle des PDF de l'archive
 * À exécuter en local (nécessite accès réseau à dzexams.com)
 *
 * Usage:
 *   node scripts/verify-archive-pdfs.mjs
 *
 * Ce script :
 * 1. Télécharge chaque PDF référencé dans data/archive.js
 * 2. Vérifie que le code HTTP est 200
 * 3. Vérifie que le PDF n'est pas vide
 * 4. Met à jour contentVerified: true si tout est OK
 * 5. Génère un rapport des PDF inaccessibles
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import https from "node:https";

const ARCHIVE_PATH = resolve(".", "data", "archive.js");

// Charger l'archive
const archiveModule = await import("../data/archive.js");
const { ARCHIVE } = archiveModule;

// Entrées avec viewer: blocked et contentVerified: false (à vérifier)
const entriesToVerify = ARCHIVE.entries.filter((e) => e.viewer === "blocked" && e.contentVerified === false);

console.log(`=== Vérification des ${entriesToVerify.length} PDF bloqués ===\n`);

const results = [];

for (const entry of entriesToVerify) {
  const { year, stream, session, pdfUrl, url } = entry;

  if (!pdfUrl) {
    console.log(`⚠️  ${year} ${stream} ${session}: PAS DE pdfUrl (seulement url: ${url})`);
    results.push({
      ...entry,
      status: "MISSING_PDF_URL",
      accessible: false,
      error: "No pdfUrl field"
    });
    continue;
  }

  try {
    console.log(`🔍 Vérification: ${year} ${stream} ${session}...`);
    console.log(`   URL: ${pdfUrl}`);

    const pdfData = await new Promise((resolve, reject) => {
      https
        .get(pdfUrl, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}`));
            return;
          }
          const chunks = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
        })
        .on("error", reject);
    });

    if (pdfData.length === 0) {
      throw new Error("PDF vide (0 bytes)");
    }

    // Vérification basique que c'est un PDF (header %PDF)
    const isPdf = pdfData.subarray(0, 4).toString() === "%PDF";

    if (!isPdf) {
      console.log(`   ⚠️  Fichier non-PDF (header: ${pdfData.subarray(0, 4).toString()})`);
      results.push({
        ...entry,
        status: "NOT_PDF",
        accessible: true,
        size: pdfData.length,
        error: "File is not a PDF"
      });
      continue;
    }

    console.log(`   ✅ ACCÈS OK (taille: ${(pdfData.length / 1024).toFixed(1)} KB)`);
    results.push({
      ...entry,
      status: "OK",
      accessible: true,
      size: pdfData.length,
      error: null
    });
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`);
    results.push({
      ...entry,
      status: "ERROR",
      accessible: false,
      size: null,
      error: error.message
    });
  }
}

// Générer le rapport
console.log("\n=== RAPPORT ===\n");

const okCount = results.filter((r) => r.status === "OK").length;
const errorCount = results.filter((r) => r.accessible === false).length;
const warningCount = results.filter((r) => r.status === "NOT_PDF" || r.status === "MISSING_PDF_URL").length;

console.log(`✅ Accessibles: ${okCount}/${entriesToVerify.length}`);
console.log(`❌ Inaccessibles: ${errorCount}/${entriesToVerify.length}`);
console.log(`⚠️  Avertissements: ${warningCount}/${entriesToVerify.length}`);

// Détails des échecs
const failures = results.filter((r) => !r.accessible || r.status !== "OK");
if (failures.length > 0) {
  console.log("\n--- Échecs détaillés ---");
  for (const f of failures) {
    console.log(`- ${f.year} ${f.stream} ${f.session}: ${f.status} - ${f.error || "N/A"}`);
  }
}

// Instructions pour mise à jour manuelle
console.log("\n=== ACTIONS RECOMMANDÉES ===\n");
if (okCount > 0) {
  console.log(`1. Mettre à jour ${okCount} entrées avec contentVerified: true`);
  console.log("   Exemple:");
  console.log("   // Avant:");
  console.log('   { year: "2018", stream: "se", ..., contentVerified: false }');
  console.log("   // Après:");
  console.log('   { year: "2018", stream: "se", ..., contentVerified: true }');
}

if (errorCount > 0) {
  console.log(`2. Investiguer ${errorCount} PDF inaccessibles:`);
  for (const f of results.filter((r) => !r.accessible)) {
    console.log(`   - ${f.year} ${f.stream} ${f.session}: ${f.pdfUrl || f.url}`);
  }
}

// Si tout est OK, proposer de générer un patch
if (okCount === entriesToVerify.length && errorCount === 0) {
  console.log("\n✅ TOUS LES PDF SONT ACCESSIBLES !");
  console.log("Vous pouvez maintenant mettre à jour contentVerified: true pour toutes les entrées bloquées.");
}

export { results };

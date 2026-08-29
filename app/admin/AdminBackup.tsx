"use client";

import { useRef, useState } from "react";

export function AdminBackup() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function exportBackup() {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/backup/export");
      if (!res.ok) throw new Error("Échec de l'export.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="(.+)"/);
      const a = document.createElement("a");
      a.href = url;
      a.download = match ? match[1] : `alloartiste-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Échec de l'export.");
    } finally {
      setExporting(false);
    }
  }

  async function restoreBackup(file: File) {
    const ok = confirm(
      "Restaurer cette sauvegarde va recréer ou mettre à jour les profils, demandes, articles et réglages contenus dans le fichier. Rien de ce qui existe déjà en base ne sera supprimé. Continuer ?"
    );
    if (!ok) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch("/api/admin/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json)
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Échec de la restauration.");

      const c = body.counts;
      setResult(
        `Restauration terminée : ${c.artists} artiste(s), ${c.leads} demande(s) de contact, ${c.unavailableDates} date(s) bloquée(s), ${c.contactMessages} message(s), ${c.articles} article(s), ${c.inviteCodes} code(s) d'invitation, ${c.settings} réglage(s) du site.`
      );
    } catch (err: any) {
      setError(err.message || "Ce fichier n'est pas une sauvegarde valide.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="panel wide">
      <h2 style={{ fontSize: 22, marginBottom: 4 }}>Exporter une sauvegarde</h2>
      <p className="sub">
        Télécharge un seul fichier contenant tous les profils d&apos;artistes, demandes de contact, dates
        bloquées, messages de contact, articles, codes d&apos;invitation et réglages du site.
      </p>
      <button className="btn btn-gold" onClick={exportBackup} disabled={exporting} data-loading={exporting}>
        {exporting ? "Export en cours..." : "Télécharger la sauvegarde"}
      </button>

      <h2 style={{ fontSize: 22, margin: "36px 0 4px" }}>Restaurer une sauvegarde</h2>
      <p className="sub">
        Sélectionne un fichier de sauvegarde précédemment téléchargé. Les données qu&apos;il contient sont
        recréées ou mises à jour — rien n&apos;est supprimé.
      </p>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        disabled={importing}
        onChange={(e) => e.target.files?.[0] && restoreBackup(e.target.files[0])}
      />
      {importing && <p className="hint" style={{ marginTop: 10 }}>Restauration en cours...</p>}
      {result && (
        <p className="success" style={{ marginTop: 14 }}>
          {result}
        </p>
      )}
      {error && (
        <p className="error" style={{ marginTop: 14 }}>
          {error}
        </p>
      )}
    </div>
  );
}

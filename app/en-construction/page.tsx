export const dynamic = "force-dynamic";

export default function EnConstructionPage() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 20px"
      }}
    >
      <div className="panel" style={{ maxWidth: 480 }}>
        <h2 style={{ fontSize: 26 }}>Le site est en construction</h2>
        <p className="sub" style={{ marginBottom: 0 }}>
          AlloArtiste prépare son lancement. Revenez très bientôt !
        </p>
      </div>
    </div>
  );
}

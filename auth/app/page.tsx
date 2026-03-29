export default function Home() {
  return (
    <main style={{ padding: "2rem", maxWidth: "42rem", lineHeight: 1.5 }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
        EAFIT Bikes — Auth API
      </h1>
      <p style={{ color: "#444", marginTop: "0.75rem" }}>
        This service exposes HTTP endpoints under <code>/api/…</code> only. Use
        your client app or API tools to call them.
      </p>
    </main>
  );
}

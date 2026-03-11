import { Link } from "react-router-dom";

export function AboutPage() {
  return (
    <div className="card" style={{ maxWidth: "480px", margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>About</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
        Electronic Book Keeper — modernized from the original VB6 application.
      </p>
      <p style={{ fontWeight: 700, marginBottom: "0.25rem" }}>By:</p>
      <ul style={{ margin: "0 0 1rem 1.25rem", padding: 0 }}>
        <li style={{ marginBottom: "0.25rem" }}>Rodito M. Buan II</li>
        <li>Stephanie Lui</li>
      </ul>
      <p style={{ marginBottom: "1rem" }}>
        <a href="mailto:jeff@kaibigan.com" target="_blank" rel="noopener noreferrer">
          jeff@kaibigan.com
        </a>
      </p>
      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
        <a href="http://telanis.hypermart.net/bk/" target="_blank" rel="noopener noreferrer">
          Original project (telanis.hypermart.net)
        </a>
      </p>
      <div style={{ marginTop: "1.5rem" }}>
        <Link to="/" className="btn btn-primary">
          Back
        </Link>
      </div>
    </div>
  );
}

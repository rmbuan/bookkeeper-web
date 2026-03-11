import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Electronic Book Keeper</h1>
        <nav style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link to="/">Books</Link>
          {user?.isAdmin && <Link to="/users">User admin</Link>}
          <Link to="/about">About</Link>
          <Link to="/change-password">Change password</Link>
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{user?.username}</span>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>
      <main style={{ flex: 1, padding: "1.5rem" }}>
        <Outlet />
      </main>
    </div>
  );
}

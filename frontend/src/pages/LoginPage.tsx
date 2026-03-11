import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const API = "/api";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      setMode("login");
      setPassword("");
      setConfirmPassword("");
      setError("");
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="card" style={{ width: "100%", maxWidth: "360px" }}>
        <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>
          {mode === "login" ? "Password protection" : "Create account"}
        </h2>
        {mode === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Login name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Login name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary">
                Register
              </button>
            </div>
          </form>
        )}
        <p style={{ marginTop: "1rem", marginBottom: 0, fontSize: "0.9rem" }}>
          {mode === "login" ? (
            <>
              No account?{" "}
              <button type="button" className="btn btn-ghost" style={{ padding: 0 }} onClick={() => { setMode("register"); setError(""); }}>
                Register
              </button>
            </>
          ) : (
            <>
              Have an account?{" "}
              <button type="button" className="btn btn-ghost" style={{ padding: 0 }} onClick={() => { setMode("login"); setError(""); }}>
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";

const API = "/api";

export interface UserRow {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [changePasswordFor, setChangePasswordFor] = useState<{ id: string; username: string } | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to add user");
        return;
      }
      setNewUsername("");
      setNewPassword("");
      fetchUsers();
    } catch {
      setError("Failed to add user");
    }
  };

  const handleToggleAdmin = async (u: UserRow) => {
    try {
      const res = await fetch(`${API}/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isAdmin: !u.isAdmin }),
      });
      if (res.ok) fetchUsers();
    } catch {
      // ignore
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePasswordFor) return;
    setPasswordError("");
    if (newPasswordValue.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPasswordValue !== newPasswordConfirm) {
      setPasswordError("Passwords do not match");
      return;
    }
    try {
      const res = await fetch(`${API}/users/${changePasswordFor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: newPasswordValue }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password");
        return;
      }
      setChangePasswordFor(null);
      setNewPasswordValue("");
      setNewPasswordConfirm("");
      setPasswordError("");
    } catch {
      setPasswordError("Failed to update password");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`${API}/users/${id}`, { method: "DELETE", credentials: "include" });
    fetchUsers();
    if (changePasswordFor?.id === id) setChangePasswordFor(null);
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>User admin</h2>

      <div className="card" style={{ marginBottom: "1.5rem", maxWidth: "400px" }}>
        <h3 style={{ marginTop: 0 }}>New account</h3>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label>Login name</label>
            <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn btn-primary">
            Add user
          </button>
        </form>
      </div>

      {changePasswordFor && (
        <div className="card" style={{ marginBottom: "1.5rem", maxWidth: "400px" }}>
          <h3 style={{ marginTop: 0 }}>Change password for {changePasswordFor.username}</h3>
          <form onSubmit={handleSetPassword}>
            <div className="form-group">
              <label>New password</label>
              <input
                type="password"
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm new password</label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                minLength={6}
                required
              />
            </div>
            {passwordError && <p className="error-message">{passwordError}</p>}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" className="btn btn-primary">
                Set password
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setChangePasswordFor(null);
                  setNewPasswordValue("");
                  setNewPasswordConfirm("");
                  setPasswordError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Username</th>
                <th style={{ padding: "0.5rem" }}>Admin</th>
                <th style={{ padding: "0.5rem" }}>Created</th>
                <th style={{ padding: "0.5rem" }}></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.5rem" }}>{u.username}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={u.isAdmin}
                        onChange={() => handleToggleAdmin(u)}
                      />
                      {u.isAdmin ? "Yes" : "No"}
                    </label>
                  </td>
                  <td style={{ padding: "0.5rem", color: "var(--text-muted)" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ marginRight: "0.25rem" }}
                      onClick={() => setChangePasswordFor({ id: u.id, username: u.username })}
                    >
                      Change password
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(u.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

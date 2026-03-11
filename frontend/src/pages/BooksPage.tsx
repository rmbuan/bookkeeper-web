import { useState, useEffect, useCallback } from "react";

const API = "/api";

export interface Book {
  id: string;
  bkTitle: string;
  bkNumber: string;
  stName: string;
  stNumber: string;
  stTaName: string;
  stTaNumber: string;
  stSbCode: string;
  createdAt: string;
  updatedAt: string;
}

const emptyBook: Omit<Book, "id" | "createdAt" | "updatedAt"> = {
  bkTitle: "",
  bkNumber: "",
  stName: "",
  stNumber: "",
  stTaName: "",
  stTaNumber: "",
  stSbCode: "",
};

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState(emptyBook);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`${API}/books?${params}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setBooks(data.books);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSave = async () => {
    try {
      if (editing) {
        await fetch(`${API}/books/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
      } else {
        await fetch(`${API}/books`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
      }
      setEditing(null);
      setForm(emptyBook);
      fetchBooks();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    await fetch(`${API}/books/${id}`, { method: "DELETE", credentials: "include" });
    fetchBooks();
    if (editing?.id === id) {
      setEditing(null);
      setForm(emptyBook);
    }
  };

  const openEdit = (book: Book) => {
    setEditing(book);
    setForm({
      bkTitle: book.bkTitle,
      bkNumber: book.bkNumber,
      stName: book.stName,
      stNumber: book.stNumber,
      stTaName: book.stTaName,
      stTaNumber: book.stTaNumber,
      stSbCode: book.stSbCode,
    });
  };

  const fields = [
    { key: "bkTitle" as const, label: "Book Title" },
    { key: "bkNumber" as const, label: "Book Number" },
    { key: "stName" as const, label: "Student Name" },
    { key: "stNumber" as const, label: "Student Number" },
    { key: "stTaName" as const, label: "TA Name" },
    { key: "stTaNumber" as const, label: "TA Number" },
    { key: "stSbCode" as const, label: "Subject Code" },
  ] as const;

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          type="search"
          placeholder="Search (student number, title, name…)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.5rem 0.75rem", minWidth: "200px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
        />
        <button type="button" className="btn btn-primary" onClick={() => { setEditing(null); setForm(emptyBook); }}>
          Add
        </button>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>{editing ? "Edit record" : "New record"}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          {fields.map(({ key, label }) => (
            <div key={key} className="form-group">
              <label>{label}</label>
              <input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
          {editing && (
            <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(emptyBook); }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>
        Record {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
      </p>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Book Title</th>
                <th style={{ padding: "0.5rem" }}>Book #</th>
                <th style={{ padding: "0.5rem" }}>Student Name</th>
                <th style={{ padding: "0.5rem" }}>Student #</th>
                <th style={{ padding: "0.5rem" }}>TA Name</th>
                <th style={{ padding: "0.5rem" }}>TA #</th>
                <th style={{ padding: "0.5rem" }}>Subject Code</th>
                <th style={{ padding: "0.5rem" }}></th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.5rem" }}>{book.bkTitle}</td>
                  <td style={{ padding: "0.5rem" }}>{book.bkNumber}</td>
                  <td style={{ padding: "0.5rem" }}>{book.stName}</td>
                  <td style={{ padding: "0.5rem" }}>{book.stNumber}</td>
                  <td style={{ padding: "0.5rem" }}>{book.stTaName}</td>
                  <td style={{ padding: "0.5rem" }}>{book.stTaNumber}</td>
                  <td style={{ padding: "0.5rem" }}>{book.stSbCode}</td>
                  <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                    <button type="button" className="btn btn-ghost" style={{ marginRight: "0.25rem" }} onClick={() => openEdit(book)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(book.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {total > 20 && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <button className="btn btn-ghost" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

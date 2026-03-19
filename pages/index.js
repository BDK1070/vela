import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const CATEGORIES = [
  {
    id: "hair",
    label: "Hair & Beauty",
    type: "Beauty",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    span: 2,
  },
  {
    id: "photography",
    label: "Photography",
    type: "Visual",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    span: 1,
  },
  {
    id: "catering",
    label: "Catering",
    type: "Food & Drink",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
    span: 1,
  },
  {
    id: "bartending",
    label: "Bartending",
    type: "Food & Drink",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
    span: 1,
  },
  {
    id: "makeup",
    label: "Makeup",
    type: "Beauty",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
    span: 2,
  },
  {
    id: "dj",
    label: "DJ & Music",
    type: "Music",
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&q=80",
    span: 1,
  },
  {
    id: "events",
    label: "Event Planning",
    type: "Events",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
    span: 1,
  },
  {
    id: "cleaning",
    label: "Cleaning",
    type: "Home",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80",
    span: 1,
  },
];

function ListModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "", bio: "", category: "hair", location: "",
    price_per_hour: 250, contact_email: "", avatar_seed: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    const seed = form.name + Date.now();
    const res = await fetch(`/api/skillbook?action=create_provider`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, avatar_seed: seed }),
    }).then((r) => r.json());
    setLoading(false);
    if (res.error) return setError(res.error);
    onSuccess(res);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">List Your Service</div>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="field-row">
            <div className="field">
              <label>Name / Business</label>
              <input placeholder="e.g. Naledi's Studio" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Bio</label>
            <textarea placeholder="Tell clients about your services…" value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Location</label>
              <input placeholder="e.g. Sandton, Johannesburg" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="field">
              <label>Rate (R/hr)</label>
              <input type="number" min="50" value={form.price_per_hour}
                onChange={(e) => setForm({ ...form, price_per_hour: Number(e.target.value) })} />
            </div>
          </div>
          <div className="field">
            <label>Contact Email</label>
            <input type="email" placeholder="you@email.com" value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button className="btn-confirm" onClick={submit} disabled={loading}>
            {loading ? "Publishing…" : "Publish Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [showList, setShowList] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? CATEGORIES.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.type.toLowerCase().includes(search.toLowerCase())
      )
    : CATEGORIES;

  return (
    <>
      <Head>
        <title>Vela — Book Local Talent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="South Africa's talent marketplace. Book hair, photography, catering, bartending and more." />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="app">

        {/* NAV */}
        <nav className="nav">
          <div className="nav-inner">
            <div className="nav-logo"><span className="logo-v">V</span>ela</div>
            <div className="nav-search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                placeholder="Search services…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="nav-actions">
              <a href="/login" className="nav-login">Provider login</a>
              <button className="nav-cta" onClick={() => setShowList(true)}>List Your Service</button>
            </div>
          </div>
        </nav>

        {/* HERO TEXT */}
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              South Africa's talent marketplace
            </div>
            <h1 className="hero-title">
              What do you<br />need today?
            </h1>
            <p className="hero-sub">Choose a service to browse local talent.</p>
          </div>
        </div>

        {/* MAGAZINE GRID */}
        <div className="mag-grid">
          {filtered.slice(0, 6).map((cat, i) => (
            <div
              key={cat.id}
              className={`mag-card ${cat.span === 2 ? "span-2" : ""}`}
              onClick={() => router.push(`/category/${cat.id}`)}
            >
              <img src={cat.image} alt={cat.label} className="mag-img" />
              <div className="mag-overlay">
                <div>
                  <div className="mag-type">{cat.type}</div>
                  <div className="mag-label">{cat.label}</div>
                </div>
              </div>
              <div className="mag-arrow">→</div>
            </div>
          ))}
        </div>

        {/* MORE CATEGORIES */}
        {filtered.length > 6 && (
          <div className="more-cats">
            {filtered.slice(6).map((cat) => (
              <button
                key={cat.id}
                className="more-pill"
                onClick={() => router.push(`/category/${cat.id}`)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 6 && (
          <div className="more-cats">
            {CATEGORIES.slice(6).map((cat) => (
              <button
                key={cat.id}
                className="more-pill"
                onClick={() => router.push(`/category/${cat.id}`)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="no-results">
            <p>No categories match "{search}"</p>
          </div>
        )}

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-logo"><span className="logo-v">V</span>ela</div>
            <div className="footer-copy">© 2024 Vela · South Africa</div>
          </div>
        </footer>
      </div>

      {showList && (
        <ListModal
          onClose={() => setShowList(false)}
          onSuccess={() => setShowList(false)}
        />
      )}

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #0D0D0D; --charge: #E8FF47; --white: #FFFFFF;
          --bg: #F0EFEA; --border: #E0DED8; --muted: #888884; --text: #1A1A1A;
        }
        html { scroll-behavior: smooth; }
        body {
          background: var(--bg); color: var(--text);
          font-family: 'Manrope', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        a { text-decoration: none; color: inherit; }

        /* NAV */
        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(240,239,234,0.92);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-inner {
          max-width: 1400px; margin: 0 auto;
          display: flex; align-items: center; gap: 20px;
          padding: 0 32px; height: 64px;
        }
        .nav-logo {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 22px; letter-spacing: -0.04em; color: var(--ink);
          flex-shrink: 0;
        }
        .logo-v { color: var(--charge); background: var(--ink); padding: 0 3px; border-radius: 3px; }
        .nav-search {
          flex: 1; max-width: 380px;
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.7);
          border: 1px solid var(--border);
          border-radius: 100px; padding: 9px 16px;
          color: var(--muted);
        }
        .nav-search:focus-within { background: #fff; border-color: var(--ink); }
        .nav-search input { border: none; background: transparent; outline: none; font-family: 'Manrope', sans-serif; font-size: 13px; color: var(--text); width: 100%; }
        .nav-search input::placeholder { color: var(--muted); }
        .nav-actions { display: flex; align-items: center; gap: 14px; margin-left: auto; }
        .nav-login { font-size: 13px; color: var(--muted); font-weight: 500; transition: color 0.15s; }
        .nav-login:hover { color: var(--ink); }
        .nav-cta {
          background: var(--ink); color: var(--white);
          border: none; border-radius: 100px;
          padding: 10px 20px; font-family: 'Manrope', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer;
          white-space: nowrap; transition: background 0.2s;
        }
        .nav-cta:hover { background: #222; }

        /* HERO */
        .hero { padding: 48px 32px 32px; max-width: 1400px; margin: 0 auto; }
        .hero-eyebrow {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 14px;
        }
        .eyebrow-dot { width: 6px; height: 6px; background: var(--charge); border-radius: 50%; display: inline-block; }
        .hero-title {
          font-family: 'Syne', sans-serif; font-size: clamp(36px, 5vw, 56px);
          font-weight: 800; letter-spacing: -0.05em; color: var(--ink);
          line-height: 1.0; margin-bottom: 10px;
        }
        .hero-sub { font-size: 15px; color: var(--muted); }

        /* MAGAZINE GRID */
        .mag-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 280px;
          gap: 3px;
          padding: 24px 3px 3px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .mag-card {
          position: relative; overflow: hidden; cursor: pointer;
          background: var(--ink);
        }
        .mag-card.span-2 { grid-column: span 2; }
        .mag-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s ease, filter 0.3s;
          filter: brightness(0.75);
        }
        .mag-card:hover .mag-img { transform: scale(1.04); filter: brightness(0.6); }
        .mag-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.05) 60%, transparent 100%);
          display: flex; flex-direction: column;
          justify-content: flex-end; padding: 24px;
        }
        .mag-type {
          font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--charge);
          margin-bottom: 5px; font-family: 'Manrope', sans-serif;
        }
        .mag-label {
          font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800;
          letter-spacing: -0.03em; color: #fff; line-height: 1.1;
        }
        .mag-card.span-2 .mag-label { font-size: 34px; }
        .mag-arrow {
          position: absolute; top: 20px; right: 20px;
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; color: #fff;
          opacity: 0; transition: opacity 0.2s;
          backdrop-filter: blur(4px);
        }
        .mag-card:hover .mag-arrow { opacity: 1; }

        /* MORE CATS */
        .more-cats {
          display: flex; gap: 8px; flex-wrap: wrap;
          padding: 16px 32px 0; max-width: 1400px; margin: 0 auto;
        }
        .more-pill {
          background: #fff; border: 1px solid var(--border);
          border-radius: 100px; padding: 8px 18px;
          font-family: 'Manrope', sans-serif;
          font-size: 13px; font-weight: 600; color: #555;
          cursor: pointer; transition: all 0.15s;
        }
        .more-pill:hover { border-color: var(--ink); color: var(--ink); }

        .no-results { text-align: center; padding: 60px 20px; color: var(--muted); font-size: 14px; }

        /* FOOTER */
        .footer { border-top: 1px solid var(--border); margin-top: 40px; }
        .footer-inner {
          max-width: 1400px; margin: 0 auto; padding: 24px 32px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .footer-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; letter-spacing: -0.03em; color: var(--ink); }
        .footer-copy { font-size: 12px; color: var(--muted); }

        /* MODAL */
        .overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(13,13,13,0.6); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal {
          background: #fff; border-radius: 20px;
          width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
          animation: slideUp 0.25s;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 28px 20px; border-bottom: 1px solid #E8E8E4;
        }
        .modal-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); }
        .modal-close {
          width: 32px; height: 32px; border-radius: 50%;
          background: #F4F4F1; border: none; color: var(--muted);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .modal-body { padding: 24px 28px 28px; }
        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
        input, select, textarea {
          border: 1px solid #E8E8E4; border-radius: 8px; padding: 11px 14px;
          font-family: 'Manrope', sans-serif; font-size: 14px; color: var(--text);
          background: #FAFAF8; outline: none; transition: border-color 0.15s; width: 100%;
        }
        input:focus, select:focus, textarea:focus { border-color: var(--ink); }
        textarea { resize: vertical; }
        .error-msg { background: #FFF5F5; border: 1px solid #FFCCCC; color: #CC0000; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; }
        .btn-confirm {
          width: 100%; background: var(--ink); color: #fff; border: none;
          border-radius: 100px; padding: 14px; font-family: 'Manrope', sans-serif;
          font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s;
        }
        .btn-confirm:hover:not(:disabled) { background: var(--charge); color: var(--ink); }
        .btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .mag-grid { grid-template-columns: 1fr 1fr; grid-auto-rows: 220px; }
          .mag-card.span-2 { grid-column: span 2; }
          .nav-search { display: none; }
          .hero { padding: 32px 20px 24px; }
          .more-cats { padding: 12px 20px 0; }
          .nav-inner { padding: 0 20px; }
        }
        @media (max-width: 480px) {
          .mag-grid { grid-template-columns: 1fr; grid-auto-rows: 200px; }
          .mag-card.span-2 { grid-column: span 1; }
        }
      `}</style>
    </>
  );
}

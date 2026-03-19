import { useState, useEffect } from "react";
import Head from "next/head";

const CATEGORIES = [
  { id: "all", label: "All Services" },
  { id: "hair", label: "Hair & Beauty" },
  { id: "photography", label: "Photography" },
  { id: "catering", label: "Catering" },
  { id: "bartending", label: "Bartending" },
  { id: "makeup", label: "Makeup" },
  { id: "dj", label: "DJ & Music" },
  { id: "cleaning", label: "Cleaning" },
  { id: "events", label: "Events" },
];

function api(action, method = "GET", body = null, extra = "") {
  return fetch(`/api/skillbook?action=${action}${extra}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());
}

function Avatar({ seed, size = 48 }) {
  return (
    <img
      src={`https://api.dicebear.com/8.x/notionists/svg?seed=${encodeURIComponent(seed)}&size=${size}`}
      alt=""
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#F0F0EC",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}

import { useRouter } from "next/router";

function ProviderCard({ p, onBook, index }) {
  const router = useRouter();
  const cat = CATEGORIES.find((c) => c.id === p.category);

  function handleCardClick(e) {
    // Card is entirely clickable, including the Book button
    router.push(`/providers/${p.id}`);
  }

  return (
    <div
      className="card"
      style={{ animationDelay: `${index * 40}ms`, cursor: "pointer" }}
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick(e);
        }
      }}
    >
      <div className="card-accent" />
      <div className="card-inner">
        <div className="card-top">
          <Avatar seed={p.avatar_seed || p.name} size={40} />
          <div className="card-meta">
            <span className="card-category">{cat?.label || p.category}</span>
            <span className="card-location">{p.location || "South Africa"}</span>
          </div>
        </div>
        <div className="card-body">
          <h3 className="card-name">{p.name}</h3>
          <p className="card-bio">{p.bio || "No description provided."}</p>
        </div>
        <div className="card-footer">
          <div className="card-price">
            <span className="price-amount">R{p.price_per_hour}</span>
            <span className="price-unit">/hr</span>
          </div>
          <button
            className="btn-book"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/providers/${p.id}`);
            }}
            tabIndex={-1}
          >
            Book
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingModal({ provider, onClose, onSuccess }) {
  const [form, setForm] = useState({ client_name: "", client_email: "", date: "", hours: 2, message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    const res = await api("book", "POST", { ...form, provider_id: provider.id });
    setLoading(false);
    if (res.error) return setError(res.error);
    onSuccess(res);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-provider">
            <Avatar seed={provider.avatar_seed || provider.name} size={36} />
            <div>
              <div className="modal-name">{provider.name}</div>
              <div className="modal-meta">{provider.location} · <span className="modal-price">R{provider.price_per_hour}/hr</span></div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label>Full Name</label>
            <input
              placeholder="Your name"
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.client_email}
              onChange={(e) => setForm({ ...form, client_email: e.target.value })}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Hours</label>
              <input
                type="number"
                min="1"
                max="12"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="field">
            <label>
              Message <span className="label-optional">(optional)</span>
            </label>
            <textarea
              placeholder="Any special requirements?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
            />
          </div>

          <div className="total-row">
            <span className="total-label">Total</span>
            <span className="total-amount">R{provider.price_per_hour * form.hours}</span>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn-confirm" onClick={submit} disabled={loading}>
            {loading ? "Confirming…" : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ListModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    bio: "",
    category: "hair",
    location: "",
    price_per_hour: 250,
    contact_email: "",
    avatar_seed: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    const seed = form.name + Date.now();
    const res = await api("create_provider", "POST", { ...form, avatar_seed: seed });
    setLoading(false);
    if (res.error) return setError(res.error);
    onSuccess(res);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-name">List Your Service</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="field-row">
            <div className="field">
              <label>Name / Business Name</label>
              <input
                placeholder="e.g. Naledi's Studio"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Bio</label>
            <textarea
              placeholder="Tell clients about your services…"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Location</label>
              <input
                placeholder="e.g. Sandton, Johannesburg"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Rate (R/hr)</label>
              <input
                type="number"
                min="50"
                value={form.price_per_hour}
                onChange={(e) => setForm({ ...form, price_per_hour: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="field">
            <label>Contact Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            />
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

function ConfirmScreen({ booking, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 11l5 5 9-9" stroke="#0D0D0D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="confirm-title">Booking Confirmed</h2>
        <p className="confirm-text">
          You've booked <strong>{booking.provider_name}</strong> on{" "}
          <strong>{booking.date}</strong> for{" "}
          <strong>{booking.hours} hour{booking.hours > 1 ? "s" : ""}</strong>.
        </p>
        <div className="confirm-total">R{booking.total}</div>
        <p className="confirm-note">Confirmation sent to {booking.client_email}</p>
        <button className="btn-confirm" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [bookingProvider, setBookingProvider] = useState(null);
  const [showList, setShowList] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  async function loadProviders(cat = category) {
    setLoading(true);
    const data = await api(`list_providers&category=${cat}`);
    setProviders(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadProviders(category);
  }, [category]);

  const filtered = providers.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.bio?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Vela — Book Local Talent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="app">

        {/* ── NAV ─────────────────────────────────────────── */}
        <nav className="nav">
  <div className="nav-inner">
    <div className="nav-logo">
      <span className="logo-v">V</span>ela<span className="logo-dot">.</span>
    </div>

    <div className="nav-search">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        placeholder="Search talent, location…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    <a href="/login" className="nav-login">
      Provider login
    </a>

    <button className="nav-cta" onClick={() => setShowList(true)}>
      List Your Service
    </button>
  </div>
</nav>
    
        {/* ── HERO ────────────────────────────────────────── */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow">
              <span className="eyebrow-line" />
              South Africa's Talent Marketplace
            </div>
            <h1 className="hero-title">
              Book the people<br />
              <em>who show up.</em>
            </h1>
            <p className="hero-sub">
              Hair. Photography. Catering. Bartending.<br />
              The best local talent, bookable in minutes.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-num">500+</span>
                <span className="stat-label">Providers</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-num">8</span>
                <span className="stat-label">Categories</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-num">SA</span>
                <span className="stat-label">Nationwide</span>
              </div>
            </div>
          </div>
          <div className="hero-mark" aria-hidden="true">
            <span className="hero-v">V</span>
          </div>
        </section>

        {/* ── CATEGORIES ──────────────────────────────────── */}
        <div className="categories-wrap">
          <div className="categories">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={`cat-pill${category === c.id ? " cat-active" : ""}`}
                onClick={() => setCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN ────────────────────────────────────────── */}
        <main className="main">
          <div className="main-header">
            <span className="results-count">
              {loading
                ? "Loading…"
                : `${filtered.length} provider${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {loading ? (
            <div className="loading-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon" aria-hidden="true">—</div>
              <div className="empty-title">No providers found</div>
              <p className="empty-sub">Be the first in this category.</p>
              <button className="btn-outline" onClick={() => setShowList(true)}>
                List Your Service
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="grid">
              {filtered.map((p, i) => (
                <ProviderCard key={p.id} p={p} onBook={setBookingProvider} index={i} />
              ))}
            </div>
          )}
        </main>

        {/* ── FOOTER ──────────────────────────────────────── */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-logo">
              <span className="logo-v">V</span>ela<span className="logo-dot">.</span>
            </div>
            <div className="footer-copy">© 2025 Vela · South Africa</div>
          </div>
        </footer>
      </div>

      {bookingProvider && (
        <BookingModal
          provider={bookingProvider}
          onClose={() => setBookingProvider(null)}
          onSuccess={(b) => {
            setBookingProvider(null);
            setConfirmation(b);
          }}
        />
      )}
      {showList && (
        <ListModal
          onClose={() => setShowList(false)}
          onSuccess={() => {
            setShowList(false);
            loadProviders();
          }}
        />
      )}
      {confirmation && (
        <ConfirmScreen booking={confirmation} onClose={() => setConfirmation(null)} />
      )}

      <style jsx global>{`
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --ink:        #0D0D0D;
          --charge:     #E8FF47;
          --paper:      #FAFAF8;
          --surface:    #F4F4F0;
          --border:     #E4E4DF;
          --muted:      #888884;
          --text:       #1A1A1A;
          --text-light: #6B6B66;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: var(--paper);
          color: var(--text);
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 14px;
          line-height: 1.65;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* ─────────────────────────────────────────────────
           NAV
        ───────────────────────────────────────────────── */
        .nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(250, 250, 248, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }

        .nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 0 32px;
          height: 60px;
        }

        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 20px;
          letter-spacing: -0.04em;
          color: var(--ink);
          flex-shrink: 0;
          line-height: 1;
        }

        .logo-v {
          color: var(--charge);
          background: var(--ink);
          padding: 0 2px 1px;
        }

        .logo-dot {
          color: var(--charge);
        }

        .nav-search {
          flex: 1;
          max-width: 400px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 9px 16px;
          color: var(--muted);
          transition: border-color 0.15s, background 0.15s;
        }

        .nav-search:focus-within {
          border-color: var(--ink);
          background: var(--paper);
        }

        .nav-search input {
          border: none;
          background: transparent;
          outline: none;
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          color: var(--text);
          width: 100%;
        }

        .nav-search input::placeholder {
          color: var(--muted);
        }

        .nav-cta {
          margin-left: auto;
          background: var(--ink);
          color: var(--paper);
          border: none;
          border-radius: 100px;
          padding: 9px 20px;
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
          letter-spacing: 0.01em;
        }

        .nav-cta:hover {
          background: var(--charge);
          color: var(--ink);
        }

       .nav-login {
  font-size: 13px;
  color: var(--muted);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.nav-login:hover { color: var(--ink); }

        /* ─────────────────────────────────────────────────
           HERO
        ───────────────────────────────────────────────── */
        .hero {
          max-width: 1280px;
          margin: 0 auto;
          padding: 88px 32px 72px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
        }

        .hero-inner {
          max-width: 580px;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'Manrope', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 28px;
        }

        .eyebrow-line {
          display: inline-block;
          width: 24px;
          height: 2px;
          background: var(--charge);
          flex-shrink: 0;
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(48px, 6.5vw, 80px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.0;
          color: var(--ink);
          margin-bottom: 24px;
        }

        .hero-title em {
          font-style: normal;
          color: var(--charge);
          -webkit-text-stroke: 0;
          background: var(--ink);
          padding: 0 8px 4px;
          display: inline-block;
          line-height: 1.1;
        }

        .hero-sub {
          font-size: 15px;
          color: var(--text-light);
          line-height: 1.7;
          margin-bottom: 44px;
          font-weight: 400;
          max-width: 420px;
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--ink);
          line-height: 1;
        }

        .stat-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .stat-divider {
          width: 1px;
          height: 28px;
          background: var(--border);
          flex-shrink: 0;
        }

        .hero-mark {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 260px;
          height: 260px;
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }

        .hero-v {
          font-family: 'Syne', sans-serif;
          font-size: 260px;
          font-weight: 800;
          letter-spacing: -0.06em;
          color: var(--surface);
          line-height: 1;
          user-select: none;
          transition: color 0.25s;
          position: relative;
          z-index: 1;
        }

        .hero-mark:hover .hero-v {
          color: var(--charge);
        }

        /* ─────────────────────────────────────────────────
           CATEGORIES
        ───────────────────────────────────────────────── */
        .categories-wrap {
          border-bottom: 1px solid var(--border);
          background: var(--paper);
          position: sticky;
          top: 60px;
          z-index: 90;
        }

        .categories {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .categories::-webkit-scrollbar {
          display: none;
        }

        .cat-pill {
          flex-shrink: 0;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 14px 18px;
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }

        .cat-pill:hover {
          color: var(--ink);
        }

        .cat-active {
          color: var(--ink) !important;
          border-bottom-color: var(--ink) !important;
          font-weight: 600 !important;
        }

        /* ─────────────────────────────────────────────────
           MAIN
        ───────────────────────────────────────────────── */
        .main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 32px 96px;
        }

        .main-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }

        .results-count {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }

        /* ─────────────────────────────────────────────────
           GRID
        ───────────────────────────────────────────────── */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 0;
        }

        /* ─────────────────────────────────────────────────
           CARD
        ───────────────────────────────────────────────── */
        .card {
          animation: fadeUp 0.35s both ease-out;
          border: 1px solid var(--border);
          margin: -1px 0 0 -1px;
          position: relative;
          overflow: hidden;
        }

        .card-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: transparent;
          transition: background 0.2s;
          z-index: 2;
        }

        .card:hover .card-accent {
          background: var(--charge);
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-inner {
          padding: 28px;
          background: var(--paper);
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: background 0.2s;
        }

        .card:hover .card-inner {
          background: var(--surface);
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .card-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .card-category {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-location {
          font-size: 11px;
          color: var(--muted);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-body {
          flex: 1;
          margin-bottom: 20px;
        }

        .card-name {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--ink);
          margin-bottom: 10px;
          line-height: 1.15;
        }

        .card-bio {
          font-size: 13px;
          color: var(--text-light);
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 18px;
          border-top: 1px solid var(--border);
        }

        .card-price {
          display: flex;
          align-items: baseline;
          gap: 2px;
        }

        .price-amount {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--ink);
          transition: color 0.2s;
        }

        .card:hover .price-amount {
          color: var(--ink);
        }

        .price-unit {
          font-size: 12px;
          color: var(--muted);
          font-weight: 500;
        }

        .btn-book {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--ink);
          color: var(--paper);
          border: none;
          border-radius: 100px;
          padding: 8px 16px;
          font-family: 'Manrope', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          letter-spacing: 0.01em;
        }

        .btn-book:hover {
          background: var(--charge);
          color: var(--ink);
        }

        /* ─────────────────────────────────────────────────
           SKELETON
        ───────────────────────────────────────────────── */
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 0;
        }

        .skeleton-card {
          height: 260px;
          background: var(--surface);
          border: 1px solid var(--border);
          margin: -1px 0 0 -1px;
          position: relative;
          overflow: hidden;
        }

        .skeleton-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.5) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ─────────────────────────────────────────────────
           EMPTY STATE
        ───────────────────────────────────────────────── */
        .empty {
          text-align: center;
          padding: 100px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .empty-icon {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: var(--border);
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 4px;
        }

        .empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--ink);
        }

        .empty-sub {
          color: var(--muted);
          font-size: 14px;
        }

        .btn-outline {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1.5px solid var(--ink);
          border-radius: 100px;
          padding: 10px 22px;
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          letter-spacing: 0.01em;
        }

        .btn-outline:hover {
          background: var(--ink);
          color: var(--paper);
        }

        /* ─────────────────────────────────────────────────
           OVERLAY + MODAL
        ───────────────────────────────────────────────── */
        .overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(13, 13, 13, 0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal {
          background: var(--paper);
          border: 1px solid var(--border);
          border-radius: 16px;
          width: 100%;
          max-width: 460px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.22s ease-out;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-wide {
          max-width: 560px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px 20px;
          border-bottom: 1px solid var(--border);
        }

        .modal-provider {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-name {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--ink);
        }

        .modal-meta {
          font-size: 12px;
          color: var(--muted);
          margin-top: 2px;
        }

        .modal-price {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          color: var(--ink);
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }

        .modal-close:hover {
          background: var(--ink);
          color: var(--paper);
          border-color: var(--ink);
        }

        .modal-body {
          padding: 24px 28px 28px;
        }

        /* ─────────────────────────────────────────────────
           FORM
        ───────────────────────────────────────────────── */
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .label-optional {
          font-weight: 400;
          text-transform: none;
          letter-spacing: 0;
          font-size: 10px;
          color: var(--muted);
        }

        input, select, textarea {
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 13px;
          font-family: 'Manrope', sans-serif;
          font-size: 14px;
          color: var(--text);
          background: var(--paper);
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
          -webkit-appearance: none;
          appearance: none;
        }

        input:focus, select:focus, textarea:focus {
          border-color: var(--ink);
        }

        textarea {
          resize: vertical;
        }

        select {
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888884' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
          cursor: pointer;
        }

        .total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 20px;
        }

        .total-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .total-amount {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--ink);
        }

        .error-msg {
          background: #FFF5F5;
          border: 1px solid #FFCCCC;
          color: #CC0000;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .btn-confirm {
          width: 100%;
          background: var(--ink);
          color: var(--paper);
          border: none;
          border-radius: 100px;
          padding: 14px;
          font-family: 'Manrope', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          letter-spacing: 0.01em;
        }

        .btn-confirm:hover:not(:disabled) {
          background: var(--charge);
          color: var(--ink);
        }

        .btn-confirm:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* ─────────────────────────────────────────────────
           CONFIRM SCREEN
        ───────────────────────────────────────────────── */
        .confirm-modal {
          text-align: center;
          padding: 52px 44px;
        }

        .confirm-icon {
          width: 52px;
          height: 52px;
          background: var(--charge);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          flex-shrink: 0;
        }

        .confirm-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--ink);
          margin-bottom: 12px;
        }

        .confirm-text {
          font-size: 14px;
          color: var(--text-light);
          margin-bottom: 20px;
          line-height: 1.65;
        }

        .confirm-total {
          font-family: 'Syne', sans-serif;
          font-size: 52px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--ink);
          margin-bottom: 8px;
          line-height: 1;
        }

        .confirm-note {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 32px;
        }

        /* ─────────────────────────────────────────────────
           FOOTER
        ───────────────────────────────────────────────── */
        .footer {
          border-top: 1px solid var(--border);
          background: var(--paper);
        }

        .footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 15px;
          letter-spacing: -0.03em;
          color: var(--ink);
        }

        .footer-copy {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.02em;
        }

        /* ─────────────────────────────────────────────────
           RESPONSIVE
        ───────────────────────────────────────────────── */
        @media (max-width: 768px) {
          .nav-inner {
            padding: 0 20px;
            gap: 12px;
          }

          .nav-search {
            display: none;
          }

          .hero {
            padding: 52px 20px 48px;
            flex-direction: column;
            gap: 40px;
            border-bottom: 1px solid var(--border);
          }

          .hero-mark {
            width: 100px;
            height: 100px;
            align-self: flex-end;
          }

          .hero-v {
            font-size: 100px;
          }

          .categories-wrap {
            top: 60px;
          }

          .categories {
            padding: 0 20px;
          }

          .main {
            padding: 28px 20px 64px;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .field-row {
            grid-template-columns: 1fr;
          }

          .modal-body {
            padding: 20px;
          }

          .modal-header {
            padding: 20px;
          }

          .confirm-modal {
            padding: 36px 24px;
          }

          .confirm-total {
            font-size: 40px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 40px;
          }

          .hero-stats {
            gap: 16px;
          }
        }
      `}</style>
    </>
  );
}
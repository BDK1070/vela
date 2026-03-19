import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const CATEGORY_META = {
  hair:        { label: "Hair & Beauty", type: "Beauty", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80" },
  photography: { label: "Photography",  type: "Visual", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80" },
  catering:    { label: "Catering",     type: "Food & Drink", image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80" },
  bartending:  { label: "Bartending",   type: "Food & Drink", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80" },
  makeup:      { label: "Makeup",       type: "Beauty", image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80" },
  dj:          { label: "DJ & Music",   type: "Music", image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=1200&q=80" },
  events:      { label: "Event Planning", type: "Events", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80" },
  cleaning:    { label: "Cleaning",     type: "Home", image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1200&q=80" },
};

const LOCATIONS = ["All locations", "Johannesburg", "Cape Town", "Durban", "Pretoria"];
const SORTS = ["Default", "Price: Low to high", "Price: High to low"];

function Avatar({ seed, size = 64 }) {
  return (
    <img
      src={`https://api.dicebear.com/8.x/notionists/svg?seed=${encodeURIComponent(seed)}&size=${size}`}
      alt=""
      style={{ width: size, height: size, borderRadius: "12px", background: "#F0EFEA", display: "block", flexShrink: 0 }}
    />
  );
}

function BookingModal({ provider, onClose, onSuccess }) {
  const [form, setForm] = useState({ client_name: "", client_email: "", date: "", hours: 2, message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/skillbook?action=book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, provider_id: provider.id }),
    }).then((r) => r.json());
    setLoading(false);
    if (res.error) return setError(res.error);
    onSuccess(res);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-name">{provider.name}</div>
            <div className="modal-meta">{provider.location} · R{provider.price_per_hour}/hr</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Full Name</label>
            <input placeholder="Your name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@email.com" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="field">
              <label>Hours</label>
              <input type="number" min="1" max="12" value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} />
            </div>
          </div>
          <div className="field">
            <label>Message <span style={{ color: "#aaa", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <textarea placeholder="Any special requirements?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} />
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

function ConfirmScreen({ booking, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-check">✓</div>
        <h2 className="confirm-title">Booking Confirmed</h2>
        <p className="confirm-text">You've booked <strong>{booking.provider_name}</strong> on <strong>{booking.date}</strong>.</p>
        <div className="confirm-total">R{booking.total}</div>
        <p className="confirm-note">Confirmation sent to {booking.client_email}</p>
        <button className="btn-confirm" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

export default function CategoryPage({ providers, cat }) {
  const router = useRouter();
  const meta = CATEGORY_META[cat] || { label: cat, type: "", image: "" };
  const [location, setLocation] = useState("All locations");
  const [sort, setSort] = useState("Default");
  const [booking, setBooking] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  let filtered = [...providers];
  if (location !== "All locations") {
    filtered = filtered.filter((p) => p.location?.toLowerCase().includes(location.toLowerCase()));
  }
  if (sort === "Price: Low to high") filtered.sort((a, b) => a.price_per_hour - b.price_per_hour);
  if (sort === "Price: High to low") filtered.sort((a, b) => b.price_per_hour - a.price_per_hour);

  return (
    <>
      <Head>
        <title>{meta.label} — Vela</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="app">

        {/* NAV */}
        <nav className="nav">
          <div className="nav-inner">
            <a href="/" className="nav-logo"><span className="logo-v">V</span>ela</a>
            <button className="back-btn" onClick={() => router.push("/")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M5 12l7-7M5 12l7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              All services
            </button>
          </div>
        </nav>

        {/* CATEGORY HERO */}
        <div className="cat-hero">
          {meta.image && <img src={meta.image} alt={meta.label} className="cat-hero-img" />}
          <div className="cat-hero-overlay">
            <div className="cat-hero-inner">
              <div className="cat-type">{meta.type}</div>
              <h1 className="cat-title">{meta.label}</h1>
              <p className="cat-count">{providers.length} provider{providers.length !== 1 ? "s" : ""} across South Africa</p>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="filters-bar">
          <div className="filters-inner">
            <div className="filter-group">
              {LOCATIONS.map((l) => (
                <button
                  key={l}
                  className={`filter-pill ${location === l ? "active" : ""}`}
                  onClick={() => setLocation(l)}
                >
                  {l}
                </button>
              ))}
            </div>
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* EDITORIAL LIST */}
        <main className="main">
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-title">No providers found</div>
              <p className="empty-sub">Try a different location filter.</p>
            </div>
          ) : (
            <div className="editorial-list">
              {filtered.map((p, i) => (
                <div key={p.id} className="editorial-item">
                  <div className="editorial-left">
                    <div className="editorial-num">0{i + 1}</div>
                    <Avatar seed={p.avatar_seed || p.name} size={72} />
                    <div className="editorial-info">
                      <h2
                        className="editorial-name"
                        onClick={() => router.push(`/providers/${p.id}`)}
                      >
                        {p.name}
                      </h2>
                      <div className="editorial-meta">
                        <span>📍 {p.location || "South Africa"}</span>
                        <div className="meta-dot" />
                        <span>{meta.label}</span>
                      </div>
                      <p className="editorial-bio">{p.bio || "No description provided."}</p>
                    </div>
                  </div>
                  <div className="editorial-right">
                    <div className="editorial-price">
                      R{p.price_per_hour}<small>/hr</small>
                    </div>
                    <div className="editorial-btns">
                      <button
                        className="btn-view"
                        onClick={() => router.push(`/providers/${p.id}`)}
                      >
                        View profile
                      </button>
                      <button
                        className="btn-book"
                        onClick={() => setBooking(p)}
                      >
                        Book →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-logo"><span className="logo-v">V</span>ela</div>
            <div className="footer-copy">© 2024 Vela · South Africa</div>
          </div>
        </footer>
      </div>

      {booking && (
        <BookingModal
          provider={booking}
          onClose={() => setBooking(null)}
          onSuccess={(b) => { setBooking(null); setConfirmation(b); }}
        />
      )}
      {confirmation && (
        <ConfirmScreen booking={confirmation} onClose={() => setConfirmation(null)} />
      )}

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #0D0D0D; --charge: #E8FF47; --white: #FFFFFF;
          --bg: #F0EFEA; --border: #E0DED8; --muted: #888884; --text: #1A1A1A;
        }
        body { background: var(--bg); color: var(--text); font-family: 'Manrope', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none; color: inherit; }

        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(240,239,234,0.92); backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-inner {
          max-width: 1400px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 64px;
        }
        .nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -0.04em; color: var(--ink); }
        .logo-v { color: var(--charge); background: var(--ink); padding: 0 3px; border-radius: 3px; }
        .back-btn {
          display: flex; align-items: center; gap: 6px;
          background: transparent; border: 1px solid var(--border);
          border-radius: 100px; padding: 8px 16px;
          font-family: 'Manrope', sans-serif; font-size: 13px;
          font-weight: 500; color: var(--muted); cursor: pointer; transition: all 0.15s;
        }
        .back-btn:hover { border-color: var(--ink); color: var(--ink); }

        /* HERO */
        .cat-hero { position: relative; height: 320px; overflow: hidden; }
        .cat-hero-img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.55); }
        .cat-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%);
          display: flex; align-items: flex-end;
        }
        .cat-hero-inner { max-width: 1400px; margin: 0 auto; width: 100%; padding: 36px 32px; }
        .cat-type { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--charge); margin-bottom: 8px; font-family: 'Manrope', sans-serif; }
        .cat-title { font-family: 'Syne', sans-serif; font-size: clamp(40px, 6vw, 64px); font-weight: 800; letter-spacing: -0.05em; color: #fff; line-height: 1; margin-bottom: 10px; }
        .cat-count { font-size: 14px; color: rgba(255,255,255,0.6); font-family: 'Manrope', sans-serif; }

        /* FILTERS */
        .filters-bar { background: var(--white); border-bottom: 1px solid var(--border); }
        .filters-inner {
          max-width: 1400px; margin: 0 auto; padding: 0 32px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .filter-group { display: flex; gap: 4px; overflow-x: auto; padding: 12px 0; }
        .filter-group::-webkit-scrollbar { display: none; }
        .filter-pill {
          flex-shrink: 0; background: transparent; border: none;
          border-bottom: 2px solid transparent;
          padding: 8px 16px; font-family: 'Manrope', sans-serif;
          font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all 0.15s;
        }
        .filter-pill:hover { color: var(--ink); }
        .filter-pill.active { color: var(--ink); border-bottom-color: var(--ink); font-weight: 700; }
        .sort-select {
          border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px;
          font-family: 'Manrope', sans-serif; font-size: 13px; color: var(--text);
          background: var(--bg); outline: none; cursor: pointer; flex-shrink: 0;
        }

        /* MAIN */
        .main { max-width: 1400px; margin: 0 auto; padding: 0 32px 80px; }

        .empty { text-align: center; padding: 80px 20px; }
        .empty-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
        .empty-sub { font-size: 14px; color: var(--muted); }

        /* EDITORIAL LIST */
        .editorial-list { padding-top: 8px; }
        .editorial-item {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 32px 0; border-bottom: 1px solid var(--border); gap: 24px;
          transition: background 0.15s;
        }
        .editorial-item:hover { background: rgba(255,255,255,0.5); padding: 32px 20px; margin: 0 -20px; border-radius: 12px; }
        .editorial-left { display: flex; align-items: flex-start; gap: 20px; flex: 1; }
        .editorial-num { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #CCC; padding-top: 6px; width: 24px; flex-shrink: 0; }
        .editorial-info { flex: 1; }
        .editorial-name {
          font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800;
          letter-spacing: -0.03em; color: var(--ink); margin-bottom: 4px;
          cursor: pointer; transition: color 0.15s; display: inline-block;
        }
        .editorial-name:hover { color: #333; }
        .editorial-meta {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: var(--muted); margin-bottom: 10px;
        }
        .meta-dot { width: 3px; height: 3px; background: #CCC; border-radius: 50%; }
        .editorial-bio { font-size: 14px; color: #555; line-height: 1.65; max-width: 560px; }
        .editorial-right {
          display: flex; flex-direction: column; align-items: flex-end;
          gap: 12px; flex-shrink: 0; padding-top: 4px;
        }
        .editorial-price {
          font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800;
          letter-spacing: -0.04em; color: var(--ink);
        }
        .editorial-price small { font-size: 12px; color: var(--muted); font-family: 'Manrope', sans-serif; font-weight: 400; }
        .editorial-btns { display: flex; gap: 8px; }
        .btn-view {
          background: transparent; border: 1px solid var(--border);
          border-radius: 100px; padding: 9px 18px;
          font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 600;
          color: var(--text); cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .btn-view:hover { border-color: var(--ink); }
        .btn-book {
          background: var(--ink); color: var(--white);
          border: none; border-radius: 100px; padding: 9px 20px;
          font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: background 0.2s; white-space: nowrap;
        }
        .btn-book:hover { background: var(--charge); color: var(--ink); }

        /* MODAL */
        .overlay { position: fixed; inset: 0; z-index: 200; background: rgba(13,13,13,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal { background: #fff; border-radius: 20px; width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.25s; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px 20px; border-bottom: 1px solid #E8E8E4; }
        .modal-name { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); }
        .modal-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .modal-close { width: 32px; height: 32px; border-radius: 50%; background: #F4F4F1; border: none; color: var(--muted); cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .modal-body { padding: 24px 28px 28px; }
        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
        input, select, textarea { border: 1px solid #E8E8E4; border-radius: 8px; padding: 11px 14px; font-family: 'Manrope', sans-serif; font-size: 14px; color: var(--text); background: #FAFAF8; outline: none; transition: border-color 0.15s; width: 100%; }
        input:focus, select:focus, textarea:focus { border-color: var(--ink); }
        textarea { resize: vertical; }
        .total-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-top: 1px solid #E8E8E4; border-bottom: 1px solid #E8E8E4; margin-bottom: 20px; }
        .total-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
        .total-amount { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: var(--ink); }
        .error-msg { background: #FFF5F5; border: 1px solid #FFCCCC; color: #CC0000; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; }
        .btn-confirm { width: 100%; background: var(--ink); color: #fff; border: none; border-radius: 100px; padding: 14px; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .btn-confirm:hover:not(:disabled) { background: var(--charge); color: var(--ink); }
        .btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
        .confirm-modal { text-align: center; padding: 48px 40px; }
        .confirm-check { width: 56px; height: 56px; background: var(--charge); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; color: var(--ink); margin: 0 auto 20px; }
        .confirm-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: var(--ink); margin-bottom: 12px; }
        .confirm-text { font-size: 15px; color: var(--muted); margin-bottom: 16px; line-height: 1.6; }
        .confirm-total { font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800; letter-spacing: -0.04em; color: var(--ink); margin-bottom: 8px; }
        .confirm-note { font-size: 13px; color: var(--muted); margin-bottom: 28px; }

        .footer { border-top: 1px solid var(--border); }
        .footer-inner { max-width: 1400px; margin: 0 auto; padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; }
        .footer-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; letter-spacing: -0.03em; color: var(--ink); }
        .footer-copy { font-size: 12px; color: var(--muted); }

        @media (max-width: 768px) {
          .cat-hero { height: 240px; }
          .editorial-item { flex-direction: column; gap: 16px; }
          .editorial-right { flex-direction: row; align-items: center; width: 100%; justify-content: space-between; }
          .field-row { grid-template-columns: 1fr; }
          .nav-inner { padding: 0 20px; }
          .main { padding: 0 20px 60px; }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { cat } = params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    const res = await fetch(`${baseUrl}/api/skillbook?action=list_providers&category=${cat}`);
    const providers = await res.json();
    return { props: { providers: Array.isArray(providers) ? providers : [], cat } };
  } catch {
    return { props: { providers: [], cat } };
  }
}

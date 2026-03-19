import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const CATEGORIES = [
  { id: "hair", label: "Hair & Beauty" },
  { id: "photography", label: "Photography" },
  { id: "catering", label: "Catering" },
  { id: "bartending", label: "Bartending" },
  { id: "makeup", label: "Makeup" },
  { id: "dj", label: "DJ & Music" },
  { id: "cleaning", label: "Cleaning" },
  { id: "events", label: "Events" },
];

function Avatar({ seed, size = 80 }) {
  return (
    <img
      src={`https://api.dicebear.com/8.x/notionists/svg?seed=${encodeURIComponent(seed)}&size=${size}`}
      alt=""
      style={{ width: size, height: size, borderRadius: "50%", background: "#F0F0EC", display: "block", flexShrink: 0 }}
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
          <div className="modal-provider">
            <Avatar seed={provider.avatar_seed || provider.name} size={36} />
            <div>
              <div className="modal-name">{provider.name}</div>
              <div className="modal-meta">{provider.location} · R{provider.price_per_hour}/hr</div>
            </div>
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
            <input placeholder="Your name" value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
          </div>
          <div className="field">
            <label>Email Address</label>
            <input type="email" placeholder="you@email.com" value={form.client_email}
              onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Date</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="field">
              <label>Hours</label>
              <input type="number" min="1" max="12" value={form.hours}
                onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} />
            </div>
          </div>
          <div className="field">
            <label>Message <span style={{ color: "#aaa", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <textarea placeholder="Any special requirements?" value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} />
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
        <p className="confirm-text">
          You've booked <strong>{booking.provider_name}</strong> on{" "}
          <strong>{booking.date}</strong> for{" "}
          <strong>{booking.hours} hour{booking.hours > 1 ? "s" : ""}</strong>.
        </p>
        <div className="confirm-total">R{booking.total}</div>
        <p className="confirm-note">Confirmation sent to {booking.client_email}</p>
        <button className="btn-confirm" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

export default function ProviderProfile({ provider }) {
  const router = useRouter();
  const [showBooking, setShowBooking] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  if (!provider) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p style={{ color: "#888", fontFamily: "Manrope, sans-serif" }}>Provider not found.</p>
      </div>
    );
  }

  const cat = CATEGORIES.find((c) => c.id === provider.category);

  return (
    <>
      <Head>
        <title>{provider.name} — Vela</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={provider.bio || `Book ${provider.name} on Vela`} />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="app">

        {/* ── NAV ── */}
        <nav className="nav">
          <div className="nav-inner">
            <a href="/" className="nav-logo">
              <span className="logo-v">V</span>ela
            </a>
            <button className="back-btn" onClick={() => router.back()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M5 12l7-7M5 12l7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to listings
            </button>
          </div>
        </nav>

        {/* ── PROFILE HERO ── */}
        <div className="profile-hero">
          <div className="profile-hero-inner">
            <div className="profile-top">
              <Avatar seed={provider.avatar_seed || provider.name} size={80} />
              <div className="profile-info">
                <div className="profile-category">{cat?.label || provider.category}</div>
                <h1 className="profile-name">{provider.name}</h1>
                <div className="profile-location">📍 {provider.location || "South Africa"}</div>
              </div>
              <div className="profile-price-wrap">
                <div className="profile-price">
                  <span className="price-amount">R{provider.price_per_hour}</span>
                  <span className="price-unit">/hr</span>
                </div>
                <button className="btn-book-profile" onClick={() => setShowBooking(true)}>
                  Book Now →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── PROFILE CONTENT ── */}
        <div className="profile-content">
          <div className="profile-content-inner">

            <div className="profile-main">
              {/* About */}
              <section className="profile-section">
                <div className="section-eyebrow">About</div>
                <p className="profile-bio">{provider.bio || "No description provided."}</p>
              </section>

              {/* Details */}
              <section className="profile-section">
                <div className="section-eyebrow">Details</div>
                <div className="details-grid">
                  <div className="detail-item">
                    <div className="detail-label">Category</div>
                    <div className="detail-value">{cat?.label || provider.category}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Location</div>
                    <div className="detail-value">{provider.location || "South Africa"}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Rate</div>
                    <div className="detail-value">R{provider.price_per_hour} per hour</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Contact</div>
                    <div className="detail-value">{provider.contact_email}</div>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar CTA */}
            <div className="profile-sidebar">
              <div className="sidebar-card">
                <div className="sidebar-price">
                  R{provider.price_per_hour}<span className="sidebar-unit">/hr</span>
                </div>
                <div className="sidebar-name">{provider.name}</div>
                <div className="sidebar-location">📍 {provider.location || "South Africa"}</div>
                <button className="btn-confirm sidebar-book" onClick={() => setShowBooking(true)}>
                  Book {provider.name.split(" ")[0]}
                </button>
                <div className="sidebar-note">Free cancellation · No upfront payment</div>
              </div>
            </div>

          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-logo"><span className="logo-v">V</span>ela</div>
            <div className="footer-copy">© 2024 Vela · South Africa</div>
          </div>
        </footer>
      </div>

      {showBooking && (
        <BookingModal
          provider={provider}
          onClose={() => setShowBooking(false)}
          onSuccess={(b) => { setShowBooking(false); setConfirmation(b); }}
        />
      )}
      {confirmation && (
        <ConfirmScreen booking={confirmation} onClose={() => setConfirmation(null)} />
      )}

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #0D0D0D;
          --charge: #E8FF47;
          --white: #FFFFFF;
          --off-white: #FAFAF8;
          --light: #F4F4F1;
          --border: #E8E8E4;
          --muted: #9A9A94;
          --text: #1A1A1A;
        }

        html { scroll-behavior: smooth; }
        body {
          background: var(--white);
          color: var(--text);
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 15px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        a { text-decoration: none; color: inherit; }

        /* ── NAV ── */
        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 32px; height: 64px;
        }
        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 22px;
          color: var(--ink); letter-spacing: -0.04em;
        }
        .logo-v { color: var(--charge); background: var(--ink); padding: 0 3px; border-radius: 3px; }
        .back-btn {
          display: flex; align-items: center; gap: 6px;
          background: transparent; border: 1px solid var(--border);
          border-radius: 100px; padding: 8px 16px;
          font-family: 'Manrope', sans-serif; font-size: 13px;
          font-weight: 500; color: var(--muted); cursor: pointer;
          transition: all 0.15s;
        }
        .back-btn:hover { border-color: var(--ink); color: var(--ink); }

        /* ── HERO ── */
        .profile-hero {
          border-bottom: 1px solid var(--border);
          background: var(--white);
        }
        .profile-hero-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 48px 32px 40px;
        }
        .profile-top {
          display: flex; align-items: flex-start; gap: 24px;
        }
        .profile-info { flex: 1; }
        .profile-category {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 8px;
        }
        .profile-name {
          font-family: 'Syne', sans-serif;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 800; letter-spacing: -0.04em;
          color: var(--ink); line-height: 1; margin-bottom: 10px;
        }
        .profile-location { font-size: 14px; color: var(--muted); }
        .profile-price-wrap {
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 12px; flex-shrink: 0;
        }
        .profile-price { display: flex; align-items: baseline; gap: 2px; }
        .price-amount {
          font-family: 'Syne', sans-serif;
          font-size: 36px; font-weight: 800;
          letter-spacing: -0.04em; color: var(--ink);
        }
        .price-unit { font-size: 14px; color: var(--muted); }
        .btn-book-profile {
          background: var(--ink); color: var(--white);
          border: none; border-radius: 100px;
          padding: 12px 24px;
          font-family: 'Manrope', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer; white-space: nowrap;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-book-profile:hover { background: var(--charge); color: var(--ink); transform: translateY(-1px); }

        /* ── CONTENT ── */
        .profile-content {
          max-width: 1280px; margin: 0 auto;
          padding: 48px 32px 80px;
        }
        .profile-content-inner {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 64px;
          align-items: start;
        }
        .profile-section { margin-bottom: 40px; }
        .section-eyebrow {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }
        .profile-bio {
          font-size: 15px; color: #444;
          line-height: 1.8; max-width: 640px;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .detail-item {
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
        }
        .detail-item:nth-child(odd) { padding-right: 24px; }
        .detail-label {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 4px;
        }
        .detail-value { font-size: 14px; color: var(--text); font-weight: 500; }

        /* ── SIDEBAR ── */
        .profile-sidebar { position: sticky; top: 84px; }
        .sidebar-card {
          border: 1px solid var(--border);
          border-radius: 16px; padding: 28px;
          background: var(--white);
        }
        .sidebar-price {
          font-family: 'Syne', sans-serif;
          font-size: 40px; font-weight: 800;
          letter-spacing: -0.04em; color: var(--ink);
          line-height: 1; margin-bottom: 4px;
        }
        .sidebar-unit { font-size: 16px; color: var(--muted); font-family: 'Manrope', sans-serif; font-weight: 400; }
        .sidebar-name {
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 700;
          color: var(--ink); margin-bottom: 4px; margin-top: 12px;
        }
        .sidebar-location { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
        .sidebar-book { margin-bottom: 12px; }
        .sidebar-note {
          text-align: center; font-size: 12px; color: var(--muted);
        }

        /* ── MODAL ── */
        .overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(13,13,13,0.6);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal {
          background: var(--white); border-radius: 20px;
          width: 100%; max-width: 460px;
          max-height: 90vh; overflow-y: auto;
          animation: slideUp 0.25s;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .modal-header {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 24px 28px 20px;
          border-bottom: 1px solid var(--border);
        }
        .modal-provider { display: flex; align-items: center; gap: 12px; }
        .modal-name {
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 800;
          letter-spacing: -0.02em; color: var(--ink);
        }
        .modal-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .modal-close {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--light); border: none;
          color: var(--muted); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .modal-close:hover { background: var(--border); }
        .modal-body { padding: 24px 28px 28px; }

        /* ── FORM ── */
        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        label {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--muted);
        }
        input, select, textarea {
          border: 1px solid var(--border); border-radius: 8px;
          padding: 11px 14px; font-family: 'Manrope', sans-serif;
          font-size: 14px; color: var(--text);
          background: var(--off-white); outline: none;
          transition: border-color 0.15s; width: 100%;
        }
        input:focus, select:focus, textarea:focus { border-color: var(--ink); }
        textarea { resize: vertical; }
        .total-row {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 20px;
        }
        .total-label {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted);
        }
        .total-amount {
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800;
          letter-spacing: -0.03em; color: var(--ink);
        }
        .error-msg {
          background: #FFF5F5; border: 1px solid #FFCCCC;
          color: #CC0000; border-radius: 8px;
          padding: 10px 14px; font-size: 13px; margin-bottom: 14px;
        }
        .btn-confirm {
          width: 100%; background: var(--ink); color: var(--white);
          border: none; border-radius: 100px; padding: 14px;
          font-family: 'Manrope', sans-serif;
          font-size: 14px; font-weight: 700; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-confirm:hover:not(:disabled) { background: var(--charge); color: var(--ink); transform: translateY(-1px); }
        .btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── CONFIRM ── */
        .confirm-modal { text-align: center; padding: 48px 40px; }
        .confirm-check {
          width: 56px; height: 56px; background: var(--charge);
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 22px; font-weight: 700;
          color: var(--ink); margin: 0 auto 20px;
        }
        .confirm-title {
          font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800;
          letter-spacing: -0.03em; color: var(--ink); margin-bottom: 12px;
        }
        .confirm-text { font-size: 15px; color: var(--muted); margin-bottom: 16px; line-height: 1.6; }
        .confirm-total {
          font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800;
          letter-spacing: -0.04em; color: var(--ink); margin-bottom: 8px;
        }
        .confirm-note { font-size: 13px; color: var(--muted); margin-bottom: 28px; }

        /* ── FOOTER ── */
        .footer { border-top: 1px solid var(--border); background: var(--off-white); }
        .footer-inner {
          max-width: 1280px; margin: 0 auto; padding: 24px 32px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .footer-logo {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 16px; letter-spacing: -0.03em; color: var(--ink);
        }
        .footer-copy { font-size: 12px; color: var(--muted); }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .profile-content-inner { grid-template-columns: 1fr; gap: 40px; }
          .profile-sidebar { position: static; }
        }
        @media (max-width: 640px) {
          .nav-inner { padding: 0 20px; }
          .profile-hero-inner { padding: 32px 20px; }
          .profile-top { flex-direction: column; gap: 16px; }
          .profile-price-wrap { flex-direction: row; align-items: center; width: 100%; justify-content: space-between; }
          .profile-content { padding: 32px 20px 60px; }
          .details-grid { grid-template-columns: 1fr; }
          .field-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { id } = params;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    const res = await fetch(`${baseUrl}/api/skillbook?action=get_provider&id=${id}`);
    const provider = await res.json();

    if (provider.error || !provider.id) {
      return { notFound: true };
    }

    return { props: { provider } };
  } catch {
    return { notFound: true };
  }
}

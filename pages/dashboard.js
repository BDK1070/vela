import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

const PERIODS = [
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
  { id: "all", label: "All time" },
];

function StatusBadge({ status }) {
  const styles = {
    pending:   { bg: "#FFF8E7", color: "#8a6500", border: "#F5D87A" },
    confirmed: { bg: "#E8FFF0", color: "#1a7a3c", border: "#7FD4A0" },
    declined:  { bg: "#FFF0F0", color: "#a32d2d", border: "#F0A0A0" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: "100px", padding: "3px 10px",
      fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em",
      textTransform: "capitalize", whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [activeTab, setActiveTab] = useState("bookings");

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      // Get provider linked to this user
      const { data: prov } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!prov) {
        // Provider account exists but no listing linked yet
        setLoading(false);
        return;
      }

      setProvider(prov);
      setEditForm({
        name: prov.name || "",
        bio: prov.bio || "",
        category: prov.category || "hair",
        location: prov.location || "",
        price_per_hour: prov.price_per_hour || 0,
        contact_email: prov.contact_email || "",
      });

      // Get bookings
      const { data: bks } = await supabase
        .from("bookings")
        .select("*")
        .eq("provider_id", prov.id)
        .order("created_at", { ascending: false });

      setBookings(bks || []);
      setLoading(false);
    }
    load();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function saveProfile() {
    setSaving(true);
    setSaveMsg("");
    const { error } = await supabase
      .from("providers")
      .update(editForm)
      .eq("id", provider.id);
    setSaving(false);
    if (error) { setSaveMsg("Failed to save. Try again."); return; }
    setProvider({ ...provider, ...editForm });
    setEditing(false);
    setSaveMsg("Profile updated!");
    setTimeout(() => setSaveMsg(""), 3000);
  }

  // Filter bookings by period
  function filteredBookings() {
    if (period === "all") return bookings;
    const days = parseInt(period);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return bookings.filter((b) => new Date(b.created_at) >= cutoff);
  }

  const filtered = filteredBookings();
  const totalEarnings = filtered.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.total, 0);
  const pendingCount = filtered.filter((b) => b.status === "pending").length;
  const confirmedCount = filtered.filter((b) => b.status === "confirmed").length;
  const declinedCount = filtered.filter((b) => b.status === "declined").length;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <Style />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard — Vela</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        {/* NAV */}
        <nav className="nav">
          <a href="/" className="logo"><span className="logo-v">V</span>ela</a>
          <div className="nav-right">
            <span className="nav-email">{user?.email}</span>
            <button className="btn-signout" onClick={signOut}>Sign out</button>
          </div>
        </nav>

        <div className="container">

          {/* No listing linked */}
          {!provider && (
            <div className="no-listing">
              <h2>No listing linked</h2>
              <p>Your account isn't linked to a provider listing yet. Go to the homepage and create your listing, then contact us to link it to your account.</p>
              <a href="/" className="btn-primary">Go to homepage</a>
            </div>
          )}

          {provider && (
            <>
              {/* Header */}
              <div className="dash-header">
                <div>
                  <div className="dash-eyebrow">Provider Dashboard</div>
                  <h1 className="dash-title">{provider.name}</h1>
                  <div className="dash-category">{CATEGORIES.find(c => c.id === provider.category)?.label} · {provider.location}</div>
                </div>
                <a href={`/providers/${provider.id}`} className="btn-view-profile" target="_blank">
                  View public profile →
                </a>
              </div>

              {/* Period filter */}
              <div className="period-tabs">
                {PERIODS.map((p) => (
                  <button
                    key={p.id}
                    className={`period-tab ${period === p.id ? "active" : ""}`}
                    onClick={() => setPeriod(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total bookings</div>
                  <div className="stat-num">{filtered.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Pending</div>
                  <div className="stat-num stat-pending">{pendingCount}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Confirmed</div>
                  <div className="stat-num stat-confirmed">{confirmedCount}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Declined</div>
                  <div className="stat-num stat-declined">{declinedCount}</div>
                </div>
                <div className="stat-card stat-earnings">
                  <div className="stat-label">Confirmed earnings</div>
                  <div className="stat-num">R{totalEarnings.toLocaleString()}</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs">
                <button className={`tab ${activeTab === "bookings" ? "tab-active" : ""}`} onClick={() => setActiveTab("bookings")}>
                  Bookings {filtered.length > 0 && <span className="tab-count">{filtered.length}</span>}
                </button>
                <button className={`tab ${activeTab === "profile" ? "tab-active" : ""}`} onClick={() => setActiveTab("profile")}>
                  Edit profile
                </button>
              </div>

              {/* Bookings tab */}
              {activeTab === "bookings" && (
                <div className="bookings-section">
                  {filtered.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📭</div>
                      <div className="empty-title">No bookings yet</div>
                      <p className="empty-sub">Share your profile to start receiving bookings.</p>
                      <a href={`/providers/${provider.id}`} target="_blank" className="btn-primary">
                        View your profile
                      </a>
                    </div>
                  ) : (
                    <div className="bookings-table">
                      <div className="table-header">
                        <span>Client</span>
                        <span>Date</span>
                        <span>Hours</span>
                        <span>Total</span>
                        <span>Status</span>
                        <span></span>
                      </div>
                      {filtered.map((b) => (
                        <div key={b.id} className="table-row">
                          <div>
                            <div className="client-name">{b.client_name}</div>
                            <div className="client-email">{b.client_email}</div>
                          </div>
                          <div className="row-date">{b.date}</div>
                          <div className="row-hours">{b.hours}hr{b.hours > 1 ? "s" : ""}</div>
                          <div className="row-total">R{b.total}</div>
                          <div><StatusBadge status={b.status} /></div>
                          <div>
                            {b.status === "pending" && (
                              <a href={`/bookings/${b.id}`} className="btn-respond">Respond</a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Profile edit tab */}
              {activeTab === "profile" && (
                <div className="profile-section">
                  {saveMsg && <div className="success-msg">{saveMsg}</div>}

                  <div className="profile-card">
                    <div className="field-row">
                      <div className="field">
                        <label>Name / Business Name</label>
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} disabled={!editing} />
                      </div>
                      <div className="field">
                        <label>Category</label>
                        <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} disabled={!editing}>
                          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label>Bio</label>
                      <textarea rows={4} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} disabled={!editing} />
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Location</label>
                        <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} disabled={!editing} />
                      </div>
                      <div className="field">
                        <label>Rate (R/hr)</label>
                        <input type="number" value={editForm.price_per_hour} onChange={(e) => setEditForm({ ...editForm, price_per_hour: Number(e.target.value) })} disabled={!editing} />
                      </div>
                    </div>
                    <div className="field">
                      <label>Contact Email</label>
                      <input type="email" value={editForm.contact_email} onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })} disabled={!editing} />
                    </div>

                    <div className="profile-actions">
                      {!editing ? (
                        <button className="btn-primary" onClick={() => setEditing(true)}>Edit profile</button>
                      ) : (
                        <>
                          <button className="btn-primary" onClick={saveProfile} disabled={saving}>
                            {saving ? "Saving…" : "Save changes"}
                          </button>
                          <button className="btn-cancel" onClick={() => { setEditing(false); setEditForm({ name: provider.name, bio: provider.bio, category: provider.category, location: provider.location, price_per_hour: provider.price_per_hour, contact_email: provider.contact_email }); }}>
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Style />
    </>
  );
}

function Style() {
  return (
    <style jsx global>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      :root {
        --ink: #0D0D0D; --charge: #E8FF47; --white: #FFFFFF;
        --off-white: #FAFAF8; --light: #F4F4F1; --border: #E8E8E4;
        --muted: #9A9A94; --text: #1A1A1A;
      }
      body { background: var(--off-white); color: var(--text); font-family: 'Manrope', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
      a { text-decoration: none; color: inherit; }

      .loading-screen { display: flex; align-items: center; justify-content: center; height: 100vh; }
      .spinner { width: 32px; height: 32px; border: 2px solid var(--border); border-top-color: var(--ink); border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }

      .page { min-height: 100vh; }
      .nav { background: var(--white); border-bottom: 1px solid var(--border); padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
      .logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -0.04em; color: var(--ink); }
      .logo-v { color: var(--charge); background: var(--ink); padding: 0 3px; border-radius: 3px; }
      .nav-right { display: flex; align-items: center; gap: 16px; }
      .nav-email { font-size: 13px; color: var(--muted); }
      .btn-signout { background: transparent; border: 1px solid var(--border); border-radius: 100px; padding: 7px 16px; font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all 0.15s; }
      .btn-signout:hover { border-color: var(--ink); color: var(--ink); }

      .container { max-width: 1100px; margin: 0 auto; padding: 40px 32px 80px; }

      .no-listing { text-align: center; padding: 80px 20px; }
      .no-listing h2 { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; margin-bottom: 12px; }
      .no-listing p { color: var(--muted); font-size: 15px; margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto; line-height: 1.6; }

      .dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; gap: 16px; }
      .dash-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
      .dash-title { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; letter-spacing: -0.04em; color: var(--ink); margin-bottom: 4px; }
      .dash-category { font-size: 14px; color: var(--muted); }
      .btn-view-profile { display: inline-block; border: 1px solid var(--border); border-radius: 100px; padding: 9px 18px; font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; transition: all 0.15s; }
      .btn-view-profile:hover { border-color: var(--ink); }

      .period-tabs { display: flex; gap: 6px; margin-bottom: 20px; }
      .period-tab { background: var(--white); border: 1px solid var(--border); border-radius: 100px; padding: 7px 16px; font-family: 'Manrope', sans-serif; font-size: 12px; font-weight: 600; color: var(--muted); cursor: pointer; transition: all 0.15s; }
      .period-tab:hover { border-color: var(--ink); color: var(--ink); }
      .period-tab.active { background: var(--ink); color: var(--white); border-color: var(--ink); }

      .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 32px; }
      .stat-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 18px 20px; }
      .stat-earnings { grid-column: span 1; border-left: 3px solid var(--charge); }
      .stat-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
      .stat-num { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: var(--ink); }
      .stat-pending { color: #8a6500; }
      .stat-confirmed { color: #1a7a3c; }
      .stat-declined { color: #a32d2d; }

      .tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
      .tab { background: transparent; border: none; border-bottom: 2px solid transparent; padding: 12px 20px; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 8px; margin-bottom: -1px; }
      .tab:hover { color: var(--ink); }
      .tab-active { color: var(--ink) !important; border-bottom-color: var(--ink) !important; font-weight: 600 !important; }
      .tab-count { background: var(--light); color: var(--muted); border-radius: 100px; padding: 1px 8px; font-size: 11px; font-weight: 700; }

      .empty-state { text-align: center; padding: 60px 20px; }
      .empty-icon { font-size: 36px; margin-bottom: 12px; }
      .empty-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
      .empty-sub { font-size: 14px; color: var(--muted); margin-bottom: 20px; }

      .bookings-table { background: var(--white); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
      .table-header { display: grid; grid-template-columns: 2fr 1fr 0.7fr 0.8fr 1fr 0.6fr; gap: 12px; padding: 12px 20px; background: var(--light); font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
      .table-row { display: grid; grid-template-columns: 2fr 1fr 0.7fr 0.8fr 1fr 0.6fr; gap: 12px; padding: 16px 20px; border-top: 1px solid var(--border); align-items: center; }
      .table-row:hover { background: var(--off-white); }
      .client-name { font-size: 14px; font-weight: 600; color: var(--ink); }
      .client-email { font-size: 12px; color: var(--muted); margin-top: 2px; }
      .row-date { font-size: 13px; color: var(--text); }
      .row-hours { font-size: 13px; color: var(--muted); }
      .row-total { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--ink); }
      .btn-respond { display: inline-block; background: var(--ink); color: var(--white); border-radius: 100px; padding: 5px 12px; font-size: 11px; font-weight: 700; font-family: 'Manrope', sans-serif; transition: background 0.15s; }
      .btn-respond:hover { background: var(--charge); color: var(--ink); }

      .profile-section { max-width: 680px; }
      .success-msg { background: #E8FFF0; border: 1px solid #7FD4A0; color: #1a7a3c; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 20px; }
      .profile-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 28px; }
      .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
      .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
      input, select, textarea { border: 1px solid var(--border); border-radius: 8px; padding: 11px 14px; font-family: 'Manrope', sans-serif; font-size: 14px; color: var(--text); background: var(--off-white); outline: none; transition: border-color 0.15s; width: 100%; }
      input:focus, select:focus, textarea:focus { border-color: var(--ink); }
      input:disabled, select:disabled, textarea:disabled { background: var(--light); color: var(--muted); cursor: not-allowed; }
      textarea { resize: vertical; }
      .profile-actions { display: flex; gap: 10px; margin-top: 8px; }
      .btn-primary { background: var(--ink); color: var(--white); border: none; border-radius: 100px; padding: 11px 24px; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s; display: inline-block; text-align: center; }
      .btn-primary:hover { background: var(--charge); color: var(--ink); }
      .btn-cancel { background: transparent; border: 1px solid var(--border); border-radius: 100px; padding: 11px 24px; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all 0.15s; }
      .btn-cancel:hover { border-color: var(--ink); color: var(--ink); }

      @media (max-width: 900px) {
        .stats-grid { grid-template-columns: repeat(2, 1fr); }
        .stat-earnings { grid-column: span 2; }
        .table-header, .table-row { grid-template-columns: 2fr 1fr 1fr 1fr; }
        .table-header span:nth-child(3), .table-row div:nth-child(3) { display: none; }
        .table-header span:last-child, .table-row div:last-child { display: none; }
      }
      @media (max-width: 640px) {
        .container { padding: 24px 20px 60px; }
        .dash-header { flex-direction: column; }
        .stats-grid { grid-template-columns: 1fr 1fr; }
        .field-row { grid-template-columns: 1fr; }
        .nav { padding: 0 20px; }
        .nav-email { display: none; }
      }
    `}</style>
  );
}

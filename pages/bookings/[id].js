import { useState } from "react";
import Head from "next/head";

export default function BookingPage({ booking, provider, error }) {
  const [status, setStatus] = useState(booking?.status || "pending");
  const [loading, setLoading] = useState(null);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(error || "");

  if (err) {
    return (
      <div className="center">
        <div className="error-box">
          <div className="error-icon">!</div>
          <h2>Booking not found</h2>
          <p>This booking link may be invalid or expired.</p>
          <a href="/" className="btn-home">Back to Vela</a>
        </div>
        <Style />
      </div>
    );
  }

  async function updateStatus(newStatus) {
    setLoading(newStatus);
    setErr("");
    const res = await fetch(`/api/skillbook?action=update_booking_status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: booking.id, status: newStatus }),
    }).then((r) => r.json());
    setLoading(null);
    if (res.error) return setErr(res.error);
    setStatus(newStatus);
    setDone(true);
  }

  const isPending = status === "pending";
  const isConfirmed = status === "confirmed";
  const isDeclined = status === "declined";

  return (
    <>
      <Head>
        <title>Booking — Vela</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        <nav className="nav">
          <a href="/" className="logo"><span className="logo-v">V</span>ela</a>
        </nav>

        <div className="container">

          {/* Status badge */}
          <div className={`status-badge status-${status}`}>
            {status === "pending" && "⏳ Awaiting confirmation"}
            {status === "confirmed" && "✓ Confirmed"}
            {status === "declined" && "✕ Declined"}
          </div>

          <h1 className="page-title">
            {done && isConfirmed && "Booking confirmed!"}
            {done && isDeclined && "Booking declined"}
            {!done && "Booking request"}
          </h1>

          {done && isConfirmed && (
            <p className="page-sub">The client has been notified that their booking is confirmed.</p>
          )}
          {done && isDeclined && (
            <p className="page-sub">The client has been notified and sent back to browse other providers.</p>
          )}
          {!done && (
            <p className="page-sub">Review the booking details below and confirm or decline.</p>
          )}

          {/* Booking details card */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-label">Client</div>
                <div className="card-value">{booking.client_name}</div>
                <div className="card-sub">{booking.client_email}</div>
              </div>
              <div className="total-wrap">
                <div className="total-num">R{booking.total}</div>
                <div className="card-label">total</div>
              </div>
            </div>

            <div className="details">
              <div className="detail-row">
                <span className="detail-label">Provider</span>
                <span className="detail-value">{provider.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date</span>
                <span className="detail-value">{booking.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration</span>
                <span className="detail-value">{booking.hours} hour{booking.hours > 1 ? "s" : ""}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Rate</span>
                <span className="detail-value">R{provider.price_per_hour}/hr</span>
              </div>
              {booking.message && (
                <div className="detail-row">
                  <span className="detail-label">Message</span>
                  <span className="detail-value">{booking.message}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Booked</span>
                <span className="detail-value">{new Date(booking.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isPending && !done && (
            <div className="actions">
              <button
                className="btn-confirm-booking"
                onClick={() => updateStatus("confirmed")}
                disabled={loading !== null}
              >
                {loading === "confirmed" ? "Confirming…" : "✓ Confirm Booking"}
              </button>
              <button
                className="btn-decline-booking"
                onClick={() => updateStatus("declined")}
                disabled={loading !== null}
              >
                {loading === "declined" ? "Declining…" : "✕ Decline"}
              </button>
            </div>
          )}

          {!isPending && !done && (
            <div className="already-actioned">
              This booking has already been {status}.
            </div>
          )}

          {err && <div className="error-msg">{err}</div>}

          <a href="/" className="back-link">← Back to Vela</a>
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
      body {
        background: var(--off-white); color: var(--text);
        font-family: 'Manrope', system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      a { text-decoration: none; color: inherit; }
      .page { min-height: 100vh; }
      .nav {
        background: var(--white); border-bottom: 1px solid var(--border);
        padding: 0 32px; height: 64px;
        display: flex; align-items: center;
      }
      .logo {
        font-family: 'Syne', sans-serif; font-weight: 800;
        font-size: 22px; letter-spacing: -0.04em; color: var(--ink);
      }
      .logo-v { color: var(--charge); background: var(--ink); padding: 0 3px; border-radius: 3px; }
      .container {
        max-width: 560px; margin: 0 auto;
        padding: 48px 24px 80px;
      }
      .status-badge {
        display: inline-block; border-radius: 100px;
        padding: 5px 14px; font-size: 12px; font-weight: 700;
        margin-bottom: 20px; letter-spacing: 0.02em;
      }
      .status-pending { background: #FFF8E7; color: #8a6500; border: 1px solid #F5D87A; }
      .status-confirmed { background: #E8FFF0; color: #1a7a3c; border: 1px solid #7FD4A0; }
      .status-declined { background: #FFF0F0; color: #a32d2d; border: 1px solid #F0A0A0; }
      .page-title {
        font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800;
        letter-spacing: -0.04em; color: var(--ink); margin-bottom: 8px;
      }
      .page-sub { font-size: 15px; color: var(--muted); margin-bottom: 32px; line-height: 1.6; }
      .card {
        background: var(--white); border: 1px solid var(--border);
        border-radius: 16px; overflow: hidden; margin-bottom: 24px;
      }
      .card-header {
        display: flex; justify-content: space-between; align-items: flex-start;
        padding: 24px; border-bottom: 1px solid var(--border);
      }
      .card-label {
        font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
        text-transform: uppercase; color: var(--muted); margin-bottom: 4px;
      }
      .card-value { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: var(--ink); }
      .card-sub { font-size: 13px; color: var(--muted); margin-top: 2px; }
      .total-wrap { text-align: right; }
      .total-num {
        font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800;
        letter-spacing: -0.04em; color: var(--ink); line-height: 1;
      }
      .details { padding: 8px 24px 16px; }
      .detail-row {
        display: flex; justify-content: space-between; align-items: flex-start;
        padding: 12px 0; border-bottom: 1px solid var(--border);
        gap: 16px;
      }
      .detail-row:last-child { border-bottom: none; }
      .detail-label { font-size: 13px; color: var(--muted); flex-shrink: 0; }
      .detail-value { font-size: 13px; color: var(--text); font-weight: 500; text-align: right; }
      .actions { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
      .btn-confirm-booking {
        width: 100%; background: var(--ink); color: var(--white);
        border: none; border-radius: 100px; padding: 15px;
        font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 700;
        cursor: pointer; transition: background 0.2s;
      }
      .btn-confirm-booking:hover:not(:disabled) { background: #1a7a3c; }
      .btn-confirm-booking:disabled { opacity: 0.4; cursor: not-allowed; }
      .btn-decline-booking {
        width: 100%; background: transparent; color: var(--muted);
        border: 1px solid var(--border); border-radius: 100px; padding: 14px;
        font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 600;
        cursor: pointer; transition: all 0.2s;
      }
      .btn-decline-booking:hover:not(:disabled) { border-color: #a32d2d; color: #a32d2d; }
      .btn-decline-booking:disabled { opacity: 0.4; cursor: not-allowed; }
      .already-actioned {
        text-align: center; padding: 16px; font-size: 14px;
        color: var(--muted); margin-bottom: 24px;
      }
      .error-msg {
        background: #FFF5F5; border: 1px solid #FFCCCC; color: #CC0000;
        border-radius: 8px; padding: 12px 16px; font-size: 13px; margin-bottom: 16px;
      }
      .back-link { font-size: 13px; color: var(--muted); display: block; text-align: center; }
      .back-link:hover { color: var(--ink); }
      .center { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
      .error-box { text-align: center; max-width: 360px; }
      .error-icon {
        width: 48px; height: 48px; background: var(--light); border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 20px; font-weight: 700; color: var(--muted);
        margin: 0 auto 16px;
      }
      .error-box h2 { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 8px; }
      .error-box p { font-size: 14px; color: var(--muted); margin-bottom: 20px; }
      .btn-home {
        display: inline-block; background: var(--ink); color: var(--white);
        border-radius: 100px; padding: 10px 24px;
        font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 600;
      }
    `}</style>
  );
}

export async function getServerSideProps({ params }) {
  const { id } = params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    const res = await fetch(`${baseUrl}/api/skillbook?action=get_booking&id=${id}`);
    const data = await res.json();

    if (data.error || !data.booking) {
      return { props: { booking: null, provider: null, error: "Booking not found" } };
    }

    return { props: { booking: data.booking, provider: data.provider, error: null } };
  } catch {
    return { props: { booking: null, provider: null, error: "Something went wrong" } };
  }
}

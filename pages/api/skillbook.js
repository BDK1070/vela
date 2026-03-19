import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

async function sendEmail({ to, subject, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: "Vela <onboarding@resend.dev>", to, subject, html }),
  });
  return res.json();
}

function clientConfirmationEmail({ client_name, provider_name, date, hours, total, message }) {
  return `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A;">
      <div style="background:#0D0D0D;padding:28px 32px;border-radius:12px 12px 0 0;">
        <span style="font-size:22px;font-weight:900;letter-spacing:-0.04em;color:#FAFAF8;">
          <span style="color:#E8FF47;background:#1A1A1A;padding:0 4px;border-radius:3px;">V</span>ela
        </span>
      </div>
      <div style="background:#FAFAF8;padding:36px 32px;border:1px solid #E8E8E4;border-top:none;">
        <div style="width:48px;height:48px;background:#E8FF47;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
          <span style="font-size:20px;font-weight:700;color:#0D0D0D;">✓</span>
        </div>
        <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.03em;margin:0 0 8px;color:#0D0D0D;">Booking Confirmed</h1>
        <p style="font-size:15px;color:#666;margin:0 0 28px;line-height:1.6;">Hi ${client_name}, your booking with <strong style="color:#0D0D0D;">${provider_name}</strong> is confirmed.</p>
        <div style="background:#fff;border:1px solid #E8E8E4;border-radius:10px;padding:20px;margin-bottom:24px;">
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#888;border-bottom:1px solid #F0F0EC;">Provider</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0D0D0D;border-bottom:1px solid #F0F0EC;">${provider_name}</td></tr>
            <tr><td style="padding:8px 0;color:#888;border-bottom:1px solid #F0F0EC;">Date</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0D0D0D;border-bottom:1px solid #F0F0EC;">${date}</td></tr>
            <tr><td style="padding:8px 0;color:#888;border-bottom:1px solid #F0F0EC;">Duration</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0D0D0D;border-bottom:1px solid #F0F0EC;">${hours} hour${hours > 1 ? "s" : ""}</td></tr>
            ${message ? `<tr><td style="padding:8px 0;color:#888;border-bottom:1px solid #F0F0EC;">Message</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0D0D0D;border-bottom:1px solid #F0F0EC;">${message}</td></tr>` : ""}
            <tr><td style="padding:12px 0 0;color:#888;font-size:13px;">Total</td><td style="padding:12px 0 0;text-align:right;font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#0D0D0D;">R${total}</td></tr>
          </table>
        </div>
        <p style="font-size:13px;color:#888;line-height:1.6;margin:0;">The provider will be in touch to confirm details.</p>
      </div>
      <div style="background:#F4F4F1;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #E8E8E4;border-top:none;">
        <p style="font-size:12px;color:#aaa;margin:0;">© 2024 Vela · South Africa's talent marketplace</p>
      </div>
    </div>`;
}

function providerNotificationEmail({ provider_name, client_name, client_email, date, hours, total, message, booking_id }) {
  const bookingUrl = `${SITE_URL}/bookings/${booking_id}`;
  return `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A;">
      <div style="background:#0D0D0D;padding:28px 32px;border-radius:12px 12px 0 0;">
        <span style="font-size:22px;font-weight:900;letter-spacing:-0.04em;color:#FAFAF8;">
          <span style="color:#E8FF47;background:#1A1A1A;padding:0 4px;border-radius:3px;">V</span>ela
        </span>
      </div>
      <div style="background:#FAFAF8;padding:36px 32px;border:1px solid #E8E8E4;border-top:none;">
        <div style="background:#E8FF47;display:inline-block;padding:4px 12px;border-radius:100px;margin-bottom:20px;">
          <span style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0D0D0D;">New Booking</span>
        </div>
        <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.03em;margin:0 0 8px;color:#0D0D0D;">You have a new booking</h1>
        <p style="font-size:15px;color:#666;margin:0 0 28px;line-height:1.6;">Hi ${provider_name}, <strong style="color:#0D0D0D;">${client_name}</strong> has booked you on Vela.</p>
        <div style="background:#fff;border:1px solid #E8E8E4;border-radius:10px;padding:20px;margin-bottom:24px;">
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#888;border-bottom:1px solid #F0F0EC;">Client</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0D0D0D;border-bottom:1px solid #F0F0EC;">${client_name}</td></tr>
            <tr><td style="padding:8px 0;color:#888;border-bottom:1px solid #F0F0EC;">Client email</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0D0D0D;border-bottom:1px solid #F0F0EC;">${client_email}</td></tr>
            <tr><td style="padding:8px 0;color:#888;border-bottom:1px solid #F0F0EC;">Date</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0D0D0D;border-bottom:1px solid #F0F0EC;">${date}</td></tr>
            <tr><td style="padding:8px 0;color:#888;border-bottom:1px solid #F0F0EC;">Duration</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0D0D0D;border-bottom:1px solid #F0F0EC;">${hours} hour${hours > 1 ? "s" : ""}</td></tr>
            ${message ? `<tr><td style="padding:8px 0;color:#888;border-bottom:1px solid #F0F0EC;">Message</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0D0D0D;border-bottom:1px solid #F0F0EC;">${message}</td></tr>` : ""}
            <tr><td style="padding:12px 0 0;color:#888;font-size:13px;">Total</td><td style="padding:12px 0 0;text-align:right;font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#0D0D0D;">R${total}</td></tr>
          </table>
        </div>
        <a href="${bookingUrl}" style="display:block;background:#0D0D0D;color:#fff;text-align:center;padding:14px;border-radius:100px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:12px;">View &amp; Respond to Booking →</a>
        <p style="font-size:12px;color:#aaa;text-align:center;margin:0;">Or copy this link: ${bookingUrl}</p>
      </div>
      <div style="background:#F4F4F1;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #E8E8E4;border-top:none;">
        <p style="font-size:12px;color:#aaa;margin:0;">© 2024 Vela · South Africa's talent marketplace</p>
      </div>
    </div>`;
}

function clientStatusEmail({ client_name, provider_name, date, status }) {
  const confirmed = status === "confirmed";
  return `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A;">
      <div style="background:#0D0D0D;padding:28px 32px;border-radius:12px 12px 0 0;">
        <span style="font-size:22px;font-weight:900;letter-spacing:-0.04em;color:#FAFAF8;">
          <span style="color:#E8FF47;background:#1A1A1A;padding:0 4px;border-radius:3px;">V</span>ela
        </span>
      </div>
      <div style="background:#FAFAF8;padding:36px 32px;border:1px solid #E8E8E4;border-top:none;">
        <div style="width:48px;height:48px;background:${confirmed ? "#E8FF47" : "#FFE8E8"};border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
          <span style="font-size:20px;font-weight:700;color:${confirmed ? "#0D0D0D" : "#a32d2d"};">${confirmed ? "✓" : "✕"}</span>
        </div>
        <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.03em;margin:0 0 8px;color:#0D0D0D;">
          ${confirmed ? "Booking confirmed!" : "Booking declined"}
        </h1>
        <p style="font-size:15px;color:#666;margin:0 0 24px;line-height:1.6;">
          Hi ${client_name}, ${confirmed
            ? `great news — <strong style="color:#0D0D0D;">${provider_name}</strong> has confirmed your booking on <strong style="color:#0D0D0D;">${date}</strong>.`
            : `unfortunately <strong style="color:#0D0D0D;">${provider_name}</strong> is unable to take your booking on <strong style="color:#0D0D0D;">${date}</strong>.`
          }
        </p>
        ${!confirmed ? `
        <a href="${SITE_URL}" style="display:block;background:#0D0D0D;color:#fff;text-align:center;padding:14px;border-radius:100px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:12px;">Browse other providers →</a>
        ` : ""}
        <p style="font-size:13px;color:#888;line-height:1.6;margin:0;">
          ${confirmed ? "The provider may reach out directly to confirm any final details." : "Don't worry — there are plenty of great providers on Vela."}
        </p>
      </div>
      <div style="background:#F4F4F1;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #E8E8E4;border-top:none;">
        <p style="font-size:12px;color:#aaa;margin:0;">© 2024 Vela · South Africa's talent marketplace</p>
      </div>
    </div>`;
}

export default async function handler(req, res) {
  const { action } = req.query;

  if (action === "list_providers" && req.method === "GET") {
    const { category } = req.query;
    let query = supabase.from("providers").select("*").order("created_at", { ascending: false });
    if (category && category !== "all") query = query.eq("category", category);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (action === "get_provider" && req.method === "GET") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing id" });
    const { data, error } = await supabase.from("providers").select("*").eq("id", id).single();
    if (error) return res.status(404).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (action === "get_booking" && req.method === "GET") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing id" });
    const { data: booking, error: bErr } = await supabase.from("bookings").select("*").eq("id", id).single();
    if (bErr || !booking) return res.status(404).json({ error: "Booking not found" });
    const { data: provider, error: pErr } = await supabase.from("providers").select("*").eq("id", booking.provider_id).single();
    if (pErr || !provider) return res.status(404).json({ error: "Provider not found" });
    return res.status(200).json({ booking, provider });
  }

  if (action === "update_booking_status" && req.method === "POST") {
    const { booking_id, status } = req.body;
    if (!booking_id || !["confirmed", "declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const { data: booking, error: bErr } = await supabase.from("bookings").select("*").eq("id", booking_id).single();
    if (bErr || !booking) return res.status(404).json({ error: "Booking not found" });
    const { data: provider, error: pErr } = await supabase.from("providers").select("*").eq("id", booking.provider_id).single();
    if (pErr || !provider) return res.status(404).json({ error: "Provider not found" });
    const { error: uErr } = await supabase.from("bookings").update({ status }).eq("id", booking_id);
    if (uErr) return res.status(500).json({ error: uErr.message });
    try {
      await sendEmail({
        to: booking.client_email,
        subject: status === "confirmed"
          ? `Your booking with ${provider.name} is confirmed!`
          : `Update on your booking with ${provider.name}`,
        html: clientStatusEmail({
          client_name: booking.client_name,
          provider_name: provider.name,
          date: booking.date,
          status,
        }),
      });
    } catch (e) { console.error("Status email failed:", e); }
    return res.status(200).json({ success: true, status });
  }

  if (action === "create_provider" && req.method === "POST") {
    const { name, bio, category, location, price_per_hour, contact_email, avatar_seed } = req.body;
    if (!name || !category || !price_per_hour || !contact_email) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const { data, error } = await supabase.from("providers").insert([{ name, bio, category, location, price_per_hour, contact_email, avatar_seed }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (action === "book" && req.method === "POST") {
    const { provider_id, client_name, client_email, date, hours, message } = req.body;
    if (!provider_id || !client_name || !client_email || !date || !hours) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const { data: provider, error: pErr } = await supabase.from("providers").select("price_per_hour, name, contact_email").eq("id", provider_id).single();
    if (pErr || !provider) return res.status(404).json({ error: "Provider not found" });
    const total = provider.price_per_hour * hours;
    const { data, error } = await supabase.from("bookings").insert([{ provider_id, client_name, client_email, date, hours, message, total, status: "pending" }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    try {
      await Promise.all([
        sendEmail({
          to: client_email,
          subject: `Booking confirmed — ${provider.name} on ${date}`,
          html: clientConfirmationEmail({ client_name, provider_name: provider.name, date, hours, total, message }),
        }),
        sendEmail({
          to: provider.contact_email,
          subject: `New booking from ${client_name} — ${date}`,
          html: providerNotificationEmail({ provider_name: provider.name, client_name, client_email, date, hours, total, message, booking_id: data.id }),
        }),
      ]);
    } catch (e) { console.error("Email failed:", e); }
    return res.status(201).json({ ...data, provider_name: provider.name });
  }

  if (action === "provider_bookings" && req.method === "GET") {
    const { provider_id } = req.query;
    const { data, error } = await supabase.from("bookings").select("*").eq("provider_id", provider_id).order("date", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(404).json({ error: "Unknown action" });
}

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function sendEmail({ to, subject, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Vela <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });
  return res.json();
}

function clientConfirmationEmail({ client_name, provider_name, date, hours, total, message }) {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff;">
      <div style="background: #0D0D0D; padding: 32px; text-align: center;">
        <span style="font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.04em;">
          <span style="color: #E8FF47;">V</span>ela
        </span>
      </div>
      <div style="padding: 40px 32px;">
        <p style="font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9A9A94; margin: 0 0 12px;">Booking Confirmed</p>
        <h1 style="font-size: 32px; font-weight: 800; color: #0D0D0D; margin: 0 0 8px; letter-spacing: -0.03em; line-height: 1.1;">You're booked with<br/>${provider_name}.</h1>
        <p style="font-size: 15px; color: #666; margin: 0 0 32px; line-height: 1.6;">Hi ${client_name}, your booking is confirmed. Here are the details.</p>
        <div style="border: 1px solid #E8E8E4; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
          <div style="background: #FAFAF8; padding: 20px 24px; border-bottom: 1px solid #E8E8E4;">
            <p style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9A9A94; margin: 0 0 4px;">Provider</p>
            <p style="font-size: 16px; font-weight: 700; color: #0D0D0D; margin: 0;">${provider_name}</p>
          </div>
          <div style="display: flex; padding: 0;">
            <div style="flex: 1; padding: 20px 24px; border-right: 1px solid #E8E8E4;">
              <p style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9A9A94; margin: 0 0 4px;">Date</p>
              <p style="font-size: 15px; font-weight: 600; color: #0D0D0D; margin: 0;">${date}</p>
            </div>
            <div style="flex: 1; padding: 20px 24px;">
              <p style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9A9A94; margin: 0 0 4px;">Duration</p>
              <p style="font-size: 15px; font-weight: 600; color: #0D0D0D; margin: 0;">${hours} hour${hours > 1 ? "s" : ""}</p>
            </div>
          </div>
          ${message ? `<div style="padding: 20px 24px; border-top: 1px solid #E8E8E4;"><p style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9A9A94; margin: 0 0 4px;">Your message</p><p style="font-size: 14px; color: #555; margin: 0; line-height: 1.6;">${message}</p></div>` : ""}
          <div style="background: #0D0D0D; padding: 20px 24px;">
            <p style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #666; margin: 0 0 4px;">Total</p>
            <p style="font-size: 28px; font-weight: 800; color: #E8FF47; margin: 0; letter-spacing: -0.03em;">R${total}</p>
          </div>
        </div>
        <p style="font-size: 14px; color: #888; line-height: 1.7; margin: 0;">The provider will be in touch to confirm the final details. If you have any questions, reply to this email.</p>
      </div>
      <div style="border-top: 1px solid #E8E8E4; padding: 24px 32px; text-align: center;">
        <p style="font-size: 12px; color: #9A9A94; margin: 0;">© 2024 Vela · South Africa's Talent Marketplace</p>
      </div>
    </div>
  `;
}

function providerNotificationEmail({ provider_name, client_name, client_email, date, hours, total, message }) {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff;">
      <div style="background: #0D0D0D; padding: 32px; text-align: center;">
        <span style="font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.04em;">
          <span style="color: #E8FF47;">V</span>ela
        </span>
      </div>
      <div style="padding: 40px 32px;">
        <p style="font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9A9A94; margin: 0 0 12px;">New Booking</p>
        <h1 style="font-size: 32px; font-weight: 800; color: #0D0D0D; margin: 0 0 8px; letter-spacing: -0.03em; line-height: 1.1;">You have a new<br/>booking, ${provider_name.split(" ")[0]}.</h1>
        <p style="font-size: 15px; color: #666; margin: 0 0 32px; line-height: 1.6;">${client_name} has booked you through Vela. Here are the details.</p>
        <div style="border: 1px solid #E8E8E4; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
          <div style="background: #FAFAF8; padding: 20px 24px; border-bottom: 1px solid #E8E8E4;">
            <p style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9A9A94; margin: 0 0 4px;">Client</p>
            <p style="font-size: 16px; font-weight: 700; color: #0D0D0D; margin: 0 0 2px;">${client_name}</p>
            <p style="font-size: 13px; color: #888; margin: 0;">${client_email}</p>
          </div>
          <div style="display: flex; padding: 0;">
            <div style="flex: 1; padding: 20px 24px; border-right: 1px solid #E8E8E4;">
              <p style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9A9A94; margin: 0 0 4px;">Date</p>
              <p style="font-size: 15px; font-weight: 600; color: #0D0D0D; margin: 0;">${date}</p>
            </div>
            <div style="flex: 1; padding: 20px 24px;">
              <p style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9A9A94; margin: 0 0 4px;">Duration</p>
              <p style="font-size: 15px; font-weight: 600; color: #0D0D0D; margin: 0;">${hours} hour${hours > 1 ? "s" : ""}</p>
            </div>
          </div>
          ${message ? `<div style="padding: 20px 24px; border-top: 1px solid #E8E8E4;"><p style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9A9A94; margin: 0 0 4px;">Client message</p><p style="font-size: 14px; color: #555; margin: 0; line-height: 1.6;">${message}</p></div>` : ""}
          <div style="background: #0D0D0D; padding: 20px 24px;">
            <p style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #666; margin: 0 0 4px;">You earn</p>
            <p style="font-size: 28px; font-weight: 800; color: #E8FF47; margin: 0; letter-spacing: -0.03em;">R${total}</p>
          </div>
        </div>
        <p style="font-size: 14px; color: #888; line-height: 1.7; margin: 0;">Reply to this email or contact ${client_name} directly at <a href="mailto:${client_email}" style="color: #0D0D0D; font-weight: 600;">${client_email}</a> to confirm the booking details.</p>
      </div>
      <div style="border-top: 1px solid #E8E8E4; padding: 24px 32px; text-align: center;">
        <p style="font-size: 12px; color: #9A9A94; margin: 0;">© 2024 Vela · South Africa's Talent Marketplace</p>
      </div>
    </div>
  `;
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

  if (action === "create_provider" && req.method === "POST") {
    const { name, bio, category, location, price_per_hour, contact_email, avatar_seed } = req.body;
    if (!name || !category || !price_per_hour || !contact_email) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const { data, error } = await supabase
      .from("providers")
      .insert([{ name, bio, category, location, price_per_hour, contact_email, avatar_seed }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (action === "book" && req.method === "POST") {
    const { provider_id, client_name, client_email, date, hours, message } = req.body;
    if (!provider_id || !client_name || !client_email || !date || !hours) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data: provider, error: pErr } = await supabase
      .from("providers")
      .select("price_per_hour, name, contact_email")
      .eq("id", provider_id)
      .single();
    if (pErr || !provider) return res.status(404).json({ error: "Provider not found" });

    const total = provider.price_per_hour * hours;

    const { data, error } = await supabase
      .from("bookings")
      .insert([{ provider_id, client_name, client_email, date, hours, message, total, status: "pending" }])
      .select()
      .single();
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
          html: providerNotificationEmail({ provider_name: provider.name, client_name, client_email, date, hours, total, message }),
        }),
      ]);
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
    }

    return res.status(201).json({ ...data, provider_name: provider.name });
  }

  if (action === "provider_bookings" && req.method === "GET") {
    const { provider_id } = req.query;
    const { data, error } = await supabase
      .from("bookings").select("*").eq("provider_id", provider_id).order("date", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(404).json({ error: "Unknown action" });
}

import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setSuccess("Account created! Check your email to confirm, then log in.");
      setMode("login");
    }
    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <>
      <Head>
        <title>{mode === "login" ? "Provider Login" : "Create Account"} — Vela</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        <nav className="nav">
          <a href="/" className="logo"><span className="logo-v">V</span>ela</a>
        </nav>

        <div className="container">
          <div className="card">
            <div className="card-header">
              <h1 className="card-title">
                {mode === "login" ? "Provider login" : "Create account"}
              </h1>
              <p className="card-sub">
                {mode === "login"
                  ? "Access your dashboard to manage bookings."
                  : "Set up your provider account to start receiving bookings."}
              </p>
            </div>

            <div className="card-body">
              {success && <div className="success-msg">{success}</div>}
              {error && <div className="error-msg">{error}</div>}

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? "Please wait…"
                  : mode === "login" ? "Log in" : "Create account"}
              </button>

              <div className="switch-mode">
                {mode === "login" ? (
                  <>Don't have an account?{" "}
                    <button className="link-btn" onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}>
                      Sign up
                    </button>
                  </>
                ) : (
                  <>Already have an account?{" "}
                    <button className="link-btn" onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
                      Log in
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="footer-note">
            <a href="/">← Back to Vela</a>
          </p>
        </div>
      </div>

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
        .page { min-height: 100vh; display: flex; flex-direction: column; }
        .nav {
          background: var(--white); border-bottom: 1px solid var(--border);
          padding: 0 32px; height: 64px; display: flex; align-items: center;
        }
        .logo {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 22px; letter-spacing: -0.04em; color: var(--ink);
        }
        .logo-v { color: var(--charge); background: var(--ink); padding: 0 3px; border-radius: 3px; }
        .container {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 24px;
        }
        .card {
          background: var(--white); border: 1px solid var(--border);
          border-radius: 16px; width: 100%; max-width: 400px;
          overflow: hidden;
        }
        .card-header {
          padding: 28px 28px 24px;
          border-bottom: 1px solid var(--border);
        }
        .card-title {
          font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800;
          letter-spacing: -0.03em; color: var(--ink); margin-bottom: 6px;
        }
        .card-sub { font-size: 13px; color: var(--muted); line-height: 1.5; }
        .card-body { padding: 24px 28px 28px; }
        .success-msg {
          background: #E8FFF0; border: 1px solid #7FD4A0; color: #1a7a3c;
          border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 18px;
        }
        .error-msg {
          background: #FFF5F5; border: 1px solid #FFCCCC; color: #CC0000;
          border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 18px;
        }
        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--muted);
        }
        input {
          border: 1px solid var(--border); border-radius: 8px;
          padding: 11px 14px; font-family: 'Manrope', sans-serif;
          font-size: 14px; color: var(--text); background: var(--off-white);
          outline: none; transition: border-color 0.15s; width: 100%;
        }
        input:focus { border-color: var(--ink); }
        .btn-submit {
          width: 100%; background: var(--ink); color: var(--white);
          border: none; border-radius: 100px; padding: 13px;
          font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: background 0.2s; margin-top: 4px;
        }
        .btn-submit:hover:not(:disabled) { background: var(--charge); color: var(--ink); }
        .btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }
        .switch-mode {
          text-align: center; margin-top: 16px;
          font-size: 13px; color: var(--muted);
        }
        .link-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Manrope', sans-serif; font-size: 13px;
          font-weight: 600; color: var(--ink); padding: 0;
          text-decoration: underline;
        }
        .footer-note {
          margin-top: 20px; font-size: 13px; color: var(--muted);
        }
        .footer-note a:hover { color: var(--ink); }
      `}</style>
    </>
  );
}

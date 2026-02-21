import { useState, useEffect, useRef, useCallback } from "react";

// ── Seeded random for deterministic stars ──
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Full-page cosmic canvas ──
function CosmicBackground() {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const rafRef = useRef(0);
  const starsRef = useRef([]);
  const spritesRef = useRef([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pre-render star sprites
    if (spritesRef.current.length === 0) {
      spritesRef.current = [3, 5, 8, 14].map((d) => {
        const c = document.createElement("canvas");
        c.width = c.height = d * 2;
        const ctx = c.getContext("2d");
        const grad = ctx.createRadialGradient(d, d, 0, d, d, d * 0.85);
        grad.addColorStop(0, "rgba(240,238,248,1)");
        grad.addColorStop(0.12, "rgba(240,238,248,0.7)");
        grad.addColorStop(0.35, "rgba(230,228,244,0.2)");
        grad.addColorStop(0.7, "rgba(220,218,240,0.04)");
        grad.addColorStop(1, "rgba(220,218,240,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, d * 2, d * 2);
        return c;
      });
    }

    const generateStars = (w, h) => {
      const rng = seededRandom(7777);
      const stars = [];
      for (let i = 0; i < 900; i++) stars.push({ x: rng() * w, y: rng() * h, size: 0, b: 0.12 + rng() * 0.2, to: rng() * 6.28, ts: 0.001 + rng() * 0.001 });
      for (let i = 0; i < 250; i++) stars.push({ x: rng() * w, y: rng() * h, size: 1, b: 0.2 + rng() * 0.3, to: rng() * 6.28, ts: 0.0015 + rng() * 0.001 });
      for (let i = 0; i < 50; i++) stars.push({ x: rng() * w, y: rng() * h, size: 2, b: 0.35 + rng() * 0.35, to: rng() * 6.28, ts: 0.002 + rng() * 0.001 });
      for (let i = 0; i < 10; i++) stars.push({ x: rng() * w, y: rng() * h, size: 3, b: 0.5 + rng() * 0.5, to: rng() * 6.28, ts: 0.003 + rng() * 0.001 });
      return stars;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      sizeRef.current = { w: window.innerWidth, h: window.innerHeight };
      starsRef.current = generateStars(window.innerWidth, window.innerHeight);
    };

    const draw = () => {
      const ctx = canvas.getContext("2d");
      const { w, h } = sizeRef.current;
      if (!w) { rafRef.current = requestAnimationFrame(draw); return; }
      const f = frameRef.current++;
      const sprites = spritesRef.current;

      // Deep void
      ctx.fillStyle = "#06061A";
      ctx.fillRect(0, 0, w, h);

      // Nebula depth
      const n1 = ctx.createRadialGradient(w * 0.3, h * 0.2, 0, w * 0.3, h * 0.2, w * 0.5);
      n1.addColorStop(0, "rgba(25,18,55,0.4)");
      n1.addColorStop(0.4, "rgba(18,14,45,0.2)");
      n1.addColorStop(1, "transparent");
      ctx.fillStyle = n1;
      ctx.fillRect(0, 0, w, h);

      const n2 = ctx.createRadialGradient(w * 0.75, h * 0.6, 0, w * 0.75, h * 0.6, w * 0.4);
      n2.addColorStop(0, "rgba(15,20,50,0.3)");
      n2.addColorStop(0.5, "rgba(12,15,40,0.15)");
      n2.addColorStop(1, "transparent");
      ctx.fillStyle = n2;
      ctx.fillRect(0, 0, w, h);

      const n3 = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.3);
      n3.addColorStop(0, "rgba(20,15,50,0.2)");
      n3.addColorStop(1, "transparent");
      ctx.fillStyle = n3;
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (const s of starsRef.current) {
        const tw = Math.sin(f * s.ts + s.to);
        const a = s.b * (0.5 + 0.5 * tw);
        if (a < 0.01) continue;
        const sp = sprites[s.size];
        if (!sp) continue;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.drawImage(sp, s.x - sp.width / 2, s.y - sp.width / 2);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(rafRef.current); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} />;
}

// ── Moon renderer ──
function MoonOrb({ phase, illumination, size }) {
  const canvasRef = useRef(null);
  const texRef = useRef(null);
  const frameRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    // Pre-render texture
    if (!texRef.current) {
      const ts = 512;
      const c = document.createElement("canvas");
      c.width = c.height = ts;
      const ctx = c.getContext("2d");
      const cx = ts / 2, cy = ts / 2, r = ts / 2;

      const base = ctx.createRadialGradient(cx - r * 0.15, cy - r * 0.1, r * 0.05, cx, cy, r);
      base.addColorStop(0, "#d8d4e4"); base.addColorStop(0.2, "#c4c0d2");
      base.addColorStop(0.45, "#a8a4b6"); base.addColorStop(0.65, "#8c889a");
      base.addColorStop(0.82, "#6c687a"); base.addColorStop(1, "#3c3848");
      ctx.fillStyle = base;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

      // Maria
      const maria = [
        { x: 0.34, y: 0.30, rx: 0.14, ry: 0.12, a: 0.2 },
        { x: 0.26, y: 0.48, rx: 0.13, ry: 0.20, a: 0.16 },
        { x: 0.53, y: 0.30, rx: 0.08, ry: 0.09, a: 0.18 },
        { x: 0.57, y: 0.43, rx: 0.10, ry: 0.09, a: 0.17 },
        { x: 0.72, y: 0.33, rx: 0.05, ry: 0.065, a: 0.2 },
        { x: 0.40, y: 0.62, rx: 0.09, ry: 0.07, a: 0.14 },
        { x: 0.64, y: 0.56, rx: 0.07, ry: 0.06, a: 0.12 },
        { x: 0.30, y: 0.68, rx: 0.05, ry: 0.05, a: 0.14 },
      ];
      for (const m of maria) {
        const mx = cx - r + m.x * 2 * r, my = cy - r + m.y * 2 * r;
        const mr = Math.max(m.rx, m.ry) * r * 1.4;
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
        g.addColorStop(0, `rgba(20,16,36,${m.a})`);
        g.addColorStop(0.5, `rgba(20,16,36,${m.a * 0.5})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
      }

      // Micro texture
      const rng = seededRandom(42);
      for (let i = 0; i < 500; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = rng() * r * 0.9;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;
        const sr = 2 + rng() * 6;
        const op = 0.015 + rng() * 0.03;
        const dark = rng() > 0.45;
        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
        sg.addColorStop(0, dark ? `rgba(12,10,28,${op})` : `rgba(210,206,228,${op * 0.5})`);
        sg.addColorStop(1, "transparent");
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
      }

      // Limb darkening
      const v = ctx.createRadialGradient(cx, cy, r * 0.12, cx, cy, r);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(0.5, "rgba(0,0,0,0)");
      v.addColorStop(0.75, "rgba(0,0,0,0.1)"); v.addColorStop(0.9, "rgba(0,0,0,0.35)");
      v.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = v;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

      texRef.current = c;
    }

    const canvas = canvasRef.current;
    const s = size;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = s * dpr;
    canvas.height = s * dpr;
    canvas.style.width = s + "px";
    canvas.style.height = s + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const draw = () => {
      const f = frameRef.current++;
      ctx.clearRect(0, 0, s, s);
      const cx = s / 2, cy = s / 2, r = s * 0.42;

      // Breathing glow
      const breathe = Math.sin(f * 0.005) * 0.05 + 0.95;
      const layers = [
        { m: 2.2, o: 0.01 }, { m: 1.7, o: 0.025 }, { m: 1.35, o: 0.05 },
      ];
      for (const l of layers) {
        const g = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * l.m);
        const op = l.o * illumination * breathe;
        g.addColorStop(0, `rgba(200,196,220,${op})`);
        g.addColorStop(0.5, `rgba(190,185,215,${op * 0.3})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, r * l.m, 0, Math.PI * 2); ctx.fill();
      }

      // Gold warmth
      if (illumination > 0.3) {
        const gi = (illumination - 0.3) / 0.7 * breathe;
        const gg = ctx.createRadialGradient(cx, cy, r, cx, cy, r * 1.9);
        gg.addColorStop(0, `rgba(232,201,122,${0.025 * gi})`);
        gg.addColorStop(0.5, `rgba(232,201,122,${0.008 * gi})`);
        gg.addColorStop(1, "transparent");
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(cx, cy, r * 1.9, 0, Math.PI * 2); ctx.fill();
      }

      // Moon texture
      if (texRef.current) {
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(texRef.current, cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
      }

      // Terminator
      const pa = phase * Math.PI * 2;
      const k = Math.cos(pa);
      const isWax = Math.sin(pa) >= 0;
      const steps = 90;

      // Penumbra
      for (const pp of [{ o: 0.06, a: 0.08 }, { o: 0.035, a: 0.2 }, { o: 0.015, a: 0.4 }, { o: 0.005, a: 0.65 }]) {
        const pk = k + (isWax ? -1 : 1) * pp.o;
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, isWax);
        for (let i = 0; i <= steps; i++) {
          const a = Math.PI / 2 - (i / steps) * Math.PI;
          ctx.lineTo(cx + pk * r * Math.cos(a), cy + r * Math.sin(a));
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(6,6,26,${pp.a})`;
        ctx.fill(); ctx.restore();
      }

      // Hard shadow
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, isWax);
      for (let i = 0; i <= steps; i++) {
        const a = Math.PI / 2 - (i / steps) * Math.PI;
        ctx.lineTo(cx + k * r * Math.cos(a), cy + r * Math.sin(a));
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(6,6,26,0.97)";
      ctx.fill(); ctx.restore();

      // Earthshine
      if (illumination < 0.4) {
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
        const esx = isWax ? cx - r * 0.4 : cx + r * 0.4;
        const esg = ctx.createRadialGradient(esx, cy, r * 0.2, cx, cy, r);
        const esi = (0.4 - illumination) * 0.04;
        esg.addColorStop(0, `rgba(110,130,185,${esi})`);
        esg.addColorStop(0.5, `rgba(80,100,155,${esi * 0.2})`);
        esg.addColorStop(1, "transparent");
        ctx.fillStyle = esg;
        ctx.fillRect(0, 0, s, s);
        ctx.restore();
      }

      // Bright limb
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(220,218,240,${0.06 + illumination * 0.06})`;
      ctx.lineWidth = 0.6; ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, illumination, size]);

  return <canvas ref={canvasRef} />;
}

// ── Orbital data ring ──
function OrbitalInfo({ phase, illumination, phaseName, zodiacSign, zodiacSymbol }) {
  const items = [
    { label: "ILLUMINATION", value: `${Math.round(illumination * 100)}%`, angle: -60 },
    { label: "PHASE", value: phaseName, angle: 0, isMain: true },
    { label: "ZODIAC", value: zodiacSign, symbol: zodiacSymbol, angle: 60 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Phase arc ring */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        {/* Track */}
        <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(200,196,220,0.04)" strokeWidth="1" />
        {/* Progress */}
        <circle
          cx="200" cy="200" r="170" fill="none"
          stroke="rgba(200,196,220,0.2)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={`${phase * 1068} ${1068 - phase * 1068}`}
          strokeDashoffset="267"
          style={{ transition: "stroke-dasharray 2s ease", filter: "drop-shadow(0 0 3px rgba(200,196,220,0.15))" }}
        />
        {/* Endpoint dot */}
        <circle
          cx={200 + 170 * Math.cos(-Math.PI / 2 + phase * Math.PI * 2)}
          cy={200 + 170 * Math.sin(-Math.PI / 2 + phase * Math.PI * 2)}
          r="3" fill="#E8C97A"
          style={{ filter: "drop-shadow(0 0 4px rgba(232,201,122,0.6))" }}
        >
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Tick marks around the ring */}
        {[0, 0.25, 0.5, 0.75].map((p, i) => {
          const a = -Math.PI / 2 + p * Math.PI * 2;
          const x1 = 200 + 163 * Math.cos(a), y1 = 200 + 163 * Math.sin(a);
          const x2 = 200 + 177 * Math.cos(a), y2 = 200 + 177 * Math.sin(a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(200,196,220,0.12)" strokeWidth="1" />;
        })}
      </svg>

      {/* Data labels floating around the moon */}
      <div className="absolute" style={{ top: "8%", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.2em", color: "rgba(200,196,220,0.35)", textTransform: "uppercase" }}>
          Lunar Phase
        </div>
      </div>

      {/* Left orbital label — Illumination */}
      <div className="absolute" style={{ top: "50%", left: "2%", transform: "translateY(-50%)", textAlign: "left" }}>
        <div style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.15em", color: "rgba(200,196,220,0.3)", textTransform: "uppercase", marginBottom: 4 }}>
          Illumination
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#F0EEF8", fontWeight: 300, lineHeight: 1 }}>
          {Math.round(illumination * 1000) / 10}%
        </div>
      </div>

      {/* Right orbital label — Zodiac */}
      <div className="absolute" style={{ top: "50%", right: "2%", transform: "translateY(-50%)", textAlign: "right" }}>
        <div style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.15em", color: "rgba(200,196,220,0.3)", textTransform: "uppercase", marginBottom: 4 }}>
          Zodiac Transit
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", color: "#F0EEF8", fontWeight: 300 }}>
            {zodiacSign}
          </span>
          <span style={{ fontSize: "20px", color: "#E8C97A" }}>{zodiacSymbol}</span>
        </div>
      </div>

      {/* Bottom — Phase direction */}
      <div className="absolute" style={{ bottom: "6%", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.12em", color: "rgba(200,196,220,0.25)" }}>
          {phase < 0.5 ? "◐ WAXING · GROWING TOWARD FULL" : "◑ WANING · RELEASING TOWARD NEW"}
        </div>
      </div>
    </div>
  );
}

// ── Main App ──
export default function LunarPractitionerDemo() {
  const [time, setTime] = useState(0);

  // Simulated moon data
  const phase = 0.12; // Waxing crescent
  const illumination = 0.204;
  const phaseName = "Waxing Crescent";
  const zodiacSign = "Aries";
  const zodiacSymbol = "♈";

  return (
    <div style={{ minHeight: "100vh", background: "#06061A", color: "#F0EEF8", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      {/* Full-page starfield — FIXED behind everything */}
      <CosmicBackground />

      {/* All content scrolls over the cosmic background */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HUD Header ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "linear-gradient(180deg, rgba(6,6,26,0.9) 0%, rgba(6,6,26,0.5) 100%)",
          backdropFilter: "blur(16px) saturate(1.2)",
          borderBottom: "1px solid rgba(200,196,220,0.06)",
          padding: "12px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: "#E8C97A",
              boxShadow: "0 0 8px rgba(232,201,122,0.5)",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <span style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.15em", color: "rgba(200,196,220,0.5)", textTransform: "uppercase" }}>
              Live
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "monospace", fontSize: 12 }}>
            <span style={{ color: "#F0EEF8" }}>{phaseName}</span>
            <span style={{ color: "rgba(200,196,220,0.5)" }}>{Math.round(illumination * 100)}%</span>
            <span style={{ color: "#E8C97A" }}>{zodiacSymbol} {zodiacSign}</span>
          </div>

          <button style={{ color: "rgba(200,196,220,0.4)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </header>

        {/* ── Moon Hero Section ── */}
        <section style={{ position: "relative", height: "85vh", minHeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: "min(85vw, 400px)", height: "min(85vw, 400px)" }}>
            {/* Moon canvas */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MoonOrb phase={phase} illumination={illumination} size={Math.min(window?.innerWidth * 0.6 || 280, 280)} />
            </div>
            {/* Orbital data overlay */}
            <OrbitalInfo
              phase={phase}
              illumination={illumination}
              phaseName={phaseName}
              zodiacSign={zodiacSign}
              zodiacSymbol={zodiacSymbol}
            />
          </div>
        </section>

        {/* ── Phase Identity ── */}
        <section style={{ textAlign: "center", padding: "0 24px 60px", maxWidth: 600, margin: "0 auto", marginTop: -60 }}>
          <h1 style={{ fontSize: "clamp(2rem, 7vw, 3.2rem)", fontWeight: 300, letterSpacing: "0.06em", marginBottom: 12, color: "#F0EEF8" }}>
            {phaseName}
          </h1>
          <p style={{ fontSize: "1.15rem", color: "#E8C97A", fontStyle: "italic", marginBottom: 8 }}>
            Emergence & Intention
          </p>
          <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "rgba(200,196,220,0.4)", letterSpacing: "0.08em" }}>
            Growing toward Full
          </p>
          <blockquote style={{
            marginTop: 28, padding: "0 16px", fontStyle: "italic",
            fontSize: "1rem", color: "rgba(200,196,220,0.7)", lineHeight: 1.7,
          }}>
            "A sliver of light appears. Let your intentions take shape."
          </blockquote>
        </section>

        {/* ── Glass Cards Demo ── */}
        <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 80px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Phase Energy Card */}
          <div style={{
            position: "relative", borderRadius: 16, padding: "24px 24px 28px", overflow: "hidden",
            background: "linear-gradient(135deg, rgba(240,238,248,0.03) 0%, rgba(200,196,220,0.06) 50%, rgba(240,238,248,0.02) 100%)",
            backdropFilter: "blur(20px) saturate(1.2)",
            border: "1px solid rgba(200,196,220,0.08)",
            boxShadow: "0 0 0 1px rgba(200,196,220,0.04) inset, 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
          }}>
            {/* Top edge highlight */}
            <div style={{
              position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
              background: "linear-gradient(90deg, transparent, rgba(240,238,248,0.12), transparent)",
            }} />
            {/* Inner atmosphere */}
            <div style={{
              position: "absolute", top: -20, right: -20, width: 200, height: 200, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(232,201,122,0.04) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.2em", color: "rgba(200,196,220,0.35)", textTransform: "uppercase", marginBottom: 14 }}>
                Phase Energy
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 400, color: "#F0EEF8", marginBottom: 8 }}>
                Waxing Crescent
              </h3>
              <p style={{ fontSize: "0.85rem", color: "rgba(200,196,220,0.6)", marginBottom: 20 }}>
                Tentative, hopeful, gathering momentum
              </p>

              <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", color: "rgba(200,196,220,0.3)", textTransform: "uppercase", marginBottom: 10 }}>
                Ideal For
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["Setting intentions with sound", "Gentle activation practices", "Breathwork with toning", "Small group work"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem", color: "rgba(200,196,220,0.7)" }}>
                    <span style={{ color: "#E8C97A", fontSize: 8 }}>◆</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Frequencies Card */}
          <div style={{
            position: "relative", borderRadius: 16, padding: "24px 24px 28px", overflow: "hidden",
            background: "linear-gradient(135deg, rgba(240,238,248,0.03) 0%, rgba(200,196,220,0.06) 50%, rgba(240,238,248,0.02) 100%)",
            backdropFilter: "blur(20px) saturate(1.2)",
            border: "1px solid rgba(200,196,220,0.08)",
            boxShadow: "0 0 0 1px rgba(200,196,220,0.04) inset, 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
          }}>
            <div style={{
              position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
              background: "linear-gradient(90deg, transparent, rgba(240,238,248,0.12), transparent)",
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.2em", color: "rgba(200,196,220,0.35)", textTransform: "uppercase", marginBottom: 16 }}>
                Frequencies
              </div>

              {[
                { hz: "417", label: "Facilitating change (RE)", color: "#F0EEF8" },
                { hz: "285", label: "Healing tissue", color: "#C8C4DC" },
                { hz: "210.42", label: "Moon planetary tone", color: "#E8C97A", isMoon: true },
              ].map((f, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 0",
                  borderBottom: i < 2 ? "1px solid rgba(200,196,220,0.04)" : "none",
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
                      {f.isMoon && <div style={{ width: 3, height: 20, borderRadius: 2, background: "#E8C97A", marginRight: 4 }} />}
                      <span style={{ fontFamily: "monospace", fontSize: "1.3rem", fontWeight: 400, color: f.color }}>
                        {f.hz}
                      </span>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(200,196,220,0.4)" }}>Hz</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "rgba(200,196,220,0.5)" }}>{f.label}</div>
                  </div>
                  <button style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(200,196,220,0.05)",
                    border: "1px solid rgba(200,196,220,0.1)",
                    color: "rgba(200,196,220,0.5)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              ))}

              <div style={{ marginTop: 12, fontFamily: "monospace", fontSize: 11, color: "rgba(232,201,122,0.5)" }}>
                Moon tone: 210.42 Hz (D#/Eb)
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(232,201,122,0.5); }
          50% { opacity: 0.4; box-shadow: 0 0 3px rgba(232,201,122,0.2); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>
    </div>
  );
}

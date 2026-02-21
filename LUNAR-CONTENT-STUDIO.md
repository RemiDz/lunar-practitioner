# Lunar Practitioner — Content Studio (/promo)

## ⚠️ ALWAYS: `git push origin master:main`

---

## What This Is

A hidden page at `/promo` — a personal content creation tool for the app developer. NOT a landing page. NOT a marketing page. It's a daily-use tool that generates ready-to-share social media content using LIVE moon data from the app's existing hooks.

Every day, the developer visits `lunar-practitioner.vercel.app/promo`, downloads a beautiful shareable image card, copies a platform-specific caption, and posts to social media. Done in 30 seconds.

## Reference

This follows the EXACT same pattern as Earth Pulse (`shumann.app/promo`). Same concept, adapted for lunar data.

---

## ROUTING

Create: `src/app/promo/page.tsx`

Next.js App Router handles routing automatically. Do NOT add this to any navigation.

---

## DESIGN

- Match the main app aesthetic: CosmicBackground starfield, glass morphism, Cormorant + JetBrains Mono
- Import and use `CosmicBackground` component so stars are behind everything
- All content sits at `relative z-[1]` over the starfield
- Use `glass-card` class for all card containers

---

## PAGE STRUCTURE

```
┌─────────────────────────────────────────┐
│                                         │
│  ☽ Lunar Practitioner — Content Studio  │
│  Saturday, 22 February 2025             │
│  Waxing Crescent · 20.4% · ♈ Aries     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  QUICK STATS BAR                        │
│  Phase: Waxing Crescent | Illum: 20.4%  │
│  Zodiac: Aries ♈ | Direction: Waxing    │
│  Moon Tone: 210.42 Hz | Rise: 09:12     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  SHAREABLE IMAGE CARD                   │
│  [Post 1:1] [Story 9:16]  ← toggle     │
│  ┌─────────────────────────┐            │
│  │                         │            │
│  │   (canvas-rendered      │            │
│  │    beautiful card        │            │
│  │    with live moon data)  │            │
│  │                         │            │
│  └─────────────────────────┘            │
│  [ ⬇ Download PNG ]                     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  OPENING HOOKS                          │
│  (click to select, feeds into captions) │
│  · "Tonight's crescent is barely..."    │
│  · "Your moon phase matters more..."    │
│  · "Sound healers — today's Aries..."   │
│  · "Can't sleep? The moon is at..."     │
│  · "Here's what the moon says about..." │
│  [ 🔀 Shuffle ]                         │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  READY-TO-COPY CAPTIONS                 │
│  ┌─────────────────────┐                │
│  │ Instagram    [Copy] │                │
│  │ (full caption +     │                │
│  │  hashtags)           │                │
│  └─────────────────────┘                │
│  ┌─────────────────────┐                │
│  │ TikTok       [Copy] │                │
│  │ (short + FYP tags)  │                │
│  └─────────────────────┘                │
│  ┌─────────────────────┐                │
│  │ Twitter/X    [Copy] │                │
│  │ (concise + link)    │                │
│  └─────────────────────┘                │
│  ┌─────────────────────┐                │
│  │ WhatsApp/DM  [Copy] │                │
│  │ (personal share)    │                │
│  └─────────────────────┘                │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  CONTENT CALENDAR HINTS                 │
│  Best times to post + weekly ideas      │
│                                         │
└─────────────────────────────────────────┘
```

---

## Section 1: Header

```tsx
<header className="text-center pt-12 pb-6 px-6 relative z-10">
  <h1 className="font-display text-2xl text-selenite-white font-light tracking-wide mb-1">
    ☽ Lunar Practitioner — Content Studio
  </h1>
  <p className="font-mono text-xs text-moonsilver/40 mb-3">
    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
  </p>
  <p className="font-mono text-sm text-moonsilver/60">
    {moonData?.phaseDisplayName} · {moonData?.illuminationPercent} · 
    <span className="text-lunar-gold">{zodiacConfig?.symbol} {zodiacConfig?.name}</span>
  </p>
</header>
```

---

## Section 2: Quick Stats Bar

A horizontal glass card showing key data at a glance. This helps inform content creation.

```tsx
<section className="max-w-2xl mx-auto px-4 mb-8 relative z-10">
  <div className="glass-card p-4">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
      <div>
        <span className="text-moonsilver/30 uppercase tracking-wider text-[9px]">Phase</span>
        <p className="text-selenite-white mt-1">{moonData?.phaseDisplayName}</p>
      </div>
      <div>
        <span className="text-moonsilver/30 uppercase tracking-wider text-[9px]">Illumination</span>
        <p className="text-selenite-white mt-1">{moonData?.illuminationPercent}</p>
      </div>
      <div>
        <span className="text-moonsilver/30 uppercase tracking-wider text-[9px]">Zodiac</span>
        <p className="text-lunar-gold mt-1">{zodiacConfig?.symbol} {zodiacConfig?.name}</p>
      </div>
      <div>
        <span className="text-moonsilver/30 uppercase tracking-wider text-[9px]">Direction</span>
        <p className="text-selenite-white mt-1">{moonData?.phase < 0.5 ? '↑ Waxing' : '↓ Waning'}</p>
      </div>
      <div>
        <span className="text-moonsilver/30 uppercase tracking-wider text-[9px]">Moon Tone</span>
        <p className="text-selenite-white mt-1">210.42 Hz (D#/Eb)</p>
      </div>
      <div>
        <span className="text-moonsilver/30 uppercase tracking-wider text-[9px]">Energy</span>
        <p className="text-selenite-white mt-1">{intelligence?.subtitle || 'Loading...'}</p>
      </div>
    </div>
  </div>
</section>
```

---

## Section 3: Shareable Image Card Generator

### Format Toggle

Two buttons: **Post (1:1)** and **Story (9:16)**. Clicking switches the canvas dimensions.

```tsx
const [cardFormat, setCardFormat] = useState<'post' | 'story'>('post');
const cardWidth = 1080;
const cardHeight = cardFormat === 'post' ? 1080 : 1920;
```

### Canvas Card

The card MUST be rendered as a `<canvas>` element (NOT HTML) so it can be downloaded as PNG. This is critical — HTML elements cannot be long-press saved on mobile.

Display the canvas at a responsive width but render internally at 1080px for crisp downloads.

```tsx
<section className="max-w-2xl mx-auto px-4 mb-8 relative z-10">
  <div className="glass-card p-4">
    {/* Format toggle */}
    <div className="flex gap-2 mb-4 justify-center">
      <button
        onClick={() => setCardFormat('post')}
        className={`font-mono text-xs px-4 py-1.5 rounded-full border transition-all ${
          cardFormat === 'post'
            ? 'border-lunar-gold/40 text-lunar-gold bg-lunar-gold/10'
            : 'border-moonsilver/15 text-moonsilver/40 hover:text-moonsilver/60'
        }`}
      >
        Post 1:1
      </button>
      <button
        onClick={() => setCardFormat('story')}
        className={`font-mono text-xs px-4 py-1.5 rounded-full border transition-all ${
          cardFormat === 'story'
            ? 'border-lunar-gold/40 text-lunar-gold bg-lunar-gold/10'
            : 'border-moonsilver/15 text-moonsilver/40 hover:text-moonsilver/60'
        }`}
      >
        Story 9:16
      </button>
    </div>

    {/* Canvas */}
    <canvas
      ref={cardCanvasRef}
      className="w-full rounded-lg"
      style={{ aspectRatio: cardFormat === 'post' ? '1/1' : '9/16' }}
    />

    {/* Download button */}
    <button
      onClick={downloadCard}
      className="w-full mt-4 py-3 rounded-xl font-mono text-sm tracking-wider uppercase transition-all"
      style={{
        background: 'linear-gradient(135deg, rgba(232,201,122,0.15), rgba(232,201,122,0.08))',
        border: '1px solid rgba(232,201,122,0.25)',
        color: '#E8C97A',
      }}
    >
      ⬇ Download PNG
    </button>
  </div>
</section>
```

### Canvas Drawing Function

Draw the card content directly to canvas with the Canvas2D API. Do NOT use html2canvas — draw natively for crisp output.

```tsx
function drawCard(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // 1. Background — deep void with nebula
  ctx.fillStyle = '#06061A';
  ctx.fillRect(0, 0, w, h);

  const nebula = ctx.createRadialGradient(w * 0.4, h * 0.3, 0, w * 0.5, h * 0.5, w * 0.6);
  nebula.addColorStop(0, 'rgba(25,18,55,0.35)');
  nebula.addColorStop(0.5, 'rgba(15,12,40,0.15)');
  nebula.addColorStop(1, 'transparent');
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, w, h);

  // 2. Scattered stars (seeded random, ~80 small dots)
  const rng = seededRandom(Date.now() / 86400000 | 0); // changes daily
  for (let i = 0; i < 80; i++) {
    const sx = rng() * w, sy = rng() * h;
    const sr = 0.5 + rng() * 1.5;
    const sa = 0.1 + rng() * 0.3;
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,196,220,${sa})`;
    ctx.fill();
  }

  // 3. Crescent moon drawing (upper area)
  const moonCx = w / 2;
  const moonCy = h * (h > w ? 0.22 : 0.3); // higher on story format
  const moonR = w * 0.15;
  
  // Moon circle
  ctx.beginPath(); ctx.arc(moonCx, moonCy, moonR, 0, Math.PI * 2);
  const moonGrad = ctx.createRadialGradient(moonCx - moonR * 0.2, moonCy - moonR * 0.1, moonR * 0.05, moonCx, moonCy, moonR);
  moonGrad.addColorStop(0, '#c8c4d8');
  moonGrad.addColorStop(0.5, '#908c9c');
  moonGrad.addColorStop(1, '#504c5c');
  ctx.fillStyle = moonGrad;
  ctx.fill();

  // Terminator shadow (match current phase)
  const phaseAngle = phase * Math.PI * 2;
  const k = Math.cos(phaseAngle);
  const isWax = Math.sin(phaseAngle) >= 0;
  ctx.save();
  ctx.beginPath(); ctx.arc(moonCx, moonCy, moonR, 0, Math.PI * 2); ctx.clip();
  ctx.beginPath();
  ctx.moveTo(moonCx, moonCy - moonR);
  ctx.arc(moonCx, moonCy, moonR, -Math.PI / 2, Math.PI / 2, isWax);
  for (let i = 0; i <= 60; i++) {
    const a = Math.PI / 2 - (i / 60) * Math.PI;
    ctx.lineTo(moonCx + k * moonR * Math.cos(a), moonCy + moonR * Math.sin(a));
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(6,6,26,0.95)';
  ctx.fill();
  ctx.restore();

  // Glow around moon
  const glow = ctx.createRadialGradient(moonCx, moonCy, moonR, moonCx, moonCy, moonR * 1.6);
  glow.addColorStop(0, `rgba(200,196,220,${0.04 * illumination})`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(moonCx, moonCy, moonR * 1.6, 0, Math.PI * 2); ctx.fill();

  // 4. Text content
  const textY = moonCy + moonR + w * 0.08;

  // Phase name
  ctx.textAlign = 'center';
  ctx.font = `300 ${w * 0.065}px "Cormorant Garamond", serif`;
  ctx.fillStyle = '#F0EEF8';
  ctx.fillText(phaseName, w / 2, textY);

  // Subtitle: illumination + zodiac
  ctx.font = `${w * 0.025}px "JetBrains Mono", monospace`;
  ctx.fillStyle = 'rgba(200,196,220,0.5)';
  ctx.fillText(`${illuminationPct} · ${zodiacSymbol} ${zodiacName}`, w / 2, textY + w * 0.05);

  // Divider
  const divY = textY + w * 0.09;
  const divGrad = ctx.createLinearGradient(w * 0.3, divY, w * 0.7, divY);
  divGrad.addColorStop(0, 'transparent');
  divGrad.addColorStop(0.5, 'rgba(200,196,220,0.15)');
  divGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(w * 0.3, divY); ctx.lineTo(w * 0.7, divY); ctx.stroke();

  // Quote (word-wrap)
  const quoteY = divY + w * 0.06;
  ctx.font = `italic 300 ${w * 0.032}px "Cormorant Garamond", serif`;
  ctx.fillStyle = 'rgba(200,196,220,0.6)';
  wrapText(ctx, `"${quote}"`, w / 2, quoteY, w * 0.7, w * 0.045);

  // --- For STORY format, add extra session info ---
  if (h > w) {
    const sessionY = h * 0.52;
    
    // "Today's Session" heading
    ctx.font = `${w * 0.022}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(200,196,220,0.3)';
    ctx.letterSpacing = '0.15em';
    ctx.fillText("TODAY'S SESSION", w / 2, sessionY);
    
    // Ideal practices
    const idealY = sessionY + w * 0.06;
    ctx.font = `${w * 0.02}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(200,196,220,0.35)';
    ctx.fillText('IDEAL FOR', w / 2, idealY);
    
    // List 3-4 practices
    ctx.font = `300 ${w * 0.028}px "Cormorant Garamond", serif`;
    ctx.fillStyle = 'rgba(240,238,248,0.65)';
    const practices = intelligence?.practices?.ideal?.slice(0, 4) || [];
    practices.forEach((p, i) => {
      ctx.fillText(`✦ ${p}`, w / 2, idealY + w * 0.05 + i * w * 0.04);
    });

    // Frequencies
    const freqY = idealY + w * 0.05 + practices.length * w * 0.04 + w * 0.06;
    ctx.font = `${w * 0.02}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(200,196,220,0.35)';
    ctx.fillText('FREQUENCIES', w / 2, freqY);

    ctx.font = `${w * 0.03}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#E8C97A';
    const freqStr = intelligence?.frequencies?.map(f => `${f.hz} Hz`).join(' · ') || '210.42 Hz';
    ctx.fillText(freqStr, w / 2, freqY + w * 0.05);
  }

  // 5. Bottom branding — ALWAYS present
  const brandY = h - w * 0.08;
  
  // Divider
  const bDivGrad = ctx.createLinearGradient(w * 0.35, brandY - w * 0.03, w * 0.65, brandY - w * 0.03);
  bDivGrad.addColorStop(0, 'transparent');
  bDivGrad.addColorStop(0.5, 'rgba(200,196,220,0.1)');
  bDivGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = bDivGrad;
  ctx.beginPath(); ctx.moveTo(w * 0.35, brandY - w * 0.03); ctx.lineTo(w * 0.65, brandY - w * 0.03); ctx.stroke();

  // App name
  ctx.font = `${w * 0.02}px "JetBrains Mono", monospace`;
  ctx.fillStyle = 'rgba(200,196,220,0.3)';
  ctx.fillText('☽ LUNAR PRACTITIONER', w / 2, brandY);
  
  // URL
  ctx.font = `${w * 0.018}px "JetBrains Mono", monospace`;
  ctx.fillStyle = 'rgba(200,196,220,0.2)';
  ctx.fillText('lunar-practitioner.vercel.app', w / 2, brandY + w * 0.03);
}

// Helper: word-wrap text on canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}
```

### Download Function

```tsx
function downloadCard() {
  const canvas = cardCanvasRef.current;
  if (!canvas) return;
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.download = `lunar-${phaseName.toLowerCase().replace(/\s+/g, '-')}-${dateStr}-${cardFormat}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
```

### Font Loading

Canvas needs fonts loaded before drawing. Ensure fonts render correctly:

```tsx
useEffect(() => {
  if (!moonData) return;
  document.fonts.ready.then(() => {
    renderCard();
  });
}, [moonData, intelligence, cardFormat]);
```

---

## Section 4: Opening Hooks

5 hooks per phase category (new moon, crescent, quarter, gibbous, full — 25 total). Click to select, selected hook feeds into all caption templates. Shuffle button randomises within the current phase category.

```tsx
const [selectedHook, setSelectedHook] = useState(0);

const hooks: Record<string, string[]> = {
  'new': [
    "The sky is dark tonight — and that's exactly when the magic begins 🌑",
    "New Moon energy is reset energy. Here's what to release today...",
    "Sound healers: this is your most powerful session night of the month",
    "Everything starts in darkness. Tonight's new moon is proof of that ✨",
    "The moon has gone quiet. Have you?",
  ],
  'crescent': [
    "A sliver of light just appeared — can you feel the shift? ☽",
    "The waxing crescent is whispering: set your intentions NOW",
    "This thin crescent holds more power than you think...",
    "Sound healers — tonight's crescent energy is perfect for gentle activation 🎵",
    "The moon is barely visible but the energy is building fast",
  ],
  'quarter': [
    "Half light, half shadow — today's moon mirrors your inner balance ◐",
    "First quarter energy means it's time to take action on those intentions",
    "The moon is at a crossroads tonight. So are you.",
    "Quarter moon sessions hit different — here's why sound healers love this phase",
    "Halfway to full. The momentum is real.",
  ],
  'gibbous': [
    "The moon is almost full and the energy is INTENSE right now 🌔",
    "Gibbous moon = refinement energy. Perfect night to fine-tune your practice",
    "Can't sleep? The gibbous moon might be why...",
    "Sound healers: tonight calls for deep, resonant frequencies",
    "The light is building. Trust the process.",
  ],
  'full': [
    "FULL MOON TONIGHT 🌕 Here's what every sound healer needs to know",
    "The moon is at 100%. Your energy probably is too.",
    "Full moon sessions are the most powerful of the month — here's how to use it",
    "If you're feeling everything tonight, blame the full moon (seriously)",
    "Peak illumination. Peak energy. Peak healing potential.",
  ],
};

// Determine current phase category from phase value
function getPhaseCategory(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return 'new';
  if (phase < 0.22) return 'crescent';
  if (phase < 0.28) return 'quarter';
  if (phase < 0.47) return 'gibbous';
  if (phase < 0.53) return 'full';
  if (phase < 0.72) return 'gibbous';
  if (phase < 0.78) return 'quarter';
  if (phase < 0.97) return 'crescent';
  return 'new';
}
```

### Hook selector UI:

```tsx
<section className="max-w-2xl mx-auto px-4 mb-8 relative z-10">
  <div className="glass-card p-5">
    <div className="flex items-center justify-between mb-4">
      <span className="font-mono text-[9px] tracking-[0.2em] text-moonsilver/30 uppercase">
        Opening Hook
      </span>
      <button
        onClick={shuffleHooks}
        className="font-mono text-[10px] text-lunar-gold/50 hover:text-lunar-gold transition-colors"
      >
        🔀 Shuffle
      </button>
    </div>
    <div className="space-y-2">
      {currentHooks.map((hook, i) => (
        <button
          key={i}
          onClick={() => setSelectedHook(i)}
          className={`w-full text-left p-3 rounded-lg font-display text-sm transition-all ${
            selectedHook === i
              ? 'bg-lunar-gold/10 border border-lunar-gold/20 text-selenite-white'
              : 'border border-transparent text-moonsilver/50 hover:text-moonsilver/70 hover:bg-white/[0.02]'
          }`}
        >
          {hook}
        </button>
      ))}
    </div>
  </div>
</section>
```

---

## Section 5: Ready-to-Copy Captions

Four platform-specific caption templates. The selected hook is prepended to each. Copy button with "Copied!" feedback.

```tsx
const currentHook = currentHooks[selectedHook];
const appUrl = 'lunar-practitioner.vercel.app';

const captions = {
  instagram: `${currentHook}

☽ ${phaseName} · ${illuminationPct} illumination
${zodiacConfig ? `Moon in ${zodiacConfig.symbol} ${zodiacConfig.name}` : ''}

"${quote}"

${intelligence?.subtitle || ''}

${intelligence?.practices?.ideal?.map(p => `✦ ${p}`).join('\n') || ''}

🎵 Frequencies: ${intelligence?.frequencies?.map(f => f.hz + ' Hz').join(' · ') || '210.42 Hz'}

Track the moon in real-time — link in bio ☽
${appUrl}

#soundhealing #moonphase #lunarpractitioner #${phaseName.toLowerCase().replace(/\s+/g, '')} #moonin${zodiacConfig?.name.toLowerCase() || 'zodiac'} #soundtherapy #frequencyhealing #moonenergy #lunarwisdom #soundjourney #fullmoon #newmoon #soundbath`,

  tiktok: `${currentHook}

☽ ${phaseName} at ${illuminationPct}
${zodiacConfig ? `Moon in ${zodiacConfig.name}` : ''}

${intelligence?.subtitle || ''}

🔗 ${appUrl}

#soundhealing #moonphase #lunarpractitioner #moonenergy #soundtherapy #fyp #spiritualtiktok #frequencyhealing`,

  twitter: `${currentHook}

☽ ${phaseName} · ${illuminationPct} · ${zodiacConfig?.symbol || ''} ${zodiacConfig?.name || ''}

${appUrl}`,

  whatsapp: `Hey! Check what the moon is doing tonight:

☽ ${phaseName} — ${illuminationPct} illumination
${zodiacConfig ? `Moon in ${zodiacConfig.symbol} ${zodiacConfig.name}` : ''}

"${quote}"

I've been using this free moon tracker for my sound healing sessions — it shows you the best frequencies and practices for each phase. Have a look: https://${appUrl}`,
};
```

### Caption cards UI:

```tsx
<section className="max-w-2xl mx-auto px-4 mb-8 relative z-10 space-y-3">
  {Object.entries(captions).map(([platform, text]) => (
    <div key={platform} className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] tracking-[0.15em] text-moonsilver/35 uppercase">
          {platform}
        </span>
        <button
          onClick={() => copyCaption(platform, text)}
          className="font-mono text-[10px] px-3 py-1 rounded-full border border-moonsilver/15 text-moonsilver/40 hover:text-lunar-gold hover:border-lunar-gold/30 transition-all"
        >
          {copiedPlatform === platform ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      <p className="text-xs text-moonsilver/45 leading-relaxed whitespace-pre-line font-mono">
        {text}
      </p>
    </div>
  ))}
</section>
```

### Copy function:

```tsx
const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

function copyCaption(platform: string, text: string) {
  navigator.clipboard.writeText(text).then(() => {
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  });
}
```

---

## Section 6: Content Calendar Hints

```tsx
<section className="max-w-2xl mx-auto px-4 pb-20 relative z-10">
  <div className="glass-card p-5">
    <span className="font-mono text-[9px] tracking-[0.2em] text-moonsilver/30 uppercase block mb-4">
      Content Calendar
    </span>

    <div className="mb-5">
      <p className="font-mono text-[10px] text-moonsilver/35 uppercase tracking-wider mb-2">Best times to post</p>
      <div className="space-y-1.5 text-xs text-moonsilver/50">
        <p>Instagram: 9–11am, 7–9pm</p>
        <p>TikTok: 7–9am, 12–3pm, 7–11pm</p>
        <p>Twitter/X: 8–10am, 12–1pm</p>
      </div>
    </div>

    <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,196,220,0.06), transparent)' }} />

    <div className="mt-5">
      <p className="font-mono text-[10px] text-moonsilver/35 uppercase tracking-wider mb-2">Ideas for this week</p>
      <div className="space-y-2 text-xs text-moonsilver/50">
        {/* Generate contextual ideas based on current phase */}
        {moonData?.phase < 0.05 && <p>💡 "New moon reset ritual" — share your preparation process</p>}
        {moonData?.phase > 0.45 && moonData?.phase < 0.55 && <p>💡 "Full moon sound bath" — go live during your session</p>}
        {moonData?.phase >= 0.05 && moonData?.phase < 0.45 && <p>💡 "Waxing moon intentions" — ask followers what they're manifesting</p>}
        {moonData?.phase > 0.55 && <p>💡 "Waning moon release" — share what you're letting go of</p>}
        <p>💡 Share today's card with a personal story about how moon energy affected your week</p>
        <p>💡 Post a 15-second clip playing the moon tone (210.42 Hz) with the card as background</p>
      </div>
    </div>
  </div>
</section>
```

---

## Daily Uniqueness

The star placement on the canvas card uses a seed based on today's date (`Date.now() / 86400000 | 0`), so each day the card looks slightly different. The hooks use phase categories, so different moon phases get different content. This means every single day produces unique, fresh content.

---

## Implementation Checklist

- [ ] `/promo` loads with live moon data
- [ ] `/` main app still works (no breaking changes)
- [ ] Quick stats bar shows current data
- [ ] Canvas card renders with moon, phase, quote, branding
- [ ] Post (1:1) and Story (9:16) toggle works
- [ ] Download PNG button saves a crisp image
- [ ] Long-press on mobile offers "Save Image"
- [ ] Opening hooks load for current phase category
- [ ] Clicking a hook highlights it
- [ ] Shuffle randomises hooks
- [ ] Selected hook appears in all 4 caption templates
- [ ] Copy buttons work with "Copied!" feedback
- [ ] Content calendar shows contextual ideas
- [ ] Page is NOT linked from main app navigation
- [ ] Fonts load before canvas rendering (no blank text)
- [ ] Push with `git push origin master:main`

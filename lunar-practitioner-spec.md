# 🌙 Lunar Practitioner — Full Product Specification & Architecture
**NestorLab Ecosystem | Version 1.0**
*Real-time moon intelligence for sound healing practitioners*

---

## Vision Statement

Lunar Practitioner is a zero-infrastructure, fully client-side moon intelligence tool for sound healing practitioners. Every piece of data — moon phase, illumination, position, zodiac sign, moonrise/set, apogee/perigee — is calculated in real time from pure astronomy mathematics. No API. No keys. No backend. No failure points. Works offline. The moon is always available.

**Core promise:** *"Know what the moon is doing right now, and know exactly what to do with it."*

---

## Why This Has Zero API Blockers

Everything is calculated client-side using:

- **`suncalc`** — lightweight, battle-tested JS library. Gives moon phase, illumination, altitude, azimuth, moonrise, moonset, from coordinates + timestamp. MIT licence, no network calls.
- **`astronomia`** — for zodiac sign calculation and lunar distance (apogee/perigee proximity)
- **Device geolocation** — for moonrise/set times (location-dependent). Falls back to a default location gracefully.
- **Device clock** — everything updates in real time off `Date.now()`

No external network calls required after the page loads. Can be deployed as a PWA that works fully offline.

---

## Who This Is For

**Primary:** Sound healing practitioners planning group sessions, sound journeys, and retreats. They currently piece together moon data from three or four different apps and websites. This consolidates everything into one practitioner-grade tool and tells them *what to do*, not just what the moon is doing.

**Secondary:** Individual clients who want to align their personal practice with lunar cycles.

**Monetisation angle:** This is the NestorLab app most suited to a practitioner subscription. A free tier shows today's data. A Pro tier unlocks the session planning calendar (30-day lunar forecast), session card downloads, and multi-location moonrise times for retreat planning.

---

## UI Design Philosophy — "Selenite & Void"

Where Earth Pulse feels cosmic-scientific and Harmonic Intake feels clinical-organic, Lunar Practitioner should feel **ceremonial and sacred**. Like a beautifully crafted lunar almanac come to life. Ancient knowledge rendered in light.

### Colour Palette

| Name | Hex | Usage |
|---|---|---|
| Void Black | `#05050F` | Primary background |
| Deep Indigo | `#0A0A2E` | Secondary surfaces |
| Selenite White | `#F0EEF8` | Primary text, moon body |
| Moonsilver | `#C8C4DC` | Secondary text, inactive states |
| Lunar Gold | `#E8C97A` | Full moon accent, peak states |
| New Moon Blue | `#1A1A4E` | New moon accent, void states |
| Waxing Violet | `#8B7EC8` | Waxing phase accent |
| Waning Rose | `#C87E8B` | Waning phase accent |
| Starfield | `#0D0D25` | Card surfaces |

### Typography

- **Display / Moon name:** `Cormorant Garamond` — timeless, sacred, slightly antiqued
- **Body / Guidance text:** `Lato` — warm and readable
- **Data / Numbers / Times:** `JetBrains Mono` — precise

### Motion Design Principles

The UI breathes on a lunar rhythm. Slow, deliberate, luminous.

- Moon orb rotates/illuminates in real time (shadow calculated from actual phase)
- Star field drifts imperceptibly slowly — nearly still
- Phase changes trigger a soft radial bloom from the moon orb
- All transitions: `cubic-bezier(0.16, 1, 0.3, 1)` — slow start, arrives gracefully
- No sudden cuts. Everything dissolves.

---

## Screen Architecture

### Screen 1 — Loading

- Full void-black screen
- Moon orb fades in from nothing, slowly illuminating to current phase
- Text: *"Reading the moon..."* → *"Calculating your sky..."*
- Ambient audio option: soft high-frequency crystal bowl tone fades in (single 432Hz sine, very quiet)

---

### Screen 2 — Main Experience (Primary)

One immersive fullscreen view. No tabs. Scrollable vertically on mobile.

#### Layout

```
┌─────────────────────────────────────┐
│           LIVE INDICATOR            │  ← top 5%
├─────────────────────────────────────┤
│                                     │
│           MOON CANVAS               │  ← 45%
│   (3D moon + star field + halo)     │
│                                     │
├─────────────────────────────────────┤
│         PHASE IDENTITY              │  ← 15%
│   (phase name + illumination %)     │
├─────────────────────────────────────┤
│       SESSION INTELLIGENCE          │  ← 35%
│  (zodiac | frequencies | guidance   │
│   moonrise/set | phase countdown)   │
└─────────────────────────────────────┘
```

---

#### Zone 1 — Live Indicator

Minimal top bar:

```
◉ LIVE     Waxing Gibbous · 78.3% illuminated     ♏ Scorpio
```

- Pulsing dot, moon phase name, exact illumination percentage, current zodiac sign
- Frosted glass bar, very subtle

---

#### Zone 2 — Moon Canvas

The visual centrepiece. Built on Three.js or Canvas2D.

**Layer 1 — Star Field**
- 1,200 stars rendered as points with varying size and opacity
- Slow rotation that mirrors actual sky movement (sidereal time calculation)
- Stars near the moon are slightly dimmed by moonlight (proximity fade)
- Occasional very slow shooting star (rare, subtle, magical)
- A faint Milky Way band drawn as a soft gradient arc

**Layer 2 — Moon Glow / Halo**
- Soft radial glow emanating from the moon orb
- Glow colour and intensity tied to illumination percentage:
  - New moon: almost no glow
  - First/last quarter: soft silver glow
  - Full moon: intense warm gold halo with outer diffusion ring
- At supermoon (perigee), glow expands noticeably — the moon *feels* closer

**Layer 3 — Moon Orb**
The moon itself. Two approaches, choose based on build time:

*Option A (simpler):* CSS/Canvas painted orb with a mathematically correct shadow mask applied based on `suncalc` phase angle. Clean and beautiful.

*Option B (richer):* Three.js sphere with a lunar surface texture (free NASA texture, static asset bundled) + shader for terminator line (the shadow boundary). This is genuinely stunning.

Recommendation: **Option B**. The terminator line moving in real time over a lunar surface texture is one of those moments that stops people.

The orb slowly rotates on its Y axis (lunar libration simulation — the real moon wobbles slightly, showing different faces over time).

**Layer 4 — Phase Arc**
A thin luminous arc around the moon showing progress through the current lunar cycle (0–100%). At full moon it completes. Colour shifts with phase.

**Layer 5 — Zodiac Constellation**
When zodiac data shows (e.g. moon is in Scorpio), the Scorpius constellation outline fades in subtly in the background behind the moon — faint, silver, like a watermark. Just enough to be felt.

---

#### Zone 3 — Phase Identity

Centred beneath the moon:

```
        WAXING GIBBOUS
   ────────────────────────
    78.3% · Growing toward Full
    
    "The moon is building power.
     So is your work."
```

A single evocative line changes with each phase. Not clinical — poetic and practitioner-relevant.

---

#### Zone 4 — Session Intelligence Panel

The practical heart of the app. A grid of cards in frosted glass panels.

**Card 1 — Current Moon Phase**
Full phase description with practitioner context:
```
WAXING GIBBOUS
━━━━━━━━━━━━━━━━━━━━━
Energy building toward peak.
Ideal for: intensifying intention,
deepening breathwork, building
group field, sustained toning.

Avoid: completion work, release
practices — save those for after
the full moon.
```

**Card 2 — Frequency Prescription**
```
RECOMMENDED FREQUENCIES
━━━━━━━━━━━━━━━━━━━━━━━
Primary:    528Hz (transformation)
Secondary:  741Hz (expression)
Solfeggio:  MI · SOL

Planetary:  Moon tone · 210.42Hz
            Try tuning bowls to D#
```

Frequencies shift with phase and zodiac sign. A waxing Scorpio moon has different suggestions than a waning Gemini moon.

**Card 3 — Zodiac Influence**
```
MOON IN SCORPIO  ♏
━━━━━━━━━━━━━━━━━━━━
Element: Water · Fixed
Energy: Depth, transformation,
        shadow integration

Session mood: Go deep. This is
a moon for catharsis, not comfort.
Best instruments: Gong, didgeridoo,
low crystal bowls.
```

Instrument suggestions are tailored to your toolkit (gong, monochord, crystal bowls, didgeridoo, drums).

**Card 4 — Moonrise / Moonset**
```
MOONRISE        MOONSET
━━━━━━━━        ━━━━━━━━
  19:42           06:18
              
Moon is above the horizon
for 10h 36m tonight
```

Calculated from device location. Updates daily.

**Card 5 — Lunar Distance**
```
LUNAR DISTANCE
━━━━━━━━━━━━━━━━━━━━
  372,840 km

◐ Mid-distance
Next Perigee (Supermoon): 14 days
Next Apogee: 28 days

[Perigee]━━━━━━◉━━━━━━[Apogee]
```

Perigee = supermoon energy (closer, stronger); apogee = more detached, reflective energy. Practitioners use this.

**Card 6 — Phase Countdown**
```
NEXT PHASE
━━━━━━━━━━━━━━━━━━━━
  FULL MOON
  in 2 days, 14 hours

  ●●●●●●●●●●●●○○○○  78%
  through current phase
```

---

### Screen 3 — 30-Day Lunar Calendar (Pro)

A scrollable calendar view showing the entire lunar month ahead:

- Each day shows: moon phase icon, illumination %, zodiac sign, any significant events
- Significant events highlighted: New Moon, Full Moon, Supermoon, eclipse, void-of-course periods
- Tap any day to see full session guidance for that date
- "Plan a session" → pre-fills a session card for that date

This is the feature that makes this a **planning tool**, not just a dashboard — and it's what justifies a Pro tier.

---

### Screen 4 — Session Card Generator

Generates a beautiful shareable image for practitioners to post before a session:

**Card contains:**
- Tonight's moon phase (illustrated)
- Zodiac sign + element
- Session guidance one-liner
- Recommended frequencies
- Moonrise time
- Date and practitioner's location
- NestorLab branding

**Output formats:**
- Instagram square (1080×1080)
- Instagram story (1080×1920)
- A5 printable (for studio notice boards)

Generated entirely client-side with `html2canvas`. No server upload.

---

### Screen 5 — Settings / Personalisation

- Location override (default: device GPS; can set manually — useful for retreat planning in a different location)
- Instrument profile: select your instruments → affects instrument suggestions in zodiac card
- Tradition preference: Western astrology / Vedic (sidereal) — affects zodiac calculations
- Notification option (PWA): *"Daily lunar briefing at 7am"*

---

## Data & Calculations — Zero API

### Core Library: suncalc

```typescript
import SunCalc from 'suncalc'

const getMoonData = (lat: number, lng: number, date: Date = new Date()) => {
  const illumination = SunCalc.getMoonIllumination(date)
  const position = SunCalc.getMoonPosition(date, lat, lng)
  const times = SunCalc.getMoonTimes(date, lat, lng)

  return {
    phase: illumination.phase,           // 0–1 (0 = new, 0.5 = full)
    illumination: illumination.fraction, // 0–1
    angle: illumination.angle,           // for waxing/waning determination
    altitude: position.altitude,         // radians above horizon
    azimuth: position.azimuth,           // compass direction
    distance: position.distance,         // km from Earth centre
    moonrise: times.rise,                // Date object
    moonset: times.set,                  // Date object
    alwaysUp: times.alwaysUp,            // polar regions edge case
  }
}
```

### Phase Name Calculation

```typescript
const getPhaseDetails = (phase: number): PhaseDetails => {
  // phase is 0–1 from suncalc
  if (phase < 0.025 || phase > 0.975) return PHASES.NEW_MOON
  if (phase < 0.25)                   return PHASES.WAXING_CRESCENT
  if (phase < 0.275)                  return PHASES.FIRST_QUARTER
  if (phase < 0.5)                    return PHASES.WAXING_GIBBOUS
  if (phase < 0.525)                  return PHASES.FULL_MOON
  if (phase < 0.75)                   return PHASES.WANING_GIBBOUS
  if (phase < 0.775)                  return PHASES.LAST_QUARTER
  return PHASES.WANING_CRESCENT
}
```

### Zodiac Calculation (client-side)

```typescript
// Moon's ecliptic longitude → zodiac sign
// Using astronomia library for precise ecliptic position
import { moonposition } from 'astronomia'

const getMoonZodiac = (date: Date): ZodiacSign => {
  const jde = dateToJulian(date)
  const pos = moonposition.position(jde)
  const longitude = pos.lon.deg // 0–360 degrees
  const signIndex = Math.floor(longitude / 30)
  return ZODIAC_SIGNS[signIndex]
}
```

### Perigee / Apogee

```typescript
// suncalc gives distance in km
// Average lunar distance: ~384,400 km
// Perigee threshold: < 362,000 km (supermoon territory)
// Apogee threshold: > 405,000 km

const getLunarDistanceStatus = (distanceKm: number) => {
  const AVERAGE = 384400
  const normalised = (distanceKm - 356000) / (406700 - 356000) // 0 = perigee, 1 = apogee
  
  return {
    km: Math.round(distanceKm),
    normalised,
    isSupermoon: distanceKm < 362000,
    label: distanceKm < 370000 ? 'Supermoon · Very close'
         : distanceKm < 385000 ? 'Closer than average'
         : distanceKm < 400000 ? 'Further than average'
         : 'Micromoon · Very distant',
  }
}
```

### Real-time Update Strategy

```typescript
// Update frequency — no API calls, just recalculate
useEffect(() => {
  const interval = setInterval(() => {
    const fresh = getMoonData(lat, lng)
    setMoonData(fresh)
  }, 60_000) // every minute is more than sufficient

  return () => clearInterval(interval)
}, [lat, lng])
```

---

## Session Intelligence Data

All of this is static configuration — no API. Pure lookup tables.

### Phase Config

```typescript
interface PhaseConfig {
  name: string
  subtitle: string
  quote: string
  energy: string
  idealFor: string[]
  avoid: string[]
  frequencies: { primary: number; secondary: number; label: string }[]
  instruments: string[]
  colour: string
}

const PHASES: Record<PhaseName, PhaseConfig> = {
  NEW_MOON: {
    name: 'New Moon',
    subtitle: 'Void & Beginning',
    quote: 'The dark before the light. Plant seeds here.',
    energy: 'Inward, still, potent with potential',
    idealFor: ['Intention setting', 'Silent meditation', 'Vision work', 'Yin sound baths'],
    avoid: ['High-energy activations', 'Loud percussive work'],
    frequencies: [
      { primary: 396, label: 'Liberation (UT)' },
      { primary: 174, label: 'Foundation' },
    ],
    instruments: ['Monochord', 'Crystal singing bowls (low)', 'Shruti box'],
    colour: '#1A1A4E',
  },
  WAXING_CRESCENT: { ... },
  FIRST_QUARTER: { ... },
  WAXING_GIBBOUS: { ... },
  FULL_MOON: {
    name: 'Full Moon',
    subtitle: 'Peak Illumination',
    quote: 'Maximum light. Maximum feeling. Hold nothing back.',
    energy: 'Expansive, emotional, powerful, culminating',
    idealFor: ['Group sound journeys', 'Gong baths', 'Emotional release', 'Toning and mantra', 'Ceremony'],
    avoid: ['Quiet introspective work — energy is too high'],
    frequencies: [
      { primary: 432, label: 'Universal harmony' },
      { primary: 528, label: 'DNA repair / transformation' },
      { primary: 210.42, label: 'Moon planetary tone' },
    ],
    instruments: ['Gong', 'Large crystal bowls', 'Drums', 'All instruments welcome'],
    colour: '#E8C97A',
  },
  // ... all 8 phases
}
```

### Zodiac Config

```typescript
const ZODIAC_CONFIGS: Record<ZodiacSign, ZodiacConfig> = {
  SCORPIO: {
    name: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    quality: 'Fixed',
    energy: 'Depth, transformation, shadow integration, catharsis',
    sessionMood: 'Go deep. This is a moon for shadow work, not comfort.',
    idealFor: ['Shadow integration', 'Trauma-release sound baths', 'Cathartic breathwork'],
    instruments: ['Gong', 'Didgeridoo', 'Low crystal bowls', 'Drum'],
    avoidInstruments: ['High-pitched bells — too light for this energy'],
    frequencyBonus: 396, // Liberation — fits Scorpio shadow work
  },
  // ... all 12 signs
}
```

### Planetary Moon Frequency

The Moon's synodic rotation period translates to **210.42 Hz** (D# / Eb) using Hans Cousto's octave method. This is a fixed number — display it prominently as the "moon frequency of the day" and suggest practitioners tune their bowls to it.

---

## Audio Layer (Optional Enhancement)

A subtle background ambient that responds to moon phase — entirely Web Audio API:

- **New Moon:** near silence, single deep subharmonic (105Hz — one octave below moon tone)
- **Waxing:** slow harmonic build, ascending intervals
- **Full Moon:** full chord, 210.42Hz with overtones, gentle gong-like decay looping
- **Waning:** gradual dissolution, harmonics drop away

Toggled by the user. Off by default — the app is primarily visual/informational.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Moon calculations | `suncalc` (MIT, no network) |
| Zodiac calculations | `astronomia` (MIT, no network) |
| 3D Moon rendering | Three.js + lunar texture (NASA public domain) |
| Particle / star field | Custom Canvas2D or `tsParticles` |
| Animation | Framer Motion + GSAP |
| Audio | Web Audio API |
| Share cards | `html2canvas` |
| PWA | `next-pwa` |
| Deployment | Vercel (static export) |

**Zero backend. Zero database. Zero API keys. Zero running costs beyond Vercel free tier.**

---

## File Structure

```
lunar-practitioner/
├── app/
│   ├── page.tsx                      # Main experience
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── MoonCanvas/
│   │   ├── MoonCanvas.tsx            # Canvas orchestrator
│   │   ├── StarField.tsx             # Procedural star field
│   │   ├── MoonOrb.tsx               # Three.js moon sphere
│   │   ├── MoonHalo.tsx              # Glow + halo layer
│   │   ├── PhaseArc.tsx              # Cycle progress arc
│   │   └── ZodiacConstellation.tsx   # Background constellation
│   ├── PhaseIdentity.tsx             # Phase name + illumination
│   ├── SessionPanel/
│   │   ├── SessionPanel.tsx
│   │   ├── PhaseCard.tsx
│   │   ├── FrequencyCard.tsx
│   │   ├── ZodiacCard.tsx
│   │   ├── MoonTimesCard.tsx
│   │   ├── LunarDistanceCard.tsx
│   │   └── PhaseCountdownCard.tsx
│   ├── LunarCalendar/
│   │   ├── LunarCalendar.tsx         # 30-day view (Pro)
│   │   ├── CalendarDay.tsx
│   │   └── DayDetailModal.tsx
│   ├── SessionCardGenerator.tsx      # Share card creator
│   └── Settings.tsx
├── hooks/
│   ├── useMoonData.ts                # Core suncalc hook, updates every minute
│   ├── useMoonZodiac.ts              # Ecliptic longitude → zodiac
│   ├── useLunarDistance.ts           # Perigee/apogee status
│   ├── useSessionIntelligence.ts     # Combines phase + zodiac → guidance
│   ├── useMoonAudio.ts               # Optional ambient audio
│   └── useGeolocation.ts             # Device location with fallback
├── lib/
│   ├── moon-calculations.ts          # suncalc wrappers + phase logic
│   ├── zodiac-calculations.ts        # astronomia wrappers
│   ├── session-intelligence.ts       # Phase + zodiac → content lookup
│   └── lunar-calendar.ts             # 30-day forecast generator
├── data/
│   ├── phases.ts                     # Phase configs (all 8)
│   ├── zodiac.ts                     # Zodiac configs (all 12)
│   ├── frequencies.ts                # Solfeggio + planetary frequencies
│   └── constellations.ts             # Star coordinates for zodiac overlays
├── public/
│   ├── moon-texture.jpg              # NASA lunar surface texture (public domain)
│   └── og-image.png
└── types/
    └── lunar.ts                      # Shared types
```

---

## Build Order for Claude Code

**Phase 1 — Data foundation (no UI)**
1. `useMoonData` hook — suncalc integration, all moon values
2. `useMoonZodiac` hook — ecliptic longitude → zodiac sign
3. `useLunarDistance` hook — perigee/apogee status
4. `useSessionIntelligence` hook — combines above into guidance content
5. Test all calculations in a raw text dump page — verify accuracy

**Phase 2 — Moon Canvas**
6. Star field (Canvas2D — establish the void)
7. Moon orb (Three.js sphere + NASA texture)
8. Terminator shader (shadow mask from phase angle)
9. Moon halo + glow (CSS/Canvas layers)
10. Phase arc + zodiac constellation overlay

**Phase 3 — Session Intelligence UI**
11. Phase Identity block
12. All 6 session panel cards
13. Panel layout, responsive grid

**Phase 4 — Features**
14. Session Card Generator
15. Lunar Calendar (30-day)
16. Settings modal
17. PWA manifest + offline support

**Phase 5 — Polish**
18. Phase transition animations
19. Audio layer
20. Loading states, error states, edge cases (polar regions, always-up moon)

---

## MVP vs Pro Tier

| Feature | Free | Pro |
|---|---|---|
| Live moon dashboard | ✅ | ✅ |
| Phase guidance | ✅ | ✅ |
| Frequency prescription | ✅ | ✅ |
| Zodiac intelligence | ✅ | ✅ |
| Moonrise / moonset | ✅ | ✅ |
| Lunar distance | ✅ | ✅ |
| Session card (watermarked) | ✅ | — |
| Session card (clean) | — | ✅ |
| 30-day lunar calendar | — | ✅ |
| Multi-location planning | — | ✅ |
| Daily 7am lunar briefing (PWA) | — | ✅ |
| Vedic / sidereal mode | — | ✅ |

---

## Key Differentiators

**No other app does this:**
- Instrument-specific suggestions (not just frequencies) — and tailored to *your* instruments
- Combines phase + zodiac + distance into a unified session recommendation
- Practitioner language throughout — this is not a consumer moon phase widget
- Session card generator for social/studio use
- 30-day planning calendar for retreat scheduling

---

*Spec version 1.0 — Ready for Claude Code implementation*
*NestorLab | Lunar Practitioner*

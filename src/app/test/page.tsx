'use client';

import { useSessionIntelligence } from '@/hooks/useSessionIntelligence';
import {
  getNextPhaseTransition,
  formatTimeUntil,
  getPhaseDirection,
  getPhaseProgress,
  getMoonDuration,
} from '@/lib/moon-calculations';

export default function TestPage() {
  const { intelligence, moonData, zodiacPosition, location, isLoading, error } =
    useSessionIntelligence();

  if (isLoading) {
    return (
      <div style={{ padding: 40, fontFamily: 'monospace', background: '#0a0a0a', color: '#ccc', minHeight: '100vh' }}>
        <h1>Lunar Practitioner — Data Verification</h1>
        <p>Loading moon data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, fontFamily: 'monospace', background: '#0a0a0a', color: '#f66', minHeight: '100vh' }}>
        <h1>Lunar Practitioner — Data Verification</h1>
        <p>Error: {error}</p>
      </div>
    );
  }

  const nextPhase = getNextPhaseTransition();
  const phaseProgress = moonData ? getPhaseProgress(moonData.phase) : 0;
  const moonDuration = moonData ? getMoonDuration(moonData.moonrise, moonData.moonset) : null;

  return (
    <div style={{ padding: 40, fontFamily: 'monospace', background: '#05050F', color: '#F0EEF8', minHeight: '100vh', lineHeight: 1.8 }}>
      <h1 style={{ color: '#E8C97A', marginBottom: 8 }}>Lunar Practitioner — Phase 1 Data Dump</h1>
      <p style={{ color: '#C8C4DC', marginBottom: 32 }}>
        All values calculated client-side. Verify against a trusted source before proceeding to Phase 2.
      </p>

      {/* ── Location ── */}
      <Section title="LOCATION">
        <Row label="Latitude" value={location.latitude.toFixed(4)} />
        <Row label="Longitude" value={location.longitude.toFixed(4)} />
        <Row label="Source" value={location.source} />
        {location.label && <Row label="Label" value={location.label} />}
      </Section>

      {/* ── Moon Phase ── */}
      {moonData && (
        <Section title="MOON PHASE">
          <Row label="Phase value (0–1)" value={moonData.phase.toFixed(6)} />
          <Row label="Phase name" value={moonData.phaseDisplayName} />
          <Row label="Phase key" value={moonData.phaseName} />
          <Row label="Direction" value={getPhaseDirection(moonData.phase)} />
          <Row label="Progress through phase" value={`${(phaseProgress * 100).toFixed(1)}%`} />
          <Row label="Illumination" value={moonData.illuminationPercent} />
          <Row label="Illumination (raw)" value={moonData.illumination.toFixed(6)} />
          <Row label="Phase angle" value={moonData.angle.toFixed(6)} />
        </Section>
      )}

      {/* ── Moon Position ── */}
      {moonData && (
        <Section title="MOON POSITION">
          <Row label="Altitude (rad)" value={moonData.altitude.toFixed(6)} />
          <Row label="Altitude (deg)" value={`${(moonData.altitude * 180 / Math.PI).toFixed(2)}°`} />
          <Row label="Azimuth (rad)" value={moonData.azimuth.toFixed(6)} />
          <Row label="Azimuth (deg)" value={`${(moonData.azimuth * 180 / Math.PI).toFixed(2)}°`} />
          <Row label="Distance (km)" value={moonData.distance.toFixed(0)} />
          <Row label="Above horizon" value={moonData.isAboveHorizon ? 'Yes' : 'No'} />
          <Row label="Always up" value={moonData.alwaysUp ? 'Yes' : 'No'} />
          <Row label="Always down" value={moonData.alwaysDown ? 'Yes' : 'No'} />
        </Section>
      )}

      {/* ── Moonrise / Moonset ── */}
      {moonData && (
        <Section title="MOONRISE / MOONSET">
          <Row label="Moonrise" value={moonData.moonrise ? moonData.moonrise.toLocaleTimeString() : 'No rise today'} />
          <Row label="Moonset" value={moonData.moonset ? moonData.moonset.toLocaleTimeString() : 'No set today'} />
          <Row label="Duration above horizon" value={moonDuration || 'N/A'} />
        </Section>
      )}

      {/* ── Lunar Distance ── */}
      {intelligence && (
        <Section title="LUNAR DISTANCE">
          <Row label="Distance" value={`${intelligence.lunarDistance.km.toLocaleString()} km`} />
          <Row label="Normalised (0=perigee, 1=apogee)" value={intelligence.lunarDistance.normalised.toFixed(4)} />
          <Row label="Status" value={intelligence.lunarDistance.label} />
          <Row label="Supermoon" value={intelligence.lunarDistance.isSupermoon ? 'YES' : 'No'} />
          <Row label="Micromoon" value={intelligence.lunarDistance.isMicromoon ? 'YES' : 'No'} />
        </Section>
      )}

      {/* ── Zodiac Position ── */}
      {zodiacPosition && (
        <Section title="ZODIAC POSITION (Astronomia)">
          <Row label="Ecliptic longitude" value={`${zodiacPosition.longitude.toFixed(4)}°`} />
          <Row label="Ecliptic latitude" value={`${zodiacPosition.latitude.toFixed(4)}°`} />
          <Row label="Zodiac sign" value={zodiacPosition.signName} />
          <Row label="Degree in sign" value={`${zodiacPosition.degreeInSign.toFixed(2)}°`} />
          <Row label="Distance (astronomia)" value={`${zodiacPosition.distance.toFixed(0)} km`} />
        </Section>
      )}

      {/* ── Zodiac Config ── */}
      {intelligence && (
        <Section title="ZODIAC INFLUENCE">
          <Row label="Sign" value={`${intelligence.zodiac.name} ${intelligence.zodiac.symbol}`} />
          <Row label="Element" value={intelligence.zodiac.element} />
          <Row label="Quality" value={intelligence.zodiac.quality} />
          <Row label="Energy" value={intelligence.zodiac.energy} />
          <Row label="Session mood" value={intelligence.zodiac.sessionMood} />
          <Row label="Ideal for" value={intelligence.zodiac.idealFor.join(' | ')} />
          <Row label="Instruments" value={intelligence.zodiac.instruments.join(', ')} />
          <Row label="Avoid" value={intelligence.zodiac.avoidInstruments.join(', ')} />
          <Row label="Frequency bonus" value={`${intelligence.zodiac.frequencyBonus}Hz — ${intelligence.zodiac.frequencyBonusLabel}`} />
        </Section>
      )}

      {/* ── Phase Config ── */}
      {intelligence && (
        <Section title="PHASE CONFIG">
          <Row label="Phase" value={intelligence.phase.name} />
          <Row label="Subtitle" value={intelligence.subtitle} />
          <Row label="Quote" value={intelligence.quote} />
          <Row label="Energy" value={intelligence.phase.energy} />
          <Row label="Ideal for" value={intelligence.phase.idealFor.join(' | ')} />
          <Row label="Avoid" value={intelligence.phase.avoid.join(' | ')} />
          <Row label="Instruments" value={intelligence.phase.instruments.join(', ')} />
          <Row label="Colour" value={intelligence.phase.colour} />
        </Section>
      )}

      {/* ── Frequency Prescription ── */}
      {intelligence && (
        <Section title="FREQUENCY PRESCRIPTION">
          {intelligence.frequencies.map((f, i) => (
            <Row key={i} label={`${f.type.toUpperCase()}`} value={`${f.hz}Hz — ${f.label}`} />
          ))}
          <Row label="Moon planetary tone" value={`${intelligence.moonTone.hz}Hz (${intelligence.moonTone.note}) — ${intelligence.moonTone.label}`} />
        </Section>
      )}

      {/* ── Combined Instruments ── */}
      {intelligence && (
        <Section title="COMBINED INSTRUMENTS (Phase + Zodiac)">
          {intelligence.instruments.map((inst, i) => (
            <Row key={i} label={`${i + 1}`} value={inst} />
          ))}
        </Section>
      )}

      {/* ── Session Guidance ── */}
      {intelligence && (
        <Section title="SESSION GUIDANCE">
          <div style={{ color: '#E8C97A', whiteSpace: 'pre-wrap', maxWidth: 700 }}>
            {intelligence.sessionGuidance}
          </div>
        </Section>
      )}

      {/* ── Next Phase ── */}
      <Section title="NEXT PHASE TRANSITION">
        <Row label="Next phase" value={nextPhase.name} />
        <Row label="Time until" value={formatTimeUntil(nextPhase.hoursUntil)} />
        <Row label="Date" value={nextPhase.date.toLocaleString()} />
      </Section>

      {/* ── Waxing / Waning ── */}
      {intelligence && (
        <Section title="CYCLE STATUS">
          <Row label="Is waxing" value={intelligence.isWaxing ? 'Yes (building toward full)' : 'No (waning toward new)'} />
        </Section>
      )}

      {/* ── Timestamp ── */}
      {moonData && (
        <Section title="TIMESTAMP">
          <Row label="Calculated at" value={moonData.timestamp.toLocaleString()} />
          <Row label="UTC" value={moonData.timestamp.toISOString()} />
          <Row label="Updates every" value="60 seconds" />
        </Section>
      )}

      <p style={{ color: '#666', marginTop: 48, fontSize: 12 }}>
        Lunar Practitioner Phase 1 — Data Foundation — NestorLab
      </p>
    </div>
  );
}

// ── Helper Components ───────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ color: '#8B7EC8', fontSize: 14, letterSpacing: 2, marginBottom: 8 }}>
        {title}
      </h2>
      <div style={{ borderLeft: '2px solid #1A1A4E', paddingLeft: 16 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 4 }}>
      <span style={{ color: '#C8C4DC', minWidth: 260, flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#F0EEF8' }}>{value}</span>
    </div>
  );
}

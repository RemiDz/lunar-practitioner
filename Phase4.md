Phase 3 is complete and cards are showing. Now proceed to 
Phase 4 — Features.

Build these three features:

1. SESSION CARD GENERATOR
- Shareable image card generated client-side using html2canvas
- Shows: moon phase name, zodiac sign + element, session guidance 
  one-liner, recommended frequencies, moonrise time, today's date
- Two export formats: Instagram square (1080×1080) and story (1080×1920)
- Trigger: a subtle share/download button bottom-right of the screen
- Style must match the Selenite & Void aesthetic — dark, beautiful, 
  NestorLab branding in corner

2. LUNAR CALENDAR (30-day view)
- Scrollable calendar showing the full lunar month ahead
- Each day shows: moon phase icon, illumination %, zodiac sign
- Highlight significant events: New Moon, Full Moon, Supermoon
- Tap any day to see full session guidance for that date in a modal
- All calculated client-side, no API needed

3. SETTINGS MODAL
- Location override (manual lat/lng or city name input)
- Instrument profile: checkboxes for user's instruments 
  (gong, monochord, crystal bowls, didgeridoo, drums, bells)
  — affects instrument suggestions in zodiac card
- Triggered by a subtle settings icon

Install html2canvas first. After completing, commit and push 
to both master AND main: git push origin master master:main
Use commit message "phase 4 - features".
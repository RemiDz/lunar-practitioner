# Fix: Square Container Visible Around Moon

## Problem

The lunar phase visualisation on lunata.app shows a visible square/rectangular container boundary around the moon graphic. This breaks the immersive dark sky aesthetic — the moon should blend seamlessly into the starfield background with no visible bounding box.

See screenshot: the moon disc has a noticeable square edge around it, likely from a parent container with a different background colour or opacity, or from a canvas/SVG element that isn't properly masked/transparent.

## What to Fix

Find the moon phase rendering component and eliminate the visible square container. The root cause is likely one of these:

1. **Background colour mismatch** — The moon's parent container has a solid or semi-transparent background that doesn't match the starfield behind it. Remove any `background`, `background-color`, or `backgroundColor` on the moon wrapper.

2. **Canvas/SVG with opaque background** — If the moon is drawn on a `<canvas>` or inside an `<svg>`, ensure the element itself is transparent and only the moon disc is rendered. For canvas, make sure you're clearing with `clearRect` not filling with a colour.

3. **Border-radius missing on container** — If the container must have a background, it needs `border-radius: 50%` and `overflow: hidden` to clip to a circle.

4. **Box shadow or border artefact** — Check for any `box-shadow`, `border`, or `outline` on the moon container or its immediate parent.

## Acceptance Criteria

- Moon disc floats naturally against the dark starfield with zero visible rectangular boundaries
- No visual regression on the phase shadow/illumination overlay
- The illumination percentage label and zodiac transit label remain properly positioned
- Works on both mobile and desktop viewports
- The "LUNAR PHASE" label and "Growing toward Full" text remain unaffected

## Testing

- Check all 8 major phases (new, waxing crescent, first quarter, waxing gibbous, full, waning gibbous, last quarter, waning crescent) to ensure the fix doesn't break any phase rendering
- Test on dark backgrounds at various screen sizes

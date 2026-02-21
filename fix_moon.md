STOP. The issue is NOT the moon component — it's the data layer. The page shows "Calculating..." which means the lunar calculation hooks are failing silently and returning no data. Nothing downstream can render without data.

Debug in this exact order:

1. Run `npm run build` and check for ANY TypeScript errors or warnings. Paste them here.

2. Run `npm run dev`, open http://localhost:3000 in Chrome, open DevTools Console (F12). Screenshot or paste EVERY error and warning you see.

3. Check the main lunar calculation hook/utility. Add console.log statements at the entry point to confirm it's being called. Log the raw output of suncalc.getMoonIllumination() and suncalc.getMoonPosition() to verify the astronomy libraries are working.

4. Check if any recent changes broke imports — a missing import, circular dependency, or renamed export will cause the entire component tree to silently fail in React.

5. DO NOT change the moon rendering approach again until the data layer is confirmed working. Fix the data first, then we'll fix the visuals.

Show me the console errors before making any code changes.
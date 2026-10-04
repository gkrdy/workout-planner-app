# Workouts (iPhone app)

Expo app that shows **today's** workout from the
[workout-planner](../workout-planner) API (`GET /api/workouts?date=`).
This is a separate project from the API (`../workout-planner`, github.com/gkrdy/workout-planner). Keep them separate.

## Where things stand (2026-10-03)

- One screen, **"Workout for Today"**, in an action-anime "battle" style (dark arena, orange energy,
  rising embers, speed lines). English text only, no pink or sakura look (the user asked for that change).
  - Mission card: day, exercises cleared, power ring (% done), exercises / total sets / ~minutes.
  - Exercise cards: tap to mark done (haptic, turns electric blue). Ticks are saved per day on the phone.
  - Rest day, loading ("Charging up…") and error ("Connection lost") states.
- Settings screen (first launch, or the gear button): server URL + API key, stored in the iPhone keychain.
- Runs in **Expo Go** on the iPhone and in the iOS simulator. Not a standalone App Store build yet.
- Tested in the simulator against a local API. Type-check and lint pass.

## Ideas for next time

- Wait for **CP3 (Supabase)** in the API first, so saved workouts survive Render sleeping.
- Possible app work: swipe between days, set-by-set tracking, rest timer, streak counter,
  app icon and splash in the new style, standalone build via EAS (needs an Apple Developer account, $99/yr).

## Run it on your iPhone (Expo Go)

1. Install **Expo Go** from the App Store and sign in (Google login works).
2. On the Mac (needs Node 22; this folder has an `.nvmrc`):

   ```bash
   cd ~/projects/workout-planner-app
   nvm use
   npm install
   npx expo start
   ```

3. In Expo Go tap **Workouts** under Development servers, or scan the QR code with the camera.
   Phone and Mac must be on the same Wi-Fi (or use `npx expo start --tunnel`).
4. First launch asks for the **server URL** (`https://workout-planner-dj04.onrender.com`, pre-filled)
   and the **API key** (Render → Environment).

The Render service must be running (not suspended). If the app says "Rest day", nothing is saved for
today: ask Claude to save a workout, then pull down to refresh.

## Run it in the simulator

`npx expo start`, then press `i`. To test against a local API instead of Render:

```bash
# in ../workout-planner
API_KEY=local-test-key .venv/bin/uvicorn app.main:app --port 8001
```

Use `http://127.0.0.1:8001` and `local-test-key` in the app's Settings. Save a workout for today
through the local connector (`POST /mcp?key=local-test-key`, tool `save_workout_plan`), or start the
API with `SEED_SAMPLE_DATA=true` for a demo week.

Port 8000 may already be taken by your own `uvicorn --reload`; that's why the test uses 8001.

## Tech

Expo SDK 57 (React Native 0.86, TypeScript). Uses only modules bundled in Expo Go:
`expo-linear-gradient`, `react-native-svg`, `expo-haptics`, `expo-secure-store`, `expo-font`
(Bebas Neue + Rajdhani from `@expo-google-fonts`), `@expo/vector-icons` (Ionicons).
Always add packages with `npx expo install`. Run `npx tsc --noEmit` and `npx expo lint` before committing.

## Files

```
App.tsx                             loads fonts, picks Settings (first launch) or Today
src/TodayScreen.tsx                 "Workout for Today": mission card, power ring, exercise cards to tick off
src/SettingsScreen.tsx              server URL + API key form
src/components/ArenaBackground.tsx  dark gradient, speed lines, rising embers
src/components/ProgressRing.tsx     animated progress ring
src/api.ts                          fetch /api/workouts?date= with the X-API-Key header
src/settings.ts                     read/write URL + key in the keychain (expo-secure-store)
src/progress.ts                     remembers ticked-off exercises per day
src/dates.ts                        date helpers
src/theme.ts                        colors, gradients, fonts
```

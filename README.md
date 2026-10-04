# Workouts (iPhone app)

Expo app that shows **today's** workout from the
[workout-planner](../workout-planner) API (`GET /api/workouts`).
This is a separate project; the API lives in `../workout-planner`.

## Run it on your iPhone (Expo Go)

1. Install **Expo Go** from the App Store.
2. On the Mac (needs Node 22; this folder has an `.nvmrc`):

   ```bash
   cd ~/projects/workout-planner-app
   nvm use
   npm install
   npx expo start
   ```

3. Scan the QR code with the iPhone camera. Phone and Mac must be on the same Wi-Fi.
4. First launch asks for the **server URL** (`https://workout-planner-dj04.onrender.com`)
   and the **API key** (Render → Environment). They're saved in the iPhone keychain.

The Render service must be running (not suspended) and have the `/api/workouts`
endpoint deployed.

## Run it in the simulator

`npx expo start --ios`. To test against a local API instead of Render:

```bash
# in ../workout-planner
SEED_SAMPLE_DATA=true API_KEY=local-test-key .venv/bin/uvicorn app.main:app --port 8001
```

then use `http://127.0.0.1:8001` and `local-test-key` in the app's Settings.

## Files

```
App.tsx                       loads fonts, picks Settings (first launch) or Today
src/TodayScreen.tsx           "Workout for Today": mission card, power ring, exercise cards to tick off
src/SettingsScreen.tsx        server URL + API key form
src/components/ArenaBackground.tsx  dark gradient, speed lines, rising embers
src/components/ProgressRing.tsx     animated progress ring
src/api.ts                    fetch /api/workouts?date= with the X-API-Key header
src/settings.ts               read/write URL + key in the keychain (expo-secure-store)
src/progress.ts               remembers ticked-off exercises per day
src/dates.ts                  date helpers
src/theme.ts                  colors, gradients, fonts
```

# Daily Challenge Mode — Design Spec

## Overview

A local-only daily challenge mode where every player gets the same level each day (seeded by date). Scores and streaks are stored in localStorage. No backend required.

---

## Level Selection Logic

Deterministic daily level based on date:

```js
function getDailyLevel() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return (dayOfYear % 15) + 1;
}
```

Same level for all players on the same day. Cycles through all 15 levels every 15 days.

---

## Store Changes

**New state fields** in `useGameStore.js`:

```js
dailyMode: false,        // Whether currently in daily challenge
dailyCompleted: false,    // Whether today's challenge is already done
dailyGrade: null,         // Today's grade result (if completed)
dailyStreak: 0,           // Current streak count
```

**New actions:**

### `loadDailyChallenge()`
1. Check localStorage for today's result (`sdsim-daily-YYYY-MM-DD`)
2. If already completed: set `dailyCompleted: true`, `dailyGrade: savedGrade`, don't load level
3. If not completed: call `loadLevel(getDailyLevel())`, set `dailyMode: true`

### `saveDailyResult(grade)`
1. Save to `localStorage` key `sdsim-daily-YYYY-MM-DD`: `{ level, grade, score: grade.overall, completedAt: Date.now() }`
2. Update streak:
   - Read `sdsim-daily-streak` from localStorage
   - If `lastDate` is yesterday: increment count
   - If `lastDate` is today: no change
   - Otherwise: reset to 1
   - Save `{ count, lastDate: today }`
3. Set `dailyCompleted: true`, `dailyGrade: grade`

### `exitDailyChallenge()`
1. Set `dailyMode: false`, `dailyCompleted: false`, `dailyGrade: null`
2. Call `loadLevel(get().unlockedLevel)` to return to normal progression

---

## Win Flow Modification

In the existing `onWin()` action:
- After grading, check if `dailyMode` is true
- If yes: call `saveDailyResult(grade)` instead of unlocking next level
- The WinScreen component checks `dailyMode` and renders differently (see below)

---

## New Components

### `DailyChallengeButton.jsx`
- Placed in HUD, next to the Levels button
- Shows a calendar icon (lucide `CalendarDays`)
- Badge showing current streak (e.g., "3" in a small circle)
- On click: opens DailyChallengeModal
- On phone (isPhone): icon only, no text

### `DailyChallengeModal.jsx`
- Overlay modal (same pattern as LevelSelect)
- Shows:
  - "Daily Challenge" header with today's date
  - Today's level name and description (from LEVEL_CONFIGS)
  - Streak counter with flame icon
  - If not completed: "Start Challenge" button
  - If completed: grade card (letter + radar chart), "Come back tomorrow" message
  - Recent history: last 7 days showing completed/missed with grades
- Close button returns to normal game

### WinScreen changes
- When `dailyMode` is true:
  - Replace "Next Level" button with "Back to Menu" (calls `exitDailyChallenge()`)
  - Show streak count with flame icon
  - Show "Daily Challenge Complete!" instead of "Mission Complete!"
  - Add "Share" text: "I scored [grade] on today's System Design challenge! Day [streak] streak"

---

## localStorage Schema

### `sdsim-daily-YYYY-MM-DD`
```json
{
  "level": 7,
  "grade": { "costScore": 85, "latencyScore": 72, "resilienceScore": 90, "complexityScore": 68, "overall": 79, "letter": "B" },
  "score": 79,
  "completedAt": 1712505600000
}
```

### `sdsim-daily-streak`
```json
{
  "count": 5,
  "lastDate": "2026-04-07"
}
```

---

## Constraints

- No level switching while in dailyMode (hide LevelSelect button, or disable it)
- No sandbox access during daily challenge
- Daily challenge uses the exact same win/fail conditions as the normal level
- Player can retry the daily challenge unlimited times until they win
- Once won, the result is locked for that day (no re-playing for a better score)
- Streak breaks if a day is missed (resets to 1 on next completion)

---

## Files Summary

**New files:**
- `src/components/DailyChallengeButton.jsx`
- `src/components/DailyChallengeModal.jsx`
- `src/engine/DailyChallenge.js` — getDailyLevel(), date helpers, localStorage read/write

**Modified files:**
- `src/store/useGameStore.js` — new state + actions
- `src/components/WinScreen.jsx` — daily variant rendering
- `src/components/HUD.jsx` — add DailyChallengeButton
- `README.md` — update features

## Out of Scope

- No backend, no global leaderboard
- No user accounts
- No social sharing (just copyable text)
- No custom daily scenarios (uses existing 15 levels)

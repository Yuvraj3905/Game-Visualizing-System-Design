# Daily Challenge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local-only daily challenge mode where all players get the same level each day, with streak tracking and localStorage persistence.

**Architecture:** New `DailyChallenge.js` engine module handles date logic and localStorage. Store gets daily mode state + 3 new actions. Two new UI components (button + modal). WinScreen modified to show daily variant.

**Tech Stack:** React 18, Zustand, lucide-react, localStorage

---

## File Structure

**New files:**
- `src/engine/DailyChallenge.js` — getDailyLevel(), loadDailyResult(), saveDailyResult(), getStreak(), getRecentHistory()
- `src/components/DailyChallengeModal.jsx` — Challenge info, start button, results, streak, history
- `src/components/DailyChallengeButton.jsx` — HUD button with streak badge

**Modified files:**
- `src/store/useGameStore.js` — daily state + actions
- `src/components/WinScreen.jsx` — daily variant
- `src/components/HUD.jsx` — add DailyChallengeButton
- `README.md` — update features

---

### Task 1: DailyChallenge Engine Module

**Files:**
- Create: `src/engine/DailyChallenge.js`

### Task 2: Store — Daily Mode State & Actions

**Files:**
- Modify: `src/store/useGameStore.js`

### Task 3: DailyChallengeModal Component

**Files:**
- Create: `src/components/DailyChallengeModal.jsx`

### Task 4: DailyChallengeButton Component

**Files:**
- Create: `src/components/DailyChallengeButton.jsx`
- Modify: `src/components/HUD.jsx`

### Task 5: WinScreen Daily Variant

**Files:**
- Modify: `src/components/WinScreen.jsx`

### Task 6: Update README

**Files:**
- Modify: `README.md`

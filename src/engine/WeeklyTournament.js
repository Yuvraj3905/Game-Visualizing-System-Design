function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - start) / 86400000);
  return Math.ceil((days + start.getDay() + 1) / 7);
}

function getWeekKey() {
  const now = new Date();
  return `${now.getFullYear()}-W${String(getWeekNumber()).padStart(2, '0')}`;
}

export function getWeeklyRounds() {
  const week = getWeekNumber();
  const year = new Date().getFullYear();
  const seed = year * 100 + week;
  // Easy: levels 1-5, Medium: levels 6-10, Hard: levels 11-15
  const easy = (seed % 5) + 1;
  const medium = ((seed * 7) % 5) + 6;
  const hard = ((seed * 13) % 5) + 11;
  return [
    { round: 1, label: 'Round 1 — Easy', level: easy, difficulty: 'Easy' },
    { round: 2, label: 'Round 2 — Medium', level: medium, difficulty: 'Medium' },
    { round: 3, label: 'Round 3 — Hard', level: hard, difficulty: 'Hard' },
  ];
}

export function getWeekDisplayString() {
  return getWeekKey();
}

export function loadWeeklyResult() {
  try {
    return JSON.parse(localStorage.getItem(`sdsim-weekly-${getWeekKey()}`)) || null;
  } catch { return null; }
}

export function saveWeeklyRoundResult(roundIndex, grade) {
  const existing = loadWeeklyResult() || { rounds: [null, null, null], totalScore: 0, completedAt: null };
  existing.rounds[roundIndex] = { grade, score: grade.overall };
  existing.totalScore = existing.rounds.reduce((sum, r) => sum + (r?.score || 0), 0);
  const allDone = existing.rounds.every(r => r !== null);
  if (allDone) existing.completedAt = Date.now();
  try {
    localStorage.setItem(`sdsim-weekly-${getWeekKey()}`, JSON.stringify(existing));
  } catch {}
  return existing;
}

export function getWeeklyHistory(weeks = 4) {
  const history = [];
  const now = new Date();
  for (let i = 0; i < weeks; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const yr = d.getFullYear();
    const start = new Date(yr, 0, 1);
    const days = Math.floor((d - start) / 86400000);
    const wk = Math.ceil((days + start.getDay() + 1) / 7);
    const key = `sdsim-weekly-${yr}-W${String(wk).padStart(2, '0')}`;
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      history.push({ week: `${yr}-W${String(wk).padStart(2, '0')}`, result: saved || null });
    } catch {
      history.push({ week: `${yr}-W${String(wk).padStart(2, '0')}`, result: null });
    }
  }
  return history;
}

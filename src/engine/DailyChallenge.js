function todayKey() {
  const d = new Date();
  return `sdsim-daily-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getDailyLevel() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return (dayOfYear % 15) + 1;
}

export function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadDailyResult() {
  try {
    const saved = JSON.parse(localStorage.getItem(todayKey()));
    return saved || null;
  } catch { return null; }
}

export function saveDailyResult(level, grade) {
  const result = {
    level,
    grade,
    score: grade.overall,
    completedAt: Date.now(),
  };
  try {
    localStorage.setItem(todayKey(), JSON.stringify(result));
  } catch { /* quota exceeded */ }
  updateStreak();
  return result;
}

export function getStreak() {
  try {
    const saved = JSON.parse(localStorage.getItem('sdsim-daily-streak'));
    if (saved && saved.count && saved.lastDate) return saved;
  } catch { /* ignore */ }
  return { count: 0, lastDate: null };
}

function updateStreak() {
  const today = getTodayDateString();
  const streak = getStreak();

  if (streak.lastDate === today) return streak;

  if (streak.lastDate === yesterdayKey()) {
    const updated = { count: streak.count + 1, lastDate: today };
    try { localStorage.setItem('sdsim-daily-streak', JSON.stringify(updated)); } catch {}
    return updated;
  }

  const reset = { count: 1, lastDate: today };
  try { localStorage.setItem('sdsim-daily-streak', JSON.stringify(reset)); } catch {}
  return reset;
}

export function getRecentHistory(days = 7) {
  const history = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `sdsim-daily-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      history.push({ date: dateStr, result: saved || null });
    } catch {
      history.push({ date: dateStr, result: null });
    }
  }
  return history;
}

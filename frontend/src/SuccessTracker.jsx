// force update

import { useState, useEffect, useMemo } from 'react';
import {
  FiTrendingUp, FiActivity, FiTarget, FiPieChart,
  FiCheckCircle, FiAward, FiBarChart2
} from 'react-icons/fi';

// ---------- HELPER FUNCTIONS (Store logic inside the file) ----------
const TASKS_KEY = 'app_tasks_db';

function loadTasks() {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function toDateKey(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekDates(reference = new Date()) {
  const d = new Date(reference);
  const dayIdx = d.getDay(); 
  const distToMon = dayIdx === 0 ? -6 : 1 - dayIdx;
  const monday = new Date(d);
  monday.setDate(d.getDate() + distToMon);
  monday.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    days.push({
      dateKey: toDateKey(cur),
      label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    });
  }
  return days;
}

// ---------- MAIN COMPONENT ----------
function SuccessTracker() {
  // 🔑 Live tasks from localStorage
  const [tasks, setTasks] = useState(() => loadTasks());

  // 🔑 Re-read whenever tasks change (same tab or other tabs)
  useEffect(() => {
    const refresh = () => setTasks(loadTasks());
    window.addEventListener('tasks:changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('tasks:changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  // ---------- REAL ANALYTICS ----------
  const analytics = useMemo(() => {
    const completed = tasks.filter((t) => t.completedAt);
    const totalCompleted = completed.length;

    const now = new Date();
    const overdue = tasks.filter(
      (t) => !t.completedAt && t.dueDate && new Date(t.dueDate) < now
    ).length;
    
    const denominator = totalCompleted + overdue;
    const globalEfficiency = denominator === 0
      ? 0
      : Math.round((totalCompleted / denominator) * 100);

    const completionDays = new Set(completed.map((t) => toDateKey(t.completedAt)));
    let activeStreak = 0;
    const cursor = new Date();
    if (!completionDays.has(toDateKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (completionDays.has(toDateKey(cursor))) {
      activeStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    const sortedDays = [...completionDays].sort();
    let highestStreak = 0;
    let run = 0;
    let prev = null;
    for (const day of sortedDays) {
      if (prev) {
        const prevDate = new Date(prev + 'T00:00:00');
        const curDate = new Date(day + 'T00:00:00');
        const diffDays = Math.round((curDate - prevDate) / (1000 * 60 * 60 * 24));
        run = diffDays === 1 ? run + 1 : 1;
      } else {
        run = 1;
      }
      highestStreak = Math.max(highestStreak, run);
      prev = day;
    }

    return { totalCompleted, activeStreak, highestStreak, globalEfficiency };
  }, [tasks]);

  // ---------- WEEKLY GRAPH (real counts) ----------
  const weeklyGraphData = useMemo(() => {
    const week = getWeekDates();
    const maxCount = Math.max(
      1,
      ...week.map((d) =>
        tasks.filter((t) => t.completedAt && toDateKey(t.completedAt) === d.dateKey).length
      )
    );

    return week.map((d) => {
      const count = tasks.filter(
        (t) => t.completedAt && toDateKey(t.completedAt) === d.dateKey
      ).length;
      const px = count === 0 ? 2 : Math.max(8, Math.round((count / maxCount) * 128));
      return {
        day: d.label,
        count,
        height: count === 0 ? 'bg-gray-200' : 'bg-indigo-500',
        pixelHeight: px,
      };
    });
  }, [tasks]);

  // ---------- CATEGORIES (real completion ratios) ----------
  const categories = useMemo(() => {
    const defs = [
      { key: 'work', name: 'Production & Work', color: 'bg-indigo-600' },
      { key: 'tech', name: 'Technical Optimization', color: 'bg-emerald-600' },
      { key: 'personal', name: 'Personal Balance & Habits', color: 'bg-orange-600' },
    ];
    return defs.map((def) => {
      const inCat = tasks.filter((t) => t.category === def.key);
      return {
        name: def.name,
        color: def.color,
        completed: inCat.filter((t) => t.completedAt).length,
        total: inCat.length,
      };
    });
  }, [tasks]);

  // ---------- MILESTONE (latest completion, real) ----------
  const latestMilestone = useMemo(() => {
    const completed = tasks
      .filter((t) => t.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    if (!completed.length) {
      return { title: 'No completed tasks yet', date: '—' };
    }
    const t = completed[0];
    const d = new Date(t.completedAt);
    return {
      title: `Completed: ${t.title}`,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  }, [tasks]);

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 space-y-6 animate-fade-in pb-12">
      {/* HEADER */}
      <div className="bg-white border border-[#e6e4de] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1e2229] flex items-center gap-2">
            <FiTrendingUp className="text-indigo-500 w-4 h-4" /> Performance Insights
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Real-time statistics extracted dynamically from your active workspace routines.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 font-bold text-xs tracking-wider font-mono">
          <FiActivity className="animate-pulse w-3.5 h-3.5" /> METRICS SYNCED
        </div>
      </div>

      {/* TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Global Efficiency', val: `${analytics.globalEfficiency}%`, sub: 'Completion vs overdue tasks', icon: FiPieChart },
          { label: 'Total Executions', val: analytics.totalCompleted, sub: 'All-time completed tasks', icon: FiCheckCircle },
          { label: 'Active Sequence', val: `${analytics.activeStreak} Days`, sub: 'Current ongoing streak', icon: FiTarget },
          { label: 'Peak Velocity', val: `${analytics.highestStreak} Days`, sub: 'Maximum consistency record', icon: FiAward },
        ].map((tile, i) => {
          const Icon = tile.icon;
          return (
            <div key={i} className="bg-white border border-[#e6e4de] p-5 rounded-2xl shadow-xs flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{tile.label}</span>
                <Icon className="w-4 h-4 text-gray-400" />
              </div>
              <div className="mt-2">
                <h4 className="text-2xl font-light font-mono text-[#1e2229]">{tile.val}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">{tile.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* GRAPH + SIDEPANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAPH */}
        <div className="lg:col-span-2 bg-white border border-[#e6e4de] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-6">
            <h4 className="text-sm font-bold text-[#1e2229] uppercase tracking-wide flex items-center gap-1.5">
              <FiBarChart2 className="text-indigo-500" /> Weekly Activity Bar Chart
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Tasks completed each day this week (Mon–Sun).</p>
          </div>

          <div className="flex items-end justify-between px-4 h-48 border-b border-[#e6e4de] pb-2 pt-4 bg-[#fbfbfa] rounded-2xl border border-dashed">
            {weeklyGraphData.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-grow group">
                <span className="text-[10px] font-mono font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {data.count}
                </span>
                <div
                  className={`w-8 rounded-t-lg transition-all duration-300 hover:opacity-80 ${data.height}`}
                  style={{ height: `${data.pixelHeight}px` }}
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEPANEL */}
        <div className="space-y-4">
          <div className="bg-white border border-[#e6e4de] rounded-3xl p-6 shadow-sm space-y-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Category Distribution</span>
            <div className="space-y-3">
              {categories.map((cat, i) => {
                const pct = cat.total === 0 ? 0 : Math.round((cat.completed / cat.total) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-medium text-gray-600">{cat.name}</span>
                      <span className="font-mono text-gray-400">{cat.completed}/{cat.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f4f2ec] rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#fbfbfa] border border-[#e6e4de] rounded-3xl p-4 text-left shadow-xs">
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase tracking-wider">Milestone</span>
            <p className="text-xs text-[#1e2229] font-medium mt-1.5">{latestMilestone.title}</p>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{latestMilestone.date}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuccessTracker;
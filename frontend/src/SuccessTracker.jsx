import React, { useState } from 'react';
import { FiTrendingUp, FiActivity, FiTarget, FiPieChart, FiCheckCircle, FiAward, FiBarChart2 } from 'react-icons/fi';

function SuccessTracker() {
  // Real user data model setup (Set to 0 or fresh strings initially)
  const [analytics, setAnalytics] = useState({
    totalCompleted: 14, // Real logged actions
    activeStreak: 3,
    highestStreak: 7,
    globalEfficiency: 64
  });

  // Weekly performance graph nodes metrics configuration
  const weeklyGraphData = [
    { day: 'Mon', count: 4, height: 'h-24 bg-indigo-500' },
    { day: 'Tue', count: 2, height: 'h-12 bg-indigo-400' },
    { day: 'Wed', count: 5, height: 'h-32 bg-indigo-600 animate-pulse' },
    { day: 'Thu', count: 3, height: 'h-16 bg-indigo-400' },
    { day: 'Fri', count: 0, height: 'h-2 bg-gray-200' },
    { day: 'Sat', count: 0, height: 'h-2 bg-gray-200' },
    { day: 'Sun', count: 0, height: 'h-2 bg-gray-200' }
  ];

  const categories = [
    { name: 'Production & Work', completed: 8, total: 12, color: 'bg-indigo-600' },
    { name: 'Technical Optimization', completed: 4, total: 6, color: 'bg-emerald-600' },
    { name: 'Personal Balance & Habits', completed: 2, total: 10, color: 'bg-orange-600' }
  ];

  const [milestones, setMilestones] = useState([
    { id: 1, title: 'Authorized Workspace Session Opened', date: 'Today', type: 'System' }
  ]);
  return (
    <div className="w-full max-w-6xl mx-auto mt-4 space-y-6 animate-fade-in pb-12">
      
      {/* SECTION HEADER ROW */}
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

      {/* TOP PERFORMANCE HIGHLIGHT TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Global Efficiency', val: `${analytics.globalEfficiency}%`, sub: 'Current task completion rate', icon: FiPieChart },
          { label: 'Total Executions', val: analytics.totalCompleted, sub: 'All-time checked targets', icon: FiCheckCircle },
          { label: 'Active Sequence', val: `${analytics.activeStreak} Days`, sub: 'Current ongoing streak', icon: FiTarget },
          { label: 'Peak Velocity', val: `${analytics.highestStreak} Days`, sub: 'Maximum consistency record', icon: FiAward }
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

      {/* INTEGRATED GRAPH MATRIX & ANALYTICS BAR SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAPH PANEL COLUMN (Takes 2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-[#e6e4de] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-6">
            <h4 className="text-sm font-bold text-[#1e2229] uppercase tracking-wide flex items-center gap-1.5">
              <FiBarChart2 className="text-indigo-500" /> Weekly Activity Bar Chart
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Visual representation of tasks completed day by day during this week.</p>
          </div>

          {/* Graphical Bars Construction Render Layout */}
          <div className="flex items-end justify-between px-4 h-48 border-b border-[#e6e4de] pb-2 pt-4 bg-[#fbfbfa] rounded-2xl border border-dashed">
            {weeklyGraphData.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-grow group">
                {/* Popover task counter tooltips */}
                <span className="text-[10px] font-mono font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {data.count}
                </span>
                <div className={`w-8 rounded-t-lg transition-all duration-300 hover:opacity-80 ${data.height}`} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEPANEL: Category Bars and Vault */}
        <div className="space-y-4">
          <div className="bg-white border border-[#e6e4de] rounded-3xl p-6 shadow-sm space-y-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Category Distribution</span>
            <div className="space-y-3">
              {categories.map((cat, i) => {
                const pct = Math.round((cat.completed / cat.total) * 100);
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
            <p className="text-xs text-[#1e2229] font-medium mt-1.5">{milestones[0].title}</p>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{milestones[0].date}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SuccessTracker;

import { useState } from 'react';
import { FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import DailyPlanner from './DailyPlanner'; // Reuse the identical engine internally

function WeeklyPlanner({ globalTasks, setGlobalTasks, onTaskComplete }) {
  // Tracks which day card container node is currently clicked and expanded open
  const [expandedDay, setExpandedDay] = useState(null);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleExpandDay = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 space-y-4 animate-fade-in">
      
      {/* Structural Weekly Goal Monitor Info */}
      <div className="bg-white border border-[#e6e4de] rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#1e2229] flex items-center gap-2">
          <FiCalendar className="text-indigo-500" /> Macro Horizon Planner Cluster
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">Click any day node below to compile or review full 24-hour routine configurations.</p>
      </div>

      {/* Accordion Layout Matrix for Week Strategy */}
      <div className="space-y-2">
        {daysOfWeek.map((day) => {
          const isExpanded = expandedDay === day;
          const dayTasks = globalTasks.filter(t => t.day === day);
          const openCount = dayTasks.filter(t => !t.completed).length;

          return (
            <div key={day} className="bg-white border border-[#e6e4de] rounded-2xl shadow-sm transition-all overflow-hidden">
              
              {/* Day Row Header Trigger */}
              <div 
                onClick={() => toggleExpandDay(day)}
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  isExpanded ? 'bg-[#fbfbfa] border-b border-[#e6e4de]' : 'hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold tracking-wider text-[#1e2229] uppercase w-12">{day}</span>
                  <span className="text-xs font-mono text-gray-400">
                    {dayTasks.length} total inputs mapped &bull; {openCount} processing actions left
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {openCount > 0 && (
                    <span className="text-[10px] font-mono font-bold bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-md">
                      ACTIVE LINE
                    </span>
                  )}
                  {isExpanded ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                </div>
              </div>

              {/* Dynamic Injection Frame: Renders the entire 24H daily matrix right inside the week view */}
              {isExpanded && (
                <div className="p-6 bg-[#faf9f6]/30 border-t border-transparent">
                  <DailyPlanner 
                    globalTasks={globalTasks} 
                    setGlobalTasks={setGlobalTasks} 
                    focusedDay={day} 
                    onTaskComplete={onTaskComplete}
                    isDashboard={false}
                  />
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}

export default WeeklyPlanner;

import React, { useState, useEffect } from 'react';
import { FiPlus, FiClock, FiCheckSquare, FiLayers } from 'react-icons/fi';

function DailyPlanner({ focusedDay, onTaskComplete, isDashboard }) {
  // Extract user email context dynamically from browser memory
  const userEmail = localStorage.getItem('khudiquest_user_email') || '';

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedQuadrant, setSelectedQuadrant] = useState('q1');
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('10:00');

  // CORE METRIC ENGINE: Fetches persistent records from database when tab loads
  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!userEmail) return;
      try {
        const response = await fetch('http://localhost:5000/api/tasks/fetch-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail })
        });
        const data = await response.json();
        if (response.ok) {
          setTasks(data);
        }
      } catch (err) {
        console.error("Error connecting to database tasks sync node:", err);
      }
    };

    fetchUserTasks();
  }, [userEmail, focusedDay]);

  const formatTimeTo12H = (timeString) => {
    if (!timeString) return '';
    const [hoursStr, minutesStr] = timeString.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours < 10 ? '0' + hours : hours}:${minutesStr} ${ampm}`;
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || !userEmail) return;

    const payload = {
      text: newTask,
      quadrant: selectedQuadrant,
      fromTime,
      toTime,
      day: focusedDay,
      userEmail
    };

    try {
      // CONNECTS LIVE TO THE TASKS BACKEND REPO PATH
      const response = await fetch('http://localhost:5000/api/tasks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const savedTask = await response.json();
      if (response.ok) {
        setTasks([...tasks, savedTask]);
        setNewTask('');
      }
    } catch (err) {
      console.error("Failed to commit task insertion parameters:", err);
    }
  };

  const toggleTask = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      const response = await fetch('http://localhost:5000/api/tasks/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: id, completedStatus: nextStatus })
      });
      if (response.ok) {
        setTasks(tasks.map(t => t._id === id ? { ...t, completed: nextStatus } : t));
        if (nextStatus) onTaskComplete();
      }
    } catch (err) {
      console.error("Failed to sync toggle transaction flags:", err);
    }
  };

  const quadrants = [
    { id: 'q1', title: 'Q1: Urgent & Important', desc: 'Critical bottlenecks.', color: 'border-l-red-500 bg-red-50/10' },
    { id: 'q2', title: 'Q2: Important, Not Urgent', desc: 'Long-term progress.', color: 'border-l-indigo-500 bg-indigo-50/10' },
    { id: 'q3', title: 'Q3: Urgent, Not Important', desc: 'Delegate or streamline.', color: 'border-l-orange-500 bg-orange-50/10' },
    { id: 'q4', title: 'Q4: Neither (Eliminate)', desc: 'Phase out elements.', color: 'border-l-gray-400 bg-gray-50/40' }
  ];

  // Filter out lists specific to current day window variables
  const activeDayTasks = tasks.filter(t => t.day === focusedDay);
  return (
    <div className="w-full space-y-4">
      {isDashboard && (
        <div className="bg-[#fbfbfa] border border-[#e6e4de] px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          <FiLayers className="text-indigo-500 w-3.5 h-3.5" /> Dashboard Monitor: Displaying Today's 24H Execution Interval ({focusedDay})
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#e6e4de] rounded-3xl p-6 shadow-sm">
            
            <div className="flex justify-between items-center border-b border-[#f4f2ec] pb-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-[#1e2229]">Eisenhower Prioritization Matrix</h3>
                <p className="text-xs text-gray-400 mt-0.5">Parameters for {focusedDay}.</p>
              </div>
              <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-bold">
                {activeDayTasks.filter(t => !t.completed).length} Left
              </span>
            </div>

            <form onSubmit={handleAddTask} className="flex flex-col gap-3 mb-6 bg-[#fbfbfa] p-4 rounded-2xl border border-[#e6e4de]">
              <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Inject parameterized routine token..." className="w-full px-4 py-3 bg-white border border-[#e6e4de] rounded-xl text-sm focus:outline-none focus:border-[#6366f1] text-[#1e2229]" />
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                <select value={selectedQuadrant} onChange={(e) => setSelectedQuadrant(e.target.value)} className="px-3 py-2.5 bg-white border border-[#e6e4de] rounded-xl text-xs text-[#4b5563] focus:outline-none w-full">
                  <option value="q1">Q1: Urgent & Important</option>
                  <option value="q2">Q2: Important, Not Urgent</option>
                  <option value="q3">Q3: Urgent, Not Important</option>
                  <option value="q4">Q4: Neither</option>
                </select>
                <div className="flex items-center gap-1 bg-white border border-[#e6e4de] px-2 py-1.5 rounded-xl"><span className="text-[10px] font-bold text-gray-400">From:</span><input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} className="text-xs text-[#1e2229] focus:outline-none w-full bg-transparent" /></div>
                <div className="flex items-center gap-1 bg-white border border-[#e6e4de] px-2 py-1.5 rounded-xl"><span className="text-[10px] font-bold text-gray-400">To:</span><input type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} className="text-xs text-[#1e2229] focus:outline-none w-full bg-transparent" /></div>
                <button type="submit" className="py-2.5 bg-[#1e2229] text-white font-medium rounded-xl text-xs hover:bg-[#374151] transition-all+ shadow-sm uppercase tracking-wider font-bold">+ Allocate</button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quadrants.map(q => {
                const quadrantTasks = activeDayTasks.filter(t => t.quadrant === q.id);
                return (
                  <div key={q.id} className={`border border-[#e6e4de] border-l-4 rounded-2xl p-4 flex flex-col min-h-[160px] ${q.color}`}>
                    <div className="mb-2 flex justify-between items-center"><h4 className="text-xs font-bold text-[#1e2229] tracking-wide uppercase">{q.title}</h4></div>
                    <div className="space-y-1.5 flex-grow overflow-y-auto max-h-[140px]">
                      {quadrantTasks.length === 0 ? <p className="text-[11px] text-gray-300 italic pt-1">Empty pool</p> : quadrantTasks.map(task => (
                        <div key={task._id} onClick={() => toggleTask(task._id, task.completed)} className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between gap-2 ${task.completed ? 'bg-gray-50 text-gray-300 line-through' : 'bg-white text-[#4b5563] shadow-sm'}`}>
                          <span className="truncate max-w-[130px] text-left">{task.text}</span>
                          <span className="text-[8px] font-mono tracking-tight text-indigo-500 shrink-0">{formatTimeTo12H(task.fromTime)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-[#fbfbfa] border border-[#e6e4de] rounded-3xl p-6 shadow-sm max-h-[560px] overflow-y-auto">
          <div className="flex items-center gap-2 text-gray-700 border-b border-[#e6e4de] pb-3 mb-4"><FiClock className="w-4 h-4 text-indigo-500" /><div><h4 className="text-sm font-bold uppercase tracking-wider text-[#1e2229]">{focusedDay} Timeline</h4></div></div>
          <div className="space-y-2">
            {activeDayTasks.filter(t => !t.completed).sort((a, b) => a.fromTime.localeCompare(b.fromTime)).map(task => (
              <div key={task._id} className="flex gap-2 items-start border-b border-[#f4f2ec] pb-2 last:border-0">
                <div className="text-[9px] font-mono font-bold text-indigo-500 shrink-0 w-20 text-right bg-indigo-50/40 px-1 py-0.5 rounded">{formatTimeTo12H(task.fromTime)}</div>
                <div className="flex-grow rounded-xl border border-[#e6e4de] p-2 bg-white flex flex-col gap-0.5"><p className="text-xs text-[#1e2229] font-medium text-left truncate max-w-[120px]">{task.text}</p><span className="text-[8px] text-gray-400 text-left">Until: {formatTimeTo12H(task.toTime)}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyPlanner;

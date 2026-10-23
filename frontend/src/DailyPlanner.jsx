import { useState, useEffect } from 'react';
import { 
  FiClock, FiLayers, FiCheck, FiTrash2, FiList, FiGrid, 
  FiTarget, FiAward, FiEdit3, FiZap, FiTrendingUp, FiRotateCcw, 
  FiPlay, FiSquare, FiActivity, FiPause
} from 'react-icons/fi';

function DailyPlanner({ focusedDay, onTaskComplete, isDashboard }) {
  const [activePlanner, setActivePlanner] = useState('todo');
  
  // 🔥 FIX: Tasks ab direct LocalStorage se load honge refresh par
  const [tasks, setTasks] = useState(() => {
    const raw = localStorage.getItem('app_tasks_db');
    return raw ? JSON.parse(raw) : [];
  });
  
  const [newTask, setNewTask] = useState('');
  
  const [selectedQuadrant, setSelectedQuadrant] = useState('q1');
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('10:00');
  const [hourlyTime, setHourlyTime] = useState('09:00');
  const [habitGoal, setHabitGoal] = useState('7');
  const [timerMins, setTimerMins] = useState('30'); 

  // 🔥 Persistent Timer States
  const [activeTimerId, setActiveTimerId] = useState(() => localStorage.getItem('active_timer_id') || null);
  const [timeLeft, setTimeLeft] = useState(() => parseInt(localStorage.getItem('active_timer_left'), 10) || 0); 
  const [isPaused, setIsPaused] = useState(() => localStorage.getItem('active_timer_paused') === 'true');

  // 🔥 Restore Timer on Page Load
  useEffect(() => {
    const savedEndTime = localStorage.getItem('active_timer_end_time');
    
    if (activeTimerId && !isPaused && savedEndTime) {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.round((parseInt(savedEndTime, 10) - now) / 1000));
      
      setTimeLeft(remaining);
      if (remaining === 0) {
        handleTimerComplete(activeTimerId);
      }
    }
  }, []); 

  // 🔥 Countdown Logic
  useEffect(() => {
    let interval = null;
    
    if (activeTimerId && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const next = prev - 1;
          localStorage.setItem('active_timer_left', next.toString());
          
          if (next <= 0) {
            clearInterval(interval);
            handleTimerComplete(activeTimerId);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimerId, isPaused, timeLeft]);

  const handleTimerComplete = (id) => {
    const task = tasks.find(t => t._id === id);
    if (task && !task.completed) {
      toggleTask(id, task.completed);
    }
    setActiveTimerId(null);
    setIsPaused(false);
    setTimeLeft(0);
    localStorage.removeItem('active_timer_id');
    localStorage.removeItem('active_timer_left');
    localStorage.removeItem('active_timer_end_time');
    localStorage.removeItem('active_timer_paused');
    
    alert("Focus session complete! Great job.");
  };

  const syncTasksToStorage = (updatedTasks) => {
    setTasks(updatedTasks);
    localStorage.setItem('app_tasks_db', JSON.stringify(updatedTasks));
    window.dispatchEvent(new CustomEvent('tasks:changed'));
  };

  const formatTimeTo12H = (timeString) => {
    if (!timeString) return '';
    const [hoursStr, minutesStr] = timeString.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours < 10 ? '0' + hours : hours}:${minutesStr} ${ampm}`;
  };

  const formatSecondsToMMSS = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    let newTaskObj = {
      _id: 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9),
      text: newTask,
      day: focusedDay,
      completed: false,
      completedAt: null,
      type: activePlanner,
    };

    if (activePlanner === 'eisenhower') {
      newTaskObj.quadrant = selectedQuadrant;
      newTaskObj.fromTime = fromTime;
      newTaskObj.toTime = toTime;
    } else if (activePlanner === 'hourly') {
      newTaskObj.fromTime = hourlyTime;
    } else if (activePlanner === 'habit') {
      newTaskObj.goal = parseInt(habitGoal, 10);
      newTaskObj.streak = 0;
      newTaskObj.history = [];
    } else if (activePlanner === 'timer') {
      newTaskObj.duration = parseInt(timerMins, 10) || 30;
    }

    const updatedTasks = [...tasks, newTaskObj];
    syncTasksToStorage(updatedTasks);
    setNewTask('');
  };

  const toggleTask = (id, currentStatus) => {
    const updatedTasks = tasks.map(t => {
      if (t._id === id) {
        const nextStatus = !currentStatus;
        
        let newStreak = t.streak || 0;
        let newHistory = t.history || [];

        if (nextStatus && t.type === 'habit') {
          newStreak += 1;
          newHistory.push(focusedDay);
        } 
        else if (!nextStatus && t.type === 'habit') {
          newStreak = Math.max(0, newStreak - 1);
          newHistory = newHistory.filter(d => d !== focusedDay);
        }

        return {
          ...t,
          completed: nextStatus,
          completedAt: nextStatus ? new Date().toISOString() : null,
          streak: newStreak,
          history: newHistory
        };
      }
      return t;
    });
    
    syncTasksToStorage(updatedTasks);
    
    if (!currentStatus) {
      const completedTask = updatedTasks.find(t => t._id === id);
      if (completedTask) onTaskComplete(completedTask);
    }
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(t => t._id !== id);
    syncTasksToStorage(updatedTasks);
  };

  const handleTimerToggle = (id, mins) => {
    if (activeTimerId === id) {
      const nextPaused = !isPaused;
      setIsPaused(nextPaused);
      localStorage.setItem('active_timer_paused', nextPaused.toString());
      
      if (!nextPaused) {
        const endTime = new Date().getTime() + (timeLeft * 1000);
        localStorage.setItem('active_timer_end_time', endTime.toString());
      }
    } else {
      const newTimeLeft = mins * 60;
      const endTime = new Date().getTime() + (newTimeLeft * 1000);
      
      setActiveTimerId(id);
      setTimeLeft(newTimeLeft);
      setIsPaused(false);
      
      localStorage.setItem('active_timer_id', id);
      localStorage.setItem('active_timer_left', newTimeLeft.toString());
      localStorage.setItem('active_timer_end_time', endTime.toString());
      localStorage.setItem('active_timer_paused', 'false');
    }
  };

  const activeDayTasks = tasks.filter(t => t.day === focusedDay && (t.type === activePlanner || (!t.type && activePlanner === 'eisenhower')));

  const totalTasks = activeDayTasks.length;
  const completedTasks = activeDayTasks.filter(t => t.completed).length;
  const progressPct = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // --- RENDER FUNCTIONS ---
  // (Inme koi tabdeeli nahi ki gayi hai, bilkul wesa hi hai)

  const renderTodo = () => (
    <div className="space-y-2 mt-4">
      {activeDayTasks.length === 0 ? <EmptyState text="Your to-do list is clear. Add a new task above." /> : activeDayTasks.map(task => (
        <StandardTaskRow key={task._id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} />
      ))}
    </div>
  );

  const renderEisenhower = () => {
    const quadrants = [
      { id: 'q1', title: 'Do First (Urgent)', color: 'border-red-200 bg-red-50/30 text-red-900' },
      { id: 'q2', title: 'Schedule (Important)', color: 'border-indigo-200 bg-indigo-50/30 text-indigo-900' },
      { id: 'q3', title: 'Delegate (Urgent)', color: 'border-orange-200 bg-orange-50/30 text-orange-900' },
      { id: 'q4', title: 'Eliminate (Neither)', color: 'border-gray-200 bg-gray-50/30 text-gray-900' }
    ];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {quadrants.map(q => {
          const qTasks = activeDayTasks.filter(t => t.quadrant === q.id);
          return (
            <div key={q.id} className={`border rounded-2xl p-4 flex flex-col min-h-[150px] ${q.color}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3">{q.title}</h4>
              <div className="space-y-2 flex-grow">
                {qTasks.length === 0 ? <p className="text-xs opacity-50 italic">Empty</p> : qTasks.map(task => (
                  <div key={task._id} className={`p-2 rounded-lg border text-sm flex items-center justify-between gap-2 ${task.completed ? 'bg-white/50 text-gray-400 line-through' : 'bg-white text-gray-800 shadow-sm'}`}>
                    <div className="flex items-center gap-2 flex-grow overflow-hidden">
                      <button onClick={() => toggleTask(task._id, task.completed)} className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-transparent'}`}><FiCheck className="w-3 h-3" /></button>
                      <span className="truncate">{task.text}</span>
                    </div>
                    <button onClick={() => deleteTask(task._id)} className="text-gray-300 hover:text-red-500"><FiTrash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderHourly = () => {
    const sortedTasks = [...activeDayTasks].sort((a, b) => (a.fromTime || '').localeCompare(b.fromTime || ''));
    return (
      <div className="space-y-3 mt-4 border-l-2 border-indigo-100 ml-3 pl-4">
        {sortedTasks.length === 0 ? <EmptyState text="No schedule set for today." /> : sortedTasks.map(task => (
          <div key={task._id} className="relative">
            <div className="absolute -left-[21px] top-3 w-3 h-3 rounded-full bg-indigo-400 border-2 border-white"></div>
            <div className="text-[10px] font-bold text-indigo-500 mb-1">{formatTimeTo12H(task.fromTime)}</div>
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${task.completed ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-white border-[#e6e4de] shadow-sm'}`}>
               <div className="flex items-center gap-3">
                 <button onClick={() => toggleTask(task._id, task.completed)} className={`w-4 h-4 rounded flex items-center justify-center border ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-transparent'}`}><FiCheck className="w-3 h-3" /></button>
                 <span className={`text-sm ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
               </div>
               <button onClick={() => deleteTask(task._id)} className="text-gray-300 hover:text-red-500"><FiTrash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHabit = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {activeDayTasks.length === 0 ? (
          <div className="col-span-2 text-center py-10 bg-[#fbfbfa] rounded-2xl border border-dashed border-[#e6e4de]">
            <FiTarget className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">No habits created yet.</p>
          </div>
        ) : (
          activeDayTasks.map((task) => {
            const streak = task.streak || 0; 
            const isDoneToday = task.completed;
            const targetDays = task.goal || 7; 
            
            const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
            const displayDays = dayLetters.slice(0, targetDays > 7 ? 7 : targetDays); 
            
            return (
              <div key={task._id} className="bg-white border border-[#e6e4de] rounded-3xl p-5 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${isDoneToday ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500'}`}>
                      <FiTrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-base font-semibold ${isDoneToday ? 'text-gray-400 line-through' : 'text-[#1e2229]'}`}>
                        {task.text}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">Target: {targetDays} Days</p>
                    </div>
                  </div>
                  <button onClick={() => deleteTask(task._id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between items-center gap-1 mb-4">
                  {displayDays.map((day, i) => {
                    const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                    const isChecked = isToday && isDoneToday;
                    
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-gray-400">{day}</span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isChecked ? 'bg-emerald-500 text-white shadow-sm' : 
                          isToday ? 'border-2 border-indigo-400 text-indigo-400' : 
                          'bg-gray-50 text-gray-300'
                        }`}>
                          {isChecked ? <FiCheck className="w-3 h-3" /> : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#f4f2ec]">
                  <div className="flex items-center gap-1.5 text-gray-600 font-semibold text-xs bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                    <FiActivity className="text-indigo-500 w-3.5 h-3.5" /> {streak} Day Streak
                  </div>
                  
                  <button 
                    onClick={() => toggleTask(task._id, task.completed)} 
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isDoneToday 
                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
                        : 'bg-[#1e2229] text-white hover:bg-[#374151] shadow-sm'
                    }`}
                  >
                    {isDoneToday ? (
                      <><FiRotateCcw className="w-3.5 h-3.5" /> Undo</>
                    ) : 'Check In'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderTimer = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {activeDayTasks.length === 0 ? <div className="col-span-2"><EmptyState text="No focus sessions set for today." /></div> : activeDayTasks.map(task => {
        const isActive = activeTimerId === task._id;
        const totalSecs = task.duration * 60;
        
        const displayTime = isActive ? formatSecondsToMMSS(timeLeft) : `${task.duration}:00`;
        
        return (
          <div key={task._id} className={`border p-5 rounded-3xl shadow-sm flex flex-col justify-between transition-all ${task.completed ? 'bg-gray-50 border-gray-200' : isActive ? 'bg-indigo-900 border-indigo-900 text-white shadow-lg scale-[1.02]' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'}`}>
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${task.completed ? 'bg-gray-200 text-gray-500' : isActive ? 'bg-indigo-800 text-indigo-300' : 'bg-indigo-500 text-white'}`}>
                  <FiZap className="w-5 h-5" />
                </div>
                <span className={`text-base font-semibold ${task.completed ? 'text-gray-500 line-through' : isActive ? 'text-white' : 'text-indigo-900'}`}>
                  {task.text}
                </span>
              </div>
              <button onClick={() => deleteTask(task._id)} className={`hover:text-red-500 ${isActive ? 'text-indigo-400' : 'text-gray-300'}`}><FiTrash2 className="w-4 h-4" /></button>
            </div>

            <div className="flex items-end justify-between mt-4">
              <div className={`text-4xl font-light font-mono tracking-tight ${isActive ? 'text-white' : 'text-indigo-600'}`}>
                {displayTime}
              </div>
              
              <div className="flex gap-2">
                {!task.completed && (
                  <button 
                    onClick={() => handleTimerToggle(task._id, task.duration)} 
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      isActive 
                        ? 'bg-white text-indigo-900 hover:bg-gray-100' 
                        : 'bg-[#1e2229] text-white hover:bg-[#374151] shadow-md'
                    }`}
                  >
                    {isActive ? (
                      isPaused ? <><FiPlay className="w-4 h-4" /> Resume</> : <><FiPause className="w-4 h-4" /> Pause</>
                    ) : (
                      <><FiPlay className="w-4 h-4" /> Start Focus</>
                    )}
                  </button>
                )}
                
                {task.completed && (
                  <button 
                    onClick={() => toggleTask(task._id, task.completed)} 
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all flex items-center gap-1"
                  >
                    <FiRotateCcw className="w-4 h-4" /> Undo
                  </button>
                )}
              </div>
            </div>
            
            {isActive && (
               <div className="w-full bg-indigo-800 h-1.5 mt-4 rounded-full overflow-hidden">
                 <div className="h-full bg-white transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / totalSecs) * 100}%` }} />
               </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderNotes = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
      {activeDayTasks.length === 0 ? <div className="col-span-3"><EmptyState text="No notes written yet." /></div> : activeDayTasks.map(task => (
        <div key={task._id} className="bg-[#fffdf5] border border-[#f0ebd5] p-4 rounded-xl shadow-sm relative group">
          <p className="text-sm text-[#4a4735] whitespace-pre-wrap">{task.text}</p>
          <button onClick={() => deleteTask(task._id)} className="absolute top-2 right-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );

  const EmptyState = ({ text }) => (
    <div className="text-center py-8 bg-[#fbfbfa] rounded-2xl border border-dashed border-[#e6e4de]">
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );

  const StandardTaskRow = ({ task, toggleTask, deleteTask }) => (
    <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${task.completed ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-white text-[#1e2229] shadow-sm border-[#e6e4de]'}`}>
      <div className="flex items-center gap-3 flex-grow overflow-hidden">
        <button onClick={() => toggleTask(task._id, task.completed)} className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 hover:border-emerald-500 text-transparent'}`}><FiCheck className="w-3.5 h-3.5" /></button>
        <span className={`text-sm ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
      </div>
      <button onClick={() => deleteTask(task._id)} className="text-gray-300 hover:text-red-500 p-1"><FiTrash2 className="w-4 h-4" /></button>
    </div>
  );

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <div className="bg-white border border-[#e6e4de] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/3">
          <h2 className="text-xl font-bold text-[#1e2229] flex items-center gap-2">
            <FiAward className="text-indigo-500" /> Daily Master Plan
          </h2>
          <p className="text-xs text-gray-400 mt-1">Stay focused and get things done.</p>
        </div>
        
        <div className="w-full md:w-2/3">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-gray-500">Daily Progress</span>
            <span className="text-indigo-600">{progressPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-right">
            {progressPct === 100 ? "All tasks completed." : 
             progressPct > 50 ? "More than halfway there." : 
             "Ready to begin."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-[#f4f2ec] p-1.5 rounded-2xl border border-[#e6e4de] overflow-x-auto">
        {[
          { id: 'todo', label: 'To-Do', icon: FiList, color: 'text-blue-500' },
          { id: 'eisenhower', label: 'Priority', icon: FiGrid, color: 'text-red-500' },
          { id: 'hourly', label: 'Schedule', icon: FiClock, color: 'text-orange-500' },
          { id: 'habit', label: 'Habits', icon: FiTrendingUp, color: 'text-purple-500' },
          { id: 'timer', label: 'Focus', icon: FiZap, color: 'text-yellow-500' },
          { id: 'notes', label: 'Notes', icon: FiEdit3, color: 'text-emerald-500' }
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setActivePlanner(p.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activePlanner === p.id ? 'bg-white text-[#1e2229] shadow-sm' : 'text-gray-500 hover:text-[#1e2229]'}`}
          >
            <p.icon className={`${activePlanner === p.id ? p.color : ''} w-4 h-4`} /> {p.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e6e4de] rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleAddTask} className="flex flex-col gap-3">
          <div className="flex gap-2">
            {activePlanner === 'notes' ? (
              <textarea 
                value={newTask} onChange={(e) => setNewTask(e.target.value)} 
                placeholder="Write down your thoughts, ideas, or brain dump here..." 
                className="w-full px-4 py-3 bg-[#fbfbfa] border border-[#e6e4de] rounded-xl text-sm focus:outline-none focus:border-indigo-500 min-h-[80px]"
              />
            ) : (
              <input 
                type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} 
                placeholder={
                  activePlanner === 'todo' ? "Add a new task..." :
                  activePlanner === 'eisenhower' ? "What needs to be done?" :
                  activePlanner === 'hourly' ? "What are you doing at this time?" :
                  activePlanner === 'habit' ? "E.g., Drink 2L Water, Read 10 pages..." :
                  "What do you want to focus on?"
                } 
                className="w-full px-4 py-3 bg-[#fbfbfa] border border-[#e6e4de] rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              
              {activePlanner === 'eisenhower' && (
                <>
                  <select value={selectedQuadrant} onChange={(e) => setSelectedQuadrant(e.target.value)} className="px-3 py-2 bg-[#fbfbfa] border border-[#e6e4de] rounded-xl text-xs font-medium focus:outline-none">
                    <option value="q1">Urgent & Important</option>
                    <option value="q2">Important, Not Urgent</option>
                    <option value="q3">Urgent, Not Important</option>
                    <option value="q4">Neither</option>
                  </select>
                  <input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} className="px-3 py-2 bg-[#fbfbfa] border border-[#e6e4de] rounded-xl text-xs" />
                  <input type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} className="px-3 py-2 bg-[#fbfbfa] border border-[#e6e4de] rounded-xl text-xs" />
                </>
              )}

              {activePlanner === 'hourly' && (
                <input type="time" value={hourlyTime} onChange={(e) => setHourlyTime(e.target.value)} className="px-3 py-2 bg-[#fbfbfa] border border-[#e6e4de] rounded-xl text-xs font-mono" />
              )}

              {activePlanner === 'habit' && (
                <div className="flex items-center gap-2 bg-[#fbfbfa] border border-[#e6e4de] px-3 py-2 rounded-xl">
                  <span className="text-xs text-gray-500 font-bold">Target:</span>
                  <input type="number" min="1" max="30" value={habitGoal} onChange={(e) => setHabitGoal(e.target.value)} className="w-12 bg-transparent text-xs font-mono focus:outline-none" />
                  <span className="text-xs text-gray-500">days</span>
                </div>
              )}

              {activePlanner === 'timer' && (
                <div className="flex items-center gap-2 bg-[#fbfbfa] border border-[#e6e4de] px-3 py-2 rounded-xl">
                  <span className="text-xs text-gray-500 font-bold">Timer:</span>
                  <input type="number" min="1" value={timerMins} onChange={(e) => setTimerMins(e.target.value)} className="w-12 bg-transparent text-xs font-mono focus:outline-none" />
                  <span className="text-xs text-gray-500">mins</span>
                </div>
              )}
            </div>

            <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-[#1e2229] text-white font-semibold rounded-xl text-sm hover:bg-[#374151] transition-all shadow-sm flex items-center justify-center gap-2">
              <FiTarget className="w-4 h-4" /> {activePlanner === 'notes' ? 'Save Note' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-[#e6e4de] rounded-3xl p-6 shadow-sm min-h-[300px]">
        {activePlanner === 'todo' && renderTodo()}
        {activePlanner === 'eisenhower' && renderEisenhower()}
        {activePlanner === 'hourly' && renderHourly()}
        {activePlanner === 'habit' && renderHabit()}
        {activePlanner === 'timer' && renderTimer()}
        {activePlanner === 'notes' && renderNotes()}
      </div>

    </div>
  );
}

export default DailyPlanner;
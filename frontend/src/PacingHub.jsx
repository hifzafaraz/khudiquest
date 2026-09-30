import React, { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiRotateCcw, FiMaximize2, FiMinimize2, FiClock } from 'react-icons/fi';

function PacingHub({ secondsLeft, setSecondsLeft, isTimerRunning, setIsTimerRunning, activeMode, setActiveMode }) {
  // Customizable time duration states (Defaults are standard, editable by user)
  const [studyTime, setStudyTime] = useState(25);
  const [workoutTime, setWorkoutTime] = useState(45);
  const [restTime, setRestTime] = useState(15);
  const [customTime, setCustomTime] = useState(10);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  // Get active interval display labels
  const getModeLabel = () => {
    switch (activeMode) {
      case 'study': return 'Study Session';
      case 'workout': return 'Workout Interval';
      case 'rest': return 'Decompression Rest';
      case 'custom': return 'Custom Sprint';
      default: return 'Timer Active';
    }
  };

  useEffect(() => {
    if (secondsLeft === 0 && isTimerRunning) {
      setSessionCount(prev => prev + 1);
      setIsTimerRunning(false);
    }
  }, [secondsLeft, isTimerRunning]);

  // Instantly load the dynamic duration configured by the user inputs
  const triggerModeValue = (modeKey) => {
    setActiveMode(modeKey);
    setIsTimerRunning(false);
    
    let targetMins = 25;
    if (modeKey === 'study') targetMins = studyTime;
    if (modeKey === 'workout') targetMins = workoutTime;
    if (modeKey === 'rest') targetMins = restTime;
    if (modeKey === 'custom') targetMins = customTime;

    setSecondsLeft(targetMins * 60);
  };

  const formatTimerDigits = (totalSeconds) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
  };
  return (
    <div className={`w-full max-w-6xl mx-auto mt-4 transition-all duration-300 ${isFullScreen ? 'fixed inset-0 bg-[#faf9f6] z-50 p-6 flex flex-col items-center justify-center' : 'grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in'}`}>
      
      {/* LEFT COLUMN: The Large Digital Counter Face Box */}
      <div className={`${isFullScreen ? 'w-full max-w-2xl' : 'lg:col-span-2'} space-y-4`}>
        <div className="bg-white border border-[#e6e4de] rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[380px] relative">
          
          <span className="text-xs font-bold tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase mb-4">
            {getModeLabel()} Mode
          </span>

          <h2 className="text-7xl sm:text-8xl font-light tracking-tight text-[#1e2229] font-mono my-4">
            {formatTimerDigits(secondsLeft)}
          </h2>

          <div className="flex items-center gap-3 w-full max-w-sm mt-4">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex-grow flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-semibold rounded-xl transition-all shadow-sm ${
                isTimerRunning ? 'bg-orange-500 text-white' : 'bg-[#1e2229] text-white hover:bg-[#374151]'
              }`}
            >
              {isTimerRunning ? <><FiPause className="w-4 h-4" /> Pause</> : <><FiPlay className="w-4 h-4" /> Start Timer</>}
            </button>
            
            <button
              onClick={() => { setIsTimerRunning(false); triggerModeValue(activeMode); }}
              className="p-3.5 border border-[#e6e4de] bg-[#fbfbfa] text-gray-400 hover:text-red-500 rounded-xl transition-all"
              title="Reset current mode time configuration"
            >
              <FiRotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* ZOOM TO FULL SCREEN BUTTON */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-[#1e2229] hover:bg-gray-100 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium"
          >
            {isFullScreen ? <><FiMinimize2 className="w-4 h-4" /> Exit Full Screen</> : <><FiMaximize2 className="w-4 h-4" /> Full Screen Mode</>}
          </button>
        </div>

        {/* CUSTOM TIME CHANGER RIG (Only visible when not zoomed) */}
        {!isFullScreen && (
          <div className="bg-white border border-[#e6e4de] rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-[#1e2229] mb-4 flex items-center gap-1.5">
              <FiClock className="text-indigo-500" /> Customize Individual Mode Time Parameters
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <div className="bg-[#fbfbfa] border border-[#e6e4de] p-3 rounded-xl flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Study Mins:</span>
                <input type="number" min="1" value={studyTime} onChange={(e) => setStudyTime(parseInt(e.target.value) || 1)} className="w-full bg-transparent text-sm font-bold text-[#1e2229] focus:outline-none mt-1 border-b border-gray-200 pb-1" />
              </div>

              <div className="bg-[#fbfbfa] border border-[#e6e4de] p-3 rounded-xl flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Workout Mins:</span>
                <input type="number" min="1" value={workoutTime} onChange={(e) => setWorkoutTime(parseInt(e.target.value) || 1)} className="w-full bg-transparent text-sm font-bold text-[#1e2229] focus:outline-none mt-1 border-b border-gray-200 pb-1" />
              </div>

              <div className="bg-[#fbfbfa] border border-[#e6e4de] p-3 rounded-xl flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Rest Mins:</span>
                <input type="number" min="1" value={restTime} onChange={(e) => setRestTime(parseInt(e.target.value) || 1)} className="w-full bg-transparent text-sm font-bold text-[#1e2229] focus:outline-none mt-1 border-b border-gray-200 pb-1" />
              </div>

              <div className="bg-[#fbfbfa] border border-[#e6e4de] p-3 rounded-xl flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Custom Mins:</span>
                <input type="number" min="1" value={customTime} onChange={(e) => setCustomTime(parseInt(e.target.value) || 1)} className="w-full bg-transparent text-sm font-bold text-[#1e2229] focus:outline-none mt-1 border-b border-gray-200 pb-1" />
              </div>

            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Mode Selector Buttons & Stats Counter */}
      {!isFullScreen && (
        <div className="space-y-4">
          <div className="bg-[#fbfbfa] border border-[#e6e4de] rounded-3xl p-5 shadow-sm space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Switch Target Routine</h4>
            <div className="flex flex-col gap-2">
              
              <button onClick={() => triggerModeValue('study')} className={`w-full py-3 px-4 rounded-xl border-l-4 text-left text-xs bg-white flex justify-between items-center transition-all ${activeMode === 'study' ? 'border-indigo-500 font-bold shadow-sm' : 'border-gray-200 text-gray-600'}`}>
                <span>Study Pomodoro</span>
                <span className="font-mono text-gray-400">{studyTime}m</span>
              </button>

              <button onClick={() => triggerModeValue('workout')} className={`w-full py-3 px-4 rounded-xl border-l-4 text-left text-xs bg-white flex justify-between items-center transition-all ${activeMode === 'workout' ? 'border-emerald-500 font-bold shadow-sm' : 'border-gray-200 text-gray-600'}`}>
                <span>Workout Interval</span>
                <span className="font-mono text-gray-400">{workoutTime}m</span>
              </button>

              <button onClick={() => triggerModeValue('rest')} className={`w-full py-3 px-4 rounded-xl border-l-4 text-left text-xs bg-white flex justify-between items-center transition-all ${activeMode === 'rest' ? 'border-orange-500 font-bold shadow-sm' : 'border-gray-200 text-gray-600'}`}>
                <span>Break / Rest Loop</span>
                <span className="font-mono text-gray-400">{restTime}m</span>
              </button>

              <button onClick={() => triggerModeValue('custom')} className={`w-full py-3 px-4 rounded-xl border-l-4 text-left text-xs bg-white flex justify-between items-center transition-all ${activeMode === 'custom' ? 'border-gray-400 font-bold shadow-sm' : 'border-gray-200 text-gray-600'}`}>
                <span>Custom Pipeline</span>
                <span className="font-mono text-gray-400">{customTime}m</span>
              </button>

            </div>
          </div>

          <div className="bg-white border border-[#e6e4de] rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏆</span>
              <div>
                <h5 className="text-[10px] font-bold text-gray-400 uppercase">Sessions Completed</h5>
                <p className="text-xs text-[#1e2229] font-medium">Daily consistency points</p>
              </div>
            </div>
            <span className="text-xl font-mono bg-[#f4f2ec] px-3.5 py-1 rounded-xl text-[#1e2229] border border-[#e6e4de] font-bold">
              {sessionCount}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}

export default PacingHub;

import { useState, useRef, useCallback } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { FiPlus, FiClock, FiTrash2 } from 'react-icons/fi';

function InfiniteCanvas() {
  const [canvasStyle, setCanvasStyle] = useState('grid');
  const [saveStatus, setSaveStatus] = useState('Workspace active');
  const [canvasInstanceKey, setCanvasInstanceKey] = useState('initial-key');

  // 🔑 Hold reference to tldraw editor instance
  const editorRef = useRef(null);

  const getCurrentWeekDays = () => {
    const current = new Date();
    const dayIndex = current.getDay();
    const distanceToMon = dayIndex === 0 ? -6 : 1 - dayIndex;
    const mondayDate = new Date(current.setDate(current.getDate() + distanceToMon));
    const weekSlots = [];
    const daysLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(mondayDate);
      targetDate.setDate(mondayDate.getDate() + i);
      const isoString = targetDate.toISOString().split('T')[0];
      weekSlots.push({ dayName: daysLabel[i], dateStr: isoString });
    }
    return weekSlots;
  };

  const weekDays = getCurrentWeekDays();
  const [selectedDayObj, setSelectedDayObj] = useState(
    weekDays[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  );

  const [savedJournals, setSavedJournals] = useState(() => {
    const cachedData = localStorage.getItem('mindful_canvas_journal_db');
    return cachedData ? JSON.parse(cachedData) : {};
  });

  const getStyleClass = () => {
    switch (canvasStyle) {
      case 'grid': return 'bg-[linear-gradient(to_right,#e6e4de_1px,transparent_1px),linear-gradient(to_bottom,#e6e4de_1px,transparent_1px)] [background-size:24px_24px] bg-white';
      case 'dots': return 'bg-[radial-gradient(#d1cfc7_1.5px,transparent_1.5px)] [background-size:20px_20px] bg-white';
      case 'lines': return 'bg-[linear-gradient(to_bottom,#e6e4de_1px,transparent_1px)] [background-size:100%_28px] bg-[#faf9f6]';
      case 'plain': default: return 'bg-[#faf9f6]';
    }
  };

  // 🔑 Capture the editor when tldraw mounts
  const handleMount = useCallback((editor) => {
    editorRef.current = editor;

    // If there's saved data for the currently selected day, load it in
    const saved = savedJournals[selectedDayObj.dateStr];
    if (saved?.snapshot) {
      try {
        editor.loadSnapshot(saved.snapshot);
      } catch (e) {
        console.warn('Failed to load snapshot', e);
      }
    }
  }, [savedJournals, selectedDayObj]);

  // 🔑 Save ACTUAL canvas contents + timestamp
  const handleSaveEntry = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const timestampString = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Serialize the full document (shapes, bindings, assets, etc.)
    const snapshot = editor.getSnapshot();

    const updatedDatabase = {
      ...savedJournals,
      [selectedDayObj.dateStr]: {
        hasData: true,
        savedTime: timestampString,
        snapshot, // 👈 the important part
      },
    };

    setSavedJournals(updatedDatabase);
    try {
      localStorage.setItem('mindful_canvas_journal_db', JSON.stringify(updatedDatabase));
      setSaveStatus(`Saved & archived to ${selectedDayObj.dayName} pipeline`);
    } catch (e) {
      setSaveStatus('Save failed — storage quota may be full');
    }
  };

  const handleDeleteEntry = () => {
    const updatedDatabase = { ...savedJournals };
    delete updatedDatabase[selectedDayObj.dateStr];

    setSavedJournals(updatedDatabase);
    localStorage.setItem('mindful_canvas_journal_db', JSON.stringify(updatedDatabase));

    // Wipe the canvas clean
    const editor = editorRef.current;
    if (editor) {
      const ids = Array.from(editor.getCurrentPageShapeIds());
      if (ids.length) editor.deleteShapes(ids);
    }

    setSaveStatus(`Purged log record for ${selectedDayObj.dateStr}`);
  };

  // 🔑 Switch day -> load its saved snapshot into the SAME editor instance
  const handleSelectDay = (day) => {
    const editor = editorRef.current;
    setSelectedDayObj(day);
    setSaveStatus(`Switched viewport context to ${day.dayName}`);

    if (!editor) return;

    const saved = savedJournals[day.dateStr];
    try {
      if (saved?.snapshot) {
        editor.loadSnapshot(saved.snapshot);
      } else {
        // Blank slate: clear all shapes on current page
        const ids = Array.from(editor.getCurrentPageShapeIds());
        if (ids.length) editor.deleteShapes(ids);
      }
    } catch (e) {
      console.warn('Failed to restore snapshot', e);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 animate-fade-in flex flex-col h-[78vh] space-y-3">
      {/* HEADER */}
      <div className="bg-white border border-[#e6e4de] rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#1e2229]">
            Active Slot: {selectedDayObj.dayName} &bull;{' '}
            <span className="text-gray-400 font-mono font-normal">{selectedDayObj.dateStr}</span>
          </span>
          <span className="text-[10px] text-gray-400 font-mono hidden md:inline">&bull; {saveStatus}</span>
        </div>

        <div className="flex bg-[#f4f2ec] p-0.5 rounded-xl border border-[#e6e4de] overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'plain', label: 'Plain' },
            { id: 'grid', label: 'Grid' },
            { id: 'dots', label: 'Dots' },
            { id: 'lines', label: 'Lines' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setCanvasStyle(opt.id)}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                canvasStyle === opt.id
                  ? 'bg-white text-[#1e2229] shadow-xs font-extrabold'
                  : 'text-gray-500 hover:text-[#1e2229]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={handleSaveEntry}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1e2229] hover:bg-[#374151] text-white text-xs font-semibold rounded-xl shadow-xs transition-all w-full sm:w-auto justify-center"
          >
            <FiPlus className="w-3.5 h-3.5" /> Save Entry
          </button>
          {savedJournals[selectedDayObj.dateStr]?.hasData && (
            <button
              onClick={handleDeleteEntry}
              className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Wipe day instance clean"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* CANVAS */}
      <div className="flex-grow w-full relative border border-[#e6e4de] rounded-3xl shadow-xl shadow-gray-100/40 overflow-hidden min-h-[400px]">
        <div className={`absolute inset-0 transition-all duration-300 pointer-events-none opacity-50 z-0 ${getStyleClass()}`} />
        <div className="absolute inset-0 z-10 mix-blend-multiply">
          <Tldraw
            key={canvasInstanceKey}
            inferDarkMode={false}
            className="w-full h-full"
            onMount={handleMount}
          />
        </div>
      </div>

      {/* WEEKLY TIMELINE */}
      <div className="bg-white border border-[#e6e4de] p-3 rounded-2xl shadow-xs shrink-0">
        <div className="flex items-center gap-1.5 mb-2 pl-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <FiClock className="w-3 h-3 text-indigo-500" /> Weekly Archive Grid Node Timeline
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const isCurrentFocusedNode = selectedDayObj.dateStr === day.dateStr;
            const logMetaData = savedJournals[day.dateStr];

            return (
              <button
                key={day.dateStr}
                onClick={() => handleSelectDay(day)}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[64px] ${
                  isCurrentFocusedNode
                    ? 'border-[#1e2229] bg-[#fbfbfa] shadow-sm font-semibold'
                    : 'border-[#e6e4de] bg-white hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-[#1e2229] uppercase">{day.dayName}</span>
                  <span className="text-[9px] font-mono font-bold text-gray-300">
                    {day.dateStr.split('-')[2]}
                  </span>
                </div>

                {logMetaData?.hasData ? (
                  <div className="text-[9px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded mt-1 flex items-center justify-between w-full">
                    <span className="truncate">Saved</span>
                    <span className="font-mono text-[8px] font-bold text-emerald-500 shrink-0">
                      {logMetaData.savedTime}
                    </span>
                  </div>
                ) : (
                  <span className="text-[9px] text-gray-300 italic mt-2 font-normal">Blank Slate</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default InfiniteCanvas;
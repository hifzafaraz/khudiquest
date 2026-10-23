import React, { useState, useRef, useEffect, memo } from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { FiPlus, FiClock, FiTrash2, FiMaximize2, FiMinimize2, FiFileText } from 'react-icons/fi';

const InfiniteCanvas = memo(function InfiniteCanvas() {
  const [canvasStyle, setCanvasStyle] = useState('grid');
  const [saveStatus, setSaveStatus] = useState('Workspace active');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const excalidrawRef = useRef(null);
  const [initialData, setInitialData] = useState(null);

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

  const savedJournalsRef = useRef(savedJournals);
  const selectedDayRef = useRef(selectedDayObj);
  useEffect(() => { savedJournalsRef.current = savedJournals; }, [savedJournals]);
  useEffect(() => { selectedDayRef.current = selectedDayObj; }, [selectedDayObj]);

  useEffect(() => {
    const saved = savedJournalsRef.current?.[selectedDayRef.current?.dateStr];
    if (saved?.snapshot) {
      setInitialData({
        elements: saved.snapshot.elements || [],
        appState: { ...saved.snapshot.appState, viewBackgroundColor: "transparent" },
        files: saved.snapshot.files || {}
      });
    } else {
      setInitialData({ elements: [], appState: { viewBackgroundColor: "transparent" }, files: {} });
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setIsFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSaveEntry = () => {
    if (!excalidrawRef.current) return;
    const timestampString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const elements = excalidrawRef.current.getSceneElements();
    const appState = excalidrawRef.current.getAppState();
    const files = excalidrawRef.current.getFiles();

    const updatedDatabase = {
      ...savedJournals,
      [selectedDayObj.dateStr]: {
        hasData: true,
        savedTime: timestampString,
        snapshot: { elements, appState, files },
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
    if (excalidrawRef.current) excalidrawRef.current.updateScene({ elements: [] });
    setSaveStatus(`Purged log record for ${selectedDayObj.dateStr}`);
  };

  const handleSelectDay = (day) => {
    setSelectedDayObj(day);
    setSaveStatus(`Switched viewport context to ${day.dayName}`);
    const saved = savedJournals[day.dateStr];
    if (excalidrawRef.current) {
      if (saved?.snapshot) {
        excalidrawRef.current.updateScene({
          elements: saved.snapshot.elements || [],
          appState: { ...saved.snapshot.appState, viewBackgroundColor: "transparent" },
        });
      } else {
        excalidrawRef.current.updateScene({ elements: [], appState: { viewBackgroundColor: "transparent" } });
      }
    }
  };

  const addStickyNote = () => {
    if (!excalidrawRef.current) return;
    const api = excalidrawRef.current;
    const now = Date.now();
    
    const appState = api.getAppState();
    const x = (appState.scrollX * -1) + (appState.width / 2) - 100;
    const y = (appState.scrollY * -1) + (appState.height / 2) - 100;

    const rectId = `rect-${now}`;
    const textId = `text-${now}`;

    const newTextElement = {
      type: "text", id: textId, x: x + 20, y: y + 20, width: 160, height: 80, angle: 0,
      strokeColor: "#37352f", backgroundColor: "transparent", fillStyle: "solid",
      strokeWidth: 1, strokeStyle: "solid", roughness: 1, opacity: 100,
      groupIds: [], roundness: null, seed: Math.floor(Math.random() * 100000),
      version: 1, versionNonce: Math.floor(Math.random() * 100000),
      isDeleted: false, boundElements: [], updated: now, link: null, locked: false,
      text: "Double click to edit", fontSize: 16, fontFamily: 1,
      textAlign: "left", verticalAlign: "top", containerId: rectId, originalText: "Double click to edit",
    };

    const newRectElement = {
      type: "rectangle", id: rectId, x: x, y: y, width: 200, height: 200, angle: 0,
      strokeColor: "#eab308", backgroundColor: "#fef08a", fillStyle: "solid",
      strokeWidth: 1, strokeStyle: "solid", roughness: 1, opacity: 100,
      groupIds: [], roundness: { type: 3 }, seed: Math.floor(Math.random() * 100000),
      version: 1, versionNonce: Math.floor(Math.random() * 100000),
      isDeleted: false, boundElements: [{ type: "text", id: textId }], updated: now,
      link: null, locked: false,
    };

    const elements = [...api.getSceneElements(), newRectElement, newTextElement];
    api.updateScene({ elements, appState: { selectedElementIds: { [textId]: true } } });
  };

  const getBackgroundClass = () => {
    switch (canvasStyle) {
      case 'grid': return 'bg-[linear-gradient(to_right,#e6e4de_1px,transparent_1px),linear-gradient(to_bottom,#e6e4de_1px,transparent_1px)] [background-size:24px_24px] bg-white';
      case 'dots': return 'bg-[radial-gradient(#d1cfc7_1.5px,transparent_1.5px)] [background-size:20px_20px] bg-white';
      case 'lines': return 'bg-[linear-gradient(to_bottom,#e6e4de_1px,transparent_1px)] [background-size:100%_28px] bg-[#faf9f6]';
      case 'plain': default: return 'bg-[#faf9f6]';
    }
  };

  const renderTopRightUI = () => (
    <div className="flex items-center gap-2 mr-14 mt-2 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-gray-200 shadow-sm pointer-events-auto">
      
      <div className="flex bg-gray-100 p-0.5 rounded-lg">
        {[
          { id: 'plain', label: 'Plain' },
          { id: 'grid', label: 'Grid' },
          { id: 'dots', label: 'Dots' },
          { id: 'lines', label: 'Lines' },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setCanvasStyle(opt.id)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
              canvasStyle === opt.id ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button onClick={addStickyNote} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-[11px] font-bold rounded-lg hover:bg-yellow-200 transition-all" title="Add Sticky Note">
        <FiFileText className="w-3.5 h-3.5" /> Note
      </button>
      
    </div>
  );

  if (!initialData) return <div className="p-10 text-center text-gray-400">Loading Canvas...</div>;

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-[9999] bg-white flex flex-col p-3 gap-3' : 'w-full max-w-6xl mx-auto mt-4 animate-fade-in flex flex-col h-[78vh] space-y-3'}>
      
      <div className="bg-white border border-[#e6e4de] rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 relative z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#1e2229]">
            Active Slot: {selectedDayObj.dayName} &bull; <span className="text-gray-400 font-mono font-normal">{selectedDayObj.dateStr}</span>
          </span>
          <span className="text-[10px] text-gray-400 font-mono hidden md:inline">&bull; {saveStatus}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end relative z-50">
          <button onClick={() => setIsFullscreen((v) => !v)} className="p-2 border border-[#e6e4de] text-[#1e2229] hover:bg-gray-50 rounded-xl transition-all">
            {isFullscreen ? <FiMinimize2 className="w-3.5 h-3.5" /> : <FiMaximize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={handleSaveEntry} className="flex items-center gap-1.5 px-4 py-2 bg-[#1e2229] hover:bg-[#374151] text-white text-xs font-semibold rounded-xl shadow-xs transition-all w-full sm:w-auto justify-center">
            <FiPlus className="w-3.5 h-3.5" /> Save Entry
          </button>
          {savedJournals[selectedDayObj.dateStr]?.hasData && (
            <button onClick={handleDeleteEntry} className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className={`flex-grow w-full relative border border-[#e6e4de] rounded-3xl shadow-xl shadow-gray-100/40 overflow-hidden min-h-[400px] ${getBackgroundClass()}`}>
        <div className="absolute inset-0 z-10 w-full h-full">
          <Excalidraw
            excalidrawAPI={(api) => (excalidrawRef.current = api)}
            initialData={initialData}
            theme="light"
            renderTopRightUI={renderTopRightUI}
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveToActiveFile: false,
                export: false,
                saveAsImage: false,
                clearCanvas: false,
              },
              tools: {
                arrow: false, // Default arrow tool hide
              },
              welcomeScreen: false,
            }}
            onMount={(api) => { 
              api.updateScene({ appState: { viewBackgroundColor: "transparent" } }); 
            }}
          />
        </div>
      </div>

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
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[64px] ${isCurrentFocusedNode ? 'border-[#1e2229] bg-[#fbfbfa] shadow-sm font-semibold' : 'border-[#e6e4de] bg-white hover:bg-gray-50/50'}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-[#1e2229] uppercase">{day.dayName}</span>
                  <span className="text-[9px] font-mono font-bold text-gray-300">{day.dateStr.split('-')[2]}</span>
                </div>
                {logMetaData?.hasData ? (
                  <div className="text-[9px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded mt-1 flex items-center justify-between w-full">
                    <span className="truncate">Saved</span>
                    <span className="font-mono text-[8px] font-bold text-emerald-500 shrink-0">{logMetaData.savedTime}</span>
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
});

export default InfiniteCanvas;
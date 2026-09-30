import React, { useState } from 'react';
import { FiFeather, FiLayers, FiLogOut, FiUser, FiActivity, FiClock, FiTrendingUp, FiMenu, FiX } from 'react-icons/fi';

function Navbar({ currentView, setCurrentView, userStreak, userEmail, onLogout, secondsLeft, isTimerRunning }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const formatTimerDigits = (totalSeconds) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
  };

  const navTabs = userEmail ? [
    { id: 'daily', label: 'My Day' },
    { id: 'weekly', label: 'This Week' },
    { id: 'scratchpad', label: 'The Canvas', icon: FiFeather },
    { id: 'timer', label: isTimerRunning ? `Pacing [${formatTimerDigits(secondsLeft)}]` : 'The Timer', icon: FiClock },
    { id: 'success', label: 'Success Insights', icon: FiTrendingUp }
  ] : [];

  const handleTabClick = (tabId) => {
    setCurrentView(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#faf9f6]/90 backdrop-blur-md border-b border-[#e6e4de] px-4 sm:px-6 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LEFT BRAND SECTION */}
        <div className="flex items-center gap-3 cursor-pointer group shrink-0 select-none" onClick={() => handleTabClick('home')}>
          <div className="relative w-9 h-9 border-2 border-[#1e2229] rounded-xl flex items-center justify-center bg-white shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:border-[#6366f1]">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-[#1e2229] relative -top-[2px] transition-colors duration-300 group-hover:border-b-[#6366f1]" />
            <div className="absolute bottom-[6px] w-3 h-1 bg-[#6366f1] rounded-full transition-colors duration-300 group-hover:bg-[#1e2229]" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-[#1e2229]">khudi<span className="text-[#6366f1] font-light">quest</span></span>
        </div>

        {/* CENTER VIEW CONTROLLERS */}
        <div className="hidden lg:flex items-center bg-[#f4f2ec] p-1 rounded-xl border border-[#e6e4de]">
          {userEmail ? (
            navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-white text-[#1e2229] shadow-sm font-semibold' : 'text-[#6b7280] hover:text-[#1e2229]'
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`} />}
                  <span>{tab.label}</span>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-1.5 text-xs text-gray-400 font-medium font-sans">System Dashboard Offline &bull; Authentication Needed</div>
          )}
        </div>

        {/* RIGHT UTILITIES: Click target bound cleanly onto user avatar box element */}
        <div className="flex items-center gap-2 sm:gap-4">
          {userEmail && (
            <div className="flex items-center gap-1 px-2 py-1 bg-[#fef2f2] border border-[#fecaca] rounded-full text-[#ef4444] text-[10px] font-bold tracking-wide shrink-0">
              <FiActivity className="w-3 h-3 animate-pulse" />
              <span>{userStreak}D STREAK</span>
            </div>
          )}

          {userEmail ? (
            <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-[#e6e4de]">
              {/* CLICKABLE USER PROFILE INTERACTION CONTAINER */}
              <div 
                onClick={() => setCurrentView('settings')}
                className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs cursor-pointer transition-all ${
                  currentView === 'settings' ? 'bg-[#1e2229] border-[#1e2229] text-white shadow-xs' : 'bg-[#f4f2ec] border-[#e6e4de] text-[#4b5563] hover:bg-[#e6e4de]'
                }`}
                title="View Account Node Options"
              >
                <FiUser className="w-3.5 h-3.5" />
              </div>
              <button onClick={onLogout} className="text-xs font-medium text-[#9ca3af] hover:text-[#ef4444] transition-all">Logout</button>
            </div>
          ) : (
            <button onClick={() => setCurrentView('auth')} className="hidden sm:block text-xs font-semibold px-4 py-2 bg-[#1e2229] text-white rounded-xl hover:bg-[#374151] transition-all shadow-sm">Enter Space</button>
          )}

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[#1e2229] hover:bg-[#f4f2ec] rounded-xl lg:hidden transition-all focus:outline-none"><FiMenu className="w-5 h-5" /></button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-[#e6e4de] flex flex-col gap-1.5 animate-fade-in">
          {userEmail ? (
            <>
              {navTabs.map((tab) => (
                <button key={tab.id} onClick={() => handleTabClick(tab.id)} className={`w-full text-left px-4 py-2.5 text-xs font-medium rounded-xl transition-all ${currentView === tab.id ? 'bg-[#1e2229] text-white font-semibold' : 'text-[#6b7280] hover:bg-[#f4f2ec]'}`}>{tab.label}</button>
              ))}
              {/* Mobile Shortcut to Identity Settings Pane */}
              <button onClick={() => handleTabClick('settings')} className={`w-full text-left px-4 py-2.5 text-xs font-medium rounded-xl transition-all ${currentView === 'settings' ? 'bg-[#1e2229] text-white font-semibold' : 'text-indigo-600 hover:bg-indigo-50/50'}`}>Account Parameters</button>
              <div className="border-t border-[#f4f2ec] mt-2 pt-2 flex items-center justify-between px-4">
                <span className="text-[11px] font-mono text-gray-400 max-w-[150px] truncate">{userEmail}</span>
                <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">Sign Out</button>
              </div>
            </>
          ) : (
            <div className="p-2"><button onClick={() => handleTabClick('auth')} className="w-full text-center py-3 bg-[#1e2229] text-white text-xs font-bold rounded-xl shadow-xs">Log In / Open Account</button></div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;

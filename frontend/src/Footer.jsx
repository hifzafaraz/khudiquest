function Footer({ setCurrentView, userEmail }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#faf9f6] border-t border-[#e6e4de] pt-16 pb-12 px-6 mt-20 transition-all duration-300">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 items-start text-left">
        
        {/* COLUMN 1: UNIQUE RE-DESIGNED LOGO AND COPY BRAND INFO */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3 cursor-pointer group select-none" onClick={() => setCurrentView('home')}>
            {/* IDENTICAL GEOMETRIC PROGRESSION GLYPH LOGO ASSET */}
            <div className="relative w-8 h-8 border-2 border-[#1e2229] rounded-xl flex items-center justify-center bg-white shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:border-[#6366f1]">
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] border-b-[#1e2229] relative -top-[1px] transition-colors duration-300 group-hover:border-b-[#6366f1]" />
              <div className="absolute bottom-[5px] w-2.5 h-1 bg-[#6366f1] rounded-full transition-colors duration-300 group-hover:bg-[#1e2229]" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#1e2229]">
              khudi<span className="text-[#6366f1] font-light">quest</span>
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed font-normal normal-case">
            A zero-bloat, open-source productivity ecosystem engineered for deep human focus and logical prioritization mapping.
          </p>
        </div>

        {/* COLUMN 2: LINKS RELATED TO PLATFORM ARCHITECTURE */}
        <div className="space-y-3">
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Workspace Terminal</h5>
          <ul className="space-y-2 text-xs font-medium text-gray-500">
            <li><button onClick={() => setCurrentView(userEmail ? 'daily' : 'auth')} className="hover:text-[#1e2229] transition-colors bg-transparent border-none p-0 cursor-pointer">The Eisenhower Matrix</button></li>
            <li><button onClick={() => setCurrentView(userEmail ? 'scratchpad' : 'auth')} className="hover:text-[#1e2229] transition-colors bg-transparent border-none p-0 cursor-pointer">Infinite Sandbox Canvas</button></li>
            <li><button onClick={() => setCurrentView(userEmail ? 'timer' : 'auth')} className="hover:text-[#1e2229] transition-colors bg-transparent border-none p-0 cursor-pointer">Pacing Control Hub</button></li>
          </ul>
        </div>

        {/* COLUMN 3: ANALYTICS OPTIONS */}
        <div className="space-y-3">
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Insights</h5>
          <ul className="space-y-2 text-xs font-medium text-gray-500">
            <li><button onClick={() => setCurrentView(userEmail ? 'success' : 'auth')} className="hover:text-[#1e2229] transition-colors bg-transparent border-none p-0 cursor-pointer">Efficiency Analytics</button></li>
            <li><button onClick={() => setCurrentView(userEmail ? 'weekly' : 'auth')} className="hover:text-[#1e2229] transition-colors bg-transparent border-none p-0 cursor-pointer">Macro Horizon Planning</button></li>
          </ul>
        </div>

        {/* COLUMN 4: DATA IMMUNITY STATEMENTS */}
        <div className="space-y-3">
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Data Isolation</h5>
          <p className="text-[11px] text-gray-400 leading-relaxed font-normal">
            Your telemetry markers are locked out. All whiteboard variables, transaction strings, and tracking tokens are strictly indexed against encrypted signatures.
          </p>
        </div>

      </div>

      {/* COPYRIGHT BOTTOM META BLOCK */}
      <div className="max-w-6xl mx-auto border-t border-[#f4f2ec] mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-gray-400 gap-4">
        <p>&copy; {currentYear} khudiquest system nodes architecture. All operational properties preserved.</p>
        <div className="flex gap-4">
          <span className="uppercase tracking-wider">[Secure Storage Active]</span>
          <span className="uppercase tracking-wider">[v4.0 Matrix Deployment]</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

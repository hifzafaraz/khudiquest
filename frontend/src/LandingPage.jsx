import { FiArrowRight, FiCompass } from 'react-icons/fi';

function LandingPage({ onGetStarted }) {
  return (
    <div className="w-full bg-[#faf9f6] text-[#1e2229] font-sans antialiased selection:bg-indigo-100">
      
      {/* SECTION 1: THE HERO GRID (INSPIRATION FOCUS) */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center space-y-6 animate-fade-in">
        <span className="text-[11px] font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
          A Space Fabricated for Human Focus
        </span>
        <h1 className="text-4xl sm:text-6xl font-light tracking-tight leading-none text-gray-900 max-w-4xl mx-auto">
          Regain absolute clarity over your daily vectors. No clutter, just execution.
        </h1>
        <p className="text-base text-gray-500 max-w-xl mx-auto font-normal leading-relaxed">
          Most organizational architectures overload your working memory with subscription paywalls. This environment is built entirely open to isolate your objectives and track consistency patterns cleanly.
        </p>
        <div className="pt-4">
          <button 
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1e2229] text-white font-medium rounded-xl text-sm hover:bg-[#374151] shadow-md transition-all active:scale-[0.99] group"
          >
            <span>Initialize Your Workspace</span>
            <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* SECTION 2: THE FOUR QUADRANT RULES EXPLAINED */}
      <section className="bg-white border-y border-[#e6e4de] py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-bold text-sm">01</div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              The Eisenhower Prioritization Core
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed font-normal">
              Instead of scattering thoughts across infinite chronological checklists, the workspace automatically funnels your targets into four intentional impact quadrants. You distinguish urgent operational bottlenecks from long-term trajectory targets instantly.
            </p>
            <div className="pt-2">
              <button onClick={onGetStarted} className="text-xs font-bold text-[#6366f1] hover:underline flex items-center gap-1">
                Begin prioritization mapping <FiArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="border border-[#e6e4de] bg-[#fbfbfa] p-6 rounded-2xl shadow-xs space-y-3 text-left">
            <div className="border-l-2 border-red-500 pl-3 py-1 bg-red-50/20 rounded-r-lg">
              <span className="text-[10px] font-bold text-red-600 block uppercase">Quadrant One</span>
              <p className="text-xs font-medium text-gray-700 mt-0.5">Critical Infrastructure System Audits</p>
            </div>
            <div className="border-l-2 border-indigo-500 pl-3 py-1 bg-indigo-50/20 rounded-r-lg">
              <span className="text-[10px] font-bold text-indigo-600 block uppercase">Quadrant Two</span>
              <p className="text-xs font-medium text-gray-700 mt-0.5">Refactoring Database Index Metrics</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE CHRONOLOGICAL TIMELINE STRUCTURE */}
      <section className="max-w-5xl mx-auto py-20 px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="border border-[#e6e4de] bg-white p-6 rounded-2xl shadow-xs space-y-4 order-2 md:order-1 text-left">
          {[
            { time: '09:00 AM', text: 'Core Optimization Review Block' },
            { time: '02:30 PM', text: 'Tactical Workspace Architecture Mapping' }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-3 items-center">
              <span className="text-[10px] font-mono font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{item.time}</span>
              <span className="text-xs text-gray-600 font-medium">{item.text}</span>
            </div>
          ))}
        </div>
        <div className="space-y-4 text-left order-1 md:order-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold text-sm">02</div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Absolute Control Over Time Boundaries
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed font-normal">
            Rigid hourly blocks kill execution freedom. Our chronological compiler allows you to select custom start and termination coordinates with down-to-the-minute specificity. Schedule a focused intervals run or record strategic rest slots exactly when they fit your real-world routine.
          </p>
          <div className="pt-2">
            <button onClick={onGetStarted} className="px-4 py-2 bg-[#1e2229] text-white text-xs font-medium rounded-xl hover:bg-[#374151] transition-all">
              Launch Timeline
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: THE WHITEBOARD VISUAL JOURNAL */}
      <section className="bg-white border-t border-[#e6e4de] py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold text-sm">03</div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              The Open Strategy Canvas Node
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed font-normal">
              When ideas refuse to sit in structured list layouts, switch over to the sandbox. Draw freehand diagrams, drop vector shape nodes, align rapid mind maps, or upload multimedia stickers and screenshots. Your canvas saves automatically inside a 7-day cyclical archive bar that clears hazardous bulk when a new week registers.
            </p>
            <div className="pt-2">
              <button onClick={onGetStarted} className="text-xs font-bold text-[#6366f1] hover:underline flex items-center gap-1">
                Explore the whiteboard engine <FiArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="border border-[#e6e4de] bg-[#faf9f6] h-48 rounded-2xl flex items-center justify-center relative overflow-hidden border-dashed">
            <div className="text-center space-y-1">
              <FiCompass className="w-6 h-6 text-gray-300 mx-auto animate-spin-slow" />
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Grid & Dot Framework Modifiers Operational</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: MASTER CLOSING REGION (CONVERSION ANCHOR) */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
        <h3 className="text-3xl font-light tracking-tight text-gray-900">
          Ready to construct your distraction-free terminal?
        </h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          No automated corporate algorithms tracking your execution traits. Join your profile context free and establish permanent sequence progress milestones today.
        </p>
        <div className="pt-2">
          <button 
            onClick={onGetStarted}
            className="px-8 py-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition-all"
          >
            Create Free Workspace
          </button>
        </div>
      </section>

    </div>
  );
}

export default LandingPage;

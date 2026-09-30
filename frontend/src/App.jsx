import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import AuthGate from './AuthGate';
import InfiniteCanvas from './InfiniteCanvas';
import DailyPlanner from './DailyPlanner';
import WeeklyPlanner from './WeeklyPlanner';
import PacingHub from './PacingHub';
import SuccessTracker from './SuccessTracker';
import LandingPage from './LandingPage';
import Footer from './Footer';
import ProfileSettings from './ProfileSettings';

function App() {
  const [currentView, setCurrentView] = useState('home');
  
  // FIXED: Default email sets to null. Reads the real validated active session from the database
  const [userEmail, setUserEmail] = useState(null); 
  const [streak, setStreak] = useState(1);

  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeMode, setActiveMode] = useState('study');

  const [globalTasks, setGlobalTasks] = useState([
    { id: 1, text: 'Analyze data security vulnerability reports', completed: false, quadrant: 'q1', fromTime: '09:00', toTime: '10:30', day: 'Mon' },
    { id: 2, text: 'Refactor database indexing architecture metrics', completed: false, quadrant: 'q2', fromTime: '14:30', toTime: '16:45', day: 'Tue' }
  ]);

  // CRITICAL AUTO-LOGIN COMPILER HOOK: Remembers your session forever when tab refreshes
  useEffect(() => {
    const cachedToken = localStorage.getItem('khudiquest_token');
    const cachedEmail = localStorage.getItem('khudiquest_user_email');
    
    if (cachedToken && cachedEmail) {
      setUserEmail(cachedEmail);
      setCurrentView('daily'); // Instantly routes inside your logged dashboard
    }
  }, []);

  useEffect(() => {
    let internalClock = null;
    if (isTimerRunning && secondsLeft > 0) {
      internalClock = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(internalClock);
  }, [isTimerRunning, secondsLeft]);

  const getTodayDayName = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date().getDay()];
  };

  const handleAuthSuccess = (email) => {
    setUserEmail(email);
    localStorage.setItem('khudiquest_user_email', email); // Cache email permanently
    setStreak(1);
    setCurrentView('daily'); 
  };

  const handleLogout = () => {
    setUserEmail(null);
    localStorage.removeItem('khudiquest_token');
    localStorage.removeItem('khudiquest_user_email');
    setStreak(0);
    setCurrentView('home'); 
  };

  const handleStreakReward = () => { setStreak(prev => prev + 1); };
  const handleGetStartedNavigation = () => { setCurrentView(userEmail ? 'daily' : 'auth'); };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1e2229] font-sans antialiased flex flex-col justify-between">
      <div>
        <Navbar 
          currentView={currentView} setCurrentView={setCurrentView} 
          userStreak={streak} userEmail={userEmail} onLogout={handleLogout}
          secondsLeft={secondsLeft} isTimerRunning={isTimerRunning}
        />

        {currentView === 'home' ? (
          <LandingPage onGetStarted={handleGetStartedNavigation} />
        ) : (
          <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
            {currentView === 'auth' && !userEmail && <AuthGate onAuthSuccess={handleAuthSuccess} />}
            
            {userEmail && (
              <div className="mt-2">
                {currentView === 'scratchpad' && <InfiniteCanvas />}
                {currentView === 'daily' && (
                  <DailyPlanner globalTasks={globalTasks} setGlobalTasks={setGlobalTasks} focusedDay={getTodayDayName()} onTaskComplete={handleStreakReward} isDashboard={true} />
                )}
                {currentView === 'weekly' && (
                  <WeeklyPlanner globalTasks={globalTasks} setGlobalTasks={setGlobalTasks} onTaskComplete={handleStreakReward} />
                )}
                {currentView === 'timer' && (
                  <PacingHub secondsLeft={secondsLeft} setSecondsLeft={setSecondsLeft} isTimerRunning={isTimerRunning} setIsTimerRunning={setIsTimerRunning} activeMode={activeMode} setActiveMode={setActiveMode} />
                )}
                {currentView === 'success' && <SuccessTracker />}
                
                {/* PROFILE SETTINGS VIEW MAP ROUTE */}
                {currentView === 'settings' && (
                  <ProfileSettings userEmail={userEmail} />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer setCurrentView={setCurrentView} userEmail={userEmail} />
    </div>
  );
}

export default App;

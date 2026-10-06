import { useState } from 'react';
import { FiLock, FiKey, FiArrowLeft } from 'react-icons/fi';
import { API_BASE_URL } from './config/api';

function AuthGate({ onAuthSuccess }) {
  const [resetToken, setResetToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('resetToken');
    }
    return null;
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [friendlyMessage, setFriendlyMessage] = useState({ type: '', text: '' });
  const [resetShortcutLink, setResetShortcutLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFriendlyMessage({ type: '', text: '' });
    
    if (resetToken) {
      if (!newPassword) {
        setFriendlyMessage({ type: 'error', text: "Please enter your new password." });
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/reset-password-confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, newPassword })
        });
        const data = await response.json();
        if (!response.ok) {
          setFriendlyMessage({ type: 'error', text: data.message });
          return;
        }
        setFriendlyMessage({ type: 'success', text: data.message });
        setResetToken(null);
        setNewPassword('');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {
        setFriendlyMessage({ type: 'error', text: "Cannot connect to server." });
      }
      return;
    }

    if (!email || (!password && !isForgotPassword)) {
      setFriendlyMessage({ type: 'error', text: "Please enter your details completely." });
      return;
    }

    let targetUrl = `${API_BASE_URL}/api/auth/login`;
    if (isRegistering) targetUrl = `${API_BASE_URL}/api/auth/register`;
    if (isForgotPassword) targetUrl = `${API_BASE_URL}/api/auth/forgot-password`;

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setFriendlyMessage({ type: 'error', text: data.message || "An error occurred." });
        return;
      }

      if (isRegistering) {
        setFriendlyMessage({ type: 'success', text: data.message });
        setIsRegistering(false);
        setPassword('');
      } else if (isForgotPassword) {
        setFriendlyMessage({ type: 'success', text: data.message });
        if (data.resetLink) {
          setResetShortcutLink(data.resetLink);
        }
      } else {
        localStorage.setItem('khudiquest_token', data.token);
        onAuthSuccess(data.email);
      }
    } catch {
      setFriendlyMessage({ type: 'error', text: "Cannot connect to server. Ensure your backend terminal is running." });
    }
  };

  if (resetToken) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-[#e6e4de] p-8 shadow-xl shadow-gray-100/50 mt-12 text-left">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-[#6366f1] mb-3"><FiLock className="w-4 h-4" /></div>
          <h2 className="text-2xl font-semibold text-[#1e2229] tracking-tight">Set New Password</h2>
          <p className="text-sm text-gray-500 mt-1.5">Your recovery token is active. Enter your new password below.</p>
        </div>
        {friendlyMessage.text && <div className={`p-4 rounded-xl text-xs mb-6 border ${friendlyMessage.type === 'error' ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}><span>{friendlyMessage.text}</span></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters..." className="w-full px-4 py-3 bg-[#fbfbfa] border border-[#e6e4de] rounded-xl text-sm focus:outline-none focus:border-[#6366f1] text-[#1e2229]" />
          <button type="submit" className="w-full py-3 bg-[#6366f1] text-white font-medium rounded-xl text-xs uppercase font-bold">Override Credentials</button>
        </form>
      </div>
    );
  }

  if (isForgotPassword) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-[#e6e4de] p-8 shadow-xl shadow-gray-100/50 mt-12 animate-fade-in text-left">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-[#6366f1] mb-3"><FiKey className="w-4 h-4" /></div>
          <h2 className="text-2xl font-semibold text-[#1e2229] tracking-tight">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-1.5">Enter your email address to receive password reset link parameters.</p>
        </div>
        {friendlyMessage.text && <div className={`p-4 rounded-xl text-xs mb-6 border ${friendlyMessage.type === 'error' ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}><span>{friendlyMessage.text}</span></div>}
        {resetShortcutLink && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
            <a href={resetShortcutLink} className="text-xs font-bold text-emerald-700 hover:underline block uppercase tracking-wide">
              👉 Click Here to Reset Password Instantly
            </a>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full px-4 py-3 bg-[#fbfbfa] border border-[#e6e4de] rounded-xl text-sm focus:outline-none text-[#1e2229]" />
          <button type="submit" className="w-full py-3 bg-[#1e2229] text-white font-medium rounded-xl text-xs uppercase font-bold">Send Reset Link</button>
        </form>
        <div className="mt-6 pt-4 border-t border-[#f4f2ec] text-center"><button type="button" onClick={() => { setIsForgotPassword(false); setFriendlyMessage({ type: '', text: '' }); }} className="text-xs font-semibold text-gray-400 hover:text-[#1e2229] flex items-center gap-1 mx-auto bg-transparent border-none"><FiArrowLeft className="w-3.5 h-3.5" /> Back to Sign In</button></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-[#e6e4de] p-8 shadow-xl shadow-gray-100/50 mt-12 animate-fade-in text-left">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#f4f2ec] text-[#6366f1] mb-3">
          <FiKey className="w-4 h-4" />
        </div>
        <h2 className="text-2xl font-semibold text-[#1e2229] tracking-tight">
          {isRegistering ? "Create Account" : "Sign In"}
        </h2>
      </div>
      
      {friendlyMessage.text && (
        <div className={`p-4 rounded-xl text-xs mb-6 border ${friendlyMessage.type === 'error' ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
          <span>{friendlyMessage.text}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 pl-1">Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full px-4 py-3 bg-[#fbfbfa] border border-[#e6e4de] rounded-xl text-sm focus:outline-none text-[#1e2229]" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 pl-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full px-4 py-3 bg-[#fbfbfa] border border-[#e6e4de] rounded-xl text-sm focus:outline-none text-[#1e2229]" />
          {!isRegistering && (
            <div className="text-right mt-2"><button type="button" onClick={() => setIsForgotPassword(true)} className="text-[11px] font-semibold text-gray-400 hover:text-[#6366f1] bg-transparent border-none cursor-pointer">Forgot password?</button></div>
          )}
        </div>
        <button type="submit" className="w-full py-3.5 px-4 bg-[#1e2229] text-white font-medium rounded-xl text-xs uppercase font-bold tracking-wide mt-2 shadow-sm">
          {isRegistering ? "Register Account" : "Log In & Open Workspace"}
        </button>
      </form>
      
      <div className="mt-6 pt-4 border-t border-[#f4f2ec] text-center">
        <p className="text-xs text-gray-500">
          {isRegistering ? "Have an account?" : "New here?"}{' '}
          <button type="button" onClick={() => { setIsRegistering(!isRegistering); setFriendlyMessage({ type: '', text: '' }); }} className="text-[#6366f1] font-bold bg-transparent border-none cursor-pointer">
            {isRegistering ? "Sign in" : "Create one free"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthGate;

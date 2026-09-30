import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiCheckCircle, FiAlertCircle, FiTrash2 } from 'react-icons/fi';

function ProfileSettings({ userEmail }) {
  const [displayName, setDisplayName] = useState('Workspace Operator');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setFeedbackMessage({ type: 'success', text: 'Your display name handle has been updated.' });
    setTimeout(() => setFeedbackMessage({ type: '', text: '' }), 4000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFeedbackMessage({ type: '', text: '' });

    if (!currentPassword || !newPassword) {
      setFeedbackMessage({ type: 'error', text: 'Please fill in both current and new password boxes.' });
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, currentPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        setFeedbackMessage({ type: 'error', text: data.message });
        return;
      }
      setFeedbackMessage({ type: 'success', text: data.message });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: 'Cannot connect to server.' });
    }
  };

  // NEW CORE LOGIC: Hits the delete-all endpoint parameters safely
  const handlePurgeHistory = async () => {
    const confirmation = window.confirm("Are you absolutely sure you want to delete your entire task log history? This cannot be undone.");
    if (!confirmation) return;

    try {
      const response = await fetch('http://localhost:5000/api/tasks/purge-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setFeedbackMessage({ type: 'success', text: data.message });
        // Smoothly triggers reloading page states to sync active grids blank instantly
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: 'Failed to complete delete transactions loop.' });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 space-y-6 animate-fade-in pb-12 text-left">
      
      <div className="bg-white border border-[#e6e4de] rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#1e2229]">Account Settings</h3>
        <p className="text-xs text-gray-400 mt-0.5">Manage your workspace parameters and privacy controls safely.</p>
      </div>

      {feedbackMessage.text && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${feedbackMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
          {feedbackMessage.type === 'success' ? <FiCheckCircle className="w-4 h-4 text-emerald-600" /> : <FiAlertCircle className="w-4 h-4 text-orange-600" />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* DISPLAY PROFILE CONFIGS */}
      <div className="bg-white border border-[#e6e4de] rounded-3xl p-6 shadow-sm">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 pl-1">Email Address</label>
            <input type="email" value={userEmail} disabled className="w-full px-4 py-3 bg-[#fbfbfa] border border-[#e6e4de] rounded-xl text-sm text-gray-400 cursor-not-allowed focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 pl-1">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-3 bg-white border border-[#e6e4de] rounded-xl text-sm focus:outline-none focus:border-[#6366f1] text-[#1e2229]" />
          </div>
          <button type="submit" className="w-full py-3 bg-[#1e2229] hover:bg-[#374151] text-white font-medium rounded-xl text-xs uppercase font-bold">Update Profile Name</button>
        </form>
      </div>

      {/* ENCRYPTED PASSWORD MODIFIER */}
      <div className="bg-white border border-[#e6e4de] rounded-3xl p-6 shadow-sm">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-4 pl-1">Change Security Password</span>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="w-full px-4 py-3 bg-white border border-[#e6e4de] rounded-xl text-sm focus:outline-none text-[#1e2229]" />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new custom password" className="w-full px-4 py-3 bg-white border border-[#e6e4de] rounded-xl text-sm focus:outline-none text-[#1e2229]" />
          <button type="submit" className="w-full py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium rounded-xl text-xs uppercase font-bold shadow-sm shadow-indigo-100">Update Password Key</button>
        </form>
      </div>

      {/* NEW: PRIVACY DANGER ZONE DATA PURGE MODULE */}
      <div className="bg-red-50/10 border border-red-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block pl-1">Danger Zone (Privacy Control)</span>
          <p className="text-xs text-gray-400 mt-1 leading-normal font-normal">Purging history instantly deletes all priority matrices, task trackers, and chronological schedules ever saved on this account across the system file database. This configuration is irreversible.</p>
        </div>
        <button 
          onClick={handlePurgeHistory}
          className="w-full py-3 bg-transparent border border-red-200 text-red-500 hover:bg-red-50 font-bold rounded-xl text-xs uppercase transition-all flex items-center justify-center gap-1.5"
        >
          <FiTrash2 className="w-3.5 h-3.5" /> Wipe Entire Workspace Data Logs
        </button>
      </div>

    </div>
  );
}

export default ProfileSettings;

import React, { useState } from 'react';
import {
  User,
  Building,
  Target,
  Users2,
  Download,
  Trash2,
  Shield,
  CheckCircle2,
  Save,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeads } from '../../context/LeadContext';
import { OutreachTone } from '../../types';

export const SettingsView: React.FC = () => {
  const { profile, updateProfileData } = useAuth();
  const { leads, exportLeadsToCSV, resetToDemoData } = useLeads();

  const [displayName, setDisplayName] = useState(profile?.displayName || 'Alex Mercer');
  const [orgName, setOrgName] = useState(profile?.organizationName || 'Acme Growth Labs');
  const [minScore, setMinScore] = useState(
    profile?.icpPreferences?.minScoreThreshold || 75
  );
  const [defaultTone, setDefaultTone] = useState<OutreachTone>(
    profile?.icpPreferences?.defaultTone || 'consultative'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Agency Team Members simulation
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Alex Mercer', email: 'alex@leadpilot.ai', role: 'Workspace Owner' },
    { id: '2', name: 'Sarah Jenkins', email: 'sarah.j@leadpilot.ai', role: 'Sales Development Rep' },
    { id: '3', name: 'Marcus Vance', email: 'marcus.v@leadpilot.ai', role: 'Account Executive' },
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Sales Development Rep');
  const [showAddMember, setShowAddMember] = useState(false);

  // Opt-out / Suppression state
  const [suppressionDomain, setSuppressionDomain] = useState('');
  const [suppressSuccess, setSuppressSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileData({
      displayName,
      organizationName: orgName,
      icpPreferences: {
        targetIndustries: profile?.icpPreferences?.targetIndustries || [
          'Digital Marketing & PPC',
          'Software Development',
        ],
        minScoreThreshold: minScore,
        defaultTone,
      },
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    setTeamMembers([
      ...teamMembers,
      {
        id: `member_${Date.now()}`,
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        role: newMemberRole,
      },
    ]);
    setNewMemberName('');
    setNewMemberEmail('');
    setShowAddMember(false);
  };

  const handleAddSuppression = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppressionDomain.trim()) return;
    setSuppressSuccess(true);
    setTimeout(() => {
      setSuppressSuccess(false);
      setSuppressionDomain('');
    }, 2500);
  };

  const handleExportAllJson = () => {
    const dataStr = JSON.stringify(leads, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leadpilot-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">
          Workspace & Profile Settings
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage your account credentials, default Ideal Customer Profile scoring, team seats, and privacy controls.
        </p>
      </div>

      {saveSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
          Settings updated successfully!
        </div>
      )}

      {/* User & Organization Details */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-4">
          <h2 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4 text-[#3563E9]" />
            Personal & Organization Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Account Email
              </label>
              <input
                type="email"
                value={profile?.email || 'user@example.com'}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-2 text-xs text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Organization / Agency Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* ICP Default Parameters */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-4">
          <h2 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#3563E9]" />
            Default Ideal Customer Profile (ICP) Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Minimum Score Threshold for "High Fit" ({minScore}/100)
              </label>
              <input
                type="range"
                min={50}
                max={95}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-[#3563E9]"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Leads scoring at or above {minScore} will receive priority badges in the pipeline.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Default Outreach Tone
              </label>
              <select
                value={defaultTone}
                onChange={(e) => setDefaultTone(e.target.value as OutreachTone)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              >
                <option value="consultative">Consultative (Insight & advisory-led)</option>
                <option value="professional">Professional (Executive & formal)</option>
                <option value="direct">Direct (Concise & low friction)</option>
                <option value="friendly">Friendly (Warm & conversational)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#3563E9] px-5 py-2 text-xs font-bold text-white hover:bg-[#284fcd] transition-all shadow-xs"
            >
              <Save className="h-3.5 w-3.5" />
              Save Workspace Preferences
            </button>
          </div>
        </div>
      </form>

      {/* Team Seats Management (Agency tier) */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users2 className="h-4 w-4 text-[#3563E9]" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-gray-700">
              Workspace Team Members (3 / 5 Seats)
            </h2>
          </div>
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#3563E9] hover:underline"
          >
            <Plus className="h-3 w-3" />
            Invite Member
          </button>
        </div>

        {showAddMember && (
          <form onSubmit={handleAddMember} className="rounded-xl border border-blue-100 bg-[#F2F6FF] p-4 space-y-3">
            <p className="text-xs font-bold text-[#101828]">Invite New Workspace Member</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Full Name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-[#101828]"
                required
              />
              <input
                type="email"
                placeholder="Work Email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-[#101828]"
                required
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-[#101828]"
              >
                <option value="Sales Development Rep">Sales Development Rep</option>
                <option value="Account Executive">Account Executive</option>
                <option value="Workspace Admin">Workspace Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="text-xs text-gray-500 px-3 py-1 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#3563E9] px-4 py-1 text-xs font-bold text-white hover:bg-[#284fcd]"
              >
                Send Invite
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-gray-100">
          {teamMembers.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3 text-xs">
              <div>
                <p className="font-bold text-[#101828]">{m.name}</p>
                <p className="text-[11px] text-gray-500">{m.email}</p>
              </div>
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Governance & Privacy Controls */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-4">
        <h2 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#3563E9]" />
          Data Governance, Export, & Compliance
        </h2>

        <p className="text-xs text-gray-600 leading-relaxed">
          LeadPilot AI adheres to GDPR, CAN-SPAM, and California privacy mandates. You retain full ownership of
          your uploaded customer data and can export or purge it anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => exportLeadsToCSV()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-gray-500" />
            Export Entire Pipeline (CSV)
          </button>

          <button
            onClick={handleExportAllJson}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-gray-500" />
            Backup Database (JSON)
          </button>

          <button
            onClick={() => {
              if (confirm('Reset your sandbox data back to initial demo prospects?')) {
                resetToDemoData();
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
          >
            Reload Clean Demo Dataset
          </button>
        </div>

        {/* Domain Suppression Tool */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <label className="block text-xs font-bold text-gray-700">
            Do-Not-Contact / Domain Suppression Request
          </label>
          <p className="text-[11px] text-gray-400">
            Enter a domain or business email to exclude from all future discovery searches and outreach drafts.
          </p>
          <form onSubmit={handleAddSuppression} className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="e.g. competitor.com or optout@company.com"
              value={suppressionDomain}
              onChange={(e) => setSuppressionDomain(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-1.5 text-xs text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
            />
            <button
              type="submit"
              className="rounded-xl bg-gray-800 px-4 py-1.5 text-xs font-bold text-white hover:bg-gray-900 transition-colors"
            >
              Add to Suppression
            </button>
          </form>
          {suppressSuccess && (
            <p className="text-xs font-semibold text-emerald-700 mt-1">
              Domain added to suppression list. It will be barred from future discovery queries.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

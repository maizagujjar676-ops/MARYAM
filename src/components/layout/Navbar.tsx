import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Upload,
  User as UserIcon,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeads } from '../../context/LeadContext';

interface NavbarProps {
  onOpenNewLead: () => void;
  onOpenImportCsv: () => void;
  onOpenAuth: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewLead,
  onOpenImportCsv,
  onOpenAuth,
  currentTab,
  setCurrentTab,
}) => {
  const { currentUser, profile, isGuest, signOut } = useAuth();
  const { leads } = useLeads();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const planBadgeColor =
    profile?.plan === 'agency'
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : profile?.plan === 'pro'
      ? 'bg-blue-100 text-[#3563E9] border-blue-200'
      : 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-4 md:px-6 shadow-xs">
      {/* Brand logo & mobile menu toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3563E9] text-white shadow-sm shadow-[#3563E9]/30">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-[#101828] text-lg">
              LeadPilot <span className="text-[#3563E9] font-extrabold text-sm px-1.5 py-0.5 rounded-md bg-[#F2F6FF]">AI</span>
            </div>
          </div>
        </button>

        {isGuest && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldCheck className="h-3 w-3" />
            Sandbox Demo Mode
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenImportCsv}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#101828] hover:bg-[#F5F7FA] transition-colors"
        >
          <Upload className="h-3.5 w-3.5 text-gray-500" />
          Import CSV
        </button>

        <button
          onClick={onOpenNewLead}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#3563E9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#284fcd] transition-all shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Lead
        </button>

        {/* User Profile or Sign-in button */}
        {currentUser || isGuest ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white p-1.5 pr-2.5 hover:bg-[#F5F7FA] transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2F6FF] text-[#3563E9] font-bold text-xs">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="User"
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  profile?.displayName?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-[#101828] leading-none">
                  {profile?.displayName || 'User'}
                </p>
                <span
                  className={`mt-0.5 inline-block text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded border ${planBadgeColor}`}
                >
                  {profile?.plan || 'Free'} Plan
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-[#E2E8F0] bg-white py-1.5 shadow-lg shadow-black/5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-3.5 py-2 border-b border-[#E2E8F0]">
                  <p className="text-xs font-semibold text-[#101828]">
                    {profile?.displayName || 'Logged in user'}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">{profile?.email}</p>
                  <p className="mt-1 text-[11px] text-blue-600 font-medium">
                    {leads.length} leads in database
                  </p>
                </div>

                <button
                  onClick={() => setCurrentTab('subscription')}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-[#101828] hover:bg-[#F2F6FF] transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#3563E9]" />
                  Subscription & Limits ({profile?.plan?.toUpperCase()})
                </button>

                <button
                  onClick={() => setCurrentTab('settings')}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-[#101828] hover:bg-[#F2F6FF] transition-colors"
                >
                  <UserIcon className="h-3.5 w-3.5 text-gray-500" />
                  Workspace Settings
                </button>

                <div className="my-1 border-t border-[#E2E8F0]" />

                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAuth}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#101828] hover:bg-[#F5F7FA]"
            >
              Log in
            </button>
            <button
              onClick={onOpenAuth}
              className="rounded-lg bg-[#3563E9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#284fcd]"
            >
              Start Free
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

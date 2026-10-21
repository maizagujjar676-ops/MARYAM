import React from 'react';
import {
  LayoutDashboard,
  Search,
  Users,
  Kanban,
  Send,
  Bookmark,
  CreditCard,
  Settings,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeads } from '../../context/LeadContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { profile } = useAuth();
  const { leads, outreachDrafts } = useLeads();

  const maxLeads =
    profile?.plan === 'agency' ? 2500 : profile?.plan === 'pro' ? 500 : 25;
  const leadUsagePct = Math.min(100, Math.round((leads.length / maxLeads) * 100));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discovery', label: 'AI Lead Discovery', icon: Search, badge: 'AI' },
    { id: 'leads', label: 'All Leads', icon: Users, count: leads.length },
    { id: 'crm', label: 'Sales CRM Pipeline', icon: Kanban },
    { id: 'outreach', label: 'AI Outreach Assistant', icon: Send, badge: 'Gemini' },
    { id: 'saved-searches', label: 'Saved Searches', icon: Bookmark },
  ];

  const secondaryNavItems = [
    { id: 'subscription', label: 'Subscription & Usage', icon: CreditCard },
    { id: 'settings', label: 'Workspace Settings', icon: Settings },
    { id: 'legal', label: 'Privacy & Terms', icon: ShieldAlert },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-[#E2E8F0] bg-white p-4 min-h-[calc(100vh-4rem)]">
      {/* Navigation Links */}
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Pipeline Management
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#3563E9] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#F2F6FF] hover:text-[#3563E9]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#3563E9]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-50 text-[#3563E9] border border-blue-100'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && (
                      <span
                        className={`rounded-full px-2 py-0.2 text-[11px] font-semibold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Platform & Legal
          </p>
          <nav className="mt-2 space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#3563E9] text-white'
                      : 'text-gray-600 hover:bg-[#F2F6FF] hover:text-[#3563E9]'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#3563E9]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Subscription Quota Card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F5F7FA] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#3563E9]" />
            <span className="text-xs font-bold text-[#101828]">Account Quota</span>
          </div>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#3563E9]">
            {profile?.plan || 'Free'}
          </span>
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-gray-600 mb-1">
            <span>Stored Leads</span>
            <span className="font-semibold text-[#101828]">
              {leads.length} / {maxLeads}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                leadUsagePct > 85 ? 'bg-amber-500' : 'bg-[#3563E9]'
              }`}
              style={{ width: `${leadUsagePct}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setCurrentTab('subscription')}
          className="flex w-full items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3563E9] border border-[#E2E8F0] hover:bg-blue-50 transition-colors"
        >
          <span>Upgrade Tier</span>
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </aside>
  );
};

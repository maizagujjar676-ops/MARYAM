import React from 'react';
import {
  Users,
  Target,
  Send,
  CheckCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Clock,
  Sparkles,
  Search,
  Upload,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { Lead } from '../../types';

interface DashboardViewProps {
  onSelectLead: (lead: Lead) => void;
  onNavigate: (tab: string) => void;
  onOpenNewLead: () => void;
  onOpenImportCsv: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectLead,
  onNavigate,
  onOpenNewLead,
  onOpenImportCsv,
}) => {
  const { leads, updateLead } = useLeads();

  // Metrics calculated directly from real records
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const qualifiedLeads = leads.filter((l) => l.status === 'qualified').length;
  const contactedLeads = leads.filter((l) => l.status === 'contacted').length;
  const repliedLeads = leads.filter((l) => l.status === 'replied').length;
  const meetingLeads = leads.filter((l) => l.status === 'meeting').length;
  const wonLeads = leads.filter((l) => l.status === 'won').length;
  const lostLeads = leads.filter((l) => l.status === 'lost').length;

  const totalPipelineValue = leads
    .filter((l) => ['qualified', 'contacted', 'replied', 'meeting', 'won'].includes(l.status))
    .reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);

  const wonRevenue = leads
    .filter((l) => l.status === 'won')
    .reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);

  // Score distribution
  const highIntentCount = leads.filter((l) => l.leadScore >= 80).length;
  const mediumIntentCount = leads.filter((l) => l.leadScore >= 60 && l.leadScore < 80).length;
  const lowIntentCount = leads.filter((l) => l.leadScore < 60).length;

  // Follow-ups due
  const todayStr = new Date().toISOString().slice(0, 10);
  const followUpsDue = leads.filter((l) => l.nextFollowUpDate && l.status !== 'won' && l.status !== 'lost');
  const urgentFollowUps = followUpsDue.filter((l) => l.nextFollowUpDate && l.nextFollowUpDate <= todayStr);

  // Recent activity logs compiled across leads
  const allActivities = leads
    .flatMap((l) =>
      (l.activityHistory || []).map((a) => ({
        ...a,
        leadName: l.businessName,
        lead: l,
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  // Industry breakdown
  const industryCounts: Record<string, number> = {};
  leads.forEach((l) => {
    industryCounts[l.industry] = (industryCounts[l.industry] || 0) + 1;
  });
  const topIndustries = Object.entries(industryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleMarkFollowupDone = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    await updateLead(lead.id, {
      nextFollowUpDate: '',
      notes: (lead.notes ? lead.notes + '\n' : '') + `[Completed follow-up on ${todayStr}]`,
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">
            Sales Intelligence Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time pipeline performance, lead qualification health, and scheduled follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('discovery')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3563E9] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#284fcd] transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            Discover New Leads
          </button>
          <button
            onClick={onOpenImportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-[#F5F7FA] transition-colors"
          >
            <Upload className="h-3.5 w-3.5 text-gray-500" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Metrics Row (7 key metrics from prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Leads</span>
            <div className="rounded-lg bg-blue-50 p-1.5 text-[#3563E9]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101828]">{totalLeads}</p>
          <p className="mt-1 text-[11px] text-gray-400">In database</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Qualified</span>
            <div className="rounded-lg bg-emerald-50 p-1.5 text-[#16A34A]">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101828]">{qualifiedLeads}</p>
          <p className="mt-1 text-[11px] text-[#16A34A] font-medium">
            {totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0}% of list
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Contacted</span>
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101828]">{contactedLeads}</p>
          <p className="mt-1 text-[11px] text-gray-400">Outreach active</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Interested</span>
            <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101828]">{repliedLeads + meetingLeads}</p>
          <p className="mt-1 text-[11px] text-amber-600 font-medium">{meetingLeads} meetings</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Converted</span>
            <div className="rounded-lg bg-emerald-50 p-1.5 text-[#16A34A]">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101828]">{wonLeads}</p>
          <p className="mt-1 text-[11px] text-[#16A34A] font-medium">
            ${wonRevenue.toLocaleString()} won
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Follow-Ups</span>
            <div className={`rounded-lg p-1.5 ${urgentFollowUps.length > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101828]">{followUpsDue.length}</p>
          <p className="mt-1 text-[11px] text-red-600 font-medium">
            {urgentFollowUps.length} due today
          </p>
        </div>
      </div>

      {/* Main Grid: Pipeline Funnel & Urgency Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Pipeline Funnel (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#E2E8F0] bg-white p-5 md:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-sm text-[#101828]">Sales Conversion Funnel</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Active opportunities across all stages • Total pipeline value: ${totalPipelineValue.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => onNavigate('crm')}
              className="text-xs font-bold text-[#3563E9] hover:underline flex items-center gap-1"
            >
              Open CRM Pipeline <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { stage: 'New Unqualified', count: newLeads, color: 'bg-gray-400', max: Math.max(1, totalLeads) },
              { stage: 'AI Qualified (Score > 70)', count: qualifiedLeads, color: 'bg-[#3563E9]', max: Math.max(1, totalLeads) },
              { stage: 'Contacted / Outreach Sent', count: contactedLeads, color: 'bg-indigo-500', max: Math.max(1, totalLeads) },
              { stage: 'Replied with Interest', count: repliedLeads, color: 'bg-blue-400', max: Math.max(1, totalLeads) },
              { stage: 'Meeting Scheduled', count: meetingLeads, color: 'bg-amber-500', max: Math.max(1, totalLeads) },
              { stage: 'Won / Customer Onboarded', count: wonLeads, color: 'bg-[#16A34A]', max: Math.max(1, totalLeads) },
            ].map((st, i) => {
              const pct = Math.round((st.count / st.max) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-700">{st.stage}</span>
                    <span className="font-bold text-[#101828]">
                      {st.count} leads ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${st.color}`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Score Distribution Summary */}
          <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-emerald-50/60 p-3 border border-emerald-100">
              <span className="text-[11px] font-bold uppercase text-emerald-800">High Match (80+)</span>
              <p className="text-xl font-extrabold text-emerald-900 mt-1">{highIntentCount}</p>
              <span className="text-[10px] text-emerald-700">Immediate Priority</span>
            </div>
            <div className="rounded-xl bg-blue-50/60 p-3 border border-blue-100">
              <span className="text-[11px] font-bold uppercase text-blue-800">Moderate (60-79)</span>
              <p className="text-xl font-extrabold text-blue-900 mt-1">{mediumIntentCount}</p>
              <span className="text-[10px] text-blue-700">Audit Opportunity</span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-600">Review (&lt;60)</span>
              <p className="text-xl font-extrabold text-gray-800 mt-1">{lowIntentCount}</p>
              <span className="text-[10px] text-gray-500">Needs Enrichment</span>
            </div>
          </div>
        </div>

        {/* Urgent Follow-ups & Reminders (1 col) */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 md:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#101828] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#3563E9]" />
                Scheduled Follow-Ups
              </h3>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                {followUpsDue.length} Total
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Timely follow-ups boost B2B response rates by up to 300%.
            </p>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {followUpsDue.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-500">
                  <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                  No pending follow-ups due. Great job staying on top of your pipeline!
                </div>
              ) : (
                followUpsDue.map((lead) => {
                  const isOverdue = lead.nextFollowUpDate && lead.nextFollowUpDate <= todayStr;
                  return (
                    <div
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`group cursor-pointer rounded-xl border p-3 transition-all ${
                        isOverdue
                          ? 'border-red-200 bg-red-50/40 hover:bg-red-50'
                          : 'border-gray-200 bg-[#F5F7FA] hover:bg-blue-50/50 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#101828] group-hover:text-[#3563E9]">
                            {lead.businessName}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate max-w-[180px]">
                            {lead.contactPerson || lead.industry}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isOverdue
                              ? 'bg-red-200 text-red-900'
                              : 'bg-blue-100 text-[#3563E9]'
                          }`}
                        >
                          {lead.nextFollowUpDate}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-gray-200/50">
                        <span className="text-[10px] text-gray-400 capitalize">
                          Stage: {lead.status}
                        </span>
                        <button
                          onClick={(e) => handleMarkFollowupDone(e, lead)}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                        >
                          Mark Done ✓
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('crm')}
            className="mt-4 w-full rounded-xl border border-gray-200 bg-[#F5F7FA] py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            View CRM Board
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Activity & Top Industries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#E2E8F0] bg-white p-5 md:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#101828]">Recent Lead Activities</h3>
              <p className="text-xs text-gray-400">Chronological history of interactions across your team</p>
            </div>
            <button
              onClick={() => onNavigate('leads')}
              className="text-xs font-bold text-[#3563E9] hover:underline"
            >
              Browse All Leads
            </button>
          </div>

          <div className="space-y-3">
            {allActivities.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No logged activities yet.</p>
            ) : (
              allActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => onSelectLead(act.lead)}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#F5F7FA] p-3 hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[#3563E9]">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#101828]">{act.leadName}</p>
                      <p className="text-[11px] text-gray-600">{act.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Industries Mix (1 col) */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 md:p-6 shadow-2xs">
          <h3 className="font-bold text-sm text-[#101828] mb-1">Portfolio Industry Mix</h3>
          <p className="text-xs text-gray-400 mb-4">Breakdown of leads by verified category</p>

          <div className="space-y-3">
            {topIndustries.map(([ind, count], idx) => {
              const pct = Math.round((count / Math.max(1, totalLeads)) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-700 truncate max-w-[180px]">{ind}</span>
                    <span className="font-bold text-[#101828]">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#3563E9]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Plus,
  Send,
  Sparkles,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { Lead, LeadStatus } from '../../types';

interface CrmPipelineViewProps {
  onSelectLead: (lead: Lead) => void;
  onOpenNewLead: () => void;
  onGenerateOutreach: (lead: Lead) => void;
}

const PIPELINE_COLUMNS: { id: LeadStatus; label: string; color: string; border: string }[] = [
  { id: 'new', label: 'New', color: 'bg-gray-100 text-gray-700', border: 'border-t-gray-400' },
  { id: 'qualified', label: 'Qualified', color: 'bg-blue-100 text-[#3563E9]', border: 'border-t-[#3563E9]' },
  { id: 'contacted', label: 'Contacted', color: 'bg-indigo-100 text-indigo-700', border: 'border-t-indigo-500' },
  { id: 'replied', label: 'Replied', color: 'bg-cyan-100 text-cyan-800', border: 'border-t-cyan-500' },
  { id: 'meeting', label: 'Meeting Scheduled', color: 'bg-amber-100 text-amber-800', border: 'border-t-amber-500' },
  { id: 'won', label: 'Won Deal', color: 'bg-emerald-100 text-emerald-800', border: 'border-t-[#16A34A]' },
  { id: 'lost', label: 'Lost', color: 'bg-rose-100 text-rose-800', border: 'border-t-rose-400' },
];

export const CrmPipelineView: React.FC<CrmPipelineViewProps> = ({
  onSelectLead,
  onOpenNewLead,
  onGenerateOutreach,
}) => {
  const { leads, updateLead } = useLeads();
  const [minScore, setMinScore] = useState<number>(0);
  const [industryFilter, setIndustryFilter] = useState<string>('all');

  const filteredLeads = leads.filter((lead) => {
    if (lead.leadScore < minScore) return false;
    if (industryFilter !== 'all' && lead.industry !== industryFilter) return false;
    return true;
  });

  const getNextStage = (current: LeadStatus): LeadStatus | null => {
    const order: LeadStatus[] = ['new', 'qualified', 'contacted', 'replied', 'meeting', 'won'];
    const idx = order.indexOf(current);
    if (idx >= 0 && idx < order.length - 1) return order[idx + 1];
    return null;
  };

  const getPrevStage = (current: LeadStatus): LeadStatus | null => {
    const order: LeadStatus[] = ['new', 'qualified', 'contacted', 'replied', 'meeting', 'won'];
    const idx = order.indexOf(current);
    if (idx > 0) return order[idx - 1];
    if (current === 'lost') return 'meeting';
    return null;
  };

  const handleAdvanceStage = async (e: React.MouseEvent, lead: Lead, direction: 'forward' | 'backward') => {
    e.stopPropagation();
    const nextSt = direction === 'forward' ? getNextStage(lead.status) : getPrevStage(lead.status);
    if (nextSt) {
      await updateLead(lead.id, { status: nextSt });
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">
            Sales CRM Pipeline
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Visual 7-stage sales board. Advance prospects from initial discovery to closed business.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-semibold text-gray-600">Min Score:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="font-bold text-[#101828] bg-transparent focus:outline-hidden"
            >
              <option value={0}>All (0+)</option>
              <option value={70}>70+ Fit</option>
              <option value={80}>80+ High Intent</option>
            </select>
          </div>

          <button
            onClick={onOpenNewLead}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3563E9] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#284fcd] transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Prospect
          </button>
        </div>
      </div>

      {/* 7-Stage Kanban Columns (Horizontal scroll) */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex items-start gap-4 min-w-[1400px]">
          {PIPELINE_COLUMNS.map((col) => {
            const columnLeads = filteredLeads.filter((l) => l.status === col.id);
            const columnValue = columnLeads.reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);

            return (
              <div
                key={col.id}
                className="w-80 shrink-0 rounded-2xl border border-[#E2E8F0] bg-[#F5F7FA] p-3 shadow-2xs flex flex-col max-h-[78vh]"
              >
                {/* Column Header */}
                <div className={`p-2.5 rounded-xl bg-white border-t-4 ${col.border} shadow-2xs mb-3`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#101828] uppercase tracking-wide">
                      {col.label}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-700">
                      {columnLeads.length}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-gray-500">
                    Est. Value: ${columnValue.toLocaleString()}
                  </p>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                  {columnLeads.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                      No leads in {col.label.toLowerCase()}
                    </div>
                  ) : (
                    columnLeads.map((lead) => {
                      const scoreColor =
                        lead.leadScore >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : lead.leadScore >= 60
                          ? 'bg-blue-100 text-[#3563E9]'
                          : 'bg-amber-100 text-amber-800';

                      const canForward = getNextStage(lead.status) !== null;
                      const canBack = getPrevStage(lead.status) !== null;

                      return (
                        <div
                          key={lead.id}
                          onClick={() => onSelectLead(lead)}
                          className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs hover:border-[#3563E9] hover:shadow-xs transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <h4 className="text-xs font-bold text-[#101828] group-hover:text-[#3563E9] transition-colors leading-tight">
                                {lead.businessName}
                              </h4>
                              <p className="text-[11px] text-gray-500 truncate max-w-[190px]">
                                {lead.industry}
                              </p>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${scoreColor} shrink-0`}>
                              ★ {lead.leadScore}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span>{lead.city || lead.location || 'Location not set'}</span>
                            <span className="font-semibold text-gray-700">
                              ${(lead.estimatedDealValue || 3500).toLocaleString()}
                            </span>
                          </div>

                          {lead.nextFollowUpDate && (
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              <Clock className="h-3 w-3" />
                              <span>Follow-up: {lead.nextFollowUpDate}</span>
                            </div>
                          )}

                          {lead.tags && lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {lead.tags.slice(0, 2).map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Quick Card Controls */}
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onGenerateOutreach(lead);
                              }}
                              className="text-[10px] font-bold text-[#3563E9] hover:underline flex items-center gap-1"
                            >
                              <Send className="h-3 w-3" />
                              Outreach
                            </button>

                            <div className="flex items-center gap-1">
                              {canBack && (
                                <button
                                  onClick={(e) => handleAdvanceStage(e, lead, 'backward')}
                                  className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  title="Move to previous stage"
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                </button>
                              )}
                              {canForward && (
                                <button
                                  onClick={(e) => handleAdvanceStage(e, lead, 'forward')}
                                  className="p-1 rounded bg-blue-50 text-[#3563E9] hover:bg-blue-100"
                                  title="Advance to next stage"
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

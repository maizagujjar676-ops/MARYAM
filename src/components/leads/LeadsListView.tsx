import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  Edit,
  Tag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Send,
  Plus,
  Eye,
  CheckCircle,
  Archive,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { Lead, LeadStatus } from '../../types';

interface LeadsListViewProps {
  onSelectLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onOpenNewLead: () => void;
  onGenerateOutreach: (lead: Lead) => void;
}

export const LeadsListView: React.FC<LeadsListViewProps> = ({
  onSelectLead,
  onEditLead,
  onOpenNewLead,
  onGenerateOutreach,
}) => {
  const { leads, deleteLead, bulkDelete, bulkUpdateStatus, exportLeadsToCSV } = useLeads();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedScoreRange, setSelectedScoreRange] = useState<string>('all');
  const [sortField, setSortField] = useState<'score' | 'name' | 'date' | 'followup'>('score');
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Extract unique industries from actual leads
  const industries = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.industry) set.add(l.industry);
    });
    return Array.from(set).sort();
  }, [leads]);

  // Filtering
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = lead.businessName.toLowerCase().includes(query);
        const matchContact = (lead.contactPerson || '').toLowerCase().includes(query);
        const matchCity = (lead.city || lead.location || '').toLowerCase().includes(query);
        const matchTags = (lead.tags || []).some((t) => t.toLowerCase().includes(query));
        if (!matchName && !matchContact && !matchCity && !matchTags) return false;
      }

      // Status
      if (selectedStatus !== 'all' && lead.status !== selectedStatus) {
        return false;
      }

      // Industry
      if (selectedIndustry !== 'all' && lead.industry !== selectedIndustry) {
        return false;
      }

      // Score range
      if (selectedScoreRange === '80+') {
        if (lead.leadScore < 80) return false;
      } else if (selectedScoreRange === '60-79') {
        if (lead.leadScore < 60 || lead.leadScore >= 80) return false;
      } else if (selectedScoreRange === 'under60') {
        if (lead.leadScore >= 60) return false;
      }

      return true;
    });
  }, [leads, searchTerm, selectedStatus, selectedIndustry, selectedScoreRange]);

  // Sorting
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'score') {
        comparison = b.leadScore - a.leadScore;
      } else if (sortField === 'name') {
        comparison = a.businessName.localeCompare(b.businessName);
      } else if (sortField === 'followup') {
        const dateA = a.nextFollowUpDate || '9999-99-99';
        const dateB = b.nextFollowUpDate || '9999-99-99';
        comparison = dateA.localeCompare(dateB);
      } else {
        // date created
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return sortAsc ? -comparison : comparison;
    });
  }, [filteredLeads, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedLeads.length / pageSize));
  const paginatedLeads = sortedLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSelectToggle = (id: string) => {
    const next = new Set(selectedLeadIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLeadIds(next);
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.size === paginatedLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(paginatedLeads.map((l) => l.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeadIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedLeadIds.size} selected leads?`)) {
      await bulkDelete(Array.from(selectedLeadIds));
      setSelectedLeadIds(new Set());
    }
  };

  const handleBulkStatusChange = async (status: LeadStatus) => {
    if (selectedLeadIds.size === 0) return;
    await bulkUpdateStatus(Array.from(selectedLeadIds), status);
    setSelectedLeadIds(new Set());
  };

  const statusColors: Record<LeadStatus, string> = {
    new: 'bg-gray-100 text-gray-700 border-gray-200',
    qualified: 'bg-blue-100 text-[#3563E9] border-blue-200',
    contacted: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    replied: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    meeting: 'bg-amber-100 text-amber-800 border-amber-200',
    won: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    lost: 'bg-rose-100 text-rose-800 border-rose-200',
    archived: 'bg-stone-100 text-stone-600 border-stone-200',
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">
            Lead Management Database
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Organize, prioritize, and manage {leads.length} business opportunities in one workspace.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportLeadsToCSV(filteredLeads)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-[#F5F7FA] transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-gray-500" />
            Export Filtered ({filteredLeads.length})
          </button>

          <button
            onClick={onOpenNewLead}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3563E9] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#284fcd] transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Lead Manually
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Keyword Search */}
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name, contact, city, or tag..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] pl-9 pr-4 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-[#F5F7FA] px-3 py-2 text-xs font-medium text-gray-700 focus:border-[#3563E9] focus:outline-hidden"
            >
              <option value="all">All Stages</option>
              <option value="new">New</option>
              <option value="qualified">Qualified</option>
              <option value="contacted">Contacted</option>
              <option value="replied">Replied</option>
              <option value="meeting">Meeting</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="archived">Archived</option>
            </select>

            {/* Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={(e) => {
                setSelectedIndustry(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-[#F5F7FA] px-3 py-2 text-xs font-medium text-gray-700 focus:border-[#3563E9] focus:outline-hidden max-w-[160px]"
            >
              <option value="all">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            {/* Score Filter */}
            <select
              value={selectedScoreRange}
              onChange={(e) => {
                setSelectedScoreRange(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-[#F5F7FA] px-3 py-2 text-xs font-medium text-gray-700 focus:border-[#3563E9] focus:outline-hidden"
            >
              <option value="all">All Scores</option>
              <option value="80+">High Fit (80-100)</option>
              <option value="60-79">Moderate (60-79)</option>
              <option value="under60">Review (&lt;60)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-gray-200 bg-[#F5F7FA] p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-[#3563E9]' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Table View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-[#3563E9]' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar (if any selected) */}
        {selectedLeadIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blue-50/80 border border-blue-200 px-3.5 py-2 animate-in fade-in">
            <span className="text-xs font-bold text-[#3563E9]">
              {selectedLeadIds.size} leads selected
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Move to:</span>
              <button
                onClick={() => handleBulkStatusChange('qualified')}
                className="rounded-lg bg-white border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                Qualified
              </button>
              <button
                onClick={() => handleBulkStatusChange('contacted')}
                className="rounded-lg bg-white border border-blue-200 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                Contacted
              </button>
              <button
                onClick={() => handleBulkStatusChange('archived')}
                className="rounded-lg bg-white border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Archive
              </button>
              <button
                onClick={handleBulkDelete}
                className="rounded-lg bg-red-100 border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 ml-2"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table View */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F5F7FA] font-bold text-gray-600 uppercase text-[10px] tracking-wider">
                  <th className="p-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={
                        paginatedLeads.length > 0 &&
                        selectedLeadIds.size === paginatedLeads.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#3563E9] focus:ring-[#3563E9]"
                    />
                  </th>
                  <th
                    onClick={() => {
                      setSortField('name');
                      setSortAsc(!sortAsc);
                    }}
                    className="p-3.5 cursor-pointer hover:text-[#3563E9]"
                  >
                    <div className="flex items-center gap-1">
                      Business Prospect <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="p-3.5">Industry & Region</th>
                  <th
                    onClick={() => {
                      setSortField('score');
                      setSortAsc(!sortAsc);
                    }}
                    className="p-3.5 cursor-pointer hover:text-[#3563E9]"
                  >
                    <div className="flex items-center gap-1">
                      AI Score <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Contact Person</th>
                  <th
                    onClick={() => {
                      setSortField('followup');
                      setSortAsc(!sortAsc);
                    }}
                    className="p-3.5 cursor-pointer hover:text-[#3563E9]"
                  >
                    <div className="flex items-center gap-1">
                      Follow-up <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      No leads match your search criteria. Try adjusting filters or import a CSV file.
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => {
                    const isSelected = selectedLeadIds.has(lead.id);
                    const scoreColor =
                      lead.leadScore >= 80
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : lead.leadScore >= 60
                        ? 'bg-blue-100 text-[#3563E9] border-blue-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200';

                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-[#F2F6FF]/60 transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="p-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectToggle(lead.id)}
                            className="rounded border-gray-300 text-[#3563E9] focus:ring-[#3563E9]"
                          />
                        </td>

                        <td className="p-3.5">
                          <button
                            onClick={() => onSelectLead(lead)}
                            className="font-bold text-[#101828] hover:text-[#3563E9] text-left"
                          >
                            {lead.businessName}
                          </button>
                          {lead.website && (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-gray-400 hover:text-[#3563E9] flex items-center gap-1 mt-0.5"
                            >
                              {lead.website.replace(/^https?:\/\//, '')}
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </td>

                        <td className="p-3.5">
                          <p className="font-medium text-gray-800">{lead.industry}</p>
                          <p className="text-[11px] text-gray-400">{lead.location || lead.city}</p>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${scoreColor}`}
                            title={lead.scoreExplanation}
                          >
                            ★ {lead.leadScore}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                              statusColors[lead.status]
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <p className="font-medium text-gray-800">
                            {lead.contactPerson || 'General Desk'}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[140px]">
                            {lead.email || lead.phone || '—'}
                          </p>
                        </td>

                        <td className="p-3.5">
                          {lead.nextFollowUpDate ? (
                            <span className="text-[11px] font-semibold text-gray-700">
                              {lead.nextFollowUpDate}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Unscheduled</span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onGenerateOutreach(lead)}
                              className="rounded-lg p-1.5 text-[#3563E9] hover:bg-blue-100 transition-colors"
                              title="Draft AI Outreach"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectLead(lead)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onEditLead(lead)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Delete ${lead.businessName}?`)) {
                                  await deleteLead(lead.id);
                                }
                              }}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F5F7FA] px-4 py-3">
            <span className="text-xs text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedLeads.length)} of {sortedLeads.length} leads
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 bg-white p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 bg-white p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedLeads.map((lead) => {
            const scoreColor =
              lead.leadScore >= 80
                ? 'bg-emerald-100 text-emerald-800'
                : lead.leadScore >= 60
                ? 'bg-blue-100 text-[#3563E9]'
                : 'bg-amber-100 text-amber-800';

            return (
              <div
                key={lead.id}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs hover:border-[#3563E9] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        onClick={() => onSelectLead(lead)}
                        className="font-bold text-sm text-[#101828] hover:text-[#3563E9] cursor-pointer"
                      >
                        {lead.businessName}
                      </h3>
                      <p className="text-xs text-gray-500">{lead.industry}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scoreColor}`}>
                      ★ {lead.leadScore}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-gray-600">
                    <p className="truncate">📍 {lead.location || lead.city || 'Location unlisted'}</p>
                    {lead.website && (
                      <p className="truncate">
                        🌐{' '}
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#3563E9] hover:underline"
                        >
                          {lead.website.replace('https://', '')}
                        </a>
                      </p>
                    )}
                    <p className="truncate">👤 {lead.contactPerson || 'Team Lead'}</p>
                  </div>

                  {lead.tags && lead.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {lead.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-[#F2F6FF] text-[#3563E9] px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      statusColors[lead.status]
                    }`}
                  >
                    {lead.status}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onGenerateOutreach(lead)}
                      className="rounded-lg bg-blue-50 p-1.5 text-[#3563E9] hover:bg-blue-100"
                      title="AI Outreach"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="rounded-lg bg-gray-100 p-1.5 text-gray-700 hover:bg-gray-200"
                      title="Inspect"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Send,
  Plus,
  Clock,
  Sparkles,
  ShieldCheck,
  User,
  CheckCircle,
  Tag,
  Trash2,
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { Lead, LeadStatus } from '../../types';

interface LeadDetailsModalProps {
  lead: Lead | null;
  onClose: () => void;
  onGenerateOutreach: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  lead,
  onClose,
  onGenerateOutreach,
  onEditLead,
}) => {
  if (!lead) return null;

  const { updateLead, addLeadNote, deleteLead } = useLeads();
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [followUpDate, setFollowUpDate] = useState(lead.nextFollowUpDate || '');
  const [assignedTo, setAssignedTo] = useState(lead.assignedTo || 'Unassigned');
  const [newTagInput, setNewTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(lead.tags || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveStatus = async (newSt: LeadStatus) => {
    setStatus(newSt);
    await updateLead(lead.id, { status: newSt });
  };

  const handleSaveFollowup = async () => {
    await updateLead(lead.id, { nextFollowUpDate: followUpDate });
  };

  const handleSaveAssigned = async (name: string) => {
    setAssignedTo(name);
    await updateLead(lead.id, { assignedTo: name });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    await addLeadNote(lead.id, newNote.trim());
    setNewNote('');
  };

  const handleAddTag = async () => {
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim().replace(/^#/, '');
    if (!tags.includes(clean)) {
      const updated = [...tags, clean];
      setTags(updated);
      await updateLead(lead.id, { tags: updated });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    await updateLead(lead.id, { tags: updated });
  };

  const scoreBadgeColor =
    lead.leadScore >= 80
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : lead.leadScore >= 60
      ? 'bg-blue-100 text-[#3563E9] border-blue-300'
      : 'bg-amber-100 text-amber-800 border-amber-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-gray-100 my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#E2E8F0] bg-[#F5F7FA] p-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-[#101828]">
                {lead.businessName}
              </h2>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${scoreBadgeColor}`}>
                ★ {lead.leadScore} / 100 AI Score
              </span>
              {lead.isDemoData && (
                <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  Demo Record
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {lead.industry} • Headcount: {lead.companySize || 'Unspecified'} • Source: {lead.dataSource} (Verified {lead.verifiedDate || 'Recently'})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onGenerateOutreach(lead)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3563E9] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#284fcd] transition-all shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              Draft AI Outreach
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#E2E8F0] p-6 gap-6 max-h-[75vh] overflow-y-auto">
          {/* Left Column (2 cols): Contact, Scoring Breakdown & Notes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details Card */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F2F6FF]/50 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Verified Business Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <Building className="h-4 w-4 text-[#3563E9] shrink-0" />
                  <span className="truncate">{lead.businessName}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-[#3563E9] shrink-0" />
                  <span>{lead.location || lead.city || 'Location unlisted'}</span>
                </div>

                {lead.website && (
                  <div className="flex items-center gap-2 text-[#3563E9]">
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline truncate font-medium"
                    >
                      {lead.website}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4 text-[#3563E9] shrink-0" />
                  <span>{lead.contactPerson || 'General Leadership'}</span>
                </div>

                {lead.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}

                {lead.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{lead.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Scoring Factor Breakdown Card */}
            <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#3563E9]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#101828]">
                    Transparent 0–100 AI Lead Scoring Breakdown
                  </h3>
                </div>
                <span className="text-xs font-extrabold text-[#3563E9]">
                  Total: {lead.leadScore}/100
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed bg-[#F5F7FA] p-3 rounded-lg border border-gray-100">
                {lead.scoreExplanation}
              </p>

              {lead.scoreFactors && lead.scoreFactors.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-gray-500 uppercase">
                    Scoring Factor Contributions:
                  </p>
                  {lead.scoreFactors.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-gray-50/80"
                    >
                      <span className="text-gray-700 font-medium">{f.factor}:</span>
                      <span
                        className={`font-bold ${
                          f.points > 0
                            ? 'text-emerald-700'
                            : f.points < 0
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {f.points > 0 ? `+${f.points}` : f.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#101828]">
                Team Notes & Context
              </h3>

              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  placeholder="Record an interaction note, discussion summary, or proposal feedback..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] p-3 text-xs text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="rounded-xl bg-[#3563E9] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#284fcd] disabled:opacity-40 transition-all"
                >
                  Post Note
                </button>
              </form>

              {lead.noteList && lead.noteList.length > 0 && (
                <div className="space-y-2 pt-2">
                  {lead.noteList.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-xl border border-gray-100 bg-[#F5F7FA] p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-semibold text-gray-600">{n.author}</span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {lead.notes && (!lead.noteList || lead.noteList.length === 0) && (
                <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-700 whitespace-pre-wrap">
                  {lead.notes}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 col): Status, Follow-up, Activity */}
          <div className="space-y-6 lg:pl-6">
            {/* Pipeline Stage Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Pipeline Sales Stage
              </label>
              <select
                value={status}
                onChange={(e) => handleSaveStatus(e.target.value as LeadStatus)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3 py-2 text-xs font-bold text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              >
                <option value="new">New Lead</option>
                <option value="qualified">Qualified</option>
                <option value="contacted">Contacted</option>
                <option value="replied">Replied</option>
                <option value="meeting">Meeting Scheduled</option>
                <option value="won">Won Deal</option>
                <option value="lost">Lost</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Next Follow-up Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#3563E9]" />
                Next Scheduled Follow-up
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3 py-1.5 text-xs text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
                />
                <button
                  onClick={handleSaveFollowup}
                  className="rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200"
                >
                  Set
                </button>
              </div>
            </div>

            {/* Assigned Member */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Assigned Team Member
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                onBlur={(e) => handleSaveAssigned(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3 py-2 text-xs text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>

            {/* Tags Manager */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-gray-500" />
                Tags
              </label>
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-[#F2F6FF] px-2 py-0.5 text-[10px] font-semibold text-[#3563E9]"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-[#F5F7FA] px-2.5 py-1 text-xs"
                />
                <button
                  onClick={handleAddTag}
                  className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Activity History Timeline */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                Activity Timeline
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(lead.activityHistory || []).map((act) => (
                  <div key={act.id} className="text-[11px] border-l-2 border-[#3563E9] pl-2.5 py-0.5 space-y-0.5">
                    <p className="font-semibold text-gray-700">{act.description}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(act.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone: Delete */}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={async () => {
                  if (confirm(`Permanently remove ${lead.businessName}?`)) {
                    await deleteLead(lead.id);
                    onClose();
                  }
                }}
                className="w-full rounded-xl border border-red-200 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Prospect Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

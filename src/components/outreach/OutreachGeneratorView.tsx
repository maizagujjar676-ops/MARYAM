import React, { useState, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  Mail,
  Linkedin,
  FileText,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeads } from '../../context/LeadContext';
import { generateOutreachMessage } from '../../lib/outreachTemplates';
import { Lead, OutreachTone, OutreachType } from '../../types';

interface OutreachGeneratorViewProps {
  initialLead?: Lead | null;
  onNavigateToLead?: (lead: Lead) => void;
}

export const OutreachGeneratorView: React.FC<OutreachGeneratorViewProps> = ({
  initialLead,
  onNavigateToLead,
}) => {
  const { profile } = useAuth();
  const { leads, saveOutreachDraft, addLeadNote } = useLeads();

  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    initialLead?.id || (leads[0]?.id || '')
  );
  const [outreachType, setOutreachType] = useState<OutreachType>('cold_email');
  const [outreachTone, setOutreachTone] = useState<OutreachTone>(
    profile?.icpPreferences?.defaultTone || 'consultative'
  );
  const [customOffer, setCustomOffer] = useState(
    'website conversion optimization and tailored client acquisition'
  );
  const [senderName, setSenderName] = useState(profile?.displayName || 'Alex Mercer');
  const [senderCompany, setSenderCompany] = useState(profile?.organizationName || 'LeadPilot');

  const [subject, setSubject] = useState('');
  const [bodyContent, setBodyContent] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  const activeLead = leads.find((l) => l.id === selectedLeadId) || initialLead || leads[0];

  useEffect(() => {
    if (activeLead) {
      handleGenerateDraft(activeLead);
    }
  }, [selectedLeadId, outreachType, outreachTone]);

  const handleGenerateDraft = async (targetLead: Lead) => {
    setIsGenerating(true);
    setCopied(false);
    try {
      const res = await generateOutreachMessage({
        lead: targetLead,
        type: outreachType,
        tone: outreachTone,
        customOffer,
        senderName,
        senderCompany,
      });

      setSubject(res.subject);
      setBodyContent(res.content);
      setReasoning(res.reasoning);
      setIsAiGenerated(res.isAiGenerated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const fullText = subject ? `Subject: ${subject}\n\n${bodyContent}` : bodyContent;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToDrafts = async () => {
    if (!activeLead) return;
    await saveOutreachDraft({
      leadId: activeLead.id,
      businessName: activeLead.businessName,
      type: outreachType,
      tone: outreachTone,
      subject,
      content: bodyContent,
    });

    // Also record in lead activity notes
    await addLeadNote(
      activeLead.id,
      `[AI Outreach Draft Generated - ${outreachType.toUpperCase()} / ${outreachTone}]\nSubject: ${subject}\n\n${bodyContent}`
    );

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">
          AI B2B Outreach Assistant
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Generate authentic, personalized cold emails, LinkedIn inMails, and audit pitches powered by Gemini AI.
        </p>
      </div>

      {/* Compliance Notice */}
      <div className="rounded-2xl border border-blue-200 bg-[#F2F6FF] p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[#3563E9] shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600">
          <p className="font-bold text-[#101828]">Responsible Outreach Discipline</p>
          <p className="mt-0.5">
            Messages are drafted strictly from verified public signals (domain presence, sector focus, public leadership).
            No automated mass-spamming or deceptive claims. Review, personalize, and copy manually.
          </p>
        </div>
      </div>

      {/* Main Workspace (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Lead selector & format settings */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">
              Target Prospect & Configuration
            </h3>

            {/* Lead Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Select Prospect from Pipeline
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-semibold text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.businessName} ({l.industry} • ★ {l.leadScore})
                  </option>
                ))}
              </select>
            </div>

            {/* Active Lead Summary Card */}
            {activeLead && (
              <div className="rounded-xl border border-blue-100 bg-[#F2F6FF]/60 p-3.5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#101828]">{activeLead.businessName}</span>
                  <span className="font-bold text-[#3563E9]">★ {activeLead.leadScore}/100</span>
                </div>
                <p className="text-gray-500">
                  {activeLead.location} • {activeLead.contactPerson || 'General Contact'}
                </p>
                {activeLead.website && (
                  <p className="text-[#3563E9] truncate font-medium">{activeLead.website}</p>
                )}
              </div>
            )}

            {/* Outreach Type Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Outreach Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'cold_email', label: 'Cold Email', icon: Mail },
                  { id: 'linkedin', label: 'LinkedIn Pitch', icon: Linkedin },
                  { id: 'followup', label: 'Follow-Up Note', icon: Clock },
                  { id: 'website_audit', label: 'Website Audit', icon: FileText },
                  { id: 'marketing_proposal', label: 'Proposal Brief', icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = outreachType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOutreachType(item.id as OutreachType)}
                      className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold text-left transition-all ${
                        isSel
                          ? 'border-[#3563E9] bg-blue-50/80 text-[#3563E9]'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-[#F5F7FA]'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Communication Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'consultative', label: 'Consultative (Advisory)' },
                  { id: 'professional', label: 'Professional (Executive)' },
                  { id: 'direct', label: 'Direct (Low friction)' },
                  { id: 'friendly', label: 'Friendly (Warm)' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setOutreachTone(t.id as OutreachTone)}
                    className={`rounded-xl border py-2 px-2.5 text-xs font-semibold text-center transition-all ${
                      outreachTone === t.id
                        ? 'border-[#3563E9] bg-blue-50 text-[#3563E9]'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Value Proposition */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Your Core Service or Value Proposition
              </label>
              <input
                type="text"
                value={customOffer}
                onChange={(e) => setCustomOffer(e.target.value)}
                placeholder="e.g. website development, CRO audit, B2B software engineering"
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>

            {/* Sender Sign-off details */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Your Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3 py-1.5 text-xs text-[#101828]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Your Agency / Firm</label>
                <input
                  type="text"
                  value={senderCompany}
                  onChange={(e) => setSenderCompany(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3 py-1.5 text-xs text-[#101828]"
                />
              </div>
            </div>

            <button
              onClick={() => activeLead && handleGenerateDraft(activeLead)}
              disabled={isGenerating || !activeLead}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3563E9] py-2.5 text-xs font-bold text-white hover:bg-[#284fcd] disabled:opacity-50 transition-all shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Synthesizing with Gemini...' : 'Regenerate Outreach'}
            </button>
          </div>
        </div>

        {/* Right Column (7 cols): Draft Editor & Live Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 md:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#3563E9]" />
                <span className="font-bold text-xs uppercase tracking-wider text-gray-700">
                  {isAiGenerated ? 'Gemini AI Draft' : 'Smart Structured Draft'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToDrafts}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Bookmark className="h-3.5 w-3.5 text-gray-500" />
                  {savedSuccess ? 'Saved to Lead ✓' : 'Save to Lead'}
                </button>

                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#3563E9] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#284fcd] transition-all shadow-xs"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy Draft'}
                </button>
              </div>
            </div>

            {/* Subject Line (if applicable) */}
            {outreachType !== 'linkedin' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-semibold text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
                />
              </div>
            )}

            {/* Message Body */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                Editable Message Body
              </label>
              <textarea
                rows={13}
                value={bodyContent}
                onChange={(e) => setBodyContent(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] p-4 text-xs font-mono leading-relaxed text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>

            {/* Personalization Strategy Explanation */}
            {reasoning && (
              <div className="rounded-xl border border-gray-100 bg-[#F5F7FA] p-3 text-xs text-gray-600">
                <span className="font-bold text-[#101828]">Personalization Angle: </span>
                <span>{reasoning}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

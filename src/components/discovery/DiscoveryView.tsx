import React, { useState } from 'react';
import {
  Search,
  Filter,
  Bookmark,
  Sparkles,
  ShieldCheck,
  Check,
  ExternalLink,
  Plus,
  ArrowRight,
  Info,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { calculateLeadScore } from '../../lib/scoring';
import { DiscoveryFilters, Lead } from '../../types';

interface DiscoveryViewProps {
  onSelectLead: (lead: Lead) => void;
  onOpenImportCsv: () => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  onSelectLead,
  onOpenImportCsv,
}) => {
  const { leads, addLead, saveSearch } = useLeads();

  const [filters, setFilters] = useState<DiscoveryFilters>({
    industry: 'Digital Marketing & PPC',
    location: 'London',
    companySize: '11-50',
    websiteStatus: 'has_website',
    businessType: 'b2b',
    keywords: 'CRO, web design, PPC advertising',
    count: 10,
  });

  const [hasSearched, setHasSearched] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importedSuccess, setImportedSuccess] = useState<string | null>(null);

  // Pool of curated compliant discovery records
  const DISCOVERY_CANDIDATE_POOL: Array<Omit<Lead, 'id' | 'userId' | 'createdAt'>> = [
    {
      businessName: 'Apex Growth Marketing Ltd',
      industry: 'Digital Marketing & PPC',
      location: 'London, United Kingdom',
      city: 'London',
      country: 'United Kingdom',
      companySize: '11-50',
      website: 'https://apex-growth-marketing.co.uk',
      email: 'partnerships@apex-growth-marketing.co.uk',
      phone: '+44 20 7946 0912',
      contactPerson: 'David Sterling (Managing Director)',
      dataSource: 'discovery',
      isDemoData: true,
      verifiedDate: '2026-10-15',
      leadScore: 92,
      status: 'new',
      tags: ['PPC Agency', 'London', 'High Intent'],
      notes: 'Agency expanding into landing page conversion optimization.',
    },
    {
      businessName: 'Vanguard Software Studios',
      industry: 'Software Development',
      location: 'Austin, TX, USA',
      city: 'Austin',
      country: 'United States',
      companySize: '51-200',
      website: 'https://vanguard-software.io',
      email: 'contact@vanguard-software.io',
      phone: '+1 512 555 0184',
      contactPerson: 'Elena Rodriguez (VP Operations)',
      dataSource: 'discovery',
      isDemoData: true,
      verifiedDate: '2026-10-18',
      leadScore: 88,
      status: 'new',
      tags: ['SaaS', 'Austin Tech', 'Cloud'],
      notes: 'Engineering studio looking for frontend contracting support.',
    },
    {
      businessName: 'Kensington Creative Web Agency',
      industry: 'Digital Marketing & PPC',
      location: 'London, United Kingdom',
      city: 'London',
      country: 'United Kingdom',
      companySize: '11-50',
      website: 'https://kensingtoncreative.co.uk',
      email: 'hello@kensingtoncreative.co.uk',
      phone: '+44 20 7946 0451',
      contactPerson: 'Oliver Hughes (Creative Partner)',
      dataSource: 'discovery',
      isDemoData: true,
      verifiedDate: '2026-10-19',
      leadScore: 89,
      status: 'new',
      tags: ['London', 'Branding', 'WordPress'],
      notes: 'Boutique agency specializing in high-net-worth real estate branding.',
    },
    {
      businessName: 'Shoreditch Digital Media Lab',
      industry: 'Digital Marketing & PPC',
      location: 'London, United Kingdom',
      city: 'London',
      country: 'United Kingdom',
      companySize: '1-10',
      website: 'https://shoreditchdigital.io',
      email: 'leads@shoreditchdigital.io',
      phone: '+44 20 7946 0889',
      contactPerson: 'Mia Zhang (Founder)',
      dataSource: 'discovery',
      isDemoData: true,
      verifiedDate: '2026-10-14',
      leadScore: 81,
      status: 'new',
      tags: ['Social Ads', 'London', 'Startup'],
      notes: 'Early-stage performance agency with fast decision timeline.',
    },
    {
      businessName: 'Thames Valley Web & IT Solutions',
      industry: 'Software Development',
      location: 'Reading, United Kingdom',
      city: 'Reading',
      country: 'United Kingdom',
      companySize: '11-50',
      website: 'https://thamesvalleyit.co.uk',
      email: 'info@thamesvalleyit.co.uk',
      phone: '+44 118 496 0192',
      contactPerson: 'Robert Evans (Technical Lead)',
      dataSource: 'discovery',
      isDemoData: true,
      verifiedDate: '2026-10-16',
      leadScore: 78,
      status: 'new',
      tags: ['IT Services', 'Cloud', 'Midlands'],
      notes: 'Focusing on enterprise cloud migration and corporate intranet.',
    },
    {
      businessName: 'Bavaria Automation Labs',
      industry: 'Manufacturing & Supply Chain',
      location: 'Munich, Germany',
      city: 'Munich',
      country: 'Germany',
      companySize: '51-200',
      website: 'https://bavaria-automation.de',
      email: 'kontakt@bavaria-automation.de',
      phone: '+49 89 5550 4912',
      contactPerson: 'Stefan Krause (Managing Director)',
      dataSource: 'discovery',
      isDemoData: true,
      verifiedDate: '2026-10-11',
      leadScore: 74,
      status: 'new',
      tags: ['Industrial', 'Munich', 'Automation'],
      notes: 'Looking for modern web portal for supplier parts ordering.',
    },
    {
      businessName: 'Pacific Coast Dental Specialists',
      industry: 'Healthcare & Medical',
      location: 'San Diego, CA, USA',
      city: 'San Diego',
      country: 'United States',
      companySize: '11-50',
      website: 'https://pacificcoastdentalcare.com',
      email: 'contact@pacificcoastdentalcare.com',
      phone: '+1 619 555 0167',
      contactPerson: 'Dr. Rebecca Vance (Clinical Director)',
      dataSource: 'discovery',
      isDemoData: true,
      verifiedDate: '2026-10-17',
      leadScore: 80,
      status: 'new',
      tags: ['Healthcare', 'Local SEO', 'Appointment UX'],
      notes: 'Multi-doctor clinic planning modern booking UX integration.',
    },
  ];

  // Dynamic discovery results filtered and scored against user input criteria
  const candidateResults = DISCOVERY_CANDIDATE_POOL.map((candidate, idx) => {
    const scored = calculateLeadScore(candidate, {
      targetIndustry: filters.industry,
      targetLocation: filters.location,
      targetCompanySize: filters.companySize,
      hasWebsiteRequired: filters.websiteStatus === 'has_website',
      idealKeywords: filters.keywords.split(',').map((k) => k.trim()),
    });

    return {
      ...candidate,
      id: `disc_${idx}`,
      leadScore: scored.score,
      scoreExplanation: scored.explanation,
      scoreFactors: scored.factors,
    };
  })
    .sort((a, b) => b.leadScore - a.leadScore)
    .slice(0, filters.count);

  const handleRunSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
      setSelectedIds(new Set());
    }, 400);
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === candidateResults.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(candidateResults.map((r) => r.id)));
    }
  };

  const handleImportSelected = async () => {
    const selectedLeads = candidateResults.filter((r) => selectedIds.has(r.id));
    if (selectedLeads.length === 0) return;

    for (const lead of selectedLeads) {
      await addLead({
        businessName: lead.businessName,
        industry: lead.industry,
        location: lead.location,
        city: lead.city,
        country: lead.country,
        companySize: lead.companySize,
        website: lead.website,
        email: lead.email,
        phone: lead.phone,
        contactPerson: lead.contactPerson,
        dataSource: 'discovery',
        isDemoData: true,
        verifiedDate: lead.verifiedDate,
        leadScore: lead.leadScore,
        scoreExplanation: lead.scoreExplanation,
        scoreFactors: lead.scoreFactors,
        status: 'new',
        tags: lead.tags,
        notes: lead.notes,
        estimatedDealValue: 3500,
      });
    }

    setImportedSuccess(`Successfully imported ${selectedLeads.length} leads into your sales pipeline.`);
    setSelectedIds(new Set());
    setTimeout(() => setImportedSuccess(null), 4000);
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) return;
    await saveSearch({
      name: searchName.trim(),
      industry: filters.industry,
      location: filters.location,
      companySize: filters.companySize,
      hasWebsite: filters.websiteStatus === 'has_website',
      keywords: filters.keywords,
      resultsCount: candidateResults.length,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setSaveModalOpen(false);
      setSearchName('');
    }, 1500);
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">
            AI Lead Discovery Engine
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Identify verified commercial prospects matching your Ideal Customer Profile with transparent qualification scoring.
          </p>
        </div>

        <button
          onClick={onOpenImportCsv}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-[#F5F7FA] transition-colors"
        >
          <Info className="h-3.5 w-3.5 text-blue-600" />
          Import Custom CSV Lists
        </button>
      </div>

      {/* Compliance & Provenance Banner */}
      <div className="rounded-2xl border border-blue-200 bg-[#F2F6FF] p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[#3563E9] shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold text-[#101828]">
            Compliance & Data Provenance Notice
          </p>
          <p className="text-gray-600 mt-0.5 leading-relaxed">
            LeadPilot AI operates with zero fabricated data. In this sandbox environment, all prospect records
            are modeled on verified commercial structures and clearly labeled as demo data. You can import your own
            licensed customer lists using our CSV import tool anytime.
          </p>
        </div>
      </div>

      {importedSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
          {importedSuccess}
        </div>
      )}

      {/* Search Configuration Card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 md:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[#3563E9]" />
            <span className="font-bold text-xs uppercase tracking-wider text-gray-700">
              Target Ideal Customer Profile (ICP) Criteria
            </span>
          </div>

          <button
            onClick={() => {
              setSearchName(`${filters.industry} in ${filters.location || 'Global'}`);
              setSaveModalOpen(true);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#3563E9] hover:underline"
          >
            <Bookmark className="h-3 w-3" />
            Save This Search
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Industry or Business Category
            </label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2.5 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
            >
              <option value="Digital Marketing & PPC">Digital Marketing & PPC</option>
              <option value="Software Development">Software Development & SaaS</option>
              <option value="Healthcare & Medical">Healthcare Clinics & Dental</option>
              <option value="Retail & E-Commerce">Retail & E-Commerce Brands</option>
              <option value="Real Estate & Property">Real Estate & Property Advisors</option>
              <option value="Manufacturing & Supply Chain">Manufacturing & Logistics</option>
              <option value="Professional & Legal Services">Professional & Legal Services</option>
              <option value="Hospitality & Dining">Hospitality & Dining Groups</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Target Country, City, or Region
            </label>
            <input
              type="text"
              placeholder="e.g. London, Austin, Toronto, Singapore"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Company Headcount Size
            </label>
            <select
              value={filters.companySize}
              onChange={(e) => setFilters({ ...filters, companySize: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2.5 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
            >
              <option value="1-10">1–10 employees (Boutique)</option>
              <option value="11-50">11–50 employees (Mid-Market)</option>
              <option value="51-200">51–200 employees (Scaleup)</option>
              <option value="201-500">201–500 employees (Enterprise)</option>
              <option value="500+">500+ employees (Corporate)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Website Availability
            </label>
            <select
              value={filters.websiteStatus}
              onChange={(e) =>
                setFilters({ ...filters, websiteStatus: e.target.value as DiscoveryFilters['websiteStatus'] })
              }
              className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2.5 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
            >
              <option value="all">Any Website Status</option>
              <option value="has_website">Active Verified Domain</option>
              <option value="needs_redesign">Outdated / Needs Redesign Gap</option>
              <option value="no_website">No Official Website Listed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Keywords Describing Ideal Customer
            </label>
            <input
              type="text"
              placeholder="e.g. CRO, WordPress, React, Local SEO, B2B"
              value={filters.keywords}
              onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Quantity Requested
            </label>
            <select
              value={filters.count}
              onChange={(e) => setFilters({ ...filters, count: Number(e.target.value) })}
              className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2.5 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
            >
              <option value={5}>5 prospects</option>
              <option value={10}>10 prospects</option>
              <option value={25}>25 prospects</option>
              <option value={50}>50 prospects</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between pt-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            Example: “Find 50 digital marketing agencies in London that may need website development services.”
          </p>

          <button
            onClick={handleRunSearch}
            disabled={isSearching}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3563E9] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#284fcd] transition-all disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {isSearching ? 'Evaluating Signals...' : 'Run Lead Discovery'}
          </button>
        </div>
      </div>

      {/* Results Header & Batch Controls */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm text-[#101828]">
                Discovered Prospects ({candidateResults.length})
              </span>
              <span className="text-xs text-gray-500">
                Sorted by AI Qualification Fit (0–100)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                {selectedIds.size === candidateResults.length ? 'Deselect All' : 'Select All'}
              </button>

              <button
                onClick={handleImportSelected}
                disabled={selectedIds.size === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#3563E9] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#284fcd] disabled:opacity-40 transition-all shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Import Selected ({selectedIds.size}) to Pipeline
              </button>
            </div>
          </div>

          {/* Results Table & Cards */}
          <div className="space-y-3">
            {candidateResults.map((lead) => {
              const isSelected = selectedIds.has(lead.id);
              const scoreBadgeColor =
                lead.leadScore >= 80
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : lead.leadScore >= 60
                  ? 'bg-blue-100 text-[#3563E9] border-blue-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200';

              return (
                <div
                  key={lead.id}
                  className={`group rounded-2xl border p-4 sm:p-5 transition-all bg-white ${
                    isSelected ? 'border-[#3563E9] ring-2 ring-[#3563E9]/10' : 'border-[#E2E8F0] hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(lead.id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#3563E9] focus:ring-[#3563E9]"
                      />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-sm text-[#101828]">
                            {lead.businessName}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreBadgeColor}`}>
                            ★ {lead.leadScore} / 100 Match
                          </span>
                          <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {lead.companySize} employees
                          </span>
                        </div>

                        <p className="text-xs text-gray-600">
                          {lead.industry} • {lead.location}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                          {lead.website && (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#3563E9] hover:underline flex items-center gap-1 font-medium"
                            >
                              {lead.website.replace('https://', '')}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <span>Contact: {lead.contactPerson || 'Public Inquiries'}</span>
                          <span>Verified: {lead.verifiedDate}</span>
                        </div>

                        {/* Transparent score explanation */}
                        <div className="mt-2 rounded-xl bg-[#F5F7FA] p-2.5 text-xs text-gray-600 border border-gray-100">
                          <span className="font-semibold text-gray-700">AI Scoring Rationale: </span>
                          <span>{lead.scoreExplanation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                      <button
                        onClick={() =>
                          onSelectLead({
                            ...lead,
                            id: `lead_temp_${lead.businessName.replace(/\s+/g, '')}`,
                            userId: 'discovery',
                            createdAt: new Date().toISOString(),
                          })
                        }
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Inspect Dossier
                      </button>

                      <button
                        onClick={async () => {
                          await addLead({
                            ...lead,
                            dataSource: 'discovery',
                            isDemoData: true,
                            status: 'new',
                            estimatedDealValue: 4000,
                          });
                          setImportedSuccess(`Added ${lead.businessName} to pipeline!`);
                          setTimeout(() => setImportedSuccess(null), 3000);
                        }}
                        className="rounded-lg bg-[#3563E9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#284fcd] transition-all shadow-2xs"
                      >
                        + Add to Pipeline
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Search Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
            <h3 className="text-base font-bold text-[#101828]">Save Search Criteria</h3>
            <p className="text-xs text-gray-500 mt-1">
              Store these query filters to quickly rerun discovery and track new businesses over time.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-700 mb-1">Search Name</label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F5F7FA] px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              />
            </div>

            <div className="mt-3 rounded-xl bg-gray-50 p-3 text-[11px] text-gray-500 space-y-1">
              <div>Industry: <strong className="text-gray-700">{filters.industry}</strong></div>
              <div>Location: <strong className="text-gray-700">{filters.location || 'Any'}</strong></div>
              <div>Size: <strong className="text-gray-700">{filters.companySize}</strong></div>
            </div>

            {savedSuccess ? (
              <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 text-center">
                Search Saved Successfully!
              </div>
            ) : (
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setSaveModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSearch}
                  className="rounded-xl bg-[#3563E9] px-4 py-2 text-xs font-bold text-white hover:bg-[#284fcd]"
                >
                  Save Criteria
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

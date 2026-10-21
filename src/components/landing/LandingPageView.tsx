import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Mail,
  Search,
  Globe2,
  Users2,
  Lock,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface LandingPageViewProps {
  onStartFree: () => void;
  onExploreDemo: () => void;
  onGoToLegal: (tab: 'privacy' | 'terms') => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onStartFree,
  onExploreDemo,
  onGoToLegal,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [previewIndustry, setPreviewIndustry] = useState('Digital Marketing & PPC');
  const [previewCity, setPreviewCity] = useState('London');

  const faqs = [
    {
      q: 'How does LeadPilot AI qualify and score leads?',
      a: 'We use a transparent 0–100 scoring algorithm grounded in verifiable business signals: industry alignment, geographic relevance, company headcount, official web domain availability, and public communication channels. We provide a factor-by-factor points breakdown for every lead so you always know why a score was awarded.',
    },
    {
      q: 'Does LeadPilot AI fabricate or scrape unauthorized personal data?',
      a: 'Never. LeadPilot AI strictly utilizes lawfully available corporate business data, authorized APIs, and user-provided CSV imports. We do not scrape behind login walls, do not fabricate personal email addresses, and maintain strict data provenance tracking with verified dates.',
    },
    {
      q: 'Can I import my existing lead lists and CSV files?',
      a: 'Yes! Our robust CSV import tool lets you upload your own business lists, visually map columns to LeadPilot fields, preview rows, and automatically detect duplicate companies by domain or business name before importing.',
    },
    {
      q: 'How does the AI Outreach Assistant work?',
      a: 'Our outreach generator uses Google Gemini AI to draft authentic, professional cold emails, LinkedIn connection notes, website audit pitches, and follow-up messages based strictly on documented business context. We never generate deceptive personalization or automated spam.',
    },
    {
      q: 'Where is my data stored?',
      a: 'Your leads, notes, and activity history are stored in Google Cloud Firebase Firestore with strict per-user security rules and row-level access control. Only you and your authorized workspace members can access your records.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F2F6FF] text-[#101828]">
      {/* Public Header */}
      <nav className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3563E9] text-white shadow-sm shadow-[#3563E9]/30">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#101828]">
              LeadPilot <span className="text-[#3563E9]">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-600">
            <a href="#features" className="hover:text-[#3563E9] transition-colors">
              Platform Features
            </a>
            <a href="#how-it-works" className="hover:text-[#3563E9] transition-colors">
              How It Works
            </a>
            <a href="#industries" className="hover:text-[#3563E9] transition-colors">
              Industries
            </a>
            <a href="#pricing" className="hover:text-[#3563E9] transition-colors">
              Pricing Plans
            </a>
            <a href="#faq" className="hover:text-[#3563E9] transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExploreDemo}
              className="rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Explore Demo
            </button>
            <button
              onClick={onStartFree}
              className="rounded-xl bg-[#3563E9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#284fcd] shadow-sm transition-all"
            >
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#3563E9] shadow-xs mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered B2B Lead Intelligence & Sales CRM</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-[#101828] sm:text-5xl md:text-6xl leading-[1.12]">
            Turn Business Research Into Your Next Opportunity.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover relevant business prospects, qualify leads with AI, and organize your sales
            pipeline — all in one workspace.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartFree}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#3563E9] px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-[#3563E9]/30 hover:bg-[#284fcd] transition-all"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-7 py-3.5 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors shadow-xs"
            >
              Explore Live Demo
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
              <span>Verified Data Provenance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
              <span>Transparent 0–100 Scoring</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-[#16A34A]" />
              <span>Firebase Cloud Firestore Security</span>
            </div>
          </div>
        </div>

        {/* Interactive Lead Discovery Mockup / Hero Sandbox Preview */}
        <div className="mx-auto mt-14 max-w-5xl rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-6 shadow-xl shadow-blue-900/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Interactive Lead Discovery Engine Preview
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Simulate a real query across international markets and see immediate AI qualification scoring.
              </p>
            </div>
            <button
              onClick={onExploreDemo}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3563E9] hover:underline"
            >
              Launch Full Pipeline Dashboard <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Search bar row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Target Sector</label>
              <select
                value={previewIndustry}
                onChange={(e) => setPreviewIndustry(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-[#F5F7FA] px-3 py-2 text-xs font-semibold text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              >
                <option value="Digital Marketing & PPC">Digital Marketing & PPC</option>
                <option value="Software Development">Software Development & SaaS</option>
                <option value="Healthcare & Medical">Healthcare & Medical</option>
                <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                <option value="Real Estate & Property">Real Estate & Property</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Target Location</label>
              <select
                value={previewCity}
                onChange={(e) => setPreviewCity(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-[#F5F7FA] px-3 py-2 text-xs font-semibold text-[#101828] focus:border-[#3563E9] focus:outline-hidden"
              >
                <option value="London">London, United Kingdom</option>
                <option value="Austin">Austin, TX, USA</option>
                <option value="Toronto">Toronto, Canada</option>
                <option value="Hamburg">Hamburg, Germany</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={onExploreDemo}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3563E9] px-4 py-2 text-xs font-bold text-white hover:bg-[#284fcd] transition-all"
              >
                <Search className="h-3.5 w-3.5" />
                Query 50 Verified Leads
              </button>
            </div>
          </div>

          {/* Sample Result Card */}
          <div className="mt-5 rounded-xl border border-blue-100 bg-[#F2F6FF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#101828]">Apex Growth Marketing Ltd</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  92 / 100 AI Match
                </span>
                <span className="text-[10px] text-gray-500">Verified Oct 15, 2026</span>
              </div>
              <p className="text-xs text-gray-600">
                London, UK • 11–50 employees • Active domain & CRO expansion signal
              </p>
              <p className="text-[11px] text-gray-500 italic">
                Reasoning: Exact sector match (+25), London headquarters (+20), leadership email verified (+15).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onExploreDemo}
                className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                View Full Dossier
              </button>
              <button
                onClick={onExploreDemo}
                className="rounded-lg bg-[#3563E9] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#284fcd]"
              >
                Draft Outreach
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Target Industries Section */}
      <section id="industries" className="border-t border-[#E2E8F0] bg-white py-16 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#3563E9]">
              Target Customer Profiles
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#101828]">
              Engineered for B2B Teams Across Global Markets
            </p>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Whether you are pitching website redesigns, cloud architecture, local marketing, or corporate consulting.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: 'Digital Agencies', desc: 'PPC, SEO, & Content' },
              { title: 'Web Developers', desc: 'Custom apps & CMS' },
              { title: 'Software Houses', desc: 'SaaS & Mobile Dev' },
              { title: 'Consultants', desc: 'Management & Strategy' },
              { title: 'Healthcare', desc: 'Clinics & Practices' },
              { title: 'Real Estate', desc: 'Brokers & Developers' },
            ].map((ind, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-[#F5F7FA] p-3.5 text-center hover:border-blue-300 transition-colors"
              >
                <p className="font-bold text-xs text-[#101828]">{ind.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="border-t border-[#E2E8F0] bg-[#F2F6FF] py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#3563E9]">
              Three-Step Workflow
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#101828]">
              How LeadPilot AI Powers Your Acquisition
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3563E9] text-white font-bold text-base mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-[#101828]">Define Your Target Profile</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Filter by industry category, country, city, employee headcount, and digital presence requirements.
                Import existing CSV files with column mapping.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3563E9] text-white font-bold text-base mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-[#101828]">Qualify with 0–100 AI Scoring</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Inspect transparent factor scores based on documented business signals. Eliminate guesswork and
                focus your sales team on the highest-probability prospects.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3563E9] text-white font-bold text-base mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-[#101828]">Orchestrate Pipeline & Outreach</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Advance opportunities through a 7-stage visual CRM Kanban. Generate tailored cold emails, website audit
                pitches, and follow-ups with Gemini AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="border-t border-[#E2E8F0] bg-white py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#3563E9]">
              Platform Architecture
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#101828]">
              Everything Your Sales Team Needs
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-[#F5F7FA] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-[#3563E9] mb-3">
                <Search className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-[#101828]">AI Lead Discovery</h4>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                Target businesses by country, city, industry vertical, and size. Never scrape behind illegal paywalls.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-[#F5F7FA] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-[#16A34A] mb-3">
                <Target className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-[#101828]">Transparent Scoring</h4>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                Point-by-point factor breakdowns from 0 to 100 based on genuine public signals and fit.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-[#F5F7FA] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600 mb-3">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-[#101828]">7-Stage CRM Pipeline</h4>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                Visual Kanban board tracking New, Qualified, Contacted, Replied, Meeting, Won, and Lost.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-[#F5F7FA] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 mb-3">
                <Mail className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-[#101828]">AI Outreach Assistant</h4>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                Generate professional cold emails, LinkedIn pitches, and website audit proposals in 4 tones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-[#E2E8F0] bg-[#F2F6FF] py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#3563E9]">
              Transparent Pricing Plans
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#101828]">
              Predictable Plans for Growing Teams
            </p>
            <p className="mt-1 text-xs text-gray-500">
              *All pricing tiers are placeholders for product demonstration. No actual billing is executed.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm">
              <h4 className="text-base font-bold text-[#101828]">Free Starter</h4>
              <p className="text-xs text-gray-500 mt-1">For freelancers & solo consultants</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#101828]">$0</span>
                <span className="text-xs text-gray-500">/month</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> Up to 25 stored leads
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> Basic search filters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> Manual CSV import
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> 10 AI outreach drafts/month
                </li>
              </ul>
              <button
                onClick={onStartFree}
                className="mt-8 w-full rounded-xl border border-gray-300 bg-white py-2.5 text-xs font-bold text-[#101828] hover:bg-gray-50 transition-colors"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl border-2 border-[#3563E9] bg-white p-7 shadow-lg shadow-blue-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#3563E9] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Most Popular
              </div>
              <h4 className="text-base font-bold text-[#101828]">Pro Growth</h4>
              <p className="text-xs text-gray-500 mt-1">For marketing agencies & sales reps</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#101828]">$49</span>
                <span className="text-xs text-gray-500">/month (placeholder)</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#3563E9]" /> 500 stored leads
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#3563E9]" /> Advanced industry & geo filters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#3563E9]" /> 0–100 AI Lead Scoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#3563E9]" /> Unlimited AI outreach drafts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#3563E9]" /> Full CSV export & duplicates check
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#3563E9]" /> Saved search monitors
                </li>
              </ul>
              <button
                onClick={onStartFree}
                className="mt-8 w-full rounded-xl bg-[#3563E9] py-2.5 text-xs font-bold text-white hover:bg-[#284fcd] transition-all shadow-xs"
              >
                Start Pro Evaluation
              </button>
            </div>

            {/* Agency */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm">
              <h4 className="text-base font-bold text-[#101828]">Agency Enterprise</h4>
              <p className="text-xs text-gray-500 mt-1">For multi-rep sales teams</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#101828]">$149</span>
                <span className="text-xs text-gray-500">/month (placeholder)</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" /> 2,500 stored leads
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" /> Multi-user team seats (5 seats)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" /> Lead assignments & notes timeline
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" /> Custom ICP scoring profiles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" /> Priority API rate quotas
                </li>
              </ul>
              <button
                onClick={onStartFree}
                className="mt-8 w-full rounded-xl border border-gray-300 bg-white py-2.5 text-xs font-bold text-[#101828] hover:bg-gray-50 transition-colors"
              >
                Contact Agency Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="border-t border-[#E2E8F0] bg-white py-20 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#3563E9]">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#101828]">
              Clear Answers on Compliance, Data, & Workflow
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-[#F5F7FA] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-[#101828]"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-200/60 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#101828] text-white py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3563E9] text-white">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight">
                LeadPilot <span className="text-[#3563E9]">AI</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
              <button
                onClick={() => onGoToLegal('privacy')}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => onGoToLegal('terms')}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <button
                onClick={() => onGoToLegal('privacy')}
                className="hover:text-white transition-colors"
              >
                Data Provenance & Suppression
              </button>
            </div>

            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} LeadPilot AI. Find Better Leads. Close More Deals.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

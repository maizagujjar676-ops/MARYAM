import React, { useState } from 'react';
import { ShieldCheck, FileText, Lock, Globe, CheckCircle2 } from 'lucide-react';

interface LegalPagesProps {
  initialTab?: 'privacy' | 'terms' | 'provenance';
}

export const LegalPages: React.FC<LegalPagesProps> = ({ initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'provenance'>(initialTab);

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Tab Switcher */}
      <div className="flex border-b border-[#E2E8F0] gap-4">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'privacy'
              ? 'border-[#3563E9] text-[#3563E9]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'terms'
              ? 'border-[#3563E9] text-[#3563E9]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Terms of Service
        </button>
        <button
          onClick={() => setActiveTab('provenance')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'provenance'
              ? 'border-[#3563E9] text-[#3563E9]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Data Provenance & Compliance Charter
        </button>
      </div>

      {activeTab === 'privacy' && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 md:p-8 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed">
          <div className="border-b border-gray-100 pb-4">
            <h1 className="text-xl font-bold text-[#101828]">LeadPilot AI Privacy Policy</h1>
            <p className="text-gray-400 mt-1">Last Updated: October 2026</p>
          </div>

          <section className="space-y-2">
            <h2 className="font-bold text-sm text-[#101828]">1. Introduction & Ethical Stance</h2>
            <p>
              LeadPilot AI provides B2B sales pipeline management, business intelligence, and AI-assisted communication
              tools. We do not harvest, collect, or store sensitive personal information, private financial records, or non-public
              consumer data. Our lead discovery signals relate strictly to commercial corporate entities, publicly registered
              businesses, and professional business contact points.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-sm text-[#101828]">2. Information Collected & Customer Ownership</h2>
            <p>
              <strong>Account Data:</strong> When you authenticate via Google Sign-In with Firebase Auth, we securely store your email,
              display name, and unique user identifier.
            </p>
            <p>
              <strong>User Pipeline Data:</strong> Business leads, activity notes, tags, and saved search filters are
              stored exclusively in your tenant workspace in Google Cloud Firebase Firestore with row-level security.
              You retain 100% ownership of your imported lists.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-sm text-[#101828]">3. Prohibition of Unauthorized Web Scraping</h2>
            <p>
              LeadPilot AI does not bypass digital access controls, paywalls, or Terms of Service. We utilize strictly
              authorized APIs, verified public company registrations, and user-provided CSV imports.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-sm text-[#101828]">4. Suppression & Opt-Out Rights</h2>
            <p>
              Any business or corporate representative may submit a suppression request via our Workspace Settings
              to exclude their domain or public business email from discovery queries and outreach generation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-sm text-[#101828]">5. Contact & Data Protection Officer</h2>
            <p>
              For privacy inquiries, GDPR data requests, or suppression filings, please reach out to:
              privacy@leadpilot.ai.
            </p>
          </section>
        </div>
      )}

      {activeTab === 'terms' && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 md:p-8 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed">
          <div className="border-b border-gray-100 pb-4">
            <h1 className="text-xl font-bold text-[#101828]">LeadPilot AI Terms of Service</h1>
            <p className="text-gray-400 mt-1">Last Updated: October 2026</p>
          </div>

          <section className="space-y-2">
            <h2 className="font-bold text-sm text-[#101828]">1. Acceptance of Terms</h2>
            <p>
              By accessing LeadPilot AI, you agree to comply with these Terms of Service, applicable laws, and
              ethical B2B communication standards including CAN-SPAM, CASL, and GDPR regulations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-sm text-[#101828]">2. Permitted Use & Anti-Spam Policy</h2>
            <p>
              You agree not to utilize generated outreach drafts to transmit unsolicited bulk communications (spam),
              deceptive personalization, defamatory statements, or fraudulent sales pitches. LeadPilot AI provides
              draft suggestions; the user bears sole responsibility for final transmission and adherence to opt-out disclosures.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-sm text-[#101828]">3. Demonstration & Sandbox Status</h2>
            <p>
              LeadPilot AI provides realistic mock business datasets for demonstration purposes. Users acknowledge that
              sample records are labeled as demo data and must verify individual prospect details before commercial engagement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-bold text-sm text-[#101828]">4. Limitation of Liability</h2>
            <p>
              LeadPilot AI does not guarantee specific sales outcomes, meeting conversions, or revenue gains.
              The service is provided on an "as is" and "as available" basis.
            </p>
          </section>
        </div>
      )}

      {activeTab === 'provenance' && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 md:p-8 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed">
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#3563E9]" />
              <h1 className="text-xl font-bold text-[#101828]">Data Provenance & Compliance Charter</h1>
            </div>
            <p className="text-gray-400 mt-1">Our Core Commitment to Lawful, Transparent B2B Intelligence</p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-blue-100 bg-[#F2F6FF] p-4 space-y-1.5">
              <h3 className="font-bold text-[#101828]">Pillar 1: Data Provenance Tracking</h3>
              <p className="text-gray-600">
                Every record in LeadPilot AI documents its provenance source (Discovery API, CSV Import, or Manual Input)
                along with verified verification timestamps. Users can inspect where and when information was recorded.
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-[#F2F6FF] p-4 space-y-1.5">
              <h3 className="font-bold text-[#101828]">Pillar 2: Zero Fabricated Data</h3>
              <p className="text-gray-600">
                We never synthesize artificial people, unverified executive emails, or bogus telephone numbers. If a
                record is simulated for product demonstration, it is conspicuously tagged with "Demo Record".
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-[#F2F6FF] p-4 space-y-1.5">
              <h3 className="font-bold text-[#101828]">Pillar 3: Transparent 0–100 AI Scoring</h3>
              <p className="text-gray-600">
                We reject black-box propensity scores. Every score is derived from factual, inspectable factors:
                industry vertical match, geographic alignment, company scale, and active web domain availability.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

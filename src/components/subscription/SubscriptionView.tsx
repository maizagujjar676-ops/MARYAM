import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Users,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeads } from '../../context/LeadContext';
import { SubscriptionTier } from '../../types';

export const SubscriptionView: React.FC = () => {
  const { profile, updateUserPlan } = useAuth();
  const { leads, outreachDrafts } = useLeads();

  const currentPlan = profile?.plan || 'free';
  const [selectedPlanModal, setSelectedPlanModal] = useState<SubscriptionTier | null>(null);
  const [simulationSuccess, setSimulationSuccess] = useState(false);

  const limits = {
    free: { maxLeads: 25, maxDrafts: 10, seats: 1 },
    pro: { maxLeads: 500, maxDrafts: 250, seats: 1 },
    agency: { maxLeads: 2500, maxDrafts: 2000, seats: 5 },
  }[currentPlan];

  const handleSimulateUpgrade = async (tier: SubscriptionTier) => {
    await updateUserPlan(tier);
    setSimulationSuccess(true);
    setTimeout(() => {
      setSimulationSuccess(false);
      setSelectedPlanModal(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">
          Subscription & Usage Quotas
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Monitor your active consumption limits and manage plan capabilities.
        </p>
      </div>

      {/* Real-time Usage Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Leads meter */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 uppercase">Leads in Pipeline</span>
            <span className="text-xs font-bold text-[#101828]">
              {leads.length} / {limits.maxLeads}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#3563E9] transition-all duration-500"
              style={{ width: `${Math.min(100, (leads.length / limits.maxLeads) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400">
            {Math.max(0, limits.maxLeads - leads.length)} lead slots remaining on {currentPlan.toUpperCase()}
          </p>
        </div>

        {/* AI Drafts meter */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 uppercase">AI Outreach Drafts</span>
            <span className="text-xs font-bold text-[#101828]">
              {outreachDrafts.length} / {limits.maxDrafts}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-500"
              style={{ width: `${Math.min(100, (outreachDrafts.length / limits.maxDrafts) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400">
            Powered by Gemini AI API quotas
          </p>
        </div>

        {/* Team seats */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 uppercase">Active Workspace Seats</span>
            <span className="text-xs font-bold text-[#101828]">
              1 / {limits.seats} Seat{limits.seats > 1 ? 's' : ''}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(1 / limits.seats) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400">
            {currentPlan === 'agency' ? 'Multi-user collaborative list access' : 'Solo user seat'}
          </p>
        </div>
      </div>

      {/* Disclaimers & Pricing Grid */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Pricing Disclosure:</strong> All proposed prices and billing intervals are demonstration placeholders
          until validated by live commercial billing providers. Upgrading will switch your quota limits in simulation mode without charging any payment method.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Free Starter */}
        <div
          className={`rounded-2xl border p-6 bg-white transition-all ${
            currentPlan === 'free' ? 'border-2 border-[#3563E9] ring-2 ring-[#3563E9]/10' : 'border-[#E2E8F0]'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#101828]">Free Starter</h3>
            {currentPlan === 'free' && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#3563E9] px-2 py-0.5 rounded-full">
                Current Plan
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">For testing workflows</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-[#101828]">$0</span>
            <span className="text-xs text-gray-400">/mo</span>
          </div>

          <ul className="mt-6 space-y-2.5 text-xs text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> 25 stored leads limit
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> Basic search filters
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> Manual CSV import
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> 10 AI outreach drafts
            </li>
          </ul>

          {currentPlan !== 'free' && (
            <button
              onClick={() => setSelectedPlanModal('free')}
              className="mt-8 w-full rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Downgrade to Free
            </button>
          )}
        </div>

        {/* Pro Plan */}
        <div
          className={`relative rounded-2xl border p-6 bg-white transition-all shadow-md ${
            currentPlan === 'pro'
              ? 'border-2 border-[#3563E9] ring-2 ring-[#3563E9]/10'
              : 'border-[#E2E8F0]'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#101828]">Pro Growth</h3>
            {currentPlan === 'pro' ? (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#3563E9] px-2 py-0.5 rounded-full">
                Current Plan
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">For sales reps and agencies</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-[#101828]">$49</span>
            <span className="text-xs text-gray-400">/mo (placeholder)</span>
          </div>

          <ul className="mt-6 space-y-2.5 text-xs text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#3563E9]" /> 500 stored leads
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#3563E9]" /> 0–100 AI Lead Scoring
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#3563E9]" /> 250 AI outreach drafts
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#3563E9]" /> Saved search monitors
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#3563E9]" /> CSV Export & duplicates check
            </li>
          </ul>

          {currentPlan !== 'pro' && (
            <button
              onClick={() => setSelectedPlanModal('pro')}
              className="mt-8 w-full rounded-xl bg-[#3563E9] py-2.5 text-xs font-bold text-white hover:bg-[#284fcd] transition-all shadow-xs"
            >
              Switch to Pro (Simulation)
            </button>
          )}
        </div>

        {/* Agency Plan */}
        <div
          className={`rounded-2xl border p-6 bg-white transition-all ${
            currentPlan === 'agency'
              ? 'border-2 border-purple-500 ring-2 ring-purple-100'
              : 'border-[#E2E8F0]'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#101828]">Agency Enterprise</h3>
            {currentPlan === 'agency' && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Current Plan
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">For multi-rep sales teams</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-[#101828]">$149</span>
            <span className="text-xs text-gray-400">/mo (placeholder)</span>
          </div>

          <ul className="mt-6 space-y-2.5 text-xs text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-600" /> 2,500 stored leads
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-600" /> 5 workspace team seats
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-600" /> 2,000 AI outreach drafts
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-600" /> Custom ICP scoring criteria
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-600" /> Lead assignments & notes log
            </li>
          </ul>

          {currentPlan !== 'agency' && (
            <button
              onClick={() => setSelectedPlanModal('agency')}
              className="mt-8 w-full rounded-xl border border-purple-300 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors"
            >
              Switch to Agency (Simulation)
            </button>
          )}
        </div>
      </div>

      {/* Plan Switch Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-[#101828]">
              Switch Subscription Tier: {selectedPlanModal.toUpperCase()}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Confirm plan update. In this prototype environment, subscription adjustments are immediately simulated without a payment charge.
            </p>

            {simulationSuccess ? (
              <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-center text-xs font-bold text-emerald-800">
                Plan tier updated to {selectedPlanModal.toUpperCase()} successfully!
              </div>
            ) : (
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  onClick={() => setSelectedPlanModal(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSimulateUpgrade(selectedPlanModal)}
                  className="rounded-xl bg-[#3563E9] px-5 py-2 text-xs font-bold text-white hover:bg-[#284fcd]"
                >
                  Confirm Simulation Update
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeadProvider, useLeads } from './context/LeadContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPageView } from './components/landing/LandingPageView';
import { DashboardView } from './components/dashboard/DashboardView';
import { DiscoveryView } from './components/discovery/DiscoveryView';
import { LeadsListView } from './components/leads/LeadsListView';
import { CrmPipelineView } from './components/crm/CrmPipelineView';
import { OutreachGeneratorView } from './components/outreach/OutreachGeneratorView';
import { SavedSearchesView } from './components/saved-searches/SavedSearchesView';
import { SubscriptionView } from './components/subscription/SubscriptionView';
import { SettingsView } from './components/settings/SettingsView';
import { LegalPages } from './components/legal/LegalPages';
import { LeadDetailsModal } from './components/leads/LeadDetailsModal';
import { LeadEditModal } from './components/leads/LeadEditModal';
import { CsvImportModal } from './components/csv/CsvImportModal';
import { AuthModal } from './components/auth/AuthModal';
import { Lead, SavedSearch } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser, isGuest, isLoading } = useAuth();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [showLanding, setShowLanding] = useState<boolean>(!currentUser && !isGuest);

  // Modals state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Pre-selected lead for outreach generator
  const [outreachTargetLead, setOutreachTargetLead] = useState<Lead | null>(null);
  const [legalSubTab, setLegalSubTab] = useState<'privacy' | 'terms' | 'provenance'>('privacy');

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F2F6FF]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#3563E9] border-t-transparent" />
          <p className="text-xs font-bold text-[#101828]">Loading LeadPilot AI...</p>
        </div>
      </div>
    );
  }

  // Show Landing page if explicitly requested or if user is not authenticated and hasn't clicked demo
  if (showLanding && !currentUser && !isGuest) {
    return (
      <>
        <LandingPageView
          onStartFree={() => setIsAuthModalOpen(true)}
          onExploreDemo={() => {
            setShowLanding(false);
            setCurrentTab('dashboard');
          }}
          onGoToLegal={(tab) => {
            setLegalSubTab(tab);
            setShowLanding(false);
            setCurrentTab('legal');
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => setShowLanding(false)}
        />
      </>
    );
  }

  const handleOpenNewLead = () => {
    setLeadToEdit(null);
    setIsEditModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(null);
    setLeadToEdit(lead);
    setIsEditModalOpen(true);
  };

  const handleTriggerOutreach = (lead: Lead) => {
    setSelectedLead(null);
    setOutreachTargetLead(lead);
    setCurrentTab('outreach');
  };

  const handleRunSavedSearch = (search: SavedSearch) => {
    setCurrentTab('discovery');
  };

  return (
    <div className="min-h-screen bg-[#F2F6FF] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenNewLead={handleOpenNewLead}
        onOpenImportCsv={() => setIsImportModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Main Workspace with Responsive Sidebar */}
      <div className="flex flex-1">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <main className="flex-1 overflow-x-hidden">
          {/* Mobile subnav */}
          <div className="lg:hidden flex items-center overflow-x-auto gap-2 p-3 bg-white border-b border-gray-200 text-xs">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'discovery', label: 'Discovery' },
              { id: 'leads', label: 'All Leads' },
              { id: 'crm', label: 'CRM Pipeline' },
              { id: 'outreach', label: 'AI Outreach' },
              { id: 'saved-searches', label: 'Saved Searches' },
              { id: 'subscription', label: 'Subscription' },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1 font-bold transition-colors ${
                  currentTab === tab.id
                    ? 'bg-[#3563E9] text-white'
                    : 'bg-[#F5F7FA] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab View */}
          {currentTab === 'dashboard' && (
            <DashboardView
              onSelectLead={setSelectedLead}
              onNavigate={setCurrentTab}
              onOpenNewLead={handleOpenNewLead}
              onOpenImportCsv={() => setIsImportModalOpen(true)}
            />
          )}

          {currentTab === 'discovery' && (
            <DiscoveryView
              onSelectLead={setSelectedLead}
              onOpenImportCsv={() => setIsImportModalOpen(true)}
            />
          )}

          {currentTab === 'leads' && (
            <LeadsListView
              onSelectLead={setSelectedLead}
              onEditLead={handleEditLead}
              onOpenNewLead={handleOpenNewLead}
              onGenerateOutreach={handleTriggerOutreach}
            />
          )}

          {currentTab === 'crm' && (
            <CrmPipelineView
              onSelectLead={setSelectedLead}
              onOpenNewLead={handleOpenNewLead}
              onGenerateOutreach={handleTriggerOutreach}
            />
          )}

          {currentTab === 'outreach' && (
            <OutreachGeneratorView
              initialLead={outreachTargetLead}
              onNavigateToLead={setSelectedLead}
            />
          )}

          {currentTab === 'saved-searches' && (
            <SavedSearchesView
              onRunSearch={handleRunSavedSearch}
              onNavigateToDiscovery={() => setCurrentTab('discovery')}
            />
          )}

          {currentTab === 'subscription' && <SubscriptionView />}

          {currentTab === 'settings' && <SettingsView />}

          {currentTab === 'legal' && <LegalPages initialTab={legalSubTab} />}
        </main>
      </div>

      {/* Global Modals */}
      <LeadDetailsModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onGenerateOutreach={handleTriggerOutreach}
        onEditLead={handleEditLead}
      />

      <LeadEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setLeadToEdit(null);
        }}
        leadToEdit={leadToEdit}
      />

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setShowLanding(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LeadProvider>
        <MainAppContent />
      </LeadProvider>
    </AuthProvider>
  );
}

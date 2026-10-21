import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { INITIAL_DEMO_LEADS } from '../lib/demoData';
import { calculateLeadScore } from '../lib/scoring';
import { Lead, LeadNote, LeadStatus, OutreachDraft, SavedSearch } from '../types';
import { useAuth } from './AuthContext';

interface LeadContextType {
  leads: Lead[];
  savedSearches: SavedSearch[];
  outreachDrafts: OutreachDraft[];
  loadingLeads: boolean;
  addLead: (leadData: Omit<Lead, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: LeadStatus) => Promise<void>;
  addLeadNote: (leadId: string, content: string) => Promise<void>;
  importLeads: (leadsData: Partial<Lead>[]) => Promise<{ imported: number; duplicates: number }>;
  exportLeadsToCSV: (leadsToExport?: Lead[]) => void;
  saveSearch: (searchData: Omit<SavedSearch, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  deleteSearch: (id: string) => Promise<void>;
  saveOutreachDraft: (draftData: Omit<OutreachDraft, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  deleteOutreachDraft: (id: string) => Promise<void>;
  resetToDemoData: () => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

const LOCAL_STORAGE_LEADS_KEY = 'leadpilot_leads_data';
const LOCAL_STORAGE_SEARCHES_KEY = 'leadpilot_saved_searches';
const LOCAL_STORAGE_DRAFTS_KEY = 'leadpilot_outreach_drafts';

export const LeadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isGuest } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [outreachDrafts, setOutreachDrafts] = useState<OutreachDraft[]>([]);
  const [loadingLeads, setLoadingLeads] = useState<boolean>(true);

  // Initialize data either from Firestore (if user signed in) or LocalStorage (if guest/demo)
  useEffect(() => {
    if (!currentUser && !isGuest) {
      // Not logged in: provide preview leads for landing page
      setLeads(INITIAL_DEMO_LEADS);
      setLoadingLeads(false);
      return;
    }

    if (isGuest) {
      const storedLeads = localStorage.getItem(LOCAL_STORAGE_LEADS_KEY);
      if (storedLeads) {
        try {
          setLeads(JSON.parse(storedLeads));
        } catch {
          setLeads(INITIAL_DEMO_LEADS);
        }
      } else {
        setLeads(INITIAL_DEMO_LEADS);
        localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(INITIAL_DEMO_LEADS));
      }

      const storedSearches = localStorage.getItem(LOCAL_STORAGE_SEARCHES_KEY);
      if (storedSearches) {
        try {
          setSavedSearches(JSON.parse(storedSearches));
        } catch {
          setSavedSearches([]);
        }
      } else {
        const defaultSearches: SavedSearch[] = [
          {
            id: 'search-demo-1',
            userId: 'demo-guest-user',
            name: 'London Digital Agencies',
            industry: 'Digital Marketing & PPC',
            location: 'London',
            companySize: '11-50',
            hasWebsite: true,
            keywords: 'CRO, PPC, web design',
            resultsCount: 14,
            createdAt: '2026-10-18T10:00:00Z',
          },
          {
            id: 'search-demo-2',
            userId: 'demo-guest-user',
            name: 'US Software Engineering Firms',
            industry: 'Software Development',
            location: 'Austin',
            companySize: '51-200',
            hasWebsite: true,
            keywords: 'SaaS, backend, React',
            resultsCount: 22,
            createdAt: '2026-10-19T14:30:00Z',
          },
        ];
        setSavedSearches(defaultSearches);
        localStorage.setItem(LOCAL_STORAGE_SEARCHES_KEY, JSON.stringify(defaultSearches));
      }

      const storedDrafts = localStorage.getItem(LOCAL_STORAGE_DRAFTS_KEY);
      if (storedDrafts) {
        try {
          setOutreachDrafts(JSON.parse(storedDrafts));
        } catch {
          setOutreachDrafts([]);
        }
      }

      setLoadingLeads(false);
      return;
    }

    // Authenticated Firestore listener
    if (!currentUser) return;
    const userId = currentUser.uid;
    const leadsQuery = query(collection(db, 'leads'), where('userId', '==', userId));

    const unsubLeads = onSnapshot(
      leadsQuery,
      (snapshot) => {
        const remoteLeads: Lead[] = [];
        snapshot.forEach((doc) => {
          remoteLeads.push({ id: doc.id, ...(doc.data() as Omit<Lead, 'id'>) });
        });

        // If user is brand new with 0 leads in Firestore, pre-seed demo dataset for them
        if (remoteLeads.length === 0 && !localStorage.getItem(`leadpilot_seeded_${userId}`)) {
          localStorage.setItem(`leadpilot_seeded_${userId}`, 'true');
          const seeded = INITIAL_DEMO_LEADS.map((l, index) => ({
            ...l,
            id: `lead_${Date.now()}_${index}`,
            userId: userId,
          }));
          seeded.forEach(async (ld) => {
            try {
              await setDoc(doc(db, 'leads', ld.id), ld);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `leads/${ld.id}`);
            }
          });
          setLeads(seeded);
        } else {
          setLeads(remoteLeads);
        }
        setLoadingLeads(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'leads');
        setLoadingLeads(false);
      }
    );

    const searchesQuery = query(collection(db, 'saved_searches'), where('userId', '==', userId));
    const unsubSearches = onSnapshot(
      searchesQuery,
      (snapshot) => {
        const remoteSearches: SavedSearch[] = [];
        snapshot.forEach((doc) => {
          remoteSearches.push({ id: doc.id, ...(doc.data() as Omit<SavedSearch, 'id'>) });
        });
        setSavedSearches(remoteSearches);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'saved_searches');
      }
    );

    const draftsQuery = query(collection(db, 'outreach_drafts'), where('userId', '==', userId));
    const unsubDrafts = onSnapshot(
      draftsQuery,
      (snapshot) => {
        const remoteDrafts: OutreachDraft[] = [];
        snapshot.forEach((doc) => {
          remoteDrafts.push({ id: doc.id, ...(doc.data() as Omit<OutreachDraft, 'id'>) });
        });
        setOutreachDrafts(remoteDrafts);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'outreach_drafts');
      }
    );

    return () => {
      unsubLeads();
      unsubSearches();
      unsubDrafts();
    };
  }, [currentUser, isGuest]);

  const saveLocalLeads = (newLeads: Lead[]) => {
    setLeads(newLeads);
    localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(newLeads));
  };

  const addLead = async (leadData: Omit<Lead, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const userId = currentUser ? currentUser.uid : 'demo-guest-user';
    const newId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newLead: Lead = {
      ...leadData,
      id: newId,
      userId,
      createdAt: now,
      updatedAt: now,
      activityHistory: [
        {
          id: `act_${Date.now()}`,
          type: 'created',
          description: `Lead created via ${leadData.dataSource}`,
          timestamp: now,
        },
      ],
    };

    if (isGuest || !currentUser) {
      saveLocalLeads([newLead, ...leads]);
      return newId;
    }

    try {
      await setDoc(doc(db, 'leads', newId), newLead);
      return newId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `leads/${newId}`);
      return newId;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>): Promise<void> => {
    const now = new Date().toISOString();
    const existingLead = leads.find((l) => l.id === id);
    if (!existingLead) return;

    let updatedActivities = existingLead.activityHistory || [];
    if (updates.status && updates.status !== existingLead.status) {
      updatedActivities = [
        ...updatedActivities,
        {
          id: `act_${Date.now()}`,
          type: 'status_change',
          description: `Stage changed from ${existingLead.status} to ${updates.status}`,
          timestamp: now,
        },
      ];
    }

    const mergedLead: Lead = {
      ...existingLead,
      ...updates,
      updatedAt: now,
      activityHistory: updatedActivities,
    };

    if (isGuest || !currentUser) {
      saveLocalLeads(leads.map((l) => (l.id === id ? mergedLead : l)));
      return;
    }

    try {
      await setDoc(doc(db, 'leads', id), mergedLead, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${id}`);
    }
  };

  const addLeadNote = async (leadId: string, content: string): Promise<void> => {
    const existingLead = leads.find((l) => l.id === leadId);
    if (!existingLead) return;

    const now = new Date().toISOString();
    const newNote: LeadNote = {
      id: `note_${Date.now()}`,
      content,
      createdAt: now,
      author: currentUser?.displayName || 'User',
    };

    const updatedNotes = [...(existingLead.noteList || []), newNote];
    const updatedActivities = [
      ...(existingLead.activityHistory || []),
      {
        id: `act_${Date.now()}`,
        type: 'note_added' as const,
        description: `Note added: "${content.slice(0, 40)}${content.length > 40 ? '...' : ''}"`,
        timestamp: now,
      },
    ];

    await updateLead(leadId, {
      noteList: updatedNotes,
      activityHistory: updatedActivities,
      notes: (existingLead.notes ? existingLead.notes + '\n\n' : '') + content,
    });
  };

  const deleteLead = async (id: string): Promise<void> => {
    if (isGuest || !currentUser) {
      saveLocalLeads(leads.filter((l) => l.id !== id));
      return;
    }

    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
    }
  };

  const bulkDelete = async (ids: string[]): Promise<void> => {
    const idSet = new Set(ids);
    if (isGuest || !currentUser) {
      saveLocalLeads(leads.filter((l) => !idSet.has(l.id)));
      return;
    }

    for (const id of ids) {
      try {
        await deleteDoc(doc(db, 'leads', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `leads/${id}`);
      }
    }
  };

  const bulkUpdateStatus = async (ids: string[], status: LeadStatus): Promise<void> => {
    const idSet = new Set(ids);
    const now = new Date().toISOString();

    if (isGuest || !currentUser) {
      const updated = leads.map((l) => {
        if (idSet.has(l.id)) {
          return {
            ...l,
            status,
            updatedAt: now,
            activityHistory: [
              ...(l.activityHistory || []),
              {
                id: `act_${Date.now()}`,
                type: 'status_change' as const,
                description: `Bulk moved to ${status}`,
                timestamp: now,
              },
            ],
          };
        }
        return l;
      });
      saveLocalLeads(updated);
      return;
    }

    for (const id of ids) {
      const existing = leads.find((l) => l.id === id);
      if (existing) {
        try {
          await setDoc(
            doc(db, 'leads', id),
            {
              status,
              updatedAt: now,
            },
            { merge: true }
          );
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `leads/${id}`);
        }
      }
    }
  };

  const importLeads = async (
    leadsData: Partial<Lead>[]
  ): Promise<{ imported: number; duplicates: number }> => {
    let duplicateCount = 0;
    const newLeadsToAdd: Lead[] = [];
    const userId = currentUser ? currentUser.uid : 'demo-guest-user';
    const now = new Date().toISOString();

    const existingNames = new Set(leads.map((l) => l.businessName.toLowerCase().trim()));
    const existingWebsites = new Set(
      leads.map((l) => (l.website ? l.website.toLowerCase().replace(/https?:\/\//, '').replace(/\/$/, '') : ''))
    );

    for (const item of leadsData) {
      if (!item.businessName) continue;

      const normName = item.businessName.toLowerCase().trim();
      const normWeb = item.website
        ? item.website.toLowerCase().replace(/https?:\/\//, '').replace(/\/$/, '')
        : '';

      if (existingNames.has(normName) || (normWeb && existingWebsites.has(normWeb))) {
        duplicateCount++;
        continue;
      }

      const scoreCalc = calculateLeadScore(item);
      const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const newLead: Lead = {
        id: leadId,
        userId,
        businessName: item.businessName,
        industry: item.industry || 'Professional Services',
        location: item.location || item.city || 'United States',
        city: item.city || '',
        country: item.country || '',
        companySize: item.companySize || '11-50',
        website: item.website || '',
        email: item.email || '',
        phone: item.phone || '',
        contactPerson: item.contactPerson || '',
        dataSource: 'csv_import',
        isDemoData: false,
        verifiedDate: now.slice(0, 10),
        leadScore: scoreCalc.score,
        scoreExplanation: scoreCalc.explanation,
        scoreFactors: scoreCalc.factors,
        status: item.status || 'new',
        tags: item.tags || ['CSV Import'],
        assignedTo: item.assignedTo || 'Unassigned',
        nextFollowUpDate: item.nextFollowUpDate || '',
        notes: item.notes || 'Imported via CSV file.',
        createdAt: now,
        updatedAt: now,
        activityHistory: [
          {
            id: `act_${Date.now()}`,
            type: 'created',
            description: 'Imported from CSV file with column mapping',
            timestamp: now,
          },
        ],
      };

      newLeadsToAdd.push(newLead);
      existingNames.add(normName);
      if (normWeb) existingWebsites.add(normWeb);
    }

    if (isGuest || !currentUser) {
      saveLocalLeads([...newLeadsToAdd, ...leads]);
    } else {
      for (const ld of newLeadsToAdd) {
        try {
          await setDoc(doc(db, 'leads', ld.id), ld);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `leads/${ld.id}`);
        }
      }
    }

    return { imported: newLeadsToAdd.length, duplicates: duplicateCount };
  };

  const exportLeadsToCSV = (leadsToExport?: Lead[]) => {
    const exportList = leadsToExport || leads;
    if (exportList.length === 0) return;

    const headers = [
      'Business Name',
      'Industry',
      'Location',
      'City',
      'Country',
      'Website',
      'Email',
      'Phone',
      'Contact Person',
      'Lead Score',
      'Status',
      'Company Size',
      'Data Source',
      'Next Follow-up',
      'Tags',
      'Notes',
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = exportList.map((l) => [
      escapeCsv(l.businessName),
      escapeCsv(l.industry),
      escapeCsv(l.location),
      escapeCsv(l.city),
      escapeCsv(l.country),
      escapeCsv(l.website),
      escapeCsv(l.email),
      escapeCsv(l.phone),
      escapeCsv(l.contactPerson),
      escapeCsv(l.leadScore),
      escapeCsv(l.status),
      escapeCsv(l.companySize),
      escapeCsv(l.dataSource),
      escapeCsv(l.nextFollowUpDate),
      escapeCsv(l.tags?.join('; ')),
      escapeCsv(l.notes),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leadpilot-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveSearch = async (
    searchData: Omit<SavedSearch, 'id' | 'userId' | 'createdAt'>
  ): Promise<string> => {
    const userId = currentUser ? currentUser.uid : 'demo-guest-user';
    const newId = `search_${Date.now()}`;
    const newSearch: SavedSearch = {
      ...searchData,
      id: newId,
      userId,
      createdAt: new Date().toISOString(),
    };

    if (isGuest || !currentUser) {
      const updated = [newSearch, ...savedSearches];
      setSavedSearches(updated);
      localStorage.setItem(LOCAL_STORAGE_SEARCHES_KEY, JSON.stringify(updated));
      return newId;
    }

    try {
      await setDoc(doc(db, 'saved_searches', newId), newSearch);
      return newId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `saved_searches/${newId}`);
      return newId;
    }
  };

  const deleteSearch = async (id: string): Promise<void> => {
    if (isGuest || !currentUser) {
      const updated = savedSearches.filter((s) => s.id !== id);
      setSavedSearches(updated);
      localStorage.setItem(LOCAL_STORAGE_SEARCHES_KEY, JSON.stringify(updated));
      return;
    }

    try {
      await deleteDoc(doc(db, 'saved_searches', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `saved_searches/${id}`);
    }
  };

  const saveOutreachDraft = async (
    draftData: Omit<OutreachDraft, 'id' | 'userId' | 'createdAt'>
  ): Promise<string> => {
    const userId = currentUser ? currentUser.uid : 'demo-guest-user';
    const newId = `draft_${Date.now()}`;
    const newDraft: OutreachDraft = {
      ...draftData,
      id: newId,
      userId,
      createdAt: new Date().toISOString(),
    };

    if (isGuest || !currentUser) {
      const updated = [newDraft, ...outreachDrafts];
      setOutreachDrafts(updated);
      localStorage.setItem(LOCAL_STORAGE_DRAFTS_KEY, JSON.stringify(updated));
      return newId;
    }

    try {
      await setDoc(doc(db, 'outreach_drafts', newId), newDraft);
      return newId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `outreach_drafts/${newId}`);
      return newId;
    }
  };

  const deleteOutreachDraft = async (id: string): Promise<void> => {
    if (isGuest || !currentUser) {
      const updated = outreachDrafts.filter((d) => d.id !== id);
      setOutreachDrafts(updated);
      localStorage.setItem(LOCAL_STORAGE_DRAFTS_KEY, JSON.stringify(updated));
      return;
    }

    try {
      await deleteDoc(doc(db, 'outreach_drafts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `outreach_drafts/${id}`);
    }
  };

  const resetToDemoData = () => {
    if (isGuest || !currentUser) {
      saveLocalLeads(INITIAL_DEMO_LEADS);
    }
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        savedSearches,
        outreachDrafts,
        loadingLeads,
        addLead,
        updateLead,
        deleteLead,
        bulkDelete,
        bulkUpdateStatus,
        addLeadNote,
        importLeads,
        exportLeadsToCSV,
        saveSearch,
        deleteSearch,
        saveOutreachDraft,
        deleteOutreachDraft,
        resetToDemoData,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};

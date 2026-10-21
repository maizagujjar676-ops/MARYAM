export type LeadStatus =
  | 'new'
  | 'qualified'
  | 'contacted'
  | 'replied'
  | 'meeting'
  | 'won'
  | 'lost'
  | 'archived';

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export type OutreachType =
  | 'cold_email'
  | 'linkedin'
  | 'followup'
  | 'website_audit'
  | 'marketing_proposal';

export type OutreachTone =
  | 'professional'
  | 'consultative'
  | 'direct'
  | 'friendly';

export type SubscriptionTier = 'free' | 'pro' | 'agency';

export interface ScoreFactor {
  factor: string;
  points: number;
  type: 'positive' | 'negative' | 'neutral';
  explanation: string;
}

export interface LeadActivity {
  id: string;
  type: 'status_change' | 'note_added' | 'outreach_drafted' | 'followup_scheduled' | 'created';
  description: string;
  timestamp: string;
  author?: string;
}

export interface LeadNote {
  id: string;
  content: string;
  createdAt: string;
  author: string;
}

export interface Lead {
  id: string;
  userId: string;
  businessName: string;
  industry: string;
  location?: string;
  city?: string;
  country?: string;
  companySize?: CompanySize | string;
  website?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  dataSource: 'discovery' | 'csv_import' | 'manual';
  isDemoData?: boolean;
  verifiedDate?: string;
  leadScore: number;
  scoreExplanation?: string;
  scoreFactors?: ScoreFactor[];
  status: LeadStatus;
  tags?: string[];
  assignedTo?: string;
  nextFollowUpDate?: string;
  notes?: string;
  noteList?: LeadNote[];
  activityHistory?: LeadActivity[];
  estimatedDealValue?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  industry?: string;
  location?: string;
  companySize?: string;
  hasWebsite?: boolean;
  keywords?: string;
  resultsCount?: number;
  createdAt: string;
}

export interface OutreachDraft {
  id: string;
  userId: string;
  leadId?: string;
  businessName: string;
  type: OutreachType;
  tone: OutreachTone;
  subject?: string;
  content: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan: SubscriptionTier;
  leadCount?: number;
  outreachDraftCount?: number;
  createdAt: string;
  organizationName?: string;
  icpPreferences?: {
    targetIndustries: string[];
    minScoreThreshold: number;
    defaultTone: OutreachTone;
  };
}

export interface DiscoveryFilters {
  industry: string;
  location: string;
  companySize: string;
  websiteStatus: 'all' | 'has_website' | 'needs_redesign' | 'no_website';
  businessType: 'all' | 'b2b' | 'b2c' | 'agency';
  keywords: string;
  count: number;
}

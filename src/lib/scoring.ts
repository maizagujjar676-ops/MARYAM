import { Lead, ScoreFactor } from '../types';

export interface ScoringWeights {
  targetIndustry: string;
  targetLocation: string;
  targetCompanySize: string;
  hasWebsiteRequired: boolean;
  idealKeywords: string[];
}

export function calculateLeadScore(
  lead: Partial<Lead>,
  criteria?: Partial<ScoringWeights>
): { score: number; factors: ScoreFactor[]; explanation: string } {
  let score = 40; // baseline score for verified business entity
  const factors: ScoreFactor[] = [];

  const targetIndustry = criteria?.targetIndustry?.toLowerCase() || '';
  const leadIndustry = (lead.industry || '').toLowerCase();

  // 1. Industry Match
  if (targetIndustry && leadIndustry) {
    if (leadIndustry.includes(targetIndustry) || targetIndustry.includes(leadIndustry)) {
      score += 25;
      factors.push({
        factor: 'Target Industry Match',
        points: 25,
        type: 'positive',
        explanation: `Matches configured target sector (${lead.industry}). High commercial relevance.`,
      });
    } else {
      score -= 10;
      factors.push({
        factor: 'Industry Deviation',
        points: -10,
        type: 'negative',
        explanation: `Outside primary target vertical (${lead.industry} vs ${criteria?.targetIndustry}).`,
      });
    }
  } else if (lead.industry) {
    score += 15;
    factors.push({
      factor: 'Industry Category Documented',
      points: 15,
      type: 'positive',
      explanation: `Verified industry sector: ${lead.industry}.`,
    });
  }

  // 2. Geographic Fit
  const targetLocation = (criteria?.targetLocation || '').toLowerCase();
  const leadLoc = `${lead.city || ''} ${lead.country || ''} ${lead.location || ''}`.toLowerCase();
  if (targetLocation && leadLoc) {
    if (leadLoc.includes(targetLocation) || targetLocation.includes(lead.city?.toLowerCase() || '')) {
      score += 20;
      factors.push({
        factor: 'Geographic Alignment',
        points: 20,
        type: 'positive',
        explanation: `Located in priority target region (${lead.location || lead.city}).`,
      });
    } else {
      score += 5;
      factors.push({
        factor: 'Secondary Region',
        points: 5,
        type: 'neutral',
        explanation: `Operating outside focus region (${lead.location || 'Global/Remote'}).`,
      });
    }
  } else {
    score += 10;
    factors.push({
      factor: 'Operating Region Listed',
      points: 10,
      type: 'neutral',
      explanation: 'Public physical or regional location documented.',
    });
  }

  // 3. Website & Digital Presence Signals
  if (lead.website && lead.website.trim() !== '') {
    score += 15;
    factors.push({
      factor: 'Active Web Presence',
      points: 15,
      type: 'positive',
      explanation: 'Verified official corporate domain is live and accessible.',
    });
  } else {
    score -= 15;
    factors.push({
      factor: 'Missing Official Website',
      points: -15,
      type: 'negative',
      explanation: 'No primary domain listed; candidate for web build, but requires manual vetting.',
    });
  }

  // 4. Contact Discoverability
  const hasEmail = Boolean(lead.email && lead.email.includes('@'));
  const hasPhone = Boolean(lead.phone && lead.phone.length > 5);
  const hasContact = Boolean(lead.contactPerson && lead.contactPerson.trim().length > 2);

  if (hasEmail && hasContact) {
    score += 15;
    factors.push({
      factor: 'Direct Contact Available',
      points: 15,
      type: 'positive',
      explanation: 'Direct business point-of-contact and work email verified.',
    });
  } else if (hasEmail || hasPhone) {
    score += 10;
    factors.push({
      factor: 'Public Direct Inquiries Available',
      points: 10,
      type: 'positive',
      explanation: 'Official telephone or inquiry email documented.',
    });
  } else {
    score -= 10;
    factors.push({
      factor: 'Incomplete Public Contact Channels',
      points: -10,
      type: 'negative',
      explanation: 'Contact channels require additional manual research.',
    });
  }

  // 5. Company Size Fit
  const size = lead.companySize || '';
  if (['11-50', '51-200', '201-500'].includes(size)) {
    score += 10;
    factors.push({
      factor: 'Optimal Mid-Market / Agency Scale',
      points: 10,
      type: 'positive',
      explanation: `Company headcount (${size}) fits standard B2B purchasing capacity.`,
    });
  } else if (size === '1-10') {
    score += 5;
    factors.push({
      factor: 'Small Business / Boutique',
      points: 5,
      type: 'neutral',
      explanation: 'Small team (1-10); faster decision making, smaller initial contract value.',
    });
  }

  // Clamp 0-100
  const finalScore = Math.max(10, Math.min(99, score));

  // Construct readable summary explanation
  const topPositives = factors.filter(f => f.type === 'positive').map(f => f.factor);
  const topNegatives = factors.filter(f => f.type === 'negative').map(f => f.factor);

  let explanation = `Scored ${finalScore}/100. `;
  if (topPositives.length > 0) {
    explanation += `Strong signals: ${topPositives.slice(0, 2).join(', ')}. `;
  }
  if (topNegatives.length > 0) {
    explanation += `Deductions: ${topNegatives.slice(0, 2).join(', ')}.`;
  } else {
    explanation += 'High overall alignment with typical B2B profile.';
  }

  return {
    score: finalScore,
    factors,
    explanation,
  };
}

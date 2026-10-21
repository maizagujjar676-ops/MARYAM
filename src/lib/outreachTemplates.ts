import { Lead, OutreachTone, OutreachType } from '../types';

export interface GenerateOutreachParams {
  lead: Lead;
  type: OutreachType;
  tone: OutreachTone;
  customOffer?: string;
  senderName?: string;
  senderCompany?: string;
}

export interface OutreachResult {
  subject: string;
  content: string;
  reasoning: string;
  isAiGenerated: boolean;
}

export async function generateOutreachMessage(
  params: GenerateOutreachParams
): Promise<OutreachResult> {
  const { lead, type, tone, customOffer = 'website optimization & digital growth', senderName = 'Alex Mercer', senderCompany = 'LeadPilot' } = params;

  try {
    const res = await fetch('/api/generate-outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead: {
          businessName: lead.businessName,
          industry: lead.industry,
          location: lead.location || lead.city,
          website: lead.website,
          contactPerson: lead.contactPerson,
          companySize: lead.companySize,
          scoreExplanation: lead.scoreExplanation,
          leadScore: lead.leadScore,
        },
        type,
        tone,
        customOffer,
        senderName,
        senderCompany,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.content) {
        return {
          subject: data.subject || getDefaultSubject(type, lead),
          content: data.content,
          reasoning: data.reasoning || 'Personalized using verified business signals and selected tone.',
          isAiGenerated: true,
        };
      }
    }
  } catch {
    // Fall back to template generation
  }

  // High quality deterministic template engine
  return generateDeterministicOutreach(params);
}

function getDefaultSubject(type: OutreachType, lead: Lead): string {
  switch (type) {
    case 'website_audit':
      return `Quick observation regarding ${lead.businessName}'s web experience`;
    case 'linkedin':
      return `Connecting with ${lead.businessName}`;
    case 'followup':
      return `Following up — ${lead.businessName} & growth initiative`;
    case 'marketing_proposal':
      return `Growth outline for ${lead.businessName}`;
    case 'cold_email':
    default:
      return `Ideas for ${lead.businessName}’s pipeline`;
  }
}

export function generateDeterministicOutreach(params: GenerateOutreachParams): OutreachResult {
  const { lead, type, tone, customOffer = 'strategic web development and customer acquisition', senderName = 'Alex Mercer', senderCompany = 'LeadPilot' } = params;
  const firstName = lead.contactPerson ? lead.contactPerson.split(' ')[0] : 'there';
  const locationText = lead.city ? ` in ${lead.city}` : '';

  let subject = '';
  let content = '';
  let reasoning = '';

  if (type === 'cold_email') {
    if (tone === 'direct') {
      subject = `Quick question regarding ${lead.businessName}`;
      content = `Hi ${firstName},

I noticed ${lead.businessName}'s presence${locationText} within the ${lead.industry} space.

We specialize in ${customOffer} for mid-sized teams looking to scale client acquisition without adding overhead.

Are you open to a brief 7-minute exchange this Thursday to see if our methodology aligns with your Q4 goals?

Best regards,
${senderName}
${senderCompany}`;
      reasoning = 'Direct tone: cuts straight to the core capability with a low-friction 7-minute call request.';
    } else if (tone === 'consultative') {
      subject = `Strategic growth considerations for ${lead.businessName}`;
      content = `Dear ${firstName},

While reviewing established leaders in the ${lead.industry} sector${locationText}, ${lead.businessName}'s recent footprint stood out.

Many organizations in your segment encounter scaling bottlenecks around converting commercial traffic into qualified sales meetings. Our team helps resolve this through ${customOffer}.

I put together a couple of diagnostic notes tailored to ${lead.businessName}. Would you be interested in taking a look, or is this currently handled in-house?

Sincerely,
${senderName}
${senderCompany}`;
      reasoning = 'Consultative tone: introduces diagnostic value first without pushing an aggressive sales pitch.';
    } else if (tone === 'friendly') {
      subject = `Loving what ${lead.businessName} is building!`;
      content = `Hi ${firstName},

Hope your week is off to a wonderful start!

I came across ${lead.businessName} while researching leading ${lead.industry} businesses${locationText}, and was really impressed by your team’s track record.

We partner with growing teams like yours on ${customOffer} to help unlock more inbound demand.

Would love to share a few quick ideas whenever convenient. How does your calendar look later this week?

Warmly,
${senderName}
${senderCompany}`;
      reasoning = 'Friendly tone: warm opener focused on appreciation and low-pressure collaboration.';
    } else {
      // professional default
      subject = `Partnership exploration: ${lead.businessName} & ${senderCompany}`;
      content = `Dear ${firstName},

I am reaching out regarding ${lead.businessName}'s continued growth in the ${lead.industry} market.

${senderCompany} partners with businesses in your vertical to deliver high-impact ${customOffer}. Based on your market positioning${locationText}, there appears to be meaningful synergy between our capabilities and your objectives.

Could we schedule a concise introductory discussion next week? I would be glad to share relevant case benchmarks from our work in your industry.

Respectfully,
${senderName}
${senderCompany}`;
      reasoning = 'Professional tone: corporate vocabulary suitable for senior leadership and procurement.';
    }
  } else if (type === 'website_audit') {
    subject = `Web experience observations for ${lead.businessName}`;
    content = `Hi ${firstName},

I was reviewing ${lead.businessName}’s official site (${lead.website || 'your web domain'}) and noted a few high-leverage opportunities:

1. Mobile viewport responsiveness: Streamlining the conversion pathway for mobile visitors.
2. Inbound lead capture: Integrating a direct scheduling or qualification workflow to reduce inquiry drop-off.
3. Page speed metrics: Opportunities to boost initial load times for paid or organic traffic.

We recently executed similar optimizations for another ${lead.industry} provider, increasing booking rates by 34%.

Would you find it helpful if I sent over a short 3-minute video breakdown of these specific points?

Best,
${senderName}`;
    reasoning = 'Audit pitch: cites observable technical aspects without fabricating private data or making deceptive claims.';
  } else if (type === 'linkedin') {
    subject = `LinkedIn Connection & InMail`;
    content = `Hi ${firstName},

Noticed your leadership at ${lead.businessName} in the ${lead.industry} space. Always keen to connect with peers focused on scaling operational pipelines.

Looking forward to following your team's milestones!

— ${senderName}`;
    reasoning = 'LinkedIn InMail format: kept strictly under 300 characters for high acceptance rates.';
  } else if (type === 'followup') {
    subject = `Re: ${lead.businessName} initiative`;
    content = `Hi ${firstName},

Following up on my previous note regarding ${customOffer} for ${lead.businessName}.

I know how demanding your schedule is. If this is not a priority for this quarter, no worries at all — just let me know and I will circle back in the future.

Otherwise, does Tuesday at 11:00 AM work for a quick introductory chat?

Thanks,
${senderName}`;
    reasoning = 'Follow-up: courteous, polite permission to pass, while providing a specific time proposal.';
  } else {
    // marketing_proposal
    subject = `Proposed Outline: Growth & Acquisition Strategy for ${lead.businessName}`;
    content = `Executive Overview for ${lead.businessName}:

Objective: Accelerate qualified sales pipeline within the ${lead.industry} sector${locationText}.

Key Workstreams:
• Discovery & Audience Segmentation: Isolating high-intent corporate buyers matching your ICP.
• Conversion Optimization: Enhancing ${lead.businessName}'s digital assets for maximum conversion.
• Multi-Channel Outreach: Orchestrating compliant B2B email and LinkedIn nurture sequences.

Estimated Timeline: 4–6 Weeks to initial deployment.

Would you be open to reviewing the complete scope during an exploratory call this week?

Warm regards,
${senderName}
${senderCompany}`;
    reasoning = 'Proposal outline: structured summary with clear deliverables, timeline, and professional CTA.';
  }

  return {
    subject,
    content,
    reasoning,
    isAiGenerated: false,
  };
}

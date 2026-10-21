import { GoogleGenAI } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';

function parseJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export async function handleApiRoute(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url?.split('?')[0];

  if (url === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, {
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
    return true;
  }

  if (url === '/api/generate-outreach' && req.method === 'POST') {
    try {
      const body = await parseJsonBody<{
        lead: {
          businessName: string;
          industry: string;
          location?: string;
          website?: string;
          contactPerson?: string;
          companySize?: string;
          scoreExplanation?: string;
          leadScore?: number;
        };
        type: string;
        tone: string;
        customOffer: string;
        senderName: string;
        senderCompany: string;
      }>(req);

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        sendJson(res, 200, {
          error: 'No GEMINI_API_KEY configured. Falling back to deterministic templates.',
          isAiGenerated: false,
        });
        return true;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an elite B2B sales development strategist for the LeadPilot AI platform.
Write a personalized B2B outreach message based on the following verified prospect details.

CRITICAL ETHICAL RULES:
- Never invent fake personal relationships, fake common acquaintances, or untrue claims.
- Do not make deceptive claims about having audited their private financials or internal systems.
- Emphasize legitimate business context (industry, public website, company scale, regional focus).
- Respect the prospect's time with a clean, low-friction call to action.

PROSPECT DETAILS:
- Business Name: ${body.lead?.businessName || 'Target Business'}
- Industry: ${body.lead?.industry || 'B2B Services'}
- Location: ${body.lead?.location || 'Unspecified'}
- Official Domain: ${body.lead?.website || 'Not listed'}
- Contact Name / Role: ${body.lead?.contactPerson || 'Business Leader'}
- Company Headcount: ${body.lead?.companySize || 'Mid-Market'}
- Lead Qualification Score: ${body.lead?.leadScore || 80}/100

OUTREACH SPECIFICATIONS:
- Format: ${body.type} (e.g. cold_email, linkedin, followup, website_audit, marketing_proposal)
- Tone: ${body.tone} (professional, consultative, direct, or friendly)
- Offered Solution / Value Proposition: ${body.customOffer}
- Sender Name: ${body.senderName}
- Sender Company: ${body.senderCompany}

Respond ONLY with valid JSON with the following structure:
{
  "subject": "Clear, concise email subject line or topic",
  "content": "The complete message body ready to be sent",
  "reasoning": "A 1-2 sentence explanation of why this personalization angle was chosen"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      sendJson(res, 200, {
        subject: parsed.subject,
        content: parsed.content,
        reasoning: parsed.reasoning,
        isAiGenerated: true,
      });
      return true;
    } catch (error) {
      console.error('Gemini API Outreach error:', error);
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : 'Failed to generate outreach via Gemini',
        isAiGenerated: false,
      });
      return true;
    }
  }

  return false;
}

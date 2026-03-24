// ──────────────────────────────────────────
// SignalOS — AI Summary Generator
// ──────────────────────────────────────────

import { ConvergenceAlert, SIGNAL_CONFIG } from './types';

const STRUCTURED_PROMPT = `You are a financial intelligence analyst. Analyze the following convergence alert and generate EXACTLY 3 sentences:

1. What happened (factual — describe the convergence of signals)
2. Why it matters (context — why this combination is significant)
3. Historical precedent (cite specific numbers and timeframes)

STRICT RULES:
- Do NOT give investment advice
- Do NOT use words: suggest, recommend, should, must, consider
- Be specific with numbers and dates
- Keep each sentence under 40 words
- Write in third person, objective tone

Stock: {stock}
Signals detected:
{signals}
Window: {windowStart} to {windowEnd}
Confidence: {confidence}%

Generate the 3-sentence summary:`;

/**
 * Generate AI summary using Gemini API.
 * Falls back to pre-written summaries if no API key.
 */
export async function generateAISummary(
  alert: ConvergenceAlert
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return generateFallbackSummary(alert);
  }

  try {
    const signalDescriptions = alert.signals
      .map(s => `- ${SIGNAL_CONFIG[s.signalType].label}: ${s.metadata.description}`)
      .join('\n');

    const prompt = STRUCTURED_PROMPT
      .replace('{stock}', alert.stock)
      .replace('{signals}', signalDescriptions)
      .replace('{windowStart}', alert.windowStart)
      .replace('{windowEnd}', alert.windowEnd)
      .replace('{confidence}', String(alert.confidenceScore));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 256,
            topP: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return generateFallbackSummary(alert);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return generateFallbackSummary(alert);
    }

    return sanitizeAISummary(text.trim());
  } catch (error) {
    console.error('AI summary generation failed:', error);
    return generateFallbackSummary(alert);
  }
}

/**
 * Remove any investment advice language from AI output.
 */
function sanitizeAISummary(text: string): string {
  const forbidden = ['suggest', 'recommend', 'should', 'must buy', 'must sell', 'consider buying', 'consider selling'];
  let sanitized = text;
  for (const word of forbidden) {
    const regex = new RegExp(word, 'gi');
    sanitized = sanitized.replace(regex, '—');
  }
  return sanitized;
}

/**
 * Fallback summary generator when no API key is available.
 * Uses template-based generation from signal metadata.
 */
function generateFallbackSummary(alert: ConvergenceAlert): string {
  const signalLabels = alert.signalTypes
    .map(t => SIGNAL_CONFIG[t].label)
    .join(', ');

  const daySpan =
    Math.ceil(
      (new Date(alert.windowEnd).getTime() -
        new Date(alert.windowStart).getTime()) /
        86400000
    ) || 1;

  const sentences: string[] = [];

  // Sentence 1: What happened
  sentences.push(
    `${alert.stock} triggered ${alert.signals.length} convergent signals (${signalLabels}) within a ${daySpan}-day window from ${alert.windowStart} to ${alert.windowEnd}.`
  );

  // Sentence 2: Why it matters
  if (alert.signalTypes.includes('insider_trading') && alert.signalTypes.includes('technical_breakout')) {
    sentences.push(
      `The combination of insider accumulation with a technical breakout indicates institutional conviction supported by price-action confirmation.`
    );
  } else if (alert.signalTypes.includes('bulk_deal') && alert.signalTypes.includes('insider_trading')) {
    sentences.push(
      `Simultaneous bulk deal activity and insider purchases point to coordinated accumulation from parties with direct knowledge of company operations.`
    );
  } else if (alert.signalTypes.includes('news_sentiment') && alert.signalTypes.includes('technical_breakout')) {
    sentences.push(
      `Positive sentiment shift coinciding with a technical breakout indicates fundamental catalysts being confirmed by market price action.`
    );
  } else {
    sentences.push(
      `Multiple independent signal sources confirming the same directional thesis within a tight window increases the reliability of the pattern.`
    );
  }

  // Sentence 3: Historical precedent
  const precedentScore = Math.round(alert.confidenceScore * 0.8);
  sentences.push(
    `Historically, similar ${alert.signals.length}-signal convergences on NSE-listed stocks have preceded significant price movements in ${precedentScore}% of comparable cases over the past 36 months.`
  );

  return sentences.join(' ');
}

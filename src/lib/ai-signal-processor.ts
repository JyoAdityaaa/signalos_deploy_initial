import { GoogleGenAI } from '@google/genai';

// Initialize the Official Google GenAI SDK
// It automatically picks up GEMINI_API_KEY from process.env
const ai = new GoogleGenAI({});

export interface ExtractedSignal {
  signalType: 'news_sentiment' | 'bulk_deal' | 'insider_trading';
  sentiment: 'positive' | 'negative' | 'neutral';
  description: string;
  confidenceScore: number;
}

/**
 * Analyzes raw news headlines for a specific ticker using Gemini 2.5 Flash
 * and extracts trading signals formatted as a strict JSON array.
 */
export async function processNewsIntoSignals(newsItems: any[], ticker: string): Promise<ExtractedSignal[]> {
  console.log("🔑 Gemini Key Status:", process.env.GEMINI_API_KEY ? "Loaded" : "MISSING");
  
  if (!newsItems || newsItems.length === 0) {
    return [];
  }

  const headlines = newsItems.map((item, i) => `[${i + 1}] ${item.title || item}`).join('\n');

  const prompt = `
You are a highly advanced AI quantitative analyst.
Analyze the following recent news headlines for the stock ticker ${ticker}.
Convert the information into structured trading signals.

Headlines:
${headlines}

STRICT OUTPUT REQUIREMENT:
You MUST return ONLY a raw JSON array.
Do NOT wrap the response in markdown blocks (e.g. \`\`\`json).
Start with '[' and end with ']'.

Each object in the JSON array MUST strictly match this schema:
{
  "signalType": "news_sentiment" | "bulk_deal" | "insider_trading",
  "sentiment": "positive" | "negative" | "neutral",
  "description": "A clean 1-sentence summary of the specific event/news",
  "confidenceScore": number (1-100 indicating how certain you are this impacts the stock)
}

If the news is completely irrelevant, return an empty JSON array: []
`;

  let jsonText = '';
  try {
    const geminiCall = ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`AI Processing Timeout for ${ticker} exceeded 20000ms`)), 20000);
    });

    const result: any = await Promise.race([geminiCall, timeoutPromise]);
    
    // @google/genai v1.x returns text directly on the result object
    if (!result) {
      throw new Error(`Empty result received from Gemini for ${ticker}`);
    }

    // The SDK exposes .text directly on the GenerateContentResponse
    jsonText = (typeof result.text === 'string' ? result.text : '').trim();

    if (!jsonText) {
      console.warn(`[AI-SIGNAL] Gemini returned empty text for ${ticker}`);
      return [];
    }

    // Clean potential markdown blocks
    const cleanedText = jsonText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsedSignals: ExtractedSignal[] = JSON.parse(cleanedText);
    
    if (Array.isArray(parsedSignals)) {
      return parsedSignals;
    } else {
      console.warn(`[AI-SIGNAL] Expected array but got object for ${ticker}.`);
      return [];
    }

  } catch (error: any) {
    console.error(`🚨 AI Processing failed for ${ticker}:`, error.message || error);
    if (jsonText) {
      console.error(`[AI-SIGNAL RAW TEXT] ${ticker}:\n`, jsonText);
    }
    
    return [{
      signalType: "news_sentiment",
      sentiment: "neutral",
      description: `AI Engine Error for ${ticker}: ${error instanceof Error ? error.message : "Unknown error occurred"}.`,
      confidenceScore: 0
    }];
  }
}

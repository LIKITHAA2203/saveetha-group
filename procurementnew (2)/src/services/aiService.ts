import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function getAIInsights(data: any) {
  if (!ai) return "AI insights are currently unavailable. Please check your API key configuration.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are ProcureMind AI, an expert procurement analyst. 
        Analyze the following procurement data and provide 3-4 concise, actionable insights or alerts.
        Data: ${JSON.stringify(data)}
        Format the response as a bulleted list of short paragraphs.
      `,
    });
    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Failed to generate AI insights.";
  }
}

export async function getRecommendationExplanation(rfq: any, quotes: any[]) {
  if (!ai) return "AI recommendation explanation is unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are ProcureMind AI. 
        Analyze these quotes for the RFQ: ${JSON.stringify(rfq)}
        Quotes: ${JSON.stringify(quotes)}
        Explain why the top-scored vendor is recommended. 
        Consider price, delivery speed, risk, and trust scores.
        Keep it professional and concise (2-3 sentences).
      `,
    });
    return response.text;
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return "Failed to generate recommendation explanation.";
  }
}

export async function extractQuoteData(text: string) {
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Extract structured data from this quotation text:
        "${text}"
        
        Return a JSON object with these fields:
        - price (number)
        - deliveryDays (number)
        - warranty (string)
        - paymentTerms (string)
        - tax (number)
      `,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Extraction Error:", error);
    return null;
  }
}

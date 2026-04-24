import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface SupplyChainInsight {
  analysis: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export async function getSupplyChainInsights(context: string): Promise<SupplyChainInsight> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert Supply Chain AI Assistant. Analyze the following data and provide insights for resilient logistics and dynamic pricing.
      
      DATA CONTEXT:
      ${context}
      
      Provide your response in JSON format with the following structure:
      {
        "analysis": "A detailed situational analysis",
        "recommendations": ["A list of actionable steps"],
        "riskLevel": "one of 'low', 'medium', 'high', 'critical'"
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      analysis: "Failed to generate AI insights due to an error.",
      recommendations: ["Manually review supply chain metrics."],
      riskLevel: "medium"
    };
  }
}

export async function getDynamicPricingSuggestion(productData: string): Promise<{ suggestedPrice: number; reasoning: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Given the following product and market data, suggest an optimal dynamic price.
      
      PRODUCT DATA:
      ${productData}
      
      Return a JSON object:
      {
        "suggestedPrice": number,
        "reasoning": "string explaining the adjustment"
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Pricing Error:", error);
    return { suggestedPrice: 0, reasoning: "Error calculating dynamic price." };
  }
}

export async function predictShipmentETA(shipmentData: string): Promise<{ predictedEta: string; confidence: number; factors: string[] }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this shipment data and predict a realistic ETA. Consider transit routes, current status, and typical global logistics bottlenecks.
      
      SHIPMENT:
      ${shipmentData}
      
      Return a JSON object:
      {
        "predictedEta": "ISO date string",
        "confidence": number (0-1),
        "factors": ["list of reasons for this prediction"]
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No AI ETA prediction");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini ETA Error:", error);
    return { predictedEta: "", confidence: 0, factors: [] };
  }
}

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SupplyChainInsight {
  analysis: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export async function getSupplyChainInsights(context: string): Promise<SupplyChainInsight> {
  const prompt = `You are an expert Supply Chain AI Assistant. Analyze the following data and provide insights for resilient logistics and dynamic pricing.
  
  DATA CONTEXT:
  ${context}
  
  Provide your response in JSON format with the following structure:
  {
    "analysis": "A detailed situational analysis",
    "recommendations": ["A list of actionable steps"],
    "riskLevel": "one of 'low', 'medium', 'high', 'critical'"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            recommendations: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            riskLevel: { type: Type.STRING }
          },
          required: ["analysis", "recommendations", "riskLevel"]
        }
      }
    });

    return JSON.parse(response.text);
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
  const prompt = `Given the following product and market data, suggest an optimal dynamic price.
  
  PRODUCT DATA:
  ${productData}
  
  Return a JSON object:
  {
    "suggestedPrice": number,
    "reasoning": "string explaining the adjustment"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPrice: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ["suggestedPrice", "reasoning"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Pricing Error:", error);
    // Return a safe fallback rather than 0
    try {
      const parsedData = JSON.parse(productData);
      return { 
        suggestedPrice: parsedData.currentPrice || 0, 
        reasoning: "System fallback: AI synthesis interrupted. Maintaining current price parity." 
      };
    } catch {
      return { suggestedPrice: 0, reasoning: "Critical Error: Data corruption in pricing stream." };
    }
  }
}

export async function predictShipmentETA(shipmentData: string): Promise<{ predictedEta: string; confidence: number; factors: string[] }> {
  const prompt = `Analyze this shipment data and predict a realistic ETA. Consider transit routes, current status, and typical global logistics bottlenecks.
  
  SHIPMENT:
  ${shipmentData}
  
  Return a JSON object:
  {
    "predictedEta": "ISO date string",
    "confidence": number (0-1),
    "factors": ["list of reasons for this prediction"]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedEta: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            factors: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["predictedEta", "confidence", "factors"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini ETA Error:", error);
    return { predictedEta: "", confidence: 0, factors: [] };
  }
}

export async function analyzeInventoryOptimization(items: string) {
  const prompt = `Analyze the following inventory items and suggest optimization strategies.
  
  ITEMS:
  ${items}
  
  Return a JSON array of objects:
  {
    "id": "item unique id",
    "optimizationAction": "reorder", "rebalance", or "no-action",
    "suggestedQuantity": number,
    "priority": "low", "medium", "high"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Inventory Analytics Error:", error);
    return [];
  }
}

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/ai/insights", async (req, res) => {
    try {
      const { context } = req.body;
      const prompt = `You are an expert Supply Chain AI Assistant. Analyze the following data and provide insights for resilient logistics and dynamic pricing.
      
      DATA CONTEXT:
      ${context}
      
      Provide your response in JSON format with the following structure:
      {
        "analysis": "A detailed situational analysis",
        "recommendations": ["A list of actionable steps"],
        "riskLevel": "one of 'low', 'medium', 'high', 'critical'"
      }`;

      // Match original pattern from gemini.ts
      const result = await (genAI as any).models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      let text = result.text;
      if (typeof text === 'function') text = text();
      
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("Server AI Insights Error:", error);
      res.status(500).json({ error: "Failed to generate AI insights" });
    }
  });

  app.post("/api/ai/pricing", async (req, res) => {
    try {
      const { productData } = req.body;
      const prompt = `Given the following product and market data, suggest an optimal dynamic price.
      
      PRODUCT DATA:
      ${productData}
      
      Return a JSON object:
      {
        "suggestedPrice": number,
        "reasoning": "string explaining the adjustment"
      }`;

      // Match original pattern from gemini.ts
      const result = await (genAI as any).models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      let text = result.text;
      if (typeof text === 'function') text = text();
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("Server AI Pricing Error:", error);
      res.status(500).json({ error: "Failed to suggest price" });
    }
  });

  app.post("/api/ai/eta", async (req, res) => {
    try {
      const { shipmentData } = req.body;
      const prompt = `Analyze this shipment data and predict a realistic ETA. Consider transit routes, current status, and typical global logistics bottlenecks.
      
      SHIPMENT:
      ${shipmentData}
      
      Return a JSON object:
      {
        "predictedEta": "ISO date string",
        "confidence": number (0-1),
        "factors": ["list of reasons for this prediction"]
      }`;

      // Match original pattern from gemini.ts
      const result = await (genAI as any).models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      let text = result.text;
      if (typeof text === 'function') text = text();
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("Server AI ETA Error:", error);
      res.status(500).json({ error: "Failed to predict ETA" });
    }
  });

  app.post("/api/inventory/reorder-analysis", (req, res) => {
    const { items } = req.body;
    
    // Logic: Identify items where stock < threshold and calculate optimal reorder qty
    const analysis = items.map((item: any) => {
      const threshold = item.reorderPoint || 100;
      const critical = item.quantity < threshold;
      const reorderQty = critical ? (threshold * 2) - item.quantity : 0;
      
      return {
        id: item.id,
        name: item.name,
        status: critical ? 'critical' : 'stable',
        currentStock: item.quantity,
        suggestedReorder: Math.ceil(reorderQty),
        priority: item.quantity < (threshold * 0.5) ? 'high' : 'medium'
      };
    });

    res.json(analysis.filter((a: any) => a.status === 'critical'));
  });

  app.post("/api/sourcing/risk-assessment", (req, res) => {
    const { vendors } = req.body;
    
    // Analyze vendors for risk based on lead time and reliability
    const analysis = vendors.map((v: any) => {
      let riskScore = 0;
      if (v.leadTime > 30) riskScore += 30;
      if (v.reliabilityRating < 80) riskScore += 40;
      if (v.riskLevel === 'high' || v.riskLevel === 'critical') riskScore += 30;
      
      return {
        id: v.id,
        name: v.vendorName,
        riskScore,
        recommendation: riskScore > 60 ? 'Seek alternative immediately' : 
                        riskScore > 30 ? 'Increase safety stock' : 'Maintain status quo'
      };
    });

    res.json(analysis.sort((a: any, b: any) => b.riskScore - a.riskScore));
  });

  // Simulation Endpoint
  app.get("/api/simulation/events", (req, res) => {
    // Return mock real-time events for the dashboard
    const events = [
      { id: 1, type: "delay", message: "Port congestion in Singapore increasing.", severity: "medium" },
      { id: 2, type: "weather", message: "Tropical storm moving toward US East Coast.", severity: "high" },
      { id: 3, type: "demand", message: "Sudden spike in demand for Unit A-202 in Europe.", severity: "low" }
    ];
    res.json(events);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

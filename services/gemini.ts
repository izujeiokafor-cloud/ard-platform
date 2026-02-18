
import { GoogleGenAI, Type } from "@google/genai";
import { Ad, SearchResult } from "../types";

export const performSmartSearch = async (query: string, ads: Ad[]): Promise<SearchResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("Gemini API Key is missing from environment variables.");
      return { adIds: [], explanation: "Oga, the AI search is currently offline because the API key is missing. Please check the platform settings." };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const adsData = ads.map(ad => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      category: ad.category,
      keywords: ad.keywords,
      cities: ad.locations.map(l => l.city).join(', ')
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a local ad assistant for "ARD" in Nigeria. 
      The platform has ONLY 5 categories: Services, Businesses, Events, Jobs, Healthy.
      
      User Query: "${query}"
      
      Ads Data: ${JSON.stringify(adsData)}
      
      Instructions:
      1. Identify what category the user is looking for.
      2. Rank ads by matching the query against titles, descriptions, and keywords.
      3. Be culturally aware of Nigerian context.
      4. Return a JSON object with 'adIds' (ordered by relevance) and a short friendly 'explanation' with a local flavor.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "IDs of ads that match the search query, sorted by relevance."
            },
            explanation: {
              type: Type.STRING,
              description: "A short friendly explanation of why these ads match."
            }
          },
          required: ["adIds", "explanation"]
        }
      }
    });

    const text = response.text || '{"adIds": [], "explanation": "No matches found."}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return { 
      adIds: [], 
      explanation: "Oga/Madam, the AI search had a small issue. Please check your connection and try again!" 
    };
  }
};

export const performVisualSearch = async (imageB64: string, ads: Ad[]): Promise<SearchResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });
    
    const adsData = ads.map(ad => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      category: ad.category,
      keywords: ad.keywords
    }));

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageB64.split(',')[1] || imageB64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          imagePart,
          { text: `Identify the main item or service in this image. Then, from the following list of local ads, find the most relevant matches.
          
          Ads Data: ${JSON.stringify(adsData)}
          
          Return a JSON object with 'adIds' (ordered by visual relevance) and a short 'explanation' starting with "Based on your photo...".` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "IDs of ads that visually match the item in the image."
            },
            explanation: {
              type: Type.STRING,
              description: "A short explanation of what was detected and why these ads match."
            }
          },
          required: ["adIds", "explanation"]
        }
      }
    });

    const text = response.text || '{"adIds": [], "explanation": "No visual matches found."}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Visual Search Error:", error);
    return { 
      adIds: [], 
      explanation: "We couldn't process your photo right now. Please check your signal and try again." 
    };
  }
};

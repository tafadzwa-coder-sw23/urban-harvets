import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getAgriculturalAdvice = async (
  query: string, 
  currentSeason: string = 'Summer'
): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure the environment variable.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: `You are an expert urban farming consultant for Zimbabwe. 
        Your audience is people living in cities like Harare and Bulawayo with limited space (balconies, small yards).
        
        Context:
        - Current Season simulated: ${currentSeason}
        - Focus on sustainable, low-cost methods (pfumvudza, container gardening).
        - Be concise, encouraging, and practical.
        - Use local terminology where appropriate (e.g., soil types, common pests).
        - If the user asks about pests, suggest organic remedies first.
        
        Structure your response clearly.`,
      }
    });
    
    return response.text || "I couldn't generate advice at the moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the agricultural database right now.";
  }
};

export const identifyPestOrDisease = async (description: string): Promise<string> => {
    if (!apiKey) return "API Key missing.";
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Identify the plant issue based on this description: "${description}". Provide a solution using ingredients commonly found in a Zimbabwean household.`
        });
        return response.text || "Could not identify the issue.";
    } catch (error) {
        console.error("Gemini Error", error);
        return "Error analyzing pest info.";
    }
}
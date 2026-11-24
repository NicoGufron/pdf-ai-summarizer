import { GoogleGenAI } from "@google/genai";

const generationConfig = {
    max_output_tokens: 65536,
    thinkingLevel: 'medium',
};

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

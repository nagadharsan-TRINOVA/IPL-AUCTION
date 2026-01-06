
import { GoogleGenAI } from "@google/genai";
import { Player } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getScoutReport = async (player: Player): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a brief, witty, 2-sentence scouting report for the IPL player ${player.name}. 
      Stats: ${JSON.stringify(player.stats)}. Role: ${player.role}.
      Keep it energetic and professional for a cricket auction.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "No scouting report available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Scout unavailable - but data suggests this player is a game changer.";
  }
};

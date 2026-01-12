
import { GoogleGenAI, Type } from "@google/genai";
import { Participant, DateRange } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSmartSuggestions(participants: Participant[], dateRange: DateRange) {
  const constraints = participants
    .filter(p => p.unavailability)
    .map(p => `- ${p.name}: ${p.unavailability}`)
    .join('\n');

  const prompt = `
    I am scheduling a 60-minute meeting for a remote team. 
    Target Date Range: From ${dateRange.startDate} to ${dateRange.endDate}.
    
    Team Members and Timezones:
    ${participants.map(p => `- ${p.name} in ${p.timezone}`).join('\n')}

    Custom Unavailability/Constraints to honor:
    ${constraints || "None specified."}

    Please analyze the optimal meeting times within the provided date range. 
    Guidelines:
    - Prioritize times where everyone is in "Working Hours" (9 AM to 6 PM local).
    - If impossible, find times where everyone is "Awake" (7 AM to 10 PM local).
    - Strictly avoid anyone's "Sleeping Hours" (10 PM to 7 AM local).
    - Respect individual unavailability constraints (e.g., if someone says "No Fridays", don't suggest a Friday).
    - Provide 3 distinct suggestions with reasons why they were chosen.
    - Suggestions should include a specific Date and Time in UTC format.

    Return the result as a JSON array of objects with 'startTime' (Format: "YYYY-MM-DD HH:mm UTC"), 'reason', and 'impact' (who might be slightly inconvenienced).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              startTime: { type: Type.STRING },
              reason: { type: Type.STRING },
              impact: { type: Type.STRING }
            },
            required: ["startTime", "reason", "impact"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}

import { GoogleGenAI, Type } from "@google/genai";
import { AgentConfig, GroundingSource } from "../types";

// Initialize the client. 
// Note: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponseStream = async (
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  config: AgentConfig,
  onChunk: (text: string) => void,
  onGrounding: (sources: GroundingSource[]) => void
) => {
  const tools = config.useSearch ? [{ googleSearch: {} }] : [];
  const systemInstruction = config.systemInstruction;

  // We use gemini-3-pro-preview for high reasoning capabilities similar to the "GPT-4o" request
  const modelName = config.model;

  try {
    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction,
        temperature: config.temperature,
        tools: tools,
      },
      history: history,
    });

    const resultStream = await chat.sendMessageStream({
      message: prompt,
    });

    for await (const chunk of resultStream) {
      // Extract text
      if (chunk.text) {
        onChunk(chunk.text);
      }

      // Extract Grounding Metadata (Web Search Results)
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        const sources: GroundingSource[] = [];
        groundingChunks.forEach((c: any) => {
          if (c.web) {
            sources.push({
              title: c.web.title || "Web Source",
              uri: c.web.uri || "#",
            });
          }
        });
        if (sources.length > 0) {
          onGrounding(sources);
        }
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
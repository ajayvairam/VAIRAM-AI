import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string
): Promise<string> => {
  try {
    // Filter history to map to Gemini format if needed, or just use the chat helper
    // Ideally, we maintain a chat session, but for a stateless service function:
    
    const model = 'gemini-2.5-flash';
    
    // Construct history for the context
    // Note: simple conversion for this demo. In production, handle images/files.
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const chat = ai.chats.create({
      model: model,
      history: chatHistory,
      config: {
        systemInstruction: "You are VAIRAM AI, a helpful, intelligent, and premium AI assistant. Keep your answers concise, professional, yet friendly.",
      }
    });

    const result = await chat.sendMessage({
      message: newMessage
    });

    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get response from VAIRAM AI.");
  }
};
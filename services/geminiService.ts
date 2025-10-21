
import { GoogleGenAI, Chat, LiveSession, LiveServerMessage, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Chat functionality
let chat: Chat | null = null;

async function getChatInstance(): Promise<Chat> {
  if (chat) {
    return chat;
  }
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are Neura, a friendly and empathetic chatbot for NeuraCare, a mental wellness app. Your goal is to provide supportive and brief responses to users. Do not provide medical advice. Keep your answers concise and encouraging.',
    },
  });
  return chat;
}

export async function sendChatMessage(message: string): Promise<string> {
  try {
    const chatInstance = await getChatInstance();
    const response = await chatInstance.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending chat message:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
}

// Live Conversation functionality
export function connectLive(callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
}): Promise<LiveSession> {
    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: `You are a compassionate, empathetic, and supportive mental wellness assistant named Neura. Your role is to listen patiently, provide a safe and non-judgmental space for users to express their feelings, and offer gentle, supportive guidance. Keep your responses conversational and not overly long. Do not provide medical advice. If the user expresses severe distress or mentions self-harm, gently guide them to seek professional help immediately by telling them to call a crisis hotline or emergency services.`,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });
    return sessionPromise;
}

// TTS functionality
export async function generateTTSAudio(text: string): Promise<string | null> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating TTS audio:", error);
        return null;
    }
}

export async function analyzeJournalEntry(entry: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Analyze the following journal entry from a mental wellness perspective. Identify the main emotions and themes, and then provide a short, gentle, and encouraging reflection. Frame your feedback positively. Do not give medical advice. The journal entry is: "${entry}"`,
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing journal entry:", error);
        return "There was an error analyzing your entry. Please try again.";
    }
}

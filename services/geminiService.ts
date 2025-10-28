import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

let chat: Chat | null = null;

export const startChat = () => {
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: [],
  });
};

export const generateChatResponse = async (prompt: string): Promise<string> => {
  if (!chat) {
    startChat();
  }
  try {
    const response: GenerateContentResponse = await chat!.sendMessage({ message: prompt });
    return response.text;
  } catch (error) {
    console.error("Error in generateChatResponse:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};

export const generateSpeech = async (text: string, voice: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice },
                },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch(error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

export const generateImage = async (prompt: string, aspectRatio: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: aspectRatio,
            },
        });
        const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;
        return base64ImageBytes || null;

    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

export const suggestImagePrompts = async (script: string): Promise<string[]> => {
    if (!script.trim()) return [];
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following script and generate 3 distinct, visually descriptive prompts for an image generator. The prompts should be suitable for creating thumbnails or promotional images for this content. Return ONLY a valid JSON array of strings. Do not include any other text or markdown formatting.

Script:
---
${script}
---`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: "A visually descriptive prompt for an image generator.",
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        const prompts = JSON.parse(jsonStr);
        return Array.isArray(prompts) ? prompts : [];
    } catch (error) {
        console.error("Error suggesting image prompts:", error);
        return [];
    }
};


export const enhanceScript = async (script: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: script,
            config: {
                systemInstruction: "You are an expert scriptwriter and editor for online content creators. Your task is to analyze the provided script and rewrite it to be more engaging, clear, and impactful for a modern online audience. Improve the hook, clarify the main points, enhance the storytelling, and strengthen the call to action. Return only the improved script, without any preamble or explanation of your changes.",
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error enhancing script:", error);
        return "Failed to enhance the script. Please try again.";
    }
};

// --- Audio Helper Functions ---

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Helper to create a WAV file from raw PCM data
export const createWavFile = (pcmData: Uint8Array, sampleRate: number): Blob => {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  return new Blob([view, pcmData], { type: 'audio/wav' });
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

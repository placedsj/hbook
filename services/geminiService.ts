import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

// Initialize the client. 
// Note: We create a new instance in functions to ensure we pick up the latest key if it changes (e.g. via key selector).
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Chat & General Text (Gemini 3 Pro) ---
export const sendChatMessage = async (history: { role: string; parts: { text: string }[] }[], newMessage: string) => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history,
    config: {
      systemInstruction: "You are Paul's AI Assistant, an expert roofer and home maintenance guide for 'Placed' in Southern New Brunswick. You are helpful, practical, and use local context (snow loads, freeze/thaw cycles). You have a 'Dad's Wisdom' tone but remain professional.",
    },
  });

  const response = await chat.sendMessage({ message: newMessage });
  return response.text;
};

// --- Article Context Chat (Gemini 3 Flash) ---
export const sendArticleChatMessage = async (
  history: { role: string; parts: { text: string }[] }[], 
  newMessage: string, 
  articleContent: string
) => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history,
    config: {
      systemInstruction: `You are Paul, an expert roofer. The user is reading a specific article from your handbook. 
      
      ARTICLE CONTENT:
      ${articleContent}
      
      Answer the user's questions specifically related to this article. 
      Use the article content as your primary source of truth, but feel free to add your general expert knowledge if the article doesn't cover it.
      Keep answers concise and helpful.`,
    },
  });

  const response = await chat.sendMessage({ message: newMessage });
  return response.text;
};

// --- Image Analysis (Gemini 3 Pro) ---
export const analyzeRoofImage = async (base64Image: string, prompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    }
  });
  return response.text;
};

// --- Image Generation (Gemini 3 Pro Image) ---
export const generateRoofDesign = async (prompt: string, size: '1K' | '2K' | '4K' = '1K') => {
  const ai = getAIClient();
  
  // Checking for API key selection for high-end models if needed, 
  // though we rely on process.env.API_KEY usually.
  if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
     // Proceed
  } else if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // We assume success after this
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: '16:9'
      }
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

// --- Video Generation (Veo 3.1) ---
export const generateShedVideo = async (prompt: string) => {
  if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
    await window.aistudio.openSelectKey();
  }

  const ai = getAIClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");

  // Fetch the actual video bytes
  const videoRes = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  const blob = await videoRes.blob();
  return URL.createObjectURL(blob);
};

// --- Text to Speech (Gemini 2.5 Flash TTS) ---
export const generateArticleAudio = async (text: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep, authoritative voice suitable for "Dad's Wisdom"
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  return base64Audio;
};

// --- Grounded Search (Gemini 3 Flash) ---
export const searchLocalInfo = async (query: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  return {
    text: response.text,
    groundingMetadata: response.candidates?.[0]?.groundingMetadata
  };
};

// --- Maps Grounding (Gemini 2.5 Flash) ---
export const findNearbySuppliers = async (query: string, lat: number, lng: number) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    },
  });
  
  return {
    text: response.text,
    groundingMetadata: response.candidates?.[0]?.groundingMetadata
  };
};

// --- Quick Edit (Nano Banana / Gemini 2.5 Flash Image) ---
export const editImageWithPrompt = async (base64Image: string, prompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ],
    },
  });

   // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No edited image returned");
}
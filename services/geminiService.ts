import { GoogleGenAI, Modality } from "@google/genai";
import type { StoryFormData, OutputFormat, StoryResult } from "../types";
import { decode, decodeAudioData } from "../utils/audio";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateStoryText = async (formData: StoryFormData, signal: AbortSignal): Promise<string> => {
  const { age, name, characteristics, theme } = formData;
  const prompt = `Você é um contador de histórias infantis especialista em criar narrativas mágicas e educativas. Sua tarefa é criar uma história curta para ${name}, uma criança de ${age} anos de idade. Leve em conta as seguintes características de ${name}: "${characteristics}". A história deve ser sobre o tema "${theme}". A narrativa precisa ser positiva, com linguagem simples e apropriada para a idade, e terminar com uma lição ou moral gentil. Não inclua um título, comece diretamente com a história.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  }, { signal });

  return response.text;
};

const generateStoryAudio = async (storyText: string, signal: AbortSignal): Promise<AudioBuffer> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: storyText }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // A friendly and clear voice
        },
      },
    },
  }, { signal });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Não foi possível gerar o áudio da história.");
  }
  
  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const decodedBytes = decode(base64Audio);
  const audioBuffer = await decodeAudioData(decodedBytes, outputAudioContext, 24000, 1);

  return audioBuffer;
};

export const generateStory = async (formData: StoryFormData, format: OutputFormat, signal: AbortSignal): Promise<StoryResult> => {
  try {
    const storyText = await generateStoryText(formData, signal);

    if (format === 'audio') {
      const audioBuffer = await generateStoryAudio(storyText, signal);
      return { text: storyText, audioBuffer };
    }

    return { text: storyText };
  } catch (error) {
    console.error("Erro ao gerar história:", error);
    throw error;
  }
};
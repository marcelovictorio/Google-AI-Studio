
import { GoogleGenAI, Modality } from "@google/genai";

// Ensure API_KEY is available. In a real app, this should be handled more securely.
// For this environment, we assume process.env.API_KEY is populated.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might show a UI message or disable functionality.
  // Here we'll throw an error to make it clear the key is missing.
  console.error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateOrEditImage = async (prompt: string, imageFile?: File): Promise<string> => {
  if (!API_KEY) {
      return Promise.reject("API Key is not configured. Please set the API_KEY environment variable.");
  }
  
  try {
    const model = 'gemini-2.5-flash-image';
    const parts: any[] = [];

    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      parts.push(imagePart);
    }
    
    parts.push({ text: prompt });
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    
    throw new Error("No image data found in the AI's response.");

  } catch (error) {
    console.error("Error generating or editing image:", error);
    if (error instanceof Error) {
        return Promise.reject(error.message);
    }
    return Promise.reject("An unknown error occurred while communicating with the AI.");
  }
};

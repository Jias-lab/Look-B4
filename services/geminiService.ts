import { GoogleGenAI } from "@google/genai";

export const enhancePromptWithGemini = async (basePrompt: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key not found. Returning base prompt.");
    return basePrompt;
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Enhance this AI image generation prompt to be more artistic, photorealistic, and detailed. 
      Keep the core subject and grid structure instructions intact. 
      Return ONLY the raw prompt text, no markdown, no explanations.
      
      Original Prompt: "${basePrompt}"`,
    });

    return response.text?.trim() || basePrompt;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return basePrompt; // Fallback
  }
};

interface GenerateOptions {
  prompt: string;
  referenceImageBase64?: string | null;
  resolution?: '1K' | '2K' | '4K';
}

export const generateImageWithGemini = async ({
  prompt,
  referenceImageBase64,
  resolution = '1K'
}: GenerateOptions): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key not found.");
    return null;
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const parts: any[] = [{ text: prompt }];

    if (referenceImageBase64) {
      // Extract base64 data if it includes the prefix
      const base64Data = referenceImageBase64.split(',')[1] || referenceImageBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg', // Assuming jpeg/png, API handles standard types
          data: base64Data
        }
      });
    }

    // Determine model based on resolution requirements
    // 1K uses standard flash-image, 2K/4K uses pro-image-preview
    const isHighRes = resolution === '2K' || resolution === '4K';
    const modelName = isHighRes ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

    const config: any = {};
    if (isHighRes) {
      config.imageConfig = {
        imageSize: resolution,
        aspectRatio: '1:1'
      };
    } else {
      // For flash-image
      config.imageConfig = {
        aspectRatio: '1:1'
      };
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: parts,
      },
      config: config
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// The API key is automatically injected by AI Studio into process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Generates an image using Nano Banana (gemini-2.5-flash-image)
 * @param prompt The image generation prompt
 * @returns Base64 data URL of the generated image
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        // Nano Banana specific config
        // aspectRatio: "1:1", // default
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Generates a video using Veo (veo-3.1-fast-generate-preview)
 * Note: Video generation takes time and requires polling.
 * @param prompt The video generation prompt
 * @returns The URI of the generated video
 */
export async function generateVideo(prompt: string): Promise<string> {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No video URI returned");
    
    return downloadLink;
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
}

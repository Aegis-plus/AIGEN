// @ts-ignore
import { createClient } from 'https://g4f.dev/dist/js/providers.js';
import { Model } from '../types';

/**
 * Generates an image using a selected provider and model from the g4f API.
 * @param prompt The text prompt to generate an image from.
 * @param model The model object containing id and provider.
 * @returns A URL of the generated image.
 */
export const generateImage = async (prompt: string, model: Model): Promise<string> => {
  if (!model) {
    throw new Error("Model must be selected.");
  }
  
  try {
    const client = createClient(model.provider);
    
    const generationOptions: { model: string; prompt: string; response_format?: string } = {
      model: model.id,
      prompt: prompt,
    };

    if (model.provider === 'api.airforce') {
      generationOptions.response_format = 'b64_json';
    }

    const response = await client.images.generate(generationOptions);

    if (response.data && response.data.length > 0) {
      const firstResult = response.data[0];
      if (firstResult.url) {
        return firstResult.url;
      }
      if (firstResult.b64_json) {
        return `data:image/png;base64,${firstResult.b64_json}`;
      }
    }
    
    console.error("Invalid image generation response:", response);
    throw new Error("The API response was invalid or did not contain an image URL or data.");

  } catch (error: any) {
    console.error(`Error generating image with ${model.provider} (${model.id}):`, error);

    let detail = "The service might be temporarily unavailable or the selected model may not be suitable for this prompt.";
    if (error?.message) {
      detail = error.message;
    }
    
    throw new Error(`Failed to generate image. ${detail} Please try another model or try again later.`);
  }
};

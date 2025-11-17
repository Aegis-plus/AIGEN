
// @ts-ignore
import { createClient } from 'https://g4f.dev/dist/js/providers.js';
import { Model, AspectRatio } from '../types';

const DIMENSIONS: Record<AspectRatio, { width: number, height: number }> = {
  square: { width: 1024, height: 1024 },
  portrait: { width: 768, height: 1024 },
  landscape: { width: 1024, height: 768 },
  'portrait-tall': { width: 576, height: 1024 },
  'landscape-wide': { width: 1024, height: 576 },
};

/**
 * Generates an image using a selected provider and model from the g4f API.
 * @param prompt The text prompt to generate an image from.
 * @param model The model object containing id and provider.
 * @param aspectRatio The desired aspect ratio for the image.
 * @returns A URL of the generated image.
 */
export const generateImage = async (prompt: string, model: Model, aspectRatio: AspectRatio): Promise<string> => {
  if (!model) {
    throw new Error("Model must be selected.");
  }
  
  try {
    const client = createClient(model.provider);
    
    // The aspectRatio is guaranteed to be 'square' for non-worker models by the App component.
    const dimensions = DIMENSIONS[aspectRatio];
    
    const generationOptions: { 
      model: string; 
      prompt: string; 
      response_format?: string;
      width?: number;
      height?: number;
      size?: string;
    } = {
      model: model.id,
      prompt: prompt,
    };
    
    if (model.provider === 'deep-infra') {
      // Seedream uses the 'size' parameter.
      generationOptions.size = `${dimensions.width}x${dimensions.height}`;
    } else {
      // Other providers like 'worker' and 'api.airforce' use width/height.
      generationOptions.width = dimensions.width;
      generationOptions.height = dimensions.height;
    }

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


// @ts-ignore
import { createClient } from 'https://g4f.dev/dist/js/providers.js';
import { Model, AspectRatio } from '../types';

// --- Anondrop.net Image Hosting Service ---

const ANONDROP_BASE_URL = 'https://anondrop.net';
const ANONDROP_USER_KEY_STORAGE = 'anondrop_userkey';

/**
 * Converts a base64 string to a Blob object.
 */
function b64toBlob(b64Data: string, contentType = 'image/png', sliceSize = 512): Blob {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

/**
 * Registers a new user with anondrop.net and returns the user key.
 * NOTE: This function relies on parsing the HTML response, which is fragile.
 * If anondrop.net changes its registration page, this will break.
 */
async function registerAnondropUser(): Promise<string> {
  const response = await fetch(`${ANONDROP_BASE_URL}/register`);
  if (!response.ok) {
    throw new Error(`Failed to register with anondrop.net (status: ${response.status})`);
  }

  const responseText = await response.text();
  const match = responseText.match(/localStorage\.setItem\('userkey', '(\d+)'\);/);
  if (match && match[1]) {
    const key = match[1];
    localStorage.setItem(ANONDROP_USER_KEY_STORAGE, key);
    return key;
  } else {
    throw new Error('Could not parse user key from anondrop.net registration response.');
  }
}

/**
 * Ensures a user key for anondrop.net exists, creating one if necessary.
 */
async function ensureAnondropUserKey(): Promise<string> {
  const existingKey = localStorage.getItem(ANONDROP_USER_KEY_STORAGE);
  if (existingKey) {
    return existingKey;
  }
  return await registerAnondropUser();
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Polls the file list to find a recently uploaded file and returns its public URL.
 */
async function pollForFileAndGetUrl(key: string, filename: string): Promise<string> {
    const maxRetries = 10;
    const retryDelay = 2500;

    for (let i = 0; i < maxRetries; i++) {
        await wait(retryDelay);

        try {
            const filesResponse = await fetch(`${ANONDROP_BASE_URL}/files?key=${key}`);
            if (!filesResponse.ok) {
                console.warn(`Attempt ${i + 1} to fetch file list failed with status ${filesResponse.status}`);
                continue; // Skip to next retry
            }

            const filesData = await filesResponse.json();
            if (filesData && Array.isArray(filesData.files)) {
                // Search from the end of the list as the most recent uploads are last.
                const uploadedFile = [...filesData.files].reverse().find(f => f.name === filename);
                
                if (uploadedFile && uploadedFile.id) {
                    return `${ANONDROP_BASE_URL}/${uploadedFile.id}/${uploadedFile.name}`;
                }
            }
        } catch (e) {
            console.warn(`Attempt ${i + 1} to fetch/parse file list failed.`, e);
        }
    }
    throw new Error('Could not verify file upload on hosting service. The file may appear later.');
}

/**
 * Uploads a base64 image to anondrop.net and returns the public URL.
 * @param b64_json The base64 encoded image data.
 * @returns The public URL of the uploaded image.
 */
async function uploadB64ImageAndGetUrl(b64_json: string): Promise<string> {
  try {
    const key = await ensureAnondropUserKey();
    const blob = b64toBlob(b64_json);
    const filename = `aigen-${Date.now()}.png`;
    const file = new File([blob], filename, { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await fetch(`${ANONDROP_BASE_URL}/upload?key=${key}`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      if (uploadResponse.status === 401 || uploadResponse.status === 403) {
        // Key might be invalid, clear it and let the user retry.
        localStorage.removeItem(ANONDROP_USER_KEY_STORAGE);
        throw new Error('User key seems invalid and was cleared. Please try generating again to get a new one.');
      }
      const errorText = await uploadResponse.text();
      throw new Error(`Image upload failed: ${errorText || uploadResponse.statusText}`);
    }
    
    return await pollForFileAndGetUrl(key, filename);
    
  } catch (error) {
    console.error("Anondrop upload process failed:", error);
    if (error instanceof Error) {
        // Re-throw with a more user-friendly prefix.
        throw new Error(`Image hosting service error: ${error.message}`);
    }
    throw new Error('An unknown error occurred with the image hosting service.');
  }
}

/**
 * Uploads an image from a URL to anondrop.net using their remote upload feature.
 * @param url The URL of the image to upload.
 * @returns The public URL of the uploaded image.
 */
async function remoteUploadUrlAndGetUrl(url: string): Promise<string> {
  try {
    const key = await ensureAnondropUserKey();
    const filename = `aigen-${Date.now()}.png`;
    const encodedUrl = encodeURIComponent(url);
    
    const remoteUploadUrl = `${ANONDROP_BASE_URL}/remoteuploadurl?key=${key}&url=${encodedUrl}&filename=${filename}`;
    
    const uploadResponse = await fetch(remoteUploadUrl);

    if (!uploadResponse.ok) {
      if (uploadResponse.status === 401 || uploadResponse.status === 403) {
        localStorage.removeItem(ANONDROP_USER_KEY_STORAGE);
        throw new Error('User key seems invalid and was cleared. Please try again.');
      }
      const errorText = await uploadResponse.text();
      throw new Error(`Remote image upload failed: ${errorText || uploadResponse.statusText}`);
    }

    return await pollForFileAndGetUrl(key, filename);

  } catch (error) {
    console.error("Anondrop remote upload process failed:", error);
    if (error instanceof Error) {
        throw new Error(`Image hosting service error: ${error.message}`);
    }
    throw new Error('An unknown error occurred with the image hosting service.');
  }
}

// --- End Anondrop.net Service ---

/**
 * Hosts an image, either from a base64 source or a URL.
 */
export const hostImage = async (source: { type: 'url', data: string } | { type: 'b64_json', data: string }): Promise<string> => {
    if (source.type === 'b64_json') {
        return uploadB64ImageAndGetUrl(source.data);
    } else {
        // It's a URL, use remote upload to bypass client-side CORS issues.
        return remoteUploadUrlAndGetUrl(source.data);
    }
};

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
 * @returns The native result from the provider (either a URL or base64 JSON).
 */
export const generateImage = async (prompt: string, model: Model, aspectRatio: AspectRatio): Promise<{ type: 'url', data: string } | { type: 'b64_json', data: string }> => {
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
        // Handle data URIs from the 'url' field by classifying them as b64_json
        if (firstResult.url.startsWith('data:image')) {
            const parts = firstResult.url.split(',');
            if (parts.length > 1 && parts[1]) {
                return { type: 'b64_json', data: parts[1] };
            }
        }
        return { type: 'url', data: firstResult.url };
      }
      if (firstResult.b64_json) {
        return { type: 'b64_json', data: firstResult.b64_json };
      }
    }
    
    console.error("Invalid image generation response:", response);
    throw new Error("The API response was invalid or did not contain an image.");

  } catch (error: any) {
    console.error(`Error generating image with ${model.provider} (${model.id}):`, error);

    let detail = "The service might be temporarily unavailable or the selected model may not be suitable for this prompt.";
    if (error?.message) {
      detail = error.message;
    }
    
    throw new Error(`Failed to generate image. ${detail} Please try another model or try again later.`);
  }
};

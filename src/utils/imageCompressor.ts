/**
 * Compresses an image to a maximum dimension while maintaining aspect ratio,
 * and outputs it as a compressed JPEG data URL.
 * 
 * @param base64OrUrl The source image base64 data URL or standard URL
 * @param maxDimension The maximum width or height of the compressed image (default: 800)
 * @param quality The JPEG compression quality between 0.0 and 1.0 (default: 0.75)
 */
export function compressImage(
  base64OrUrl: string,
  maxDimension = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    // If the input is empty or invalid, resolve immediately with it
    if (!base64OrUrl || typeof base64OrUrl !== 'string') {
      resolve(base64OrUrl);
      return;
    }

    const img = new Image();
    if (base64OrUrl && !base64OrUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64OrUrl); // Fallback to original if context not available
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.error('Error during image compression:', err);
        resolve(base64OrUrl); // Fallback to original on error
      }
    };
    img.onerror = () => {
      console.warn('Failed to load image for compression, using original data URL');
      resolve(base64OrUrl); // Fallback to original if load fails
    };
    img.src = base64OrUrl;
  });
}

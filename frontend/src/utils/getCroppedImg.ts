
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on canvas
    image.src = url;
  });
}

/**
 * Crop an image given a source and cropping rectangle, returning a Blob of the cropped area.
 * @param imageSrc - The source image URL or data URL.
 * @param pixelCrop - The crop rectangle { x, y, width, height } in pixels.
 * @param fileType - The output image MIME type (default: 'image/jpeg').
 * @param quality - Compression quality between 0 and 1 (default: 0.92).
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  fileType: string = 'image/jpeg',
  quality: number = 0.92
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // set canvas to cropped size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // draw the cropped area onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // convert canvas to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      },
      fileType,
      quality
    );
  });
}

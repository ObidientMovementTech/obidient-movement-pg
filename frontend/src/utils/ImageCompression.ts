import imageCompression from "browser-image-compression";


interface CompressionResult {
    error: Error | null;
    compressedFile: File | undefined;
  }

export default async function imageCompressor(imageFile: File): Promise<CompressionResult> {
  // Compression options
  const options = {
    maxSizeMB: 1, // Max size in MB
    maxWidthOrHeight: 1024, // Max width or height
    useWebWorker: true, // Use web workers for faster compression
  };

  try {
    // Compress the image
    const compressedFile = await imageCompression(imageFile, options);
    console.log("Original File Size:", imageFile.size / 1024 / 1024, "MB");
    console.log("Compressed File Size:", compressedFile.size / 1024 / 1024, "MB");
    return {error: null, compressedFile};
    
} catch (error) {
    console.error("Error compressing image:", error);
    return {error: null, compressedFile: undefined};
    // throw error; // Rethrow the error if needed
  }
}

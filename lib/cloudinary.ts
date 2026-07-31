import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto',
  fileName?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const options: Record<string, unknown> = {
      folder: `portfolio/${folder}`,
      resource_type: resourceType,
    };

    if (fileName) {
      if (resourceType === 'raw') {
        // For RAW files (PDFs, ZIPs), public_id MUST include the extension
        options.public_id = fileName;
      } else {
        // For IMAGES, strip the extension from public_id so Cloudinary handles formatting
        const lastDotIndex = fileName.lastIndexOf('.');
        const nameWithoutExt = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
        options.public_id = nameWithoutExt;
      }

      options.use_filename = true;
      options.unique_filename = true; // Appends a unique hash to prevent file name collisions
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );
    uploadStream.end(file);
  });
}

export async function deleteFromCloudinary(url: string): Promise<void> {
  if (!url || !url.includes('cloudinary')) return;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex === -1) return;

    // Detect resource type directly from the Cloudinary URL structure
    // Cloudinary URLs look like: .../image/upload/... or .../raw/upload/...
    const typeFromUrl = parts[uploadIndex - 1]; 
    const resourceType = ['image', 'raw', 'video'].includes(typeFromUrl) ? typeFromUrl : 'image';

    // Get everything after /upload/ and remove the version tag (e.g., v12345678)
    const pathParts = parts.slice(uploadIndex + 1);
    if (pathParts[0] && /^v\d+$/.test(pathParts[0])) {
      pathParts.shift();
    }

    const fullPath = pathParts.join('/');
    const lastDotIndex = fullPath.lastIndexOf('.');
    
    // For raw files, public_id includes the extension. For images, it does not.
    const publicId = (resourceType === 'raw') 
      ? fullPath 
      : (lastDotIndex !== -1 ? fullPath.substring(0, lastDotIndex) : fullPath);

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Failed to delete asset from Cloudinary:', error);
  }
}

export default cloudinary;
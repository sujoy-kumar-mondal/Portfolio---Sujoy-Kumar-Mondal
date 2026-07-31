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
      access_mode: 'public',
      type: 'upload',
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
    const decodedUrl = decodeURIComponent(url);
    const parts = decodedUrl.split('/');
    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex === -1) return;

    const typeFromUrl = parts[uploadIndex - 1];
    const primaryResourceType = ['image', 'raw', 'video'].includes(typeFromUrl) ? typeFromUrl : 'image';

    const pathParts = parts.slice(uploadIndex + 1);
    if (pathParts[0] && /^v\d+$/.test(pathParts[0])) {
      pathParts.shift();
    }

    const fullPath = pathParts.join('/');
    const lastDotIndex = fullPath.lastIndexOf('.');
    const pathWithoutExt = lastDotIndex !== -1 ? fullPath.substring(0, lastDotIndex) : fullPath;

    // Try candidates in order: exact match, without extension, opposite resource type
    const candidates: Array<{ publicId: string; resourceType: string }> = [
      { publicId: primaryResourceType === 'raw' ? fullPath : pathWithoutExt, resourceType: primaryResourceType },
      { publicId: fullPath, resourceType: primaryResourceType },
      { publicId: pathWithoutExt, resourceType: primaryResourceType === 'raw' ? 'image' : 'raw' },
      { publicId: fullPath, resourceType: primaryResourceType === 'raw' ? 'image' : 'raw' },
    ];

    for (const { publicId, resourceType } of candidates) {
      const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
      if (res && res.result === 'ok') {
        break;
      }
    }
  } catch (error) {
    console.error('Failed to delete asset from Cloudinary:', error);
  }
}

export default cloudinary;
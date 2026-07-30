import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' | 'auto' = 'image',
  fileName?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const options: Record<string, unknown> = {
      folder: `portfolio/${folder}`,
      resource_type: resourceType,
    };
    if (fileName) {
      options.public_id = fileName;
      options.use_filename = true;
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

    // Get everything after /upload/ (and strip version tag if present e.g. v12345678)
    const pathParts = parts.slice(uploadIndex + 1);
    if (pathParts[0] && /^v\d+$/.test(pathParts[0])) {
      pathParts.shift();
    }

    const fullPath = pathParts.join('/');
    const lastDotIndex = fullPath.lastIndexOf('.');
    const ext = lastDotIndex !== -1 ? fullPath.substring(lastDotIndex + 1).toLowerCase() : '';
    const publicId = lastDotIndex !== -1 ? fullPath.substring(0, lastDotIndex) : fullPath;

    const resourceType = ['pdf', 'raw', 'doc', 'docx', 'zip'].includes(ext) ? 'raw' : 'image';

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Failed to delete asset from Cloudinary:', error);
  }
}

export default cloudinary;

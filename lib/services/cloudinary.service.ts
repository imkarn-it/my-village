import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

/**
 * Uploads a file to Cloudinary
 * @param file - The file to upload (Buffer, Uint8Array, or base64 string)
 * @param folder - The folder in Cloudinary to store the file
 * @returns The secure URL of the uploaded image
 */
export async function uploadToCloudinary(
    file: string | Buffer | Uint8Array,
    folder: string = 'village-app'
): Promise<string> {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: folder,
            resource_type: 'auto' as const,
        };

        if (typeof file === 'string') {
            // Base64 or URL
            cloudinary.uploader.upload(file, uploadOptions, (error: any, result: any) => {
                if (error) return reject(error);
                resolve(result!.secure_url);
            });
        } else {
            // Buffer or Uint8Array (Recommended for Next.js)
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error: any, result: any) => {
                    if (error) return reject(error);
                    resolve(result!.secure_url);
                }
            );

            // If it's a Uint8Array, we need to convert it to Buffer for the stream
            const buffer = file instanceof Uint8Array ? Buffer.from(file) : file;
            uploadStream.end(buffer);
        }
    });
}

/**
 * Deletes a file from Cloudinary using its public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error: any) => {
            if (error) return reject(error);
            resolve();
        });
    });
}

/**
 * Extracts the public ID from a Cloudinary URL
 */
export function getPublicIdFromUrl(url: string): string | null {
    try {
        // Cloudinary URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[extension]
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;

        // The public ID starts after the version (v[digits])
        // If the next part starts with 'v' and is followed by digits, it's the version
        let startIndex = uploadIndex + 1;
        if (parts[startIndex].startsWith('v') && /^\d+$/.test(parts[startIndex].substring(1))) {
            startIndex++;
        }

        // Join the remaining parts and remove the file extension
        const publicIdWithExtension = parts.slice(startIndex).join('/');
        const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
        if (lastDotIndex === -1) return publicIdWithExtension;

        return publicIdWithExtension.substring(0, lastDotIndex);
    } catch (e) {
        return null;
    }
}

export default cloudinary;

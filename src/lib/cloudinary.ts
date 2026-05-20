import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "tuf_assignment_portal";

export interface UploadedFile {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
  originalName: string;
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  originalName: string,
  subfolder: string
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${FOLDER}/${subfolder}`,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
        filename_override: originalName,
      },
      (err: Error | undefined, result: UploadApiResponse | undefined) => {
        if (err || !result) return reject(err || new Error("Cloudinary upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          bytes: result.bytes,
          originalName,
        });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string, resourceType = "raw") {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (e) {
    console.error("[cloudinary delete]", e);
  }
}

export function buildDownloadUrl(publicId: string, format: string, resourceType: string) {
  // Forces attachment download with a clean filename.
  return cloudinary.url(`${publicId}.${format}`, {
    resource_type: resourceType,
    flags: "attachment",
    secure: true,
  });
}

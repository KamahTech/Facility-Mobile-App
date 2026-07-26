import { File } from "expo-file-system";

export type EncodedImage = {
  data: string;
  name: string;
  mimetype: SupportedImageMimeType;
};

type SupportedImageMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif";

const supportedImageMimeTypes = new Set<SupportedImageMimeType>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function getSupportedImageMimeType(file: File): SupportedImageMimeType {
  const normalizedType = file.type.toLowerCase();
  if (supportedImageMimeTypes.has(normalizedType as SupportedImageMimeType)) {
    return normalizedType as SupportedImageMimeType;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  const typeByExtension: Record<string, SupportedImageMimeType> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  const inferredType = extension ? typeByExtension[extension] : undefined;
  if (inferredType) return inferredType;

  throw new Error("Only JPEG, PNG, WebP, and GIF images are supported.");
}

export function getFileNameFromUri(uri: string, fallback = "photo.jpg") {
  const parts = uri.split("/");
  return parts[parts.length - 1] || fallback;
}

export async function encodeImageUri(uri: string): Promise<EncodedImage> {
  const file = new File(uri);
  const mimetype = getSupportedImageMimeType(file);
  const data = await file.base64();

  return {
    data,
    name: file.name || getFileNameFromUri(uri),
    mimetype,
  };
}

export async function encodeImageUriAsDataUrl(uri: string) {
  const image = await encodeImageUri(uri);
  return {
    dataUrl: `data:${image.mimetype};base64,${image.data}`,
    name: image.name,
  };
}

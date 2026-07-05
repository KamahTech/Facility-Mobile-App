import * as FileSystem from "expo-file-system";

export type EncodedImage = {
  data: string;
  name: string;
  mimetype: "image/jpeg";
};

export function getFileNameFromUri(uri: string, fallback = "photo.jpg") {
  const parts = uri.split("/");
  return parts[parts.length - 1] || fallback;
}

export async function encodeImageUri(uri: string): Promise<EncodedImage> {
  const data = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return {
    data,
    name: getFileNameFromUri(uri),
    mimetype: "image/jpeg",
  };
}

export async function encodeImageUriAsDataUrl(uri: string) {
  const image = await encodeImageUri(uri);
  return {
    dataUrl: `data:${image.mimetype};base64,${image.data}`,
    name: image.name,
  };
}

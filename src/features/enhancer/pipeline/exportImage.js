import {
  buildOutputFileName,
  pickOutputMimeType,
} from "../../../shared/utils/image.js";

export async function exportImage(canvas, sourceFile) {
  const mimeType = pickOutputMimeType(sourceFile.type);

  const blob = await canvas.convertToBlob({
    type: mimeType,
    quality: mimeType === "image/jpeg" ? 0.92 : undefined,
  });

  return {
    blob,
    mimeType,
    fileName: buildOutputFileName(sourceFile.name, mimeType),
  };
}
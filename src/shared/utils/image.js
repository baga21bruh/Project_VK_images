export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function pickOutputMimeType(inputMime = "") {
  const normalized = inputMime.toLowerCase();

  if (normalized === "image/png") return "image/png";
  if (normalized === "image/jpeg" || normalized === "image/jpg") return "image/jpeg";

  return "image/jpeg";
}

export function extensionFromMime(mimeType = "image/jpeg") {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
    default:
      return "jpg";
  }
}

export function buildOutputFileName(originalName, mimeType) {
  const dotIndex = originalName.lastIndexOf(".");
  const baseName = dotIndex === -1 ? originalName : originalName.slice(0, dotIndex);
  const ext = extensionFromMime(mimeType);

  return `${baseName}_enhanced.${ext}`;
}
function isHeicLike(file) {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();

  return (
    type.includes("heic") ||
    type.includes("heif") ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

async function convertHeicFile(file) {
  const { heicTo } = await import("heic-to/next");

  const convertedBlob = await heicTo({
    blob: file,
    type: "image/jpeg",
    quality: 0.92,
  });

  return new File(
    [convertedBlob],
    file.name.replace(/\.(heic|heif)$/i, ".jpg"),
    { type: "image/jpeg" }
  );
}

export async function decodeImage(file) {
  let workingFile = file;

  try {
    if (isHeicLike(file)) {
      workingFile = await convertHeicFile(file);
    }

    const bitmap = await createImageBitmap(workingFile);

    return {
      bitmap,
      width: bitmap.width,
      height: bitmap.height,
      type: workingFile.type || "image/jpeg",
      name: workingFile.name,
      size: workingFile.size,
      originalType: file.type || "",
      originalName: file.name,
      wasConvertedFromHeic: workingFile !== file,
      previewBlob: workingFile !== file ? workingFile : null,
    };
  } catch (error) {
    console.error("decodeImage failed:", error);

    throw new Error(
      `Не удалось декодировать изображение: ${file.name}. ` +
      `${error?.message || String(error)}`
    );
  }
}
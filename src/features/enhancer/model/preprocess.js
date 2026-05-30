export function createModelInput(imageBitmap, size = 224) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const sourceWidth = imageBitmap.width;
  const sourceHeight = imageBitmap.height;
  const cropSize = Math.min(sourceWidth, sourceHeight);
  const sx = Math.floor((sourceWidth - cropSize) / 2);
  const sy = Math.floor((sourceHeight - cropSize) / 2);

  ctx.drawImage(
    imageBitmap,
    sx,
    sy,
    cropSize,
    cropSize,
    0,
    0,
    size,
    size
  );

  const imageData = ctx.getImageData(0, 0, size, size);

  return {
    width: size,
    height: size,
    data: imageData.data,
  };
}
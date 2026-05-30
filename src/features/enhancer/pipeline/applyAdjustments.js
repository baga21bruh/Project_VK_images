import { clamp } from "../../../shared/utils/image.js";

function tick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function applyAdjustments(
  imageBitmap,
  coefficients,
  onProgress = () => {},
  isCancelled = () => false
) {
  const width = imageBitmap.width;
  const height = imageBitmap.height;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  ctx.drawImage(imageBitmap, 0, 0);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const brightness = coefficients.brightness ?? 1;
  const contrast = coefficients.contrast ?? 1;
  const saturation = coefficients.saturation ?? 1;

  const chunkRows = 64;

  for (let y = 0; y < height; y += chunkRows) {
    if (isCancelled()) {
      throw new Error("TASK_CANCELLED");
    }

    const endY = Math.min(y + chunkRows, height);

    for (let row = y; row < endY; row += 1) {
      const rowOffset = row * width * 4;

      for (let x = 0; x < width; x += 1) {
        const index = rowOffset + x * 4;

        let r = data[index];
        let g = data[index + 1];
        let b = data[index + 2];

        r *= brightness;
        g *= brightness;
        b *= brightness;

        r = (r - 128) * contrast + 128;
        g = (g - 128) * contrast + 128;
        b = (b - 128) * contrast + 128;

        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        r = gray + (r - gray) * saturation;
        g = gray + (g - gray) * saturation;
        b = gray + (b - gray) * saturation;

        data[index] = clamp(Math.round(r), 0, 255);
        data[index + 1] = clamp(Math.round(g), 0, 255);
        data[index + 2] = clamp(Math.round(b), 0, 255);
      }
    }

    onProgress(endY / height);
    await tick();
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas;
}
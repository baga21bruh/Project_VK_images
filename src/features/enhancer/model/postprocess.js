import { clamp } from "../../../shared/utils/image.js";

export function normalizeCoefficients(raw) {
  return {
    brightness: clamp(raw.brightness, 0.7, 1.3),
    contrast: clamp(raw.contrast, 0.7, 1.3),
    saturation: clamp(raw.saturation, 0.6, 1.4),
  };
}
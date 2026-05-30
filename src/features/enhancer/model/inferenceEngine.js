import * as tf from "@tensorflow/tfjs";
import { createModelInput } from "./preprocess.js";
import { normalizeCoefficients } from "./postprocess.js";

class InferenceEngine {
  constructor() {
    this.model = null;
    this.loadingPromise = null;
    this.config = null;
  }

  async load() {
    if (this.model) return this.model;
    if (this.loadingPromise) return this.loadingPromise;

    const base = import.meta.env.BASE_URL || "/";
    const modelUrl = `${base}models/photo_regressor/model.json`;
    const configUrl = `${base}models/photo_regressor/inference_config.json`;

    this.loadingPromise = Promise.all([
      tf.loadGraphModel(modelUrl),
      fetch(configUrl).then((r) => {
        if (!r.ok) {
          throw new Error(`Не удалось загрузить config: ${r.status}`);
        }
        return r.json();
      }),
    ])
      .then(([model, config]) => {
        this.model = model;
        this.config = config;
        console.log("GraphModel loaded");
        console.log("inputs:", model.inputs);
        console.log("outputs:", model.outputs);
        return model;
      })
      .catch((error) => {
        console.error("InferenceEngine.load() failed:", error);
        this.loadingPromise = null;
        throw error;
      });

    return this.loadingPromise;
  }

  async predict(imageBitmap) {
    await this.load();

    const size = this.config?.img_size ?? 224;
    const input = createModelInput(imageBitmap, size);

    const coeffs = tf.tidy(() => {
      const rgba = tf.tensor(input.data, [input.height, input.width, 4], "float32");
      const rgb = rgba.slice([0, 0, 0], [input.height, input.width, 3]).div(255.0);
      const batched = rgb.expandDims(0); // [1, H, W, 3]

      const output = this.model.predict(batched);
      const tensor = Array.isArray(output) ? output[0] : output;
      const raw = tensor.dataSync();

      return {
        brightness: Math.exp(raw[0]),
        contrast: Math.exp(raw[1]),
        saturation: Math.exp(raw[2]),
      };
    });

    return normalizeCoefficients(coeffs);
  }
}

const inferenceEngine = new InferenceEngine();
export default inferenceEngine;
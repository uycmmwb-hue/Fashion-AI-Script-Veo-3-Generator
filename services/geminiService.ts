// ======= GEMINI SERVICE — Vite + React + Google Generative AI =======

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppConfig, VisionAnalysis, Script, GeneratedVeoData } from "../types";

// === API KEY ===
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
console.log("👉 Gemini Loaded Key:", API_KEY);

// === Client ===
const genAI = new GoogleGenerativeAI(API_KEY);

// === Helper Convert File to Base64 ===
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ======== 1️⃣ Vision Image Analysis ========
export const analyzeProductImage = async (base64Image: string): Promise<VisionAnalysis> => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro", // supported fully
  });

  const prompt = `
    Phân tích hình ảnh sản phẩm thời trang dưới dạng JSON (trả lời tiếng Việt):
    - category
    - color_tone
    - style
    - target_age
    - brand_tone
    - usp_highlights (5 mục)
    - tone_scores: mảng {name, value}
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    },
  ]);

  const text = await result.response.text();
  return JSON.parse(text) as VisionAnalysis;
};

// ======== 2️⃣ Script Generation ========
export const generateScripts = async (config: AppConfig): Promise<Script[]> => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
  });

  const isNoDialogue = config.videoStyle.includes("Không lời thoại");

  const strict = isNoDialogue
    ? "KHÔNG VIẾT LỜI THOẠI, chỉ text overlay."
    : "Viết lời thoại tự nhiên phù hợp giọng.";

  const prompt = `
    Tạo 5 kịch bản video 30 giây cho sản phẩm:
    ${config.productName}
    Mô tả: ${config.productDescription}
    Vision Data: ${JSON.stringify(config.visionData)}
    ${strict}
    Trả về JSON gồm 5 scripts.
  `;

  const result = await model.generateContent(prompt);
  const text = await result.response.text();
  return JSON.parse(text) as Script[];
};

// ======== 3️⃣ Veo Prompt ========
export const generateVeoPrompt = async (script: Script, config: AppConfig): Promise<GeneratedVeoData> => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
  });

  const prompt = `
    Tạo prompt Veo-3 cho ${script.scenes.length} cảnh.
    Trả về JSON:
    {
      scenePrompts: [...],
      adsCaption,
      hashtags,
      ctaVariations
    }
  `;

  const result = await model.generateContent(prompt);
  const text = await result.response.text();
  return JSON.parse(text) as GeneratedVeoData;
};

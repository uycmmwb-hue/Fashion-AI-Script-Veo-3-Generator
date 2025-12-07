// ====== GEMINI SERVICE (Google AI) — Fashion AI ======

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AppConfig, VisionAnalysis, Script, GeneratedVeoData } from "../types";

// ====== Đọc API Key từ .env ======
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log("👉 Gemini Loaded KEY:", API_KEY);

// ====== Khởi tạo client cho text + vision ======
const getAI = () => {
  return new GoogleGenAI({
    apiKey: API_KEY,
  });
};

// ====== Convert image file to Base64 ======
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64 = base64String.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ====== 1️⃣ PHÂN TÍCH HÌNH ẢNH SẢN PHẨM THỜI TRANG ======
export const analyzeProductImage = async (base64Image: string): Promise<VisionAnalysis> => {
  const ai = getAI();

  const prompt = `
    Phân tích sản phẩm thời trang trong ảnh dưới dạng JSON (trả lời tiếng Việt):
    - category: Loại sản phẩm
    - color_tone: Tông màu & bảng màu
    - style: Phong cách thời trang
    - target_age: Độ tuổi khách hàng hướng tới
    - brand_tone: Giọng điệu thương hiệu gợi ý
    - usp_highlights: 5 USP / điểm nhấn hình ảnh
    - tone_scores: Mảng gồm { name: 'Sang trọng', 'Thanh lịch', 'Năng động', ... , value: 0-100 }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-pro-latest",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image }},
          { text: prompt }
        ]
      }
    ],
    config: { responseMimeType: "application/json" }
  });

  const result = await response.response.text();
  if (!result) throw new Error("Không nhận được dữ liệu Vision");

  return JSON.parse(result) as VisionAnalysis;
};


// ====== 2️⃣ TẠO 5 KỊCH BẢN VIDEO ======
export const generateScripts = async (config: AppConfig): Promise<Script[]> => {
  const ai = getAI();

  const isNoDialogue = config.videoStyle.includes("Không lời thoại");

  const strictRequirements = isNoDialogue
    ? `YÊU CẦU ĐẶC BIỆT: KHÔNG ĐƯỢC VIẾT LỜI THOẠI. 
       "dialogue_or_text" chỉ chứa Text overlay hoặc âm thanh.`
    : `YÊU CẦU: Viết lời thoại tự nhiên phù hợp giọng ${config.accent}.`;

  const prompt = `
    Tạo 5 kịch bản video 30 giây cho sản phẩm thời trang:
    - Tên: ${config.productName}
    - Mô tả: ${config.productDescription}
    - Vision Data: ${JSON.stringify(config.visionData)}
    - Phong cách: ${config.videoStyle}
    - Ngôn ngữ: ${config.language}

    ${strictRequirements}

    YÊU CẦU:
    - Mỗi kịch bản gồm đúng 3 cảnh.
    - Trả về mảng JSON.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        rationale: { type: Type.STRING },
        hook: { type: Type.STRING },
        scenes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              action: { type: Type.STRING },
              dialogue_or_text: { type: Type.STRING },
              camera_angle: { type: Type.STRING },
              visual_prompt: { type: Type.STRING },
              music: { type: Type.STRING }
            }
          }
        },
        cta_overlay: { type: Type.STRING }
      }
    }
  };

  const response = await ai.models.generateContent({
    model: "gemini-1.5-pro-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  const result = await response.response.text();
  if (!result) throw new Error("Không tạo được script");

  return JSON.parse(result) as Script[];
};


// ====== 3️⃣ TẠO PROMPT VEO-3 ======
export const generateVeoPrompt = async (script: Script, config: AppConfig): Promise<GeneratedVeoData> => {
  const ai = getAI();

  const prompt = `
    Dựa trên kịch bản gồm ${script.scenes.length} cảnh,
    Hãy tạo prompt JSON cho Veo-3 bằng tiếng Anh, tối ưu quay phim thời trang.
    Trả về dạng:
    {
      "scenePrompts": [...],
      "adsCaption": "...",
      "hashtags": [...],
      "ctaVariations": [...]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-pro-latest",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  const result = await response.response.text();
  if (!result) throw new Error("Không tạo được Veo Prompt");

  return JSON.parse(result) as GeneratedVeoData;
};

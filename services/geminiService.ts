import { AppConfig, VisionAnalysis, Script, GeneratedVeoData } from "../types";

// ----------------------- GENERIC TEXT AI CALL -----------------------
const callTextAI = async (prompt: string) => {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  return await res.json();
};

// ----------------------- 1. VISION ANALYSIS -----------------------
export const analyzeProductImage = async (base64Image: string): Promise<VisionAnalysis> => {
  const res = await fetch("/api/vision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image }),
  });

  const data = await res.json();

  if (!data) throw new Error("Vision API returned no response");

  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text);
  } catch {
    return data;
  }
};

// ----------------------- 2. GENERATE 5 SCRIPTS -----------------------
export const generateScripts = async (config: AppConfig): Promise<Script[]> => {
  const prompt = `
    Đóng vai đạo diễn sản xuất video quảng cáo thời trang.
    Tạo NGAY 5 kịch bản video khác nhau cho sản phẩm sau:

    Sản phẩm: ${config.productName}
    Mô tả: ${config.productDescription}
    Dữ liệu phân tích AI từ hình ảnh: ${JSON.stringify(config.visionData)}

    CÀI ĐẶT VIDEO:
    - Phong cách video: ${config.videoStyle}
    - Loại video: ${config.videoType}
    - Ngôn ngữ: ${config.language}
    - Giọng đọc: ${config.accent}

    YÊU CẦU JSON TRẢ VỀ:
    [
      {
        "id": "",
        "title": "",
        "hook": "",
        "scenes": [
          { "time": "", "action": "", "dialogue_or_text": "", "camera_angle": "", "music": "" }
        ]
      }
    ]
  `;

  const result = await callTextAI(prompt);
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Script generation failed");

  return JSON.parse(text);
};

// ----------------------- 3. GENERATE VEO PROMPTS -----------------------
export const generateVeoPrompt = async (script: Script, config: AppConfig): Promise<GeneratedVeoData> => {
  const prompt = `
    Tạo VEO-3 VIDEO PROMPTS.

    Dựa trên:
    Script: ${JSON.stringify(script)}
    Config: ${JSON.stringify(config)}
    Vision: ${JSON.stringify(config.visionData)}

    TRẢ VỀ JSON:
    {
      "scenePrompts": [
        {
          "description": "",
          "camera": "",
          "lighting": "",
          "motion": "",
          "text": "",
          "aspect_ratio": "9:16"
        }
      ],
      "adsCaption": "",
      "hashtags": [],
      "ctaVariations": []
    }
  `;

  const result = await callTextAI(prompt);
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Generate VEO Prompt failed");

  return JSON.parse(text);
};

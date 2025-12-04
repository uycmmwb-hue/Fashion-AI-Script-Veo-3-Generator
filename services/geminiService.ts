
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AppConfig, VisionAnalysis, Script, GeneratedVeoData } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper: File to Base64 ---
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- 1. Vision Analysis ---
export const analyzeProductImage = async (base64Image: string): Promise<VisionAnalysis> => {
  const ai = getAI();
  
  const prompt = `
    Phân tích hình ảnh sản phẩm thời trang này để viết kịch bản video marketing.
    Trích xuất các chi tiết sau dưới dạng JSON (Giá trị trả về phải bằng Tiếng Việt):
    - category: Loại sản phẩm (ví dụ: Váy mùa hè, Vest công sở).
    - color_tone: Bảng màu chủ đạo.
    - style: Phong cách thời trang (ví dụ: Tối giản, Vintage, Đường phố).
    - target_age: Độ tuổi khách hàng mục tiêu ước tính.
    - brand_tone: Giọng điệu thương hiệu gợi ý (ví dụ: Sang trọng, Vui tươi).
    - usp_highlights: 5 điểm bán hàng độc nhất (USP) hoặc điểm nhấn hình ảnh.
    - tone_scores: Một mảng các đối tượng có 'name' (thuộc tính như 'Sang trọng', 'Thoải mái', 'Táo bạo', 'Thanh lịch', 'Xu hướng') và 'value' (điểm số nguyên 0-100).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          color_tone: { type: Type.STRING },
          style: { type: Type.STRING },
          target_age: { type: Type.STRING },
          brand_tone: { type: Type.STRING },
          usp_highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          tone_scores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.INTEGER }
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) throw new Error("No analysis result");
  return JSON.parse(response.text) as VisionAnalysis;
};

// --- 2. Generate Scripts ---
export const generateScripts = async (config: AppConfig): Promise<Script[]> => {
  const ai = getAI();
  
  // Logic xử lý nghiêm ngặt cho yêu cầu Không lời thoại
  const isNoDialogue = config.videoStyle.includes('Không lời thoại');
  
  const strictRequirements = isNoDialogue
    ? `YÊU CẦU ĐẶC BIỆT: Đây là video KHÔNG LỜI THOẠI (Non-verbal). 
       - Tuyệt đối KHÔNG viết lời thoại cho nhân vật. 
       - Trường 'dialogue_or_text' CHỈ ĐƯỢC chứa nội dung chữ hiển thị (Text Overlay) hoặc ghi chú về âm nhạc/âm thanh.
       - Tập trung mô tả hành động và biểu cảm.`
    : `YÊU CẦU: Viết lời thoại tự nhiên, hấp dẫn, phù hợp với giọng đọc ${config.accent}.`;

  const prompt = `
    Đóng vai một Đạo diễn Video Thời trang chuyên nghiệp.
    Tạo 5 kịch bản video 30 giây khác biệt cho sản phẩm sau.
    Nội dung kịch bản phải viết bằng Tiếng Việt (trừ khi Ngôn ngữ được chọn là Tiếng Anh).
    
    Sản phẩm: ${config.productName}
    Mô tả: ${config.productDescription}
    Dữ liệu phân tích Vision: ${JSON.stringify(config.visionData)}
    
    Cài đặt:
    - Phong cách: ${config.videoStyle}
    - Loại: ${config.videoType}
    - Ngôn ngữ: ${config.language}
    - Giọng đọc: ${config.accent}
    
    YÊU CẦU BẮT BUỘC (TUÂN THỦ TUYỆT ĐỐI):
    1. SỐ LƯỢNG CẢNH: Mỗi kịch bản phải có ĐÚNG 3 CẢNH (SCENES). Không được viết nhiều hơn hay ít hơn 3 cảnh.
    2. ${strictRequirements}
    3. Tổng thời lượng xấp xỉ 30 giây.
    4. Các kịch bản nên khác nhau về góc độ (ví dụ: một cái thiên về cảm xúc, một cái nhịp độ nhanh, một cái tập trung vào tính năng).
    
    Trả về một mảng JSON gồm 5 kịch bản.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        hook: { type: Type.STRING },
        rationale: { type: Type.STRING, description: "Lý do tại sao kịch bản này hiệu quả" },
        benefits_highlighted: { type: Type.ARRAY, items: { type: Type.STRING } },
        cta_overlay: { type: Type.STRING },
        cta_voice: { type: Type.STRING },
        scenes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              action: { type: Type.STRING },
              dialogue_or_text: { type: Type.STRING, description: isNoDialogue ? "Chỉ chữ hiển thị (Overlay) hoặc Âm nhạc" : "Lời thoại hoặc chữ hiển thị" },
              camera_angle: { type: Type.STRING },
              visual_prompt: { type: Type.STRING, description: "Mô tả hình ảnh ngắn gọn cho AI tạo video (Viết bằng Tiếng Anh để tối ưu cho Veo)" },
              music: { type: Type.STRING }
            }
          }
        }
      }
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  });

  if (!response.text) throw new Error("Failed to generate scripts");
  return JSON.parse(response.text) as Script[];
};

// --- 3. Generate Veo-3 Prompt ---
export const generateVeoPrompt = async (script: Script, config: AppConfig): Promise<GeneratedVeoData> => {
  const ai = getAI();
  
  const prompt = `
    Dựa trên kịch bản video đã chọn gồm ${script.scenes.length} cảnh, hãy tạo ${script.scenes.length} JSON prompt riêng biệt tương ứng với từng phân cảnh (scene) để tạo video bằng model Veo-3.
    Nội dung trong JSON (description, style, characters, etc.) phải viết bằng TIẾNG ANH (English) chuẩn.
    
    Thông tin đầu vào:
    - Tiêu đề kịch bản: ${script.title}
    - Sản phẩm: ${config.productName}
    - Vision Data: ${JSON.stringify(config.visionData)}
    - Script Content: ${JSON.stringify(script)}
    
    YÊU CẦU TỐI ƯU HÓA CHẤT LƯỢNG (NÂNG CAO):
    Để tạo ra video chất lượng cao nhất, hãy tự động thêm các chi tiết chuyên nghiệp sau vào prompt (Enrichment) ngay cả khi kịch bản gốc không ghi rõ:
    1. CAMERA: Sử dụng ngôn ngữ điện ảnh cụ thể (ví dụ: "Slow cinematic dolly-in", "Low-angle tracking shot", "Smooth pan revealing details", "Rack focus from blurry foreground"). Tránh các góc máy tĩnh nhàm chán.
    2. LIGHTING: Mô tả chi tiết hướng và chất lượng ánh sáng (ví dụ: "Soft volumetric lighting", "Golden hour rim-light emphasizing texture", "Studio fashion lighting with softbox", "Moody chiaroscuro").
    3. MOTION: Mô tả chuyển động vi mô (micro-movements) để nhân vật sống động (ví dụ: "fingers gently tracing the fabric", "subtle shift in weight", "hair blowing softly in wind", "eyes glancing confidently").
    4. STYLE: Thêm các từ khóa chất lượng cao (ví dụ: "8k", "photorealistic", "highly detailed texture", "fashion magazine editorial look", "shot on Arri Alexa").
    
    QUAN TRỌNG: 
    1. Trả về mảng "scenePrompts" chứa đúng ${script.scenes.length} đối tượng JSON.
    2. Mỗi đối tượng JSON tương ứng với 1 cảnh trong kịch bản theo đúng thứ tự.
    3. Cấu trúc mỗi JSON phải chính xác như sau:
    
    {
      "description": "Mô tả chi tiết phân cảnh...",
      "style": "Elegant, contemporary fashion editorial...",
      "camera": "Góc máy và chuyển động của cảnh này...",
      "lighting": "Ánh sáng...",
      "environment": "Bối cảnh...",
      "characters": [ ... ],
      "motion": "Hành động cụ thể trong cảnh này...",
      "dialogue": [ ... ],
      "ending": "Kết thúc của cảnh này...",
      "text": "văn bản hiển thị",
      "keywords": [ ... ],
      "aspect_ratio": "9:16"
    }

    Ngoài ra, tạo thêm các tài sản marketing (adsCaption, hashtags, ctaVariations) bằng Tiếng Việt.
  `;

  // Schema definition for a single Veo Prompt Structure to be reused in array
  const veoPromptSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING },
      style: { type: Type.STRING },
      camera: { type: Type.STRING },
      lighting: { type: Type.STRING },
      environment: { type: Type.STRING },
      characters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            age: { type: Type.STRING },
            gender: { type: Type.STRING },
            ethnicity: { type: Type.STRING },
            appearance: {
              type: Type.OBJECT,
              properties: {
                hair: { type: Type.STRING },
                expression: { type: Type.STRING },
                outfit: { type: Type.STRING }
              }
            }
          }
        }
      },
      motion: { type: Type.STRING },
      dialogue: { type: Type.ARRAY, items: { type: Type.STRING } },
      ending: { type: Type.STRING },
      text: { type: Type.STRING },
      keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      aspect_ratio: { type: Type.STRING }
    }
  };

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      scenePrompts: {
        type: Type.ARRAY,
        items: veoPromptSchema
      },
      adsCaption: { type: Type.STRING },
      hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
      ctaVariations: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  });

  if (!response.text) throw new Error("Failed to generate Veo prompt");
  return JSON.parse(response.text) as GeneratedVeoData;
};

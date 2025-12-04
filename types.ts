
export enum VideoStyle {
  WITH_DIALOGUE = 'Có lời thoại',
  NO_DIALOGUE = 'Không lời thoại (Chỉ hành động)',
}

export enum VideoType {
  SINGLE_NARRATION = 'Dẫn chuyện một người',
  TWO_PERSON_DIALOGUE = 'Đối thoại hai người',
}

export enum Language {
  VIETNAMESE = 'Tiếng Việt',
  ENGLISH = 'Tiếng Anh',
}

export enum Accent {
  NORTHERN = 'Miền Bắc',
  SOUTHERN = 'Miền Nam',
  NONE = 'Không (Tiếng Anh)',
}

export interface VisionAnalysis {
  category: string;
  color_tone: string;
  style: string;
  target_age: string;
  brand_tone: string;
  usp_highlights: string[];
  tone_scores: { name: string; value: number }[]; // For visualization
}

export interface AppConfig {
  videoStyle: VideoStyle;
  videoType: VideoType;
  language: Language;
  accent: Accent;
  productName: string;
  productDescription: string;
  visionData?: VisionAnalysis;
}

export interface Scene {
  time: string;
  action: string;
  dialogue_or_text: string;
  camera_angle: string;
  visual_prompt: string;
  music?: string;
}

export interface Script {
  id: string;
  title: string;
  hook: string;
  scenes: Scene[];
  benefits_highlighted: string[];
  cta_overlay: string;
  cta_voice: string;
  rationale: string;
}

export interface VeoPromptStructure {
  description: string;
  style: string;
  camera: string;
  lighting: string;
  environment: string;
  characters: {
    name: string;
    age: string;
    gender: string;
    ethnicity: string;
    appearance: {
      hair: string;
      expression: string;
      outfit: string;
    };
  }[];
  motion: string;
  dialogue: string[];
  ending: string;
  text: string;
  keywords: string[];
  aspect_ratio: string;
}

export interface GeneratedVeoData {
  scenePrompts: VeoPromptStructure[]; // Changed from single jsonPrompt to array
  adsCaption: string;
  hashtags: string[];
  ctaVariations: string[];
}

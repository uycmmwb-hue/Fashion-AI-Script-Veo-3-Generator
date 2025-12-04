import React, { useRef, useState } from 'react';
import { Upload, Loader2, Wand2, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppConfig, VideoStyle, VideoType, Language, Accent, VisionAnalysis } from '../types';
import { analyzeProductImage, fileToGenerativePart } from '../services/geminiService';
import { AnalysisChart } from './AnalysisChart';

interface ConfigPanelProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  onGenerateScripts: () => void;
  isGeneratingScripts: boolean;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig, onGenerateScripts, isGeneratingScripts }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const base64 = await fileToGenerativePart(file);
      const analysis = await analyzeProductImage(base64);
      
      setConfig(prev => ({
        ...prev,
        visionData: analysis,
        productDescription: `Một ${analysis.category} phong cách ${analysis.style} với tông màu ${analysis.color_tone}. Phù hợp cho độ tuổi ${analysis.target_age}. Tone: ${analysis.brand_tone}. \n\nĐiểm nổi bật:\n- ${analysis.usp_highlights.join('\n- ')}`
      }));
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Không thể phân tích ảnh. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white border-r border-fashion-200 h-screen overflow-y-auto w-full md:w-[400px] flex-shrink-0 flex flex-col shadow-xl z-20">
      <div className="p-6 border-b border-fashion-100 bg-fashion-50 sticky top-0 z-10">
        <h1 className="font-serif text-2xl font-bold text-fashion-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-fashion-500" />
          Fashion<span className="text-fashion-500">AI</span>
        </h1>
        <p className="text-xs text-fashion-500 uppercase tracking-widest mt-1">Script & Veo-3 Generator</p>
      </div>

      <div className="p-6 space-y-8 flex-1">
        
        {/* Section 1: Vision */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-fashion-800 uppercase tracking-wide">1. Phân tích AI Vision</h2>
            {config.visionData && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group ${
              config.visionData ? 'border-green-300 bg-green-50' : 'border-fashion-200 hover:border-fashion-400 hover:bg-fashion-50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload} 
            />
            {isAnalyzing ? (
              <div className="flex flex-col items-center py-4">
                <Loader2 className="w-8 h-8 animate-spin text-fashion-500 mb-2" />
                <span className="text-sm text-fashion-600">Đang phân tích...</span>
              </div>
            ) : config.visionData ? (
              <div className="flex flex-col items-center">
                <img 
                  src="https://picsum.photos/200/200?blur=5" // Placeholder for uploaded preview - in real app would use state
                  className="w-16 h-16 rounded-lg object-cover mb-2 opacity-50" 
                  alt="Uploaded"
                />
                <span className="text-sm font-medium text-green-700">Phân tích hoàn tất</span>
                <span className="text-xs text-green-600 mt-1">Nhấn để đổi ảnh khác</span>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <div className="w-12 h-12 rounded-full bg-fashion-100 flex items-center justify-center mb-3 group-hover:bg-fashion-200 transition-colors">
                  <Upload className="w-5 h-5 text-fashion-600" />
                </div>
                <span className="text-sm font-medium text-fashion-700">Tải ảnh sản phẩm</span>
                <span className="text-xs text-fashion-400 mt-1">AI trích xuất phong cách & màu sắc</span>
              </div>
            )}
          </div>

          {config.visionData && (
            <AnalysisChart data={config.visionData.tone_scores} />
          )}
        </div>

        {/* Section 2: Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-fashion-800 uppercase tracking-wide">2. Cấu hình</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-fashion-500 mb-1">Tên sản phẩm</label>
              <input
                type="text"
                value={config.productName}
                onChange={e => setConfig({ ...config, productName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-fashion-200 rounded-lg focus:ring-2 focus:ring-fashion-400 focus:outline-none text-fashion-900 placeholder-fashion-300"
                placeholder="ví dụ: Váy lụa mùa hè"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-fashion-500 mb-1">Mô tả (Tự động điền)</label>
              <textarea
                rows={5}
                value={config.productDescription}
                onChange={e => setConfig({ ...config, productDescription: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-fashion-200 rounded-lg focus:ring-2 focus:ring-fashion-400 focus:outline-none text-fashion-900 text-sm resize-none placeholder-fashion-300"
                placeholder="Tải ảnh để tự động điền..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-fashion-500 mb-1">Ngôn ngữ</label>
                <select 
                  value={config.language}
                  onChange={e => setConfig({ ...config, language: e.target.value as Language })}
                  className="w-full px-2 py-2 bg-white border border-fashion-200 rounded-lg text-sm"
                >
                  {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-fashion-500 mb-1">Giọng đọc</label>
                <select 
                  value={config.accent}
                  onChange={e => setConfig({ ...config, accent: e.target.value as Accent })}
                  className="w-full px-2 py-2 bg-white border border-fashion-200 rounded-lg text-sm"
                  disabled={config.language === Language.ENGLISH}
                >
                  {Object.values(Accent).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
               <div>
                <label className="block text-xs font-semibold text-fashion-500 mb-1">Phong cách</label>
                <select 
                  value={config.videoStyle}
                  onChange={e => setConfig({ ...config, videoStyle: e.target.value as VideoStyle })}
                  className="w-full px-2 py-2 bg-white border border-fashion-200 rounded-lg text-sm"
                >
                  {Object.values(VideoStyle).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-fashion-500 mb-1">Loại video</label>
                <select 
                  value={config.videoType}
                  onChange={e => setConfig({ ...config, videoType: e.target.value as VideoType })}
                  className="w-full px-2 py-2 bg-white border border-fashion-200 rounded-lg text-sm"
                >
                  {Object.values(VideoType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-fashion-200 bg-white sticky bottom-0">
        <button
          onClick={onGenerateScripts}
          disabled={!config.productName || isGeneratingScripts}
          className="w-full bg-fashion-900 text-white py-4 rounded-xl font-medium hover:bg-fashion-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-fashion-200"
        >
          {isGeneratingScripts ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Tạo 5 Kịch bản
            </>
          )}
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { GeneratedVeoData, Script, AppConfig } from '../types';
import { FileDown, FileJson, Check, Copy, ArrowLeft, Layers } from 'lucide-react';

interface VeoPromptDisplayProps {
  data: GeneratedVeoData;
  script: Script;
  config: AppConfig;
  onReset: () => void;
  onBack: () => void;
}

export const VeoPromptDisplay: React.FC<VeoPromptDisplayProps> = ({ data, script, config, onReset, onBack }) => {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const handleDownloadJSON = () => {
    // Download all scenes in one JSON file
    const blob = new Blob([JSON.stringify(data.scenePrompts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `veo3-prompts-all-scenes-${config.productName.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDocx = () => {
    // Constructing a robust HTML document that Word can open as a "DOCX"
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${script.title}</title>
        <style>
          body { font-family: 'Calibri', sans-serif; }
          h1 { color: #2d231e; font-size: 24pt; }
          h2 { color: #8c7360; font-size: 16pt; margin-top: 20px; }
          p { font-size: 11pt; line-height: 1.5; }
          .scene { border-bottom: 1px solid #ddd; padding: 10px 0; }
          .meta { color: #666; font-style: italic; }
          .prompt-box { background-color: #f0f0f0; font-family: 'Courier New'; padding: 10px; border: 1px solid #ccc; font-size: 10pt; }
        </style>
      </head>
      <body>
        <h1>${script.title}</h1>
        <p class="meta">Sản phẩm: ${config.productName} | Phong cách: ${config.videoStyle}</p>
        
        <h2>Điểm bán hàng nổi bật (USP)</h2>
        <ul>
          ${config.visionData?.usp_highlights.map(u => `<li>${u}</li>`).join('')}
        </ul>

        <h2>Phân cảnh chi tiết & Prompt</h2>
        ${script.scenes.map((s, idx) => `
          <div class="scene">
            <h3>Cảnh ${idx + 1}: ${s.time}</h3>
            <p><strong>Hình ảnh:</strong> ${s.visual_prompt}</p>
            <p><strong>Âm thanh:</strong> ${s.dialogue_or_text}</p>
            <br/>
            <p><strong>Veo-3 JSON Prompt (Scene ${idx + 1}):</strong></p>
            <div class="prompt-box">
              ${JSON.stringify(data.scenePrompts[idx] || {}, null, 2).replace(/\n/g, '<br/>').replace(/  /g, '&nbsp;&nbsp;')}
            </div>
          </div>
        `).join('')}

        <h2>Tài sản Marketing</h2>
        <p><strong>Caption Quảng cáo:</strong> ${data.adsCaption}</p>
        <p><strong>Hashtags:</strong> ${data.hashtags.join(' ')}</p>
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kich-ban-${config.productName.replace(/\s+/g, '-').toLowerCase()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentPrompt = data.scenePrompts[activeSceneIndex];

  return (
    <div className="h-screen bg-fashion-50 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8 space-y-8">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="bg-white p-2 rounded-full border border-fashion-200 hover:bg-fashion-100 transition-colors shadow-sm group"
                title="Quay lại danh sách kịch bản"
              >
                <ArrowLeft className="w-5 h-5 text-fashion-500 group-hover:text-fashion-800" />
              </button>
              <div>
                <h1 className="font-serif text-3xl text-fashion-900">Hoàn tất tạo nội dung</h1>
                <p className="text-fashion-500">Kịch bản chi tiết và Prompt Veo-3 cho từng phân cảnh.</p>
              </div>
            </div>
            <button onClick={onReset} className="text-sm font-semibold text-fashion-600 hover:text-fashion-900 underline">
              Bắt đầu dự án mới
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Col: Marketing Assets & Character Info */}
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-fashion-100">
                <h3 className="text-xs font-bold text-fashion-400 uppercase tracking-widest mb-4">Caption Quảng Cáo</h3>
                <p className="text-lg font-medium text-fashion-800 leading-relaxed">
                  "{data.adsCaption}"
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.hashtags.map(tag => (
                    <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

               <div className="bg-white p-6 rounded-xl shadow-sm border border-fashion-100">
                <h3 className="text-xs font-bold text-fashion-400 uppercase tracking-widest mb-4">Nhất quán nhân vật (Cảnh {activeSceneIndex + 1})</h3>
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-800 mb-3">
                   <div className="flex items-center gap-2 mb-1 font-bold">
                     <Check className="w-4 h-4" />
                     Đã đồng bộ
                   </div>
                   <p className="opacity-80 text-xs">Consistent in Scene {activeSceneIndex + 1}</p>
                </div>
                
                {currentPrompt?.characters.map((char, i) => (
                   <div key={i} className="mt-3 text-xs text-fashion-600 space-y-1 border-t border-fashion-100 pt-2">
                      <p className="font-bold text-fashion-800">{char.name} ({char.age}, {char.ethnicity})</p>
                      <p><span className="font-bold">Trang phục:</span> {char.appearance.outfit}</p>
                      <p><span className="font-bold">Kiểu tóc:</span> {char.appearance.hair}</p>
                   </div>
                ))}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-fashion-100">
                <h3 className="text-xs font-bold text-fashion-400 uppercase tracking-widest mb-4">Biến thể CTA</h3>
                <ul className="space-y-3">
                  {data.ctaVariations.map((cta, i) => (
                    <li key={i} className="flex gap-2 text-sm text-fashion-700">
                      <span className="text-fashion-300 font-bold">{i+1}.</span>
                      {cta}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Col: JSON Preview with Tabs */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Tabs for Scenes */}
              <div className="flex space-x-2 bg-fashion-200 p-1 rounded-lg w-fit">
                {data.scenePrompts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSceneIndex(idx)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                      activeSceneIndex === idx 
                        ? 'bg-white text-fashion-900 shadow-sm' 
                        : 'text-fashion-600 hover:text-fashion-900 hover:bg-fashion-100/50'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Cảnh {idx + 1}
                  </button>
                ))}
              </div>

              {/* JSON Display */}
              <div className="bg-fashion-900 text-fashion-50 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
                <div className="p-4 border-b border-fashion-700 flex justify-between items-center bg-fashion-950">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-fashion-300" />
                    <span className="text-sm font-mono font-bold">veo3_prompt_scene_{activeSceneIndex + 1}.json</span>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(currentPrompt, null, 2))}
                    className="text-xs bg-fashion-800 hover:bg-fashion-700 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Sao chép Cảnh {activeSceneIndex + 1}
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-6 font-mono text-xs leading-relaxed text-fashion-100">
                  <pre>{currentPrompt ? JSON.stringify(currentPrompt, null, 2) : "Đang tải dữ liệu cảnh..."}</pre>
                </div>
              </div>

              <div className="flex gap-4">
                 <button 
                   onClick={handleDownloadDocx}
                   className="flex-1 bg-white border border-fashion-200 text-fashion-900 py-4 rounded-xl font-bold hover:bg-fashion-50 hover:border-fashion-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                 >
                   <FileDown className="w-5 h-5" />
                   Xuất Kịch bản (.doc)
                 </button>
                 <button 
                   onClick={handleDownloadJSON}
                   className="flex-1 bg-fashion-600 text-white py-4 rounded-xl font-bold hover:bg-fashion-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-fashion-200"
                 >
                   <FileJson className="w-5 h-5" />
                   Tải All JSON
                 </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

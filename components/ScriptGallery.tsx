import React from 'react';
import { Script } from '../types';
import { PlayCircle, Clock, Video, ArrowRight, Check } from 'lucide-react';

interface ScriptGalleryProps {
  scripts: Script[];
  selectedScript: Script | null;
  onSelectScript: (script: Script) => void;
  onGenerateVeo: () => void;
  isGeneratingVeo: boolean;
}

export const ScriptGallery: React.FC<ScriptGalleryProps> = ({ scripts, selectedScript, onSelectScript, onGenerateVeo, isGeneratingVeo }) => {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-fashion-50">
      
      {/* Header */}
      <div className="p-8 pb-4">
        <h2 className="font-serif text-3xl text-fashion-900 mb-2">Chọn Kịch Bản</h2>
        <p className="text-fashion-500">Chọn hướng đi tốt nhất cho video sản phẩm của bạn.</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Gallery Grid */}
        <div className={`flex-1 overflow-y-auto p-8 pt-0 transition-all duration-300 ${selectedScript ? 'hidden xl:block xl:w-1/3 xl:flex-none' : 'w-full'}`}>
          <div className={`grid gap-4 ${selectedScript ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {scripts.map((script) => (
              <div
                key={script.id}
                onClick={() => onSelectScript(script)}
                className={`group cursor-pointer rounded-xl p-6 border transition-all duration-200 hover:shadow-lg relative overflow-hidden ${
                  selectedScript?.id === script.id 
                    ? 'bg-fashion-900 text-white border-fashion-900 ring-2 ring-fashion-400 ring-offset-2' 
                    : 'bg-white border-fashion-200 hover:border-fashion-400 text-fashion-800'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    selectedScript?.id === script.id ? 'bg-fashion-800 text-fashion-100' : 'bg-fashion-100 text-fashion-600'
                  }`}>
                    {script.scenes.length} Cảnh
                  </div>
                  {selectedScript?.id === script.id && <Check className="w-5 h-5 text-fashion-200" />}
                </div>
                
                <h3 className="font-serif text-xl font-bold mb-2 leading-tight">{script.title}</h3>
                <p className={`text-sm mb-4 line-clamp-3 ${selectedScript?.id === script.id ? 'text-fashion-200' : 'text-fashion-500'}`}>
                  {script.rationale}
                </p>

                <div className={`flex items-center text-xs font-bold uppercase tracking-wider ${selectedScript?.id === script.id ? 'text-fashion-300' : 'text-fashion-400'}`}>
                  <span>{script.hook.substring(0, 30)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Script Detail View */}
        {selectedScript && (
          <div className="flex-1 lg:flex-grow border-l border-fashion-200 bg-white overflow-y-auto p-8 relative shadow-inner w-full">
            <div className="max-w-3xl mx-auto space-y-8 pb-24">
              
              {/* Script Header */}
              <div className="border-b border-fashion-100 pb-6">
                <span className="text-xs font-bold text-fashion-500 uppercase tracking-widest mb-2 block">Kịch bản đã chọn</span>
                <h1 className="font-serif text-4xl text-fashion-900 mb-4">{selectedScript.title}</h1>
                <div className="bg-fashion-50 p-4 rounded-lg border border-fashion-100 text-fashion-700 italic">
                  "{selectedScript.rationale}"
                </div>
              </div>

              {/* Timeline */}
              <div>
                 <h3 className="text-xs font-bold text-fashion-500 uppercase tracking-widest mb-4">Dòng thời gian</h3>
                 <div className="space-y-4">
                   {selectedScript.scenes.map((scene, idx) => (
                     <div key={idx} className="flex gap-4 group">
                       <div className="w-16 pt-1 flex-shrink-0 text-right">
                         <span className="text-xs font-bold text-fashion-400 block">{scene.time}</span>
                         <span className="text-[10px] text-fashion-300 uppercase">{scene.camera_angle}</span>
                       </div>
                       <div className="flex-1 pb-6 border-l border-fashion-200 pl-6 relative">
                         <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-fashion-300 group-hover:bg-fashion-600 transition-colors"></div>
                         
                         <div className="bg-white border border-fashion-100 rounded-lg p-4 shadow-sm group-hover:shadow-md transition-all">
                            <div className="flex items-start gap-3 mb-2">
                                <Video className="w-4 h-4 text-fashion-400 mt-1" />
                                <p className="text-sm text-fashion-800"><span className="font-semibold">Hình ảnh:</span> {scene.visual_prompt}</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <PlayCircle className="w-4 h-4 text-fashion-400 mt-1" />
                                <p className="text-sm text-fashion-600 italic"><span className="font-semibold not-italic text-fashion-500">Âm thanh:</span> {scene.dialogue_or_text}</p>
                            </div>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-8 right-8 z-30">
               <button
                onClick={onGenerateVeo}
                disabled={isGeneratingVeo}
                className="bg-black text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform flex items-center gap-3 disabled:opacity-70 disabled:scale-100"
               >
                 {isGeneratingVeo ? 'Đang tạo Prompt Veo-3...' : 'Tạo Prompt Veo-3'}
                 {!isGeneratingVeo && <ArrowRight className="w-5 h-5" />}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
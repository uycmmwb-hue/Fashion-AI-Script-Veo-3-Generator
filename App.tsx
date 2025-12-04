import React, { useState } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { ScriptGallery } from './components/ScriptGallery';
import { VeoPromptDisplay } from './components/VeoPromptDisplay';
import { AppConfig, Script, VideoStyle, VideoType, Language, Accent, GeneratedVeoData } from './types';
import { generateScripts, generateVeoPrompt } from './services/geminiService';

export default function App() {
  // --- State ---
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [config, setConfig] = useState<AppConfig>({
    videoStyle: VideoStyle.WITH_DIALOGUE,
    videoType: VideoType.SINGLE_NARRATION,
    language: Language.VIETNAMESE,
    accent: Accent.NORTHERN,
    productName: '',
    productDescription: '',
  });
  
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [veoData, setVeoData] = useState<GeneratedVeoData | null>(null);
  
  const [isGeneratingScripts, setIsGeneratingScripts] = useState(false);
  const [isGeneratingVeo, setIsGeneratingVeo] = useState(false);

  // --- Handlers ---

  const handleGenerateScripts = async () => {
    setIsGeneratingScripts(true);
    try {
      const generatedScripts = await generateScripts(config);
      setScripts(generatedScripts);
      setStep(2);
    } catch (error) {
      console.error(error);
      alert("Không thể tạo kịch bản. Vui lòng kiểm tra API key và thử lại.");
    } finally {
      setIsGeneratingScripts(false);
    }
  };

  const handleGenerateVeo = async () => {
    if (!selectedScript) return;
    setIsGeneratingVeo(true);
    try {
      const data = await generateVeoPrompt(selectedScript, config);
      setVeoData(data);
      setStep(3);
    } catch (error) {
      console.error(error);
      alert("Không thể tạo prompt Veo. Vui lòng thử lại.");
    } finally {
      setIsGeneratingVeo(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setScripts([]);
    setSelectedScript(null);
    setVeoData(null);
  };

  const handleBackToGallery = () => {
    setStep(2);
    setVeoData(null); // Clear the specific Veo data but keep the scripts list
  };

  // --- Render ---

  return (
    <div className="flex h-screen w-full bg-fashion-50 font-sans text-fashion-900 overflow-hidden">
      
      {/* Sidebar: Always visible on Step 1 & 2 */}
      {(step === 1 || step === 2) && (
        <ConfigPanel 
          config={config} 
          setConfig={setConfig} 
          onGenerateScripts={handleGenerateScripts}
          isGeneratingScripts={isGeneratingScripts}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 h-full relative">
        
        {/* Step 1: Placeholder / Introduction */}
        {step === 1 && (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-50 select-none">
            <div className="w-32 h-32 bg-fashion-200 rounded-full mb-6 animate-pulse"></div>
            <h2 className="text-2xl font-serif text-fashion-400 mb-2">Sẵn sàng sáng tạo</h2>
            <p className="text-fashion-300 max-w-md">Cấu hình sản phẩm ở bên trái để bắt đầu tạo kịch bản thời trang chuyên nghiệp.</p>
          </div>
        )}

        {/* Step 2: Script Gallery */}
        {step === 2 && (
          <ScriptGallery 
            scripts={scripts} 
            selectedScript={selectedScript}
            onSelectScript={setSelectedScript}
            onGenerateVeo={handleGenerateVeo}
            isGeneratingVeo={isGeneratingVeo}
          />
        )}

        {/* Step 3: Final Results (Full Screen Overlay) */}
        {step === 3 && veoData && selectedScript && (
          <div className="absolute inset-0 z-50 bg-fashion-50">
            <VeoPromptDisplay 
              data={veoData}
              script={selectedScript}
              config={config}
              onReset={handleReset}
              onBack={handleBackToGallery}
            />
          </div>
        )}

      </div>
    </div>
  );
}
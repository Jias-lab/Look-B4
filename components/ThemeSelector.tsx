import React from 'react';
import { THEMES, VINTAGE_ERAS } from '../constants';
import { Image as ImageIcon, Dices } from 'lucide-react';

interface ThemeSelectorProps {
  selectedTheme: string | null;
  selectedVintageEra: string | null;
  onSelectTheme: (id: string) => void;
  onSelectVintage: (era: string) => void;
  onRandomTheme: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  customThemeLabel?: string | null;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  selectedTheme, 
  selectedVintageEra,
  onSelectTheme, 
  onSelectVintage,
  onRandomTheme,
  onGenerate,
  isGenerating,
  customThemeLabel
}) => {
  // Check if the current theme is one of the standard listed ones
  const isStandardTheme = THEMES.some(t => t.id === selectedTheme);
  // If we have a selectedTheme but it's NOT standard, it's a random/surprise one
  const isRandomActive = selectedTheme && !isStandardTheme;

  return (
    <div className="flex flex-col gap-5">
      
      {/* Themes */}
      <div className="flex flex-wrap gap-2">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelectTheme(theme.id)}
            className={`px-3 py-2 rounded-full text-xs transition-all duration-200 border ${
              selectedTheme === theme.id 
                ? 'bg-accent text-black border-accent font-semibold shadow-lg shadow-accent/20' 
                : 'bg-[#2c2c2e] text-text-main border-[#3a3a3c] hover:border-text-sub'
            }`}
          >
            {theme.label}
          </button>
        ))}

        <button
            onClick={onRandomTheme}
            className={`px-3 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${
                isRandomActive 
                ? 'bg-accent text-black border-accent shadow-lg shadow-accent/20' 
                : 'bg-[#333] text-white border-[#444] hover:bg-white hover:text-black'
            }`}
            title="Pick a Surprise Theme (Not Listed)"
        >
            <Dices className="w-3 h-3" />
            {isRandomActive ? (customThemeLabel || 'Surprise!') : 'Random'}
        </button>
      </div>

      {/* Vintage Sub-options */}
      {selectedTheme === 'vintage' && (
        <div className="border-t border-[#333] pt-3 animate-fadeIn">
          <span className="text-[10px] text-text-sub uppercase tracking-wider mb-2 block">Select Era</span>
          <div className="flex flex-wrap gap-2">
            {VINTAGE_ERAS.map((era) => (
              <button
                key={era}
                onClick={() => onSelectVintage(era)}
                className={`px-3 py-1.5 rounded-full text-[10px] border transition-all ${
                  selectedVintageEra === era
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-[#2c2c2e] border-[#3a3a3c] text-text-sub hover:border-accent hover:text-white'
                }`}
              >
                {era}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls & Generate */}
      <div className="flex flex-col gap-4 mt-2 border-t border-[#ffffff05] pt-4">
        
        {/* Generate Button */}
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full bg-accent text-black font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]`}
        >
          {isGenerating ? (
            <span className="animate-pulse">Generating Styles...</span>
          ) : (
            <>
               <ImageIcon className="w-5 h-5" />
               Generate Hairstyle Grid
            </>
          )}
        </button>
      </div>
    </div>
  );
};
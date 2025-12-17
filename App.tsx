import React, { useState, useEffect } from 'react';
import { PhotoUpload } from './components/PhotoUpload';
import { ThemeSelector } from './components/ThemeSelector';
import { PromptBar } from './components/PromptBar';
import { generateImageWithGemini } from './services/geminiService';
import { PRESETS, FUN_STYLES, THEMES, SURPRISE_THEMES } from './constants';
import { GridData } from './types';
import { Wand2, AlertCircle, Maximize2, Download, X, Scissors, Archive, MonitorPlay, Shuffle, Type, Key } from 'lucide-react';
// @ts-ignore
import JSZip from 'jszip';

const App: React.FC = () => {
  // State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>('wedding');
  const [selectedVintageEra, setSelectedVintageEra] = useState<string | null>(null);
  // Store the label for custom/surprise themes that aren't in the main list
  const [customThemeLabel, setCustomThemeLabel] = useState<string | null>(null);
  
  const [gridData, setGridData] = useState<GridData>(PRESETS['wedding']);
  const [noCaptions, setNoCaptions] = useState<boolean>(false);
  
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  
  // Slicing State
  const [slicedImages, setSlicedImages] = useState<string[]>([]);
  const [showSlicesModal, setShowSlicesModal] = useState<boolean>(false);
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // API Key State
  const [showKeyConnect, setShowKeyConnect] = useState<boolean>(false);

  useEffect(() => {
    const checkKeyStatus = async () => {
        // @ts-ignore
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
            // @ts-ignore
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setShowKeyConnect(!hasKey);
        }
    };
    checkKeyStatus();
  }, []);

  const handleConnectKey = async () => {
      try {
          // @ts-ignore
          if (window.aistudio && window.aistudio.openSelectKey) {
              // @ts-ignore
              await window.aistudio.openSelectKey();
              setShowKeyConnect(false);
              setErrorMsg(null);
          }
      } catch (e) {
          console.error("Key selection failed", e);
      }
  };

  // Handlers
  const handleSelectTheme = (id: string) => {
    setSelectedTheme(id);
    setSelectedVintageEra(null);
    setCustomThemeLabel(null); // Clear custom label when a standard theme is picked
    
    // Logic for Fun theme or Standard theme
    if (id === 'fun') {
        const shuffled = [...FUN_STYLES].sort(() => 0.5 - Math.random());
        // Fill grid with random styles from the fun list
        const newGrid = Array(9).fill("").map((_, i) => shuffled[i % shuffled.length]);
        setGridData(newGrid);
    } else {
        if (id !== 'vintage') {
            const newPreset = PRESETS[id] || Array(9).fill(`${id} style variation`);
            setGridData(newPreset);
        } else {
            setGridData(PRESETS['vintage']);
        }
    }
  };

  const handleRandomTheme = () => {
      // Select from SURPRISE_THEMES (items NOT in the main list)
      const randomTheme = SURPRISE_THEMES[Math.floor(Math.random() * SURPRISE_THEMES.length)];
      
      setSelectedTheme(randomTheme.id);
      setCustomThemeLabel(randomTheme.label);
      setGridData(randomTheme.styles);
      setSelectedVintageEra(null);
  };

  const handleSelectVintage = (era: string) => {
    setSelectedVintageEra(era);
    const specificEra = Array(9).fill(`${era} variation`);
    specificEra[4] = `${era} Main Style`;
    setGridData(specificEra);
  };

  const getRemixedGrid = (): GridData => {
     let newGrid: GridData = [];
     
     // If current theme is fun, shuffle random styles
     if (selectedTheme === 'fun') {
         const shuffled = [...FUN_STYLES].sort(() => 0.5 - Math.random());
         newGrid = Array(9).fill("").map((_, i) => shuffled[i % shuffled.length]);
     } else if (selectedTheme && PRESETS[selectedTheme]) {
         // Shuffle the existing preset styles
         const currentPreset = [...PRESETS[selectedTheme]];
         newGrid = currentPreset.sort(() => 0.5 - Math.random());
     } else if (selectedTheme && !PRESETS[selectedTheme]) {
         // It's a surprise theme (no entry in standard PRESETS usually)
         // Shuffle the current grid data
         newGrid = [...gridData].sort(() => 0.5 - Math.random());
     } else {
         // Fallback
         newGrid = [...gridData].sort(() => 0.5 - Math.random());
     }
     return newGrid;
  };

  const handleRemixAndGenerate = () => {
      const newGrid = getRemixedGrid();
      setGridData(newGrid);
      handleGenerate('1K', newGrid);
  };

  const handleGenerate = async (resolution: '1K' | '2K' | '4K' = '1K', overrideGridData?: GridData, overrideNoCaptions?: boolean) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSlicedImages([]); // Reset slices on new generation
    
    if (resolution === '1K') setGeneratedImage(null);

    // Use override data if provided (for remix), otherwise use state
    const activeGridData = overrideGridData || gridData;
    const activeNoCaptions = overrideNoCaptions !== undefined ? overrideNoCaptions : noCaptions;

    // 1. Construct Narrative Prompt
    const positions = [
      "Top-Left", "Top-Center", "Top-Right",
      "Middle-Left", "Center", "Middle-Right",
      "Bottom-Left", "Bottom-Center", "Bottom-Right"
    ];
    
    const gridInstructions = activeGridData.map((style, i) => `${positions[i]} panel: "${style}"`).join(". ");
    const subject = imageSrc ? "Female model with uploaded facial features" : "Female model";
    
    // Determine the display name for the prompt
    let themeDisplayName = selectedTheme || 'Creative';
    if (customThemeLabel) {
        themeDisplayName = customThemeLabel;
    } else if (selectedTheme === 'fun') {
        themeDisplayName = 'Creative Fun & Wild Artistic Interpretation';
    }

    let resolutionPrompt = resolution === '1K' ? '8k' : resolution;

    let apiPrompt = `Create a high-quality 3x3 grid collage of hairstyles. 
    Subject: ${subject}. 
    Theme: ${themeDisplayName}. 
    Grid Layout Instructions: ${gridInstructions}
    Overall Style: ${resolutionPrompt} resolution, photorealistic, studio lighting, consistent face across panels, highly detailed hair textures. Ensure the grid is perfectly aligned 3x3.`;

    if (activeNoCaptions) {
        apiPrompt += "\nIMPORTANT: Do not include any text, labels, watermarks, or captions in the image.";
    }

    // 2. Construct JSON Object for Display
    const promptJson = {
      app: "Lumière Salon",
      version: "1.4",
      configuration: {
        subject: subject,
        theme: themeDisplayName,
        layout: "3x3 Grid",
        resolution: resolution,
        no_captions: activeNoCaptions
      },
      grid_styles: {
        top_row: [activeGridData[0], activeGridData[1], activeGridData[2]],
        middle_row: [activeGridData[3], activeGridData[4], activeGridData[5]],
        bottom_row: [activeGridData[6], activeGridData[7], activeGridData[8]]
      },
      technical_prompt: apiPrompt
    };

    setGeneratedPrompt(JSON.stringify(promptJson, null, 2));

    try {
        const imageResult = await generateImageWithGemini({
            prompt: apiPrompt, 
            referenceImageBase64: imageSrc,
            resolution: resolution
        });
        
        if (imageResult) {
            setGeneratedImage(imageResult);
        } else {
            setErrorMsg("Failed to generate image. Please try again.");
        }
    } catch (e: any) {
        console.error("Generation failed", e);
        // Check for permission errors specifically
        if (e.message?.includes('403') || e.message?.includes('PERMISSION_DENIED') || e.status === 'PERMISSION_DENIED') {
             setErrorMsg("API Key Permission Denied. Please connect a valid key.");
             setShowKeyConnect(true);
        } else {
             setErrorMsg("API Error: Failed to generate. Check console for details.");
        }
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDownloadMain = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'lumiere-salon-grid.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const performSlice = () => {
      if (!generatedImage) return;
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
          const w = img.width / 3;
          const h = img.height / 3;
          const newSlices: string[] = [];
          
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) return;
          
          for (let row = 0; row < 3; row++) {
              for (let col = 0; col < 3; col++) {
                  ctx.clearRect(0, 0, w, h);
                  ctx.drawImage(img, col * w, row * h, w, h, 0, 0, w, h);
                  newSlices.push(canvas.toDataURL('image/png'));
              }
          }
          setSlicedImages(newSlices);
          setShowSlicesModal(true);
      };
      img.src = generatedImage;
  };

  const handleDownloadSlice = (dataUrl: string, index: number) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `lumiere-slice-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleDownloadZip = async () => {
    if (slicedImages.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("lumiere-slices");

    slicedImages.forEach((dataUrl, i) => {
        const base64Data = dataUrl.split(',')[1];
        folder.file(`slice-${i + 1}.png`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);

    const link = document.createElement('a');
    link.href = url;
    link.download = "lumiere-salon-slices.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ----------------------------------------------------------------
  // RENDERING
  // ----------------------------------------------------------------

  return (
    <div className="min-h-screen bg-background text-text-main font-sans selection:bg-accent selection:text-black flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full text-center py-6 border-b border-[#ffffff05] bg-card/30 backdrop-blur-sm sticky top-0 z-40 px-4">
        <div className="relative max-w-7xl mx-auto flex items-center justify-center">
            <div>
                <h1 className="text-2xl md:text-3xl font-light tracking-[0.2em] text-accent">LUMIÈRE SALON</h1>
                <p className="text-xs md:text-sm text-text-sub mt-2 tracking-wide uppercase">Premium AI Hairstyle Architect</p>
            </div>
            
            {showKeyConnect && (
                <button 
                    onClick={handleConnectKey}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#1c1c1e] text-accent border border-accent/30 hover:bg-accent hover:text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 animate-pulse"
                    title="API Key Required for Generation"
                >
                    <Key className="w-3 h-3" />
                    <span className="hidden sm:inline">Connect Key</span>
                </button>
            )}
        </div>
      </header>

      {/* Main Content Container */}
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* LEFT COLUMN: Input & Configuration */}
            <div className="flex flex-col gap-6">
                
                {/* Photo Upload */}
                <section className="bg-card rounded-2xl p-6 shadow-xl border border-[#ffffff05]">
                  <span className="text-xs uppercase tracking-widest text-text-sub mb-4 block font-semibold flex items-center gap-2">
                    <span className="bg-accent/20 text-accent rounded-full w-5 h-5 flex items-center justify-center text-[10px]">1</span>
                    Client Photo
                  </span>
                  <PhotoUpload imageSrc={imageSrc} onImageUpload={setImageSrc} />
                </section>

                {/* Theme Selector */}
                <section className="bg-card rounded-2xl p-6 shadow-xl border border-[#ffffff05]">
                  <span className="text-xs uppercase tracking-widest text-text-sub mb-4 block font-semibold flex items-center gap-2">
                    <span className="bg-accent/20 text-accent rounded-full w-5 h-5 flex items-center justify-center text-[10px]">2</span>
                    Theme & Style
                  </span>
                  <ThemeSelector 
                    selectedTheme={selectedTheme} 
                    selectedVintageEra={selectedVintageEra}
                    onSelectTheme={handleSelectTheme}
                    onSelectVintage={handleSelectVintage}
                    onRandomTheme={handleRandomTheme}
                    onGenerate={() => handleGenerate('1K')}
                    isGenerating={isProcessing}
                    customThemeLabel={customThemeLabel}
                  />
                  {errorMsg && (
                      <div className="mt-4 p-4 bg-red-900/10 border border-red-500/30 rounded-xl flex flex-col gap-2 animate-fadeIn">
                          <div className="flex items-center gap-2 text-red-200 text-xs font-bold">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              {errorMsg}
                          </div>
                          {showKeyConnect && (
                              <button 
                                onClick={handleConnectKey}
                                className="ml-6 w-fit px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30 transition-colors flex items-center gap-2"
                              >
                                  <Key className="w-3 h-3" />
                                  Connect API Key to Fix
                              </button>
                          )}
                      </div>
                  )}
                </section>
            </div>

            {/* RIGHT COLUMN: Output & Tools */}
            <div className="flex flex-col gap-6 lg:sticky lg:top-32">
                
                {/* Generated Result */}
                <section className={`bg-card rounded-2xl p-6 shadow-xl border ${generatedImage ? 'border-accent/50 shadow-[0_0_30px_rgba(212,175,55,0.1)]' : 'border-[#ffffff05]'} flex flex-col`}>
                   <div className="flex justify-between items-center mb-4">
                        <span className="text-xs uppercase tracking-widest text-text-sub font-semibold flex items-center gap-2">
                            <Wand2 className="w-4 h-4 text-accent" />
                            Generated Result
                        </span>
                        
                        {/* Compact Actions Toolbar */}
                        {generatedImage && !isProcessing && (
                            <div className="flex items-center gap-1.5 bg-[#111] p-1.5 rounded-lg border border-[#333]">
                                <button 
                                    onClick={handleRemixAndGenerate}
                                    className="p-1.5 hover:bg-[#333] hover:text-white rounded transition-colors text-text-sub relative group"
                                    title="Remix & Regenerate"
                                >
                                    <Shuffle className="w-4 h-4" />
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Remix & Regenerate</span>
                                </button>

                                <button 
                                    onClick={performSlice}
                                    className="p-1.5 hover:bg-[#333] hover:text-white rounded transition-colors text-text-sub relative group"
                                    title="Slice Grid"
                                >
                                    <Scissors className="w-4 h-4" />
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Slice</span>
                                </button>
                                
                                <div className="w-px h-4 bg-[#333] mx-0.5"></div>

                                <button 
                                    onClick={() => handleGenerate('2K')}
                                    className="px-1.5 py-0.5 hover:bg-[#333] hover:text-white rounded transition-colors text-text-sub text-[10px] font-bold border border-transparent hover:border-[#444]"
                                    title="Upscale to 2K"
                                >
                                    2K
                                </button>
                                <button 
                                    onClick={() => handleGenerate('4K')}
                                    className="px-1.5 py-0.5 hover:bg-[#333] hover:text-white rounded transition-colors text-text-sub text-[10px] font-bold border border-transparent hover:border-[#444]"
                                    title="Upscale to 4K"
                                >
                                    4K
                                </button>
                                
                                <div className="w-px h-4 bg-[#333] mx-0.5"></div>

                                <button 
                                    onClick={handleDownloadMain}
                                    className="p-1.5 hover:bg-[#333] hover:text-accent rounded transition-colors text-white relative group"
                                    title="Download"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setEnlargedImage(generatedImage)}
                                    className="p-1.5 hover:bg-[#333] hover:text-white rounded transition-colors text-white relative group"
                                    title="Enlarge"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                   </div>
                  
                  {/* Image Container - Enforced Square Aspect Ratio */}
                  <div className="w-full aspect-square bg-black/50 rounded-xl overflow-hidden relative group border border-[#222]">
                      {isProcessing ? (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-accent animate-pulse p-10">
                              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm font-medium tracking-wide">Processing Masterpiece...</span>
                          </div>
                      ) : generatedImage ? (
                          <>
                            <img 
                                src={generatedImage} 
                                alt="Generated Hairstyle Grid" 
                                className="w-full h-full object-contain cursor-pointer" 
                                onClick={() => setEnlargedImage(generatedImage)}
                            />
                          </>
                      ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-text-sub/40 p-10">
                              <MonitorPlay className="w-12 h-12 mb-2 opacity-50" />
                              <p className="text-sm">No image generated yet.</p>
                              <p className="text-xs mt-1">Select a theme and click Generate.</p>
                          </div>
                      )}
                  </div>
                </section>

            </div>
        </div>
      </div>

      {/* Floating Prompt Bar (Hidden by default) */}
      <PromptBar prompt={generatedPrompt} />

      {/* Enlarge Image Modal */}
      {enlargedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fadeIn">
              <button 
                onClick={() => setEnlargedImage(null)}
                className="absolute top-6 right-6 p-2 bg-[#333] hover:bg-white hover:text-black rounded-full text-white transition-colors z-50"
              >
                  <X className="w-6 h-6" />
              </button>
              <div className="relative w-full max-w-7xl h-full max-h-[95vh] flex items-center justify-center p-4">
                <img 
                    src={enlargedImage} 
                    alt="Enlarged View" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                />
              </div>
          </div>
      )}

      {/* Slices Result Modal */}
      {showSlicesModal && slicedImages.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fadeIn">
             <div className="bg-[#1c1c1e] border border-[#333] w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-[#333] shrink-0">
                    <div className="flex items-center gap-2 text-white">
                        <Scissors className="w-5 h-5 text-accent" />
                        <span className="font-semibold text-sm">Sliced Results (9 Panels)</span>
                    </div>
                    <button onClick={() => setShowSlicesModal(false)} className="text-text-sub hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-[#000]">
                    <div className="grid grid-cols-3 gap-1 w-full max-w-[80vh] aspect-square">
                        {slicedImages.map((src, idx) => (
                            <div 
                                key={idx} 
                                className="relative group w-full h-full bg-black rounded overflow-hidden border border-[#333]"
                            >
                                <img src={src} alt={`Slice ${idx+1}`} className="w-full h-full object-cover" />
                                
                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadSlice(src, idx);
                                        }}
                                        className="p-3 bg-black/60 hover:bg-accent text-white hover:text-black rounded-full transition-colors backdrop-blur-sm"
                                        title="Download Slice"
                                    >
                                        <Download className="w-6 h-6" />
                                    </button>
                                </div>
                                <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1.5 rounded opacity-50 pointer-events-none">#{idx+1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-[#333] flex items-center gap-3 bg-[#18181a] shrink-0">
                     {!noCaptions && (
                         <button 
                            onClick={() => {
                                setNoCaptions(true);
                                setShowSlicesModal(false);
                                handleGenerate('1K', undefined, true);
                            }}
                            className="mr-auto px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-900/10 border border-transparent hover:border-red-900/30 transition-all flex items-center gap-2"
                         >
                             <Type className="w-3.5 h-3.5" />
                             <span className="hidden sm:inline">Remove Captions & Retry</span>
                             <span className="sm:hidden">Retry w/o Text</span>
                         </button>
                     )}
                     
                     <button 
                        onClick={() => setShowSlicesModal(false)}
                        className={`px-4 py-2 text-text-sub text-xs font-semibold hover:text-white ${noCaptions ? 'ml-auto' : ''}`}
                     >
                         Close
                     </button>
                     <button 
                        onClick={handleDownloadZip}
                        className="px-5 py-2 bg-accent text-black rounded-lg text-xs font-bold hover:bg-white transition-colors flex items-center gap-2"
                     >
                         <Archive className="w-4 h-4" />
                         Download All (ZIP)
                     </button>
                </div>
             </div>
          </div>
      )}

    </div>
  );
};

export default App;
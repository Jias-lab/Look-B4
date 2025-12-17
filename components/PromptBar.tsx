import React, { useState } from 'react';
import { Copy, FileJson, X, Check } from 'lucide-react';

interface PromptBarProps {
  prompt: string;
}

export const PromptBar: React.FC<PromptBarProps> = ({ prompt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  };

  if (!prompt) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[#1c1c1e] border border-[#333] hover:border-accent text-accent rounded-full flex items-center justify-center shadow-2xl z-40 transition-transform hover:scale-105"
        title="View JSON Prompt"
      >
        <FileJson className="w-5 h-5" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#1c1c1e] border border-[#333] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#333]">
              <div className="flex items-center gap-2 text-accent">
                <FileJson className="w-5 h-5" />
                <span className="font-semibold text-sm tracking-wide">GENERATED PROMPT (JSON)</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-text-sub hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-0 overflow-auto bg-[#0d0d0d] custom-scrollbar">
              <pre className="p-4 text-xs font-mono text-green-400 whitespace-pre-wrap leading-relaxed">
                {prompt}
              </pre>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#333] flex justify-end">
              <button 
                onClick={copyToClipboard}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                  justCopied 
                  ? 'bg-green-500 text-black' 
                  : 'bg-accent text-black hover:bg-white'
                }`}
              >
                {justCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {justCopied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
import React from 'react';
import { GridData } from '../types';
import { Edit3, Info } from 'lucide-react';

interface GridEditorProps {
  gridData: GridData;
  selectedSlot: number | null;
  onSlotSelect: (index: number) => void;
  onSlotUpdate: (text: string) => void;
}

export const GridEditor: React.FC<GridEditorProps> = ({
  gridData,
  selectedSlot,
  onSlotSelect,
  onSlotUpdate
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[#2c2c2e] p-2 rounded-lg border border-[#3a3a3c] flex gap-2 items-start">
        <Info className="w-3 h-3 text-accent mt-0.5 shrink-0" />
        <p className="text-[10px] text-text-sub leading-snug">
          Edit slots to customize the prompt for each grid panel.
        </p>
      </div>

      {/* Grid - Compact Layout */}
      <div className="max-w-[320px] mx-auto w-full">
        <div className="grid grid-cols-3 gap-1 aspect-square">
            {gridData.map((text, index) => (
            <div
                key={index}
                onClick={() => onSlotSelect(index)}
                className={`
                relative rounded-md p-1 flex items-center justify-center text-center text-[0.6rem] leading-tight cursor-pointer transition-all duration-200 border group overflow-hidden
                ${selectedSlot === index 
                    ? 'bg-[#3a3a3c] border-accent text-white ring-1 ring-accent transform scale-[1.02] z-10' 
                    : 'bg-[#2c2c2e] border-transparent text-text-sub hover:bg-[#333] hover:border-[#444]'
                }
                `}
            >
                <span className="line-clamp-4 w-full break-words pointer-events-none opacity-90">{text}</span>
                <div className="absolute top-0.5 left-1 text-[0.4rem] opacity-30 font-mono pointer-events-none">{index + 1}</div>
                
                {/* Edit Icon on Hover */}
                <div className={`absolute bottom-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${selectedSlot === index ? 'hidden' : ''}`}>
                    <Edit3 className="w-2.5 h-2.5 text-accent" />
                </div>
            </div>
            ))}
        </div>
      </div>

      {/* Editor Box */}
      {selectedSlot !== null && (
        <div className="bg-black border border-accent-dim rounded-lg p-3 mt-1 animate-slideUp shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-accent text-xs font-medium">
                <Edit3 className="w-3 h-3" />
                <span>Editing Slot #{selectedSlot + 1}</span>
            </div>
            <span className="text-[9px] text-text-sub uppercase tracking-wider">
                {['Top Left', 'Top Center', 'Top Right', 'Middle Left', 'Center', 'Middle Right', 'Bottom Left', 'Bottom Center', 'Bottom Right'][selectedSlot]}
            </span>
          </div>
          <input 
            type="text" 
            value={gridData[selectedSlot]}
            onChange={(e) => onSlotUpdate(e.target.value)}
            className="w-full bg-card text-white p-2 rounded-md outline-none focus:ring-1 focus:ring-accent text-xs border border-[#333]"
            placeholder="Style description..."
            autoFocus
          />
        </div>
      )}
    </div>
  );
};
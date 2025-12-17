import React, { useRef } from 'react';
import { Camera, Upload } from 'lucide-react';

interface PhotoUploadProps {
  imageSrc: string | null;
  onImageUpload: (src: string) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ imageSrc, onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onImageUpload(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="border border-dashed border-text-sub rounded-2xl p-8 text-center cursor-pointer transition-colors hover:border-accent relative overflow-hidden group"
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange}
      />
      
      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt="User uploaded" 
          className="w-full max-h-[300px] object-cover rounded-xl shadow-lg"
        />
      ) : (
        <div className="flex flex-col items-center gap-3 text-text-sub group-hover:text-accent transition-colors">
          <div className="bg-[#2c2c2e] p-4 rounded-full">
            <Camera className="w-8 h-8" />
          </div>
          <span className="text-sm font-medium">Tap to Upload or Take Selfie</span>
        </div>
      )}
      
      {imageSrc && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="flex flex-col items-center text-white">
             <Upload className="w-8 h-8 mb-2" />
             <span className="text-xs font-bold">CHANGE PHOTO</span>
           </div>
        </div>
      )}
    </div>
  );
};
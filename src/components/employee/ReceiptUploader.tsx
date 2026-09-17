import React, { useRef, useState } from "react";
import { Camera, UploadCloud, Sparkles, Image as ImageIcon, RefreshCw } from "lucide-react";

interface Props {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
}

export const ReceiptUploader: React.FC<Props> = ({ onFileSelected, isUploading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  // Helper to load sample mock receipts directly from demo assets
  const loadPresetReceipt = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: "image/jpeg" });
      onFileSelected(file);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="p-3 bg-white border-t border-slate-200">
      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-brand-orange bg-orange-50/50"
            : "border-slate-300 hover:border-brand-orange hover:bg-orange-50/20"
        } ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFileSelected(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-brand-orange border border-orange-200 flex items-center justify-center shadow-xs">
            {isUploading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-brand-orange" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-900">
              {isUploading ? "Reading receipt with OCR..." : "Tap to capture or upload receipt"}
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">JPEG, PNG, WebP up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Preset demo triggers for instant scenario testing */}
      <div className="mt-2.5">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 mb-1.5">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Quick Demo Presets (Test Scenarios):</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <button
            type="button"
            disabled={isUploading}
            onClick={() => loadPresetReceipt("/receipts/demo_indian_oil.jpg", "indian_oil_fuel.jpg")}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 font-medium text-left truncate border border-slate-300 transition-colors"
          >
            Fuel Bill (INR 3,850)
          </button>
          <button
            type="button"
            disabled={isUploading}
            onClick={() => loadPresetReceipt("/receipts/demo_indian_oil_dup.jpg", "receipt_fuel_ioc_4471.jpg")}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-800 rounded-lg text-slate-800 font-medium text-left truncate border border-slate-300 transition-colors"
          >
            Duplicate Test
          </button>
          <button
            type="button"
            disabled={isUploading}
            onClick={() => loadPresetReceipt("/receipts/demo_restaurant.jpg", "restaurant_dining.jpg")}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 rounded-lg text-slate-800 font-medium text-left truncate border border-slate-300 transition-colors"
          >
            Dining Mismatch
          </button>
          <button
            type="button"
            disabled={isUploading}
            onClick={() => loadPresetReceipt("/receipts/demo_clean_1850.jpg", "blur_unclear_smudge.jpg")}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-800 rounded-lg text-slate-800 font-medium text-left truncate border border-slate-300 transition-colors"
          >
            Low Clarity OCR
          </button>
        </div>
      </div>
    </div>
  );
};

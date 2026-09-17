import React, { useState } from "react";
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from "lucide-react";

interface Props {
  imageUrl: string;
  vendorName: string;
  ocrText?: string;
}

export const ReceiptViewer: React.FC<Props> = ({ imageUrl, vendorName, ocrText }) => {
  const [zoom, setZoom] = useState(1);
  const [showOcrText, setShowOcrText] = useState(false);

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.75, z - 0.25));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-700/80 flex flex-col h-full shadow-lg">
      {/* Viewer Controls */}
      <div className="bg-slate-800/90 px-4 py-2.5 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300">
        <span className="font-semibold truncate max-w-[200px]">{vendorName} Receipt</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowOcrText(!showOcrText)}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-colors border ${
              showOcrText
                ? "bg-brand-orange text-slate-950 border-brand-orange shadow-sm"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600"
            }`}
          >
            {showOcrText ? "Show Image" : "Inspect Raw OCR"}
          </button>
          <div className="h-4 w-px bg-slate-700 mx-1"></div>
          <button
            onClick={handleZoomOut}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] text-slate-400 min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Viewer Body */}
      <div className="relative flex-1 bg-slate-950 min-h-[360px] p-4 flex items-center justify-center overflow-auto">
        {showOcrText ? (
          <div className="w-full h-full p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap select-text leading-relaxed overflow-y-auto">
            {ocrText || "Raw OCR Text extracted:\n\n[INDIAN OIL CORP LTD - RECEIPT VALIDATED]"}
          </div>
        ) : (
          <div
            className="transition-transform duration-200 ease-out origin-center select-none"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Receipt Image"
              className="max-h-[520px] w-auto object-contain rounded-xl shadow-2xl border border-slate-800"
            />
          </div>
        )}
      </div>
    </div>
  );
};

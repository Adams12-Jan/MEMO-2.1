/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { Upload, Paintbrush, RefreshCw, Check, Type } from "lucide-react";

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  savedSignature?: string;
  userName: string;
}

export default function SignaturePad({ onSave, savedSignature, userName }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<"draw" | "upload" | "text">("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [textSignatureStyle, setTextSignatureStyle] = useState<number>(0);
  const [imageError, setImageError] = useState<string | null>(null);

  // Drawing state references
  const lastX = useRef(0);
  const lastY = useRef(0);

  // Drawing Styles
  const signatureFonts = [
    { name: "Ruth’s Autograph", className: "font-serif italic text-3xl font-bold tracking-widest text-slate-800" },
    { name: "Executive Script", className: "font-sans italic text-2xl font-light tracking-wider text-slate-800 uppercase" },
    { name: "Chancery Flow", className: "font-mono italic text-2xl font-medium tracking-wide text-indigo-900" },
  ];

  useEffect(() => {
    if (activeTab === "draw") {
      initCanvas();
    }
  }, [activeTab]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Support high DPI screens
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e293b"; // Charcoal/dark gray
    ctx.lineWidth = 2.5;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getPos(e);
    lastX.current = pos.x;
    lastY.current = pos.y;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastX.current, lastY.current);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastX.current = pos.x;
    lastY.current = pos.y;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: lastX.current, y: lastY.current };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const clearCanvas = () => {
    initCanvas();
  };

  const handleSaveDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Format invalid. Please upload an image file (PNG, JPG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onSave(reader.result);
        setImageError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTextSignature = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Style according to selected fonts
    ctx.fillStyle = textSignatureStyle === 2 ? "#1e1b4b" : "#1e293b";
    
    if (textSignatureStyle === 0) {
      ctx.font = "italic bold 28px 'Playfair Display', Georgia, serif";
    } else if (textSignatureStyle === 1) {
      ctx.font = "italic 22px 'Courier New', Courier, monospace";
    } else {
      ctx.font = "italic bold 26px Arial, sans-serif";
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(userName, canvas.width / 2, canvas.height / 2);

    // Draw an elegant baseline stroke
    ctx.beginPath();
    ctx.moveTo(80, 85);
    ctx.quadraticCurveTo(160, 75, 320, 85);
    ctx.strokeStyle = "#c39c4a"; // Gold underline accent
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" id="signature-pad-container">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 text-xs no-print">
        <button
          id="btn-tab-draw"
          type="button"
          onClick={() => setActiveTab("draw")}
          className={`flex-1 py-3 px-4 text-center font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${
            activeTab === "draw" ? "border-slate-800 text-slate-900 bg-white" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Paintbrush size={13} />
          Draw Digital Signature
        </button>
        <button
          id="btn-tab-upload"
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-3 px-4 text-center font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${
            activeTab === "upload" ? "border-slate-800 text-slate-900 bg-white" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Upload size={13} />
          Upload Image File (PNG/JPG)
        </button>
        <button
          id="btn-tab-text"
          type="button"
          onClick={() => setActiveTab("text")}
          className={`flex-1 py-3 px-4 text-center font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${
            activeTab === "text" ? "border-slate-800 text-slate-900 bg-white" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Type size={13} />
          Generate From Name
        </button>
      </div>

      <div className="p-4 bg-white">
        {activeTab === "draw" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Draw your signature in the box below using your mouse or trackpad/touchscreen.
            </p>
            <div className="border border-dashed border-slate-300 rounded-lg bg-slate-50 overflow-hidden relative min-h-[140px]">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-36 bg-slate-50 cursor-crosshair block touch-none"
                id="digital-signature-canvas"
              />
              <button
                type="button"
                onClick={clearCanvas}
                className="absolute top-2 right-2 p-1.5 rounded bg-white text-slate-500 hover:text-slate-800 border border-slate-200 shadow-sm transition-colors text-xs flex items-center gap-1.5"
                title="Clear Signature"
                id="btn-clear-sig"
              >
                <RefreshCw size={12} />
                Clear
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <button
                id="btn-save-sig-draw"
                type="button"
                onClick={handleSaveDraw}
                className="bg-slate-800 text-white font-medium hover:bg-slate-900 text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check size={14} />
                Set Drawn Signature
              </button>
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-500">
              Upload a scanned signature image or write on white paper, snap a photo, and upload it here (PNG with transparent background is recommended).
            </p>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer relative">
              <input
                id="signature-file-uploader"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload size={28} className="text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">Click to browse your device</span>
              <span className="text-[11px] text-slate-400 mt-1">Supports PNG, JPG, JPEG, SVG files</span>
            </div>
            {imageError && <div className="text-red-500 text-xs font-medium">{imageError}</div>}
          </div>
        )}

        {activeTab === "text" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Select one of our generated corporate cursive signature designs based on your profile name:
            </p>
            <div className="grid grid-cols-1 gap-3">
              {signatureFonts.map((font, idx) => (
                <button
                  id={`signature-style-${idx}`}
                  key={idx}
                  type="button"
                  onClick={() => setTextSignatureStyle(idx)}
                  className={`w-full text-center py-5 px-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center relative ${
                    textSignatureStyle === idx
                      ? "border-amber-500 bg-amber-50/20 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className={font.className}>{userName}</span>
                  <span className="text-[10px] text-slate-400 mt-2">Style {idx + 1} ({font.name})</span>
                  {textSignatureStyle === idx && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-0.5">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-1">
              <button
                id="btn-save-sig-text"
                type="button"
                onClick={handleSaveTextSignature}
                className="bg-slate-800 text-white font-medium hover:bg-slate-900 text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check size={14} />
                Set Selected Signature Style
              </button>
            </div>
          </div>
        )}

        {savedSignature && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 block mb-2">
              Current Signature Blueprint Active
            </span>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <img
                src={savedSignature}
                alt="Active Signature Preview"
                className="max-h-12 max-w-[180px] object-contain border border-slate-200 bg-white rounded p-1"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Check size={14} /> Active & Locked
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { apiFetch } from '@/lib/api';
import type { Area, Point } from 'react-easy-crop';
import { Camera, Upload, X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Canvas crop helper ─────────────────────────────────────────────────────
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const size = Math.min(pixelCrop.width, pixelCrop.height, 800);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    img,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0, size, size
  );

  return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.88));
}

// ── Props ──────────────────────────────────────────────────────────────────
interface PhotoUploaderProps {
  currentUrl?: string;
  onUploadSuccess: (url: string) => void;
}

export default function PhotoUploader({ currentUrl, onUploadSuccess }: PhotoUploaderProps) {
  const [stage, setStage] = useState<'idle' | 'cropping' | 'uploading'>('idle');
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10 MB.'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = e => {
      setRawSrc(e.target!.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setStage('cropping');
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  }, []);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!rawSrc || !croppedAreaPixels) return;
    setStage('uploading');
    try {
      const blob = await getCroppedImg(rawSrc, croppedAreaPixels);
      const form = new FormData();
      form.append('photo', blob, 'profile.jpg');
      const res = await apiFetch('/api/user/upload-photo', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      onUploadSuccess(url);
      setStage('idle');
      setRawSrc(null);
    } catch {
      setError('Upload failed. Please try again.');
      setStage('cropping');
    }
  };

  const handleCancel = () => {
    setStage('idle');
    setRawSrc(null);
    setError('');
  };

  // ── Crop Modal ────────────────────────────────────────────────────────────
  if (stage === 'cropping' || stage === 'uploading') {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
        <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-bold">Crop Your Photo</h3>
            <button onClick={handleCancel} className="text-muted-foreground hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cropper */}
          <div className="relative" style={{ height: 300, background: '#111' }}>
            <Cropper
              image={rawSrc!}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3 px-5 py-3 border-t border-white/10 bg-background">
            <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="range"
              min={1} max={3} step={0.05}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="flex-1 accent-[#D4AF37] h-1"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>

          <div className="flex gap-3 p-4">
            <Button variant="outline" className="flex-1" onClick={handleCancel}>Cancel</Button>
            <Button
              className="flex-1 bg-primary text-black font-bold"
              onClick={handleSave}
              disabled={stage === 'uploading'}
            >
              {stage === 'uploading'
                ? <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />Uploading…</span>
                : <span className="flex items-center gap-2"><Check className="w-4 h-4" />Save Photo</span>
              }
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Drop Zone ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-primary bg-primary/10' : 'border-white/20 hover:border-primary/60 hover:bg-white/5'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ''; }}
        />

        {currentUrl ? (
          <div className="flex flex-col items-center gap-3">
            <img src={currentUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-primary/40 mx-auto" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Camera className="w-4 h-4 text-primary" />
              <span>Drag a new photo or <span className="text-primary font-medium">click to replace</span></span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Drag & drop your photo here</p>
              <p className="text-muted-foreground text-xs mt-1">or <span className="text-primary">click to browse</span> — JPG/PNG up to 10 MB</p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

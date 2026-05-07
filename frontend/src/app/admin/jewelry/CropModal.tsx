'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';

import Button from '../../../components/Button';
import { adminEyebrow, adminLabelText, adminSectionTitle } from '../styles';

export type CropRect = { sx: number; sy: number; sw: number; sh: number };

type Props = {
  file: File;
  aspect?: number;
  initialRect?: CropRect;
  onConfirm: (file: File, rect: CropRect) => void;
  onCancel: () => void;
};

const MAX_LONG_SIDE = 360;
const OUTPUT_LONG = 1280;
const MAX_USER_SCALE = 4;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const baseFileName = (file: File) => file.name.replace(/\.[^.]+$/, '') || 'image';

const computeMimeAndExt = (fileType: string): { mime: string; ext: string; quality?: number } => {
  if (fileType === 'image/png') return { mime: 'image/png', ext: 'png' };
  if (fileType === 'image/webp') return { mime: 'image/webp', ext: 'webp', quality: 0.95 };
  return { mime: 'image/jpeg', ext: 'jpg', quality: 0.95 };
};

export default function CropModal({ file, aspect = 1, initialRect, onConfirm, onCancel }: Props) {
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [userScale, setUserScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [frameSize, setFrameSize] = useState<{ w: number; h: number }>(() => ({
    w: aspect >= 1 ? MAX_LONG_SIDE : MAX_LONG_SIDE * aspect,
    h: aspect >= 1 ? MAX_LONG_SIDE / aspect : MAX_LONG_SIDE,
  }));
  const imgRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const frameMaxStyle = useMemo(() => {
    const maxW = aspect >= 1 ? MAX_LONG_SIDE : MAX_LONG_SIDE * aspect;
    const maxH = aspect >= 1 ? MAX_LONG_SIDE / aspect : MAX_LONG_SIDE;
    return { maxWidth: maxW, maxHeight: maxH, aspectRatio: `${aspect}` };
  }, [aspect]);

  const { outputW, outputH } = useMemo(() => {
    const ow = aspect >= 1 ? OUTPUT_LONG : Math.round(OUTPUT_LONG * aspect);
    const oh = aspect >= 1 ? Math.round(OUTPUT_LONG / aspect) : OUTPUT_LONG;
    return { outputW: ow, outputH: oh };
  }, [aspect]);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setFrameSize({ w: rect.width, h: rect.height });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect]);

  const frameW = frameSize.w;
  const frameH = frameSize.h;
  const baseScale = imgSize ? Math.max(frameW / imgSize.w, frameH / imgSize.h) : 1;
  const effectiveScale = baseScale * userScale;
  const renderedW = imgSize ? imgSize.w * effectiveScale : 0;
  const renderedH = imgSize ? imgSize.h * effectiveScale : 0;

  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    setImgSize({ w, h });
    const base = Math.max(frameW / w, frameH / h);
    if (initialRect) {
      const effective = frameW / initialRect.sw;
      setUserScale(effective / base);
      setTx(-initialRect.sx * effective);
      setTy(-initialRect.sy * effective);
    } else {
      setTx((frameW - w * base) / 2);
      setTy((frameH - h * base) / 2);
      setUserScale(1);
    }
    setLoadError(null);
  };

  const onImgError = () => {
    setLoadError('Could not load image.');
  };

  useEffect(() => {
    if (!imgSize) return;
    const minTx = frameW - imgSize.w * baseScale * userScale;
    const minTy = frameH - imgSize.h * baseScale * userScale;
    setTx((prev) => clamp(prev, minTx, 0));
    setTy((prev) => clamp(prev, minTy, 0));
  }, [imgSize, baseScale, userScale, frameW, frameH]);

  const onZoomChange = (next: number) => {
    if (!imgSize) {
      setUserScale(next);
      return;
    }
    const oldEffective = baseScale * userScale;
    const newEffective = baseScale * next;
    const ratio = newEffective / oldEffective;
    const cx = frameW / 2;
    const cy = frameH / 2;
    const newTx = cx - (cx - tx) * ratio;
    const newTy = cy - (cy - ty) * ratio;
    const minTx = frameW - imgSize.w * newEffective;
    const minTy = frameH - imgSize.h * newEffective;
    setTx(clamp(newTx, minTx, 0));
    setTy(clamp(newTy, minTy, 0));
    setUserScale(next);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, y: e.clientY, tx, ty };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start || !imgSize) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const minTx = frameW - renderedW;
    const minTy = frameH - renderedH;
    setTx(clamp(start.tx + dx, minTx, 0));
    setTy(clamp(start.ty + dy, minTy, 0));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const reset = () => {
    if (!imgSize) return;
    setUserScale(1);
    const base = Math.max(frameW / imgSize.w, frameH / imgSize.h);
    setTx((frameW - imgSize.w * base) / 2);
    setTy((frameH - imgSize.h * base) / 2);
  };

  const onApply = async () => {
    const img = imgRef.current;
    if (!img || !imgSize) return;
    setBusy(true);
    try {
      const sx = -tx / effectiveScale;
      const sy = -ty / effectiveScale;
      const sw = frameW / effectiveScale;
      const sh = frameH / effectiveScale;
      const canvas = document.createElement('canvas');
      canvas.width = outputW;
      canvas.height = outputH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unsupported');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputW, outputH);
      const { mime, ext, quality } = computeMimeAndExt(file.type);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, mime, quality),
      );
      if (!blob) throw new Error('Could not export image');
      const cropped = new File([blob], `${baseFileName(file)}.${ext}`, {
        type: mime,
        lastModified: Date.now(),
      });
      onConfirm(cropped, { sx, sy, sw, sh });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Crop failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-brand-700/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-accent-300/40 rounded-2xl shadow-2xl shadow-black/30 max-w-[440px] w-full p-5 sm:p-7 flex flex-col gap-4 sm:gap-5 max-h-[calc(100dvh-1.5rem)] overflow-y-auto"
        >
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={adminEyebrow}>Adjust</p>
              <h3 className={`${adminSectionTitle} mt-1`}>Crop image</h3>
              <p className="text-xs text-brand-500/80 mt-2">Drag to reposition. Use the slider to zoom.</p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close"
              className="shrink-0 text-brand-500/70 hover:text-brand-700 transition-colors"
            >
              <X className="size-5" />
            </button>
          </header>

          <div
            ref={frameRef}
            className="relative mx-auto w-full bg-accent-100 overflow-hidden rounded-md select-none touch-none cursor-grab active:cursor-grabbing border border-accent-300/40"
            style={frameMaxStyle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {imgSrc && (
              <img
                ref={imgRef}
                src={imgSrc}
                onLoad={onImgLoad}
                onError={onImgError}
                draggable={false}
                alt=""
                style={{
                  position: 'absolute',
                  width: imgSize ? renderedW : undefined,
                  height: imgSize ? renderedH : undefined,
                  transform: `translate(${tx}px, ${ty}px)`,
                  willChange: 'transform',
                  pointerEvents: 'none',
                  maxWidth: 'none',
                }}
              />
            )}
          </div>

          {loadError && (
            <p role="alert" className="text-xs text-red-600">{loadError}</p>
          )}

          <label className="flex flex-col gap-1.5 text-sm">
            <span className={adminLabelText}>Zoom</span>
            <input
              type="range"
              min={1}
              max={MAX_USER_SCALE}
              step={0.01}
              value={userScale}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={reset}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-brand-700 hover:text-brand-500 transition-colors"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={onApply} disabled={busy || !imgSize || !!loadError} working={busy}>
                {busy ? 'Applying…' : 'Apply'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

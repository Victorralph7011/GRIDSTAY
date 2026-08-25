"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoGalleryProps {
  photoUrls: string[];
  propertyName: string;
}

/**
 * Choose a mosaic that tiles perfectly for the number of photos we
 * actually have. A fixed 1-big-plus-4-small grid leaves visible holes
 * whenever a listing has fewer than five images, so each count gets a
 * layout that fills completely; anything beyond the shown set stays
 * reachable through the lightbox.
 */
function layoutFor(count: number) {
  if (count >= 5) return { shown: 5, cols: "grid-cols-4" };
  if (count >= 3) return { shown: 3, cols: "grid-cols-3" };
  if (count === 2) return { shown: 2, cols: "grid-cols-2" };
  return { shown: 1, cols: "grid-cols-1" };
}

export default function PhotoGallery({
  photoUrls,
  propertyName,
}: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (photoUrls.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-gs-lightgrey flex items-center justify-center text-gs-midgrey text-sm">
        No photos yet
      </div>
    );
  }

  const { shown, cols } = layoutFor(photoUrls.length);
  const visible = photoUrls.slice(0, shown);
  const hiddenCount = photoUrls.length - shown;

  const close = () => setActiveIndex(null);
  const showPrev = () =>
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + photoUrls.length) % photoUrls.length
    );
  const showNext = () =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % photoUrls.length));

  return (
    <>
      <div className="relative">
        <div
          className={`grid ${cols} ${shown > 1 ? "grid-rows-2" : ""} gap-2 rounded-2xl overflow-hidden aspect-[16/9]`}
        >
          {visible.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative cursor-pointer group ${
                i === 0 && shown > 2 ? "col-span-2 row-span-2" : ""
              } ${shown === 2 ? "row-span-2" : ""}`}
            >
              <Image
                src={url}
                alt={`${propertyName} photo ${i + 1}`}
                fill
                sizes={i === 0 ? "50vw" : "25vw"}
                className="object-cover transition-opacity group-hover:opacity-90"
              />
            </button>
          ))}
        </div>

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setActiveIndex(0)}
            className="absolute bottom-4 right-4 px-4 py-2 rounded-full bg-gs-white/95 backdrop-blur-sm border border-gs-lightgrey text-[11px] font-bold uppercase tracking-[0.08em] text-gs-charcoal shadow-sm hover:bg-gs-white cursor-pointer"
          >
            Show all {photoUrls.length} photos
          </button>
        )}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-6 right-6 text-white cursor-pointer"
            aria-label="Close gallery"
          >
            <X size={28} />
          </button>

          <span className="absolute top-7 left-1/2 -translate-x-1/2 text-white/70 text-[13px] tabular-nums">
            {activeIndex + 1} / {photoUrls.length}
          </span>

          {photoUrls.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              className="absolute left-6 text-white cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          <div
            className="relative w-full max-w-4xl aspect-[4/3] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photoUrls[activeIndex]}
              alt={`${propertyName} photo ${activeIndex + 1}`}
              fill
              sizes="80vw"
              className="object-contain"
            />
          </div>

          {photoUrls.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              className="absolute right-6 text-white cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}
    </>
  );
}

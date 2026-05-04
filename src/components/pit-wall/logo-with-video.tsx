"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const VIDEO_ID = "KpgaO_nVPz8";

export function LogoWithVideo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        aria-label="Play hype video"
      >
        <Image
          src="/showroom-showdown-logo.png"
          alt="The May Showroom Showdown"
          width={1024}
          height={1024}
          priority
          className="h-[84px] w-auto cursor-pointer drop-shadow-[0_6px_24px_rgba(255,180,40,0.35)] transition-transform hover:scale-[1.03]"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative aspect-video w-[min(92vw,1100px)] overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
              title="Showroom Showdown"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      )}
    </>
  );
}

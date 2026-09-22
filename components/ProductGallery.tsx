"use client";
import Image from "next/image";
import { useState } from "react";

const images = [
  { src: "/product-blue.webp",   label: "Blue",   accent: "#3B9EFF" },
  { src: "/product-green.webp",  label: "Green",  accent: "#39FF14" },
  { src: "/product-pink.webp",   label: "Pink",   accent: "#FF1493" },
  { src: "/product-red.webp",    label: "Red",    accent: "#DC143C" },
  { src: "/product-yellow.webp", label: "Yellow", accent: "#FFE600" },
];

export default function ProductGallery() {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="bg-[#111111] border border-[#2a2a2a] flex items-center justify-center min-h-[480px] relative overflow-hidden">
        <div
          className="absolute inset-0 blur-3xl opacity-10 transition-colors duration-500"
          style={{ backgroundColor: images[active].accent }}
        />
        <Image
          key={images[active].src}
          src={images[active].src}
          alt={`Kineticube — ${images[active].label}`}
          width={400}
          height={400}
          className="relative object-contain drop-shadow-2xl transition-opacity duration-300"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => setActive(i)}
            className="relative bg-[#111111] border-2 transition-all duration-200 overflow-hidden aspect-square flex items-center justify-center"
            style={{ borderColor: active === i ? img.accent : "#2a2a2a" }}
            aria-label={`View ${img.label} variant`}
          >
            {active === i && (
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundColor: img.accent }}
              />
            )}
            <Image
              src={img.src}
              alt={img.label}
              width={100}
              height={100}
              className="relative object-contain p-1"
            />
          </button>
        ))}
      </div>

      {/* Color label */}
      <p className="text-center text-gray-500 font-[family-name:var(--font-display)] tracking-label text-xs">
        SHOWING:{" "}
        <span style={{ color: images[active].accent }} className="font-bold">
          {images[active].label.toUpperCase()}
        </span>
        {" "}— COLORS ARE RANDOMLY ASSORTED IN EACH BOX
      </p>
    </div>
  );
}

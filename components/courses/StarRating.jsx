"use client";

import { useState } from "react";

export default function StarRating({ value = 0, onChange, size = 24, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div style={{ display:"flex", gap:3 }}>
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{ background:"none", border:"none", cursor:readonly?"default":"pointer", padding:1, lineHeight:1 }}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={star <= display ? "#f59e0b" : "#E2E8F0"}
              stroke={star <= display ? "#f59e0b" : "#E2E8F0"}
              strokeWidth="1"
              style={{ transition:"fill 0.1s" }}
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

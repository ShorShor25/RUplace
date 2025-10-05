'use client';

import { useState } from 'react';

// ------------------------------------------ //

//TODO: pick some better colors
export const COLOURS = [
  "#151829","#252c45","#3c4b6b","#596e8f","#7293a6","#95bac2",
  "#0b2566","#12498c","#1c7199","#319fb0","#86d9d5","#0d323b",
  "#114d44","#127a3e","#5ab03f","#b5d96c","#590c25","#9c2219",
  "#bd622a","#e6ba39","#eddc6b","#300633","#61135a","#8f2b76",
  "#b04d8a","#d17997","#e0a2ad","#732816","#964a2c","#ba7947",
  "#d9b484","#fffece"
];
export var pickerSelectedColor = 0

// ------------------------------------------ //

interface ColorPickerProps {
  selectedColor?: number;
  onSelect?: (index: number) => void;
}

// ------------------------------------------ //

export default function ColorPicker({ selectedColor: initial, onSelect }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState<number | null>(initial ?? null);

  // --------------------- //

  const handleClick = (index: number) => {
    pickerSelectedColor = index;
    setSelectedColor(index);
    onSelect?.(index);
  }

  // --------------------- //

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#111',
      padding: '12px 16px',
      borderRadius: '16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      maxWidth: '90%',
      scrollbarWidth: 'thin',
      scrollbarColor: '#555 transparent',
    }}>
      {COLOURS.map((color, idx) => (
        <div
          key={idx}
          onClick={() => handleClick(idx)}
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: color,
            borderRadius: '50%',
            border: selectedColor === idx ? '3px solid white' : '2px solid #333',
            cursor: 'pointer',
            flex: '0 0 auto',
            transition: 'transform 0.2s, border 0.2s',
            boxShadow: selectedColor === idx ? '0 0 10px white' : 'none',
          }}
          title={`Index ${idx}`}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
      ))}
    </div>
  );
}

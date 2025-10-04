'use client';

import { useEffect, useRef } from 'react';
import maplibregl, { Map } from 'maplibre-gl';

// ------------------------------------------ //

const METERS_PER_CELL = 5;

// ------------------------------------------ //

interface GridProps {
  map: Map | null;
  color?: string;
  lineWidth?: number;
}

export default function Grid({
  map,
  color = 'rgba(0,0,0,0.3)',
  lineWidth = 1
}: GridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --------------------- //

  useEffect(() => {
    if(!map || !canvasRef.current) 
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if(!ctx) 
      return;

    function resizeCanvas() {
      canvas.width = map!.getContainer().clientWidth;
      canvas.height = map!.getContainer().clientHeight;
      drawGrid();
    }

    function drawGrid() {
      if(!ctx || !map) 
        return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      const bounds = map.getBounds();
      const nw = bounds.getNorthWest();
      const se = bounds.getSouthEast();

      const maxBounds = map.getMaxBounds()!;
      const maxNW = maxBounds.getNorthWest();
      const maxSE = maxBounds.getSouthEast();
      const centerLat = (maxNW.lat + maxSE.lat) / 2.0;

      const cellHeight = METERS_PER_CELL / 111320;
      const cellWidth = METERS_PER_CELL / (111320 * Math.cos(centerLat * Math.PI / 180));

      for(let lng = Math.floor(nw.lng / cellWidth) * cellWidth; lng <= se.lng; lng += cellWidth) {
        const start = map.project([lng, nw.lat]);
        const end = map.project([lng, se.lat]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }

      for(let lat = Math.floor(se.lat / cellHeight) * cellHeight; lat <= nw.lat; lat += cellHeight) {
        const start = map.project([nw.lng, lat]);
        const end = map.project([se.lng, lat]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    }

    // ----------------- CLICK HANDLER ----------------- //
    function onMapClick(e: maplibregl.MapMouseEvent) {
      if(!map || !map.getMaxBounds()) 
        return;

      const maxBounds = map.getMaxBounds()!;
      const maxNW = maxBounds.getNorthWest();
      const maxSE = maxBounds.getSouthEast();
      const centerLat = (maxNW.lat + maxSE.lat) / 2.0;

      const cellHeight = METERS_PER_CELL / 111320;
      const cellWidth = METERS_PER_CELL / (111320 * Math.cos(centerLat * Math.PI / 180));

      const lngOffset = e.lngLat.lng - maxNW.lng;
      const latOffset = maxNW.lat - e.lngLat.lat;

      const col = Math.floor(lngOffset / cellWidth);
      const row = Math.floor(latOffset / cellHeight);

      console.log('Clicked grid cell:', { row, col });
    }

    map.on('click', onMapClick);
    map.on('move', drawGrid);
    map.on('zoom', drawGrid);
    map.on('resize', resizeCanvas);

    resizeCanvas();

    return () => {
      map.off('click', onMapClick);
      map.off('move', drawGrid);
      map.off('zoom', drawGrid);
      map.off('resize', resizeCanvas);
    };
  }, [map, color, lineWidth]);

  // --------------------- //

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        zIndex: 1000
      }}
    />
  );
}

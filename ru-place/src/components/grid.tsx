'use client';

import { useEffect, useRef } from 'react';
import { Map } from 'maplibre-gl';

// ------------------------------------------ //

const METERS_PER_CELL = 5;
const TILE_SIZE = 2048;

// ------------------------------------------ //

interface Tile {
  id: string;
  image: HTMLCanvasElement;
  tileX: number;
  tileY: number;
}

interface GridProps {
  map: Map | null;
  opacity: number
}

// ------------------------------------------ //

export default function GridTiles({ map, opacity }: GridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tilesRef = useRef<Tile[]>([]);

  // --------------------- //

  const setTile = (
    tileX: number,
    tileY: number,
    image: HTMLCanvasElement,
  ) => {
    const id = `${tileX}-${tileY}`
    const existingIndex = tilesRef.current.findIndex((t) => t.id === id);

    if(existingIndex >= 0)
      tilesRef.current[existingIndex] = { id, tileX, tileY, image };
    else
      tilesRef.current.push({ id, tileX, tileY, image });

    drawTiles();
  };

  // TEMPORARY!!!! JUST FOR TESTING
  function makeCheckerboard(
    size: number,
    colorA = '#fff',
    colorB = '#000'
  ): HTMLCanvasElement {
    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const ctx = off.getContext('2d')!;
    const cellSize = 1;
    for (let y = 0; y < size; y += cellSize) {
      for (let x = 0; x < size; x += cellSize) {
        ctx.fillStyle = (x + y) % 2 === 0 ? colorA : colorB;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
    return off;
  }

  //TEMPORARY!!!! JUST FOR TESTING
  useEffect(() => {
    setTile(0, 0, makeCheckerboard(TILE_SIZE, "#f00"));
    setTile(0, 1, makeCheckerboard(TILE_SIZE, "#0f0"));
    setTile(1, 1, makeCheckerboard(TILE_SIZE, "#00f"));
    console.log('ADDED TILE');
  }, [])

  // --------------------- //

  const drawTiles = () => {
    if(!map || !canvasRef.current) 
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    const maxBounds = map.getMaxBounds()!;
    const maxNW = maxBounds.getNorthWest();
    const maxSE = maxBounds.getSouthEast();
    const centerLat = (maxNW.lat + maxSE.lat) / 2.0;

    const cellHeightDeg = METERS_PER_CELL / 111320;
    const cellWidthDeg = METERS_PER_CELL / (111320 * Math.cos((centerLat * Math.PI) / 180));

    for(const tile of tilesRef.current) {
      const imgNW = {
        lng: maxNW.lng + tile.tileX * TILE_SIZE * cellWidthDeg,
        lat: maxNW.lat - tile.tileY * TILE_SIZE * cellHeightDeg,
      };
      const imgSE = {
        lng: imgNW.lng + TILE_SIZE * cellWidthDeg,
        lat: imgNW.lat - TILE_SIZE * cellHeightDeg,
      };

      const pNW = map.project([imgNW.lng, imgNW.lat]);
      const pSE = map.project([imgSE.lng, imgSE.lat]);
      const width = pSE.x - pNW.x;
      const height = pSE.y - pNW.y;

      ctx.globalAlpha = opacity;
      ctx.drawImage(tile.image, pNW.x, pNW.y, width, height);
    }
  };

  const onMapClick = (e: maplibregl.MapMouseEvent) => {
    if(!map || !map.getMaxBounds()) 
      return;

    const maxBounds = map.getMaxBounds()!;
    const maxNW = maxBounds.getNorthWest();
    const centerLat = (maxNW.lat + maxBounds.getSouthEast().lat) / 2.0;

    const cellHeightDeg = METERS_PER_CELL / 111320;
    const cellWidthDeg = METERS_PER_CELL / (111320 * Math.cos((centerLat * Math.PI) / 180));

    const lng = e.lngLat.lng;
    const lat = e.lngLat.lat;

    for(const tile of tilesRef.current) {
      const imgNW = {
        lng: maxNW.lng + tile.tileX * TILE_SIZE * cellWidthDeg,
        lat: maxNW.lat - tile.tileY * TILE_SIZE * cellHeightDeg,
      };
      const imgSE = {
        lng: imgNW.lng + TILE_SIZE * cellWidthDeg,
        lat: imgNW.lat - TILE_SIZE * cellHeightDeg,
      };

      if(lng >= imgNW.lng && lng < imgSE.lng && lat <= imgNW.lat && lat > imgSE.lat) {
        const col = Math.floor((lng - imgNW.lng) / cellWidthDeg);
        const row = Math.floor((imgNW.lat - lat) / cellHeightDeg);
        console.log(`Clicked cell in ${tile.id}:`, { row, col });
      }
    }
  };

  // --------------------- //

  useEffect(() => {
    if(!map || !canvasRef.current) 
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const resizeCanvas = () => {
      canvas.width = map!.getContainer().clientWidth;
      canvas.height = map!.getContainer().clientHeight;
      drawTiles();
    };

    map.on('click', onMapClick);
    map.on('move', drawTiles);
    map.on('zoom', drawTiles);
    map.on('resize', resizeCanvas);

    resizeCanvas();

    return () => {
      map.off('click', onMapClick);
      map.off('move', drawTiles);
      map.off('zoom', drawTiles);
      map.off('resize', resizeCanvas);
    };
  }, [map, opacity]);

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
        zIndex: 1000,
      }}
    />
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Map } from 'maplibre-gl';
import { sendTileUpdate } from '../../api/wsocket';
import { Tile } from '../../shared/tile';
import { getLocation } from '../../api/location';

// ------------------------------------------ //

const METERS_PER_CELL = 5;

const TEMPORARY_COLOR = 15;

export const TILE_SIZE = 10000;
export const SQUARE_SIZE = 5

// ------------------------------------------ //

interface GridTile {
  id: string;
  image: HTMLCanvasElement; // now an Image instead of HTMLCanvasElement
  tileX: number;
  tileY: number;
  texture?: WebGLTexture;
}

interface GridProps {
  map: Map | null;
  opacity: number;
  tileCanvas: HTMLCanvasElement | null
  tileCanvasContext: CanvasRenderingContext2D | null
}

// ------------------------------------------ //

export default function GridTiles({ map, opacity, tileCanvas, tileCanvasContext }: GridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const tilesRef = useRef<GridTile[]>([]);
  const programRef = useRef<WebGLProgram | null>(null);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);

  // --------------------- //
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
      gl_Position = vec4(a_position, 0, 1);
      v_texCoord = a_texCoord;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D u_image;
    uniform float u_opacity;
    varying vec2 v_texCoord;
    void main() {
      gl_FragColor = texture2D(u_image, v_texCoord) * u_opacity;
    }
  `;

  // --------------------- //

  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('Shader compile failed');
    }
    return shader;
  };

  const createProgram = (gl: WebGLRenderingContext, vsSource: string, fsSource: string) => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      throw new Error('Program link failed');
    }
    return program;
  };

  // --------------------- //

  const setTile = (tileX: number, tileY: number, image: HTMLCanvasElement) => {
    const id = `${tileX}-${tileY}`;
    const existingIndex = tilesRef.current.findIndex((t) => t.id === id);
    if (existingIndex >= 0) {
      tilesRef.current[existingIndex] = { id, tileX, tileY, image, texture: tilesRef.current[existingIndex].texture };
    } else {
      tilesRef.current.push({ id, tileX, tileY, image });
    }
    drawTiles();
  };

  //TEMPORARY!!!!
  useEffect(() => {
    console.log("tilecanvas happy and equal ", tileCanvas)
    if (tileCanvas != null) {
      setTile(0, 0, tileCanvas)
    }
  }, [tileCanvasContext]);


  // --------------------- //

  const createTexture = (gl: WebGLRenderingContext, image: HTMLImageElement) => {
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
  };

  // --------------------- //

  const drawTiles = () => {
    if (!map || !canvasRef.current || !glRef.current || !programRef.current) return;
    const gl = glRef.current;
    const canvas = canvasRef.current;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programRef.current);

    const a_position = gl.getAttribLocation(programRef.current, 'a_position');
    const a_texCoord = gl.getAttribLocation(programRef.current, 'a_texCoord');
    const u_image = gl.getUniformLocation(programRef.current, 'u_image')!;
    const u_opacity = gl.getUniformLocation(programRef.current, 'u_opacity')!;

    gl.uniform1f(u_opacity, opacity);

    // max bounds
    const maxBounds = map.getMaxBounds();
    if (!maxBounds) return;
    const maxNW = maxBounds.getNorthWest();
    const maxSE = maxBounds.getSouthEast();
    const centerLat = (maxNW.lat + maxSE.lat) / 2.0;

    const cellHeightDeg = METERS_PER_CELL / 111320;
    const cellWidthDeg = METERS_PER_CELL / (111320 * Math.cos((centerLat * Math.PI) / 180));

    for (const tile of tilesRef.current) {
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

      // convert to clip space
      const x1 = (pNW.x / canvas.width) * 2 - 1;
      const y1 = -((pNW.y / canvas.height) * 2 - 1);
      const x2 = (pSE.x / canvas.width) * 2 - 1;
      const y2 = -((pSE.y / canvas.height) * 2 - 1);

      const positions = new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
      ]);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferRef.current);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(a_position);
      gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

      const texCoords = new Float32Array([
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,
      ]);
      const texCoordBuffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(a_texCoord);
      gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, 0, 0);

      // create texture if not exists
      if (!tile.texture) tile.texture = createTexture(gl, tile.image);
      gl.bindTexture(gl.TEXTURE_2D, tile.texture);

      gl.uniform1i(u_image, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.deleteBuffer(texCoordBuffer);
    }
  };

  // --------------------- //

  const onMapClick = async (e: maplibregl.MapMouseEvent) => {
    if (!map || !map.getMaxBounds()) return;

    const maxBounds = map.getMaxBounds()!;
    const maxNW = maxBounds.getNorthWest();
    const centerLat = (maxNW.lat + maxBounds.getSouthEast().lat) / 2.0;

    const cellHeightDeg = METERS_PER_CELL / 111320;
    const cellWidthDeg = METERS_PER_CELL / (111320 * Math.cos((centerLat * Math.PI) / 180));

    const lng = e.lngLat.lng;
    const lat = e.lngLat.lat;

    for (const tile of tilesRef.current) {
      const imgNW = {
        lng: maxNW.lng + tile.tileX * TILE_SIZE * cellWidthDeg,
        lat: maxNW.lat - tile.tileY * TILE_SIZE * cellHeightDeg,
      };
      const imgSE = {
        lng: imgNW.lng + TILE_SIZE * cellWidthDeg,
        lat: imgNW.lat - TILE_SIZE * cellHeightDeg,
      };

      if (lng >= imgNW.lng && lng < imgSE.lng && lat <= imgNW.lat && lat > imgSE.lat) {
        const col = Math.floor((lng - imgNW.lng) / cellWidthDeg);
        const row = Math.floor((imgNW.lat - lat) / cellHeightDeg);
        let loc: [number, number] | null = await getLocation();
        if (!loc) {
          console.log("no location");
        }
        const tile: Tile = { "x": row, "y": col, "color": TEMPORARY_COLOR, "lat": loc![0], "long": loc![1] }
        sendTileUpdate(tile);
      }
    }
  };

  // --------------------- //

  useEffect(() => {
    if (!map || !canvasRef.current) return;
    const canvas = canvasRef.current;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    glRef.current = gl;
    programRef.current = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    positionBufferRef.current = gl.createBuffer();

    const resizeCanvas = () => {
      canvas.width = map.getContainer().clientWidth;
      canvas.height = map.getContainer().clientHeight;
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
      }}
    />
  );
}

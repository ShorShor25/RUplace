'use client';

import Map from '@/components/map';
import { initSocket, sendTileUpdate } from '../../websocket/wsocket';
import { Tile } from '../../shared/tile'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    initSocket();
    const tile: Tile = { "x": 2, "y": 2, "color": 3, "lat": 69.69, "long": 47.74 };
    sendTileUpdate(tile);
    sendTileUpdate(tile);
    sendTileUpdate(tile);
    sendTileUpdate(tile);
  }, []);

  return (
    <main style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <Map/>
    </main>
  );
}

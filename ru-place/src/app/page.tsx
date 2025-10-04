'use client';

import Map from '@/components/map';
import RUplaceLanding from '@/components/landing-page';
import { socket, initSocket, sendTileUpdate } from '../../websocket/wsocket';
import { Tile } from '../../shared/tile'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    const run = async () => {
      const tile: Tile = { "x": 1, "y": 2, "color": 6, "lat": 69.69, "long": 47.74 };
      sendTileUpdate(tile);
    }
    run();
  }, []);

  return (
    <main style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* <RUplaceLanding /> */}
      <Map/>
    </main>
  );
}

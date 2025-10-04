'use client';

import { useRef, useState } from 'react';
import Map, { MapHandle } from '@/components/map';
import Grid from '@/components/grid';
import { connect } from '../../websocket/wsocket';

export default function Home() {
  const mapRef = useRef<MapHandle>(null);
  const [mapReady, setMapReady] = useState<MapHandle | null>(null);

  connect();

  return (
    <main style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <Map ref={mapRef} onMapLoad={setMapReady} />
      {mapReady && (
        <Grid mapHandle={mapReady} cellSize={50} color="rgba(0,0,0,0.3)" />
      )}
    </main>
  );
}
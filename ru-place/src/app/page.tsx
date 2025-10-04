'use client'

import Map from '@/components/map'
import { connect } from '../../websocket/wsocket'

export default function Home() {
  connect();
  return (
    <main style={{ height: '100vh', width: '100%' }}>
      <Map />
    </main>
  );
}

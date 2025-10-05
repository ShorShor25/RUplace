"use client"
import { initialTileLoad, initSocket, sendTileUpdate, socket } from '../../../api/wsocket';
import { Tile } from '../../../shared/tile'
import { getLocation } from '../../../api/location'
import { SQUARE_SIZE, TILE_SIZE } from '@/components/grid';
import { COLOURS } from '@/components/picker';
import { useEffect, useState } from 'react';
import Map from '@/components/map';
import LogoutButton from '@/components/logout-button';

export default function Draw() {
  const [tileCanvas, setTileCanvas] = useState<HTMLCanvasElement | null>(null);
  const [tileCanvasUpdate, setTileCanvasUpdate] = useState<boolean>(false);
  const [mustInitialize, setMustInitialize] = useState(false);

  useEffect(() => {
    if (tileCanvas == null) {
      var img = document.createElement("canvas")

      img.width = TILE_SIZE
      img.height = TILE_SIZE

      setTileCanvas(img)
      setMustInitialize(true)
    }


  }, []);

  useEffect(() => {
    if (mustInitialize) {
      const run = async () => {
        const colours = ["red", "green", "blue"]
        var num = 0
        if (tileCanvas != null) {
          const tile: Tile = { "x": 0, "y": 0, "color": 6, "lat": 69.69, "long": 47.74 };
          initSocket();

          socket!.addEventListener("message", (event) => {
            const data = JSON.parse(event.data)['payload']
            console.log(data)

            const square = tileCanvas.getContext('2d')
            data.newTiles.forEach((tile: any) => {
              console.log("drawing tile ", tile)

              square!.fillStyle = COLOURS[tile.color]
              square!.fillRect(Math.floor(tile.y / SQUARE_SIZE) * SQUARE_SIZE, Math.floor(tile.x / SQUARE_SIZE) * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
            })
            setTileCanvas(tileCanvas)
            setTileCanvasUpdate(true)
          })

          setTimeout(async () => {
              await initialTileLoad();
          }, 1000)
        }

        setMustInitialize(false)
      }
      run();
    }
  }, [mustInitialize])

  return (
    <main style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <LogoutButton />
      <Map tileCanvas={tileCanvas} tileCanvasUpdate={tileCanvasUpdate} setTileCanvasUpdate={setTileCanvasUpdate} />
    </main>
  );

}

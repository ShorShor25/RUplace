'use client';


import maplibregl, { LngLatBoundsLike, LngLatLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import Grid from './grid';
import ColorPicker from './picker';

// ------------------------------------------ //

export const STARTING_POSITION: LngLatLike = [-74.446, 40.4987];
export const STARTING_ZOOM = 17;

export const BOUNDS: LngLatBoundsLike = [
  [-74.603555, 40.419001],
  [-74.229596, 40.578769]
];

export const CATEGORY_ICONS: Record<string, string> = {
  academic: 'book',
  housing: 'house',
  studentLife: 'people',
  healthCare: 'health',
  default: 'marker'
};


interface MapProps {
  tileCanvas: HTMLCanvasElement,
  tileCanvasContext: CanvasRenderingContext2D
}

// ------------------------------------------ //

export default function Map({ tileCanvas, tileCanvasContext }: MapProps) {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [buildingData, setBuildingData] = useState<any>(null);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [selectedColor, setSelectedColor] = useState<number>(0);

  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  // --------------------- //

  /**
   * loads the campus building data, runs once
   */
  useEffect(() => {
    fetch('/ru-buildings.json')
      .then(res => res.json())
      .then(data => setBuildingData(data))
      .catch(err => console.error('Failed to load building data:', err));
  }, []);

  /**
   * initializes the maplibregl map, runs once
   */
  useEffect(() => {
    if (mapRef.current || !mapContainer.current)
      return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=xRogtnvC9fkRPguF3D6S',
      center: STARTING_POSITION,
      zoom: STARTING_ZOOM,
      maxBounds: BOUNDS,
      pitch: 0,
      bearing: 0
    });

    map.dragRotate.disable();
    map.touchZoomRotate?.disableRotation();
    map.doubleClickZoom.disable();

    map.on('style.load', () => {
      map.getStyle().layers?.forEach(layer => {
        if (layer.type === 'fill-extrusion') { //remove 3D layers
          map.setPaintProperty(layer.id, 'fill-extrusion-height', 0);
          map.setPaintProperty(layer.id, 'fill-extrusion-base', 0);
        }
        if (layer.type === 'symbol' && layer.layout?.['text-field']) { //remove building names
          const id = layer.id.toLowerCase();
          if (!id.includes('highway') && !id.includes('road'))
            map.removeLayer(layer.id);
        }
      });

      mapRef.current = map;
      setMap(map);
    });

    return () => map.remove();
  }, []);

  /**
   * adds the rutgers geojson data to the map, runs on map load and building data load
   */
  useEffect(() => {
    if (!map || !buildingData)
      return;

    //filter out parking
    buildingData.features = buildingData.features.filter(
      (feature: any) => feature.properties.category.toLowerCase() !== 'parking'
    );

    //add layers to map
    if (map.getSource('ru-buildings'))
      (map.getSource('ru-buildings') as maplibregl.GeoJSONSource).setData(buildingData);
    else {
      map.addSource('ru-buildings', {
        type: 'geojson',
        data: buildingData
      });

      map.addLayer({
        id: 'ru-buildings-fill',
        type: 'fill',
        source: 'ru-buildings',
        paint: { 'fill-color': '#4b4b4bff', 'fill-opacity': 0.5 }
      });

      map.addLayer({
        id: 'ru-buildings-outline',
        type: 'line',
        source: 'ru-buildings',
        paint: { 'line-color': '#414141ff', 'line-width': 2 }
      });

      const loadIcons = async () => {
        for (const [_, name] of Object.entries(CATEGORY_ICONS)) {
          const imgUrl = `/icons/${name}.svg`;
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = imgUrl;
          });
          if (!map.hasImage(name))
            map.addImage(name, img);
        }
      };

      loadIcons().then(() => {
        map.addLayer({
          id: 'ru-buildings-icons',
          type: 'symbol',
          source: 'ru-buildings',
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans', 'Arial Unicode MS'],
            'text-offset': [1, 0],
            'text-anchor': 'left',
            'icon-image': [
              'match',
              ['at', 0, ['get', 'categories']],
              ['academic'], 'book',
              ['housing'], 'house',
              ['healthCare'], 'health',
              ['studentLife'], 'people',
              /* default */ 'marker'
            ],
            'icon-size': 0.05, // adjust to fit
            'icon-allow-overlap': true,
            'text-allow-overlap': false,
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              16, 12,  // zoom 16 → 12px
              20, 18   // zoom 20 → 18px
            ]
          },
          paint: {
            'text-color': '#000',
            'text-halo-color': '#fff',
            'text-halo-width': 0.5
          }
        });
      })
    }
  }, [buildingData, map]);

  useEffect(() => {
    if (!map) return;

    let marker: maplibregl.Marker | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLngLat = [longitude, latitude] as LngLatLike;

          if (!marker) {
            marker = new maplibregl.Marker({ color: '#ff0000' })
              .setLngLat(newLngLat)
              .addTo(map);
          } else {
            marker.setLngLat(newLngLat);
          }

          map.flyTo({
            center: newLngLat,
            speed: 0.8,
            curve: 1.5,
            essential: true,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    };

    updateLocation();
    intervalId = setInterval(updateLocation, 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (marker) marker.remove();
    };
  }, [map]);


  // --------------------- //

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      <Grid map={map} opacity={0.5} tileCanvas={tileCanvas} tileCanvasContext={tileCanvasContext} />
      <ColorPicker selectedColor={selectedColor} onSelect={setSelectedColor} />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

import maplibregl, { LngLatBoundsLike, LngLatLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// ------------------------------------------ //

const STARTING_POSITION: LngLatLike = [ -74.446, 40.4987 ];
const STARTING_ZOOM = 17;

const BOUNDS: LngLatBoundsLike = [
  [ -74.603555, 40.419001],
  [ -74.229596, 40.578769]
];

const CATEGORY_ICONS: Record<string, string> = {
  academic: 'book',
  housing: 'house',
  studentLife: 'people',
  healthCare: 'health',
  default: 'marker'
};

// ------------------------------------------ //

export default function Map() {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [buildingData, setBuildingData] = useState<any>(null);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // --------------------- //

  function getCenter(): { x: number; y: number } | null {
    if(!mapRef.current) 
      return null;

    const center = mapRef.current.getCenter();
    return { x: center.lng, y: center.lat };
  }

  function getZoom(): number | null {
    if(!mapRef.current) 
      return null;

    return mapRef.current.getZoom();
  }

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
    if(mapRef.current || !mapContainer.current) 
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
    map.on('style.load', () => {
      map.getStyle().layers?.forEach(layer => {
        if(layer.type === 'fill-extrusion') //remove 3D layers
        {
          map.setPaintProperty(layer.id, 'fill-extrusion-height', 0);
          map.setPaintProperty(layer.id, 'fill-extrusion-base', 0);
        }
        if(layer.type === 'symbol' && layer.layout?.['text-field']) //remove building names
        {
          const id = layer.id.toLowerCase();
          if(!id.includes('highway') && !id.includes('road'))
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
    if(!map || !buildingData)
      return;

    //filter out parking
    buildingData.features = buildingData.features.filter(
      (feature: any) => feature.properties.category.toLowerCase() !== 'parking'
    );

    //add layers to map
    if(map.getSource('ru-buildings')) 
      (map.getSource('ru-buildings') as maplibregl.GeoJSONSource).setData(buildingData);
    else 
    {
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
          if(!map.hasImage(name)) 
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

  // --------------------- //

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '100vh' }}
    />
  );
}

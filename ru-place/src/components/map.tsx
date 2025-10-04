'use client';

import { useEffect, useRef, useState } from 'react';

import maplibregl, { LngLatBoundsLike, LngLatLike } from 'maplibre-gl';
import { LatLngBoundsLiteral, LatLngLiteral, LatLngTuple } from 'leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import build from 'next/dist/build';

// ------------------------------------------ //

const STARTING_POSITION: LngLatLike = [ -74.446, 40.4987 ];
const STARTING_ZOOM = 17;

const BOUNDS: LngLatBoundsLike = [
  [ -74.603555, 40.419001],
  [ -74.229596, 40.578769]
];

// ------------------------------------------ //

export default function Map() {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [buildingData, setBuildingData] = useState<any>(null);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

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
          map.removeLayer(layer.id);
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
        paint: { 'fill-color': '#f28cb1', 'fill-opacity': 0.5 }
      });

      map.addLayer({
        id: 'ru-buildings-outline',
        type: 'line',
        source: 'ru-buildings',
        paint: { 'line-color': '#f1005d', 'line-width': 2 }
      });

      map.addLayer({
        id: 'ru-buildings-labels',
        type: 'symbol',
        source: 'ru-buildings',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 14,
          'text-anchor': 'center',
          'text-allow-overlap': false
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1
        }
      });
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

'use client';

import { useEffect, useRef, useState } from 'react';

import maplibregl from 'maplibre-gl';
import { LatLngLiteral } from 'leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';

// ------------------------------------------ //

const STARTING_POSITION: LatLngLiteral = {lat: 40.4987, lng: -74.446};
const STARTING_ZOOM = 17;

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
      pitch: 0,
      bearing: 0
    });

    map.dragRotate.disable();
    map.touchZoomRotate?.disableRotation();
    map.on('style.load', () => {
      map.getStyle().layers?.forEach(layer => {
        if(layer.type === 'fill-extrusion') //remove 3D layers
          map.removeLayer(layer.id);
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

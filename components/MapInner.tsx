"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { LatLngTuple, Marker as LeafletMarker, Icon as LeafletIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
(L.Marker.prototype as unknown as LeafletMarker).options.icon =
  DefaultIcon as unknown as LeafletIcon;

type Props = {
  center: { lat: number; lng: number };
  marker?: { lat: number; lng: number };
  onPick?: (lat: number, lng: number) => void;
};

export default function MapInner({ center, marker, onPick }: Props) {
  function Picker() {
    useMapEvents({ click(e) { onPick?.(e.latlng.lat, e.latlng.lng); } });
    return null;
  }
  const centerTuple: LatLngTuple = [center.lat, center.lng];
  useEffect(() => {}, []);
  return (
    <MapContainer center={centerTuple} zoom={13} style={{ height: 360, width: "100%", borderRadius: "1rem" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {marker && <Marker position={[marker.lat, marker.lng] as LatLngTuple} />}
      <Picker />
    </MapContainer>
  );
}

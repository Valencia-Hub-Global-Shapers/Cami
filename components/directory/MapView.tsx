"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Programme, STATUS_LABELS } from "@/lib/types";

// Factual map: one pin per programme at its university, showing name,
// status and a link. No routes, arrows or narrative layers.

const EUROPE: L.LatLngBoundsExpression = [
  [35, -11],
  [60, 25]
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function popupHtml(p: Programme): string {
  return `
    <div class="cami-popup">
      <p class="cami-popup__uni">${escapeHtml(p.university)}</p>
      <p class="cami-popup__name">${escapeHtml(p.programme_name)}</p>
      <p class="cami-popup__meta">
        <span class="cami-pin cami-pin--${p.status}" aria-hidden="true"></span>
        ${escapeHtml(STATUS_LABELS[p.status])}
        ${p.estimated_deadline ? ` · Deadline: ${escapeHtml(p.estimated_deadline)}` : ""}
      </p>
      <a class="cami-popup__link" href="/directory/${encodeURIComponent(p.id)}">View details</a>
    </div>`;
}

export default function MapView({
  programmes,
  selectedId,
  onSelect,
  height = "h-[60vh] min-h-[360px]"
}: {
  programmes: Programme[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  height?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      zoomSnap: 0.5
    }).fitBounds(EUROPE);
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 18
      }
    ).addTo(map);
    // Wheel zoom only after the map is clicked, so page scrolling is not
    // hijacked when the pointer passes over the map.
    map.on("click", () => map.scrollWheelZoom.enable());
    map.on("mouseout", () => map.scrollWheelZoom.disable());
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    markersRef.current.clear();

    const located = programmes.filter(
      (p) => p.latitude != null && p.longitude != null
    );
    for (const p of located) {
      const marker = L.marker([p.latitude!, p.longitude!], {
        icon: L.divIcon({
          className: "",
          html: `<span class="cami-pin cami-pin--lg cami-pin--${p.status}"></span>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -10]
        }),
        title: `${p.university}: ${p.programme_name}`,
        alt: `${p.university}: ${p.programme_name}`,
        riseOnHover: true
      })
        .bindPopup(popupHtml(p), { maxWidth: 260 })
        .on("click", () => onSelectRef.current?.(p.id));
      marker.addTo(layer);
      markersRef.current.set(p.id, marker);
    }

    if (located.length === 1) {
      map.setView([located[0].latitude!, located[0].longitude!], 11);
    } else if (located.length > 1) {
      map.fitBounds(
        L.latLngBounds(located.map((p) => [p.latitude!, p.longitude!])),
        { padding: [48, 48], maxZoom: 9 }
      );
    }
  }, [programmes]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = selectedId ? markersRef.current.get(selectedId) : null;
    if (!map || !marker) return;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 10), {
      duration: 0.6
    });
    marker.openPopup();
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      className={`z-0 w-full overflow-hidden rounded-card border border-border bg-sand ${height}`}
      role="region"
      aria-label="Map of programme locations"
    />
  );
}

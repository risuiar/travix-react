import React, { useMemo, useRef, useState, useEffect } from "react";
import { GOOGLE_MAPS_API_KEY } from "../utils/env";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindowF,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useTheme } from "../hooks/useTheme";
import { MapInfoCard } from "./MapInfoCard";

// Estilos para el tema oscuro de Google Maps
const darkModeStyles: google.maps.MapTypeStyle[] = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

export interface ActivityPoint {
  id: number;
  title: string;
  lat: number;
  lng: number;
  address?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  place_id?: string | null;
  url?: string | null;
  description?: string | null;
  date?: string | null;
  time?: string | null;
  cost?: number | null;
  priority?: string | null;
  category?: string | null;
}

interface Props {
  activities: ActivityPoint[];
  centerLatLng?: [number, number];
}

const containerStyle = {
  width: "100%",
  height: "65vh",
  borderRadius: 16,
} as const;

const ItineraryMap: React.FC<Props> = ({ activities, centerLatLng }) => {
  const apiKey = GOOGLE_MAPS_API_KEY;
  const { isDarkMode } = useTheme();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [selected, setSelected] = useState<ActivityPoint | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [mode] = useState<"browse" | "route">("browse");
  const [travelMode] = useState<
    "WALKING" | "DRIVING" | "BICYCLING" | "TRANSIT"
  >("WALKING");
  const [optimize] = useState<boolean>(true);

  const center = useMemo(() => {
    if (centerLatLng && centerLatLng.length === 2)
      return { lat: centerLatLng[0], lng: centerLatLng[1] };
    if (activities.length > 0)
      return { lat: activities[0].lat, lng: activities[0].lng };
    return { lat: 46.948, lng: 7.447 };
  }, [centerLatLng, activities]);

  const routeInput = useMemo(() => {
    if (activities.length < 2) return null;
    const points = activities.map((a) => ({ lat: a.lat, lng: a.lng }));

    const origin = points[0];
    const destination = points[points.length - 1];
    const middle = points.slice(1, -1);

    // Google Directions API: máximo 23 waypoints (origen y destino aparte)
    const MAX_WAYPOINTS = 23;
    let limitedMiddle = middle;
    if (middle.length > MAX_WAYPOINTS) {
      // muestreo uniforme para quedarnos con MAX_WAYPOINTS intermedios
      const step = middle.length / MAX_WAYPOINTS;
      limitedMiddle = Array.from(
        { length: MAX_WAYPOINTS },
        (_, i) => middle[Math.floor(i * step)]
      );
    }

    const waypoints = limitedMiddle.map((p) => ({
      location: { lat: p.lat, lng: p.lng },
      stopover: true,
    }));

    return { origin, destination, waypoints };
  }, [activities]);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    // Fit to activities initially
    if (activities.length >= 2) {
      const b = new window.google.maps.LatLngBounds();
      activities.forEach((a) => b.extend({ lat: a.lat, lng: a.lng }));
      map.fitBounds(b);
    } else if (activities.length === 1) {
      map.setCenter({ lat: activities[0].lat, lng: activities[0].lng });
      map.setZoom(14);
    } else if (center) {
      map.setCenter(center);
      map.setZoom(12);
    }
  };

  const onDirections = (
    res: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === "OK" && res) {
      setDirections(res);
      const bounds = res.routes[0].bounds;
      if (bounds && mapRef.current) mapRef.current.fitBounds(bounds);
    } else {
      setDirections(null);
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;
    if (mode === "route" && directions?.routes?.[0]?.bounds) {
      mapRef.current.fitBounds(directions.routes[0].bounds);
      return;
    }
    if (mode === "browse") {
      if (activities.length >= 2) {
        const b = new window.google.maps.LatLngBounds();
        activities.forEach((a) => b.extend({ lat: a.lat, lng: a.lng }));
        mapRef.current.fitBounds(b);
        return;
      }
      if (activities.length === 1) {
        mapRef.current.setCenter({
          lat: activities[0].lat,
          lng: activities[0].lng,
        });
        mapRef.current.setZoom(14);
        return;
      }
      if (center) {
        mapRef.current.setCenter(center);
        mapRef.current.setZoom(12);
      }
    }
  }, [activities, center, mode, directions]);

  if (!isLoaded) return null;

  return (
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onMapLoad}
        options={{
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          clickableIcons: false,
          // Aplicar estilos de dark mode si está activado
          styles: isDarkMode ? darkModeStyles : undefined,
          // Configuración adicional para dark mode
          backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM,
          },
        }}
      >
        {activities.map((a) => {
          return (
            <Marker
              key={a.id}
              position={{ lat: a.lat, lng: a.lng }}
              onClick={() => {
                if (!selected || selected.id !== a.id) setSelected(a);
              }}
              // Usar marcador estándar por defecto, solo personalizar si es accommodation
              icon={
                a.category === "accommodation"
                  ? {
                      url:
                        "data:image/svg+xml;charset=UTF-8," +
                        encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" fill="#ccc" stroke="white" stroke-width="2"/>
                      <text x="16" y="20" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="white">🛏️</text>
                    </svg>
                  `),
                      scaledSize: new google.maps.Size(32, 32),
                      anchor: new google.maps.Point(16, 16),
                    }
                  : undefined
              }
            />
          );
        })}

        {routeInput && mode === "route" && (
          <DirectionsService
            options={{
              origin: routeInput.origin,
              destination: routeInput.destination,
              // Transit no admite waypoints; para otros modos, enviamos los limitados
              waypoints:
                travelMode === "TRANSIT" ? undefined : routeInput.waypoints,
              travelMode: google.maps.TravelMode[travelMode],
              optimizeWaypoints: travelMode === "TRANSIT" ? false : optimize,
              transitOptions:
                travelMode === "TRANSIT"
                  ? { departureTime: new Date() }
                  : undefined,
              provideRouteAlternatives: false,
            }}
            callback={onDirections}
          />
        )}

        {directions && mode === "route" && (
          <DirectionsRenderer
            options={{
              directions,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#2af0a0",
                strokeOpacity: 1,
                strokeWeight: 4,
              },
              preserveViewport: false,
            }}
          />
        )}

        {selected && (
          <InfoWindowF
            key={selected.id}
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="map-iw-wrapper">
              <MapInfoCard
                title={selected.title}
                address={selected.address}
                rating={selected.rating}
                reviews_count={selected.reviews_count}
                date={selected.date}
                time={selected.time}
                priority={selected.priority}
                cost={selected.cost}
                description={selected.description}
                url={selected.url}
                category={selected.category}
                place_id={selected.place_id}
                lat={selected.lat}
                lng={selected.lng}
              />
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
};

export default ItineraryMap;

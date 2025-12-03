import { useMemo, useState, useCallback, useEffect } from "react";
import { GOOGLE_MAPS_API_KEY } from "../../utils/env";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useTheme } from "../../hooks/useTheme";
import { MapInfoCard } from "../MapInfoCard";
// Clustering removed for simplicity/reliability

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

export type ActivityPoint = {
  id: number;
  title: string;
  description?: string | null;
  url?: string | null;
  address?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  date?: string | null;
  time?: string | null;
  cost?: number | null;
  priority?: string | null;
  lat: number;
  lng: number;
};

const containerStyle = {
  width: "100%",
  height: "65vh",
  borderRadius: 16,
} as const;

export default function GoogleItineraryMap({
  activities,
  apiKey = GOOGLE_MAPS_API_KEY,
  mode = "route",
  optimize = false,
  travelMode = google.maps.TravelMode.WALKING,
  center,
}: {
  activities: ActivityPoint[];
  apiKey?: string;
  mode?: "browse" | "route";
  optimize?: boolean;
  travelMode?: google.maps.TravelMode;
  center?: { lat: number; lng: number };
}) {
  const { isDarkMode } = useTheme();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const computedCenter = useMemo(() => {
    if (center) return center;
    if (activities.length > 0)
      return { lat: activities[0].lat, lng: activities[0].lng };
    // Default: Bern, CH
    return { lat: 46.948, lng: 7.447 };
  }, [activities, center]);

  const [selected, setSelected] = useState<ActivityPoint | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  // Map instance for fitting bounds
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  // Control when to fit bounds (avoid doing it on every user interaction)
  const [hasInitialFit, setHasInitialFit] = useState(false);

  const routeInput = useMemo(() => {
    const points = activities.map((a) => ({ lat: a.lat, lng: a.lng }));
    if (points.length < 2) return null;
    const origin = points[0];
    const destination = points[points.length - 1];
    const middle = points.slice(1, -1);

    const MAX_WAYPOINTS = 23;
    let limitedMiddle = middle;
    if (middle.length > MAX_WAYPOINTS) {
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

  const onDirections = useCallback(
    (
      res: google.maps.DirectionsResult | null,
      status: google.maps.DirectionsStatus
    ) => {
      if (status === "OK" && res) setDirections(res);
      else console.warn("Directions error:", status, res);
    },
    []
  );

  // Callback optimizado para cargar el mapa
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  // Fit map to data when loaded or inputs change - OPTIMIZADO
  useEffect(() => {
    if (!mapInstance || hasInitialFit) return;

    // Solo ajustar el mapa una vez al cargar o cuando cambien las actividades
    // No en cada movimiento del usuario
    if (mode === "route" && directions?.routes?.[0]?.bounds) {
      const routeBounds = directions.routes[0].bounds;
      mapInstance.fitBounds(routeBounds);
      setHasInitialFit(true);
      return;
    }

    // In browse mode, fit to activities
    if (mode === "browse") {
      if (activities.length >= 2) {
        const bounds = new google.maps.LatLngBounds();
        activities.forEach((a) => bounds.extend({ lat: a.lat, lng: a.lng }));
        mapInstance.fitBounds(bounds);
        setHasInitialFit(true);
        return;
      }
      if (activities.length === 1) {
        mapInstance.setCenter({
          lat: activities[0].lat,
          lng: activities[0].lng,
        });
        mapInstance.setZoom(14);
        setHasInitialFit(true);
        return;
      }
    }

    // Fallback to provided center if no activities
    if (center) {
      mapInstance.setCenter(center);
      mapInstance.setZoom(12);
      setHasInitialFit(true);
    }
  }, [mapInstance, activities, center, mode, directions, hasInitialFit]);

  // Reset hasInitialFit when activities change significantly
  useEffect(() => {
    setHasInitialFit(false);
  }, [activities.length, mode]);

  if (!isLoaded) return null;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={computedCenter}
      zoom={13}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        clickableIcons: false,
        // Aplicar estilos de dark mode si está activado
        styles: isDarkMode ? darkModeStyles : undefined,
        // Configuración adicional para dark mode
        backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.LEFT_BOTTOM,
        },
        // OPTIMIZACIONES DE RENDIMIENTO
        gestureHandling: "cooperative", // Mejor control de gestos
        disableDefaultUI: false,
        // Mejor rendimiento en dispositivos móviles
        maxZoom: 18,
        minZoom: 3,
      }}
      onLoad={onMapLoad}
    >
      {/* Show markers in both modes - OPTIMIZADO */}
      {activities.map((a) => (
        <Marker
          key={a.id}
          position={{ lat: a.lat, lng: a.lng }}
          onClick={() => setSelected(a)}
          zIndex={selected?.id === a.id ? 1000 : 1}
        />
      ))}

      {selected && (
        <InfoWindow
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
        </InfoWindow>
      )}

      {mode === "route" && routeInput && (
        <>
          <DirectionsService
            options={{
              origin: routeInput.origin,
              destination: routeInput.destination,
              waypoints:
                travelMode === google.maps.TravelMode.TRANSIT
                  ? undefined
                  : routeInput.waypoints,
              travelMode: travelMode,
              optimizeWaypoints:
                travelMode === google.maps.TravelMode.TRANSIT
                  ? false
                  : optimize,
              transitOptions:
                travelMode === google.maps.TravelMode.TRANSIT
                  ? { departureTime: new Date() }
                  : undefined,
              provideRouteAlternatives: false,
            }}
            callback={onDirections}
          />
          {directions && (
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
        </>
      )}
    </GoogleMap>
  );
}

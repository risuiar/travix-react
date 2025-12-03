import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const loadLRM = () => import("leaflet-routing-machine");

export type LatLng = { lat: number; lng: number };
export type RouteStep = { text: string; distance: number; time: number };
export type RouteSummary = { distance: number; duration: number };

export default function CustomRouteControl({
  waypoints,
  profile = "foot",
  onRoute,
  showMarkers = true,
  visible = true,
}: {
  waypoints: LatLng[];
  profile?: "foot" | "driving" | "cycling";
  onRoute?: (summary: RouteSummary, steps: RouteStep[]) => void;
  showMarkers?: boolean;
  visible?: boolean;
}) {
  const map = useMap();
  const ctlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!visible || !waypoints?.length) {
      if (ctlRef.current) {
        map.removeControl(ctlRef.current);
        ctlRef.current = null;
      }
      return;
    }

    const optimizeWaypoints = async (
      pts: LatLng[],
      routerProfile: string
    ): Promise<LatLng[]> => {
      try {
        if (pts.length < 3) return pts;
        const coords = pts.map((p) => `${p.lng},${p.lat}`).join(";");
        const url = `https://router.project-osrm.org/trip/v1/${routerProfile}/${coords}?source=first&destination=last&roundtrip=false&overview=false`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data || !data.waypoints) return pts;
        // Sort by 'waypoint_index'
        const ordered = data.waypoints
          .slice()
          .sort(
            (a: { waypoint_index: number }, b: { waypoint_index: number }) =>
              a.waypoint_index - b.waypoint_index
          )
          .map((w: { location: [number, number] }) => ({
            lat: w.location[1],
            lng: w.location[0],
          }));
        return ordered.length ? ordered : pts;
      } catch {
        return pts;
      }
    };

    loadLRM().then(async () => {
      if (!mounted) return;

      const startIcon = L.divIcon({
        className: "travix-route-start",
        html: '<div class="dot"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      const endIcon = L.divIcon({
        className: "travix-route-end",
        html: '<div class="dot"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      const midIcon = L.divIcon({
        className: "travix-route-mid",
        html: '<div class="dot small"></div>',
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      if (ctlRef.current) {
        map.removeControl(ctlRef.current);
        ctlRef.current = null;
      }

      const routerProfile =
        profile === "driving" ? "car" : profile === "cycling" ? "bike" : "foot";

      const orderedPts = await optimizeWaypoints(waypoints, routerProfile);

      ctlRef.current = L.Routing.control({
        waypoints: orderedPts.map((w) => L.latLng(w.lat, w.lng)),
        show: false,
        collapsible: false,
        fitSelectedRoutes: true,
        addWaypoints: false,
        draggableWaypoints: false,
        routeWhileDragging: false,
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: routerProfile,
        }),
        lineOptions: {
          styles: [
            { color: "#9fffe0", weight: 6, opacity: 0.9 },
            { color: "#2af0a0", weight: 3, opacity: 1.0 },
          ],
          addWaypoints: false,
        },
        createMarker: (i: number, wp: { latLng: L.LatLng }) => {
          if (!showMarkers) return null;
          if (i === 0) return L.marker(wp.latLng, { icon: startIcon });
          if (i === waypoints.length - 1)
            return L.marker(wp.latLng, { icon: endIcon });
          return L.marker(wp.latLng, { icon: midIcon });
        },
      }).addTo(map);

      ctlRef.current.on(
        "routesfound",
        (e: {
          routes?: Array<{
            summary?: { totalDistance?: number; totalTime?: number };
            distance?: number;
            duration?: number;
            instructions?: Array<{
              text: string;
              distance?: number;
              time?: number;
            }>;
          }>;
        }) => {
          const r = e.routes?.[0];
          if (!r) return;
          const summary: RouteSummary = {
            distance: r.summary?.totalDistance ?? r.distance ?? 0,
            duration: r.summary?.totalTime ?? r.duration ?? 0,
          };
          const steps: RouteStep[] = (r.instructions || []).map(
            (ins: { text: string; distance?: number; time?: number }) => ({
              text: ins.text,
              distance: ins.distance ?? 0,
              time: ins.time ?? 0,
            })
          );
          onRoute?.(summary, steps);
        }
      );
    });

    return () => {
      mounted = false;
      if (ctlRef.current) {
        map.removeControl(ctlRef.current);
        ctlRef.current = null;
      }
    };
  }, [map, waypoints, profile, showMarkers, visible, onRoute]);

  return null;
}

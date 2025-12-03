declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    namespace places {
      class PlacesService {
        constructor(attrContainer: HTMLDivElement | google.maps.Map);
        textSearch(
          request: google.maps.places.TextSearchRequest,
          callback: (
            results: google.maps.places.PlaceResult[] | null,
            status: google.maps.places.PlacesServiceStatus
          ) => void
        ): void;
      }

      interface TextSearchRequest {
        query: string;
        location?: google.maps.LatLng | google.maps.LatLngLiteral;
        radius?: number;
        language?: string;
      }

      interface PlaceResult {
        place_id: string;
        name: string;
        formatted_address: string;
        geometry: {
          location: google.maps.LatLng;
        };
        types: string[];
      }

      enum PlacesServiceStatus {
        OK = "OK",
        ZERO_RESULTS = "ZERO_RESULTS",
        OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
        REQUEST_DENIED = "REQUEST_DENIED",
        INVALID_REQUEST = "INVALID_REQUEST",
        UNKNOWN_ERROR = "UNKNOWN_ERROR",
      }
    }
  }
}

export {};

import { useState, useEffect, useRef, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { useKeyboardOffset } from "../hooks/useKeyboardOffset";
import { useGooglePlacesAutocomplete } from "../hooks/useGooglePlaces";
import { placeTypeCategoryMap } from "../utils/placeTypeCategoryMap";

interface Place {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  place_type?: string; // Allow any Google Places type
  rating?: number;
  reviews_count?: number;
  address?: string;
  google_category?: string;
}

interface GooglePlacePrediction {
  place_id?: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types?: string[];
}

interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface GooglePlacesProps {
  onSelect: (place: Place) => void;
  initialValue?: string;
  initialDetails?: {
    name: string;
    address?: string;
    rating?: number;
    reviews_count?: number;
    place_id?: string;
  };
  location?: { lat: number; lng: number };
  radius?: number;
}

const GooglePlaces = forwardRef<HTMLInputElement, GooglePlacesProps>(
  ({ onSelect, initialValue, initialDetails, location }, ref) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState(initialValue || "");
    const [showPredictions, setShowPredictions] = useState(false);
    const [selectedPlace, setSelectedPlace] =
      useState<GooglePlacePrediction | null>(null);
    const [placeDetails, setPlaceDetails] = useState<GooglePlaceDetails | null>(
      null
    );
    const [isSelected, setIsSelected] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { predictions, loading, error, searchPlaces, getPlaceDetails } =
      useGooglePlacesAutocomplete();

    // Use keyboard offset hook
    useKeyboardOffset();

    // Update query when initialValue changes
    useEffect(() => {
      setQuery(initialValue || "");
      // If there's an initial value, set as selected
      if (initialValue && initialValue.trim()) {
        setIsSelected(true);
        setSelectedPlace({
          structured_formatting: {
            main_text: initialValue,
            secondary_text: "",
          },
        });

        // If we have initial details, set them as place details
        if (initialDetails) {
          setPlaceDetails({
            name: initialDetails.name,
            formatted_address: initialDetails.address || "",
            rating: initialDetails.rating,
            user_ratings_total: initialDetails.reviews_count,
            place_id: initialDetails.place_id || "",
          });
        }
      } else {
        setIsSelected(false);
        setSelectedPlace(null);
        setPlaceDetails(null);
      }
    }, [initialValue, initialDetails]);

    // Ocultar predicciones al hacer clic fuera
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setShowPredictions(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      if (value.trim() && location) {
        searchPlaces(value, location);
        setShowPredictions(true);
      } else {
        setShowPredictions(false);
      }
    };

    const handlePlaceSelect = async (prediction: GooglePlacePrediction) => {
      setQuery(prediction.structured_formatting.main_text);
      setShowPredictions(false);
      setIsSelected(true);
      setSelectedPlace(prediction);

      // Obtener detalles del lugar
      const details = await getPlaceDetails(prediction.place_id || "");
      setPlaceDetails(details);

      // Determine place type based on Google Places types
      let place_type:
        | "restaurant"
        | "museum"
        | "attraction"
        | "hotel"
        | "shop"
        | "other" = "other";

      if (
        details?.types?.includes("restaurant") ||
        details?.types?.includes("food")
      ) {
        place_type = "restaurant";
      } else if (details?.types?.includes("museum")) {
        place_type = "museum";
      } else if (
        details?.types?.includes("tourist_attraction") ||
        details?.types?.includes("point_of_interest")
      ) {
        place_type = "attraction";
      } else if (details?.types?.includes("lodging")) {
        place_type = "hotel";
      } else if (
        details?.types?.includes("store") ||
        details?.types?.includes("shopping")
      ) {
        place_type = "shop";
      }

      // Find the first type that matches our category mapping
      const findMappedType = (types: string[]) => {
        for (const type of types) {
          if (placeTypeCategoryMap[type]) {
            return type;
          }
        }
        return types[0] || "other"; // Fallback to first type if no match
      };

      const selectedPlace = {
        name: details?.name || prediction.structured_formatting.main_text,
        country: details?.formatted_address?.split(",").pop()?.trim() || "",
        latitude: details?.geometry?.location?.lat || 0,
        longitude: details?.geometry?.location?.lng || 0,
        place_id: prediction.place_id,
        place_type: details?.types ? findMappedType(details.types) : "other",
        rating: details?.rating,
        reviews_count: details?.user_ratings_total,
        address: details?.formatted_address,
        google_category: details?.types?.[0] || place_type,
      };

      onSelect(selectedPlace);
    };

    const handleClearSelection = () => {
      setQuery("");
      setIsSelected(false);
      setSelectedPlace(null);
      setPlaceDetails(null);
      onSelect({
        name: "",
        country: "",
        latitude: 0,
        longitude: 0,
        place_id: "",
        place_type: "other",
        rating: undefined,
        reviews_count: undefined,
        address: "",
        google_category: "",
      });
    };

    return (
      <div className="relative w-full">
        {!isSelected ? (
          <>
            <input
              ref={ref || inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              placeholder={t("placeholders.searchPlaceOrActivity")}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />

            {loading && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-1 z-50">
                Loading...
              </div>
            )}

            {error && (
              <div className="absolute top-full left-0 right-0 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mt-1 z-50">
                <div className="text-sm text-red-600 dark:text-red-400">
                  Error: {error}
                </div>
              </div>
            )}

            {showPredictions && predictions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-1 max-h-48 overflow-y-auto z-50 shadow-lg">
                {predictions.map((prediction) => (
                  <button
                    key={prediction.place_id}
                    type="button"
                    className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                    onClick={() => {
                      handlePlaceSelect(prediction);
                    }}
                    onMouseDown={() => {
                      handlePlaceSelect(prediction);
                    }}
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {prediction.structured_formatting.main_text}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="relative flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-blue-900 dark:text-blue-100">
                📍{" "}
                {placeDetails?.name ||
                  selectedPlace?.structured_formatting?.main_text}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {placeDetails?.formatted_address ||
                  selectedPlace?.structured_formatting?.secondary_text}
              </div>
              {initialDetails && initialDetails.name !== placeDetails?.name && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  📍 {initialDetails.name}
                </div>
              )}
              {placeDetails?.rating && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  ⭐ {placeDetails.rating}/5 ({placeDetails.user_ratings_total}{" "}
                  reseñas)
                </div>
              )}
              {placeDetails?.price_level && (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {"💰".repeat(placeDetails.price_level)}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
              title="Borrar selección"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }
);

export default GooglePlaces;

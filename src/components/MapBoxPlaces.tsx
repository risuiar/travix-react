import { useState, useEffect, useRef, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { MAPBOX_TOKEN } from "../utils/env";
import { useKeyboardOffset } from "../hooks/useKeyboardOffset";

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [long, lat]
  context?: { text: string }[];
  bbox?: number[];
  short_code?: string; // Código de país de 2 letras
  properties?: {
    short_code?: string;
    mapbox_id?: string;
    wikidata?: string;
  };
}

interface Place {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  bbox: number[];
  country_code?: string;
  place_type?: "city" | "place";
  place_id?: string;
}

interface CitySearchProps {
  onSelect: (place: Place) => void;
  initialValue?: string; // Initial value for editing
  countries?: boolean;
  bbox?: number[];
  countryCodes?: string[]; // Array of country codes to filter by (e.g., ["es", "it"])
  searchType?: "itinerary"; // Only for itinerary searches
}

const CitySearch = forwardRef<HTMLInputElement, CitySearchProps>(
  (
    {
      onSelect,
      initialValue,
      countries = false,
      bbox,
      countryCodes,
      searchType,
    },
    ref
  ) => {
    const { t, i18n } = useTranslation();
    const [query, setQuery] = useState(initialValue || "");
    const [results, setResults] = useState<MapboxFeature[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Use keyboard offset hook
    useKeyboardOffset();

    // Update query when initialValue changes (for editing)
    useEffect(() => {
      setQuery(initialValue || "");
    }, [initialValue]);

    const fetchCities = async (input: string) => {
      if (!MAPBOX_TOKEN) {
        console.error("Mapbox access token not found in environment variables");
        return;
      }

      setIsLoading(true);

      // Get current language for Mapbox API
      const currentLanguage = i18n.language.split("-")[0]; // Get base language code

      // Build URL with optional country filter
      let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        input
      )}.json?access_token=${MAPBOX_TOKEN}&language=${currentLanguage}&types=${
        countries
          ? "country"
          : searchType === "itinerary"
          ? "region,place"
          : "region,place,poi"
      }`;

      // Add bbox filter if provided
      if (bbox && bbox.length > 0) {
        url += `&bbox=${bbox.join(",")}`;
      }

      // Add country filter if provided
      if (countryCodes && countryCodes.length > 0) {
        // Filter out invalid country codes
        const validCountryCodes = countryCodes.filter(
          (code) => code && typeof code === "string" && code.length === 2
        );

        if (validCountryCodes.length > 0) {
          url += `&country=${validCountryCodes.join(",")}`;
        }
      }

      try {
        const response = await fetch(url);
        const data = await response.json();

        setResults(Array.isArray(data.features) ? data.features : []);
      } catch (error) {
        console.error("MapBoxPlaces API error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      if (value.length > 2) {
        fetchCities(value);
      } else {
        setResults([]);
      }
    };

    const handleSelect = (place: MapboxFeature) => {
      setQuery(place.place_name);
      setResults([]);
      const [longitude, latitude] = place.center;

      // Extract country code - para países usar short_code, para ciudades buscar en context
      let country_code = "";
      if (countries && place.properties?.short_code) {
        // Para países, usar el short_code de properties
        country_code = place.properties.short_code;
      } else if (place.context) {
        // Para ciudades, buscar en el context
        const countryContext = place.context.find(
          (ctx) => ctx.text && ctx.text.length === 2
        );
        if (countryContext) {
          country_code = countryContext.text;
        }
      }

      // Determine place type based on MapBox properties
      let place_type: "city" | "place" = "city"; // default to city since most results are cities

      // Check if it's a specific point of interest (poi)
      if (place.id.startsWith("poi.")) {
        place_type = "place";
      }

      const selectedPlace = {
        name: place.text,
        country: place.context?.[0]?.text || place.text,
        latitude,
        longitude,
        bbox: place.bbox || [],
        country_code,
        place_type,
        place_id: place.id,
      };

      onSelect(selectedPlace);
    };

    return (
      <div className="relative w-full">
        <input
          ref={ref || inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={
            countries
              ? t("placeholders.searchCountry")
              : t("placeholders.searchCityOrPlace")
          }
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />

        {isLoading && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-1 z-50">
            Loading...
          </div>
        )}

        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-1 max-h-48 overflow-y-auto z-50 shadow-lg">
            {results.map((place) => (
              <div
                key={place.id}
                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                onClick={() => handleSelect(place)}
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {place.text}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {place.place_name}
                </div>
                {countries && place.properties?.short_code && (
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Code: {place.properties.short_code}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

export default CitySearch;

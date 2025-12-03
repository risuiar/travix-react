import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../utils/apiClient";

interface Prediction {
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
  };
}

interface Location {
  lat: number;
  lng: number;
}

export const useGooglePlacesAutocomplete = () => {
  const { i18n } = useTranslation();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const getPlacePredictions = async (input: string, location: Location) => {
    if (!input.trim()) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.getPlacePredictions(
        input,
        location,
        5000,
        i18n.language
      );
      setPredictions(data.predictions || []);
    } catch (err: unknown) {
      console.error("🔍 Error buscando predicciones:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const searchPlaces = (input: string, location: Location) => {
    // Limpiar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce para evitar demasiadas peticiones
    debounceTimer.current = setTimeout(() => {
      getPlacePredictions(input, location);
    }, 300);
  };

  const getPlaceDetails = async (
    placeId: string
  ): Promise<PlaceDetails | null> => {
    try {
      const data = await apiClient.getPlaceDetails(placeId, i18n.language);
      return data.result;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return null;
    }
  };

  return {
    predictions,
    loading,
    error,
    searchPlaces,
    getPlaceDetails,
  };
};

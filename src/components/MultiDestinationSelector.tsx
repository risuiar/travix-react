import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import MapBoxPlaces from "./MapBoxPlaces";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";

interface Place {
  name: string;
  country?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  bbox: number[];
}

interface TravelDestination {
  name: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  bbox: number[];
}

interface MultiDestinationSelectorProps {
  destinations: TravelDestination[];
  onDestinationsChange: (destinations: TravelDestination[]) => void;
  disabled?: boolean;
}

export default function MultiDestinationSelector({
  destinations,
  onDestinationsChange,
  disabled = false,
}: MultiDestinationSelectorProps) {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddDestination = (place: Place) => {
    const newDestination: TravelDestination = {
      name: place.name,
      country: place.country || place.name,
      country_code: place.country_code || "",
      latitude: place.latitude,
      longitude: place.longitude,
      bbox: place.bbox || [],
    };

    // Verificar si el destino ya existe
    const exists = destinations.some(
      (dest) =>
        dest.name === newDestination.name &&
        dest.country === newDestination.country
    );

    if (!exists) {
      onDestinationsChange([...destinations, newDestination]);
    }
    setIsAdding(false);
  };

  const handleRemoveDestination = (index: number) => {
    const newDestinations = destinations.filter((_, i) => i !== index);
    onDestinationsChange(newDestinations);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {t("trip.destinations")}
      </label>

      {/* Lista de destinos seleccionados */}
      {destinations.length > 0 && (
        <div className="space-y-2">
          {destinations.map((destination, index) => (
            <div
              key={`${destination.name}-${destination.country}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {destination.name}
                </div>
                <div className="text-sm text-gray-500">
                  {destination.country}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleRemoveDestination(index)}
                  disabled={disabled}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón para agregar nuevo destino */}
      {!isAdding && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            disabled={disabled}
            className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t("trip.addDestination")}
          </button>
        </div>
      )}

      {/* Campo de búsqueda para agregar destino */}
      {isAdding && (
        <div className="space-y-2">
          <MapBoxPlaces onSelect={handleAddDestination} countries />
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            disabled={disabled}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
        </div>
      )}

      {/* Información adicional */}
      {destinations.length > 0 && (
        <p className="text-xs text-gray-500">
          {t("trip.destinationsInfo", { count: destinations.length })}
        </p>
      )}
    </div>
  );
}

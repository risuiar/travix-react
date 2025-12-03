import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import MapBoxPlaces from "./MapBoxPlaces";
import { XMarkIcon, PlusIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

interface Place {
  name: string;
  country?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  bbox: number[];
}

interface CountryChipSelectorProps {
  country_codes?: Array<Record<string, string>>; // [{ "de": "Alemania" }, { "es": "España" }]
  onCountryCodesChange: (country_codes: Array<Record<string, string>>) => void;
  disabled?: boolean;
}

export default function CountryChipSelector({
  country_codes = [],
  onCountryCodesChange,
  disabled = false,
}: CountryChipSelectorProps) {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(true); // Cambiado a true para que esté visible por defecto
  const mapboxRef = useRef<HTMLInputElement>(null);
  const [shouldFocus, setShouldFocus] = useState(false); // Para controlar cuándo hacer focus

  // Efecto para hacer foco en el input cuando se activa el modo de agregar
  useEffect(() => {
    if (isAdding && shouldFocus && mapboxRef.current) {
      // Pequeño delay para asegurar que el input esté renderizado
      setTimeout(() => {
        mapboxRef.current?.focus();
      }, 100);
      setShouldFocus(false); // Resetear el flag
    }
  }, [isAdding, shouldFocus]);

  const handleAddCountry = (place: Place) => {
    if (!place.country_code) {
      return;
    }

    const newCountryCode = { [place.country_code]: place.name };

    // Verificar si el país ya existe
    const exists = country_codes.some((countryObj) => {
      const [code] = Object.entries(countryObj)[0];
      return code === place.country_code;
    });

    if (!exists) {
      const updatedCountryCodes = [...country_codes, newCountryCode];

      onCountryCodesChange(updatedCountryCodes);
    }
    setIsAdding(false);
  };

  const handleRemoveCountry = (index: number) => {
    const newCountryCodes = country_codes.filter((_, i) => i !== index);

    onCountryCodesChange(newCountryCodes);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("trip.countriesToVisit")} <span className="text-red-500">*</span>
      </label>

      {/* Chips de países seleccionados */}
      {country_codes && country_codes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {country_codes.map((countryObj, index) => {
            const [code, name] = Object.entries(countryObj)[0];
            return (
              <div
                key={`${code}-${name}-${index}`}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800"
              >
                <GlobeAltIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>{name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCountry(index)}
                  disabled={disabled}
                  className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Botón para agregar nuevo país */}
      {!isAdding && (
        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setShouldFocus(true); // Activar el focus
          }}
          disabled={disabled}
          className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t("trip.addCountry")}
        </button>
      )}

      {/* Campo de búsqueda para agregar país */}
      {isAdding && (
        <div className="space-y-2">
          <MapBoxPlaces ref={mapboxRef} onSelect={handleAddCountry} countries />
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            disabled={disabled}
            className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
        </div>
      )}

      {/* Información adicional */}
      {country_codes && country_codes.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("trip.countriesInfo", {
            count: country_codes.length,
          })}
        </p>
      )}
    </div>
  );
}

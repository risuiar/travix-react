import { BACKEND_TRAVIX, API_TOKEN } from "./env";

const API_CONFIG = {
  baseURL: BACKEND_TRAVIX || "https://backend.travix.app",
  token: API_TOKEN,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_TOKEN}`,
  },
};

interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

class ApiClient {
  private baseURL: string | null;
  private token: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL || null;
    this.token = API_CONFIG.token;
  }

  private checkConfig() {
    if (!this.baseURL) {
      throw new Error(
        "VITE_BACKEND_TRAVIX environment variable is not configured"
      );
    }
  }

  async makeRequest(endpoint: string, options: ApiRequestOptions = {}) {
    this.checkConfig();
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...options.headers,
      },
      ...options,
    };

    // Debug log for development
    if (import.meta.env.DEV) {
      console.log(`🔗 API Request: ${config.method} ${url}`);
      console.log(`🔑 Authorization: Bearer ${this.token.substring(0, 10)}...`);
      if (config.body) {
        console.log(`📦 Request body:`, JSON.parse(config.body));
      }
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ API Error ${response.status}:`, errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Método para obtener predicciones de lugares
  async getPlacePredictions(
    input: string,
    location: { lat: number; lng: number },
    radius: number = 5000,
    language: string = "es",
    types: string = "establishment"
  ) {
    return this.makeRequest("/api/google-places", {
      method: "POST",
      body: JSON.stringify({
        input,
        location,
        radius,
        language,
        types,
      }),
    });
  }

  // Método para obtener detalles de un lugar
  async getPlaceDetails(placeId: string, language: string = "es") {
    return this.makeRequest("/api/google-places/details", {
      method: "POST",
      body: JSON.stringify({
        place_id: placeId,
        language,
      }),
    });
  }

  // Método para verificar configuración
  async checkGooglePlacesConfig() {
    return this.makeRequest("/api/google-places/config");
  }
}

export default new ApiClient();

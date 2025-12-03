import { AI_API_URL, API_TOKEN } from "./env";

export const callAIApi = async (formData: Record<string, unknown>) => {
  const BASE_URL = AI_API_URL;
  const API_URL = `${BASE_URL}/api/travel-recommendations`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
};

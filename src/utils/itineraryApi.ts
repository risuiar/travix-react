import { supabase } from "../supabaseClient";
import { TravelItinerary } from "../types";

export const createItinerary = async (
  itinerary: Omit<TravelItinerary, "id" | "created_at">
): Promise<TravelItinerary> => {
  const { data, error } = await supabase
    .from("travel_itineraries")
    .insert([itinerary])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating itinerary: ${error.message}`);
  }

  return data;
};

export const updateItinerary = async (
  id: string,
  updates: Partial<Omit<TravelItinerary, "id" | "created_at">>
): Promise<TravelItinerary> => {
  const { data, error } = await supabase
    .from("travel_itineraries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating itinerary: ${error.message}`);
  }

  return data;
};

export const deleteItinerary = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("travel_itineraries")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error deleting itinerary: ${error.message}`);
  }
};

export const getItinerariesByTravelId = async (
  travelId: string
): Promise<TravelItinerary[]> => {
  const { data, error } = await supabase
    .from("travel_itineraries")
    .select("*")
    .eq("travel_id", travelId)
    .order("start_date", { ascending: true });

  if (error) {
    throw new Error(`Error fetching itineraries: ${error.message}`);
  }

  return data || [];
};

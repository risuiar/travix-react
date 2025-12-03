export interface ActivityPoint {
  id: number;
  title: string;
  lat: number;
  lng: number;
  address?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  place_id?: string | null;
  url?: string | null;
  description?: string | null;
  date?: string | null;
  time?: string | null;
  cost?: number | null;
  priority?: string | null;
  location?: string | null;
  google_category?: string | null;
  category?: string | null;
  type?: string | null;
}

import { supabase } from "../supabaseClient";

export async function fetchActivitiesByItinerary(
  itineraryId: string | number
): Promise<ActivityPoint[]> {
  const itineraryIdNum = Number(itineraryId);

  // Fetch activities
  const { data: activitiesData, error: activitiesError } = await supabase
    .from("travel_activities")
    .select(
      "id,title,lat,lng,address,rating,reviews_count,place_id,url,description,date,time,cost,priority,location,google_category"
    )
    .eq("itinerary_id", isNaN(itineraryIdNum) ? itineraryId : itineraryIdNum)
    .not("lat", "is", null)
    .not("lng", "is", null);

  if (activitiesError) throw activitiesError;

  // Fetch expenses
  const { data: expensesData, error: expensesError } = await supabase
    .from("travel_expenses")
    .select(
      "id,title,lat,lng,address,place_id,notes,date,cost,location,category,google_category,rating,reviews_count,url"
    )
    .eq("itinerary_id", isNaN(itineraryIdNum) ? itineraryId : itineraryIdNum)
    .not("lat", "is", null)
    .not("lng", "is", null);

  if (expensesError) throw expensesError;

  // Combine activities and expenses
  const allData = [
    ...(activitiesData || []).map((item) => ({ ...item, type: "activity" })),
    ...(expensesData || []).map((item) => ({ ...item, type: "expense" })),
  ];

  // Agrupar por fecha
  const dataByDate: Record<string, ActivityPoint[]> = {};
  if (allData) {
    allData.forEach((item: ActivityPoint) => {
      const date = item.date || "general";
      if (!dataByDate[date]) dataByDate[date] = [];
      dataByDate[date].push(item);
    });
  }

  return allData.map(
    (row: {
      id: number;
      title: string;
      lat: number;
      lng: number;
      address?: string | null;
      rating?: number | null;
      reviews_count?: number | null;
      place_id?: string | null;
      url?: string | null;
      description?: string | null;
      notes?: string | null;
      date?: string | null;
      time?: string | null;
      cost?: number | null;
      priority?: string | null;
      location?: string | null;
      google_category?: string | null;
      category?: string | null;
      type?: string | null;
    }) => {
      // Process coordinates with maximum precision
      const lat = Number(row.lat);
      const lng = Number(row.lng);

      return {
        id: Number(row.id),
        title: row.title,
        lat,
        lng,
        address: row.address ?? null,
        rating: row.rating ?? null,
        reviews_count: row.reviews_count ?? null,
        place_id: row.place_id ?? null,
        url: row.url ?? null,
        description: row.description ?? row.notes ?? null, // Use notes for expenses
        date: row.date ?? null,
        time: row.time ?? null,
        cost: row.cost != null ? Number(row.cost) : null,
        priority: row.priority ?? null,
        location: row.location ?? null,
        google_category: row.google_category ?? null,
        category: row.category ?? null, // Include category
        type: row.type ?? null, // Include type
      };
    }
  );
}

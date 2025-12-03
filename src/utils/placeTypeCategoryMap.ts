export const placeTypeCategoryMap: { [type: string]: string } = {
  // Food
  restaurant: "food",
  cafe: "food",
  bakery: "food",
  food: "food",
  meal_delivery: "food",
  meal_takeaway: "food",
  dining: "food",
  fast_food: "food",
  food_court: "food",
  food_truck: "food",
  food_vendor: "food",

  // Transportation
  airport: "transportation",
  train_station: "transportation",
  bus_station: "transportation",
  subway_station: "transportation",
  taxi_stand: "transportation",
  transit_station: "transportation",
  light_rail_station: "transportation",
  ferry_terminal: "transportation",
  parking: "transportation",

  // Accommodation
  lodging: "accommodation",
  hotel: "accommodation",
  motel: "accommodation",
  hostel: "accommodation",

  // Shopping
  shopping_mall: "shopping",
  store: "shopping",
  supermarket: "shopping",
  department_store: "shopping",
  clothing_store: "shopping",
  shoe_store: "shopping",
  book_store: "shopping",
  electronics_store: "shopping",
  drugstore: "shopping",
  florist: "shopping",
  jewelry_store: "shopping",
  hardware_store: "shopping",
  home_goods_store: "shopping",
  convenience_store: "shopping",
  liquor_store: "shopping",

  // Cultural & Historical
  museum: "cultural",
  art_gallery: "cultural",
  church: "cultural",
  synagogue: "cultural",
  mosque: "cultural",
  hindu_temple: "cultural",
  city_hall: "cultural",
  library: "cultural",
  university: "cultural",
  school: "cultural",
  culture: "cultural",
  historic_site: "cultural",
  landmark: "cultural",
  castle: "cultural",
  cathedral: "cultural",
  monument: "cultural",

  // Nature / Outdoor & Recreation
  park: "nature_outdoor",
  natural_feature: "nature_outdoor",
  campground: "nature_outdoor",
  rv_park: "nature_outdoor",
  zoo: "nature_outdoor",
  aquarium: "nature_outdoor",
  beach: "nature_outdoor",
  tourist_attraction: "nature_outdoor",
  nature: "nature_outdoor",
  golf_course: "nature_outdoor",
  ski_resort: "nature_outdoor",
  hiking_trail: "nature_outdoor",
  recreation_center: "nature_outdoor",
  walking: "nature_outdoor",
  walking_tour: "nature_outdoor",
  walking_tour_guide: "nature_outdoor",
  walking_tour_guide_service: "nature_outdoor",
  walking_tour_guide_service_provider: "nature_outdoor",
  walking_tour_guide_service_provider_service: "nature_outdoor",
  walking_tour_guide_service_provider_service_provider: "nature_outdoor",
  walking_tour_guide_service_provider_service_provider_service:
    "nature_outdoor",

  // Wellness
  spa: "wellness",
  beauty_salon: "wellness",
  hair_care: "wellness",
  massage_spa: "wellness",
  gym: "wellness",
  physiotherapist: "wellness",
  health_club: "wellness",
  yoga_studio: "wellness",

  // Entertainment
  movie_theater: "entertainment",
  amusement_park: "entertainment",
  bowling_alley: "entertainment",
  casino: "entertainment",
  stadium: "entertainment",
  concert_hall: "entertainment",
  theater: "entertainment",
  playground: "entertainment",
  entertainment: "entertainment",

  // Nightlife
  night_club: "nightlife",
  bar: "nightlife",
  lounge: "nightlife",

  // Guided Tours
  travel_agency: "guided_tours",
  tourist_information_center: "guided_tours",

  // Health & Safety
  hospital: "health",
  doctor: "health",
  pharmacy: "health",
  dentist: "health",
  fire_station: "health",
  police: "health",
  veterinary_care: "health",

  // Services
  atm: "services",
  bank: "services",
  laundry: "services",
  post_office: "services",
  embassy: "services",
  car_rental: "services",
  gas_station: "services",
  car_repair: "services",
  car_wash: "services",
  storage: "services",
  real_estate_agency: "services",

  // Others
  point_of_interest: "other",
  establishment: "other",
  locality: "other",
};

export const mapPlaceTypesToCategory = (placeTypes: string[]): string => {
  if (!placeTypes || placeTypes.length === 0) {
    return "other";
  }

  for (const type of placeTypes) {
    const category = placeTypeCategoryMap[type];
    if (category) {
      return category;
    }
  }

  return "other";
};

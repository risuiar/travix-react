const interestCategories = [
  {
    key: "culture",
    label: "ai.interestsGroup.culture",
    interests: [
      {
        key: "museums",
        label: "ai.interestsList.museums",
      },
      {
        key: "touristAttractions",
        label: "ai.interestsList.touristAttractions",
      },
      {
        key: "architecture",
        label: "ai.interestsList.architecture",
      },
      {
        key: "historicalMonuments",
        label: "ai.interestsList.historicalMonuments",
      },
      {
        key: "localCulture",
        label: "ai.interestsList.localCulture",
      },
      {
        key: "templesSpirituality",
        label: "ai.interestsList.templesSpirituality",
      },
      {
        key: "galeriasArte",
        label: "ai.interestsList.galeriasArte",
      },
      {
        key: "religiousSites",
        label: "ai.interestsList.religiousSites",
      },
      {
        key: "culturalFestivals",
        label: "ai.interestsList.culturalFestivals",
      },
    ],
  },
  {
    key: "food",
    label: "ai.interestsGroup.food",
    interests: [
      {
        key: "restaurants",
        label: "ai.interestsList.restaurants",
      },
      {
        key: "cafes",
        label: "ai.interestsList.cafes",
      },
      {
        key: "localCuisine",
        label: "ai.interestsList.localCuisine",
      },
      {
        key: "experienciasGourmet",
        label: "ai.interestsList.experienciasGourmet",
      },
      {
        key: "baresCocteleria",
        label: "ai.interestsList.baresCocteleria",
      },
      {
        key: "catasMaridajes",
        label: "ai.interestsList.catasMaridajes",
      },
      {
        key: "foodMarkets",
        label: "ai.interestsList.foodMarkets",
      },
      {
        key: "cookingClasses",
        label: "ai.interestsList.cookingClasses",
      },
    ],
  },
  {
    key: "nature",
    label: "ai.interestsGroup.nature",
    interests: [
      {
        key: "parksNature",
        label: "ai.interestsList.parksNature",
      },
      {
        key: "beachesSea",
        label: "ai.interestsList.beachesSea",
      },
      {
        key: "dayTrips",
        label: "ai.interestsList.dayTrips",
      },
      {
        key: "extremeNature",
        label: "ai.interestsList.extremeNature",
      },
      {
        key: "hiddenGems",
        label: "ai.interestsList.hiddenGems",
      },
      {
        key: "atardeceresRomanticos",
        label: "ai.interestsList.atardeceresRomanticos",
      },
      {
        key: "mountains",
        label: "ai.interestsList.mountains",
      },
      {
        key: "naturalReserves",
        label: "ai.interestsList.naturalReserves",
      },
    ],
  },
  {
    key: "entertainment",
    label: "ai.interestsGroup.entertainment",
    interests: [
      {
        key: "nightlife",
        label: "ai.interestsList.nightlife",
      },
      {
        key: "showsTheater",
        label: "ai.interestsList.showsTheater",
      },
      {
        key: "cinemaEntertainment",
        label: "ai.interestsList.cinemaEntertainment",
      },
      {
        key: "jazzMusica",
        label: "ai.interestsList.jazzMusica",
      },
      {
        key: "bohemianAreas",
        label: "ai.interestsList.bohemianAreas",
      },
      {
        key: "liveMusic",
        label: "ai.interestsList.liveMusic",
      },
      {
        key: "festivals",
        label: "ai.interestsList.festivals",
      },
    ],
  },
  {
    key: "shopping",
    label: "ai.interestsGroup.shopping",
    interests: [
      {
        key: "shopping",
        label: "ai.interestsList.shopping",
      },
      {
        key: "localMarkets",
        label: "ai.interestsList.localMarkets",
      },
      {
        key: "factoryVisits",
        label: "ai.interestsList.factoryVisits",
      },
      {
        key: "wandering",
        label: "ai.interestsList.wandering",
      },
      {
        key: "barsWithView",
        label: "ai.interestsList.barsWithView",
      },
      {
        key: "souvenirShops",
        label: "ai.interestsList.souvenirShops",
      },
      {
        key: "boutiques",
        label: "ai.interestsList.boutiques",
      },
    ],
  },
  {
    key: "activities",
    label: "ai.interestsGroup.activities",
    interests: [
      {
        key: "guidedTours",
        label: "ai.interestsList.guidedTours",
      },
      {
        key: "bikeRoutes",
        label: "ai.interestsList.bikeRoutes",
      },
      {
        key: "sportsActivities",
        label: "ai.interestsList.sportsActivities",
      },
      {
        key: "familyActivities",
        label: "ai.interestsList.familyActivities",
      },
      {
        key: "talleresCreativos",
        label: "ai.interestsList.talleresCreativos",
      },
      {
        key: "rutasCulturales",
        label: "ai.interestsList.rutasCulturales",
      },
      {
        key: "photography",
        label: "ai.interestsList.photography",
      },
      {
        key: "waterSports",
        label: "ai.interestsList.waterSports",
      },
    ],
  },
  {
    key: "wellness",
    label: "ai.interestsGroup.wellness",
    interests: [
      {
        key: "spasWellness",
        label: "ai.interestsList.spasWellness",
      },
      {
        key: "paseosTranquilos",
        label: "ai.interestsList.paseosTranquilos",
      },
      {
        key: "cafesLectura",
        label: "ai.interestsList.cafesLectura",
      },
      {
        key: "hotelesBoutique",
        label: "ai.interestsList.hotelesBoutique",
      },
      {
        key: "yogaMeditation",
        label: "ai.interestsList.yogaMeditation",
      },
      {
        key: "thermalBaths",
        label: "ai.interestsList.thermalBaths",
      },
    ],
  },
  {
    key: "premium",
    label: "ai.premiumInterests",
    interests: [
      {
        key: "experienciasGourmet",
        label: "ai.interestsList.experienciasGourmet",
      },
      {
        key: "baresCocteleria",
        label: "ai.interestsList.baresCocteleria",
      },
      {
        key: "rutasCulturales",
        label: "ai.interestsList.rutasCulturales",
      },
      {
        key: "atardeceresRomanticos",
        label: "ai.interestsList.atardeceresRomanticos",
      },
      {
        key: "paseosTranquilos",
        label: "ai.interestsList.paseosTranquilos",
      },
      {
        key: "cafesLectura",
        label: "ai.interestsList.cafesLectura",
      },
      {
        key: "galeriasArte",
        label: "ai.interestsList.galeriasArte",
      },
      {
        key: "catasMaridajes",
        label: "ai.interestsList.catasMaridajes",
      },
      {
        key: "talleresCreativos",
        label: "ai.interestsList.talleresCreativos",
      },
      {
        key: "jazzMusica",
        label: "ai.interestsList.jazzMusica",
      },
      {
        key: "hotelesBoutique",
        label: "ai.interestsList.hotelesBoutique",
      },
    ],
  },
];

export default interestCategories;

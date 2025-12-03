export interface AccommodationExpenseCategory {
  id: string;
  key: string;
  icon?: string;
}

export const ACCOMMODATION_EXPENSE_CATEGORIES: AccommodationExpenseCategory[] =
  [
    {
      id: "hotel",
      key: "hotel",
    },
    {
      id: "apartment",
      key: "apartment",
    },
    {
      id: "private_rental",
      key: "private_rental",
    },
    {
      id: "hostel",
      key: "hostel",
    },
    {
      id: "guesthouse",
      key: "guesthouse",
    },
    {
      id: "camping",
      key: "camping",
    },
    {
      id: "campervan",
      key: "campervan",
    },
    {
      id: "resort",
      key: "resort",
    },
    {
      id: "chalet_cabin",
      key: "chalet_cabin",
    },
  ];

export const getAccommodationCategoryKey = (id: string): string => {
  const category = ACCOMMODATION_EXPENSE_CATEGORIES.find(
    (cat) => cat.id === id
  );
  return category ? category.key : id;
};

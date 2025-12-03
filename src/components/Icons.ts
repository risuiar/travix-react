
// Category color mapping (copied from Overview.tsx)
export const categoryColors: Record<string, string> = {
	food: "#ef4444", // red-500
	transportation: "#14b8a6", // teal-500
	transport: "#14b8a6", // teal-500
	accommodation: "#a855f7", // purple-500
	shopping: "#ec4899", // pink-500
	sightseeing: "#ec4899", // pink-500
	guided_tours: "#3b82f6", // blue-500
	cultural: "#f97316", // orange-500
	nature_outdoor: "#10b981", // green-500
	wellness: "#ec4899", // pink-500
	nightlife: "#a855f7", // purple-500
	health: "#22c55e", // green-500
	entertainment: "#fbbf24", // yellow-500
	tickets: "#6366f1", // indigo-500
	other: "#6b7280", // gray-500
};

export function getCategoryHexColor(category: string): string {
	const hexColors: Record<string, string> = {
		food: "#fed7aa", // orange-200
		transportation: "#bfdbfe", // blue-200
		transport: "#bfdbfe", // blue-200
		accommodation: "#ddd6fe", // purple-200
		shopping: "#fbcfe8", // pink-200
		sightseeing: "#fde68a", // yellow-200
		guided_tours: "#bfdbfe", // blue-200
		cultural: "#fed7aa", // orange-200
		nature_outdoor: "#bbf7d0", // green-200
		wellness: "#fbcfe8", // pink-200
		nightlife: "#ddd6fe", // purple-200
		health: "#bbf7d0", // green-200
		entertainment: "#fde68a", // yellow-200
		tickets: "#c7d2fe", // indigo-200
		other: "#d1d5db", // gray-300
	};
	return hexColors[category] || hexColors.other;
}

export function getCategoryIcon(category: string): string {
	const iconMap: Record<string, string> = {
		food: "🍕",
		transportation: "🚗",
		transport: "🚗",
		accommodation: "🛏️",
		shopping: "🛍️",
		sightseeing: "🗺️",
		guided_tours: "👥",
		cultural: "🏛️",
		nature_outdoor: "🌲",
		wellness: "🏥",
		nightlife: "🌙",
		health: "🏥",
		entertainment: "🎬",
		tickets: "🎫",
		other: "💰",
	};
	return iconMap[category] || iconMap.other;
}

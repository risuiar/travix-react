import React from "react";
import { useTheme } from "../hooks/useTheme";
import { CategoryBadge } from "./CategoryBadge";

interface MapInfoCardProps {
  title: string;
  address?: string | null;
  rating?: number | null;
  reviews_count?: string | number | null;
  date?: string | null;
  time?: string | null;
  priority?: string | null;
  cost?: number | null;
  description?: string | null;
  url?: string | null;
  category?: string | null;
  place_id?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export const MapInfoCard: React.FC<MapInfoCardProps> = ({
  title,
  address,
  rating,
  reviews_count,
  date,
  time,
  priority,
  cost,
  description,
  url,
  category,
  place_id,
  lat,
  lng,
}) => {
  const { isDarkMode } = useTheme();

  const getPriorityChipStyle = (priority: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 12,
      lineHeight: "1.2",
      whiteSpace: "nowrap",
    };

    switch (priority.toLowerCase()) {
      case "high":
        return {
          ...base,
          background: isDarkMode ? "#dc2626" : "#fee2e2",
          color: isDarkMode ? "#fecaca" : "#dc2626",
        };
      case "medium":
        return {
          ...base,
          background: isDarkMode ? "#ca8a04" : "#fef3c7",
          color: isDarkMode ? "#fde047" : "#ca8a04",
        };
      case "low":
        return {
          ...base,
          background: isDarkMode ? "#16a34a" : "#dcfce7",
          color: isDarkMode ? "#86efac" : "#16a34a",
        };
      default:
        return {
          ...base,
          background: isDarkMode ? "#6b7280" : "#f3f4f6",
          color: isDarkMode ? "#d1d5db" : "#6b7280",
        };
    }
  };

  const cardStyle = {
    maxWidth: 260,
    padding: "8px 12px 12px 12px",
    borderRadius: "8px",
    background: isDarkMode ? "#1f2937" : "#ffffff",
    color: isDarkMode ? "#f9fafb" : "#111827",
    border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
    boxShadow: isDarkMode
      ? "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
      : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  };

  const titleStyle = {
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: isDarkMode ? "#f9fafb" : "#111827",
  };

  const textStyle = {
    margin: "6px 0 0",
    fontSize: "14px",
    color: isDarkMode ? "#d1d5db" : "#374151",
  };

  const linkStyle = {
    display: "inline-block",
    margin: "0 8px 0 0",
    color: isDarkMode ? "#60a5fa" : "#3b82f6",
    textDecoration: "none",
    fontSize: "12px",
  };

  const timeChipStyle = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "999px",
    fontSize: "12px",
    lineHeight: "1.2",
    whiteSpace: "nowrap" as const,
    background: isDarkMode ? "#374151" : "#e5e7eb",
    color: isDarkMode ? "#d1d5db" : "#374151",
  };

  return (
    <div style={cardStyle}>
      {/* Header with title and category */}
      <div style={{ position: "relative", marginBottom: "8px" }}>
        <h3 style={titleStyle}>{title}</h3>

        {/* Category Chip - Top Right */}
        {category && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
            }}
          >
            <CategoryBadge category={category} />
          </div>
        )}
      </div>

      {/* Time and Priority chips */}
      {(time || priority) && (
        <div
          style={{
            display: "flex",
            gap: 6,
            whiteSpace: "nowrap" as const,
            marginBottom: "8px",
          }}
        >
          {time && <span style={timeChipStyle}>{time.slice(0, 5)}</span>}
          {priority && (
            <span style={getPriorityChipStyle(priority)}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {address && <p style={textStyle}>{address}</p>}
      {rating != null && (
        <p style={textStyle}>
          <strong style={{ color: isDarkMode ? "#f9fafb" : "#111827" }}>
            Rating:
          </strong>{" "}
          {rating} ({reviews_count || 0})
        </p>
      )}
      {date && (
        <p style={textStyle}>
          <strong style={{ color: isDarkMode ? "#f9fafb" : "#111827" }}>
            Date:
          </strong>{" "}
          {date}
        </p>
      )}
      {cost != null && (
        <p style={textStyle}>
          <strong style={{ color: isDarkMode ? "#f9fafb" : "#111827" }}>
            Cost:
          </strong>{" "}
          ${cost}
        </p>
      )}
      {description && <p style={textStyle}>{description}</p>}

      {/* Links Section */}
      <div style={{ margin: "8px 0 0" }}>
        {/* URL if available */}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            View Details →
          </a>
        )}

        {/* Open in Google Maps - Always show this */}
        <a
          href={(() => {
            if (place_id) {
              const q = encodeURIComponent(title);
              return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${place_id}`;
            }
            if (lat && lng) {
              return `https://www.google.com/maps?q=${lat},${lng}`;
            }
            return `https://www.google.com/maps?q=${encodeURIComponent(title)}`;
          })()}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...linkStyle,
            color: isDarkMode ? "#93c5fd" : "#2563eb",
          }}
        >
          Abrir en Google Maps →
        </a>
      </div>
    </div>
  );
};

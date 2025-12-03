import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { RouteStep, RouteSummary } from "./CustomRouteControl";

const km = (m: number) => (m / 1000).toFixed(1) + " km";
const min = (s: number) => Math.round(s / 60) + " min";

export default function RouteInstructions({
  summary,
  steps,
  onClear,
  defaultCollapsed = true,
  inline = false,
}: {
  summary?: RouteSummary;
  steps?: RouteStep[];
  onClear?: () => void;
  defaultCollapsed?: boolean;
  inline?: boolean;
}) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);
  if (!summary) return null;

  return (
    <div className={`travix-route-panel${inline ? " inline" : ""}`}>
      <div className="header">
        <div>
          <strong>{km(summary.distance)}</strong> ·{" "}
          <strong>{min(summary.duration)}</strong>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ghost" onClick={() => setCollapsed((c) => !c)}>
            {collapsed
              ? t("map.showDetails", "Ver detalles")
              : t("map.hide", "Ocultar")}
          </button>
          {onClear && (
            <button className="ghost" onClick={onClear}>
              {t("map.clearRoute", "Limpiar ruta")}
            </button>
          )}
        </div>
      </div>
      {!collapsed && (
        <ol className="steps">
          {(steps ?? []).map((s, i) => (
            <li key={i}>
              <div className="text">{s.text}</div>
              <div className="meta">
                {km(s.distance)} · {min(s.time)}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

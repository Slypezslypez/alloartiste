"use client";

import { useMemo, useState } from "react";

const WEEKDAY_LABELS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
const MONTH_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

function toDateKey(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function todayKey() {
  const now = new Date();
  return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Calendrier mensuel réutilisable, trois modes :
 * - editable=true (tableau de bord artiste) : clic sur un jour futur = bascule disponible/indisponible.
 * - pickable=true (formulaire de contact) : clic sur un jour futur ET disponible = le sélectionne comme date
 *   d'événement ; les jours indisponibles ne sont pas cliquables.
 * - par défaut (fiche publique) : affichage seul, pour que l'organisateur voie d'un coup d'œil les dates prises.
 */
export function AvailabilityCalendar({
  unavailableDates,
  editable = false,
  onToggleDate,
  pendingDate,
  pickable = false,
  selectedDate,
  onSelectDate
}: {
  unavailableDates: string[];
  editable?: boolean;
  onToggleDate?: (dateKey: string, isCurrentlyUnavailable: boolean) => void;
  pendingDate?: string | null;
  pickable?: boolean;
  selectedDate?: string | null;
  onSelectDate?: (dateKey: string) => void;
}) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-11

  const unavailableSet = useMemo(() => new Set(unavailableDates), [unavailableDates]);
  const today = todayKey();

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // lundi = 0 ... dimanche = 6

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="availability-calendar">
      <div className="availability-header">
        <button type="button" className="availability-nav" onClick={goPrevMonth} aria-label="Mois précédent">
          ‹
        </button>
        <span className="availability-month-label mono">
          {MONTH_LABELS[viewMonth]} {viewYear}
        </span>
        <button type="button" className="availability-nav" onClick={goNextMonth} aria-label="Mois suivant">
          ›
        </button>
      </div>

      <div className="availability-weekdays">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w} className="availability-weekday mono">
            {w}
          </span>
        ))}
      </div>

      <div className="availability-grid">
        {cells.map((day, idx) => {
          if (day === null) return <span key={`empty-${idx}`} className="availability-day empty" />;
          const key = toDateKey(viewYear, viewMonth, day);
          const isPast = key < today;
          const isToday = key === today;
          const isUnavailable = unavailableSet.has(key);
          const isSelected = pickable && selectedDate === key;
          const classes = ["availability-day"];
          if (isUnavailable) classes.push("unavailable");
          if (isPast) classes.push("past");
          if (isToday) classes.push("today");
          if (isSelected) classes.push("selected");

          if (editable && !isPast) {
            classes.push("clickable");
            return (
              <button
                key={key}
                type="button"
                className={classes.join(" ")}
                onClick={() => onToggleDate?.(key, isUnavailable)}
                disabled={pendingDate === key}
                title={isUnavailable ? "Cliquer pour rendre disponible" : "Cliquer pour bloquer cette date"}
              >
                <span className="availability-day-num">{day}</span>
              </button>
            );
          }

          if (pickable && !isPast && !isUnavailable) {
            classes.push("clickable");
            return (
              <button
                key={key}
                type="button"
                className={classes.join(" ")}
                onClick={() => onSelectDate?.(key)}
                title="Choisir cette date"
              >
                <span className="availability-day-num">{day}</span>
              </button>
            );
          }

          return (
            <span key={key} className={classes.join(" ")} title={pickable && isUnavailable ? "Artiste indisponible ce jour-là" : undefined}>
              <span className="availability-day-num">{day}</span>
            </span>
          );
        })}
      </div>

      <div className="availability-legend">
        <span className="availability-legend-item">
          <span className="availability-dot available" /> Disponible
        </span>
        <span className="availability-legend-item">
          <span className="availability-dot unavailable" /> Indisponible
        </span>
      </div>
    </div>
  );
}

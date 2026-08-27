import { dayOfMonthLabel, weekdayLabel } from "../../utils/deviceDays";

/**
 * The 7-day chip strip. Days are `YYYY-MM-DD` in the device's timezone.
 *
 * `selected` of null means "the whole window"; tapping the active chip clears
 * back to that, so there is always a way out of a filtered view.
 */

type DayStripProps = {
  days: string[];
  selected: string | null;
  onSelect: (day: string | null) => void;
  /** Rendered with a marker, regardless of what is selected. */
  today?: string;
  /**
   * Days to mark with a dot. Omit entirely where every day has data and a dot
   * would tell the guardian nothing — see the location history.
   */
  markedDays?: Set<string>;
  accent?: "alert" | "location";
};

function DayStrip({
  days,
  selected,
  onSelect,
  today,
  markedDays,
  accent = "alert",
}: DayStripProps) {
  return (
    <div className={`day-strip accent-${accent}`}>
      {days.map((day) => {
        const isActive = day === selected;
        return (
          <button
            key={day}
            type="button"
            className={`day-chip${isActive ? " active" : ""}${
              day === today ? " today" : ""
            }`}
            onClick={() => onSelect(isActive ? null : day)}
            aria-pressed={isActive}
          >
            <span className="day-chip-weekday">{weekdayLabel(day)}</span>
            <span className="day-chip-date">{dayOfMonthLabel(day)}</span>
            {markedDays && (
              <span
                className={`day-chip-dot${
                  markedDays.has(day) ? " marked" : ""
                }`}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default DayStrip;

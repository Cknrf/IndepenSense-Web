/**
 * The live/history switch used by the Alerts and Location screens.
 *
 * Shared so the two screens can't drift apart visually — they are the same
 * control performing the same job.
 */

export type ViewTab<T extends string> = {
  value: T;
  label: string;
};

type ViewTabsProps<T extends string> = {
  tabs: ViewTab<T>[];
  active: T;
  onChange: (value: T) => void;
  label: string;
  /** Drives the active-tab accent. */
  accent?: "alert" | "location";
};

function ViewTabs<T extends string>({
  tabs,
  active,
  onChange,
  label,
  accent = "alert",
}: ViewTabsProps<T>) {
  return (
    <div className={`view-tabs accent-${accent}`} role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={active === tab.value}
          className={`view-tab${active === tab.value ? " active" : ""}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default ViewTabs;

type BackButtonProps = {
  onBack: () => void;
  label?: string;
};

/**
 * The chevron that returns to the previous step of a multi-step flow.
 *
 * A real <button> rather than a clickable <div>, so it is reachable by keyboard
 * and announced as a control.
 */
function BackButton({ onBack, label = "Go back" }: BackButtonProps) {
  return (
    <button
      type="button"
      className="back-button-container"
      onClick={onBack}
      aria-label={label}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="0.5em"
        height="1em"
        viewBox="0 0 12 24"
      >
        <path d="M0 0h12v24H0z" fill="none" />
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="m3.343 12l7.071 7.071L9 20.485l-7.778-7.778a1 1 0 0 1 0-1.414L9 3.515l1.414 1.414z"
        />
      </svg>
    </button>
  );
}

export default BackButton;

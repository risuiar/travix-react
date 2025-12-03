/**
 * Prevents number input from changing value on scroll
 * @param e Wheel event
 */
export const preventNumberInputScroll = (e: React.WheelEvent<HTMLInputElement>) => {
  e.currentTarget.blur();
};

/**
 * Handles number input to prevent scroll changes and adds selection on focus
 * @param value Current value
 * @param onChange Change handler
 * @returns Object with event handlers
 */
export const createNumberInputHandlers = (
  value: string | number,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
) => ({
  value,
  onChange,
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
  onWheel: preventNumberInputScroll,
});

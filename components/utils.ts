// Source: https://github.com/facebook/react-native/blob/0e03adcc79f9dddef602e9057c14f1b4e2963ca3/packages/virtualized-lists/Lists/ViewabilityHelper.js
export function isViewable(
  //viewAreaMode: boolean,
  viewablePercentThreshold: number,
  top: number,
  bottom: number,
  viewportHeight: number,
  itemLength: number
): boolean {
  if (isEntirelyVisible(top, bottom, viewportHeight)) {
    return true;
  }

  const pixels = getPixelsVisible(top, bottom, viewportHeight);
  //const percent = 100 * (viewAreaMode ? pixels / viewportHeight : pixels / itemLength);
  const percent = (100 * pixels) / itemLength;
  return percent >= viewablePercentThreshold;
}

export function isEntirelyVisible(
  top: number,
  bottom: number,
  viewportHeight: number
): boolean {
  return top >= 0 && bottom <= viewportHeight && bottom > top;
}

export function getPixelsVisible(
  top: number,
  bottom: number,
  viewportHeight: number
): number {
  const visibleHeight = Math.min(bottom, viewportHeight) - Math.max(top, 0);
  return Math.max(0, visibleHeight);
}

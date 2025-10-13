export interface DOMRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewabilityTriggers {
  updateViewability: () => void;
}

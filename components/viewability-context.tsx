import * as React from "react";
import { View } from "react-native";
import { Coords } from "./types";
import { isViewable } from "./utils";

export const ViewabilityContext = React.createContext<
  React.RefObject<ViewabilityCoordinator> | undefined
>(undefined);

export function useViewabilityCoordinator() {
  const context = React.useContext(ViewabilityContext);
  if (!context) {
    throw new Error(
      "useViewabilityContext must be used within a ViewabilityContext"
    );
  }
  return context.current;
}

interface RootEntry {
  clientRect: Coords;
}

interface ViewEntry {
  isVisible: boolean;
  clientRect: Coords;
  onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>;
}

export class ViewabilityCoordinator {
  private readonly views: Map<View, ViewEntry> = new Map();
  private root: View | null = null;
  private rootEntry: RootEntry = {
    clientRect: { x: 0, y: 0, width: 0, height: 0 },
  };

  registerRoot(root: View) {
    this.root = root;
    log("⚙️  registerRoot");
    this.updateRoot();
  }

  registerView(
    view: View,
    onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>
  ) {
    log("⚙️  registerView");
    this.views.set(view, {
      isVisible: false,
      onVisibilityChangeRef,
      clientRect: { x: 0, y: 0, width: 0, height: 0 },
    });

    this.updateView(view);
  }

  unregisterView(view: View) {
    this.views.delete(view);
  }

  updateView(view: View) {
    if (!this.root) {
      return;
    }

    const viewEntry = this.views.get(view)!;
    // @ts-ignore missing type info
    viewEntry.clientRect = getBoundingClientRect(view);
    //log("⚙️  updateView", totalDuration);
    this.updateViewVisibility(viewEntry);
  }

  updateRoot() {
    if (!this.root) {
      return;
    }

    this.rootEntry.clientRect = getBoundingClientRect(this.root!);
    log("⚙️  updateRoot", totalDuration);
    for (const view of this.views.keys()) {
      this.updateView(view);
    }
  }

  updateRootScroll() {
    log("⚙️  updateRootScroll");
    for (const view of this.views.keys()) {
      this.updateView(view);
    }
  }

  updateViewVisibility(viewEntry: ViewEntry) {
    const isVisible = isViewable(
      50,
      viewEntry.clientRect.y - this.rootEntry.clientRect.y,
      viewEntry.clientRect.y +
        viewEntry.clientRect.height -
        this.rootEntry.clientRect.y,
      this.rootEntry.clientRect.height,
      viewEntry.clientRect.height
    );

    if (viewEntry.isVisible !== isVisible) {
      log("⚙️  CALL: onVisibilityChange", isVisible);
      viewEntry.isVisible = isVisible;
      viewEntry.onVisibilityChangeRef.current(isVisible);
    }
  }
}

let totalDuration = 0;

function getBoundingClientRect(view: View): Coords {
  const ts0 = performance.now();
  // @ts-ignore missing type info
  const coords = view.unstable_getBoundingClientRect();
  const ts1 = performance.now();
  totalDuration += ts1 - ts0;

  return coords;
}

const tsEpoch = performance.now();

function log(message: string, ...args: unknown[]) {
  const ts = (performance.now() - tsEpoch) / 1000;
  console.log(`${ts.toFixed(3)}: ${message}`, ...args);
}

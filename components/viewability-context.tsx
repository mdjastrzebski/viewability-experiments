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
    // @ts-ignore missing type info
    this.rootEntry.clientRect = getBoundingClientRect(root);
    console.log("Coordinator - registerRoot", this.rootEntry);
  }

  registerView(
    view: View,
    onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>
  ) {
    console.log("Coordinator - registerView", view?.props?.testID);
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
    const viewEntry = this.views.get(view)!;
    // @ts-ignore missing type info
    viewEntry.clientRect = getBoundingClientRect(view);
    console.log("Coordinator - updateView", totalDuration, viewEntry);
    this.updateViewVisibility(viewEntry);
  }

  updateRoot() {
    if (!this.root) {
      return;
    }

    this.rootEntry.clientRect = getBoundingClientRect(this.root!);
    console.log(
      "Coordinator - updateRootScroll",
      totalDuration,
      this.rootEntry
    );
    for (const view of this.views.keys()) {
      this.updateView(view);
    }
  }

  updateRootScroll() {
    console.log("Coordinator - updateRootScroll");
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
      console.log("Coordinator - updateViewVisibility - detected", viewEntry);
      viewEntry.isVisible = isVisible;
      viewEntry.onVisibilityChangeRef.current(isVisible);
    } else {
      console.log("Coordinator - updateViewVisibility - noop", viewEntry);
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

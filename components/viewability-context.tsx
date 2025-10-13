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

interface ViewEntry {
  isVisible: boolean;
  onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>;
}

export class ViewabilityCoordinator {
  private readonly views: Map<View, ViewEntry> = new Map();
  private root: View | null = null;
  private rootRect: Coords = { x: 0, y: 0, width: 0, height: 0 };

  registerRoot(root: View) {
    this.root = root;
    this.updateAllViews();
  }

  registerView(
    view: View,
    onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>
  ) {
    console.log("Coordinator - registerView", view?.props?.testID);
    this.views.set(view, {
      isVisible: false,
      onVisibilityChangeRef,
    });

    this.updateView(view);
  }

  unregisterView(view: View) {
    this.views.delete(view);
  }

  updateView(view: View) {
    const viewRect = getBoundingClientRect(view);
    const isVisible = isViewable(
      50,
      viewRect.y - this.rootRect.y,
      viewRect.y + viewRect.height - this.rootRect.y,
      this.rootRect.height,
      viewRect.height
    );

    const viewEntry = this.views.get(view)!;
    if (viewEntry.isVisible !== isVisible) {
      console.log(
        "Coordinator - updateViewVisibility - detected",
        viewRect,
        viewEntry
      );
      viewEntry.isVisible = isVisible;
      viewEntry.onVisibilityChangeRef.current(isVisible);
    } else {
      console.log(
        "Coordinator - updateViewVisibility - noop",
        viewRect,
        viewEntry
      );
    }
  }

  updateAllViews() {
    if (!this.root) {
      return;
    }

    this.rootRect = getBoundingClientRect(this.root);

    console.log("Coordinator - updateRootScroll");
    for (const view of this.views.keys()) {
      this.updateView(view);
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

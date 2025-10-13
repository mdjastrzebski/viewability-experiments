import { throttle } from "es-toolkit/compat";
import * as React from "react";
import { View } from "react-native";
import { DOMRect } from "./types";
import { isViewable } from "./utils";

const THROTTLE_DELAY = 100;

export interface ViewabilityConfig {
  onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>;
  viewablePercentThreshold?: number;
}

interface ViewEntry {
  isVisible: boolean;
  onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>;
  viewablePercentThreshold?: number;
}

export class ViewabilityCoordinator {
  private readonly views: Map<View, ViewEntry> = new Map();
  private root: View | null = null;
  private rootRect: DOMRect = { x: 0, y: 0, width: 0, height: 0 };

  registerRoot(root: View) {
    console.log("🍓 Coordinator - registerRoot");
    this.root = root;
    this.updateAllViews();
  }

  registerView(view: View, config: ViewabilityConfig) {
    console.log("🍏 Coordinator - registerView");
    this.views.set(view, {
      isVisible: false,
      onVisibilityChangeRef: config.onVisibilityChangeRef,
      viewablePercentThreshold: config.viewablePercentThreshold,
    });

    this.updateView(view);
  }

  unregisterView(view: View) {
    console.log("🍏 Coordinator - unregisterView");
    this.views.delete(view);
  }

  updateView(view: View | null) {
    if (!this.root || !view) {
      return;
    }

    const viewEntry = this.views.get(view);
    if (!viewEntry) {
      return;
    }

    console.log("🍏 Coordinator - updateView");

    const viewRect = getBoundingClientRect(view);
    const isVisible = isViewable(
      viewEntry.viewablePercentThreshold ?? 100,
      viewRect.y - this.rootRect.y,
      viewRect.y + viewRect.height - this.rootRect.y,
      this.rootRect.height,
      viewRect.height
    );

    if (viewEntry.isVisible !== isVisible) {
      console.log(
        "🌀 Coordinator - updateViewVisibility - detected",
        viewRect,
        viewEntry
      );
      viewEntry.isVisible = isVisible;
      viewEntry.onVisibilityChangeRef.current(isVisible);
    }
  }

  // Note: has to be `throttle` from `es-toolkit/compat` because of https://github.com/toss/es-toolkit/issues/1212
  updateAllViews = throttle(() => this._updateAllViews(), THROTTLE_DELAY, {
    leading: false,
    trailing: true,
  });

  _updateAllViews() {
    if (!this.root) {
      return;
    }

    this.rootRect = getBoundingClientRect(this.root);

    console.log("🍓 Coordinator - updateAllViews START");
    totalDuration = 0;

    for (const view of this.views.keys()) {
      this.updateView(view);
    }

    console.log("🍓 Coordinator - updateAllViews END", totalDuration);
  }
}

let totalDuration = 0;

function getBoundingClientRect(view: View): DOMRect {
  const ts0 = performance.now();

  const coords =
    // @ts-ignore missing type info
    view.getBoundingClientRect?.() ?? view.unstable_getBoundingClientRect?.();
  if (!coords) {
    throw new Error("Unable to call (unstable_)getBoundingClientRect");
  }

  const ts1 = performance.now();
  totalDuration += ts1 - ts0;

  return coords;
}

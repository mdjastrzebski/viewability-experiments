import { throttle } from "es-toolkit/compat";
import * as React from "react";
import { View } from "react-native";
import { DOMRect } from "./types";
import { isViewable } from "./utils";

const THROTTLE_DELAY = 100;

interface ViewEntry {
  isVisible: boolean;
  onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>;
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

  registerView(
    view: View,
    onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>,
    id?: string
  ) {
    console.log("🍏 Coordinator - registerView", id);
    this.views.set(view, {
      isVisible: false,
      onVisibilityChangeRef,
    });

    this.updateView(view);
  }

  unregisterView(view: View) {
    console.log("🍏 Coordinator - unregisterView");
    this.views.delete(view);
  }

  updateView(view: View) {
    if (!this.root) {
      return;
    }

    const viewEntry = this.views.get(view);
    if (!viewEntry) {
      return;
    }

    console.log("🍏 Coordinator - updateView");

    const viewRect = getBoundingClientRect(view);
    const isVisible = isViewable(
      50,
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
  // @ts-ignore missing type info
  const coords = view.unstable_getBoundingClientRect();
  const ts1 = performance.now();
  totalDuration += ts1 - ts0;

  return coords;
}

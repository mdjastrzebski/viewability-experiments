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
  measureInWindow: Coords;
}

interface ViewEntry {
  isVisible: boolean;
  measureInWindow: Coords;
  onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>;
}

export class ViewabilityCoordinator {
  private readonly views: Map<View, ViewEntry> = new Map();
  private root: View | null = null;
  private rootEntry: RootEntry = {
    measureInWindow: { x: 0, y: 0, width: 0, height: 0 },
  };

  registerRoot(root: View) {
    console.log("Coordinator - registerRoot");
    this.root = root;
    root.measureInWindow((x, y, width, height) => {
      console.log("Coordinator - registerRoot - measureInWindow", {
        x,
        y,
        width,
        height,
      });
      this.rootEntry.measureInWindow = { x, y, width, height };
    });
  }

  registerView(
    view: View,
    onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>
  ) {
    console.log("Coordinator - registerView", view?.props?.testID);
    this.views.set(view, {
      isVisible: false,
      onVisibilityChangeRef,
      measureInWindow: { x: 0, y: 0, width: 0, height: 0 },
    });

    this.updateView(view);
  }

  unregisterView(view: View) {
    this.views.delete(view);
  }

  updateView(view: View) {
    console.log("Coordinator - updateView", view?.props?.testID);
    view.measureInWindow((x, y, width, height) => {
      console.log("Coordinator - updateView - measureInWindow", {
        x,
        y,
        width,
        height,
      });
      const viewEntry = this.views.get(view)!;
      viewEntry.measureInWindow = { x, y, width, height };

      this.updateViewVisibility(viewEntry);
    });
  }

  updateRoot() {
    console.log("Coordinator - updateRoot");
    this.root!.measureInWindow((x, y, width, height) => {
      console.log("Coordinator - updateRoot - measureInWindow", {
        x,
        y,
        width,
        height,
      });
      this.rootEntry.measureInWindow = { x, y, width, height };

      for (const view of this.views.keys()) {
        this.updateView(view);
      }
    });
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
      viewEntry.measureInWindow.y - this.rootEntry.measureInWindow.y,
      viewEntry.measureInWindow.y +
        viewEntry.measureInWindow.height -
        this.rootEntry.measureInWindow.y,
      this.rootEntry.measureInWindow.height,
      viewEntry.measureInWindow.height
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

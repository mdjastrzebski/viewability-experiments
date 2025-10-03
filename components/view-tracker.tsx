import * as React from "react";
import { LayoutChangeEvent, View } from "react-native";
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

export interface ViewabilityRootProps {
  children: (coordinator: ViewabilityCoordinator) => React.ReactNode;
}

export function ViewabilityRoot({ children }: ViewabilityRootProps) {
  const rootRef = React.useRef<View | null>(null);
  const coordinatorRef = React.useRef<ViewabilityCoordinator>(
    new ViewabilityCoordinator()
  );

  React.useLayoutEffect(() => {
    const root = rootRef.current!;
    coordinatorRef.current.registerRoot(root);
  }, []);

  return (
    <ViewabilityContext.Provider value={coordinatorRef}>
      <View ref={rootRef}>{children(coordinatorRef.current)}</View>
    </ViewabilityContext.Provider>
  );
}

interface Coords {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RootEntry {
  measureInWindow: Coords;
}

interface ViewEntry {
  isVisible: boolean;
  measureInWindow: Coords;
  onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>;
}

class ViewabilityCoordinator {
  private readonly views: Map<View, ViewEntry> = new Map();
  private root: View | null = null;
  private rootEntry: RootEntry = {
    measureInWindow: { x: 0, y: 0, width: 0, height: 0 },
  };

  registerRoot(root: View) {
    console.log("registerRoot");
    this.root = root;
    root.measureInWindow((x, y, width, height) => {
      console.log("registerRoot - measureInWindow", { x, y, width, height });
      this.rootEntry.measureInWindow = { x, y, width, height };
    });
  }

  registerView(
    view: View,
    onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>
  ) {
    console.log("registerView", view?.props?.testID);
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
    console.log("updateView", view?.props?.testID);
    view.measureInWindow((x, y, width, height) => {
      console.log("updateView - measureInWindow", { x, y, width, height });
      const viewEntry = this.views.get(view)!;
      viewEntry.measureInWindow = { x, y, width, height };

      this.updateViewVisibility(viewEntry);
    });
  }

  updateRoot() {
    console.log("updateRoot");
    this.root!.measureInWindow((x, y, width, height) => {
      console.log("updateRoot - measureInWindow", { x, y, width, height });
      this.rootEntry.measureInWindow = { x, y, width, height };

      for (const viewEntry of this.views.values()) {
        this.updateViewVisibility(viewEntry);
      }
    });
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
      console.log("updateViewVisibility - detected", viewEntry);
      viewEntry.isVisible = isVisible;
      viewEntry.onVisibilityChangeRef.current(isVisible);
    } else {
      console.log("updateViewVisibility - noop", viewEntry);
    }
  }
}

export interface ViewTrackerProps {
  children: React.ReactNode;
  onVisibilityChange: (isVisible: boolean) => void;
  testID?: string;
}

export function ViewTracker({
  children,
  onVisibilityChange,
  testID,
}: ViewTrackerProps) {
  const ref = React.useRef<View | null>(null);
  const latestVisibilityChangeRef =
    React.useRef<typeof onVisibilityChange>(onVisibilityChange);
  const coordinator = useViewabilityCoordinator();

  const testIdRef = React.useRef(testID);

  React.useLayoutEffect(() => {
    console.log("ViewTracker - useLayoutEffect", testIdRef.current);
    latestVisibilityChangeRef.current = onVisibilityChange;
  }, [onVisibilityChange]);

  React.useLayoutEffect(() => {
    const testID = testIdRef.current;

    console.log("ViewTracker - useLayoutEffect register", testID);
    const view = ref.current!;
    coordinator.registerView(view, latestVisibilityChangeRef);

    return () => {
      console.log("ViewTracker - useLayoutEffect unregister", testID);
      coordinator.unregisterView(view);
    };
  }, [coordinator]);

  const handleLayout = (_event: LayoutChangeEvent) => {
    console.log("ViewTracker - handleLayout", testID);
    const view = ref.current!;
    coordinator.updateView(view);
  };

  console.log("ViewTracker - render", testID);
  return (
    <View ref={ref} testID={testID} onLayout={handleLayout}>
      {children}
    </View>
  );
}

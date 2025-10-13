import * as React from "react";
import { View } from "react-native";
import { ViewabilityTriggers } from "./types";
import { ViewabilityCoordinator } from "./viewability-coordinator";

const ViewabilityRootContext = React.createContext<
  ViewabilityCoordinator | undefined
>(undefined);

export interface ViewabilityRootProps {
  children: (triggers: ViewabilityTriggers) => React.ReactNode;
}

export function ViewabilityRoot({ children }: ViewabilityRootProps) {
  const rootRef = React.useRef<View | null>(null);
  const coordinatorRef = React.useRef<ViewabilityCoordinator>(
    new ViewabilityCoordinator()
  );

  React.useLayoutEffect(() => {
    coordinatorRef.current.registerRoot(rootRef.current!);
  }, []);

  const childProps: ViewabilityTriggers = React.useMemo(
    () => ({
      updateViewability: () => coordinatorRef.current.updateAllViews(),
    }),
    []
  );

  return (
    <ViewabilityRootContext.Provider value={coordinatorRef.current}>
      <View ref={rootRef}>
        {typeof children === "function" ? children(childProps) : children}
      </View>
    </ViewabilityRootContext.Provider>
  );
}

export function useViewabilityTriggers(): ViewabilityTriggers {
  const context = React.useContext(ViewabilityRootContext);
  if (!context) {
    throw new Error(
      "useViewabilityTriggers must be used within a ViewabilityRoot"
    );
  }

  return React.useMemo(
    () => ({
      updateViewability: () => context.updateAllViews(),
    }),
    [context]
  );
}

export function useViewabilityTracker() {
  const context = React.useContext(ViewabilityRootContext);
  if (!context) {
    throw new Error(
      "useViewabilityTracker must be used within a ViewabilityRoot"
    );
  }

  return React.useMemo(
    () => ({
      registerView: (
        view: View,
        onVisibilityChangeRef: React.RefObject<(isVisible: boolean) => void>
      ) => context.registerView(view, onVisibilityChangeRef),
      unregisterView: (view: View) => context.unregisterView(view),
      updateView: (view: View) => context.updateView(view),
    }),
    [context]
  );
}

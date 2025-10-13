import * as React from "react";
import { View } from "react-native";
import { ViewabilityTriggers } from "./types";
import {
  ViewabilityConfig,
  ViewabilityCoordinator,
} from "./viewability-coordinator";

const ViewabilityRootContext = React.createContext<
  ViewabilityCoordinator | undefined
>(undefined);

export interface ViewabilityRootProps {
  children:
    | React.ReactNode
    | ((triggers: ViewabilityTriggers) => React.ReactNode);
}

export function ViewabilityRoot({ children }: ViewabilityRootProps) {
  const rootRef = React.useRef<View | null>(null);
  const coordinatorRef = React.useRef<ViewabilityCoordinator>(
    new ViewabilityCoordinator()
  );

  React.useLayoutEffect(() => {
    if (!rootRef.current) {
      return;
    }

    coordinatorRef.current.registerRoot(rootRef.current);
  }, []);

  const childProps: ViewabilityTriggers = React.useMemo(
    () => ({
      updateViewability: () => coordinatorRef.current.updateAllViews(),
    }),
    []
  );

  return (
    <ViewabilityRootContext.Provider value={coordinatorRef.current}>
      <View
        ref={rootRef}
        onLayout={() => coordinatorRef.current.updateAllViews()}
      >
        {typeof children === "function" ? children(childProps) : children}
      </View>
    </ViewabilityRootContext.Provider>
  );
}

export function useViewabilityTriggers(): ViewabilityTriggers {
  const context = React.useContext(ViewabilityRootContext);

  return React.useMemo(
    () => ({
      updateViewability: () => context?.updateAllViews(),
    }),
    [context]
  );
}

export function useViewabilityTracker() {
  const context = React.useContext(ViewabilityRootContext);

  return React.useMemo(
    () =>
      context
        ? {
            registerView: (view: View, config: ViewabilityConfig) =>
              context.registerView(view, config),
            unregisterView: (view: View) => context.unregisterView(view),
            updateView: (view: View | null) => context.updateView(view),
          }
        : null,
    [context]
  );
}

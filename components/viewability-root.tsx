import * as React from "react";
import { View } from "react-native";
import {
  ViewabilityContext,
  ViewabilityCoordinator,
} from "./viewability-context";

export interface ViewabilityRootProps {
  children: (coordinator: ViewabilityCoordinator) => React.ReactNode;
}

export function ViewabilityRoot({ children }: ViewabilityRootProps) {
  const rootRef = React.useRef<View | null>(null);
  const coordinatorRef = React.useRef<ViewabilityCoordinator>(
    new ViewabilityCoordinator()
  );

  React.useLayoutEffect(() => {
    console.log("Root - useLayoutEffect");
    const root = rootRef.current!;
    coordinatorRef.current.registerRoot(root);
  }, []);

  console.log("Root - render");
  return (
    <ViewabilityContext.Provider value={coordinatorRef}>
      <View ref={rootRef}>{children(coordinatorRef.current)}</View>
    </ViewabilityContext.Provider>
  );
}

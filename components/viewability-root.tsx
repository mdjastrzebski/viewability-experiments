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
    const root = rootRef.current!;
    console.log("🧬 Root - register");
    coordinatorRef.current.registerRoot(root);
  }, []);

  console.log("🧬 Root render");
  return (
    <ViewabilityContext.Provider value={coordinatorRef}>
      <View ref={rootRef}>{children(coordinatorRef.current)}</View>
    </ViewabilityContext.Provider>
  );
}

import * as React from "react";
import { LayoutChangeEvent, View } from "react-native";
import { useViewabilityCoordinator } from "./viewability-context";

export interface ViewabilityTrackerProps {
  children: React.ReactNode;
  onVisibilityChange: (isVisible: boolean) => void;
  testID?: string;
}

export function ViewabilityTracker({
  children,
  onVisibilityChange,
  testID,
}: ViewabilityTrackerProps) {
  const ref = React.useRef<View | null>(null);
  const latestVisibilityChangeRef =
    React.useRef<typeof onVisibilityChange>(onVisibilityChange);
  const coordinator = useViewabilityCoordinator();

  const testIdRef = React.useRef(testID);

  React.useLayoutEffect(() => {
    latestVisibilityChangeRef.current = onVisibilityChange;
  }, [onVisibilityChange]);

  React.useLayoutEffect(() => {
    const testID = testIdRef.current;

    console.log("🧬 Tracker - register", testID);
    const view = ref.current!;
    coordinator.registerView(view, latestVisibilityChangeRef);

    return () => {
      console.log("🧬Tracker - unregister", testID);
      coordinator.unregisterView(view);
    };
  }, [coordinator]);

  const handleLayout = (_event: LayoutChangeEvent) => {
    console.log("🧬 Tracker - handleLayout", testID);
    const view = ref.current!;
    coordinator.updateView(view);
  };

  console.log("🧬 Tracker - render", testID);
  return (
    <View ref={ref} testID={testID} onLayout={handleLayout}>
      {children}
    </View>
  );
}

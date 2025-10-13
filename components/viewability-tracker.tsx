import * as React from "react";
import { LayoutChangeEvent, View } from "react-native";
import { useViewabilityTracker } from "./viewability-root";

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
  const tracker = useViewabilityTracker();

  const testIdRef = React.useRef(testID);

  React.useLayoutEffect(() => {
    latestVisibilityChangeRef.current = onVisibilityChange;
  }, [onVisibilityChange]);

  React.useLayoutEffect(() => {
    const testID = testIdRef.current;

    console.log("VTracker - useLayoutEffect register", testID);
    const view = ref.current!;
    tracker.registerView(view, latestVisibilityChangeRef, testID);

    return () => {
      console.log("VTracker - useLayoutEffect unregister", testID);
      tracker.unregisterView(view);
    };
  }, [tracker]);

  const handleLayout = (_event: LayoutChangeEvent) => {
    console.log("VTracker - handleLayout", testID);
    tracker.updateView(ref.current!);
  };

  console.log("VTracker - render", testID);
  return (
    <View ref={ref} testID={testID} onLayout={handleLayout}>
      {children}
    </View>
  );
}

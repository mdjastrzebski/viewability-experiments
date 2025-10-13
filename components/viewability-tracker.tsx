import * as React from "react";
import { View } from "react-native";
import { useViewabilityTracker } from "./viewability-root";

export interface ViewabilityTrackerProps {
  children: React.ReactNode;
  onVisibilityChange: (isVisible: boolean) => void;
}

export function ViewabilityTracker({
  children,
  onVisibilityChange,
}: ViewabilityTrackerProps) {
  const ref = React.useRef<View | null>(null);
  const latestVisibilityChangeRef =
    React.useRef<typeof onVisibilityChange>(onVisibilityChange);
  const tracker = useViewabilityTracker();

  React.useLayoutEffect(() => {
    latestVisibilityChangeRef.current = onVisibilityChange;
  }, [onVisibilityChange]);

  React.useLayoutEffect(() => {
    const view = ref.current!;
    tracker.registerView(view, latestVisibilityChangeRef);
    return () => tracker.unregisterView(view);
  }, [tracker]);

  return (
    <View ref={ref} onLayout={() => tracker.updateView(ref.current!)}>
      {children}
    </View>
  );
}

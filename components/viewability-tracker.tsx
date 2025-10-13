import * as React from "react";
import { View } from "react-native";
import { useViewabilityTracker } from "./viewability-root";

export interface ViewabilityTrackerProps {
  children: React.ReactNode;
  onVisibilityChange: (isVisible: boolean) => void;
  enabled?: boolean;
  viewablePercentThreshold?: number;
}

export function ViewabilityTracker({
  children,
  onVisibilityChange,
  enabled = true,
  viewablePercentThreshold = 50,
}: ViewabilityTrackerProps) {
  const ref = React.useRef<View | null>(null);
  const onVisibilityChangeRef =
    React.useRef<typeof onVisibilityChange>(onVisibilityChange);
  const tracker = useViewabilityTracker();

  React.useLayoutEffect(() => {
    onVisibilityChangeRef.current = onVisibilityChange;
  }, [onVisibilityChange]);

  React.useLayoutEffect(() => {
    const view = ref.current;
    if (!view || !enabled || !tracker) {
      return;
    }

    tracker.registerView(view, {
      onVisibilityChangeRef,
      viewablePercentThreshold,
    });
    return () => tracker.unregisterView(view);
  }, [tracker, enabled, viewablePercentThreshold]);

  return (
    <View ref={ref} onLayout={() => tracker?.updateView(ref.current)}>
      {children}
    </View>
  );
}

import * as React from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScaledSize,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const data = Array.from({ length: 100 }, (_, index) => index);

interface ViewablityState {
  windowDimensions: ScaledSize;
  viewportRect: Measure | null;
  extraData: unknown;
}

const ViewablityContext = React.createContext<ViewablityState | undefined>(
  undefined
);

const useViewablity = () => {
  const context = React.useContext(ViewablityContext);
  if (!context) {
    throw new Error("useViewablity must be used within a ViewablityProvider");
  }

  return context;
};

export default function Index() {
  const viewportRef = React.useRef<View>(null);

  const windowDimensions = useWindowDimensions();
  const [viewportRect, setViewportRect] = React.useState<Measure | null>(null);
  const [extraData, setExtraData] = React.useState({});

  const viewability = React.useMemo(() => {
    console.log("👆 Viewability", windowDimensions, viewportRect);
    return {
      windowDimensions,
      viewportRect,
      extraData,
    };
  }, [windowDimensions, viewportRect, extraData]);

  React.useLayoutEffect(() => {
    if (!viewportRef.current) {
      return;
    }
    viewportRef.current.measureInWindow((x, y, width, height) => {
      console.log("Viewport Measure", { x, y, width, height });
      setViewportRect({ x, y, width, height });
    });
  }, []);

  const renderItem = ({ item }: { item: number }) => {
    return <Item key={item} title={item.toString()} />;
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    console.log("👆 Done Layout", event.nativeEvent.layout, windowDimensions);
    setExtraData({});
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    console.log("👆 Done Scroll", event.nativeEvent, windowDimensions);
    setExtraData({});
  };

  return (
    <ViewablityContext.Provider value={viewability}>
      <View ref={viewportRef} onLayout={handleLayout}>
        <ScrollView onScroll={handleScroll}>
          {data.map((item) => renderItem({ item }))}
        </ScrollView>
      </View>
    </ViewablityContext.Provider>
  );
}

interface ItemProps {
  title: string;
}

function Item({ title }: ItemProps) {
  const ref = React.useRef<Text>(null);

  const { windowDimensions, viewportRect } = useViewablity();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.measureInWindow((x, y, width, height) => {
      console.log(
        "MeasureInWindow",
        title,
        "-",
        { x, y, width, height },
        viewportRect
      );
      const visible = viewportRect
        ? isViewable(
            false,
            50,
            y - viewportRect.y,
            y + height - viewportRect.y,
            viewportRect.height,
            height
          )
        : false;

      setIsVisible(visible);
      if (visible) {
        console.log("Measure", title, "-", { y, height });
      }
    });
    // ref.current.measureInWindow((x, y, width, height) => {
    //   console.log("MeasureInWindow", title, "-", { x, y, width, height });
    // });
  });

  const [, forceUpdate] = React.useState({});

  const handlePress = () => {
    console.log("Press", title);
    forceUpdate({});
  };

  return (
    <Text
      ref={ref}
      key={title}
      style={[styles.item, isVisible && styles.visible]}
    >
      {title}
      <Pressable onPressIn={handlePress}>
        <Text>Force Update</Text>
      </Pressable>
    </Text>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 20,
    paddingVertical: 100,
    fontSize: 20,
    backgroundColor: "white",
  },
  visible: {
    backgroundColor: "lightblue",
  },
});

interface Measure {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Source: https://github.com/facebook/react-native/blob/0e03adcc79f9dddef602e9057c14f1b4e2963ca3/packages/virtualized-lists/Lists/ViewabilityHelper.js
function isEntirelyVisible(
  top: number,
  bottom: number,
  viewportHeight: number
): boolean {
  return top >= 0 && bottom <= viewportHeight && bottom > top;
}

function getPixelsVisible(
  top: number,
  bottom: number,
  viewportHeight: number
): number {
  const visibleHeight = Math.min(bottom, viewportHeight) - Math.max(top, 0);
  return Math.max(0, visibleHeight);
}

function isViewable(
  viewAreaMode: boolean,
  viewablePercentThreshold: number,
  top: number,
  bottom: number,
  viewportHeight: number,
  itemLength: number
): boolean {
  if (isEntirelyVisible(top, bottom, viewportHeight)) {
    return true;
  } else {
    const pixels = getPixelsVisible(top, bottom, viewportHeight);
    const percent =
      100 * (viewAreaMode ? pixels / viewportHeight : pixels / itemLength);
    return percent >= viewablePercentThreshold;
  }
}

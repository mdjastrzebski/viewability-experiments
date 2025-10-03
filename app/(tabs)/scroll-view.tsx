import { ViewabilityRoot, ViewTracker } from "@/components/view-tracker";
import * as React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

const data = Array.from({ length: 10 }, (_, index) => index);

export default function Index() {
  const renderItem = ({ item }: { item: number }) => {
    return <Item key={item} title={item.toString()} />;
  };

  return (
    <ViewabilityRoot>
      {(coordinator) => (
        <ScrollView
          onScroll={() => coordinator.updateRoot()}
          onLayout={() => coordinator.updateRoot()}
        >
          {data.map((item) => renderItem({ item }))}
        </ScrollView>
      )}
    </ViewabilityRoot>
  );
}

interface ItemProps {
  title: string;
}

function Item({ title }: ItemProps) {
  const [, forceUpdate] = React.useState({});

  const handlePress = () => {
    console.log("🍓 App - Press", title);
    forceUpdate({});
  };

  const handleVisibilityChange = (isVisible: boolean) => {
    console.log("🍓 App - Visibility Change", title, isVisible);
    setIsVisible(isVisible);
  };

  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <ViewTracker testID={title} onVisibilityChange={handleVisibilityChange}>
      <Text style={[styles.item, isVisible && styles.visible]}>
        {title}
        <Pressable onPressIn={handlePress}>
          <Text>Force Update</Text>
        </Pressable>
      </Text>
    </ViewTracker>
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

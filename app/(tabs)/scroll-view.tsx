import { ViewabilityRoot } from "@/components/viewability-root";
import { ViewabilityTracker } from "@/components/viewability-tracker";
import * as React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const data = Array.from({ length: 10 }, (_, index) => index);

export default function Index() {
  const renderItem = ({ item }: { item: number }) => {
    return <Item key={item} title={item.toString()} />;
  };

  return (
    <ViewabilityRoot>
      {(coordinator) => (
        <ScrollView
          onLayout={() => coordinator.updateRoot()}
          onScroll={() => coordinator.updateRootScroll()}
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
  const [isTitleVisible, setIsTitleVisible] = React.useState(false);
  const [isLoremVisible, setIsLoremVisible] = React.useState(false);

  return (
    <View style={styles.item}>
      <ViewabilityTracker testID={title} onVisibilityChange={setIsTitleVisible}>
        <Text style={[styles.itemText, isTitleVisible && styles.visible]}>
          Item no. {title}
        </Text>
      </ViewabilityTracker>
      <ViewabilityTracker testID={title} onVisibilityChange={setIsLoremVisible}>
        <Text style={[styles.itemText, isLoremVisible && styles.visible]}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
      </ViewabilityTracker>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 20,
    paddingVertical: 100,
    backgroundColor: "white",
  },
  itemText: {
    fontSize: 20,
    paddingVertical: 10,
    marginVertical: 10,
  },
  visible: {
    backgroundColor: "lightblue",
  },
});

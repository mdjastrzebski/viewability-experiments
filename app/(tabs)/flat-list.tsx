import * as React from "react";
import { FlatList, StyleSheet, Text, View, ViewToken } from "react-native";

type ViewTokenMap<K, V> = Map<K, ViewToken<V>>;

const data = Array.from({ length: 100 }, (_, index) => index);

export default function Index() {
  const [viewableItems, setViewableItems] = React.useState<
    ViewTokenMap<number, number>
  >(new Map());

  const renderItem = ({ item }: { item: number }) => {
    const isViewable = viewableItems.get(item)?.isViewable;
    const style = [styles.item, !isViewable && styles.notViewable];

    return <Text style={style}>{item}</Text>;
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.toString()}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
        //minimumViewTime: 1000,
        //waitForInteraction: true,
      }}
      onViewableItemsChanged={({ viewableItems, changed }) => {
        setViewableItems(toViewTokenMap(viewableItems));
        console.log(JSON.stringify(changed, null, 2));
      }}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

function toViewTokenMap(
  viewableItems: ViewToken<number>[]
): ViewTokenMap<number, number> {
  const result: ViewTokenMap<number, number> = new Map();
  viewableItems.forEach((item) => {
    result.set(item.item, item);
  });

  return result;
}

const styles = StyleSheet.create({
  item: {
    padding: 20,
    paddingVertical: 100,
    fontSize: 20,
    backgroundColor: "white",
  },
  notViewable: {
    backgroundColor: "#eee",
  },
  separator: {
    height: 1,
    backgroundColor: "lightgray",
  },
});

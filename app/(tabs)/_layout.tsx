import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
      <Tabs.Screen
        name="flat-list"
        options={{
          title: "Flat List",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="list-ul" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scroll-view"
        options={{
          title: "Scroll View",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="pagelines" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

import React from "react";
import { Tabs } from "expo-router";
import { Home, Heart, Layers3 } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "lightgray",
          height: 60,
        },
        tabBarItemStyle: {
          padding: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color }) => <Heart color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="third"
        options={{
          title: "Third",
          tabBarIcon: ({ color }) => <Layers3 color={color} size={24} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

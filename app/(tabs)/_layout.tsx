import { Tabs } from "expo-router";
import { Home, PlusCircle, Settings } from "lucide-react-native";
import React from "react";

import palette from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.light.tint,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: palette.light.card,
          borderTopColor: palette.light.border,
        },
        headerStyle: {
          backgroundColor: palette.light.background,
        },
        headerTitleStyle: {
          fontWeight: "700",
          color: palette.light.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Fridge",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add Items",
          tabBarIcon: ({ color }) => <PlusCircle color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

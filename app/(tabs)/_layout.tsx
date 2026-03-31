import { Tabs } from "expo-router";
import { Home, PlusCircle, Settings } from "lucide-react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import palette from "@/constants/colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.light.tint,
        tabBarInactiveTintColor: palette.light.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.light.surface,
          borderTopWidth: 2,
          borderTopColor: palette.light.border,
          height: 64 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: "Poppins",
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Fridge",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={24} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ color, size }) => (
            <PlusCircle color={color} size={24} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={24} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}

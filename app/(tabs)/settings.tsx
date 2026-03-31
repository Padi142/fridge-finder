import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Trash2, Info, Shield } from "lucide-react-native";
import { useFridge } from "@/context/FridgeContext";
import palette from "@/constants/colors";

export default function SettingsScreen() {
  const { items, removeItem } = useFridge();

  const handleClearAll = () => {
    if (items.length === 0) {
      Alert.alert("No Items", "Your fridge is already empty!");
      return;
    }

    Alert.alert(
      "Clear All Items",
      `Are you sure you want to remove all ${items.length} items from your fridge?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            items.forEach((item) => removeItem(item.id));
          },
        },
      ]
    );
  };

  const handleClearExpired = () => {
    const expiredItems = items.filter(
      (item) => new Date(item.expiryDate) < new Date()
    );

    if (expiredItems.length === 0) {
      Alert.alert("No Expired Items", "You have no expired items!");
      return;
    }

    Alert.alert(
      "Clear Expired Items",
      `Remove ${expiredItems.length} expired item${expiredItems.length !== 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            expiredItems.forEach((item) => removeItem(item.id));
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-[#f8faf7]" contentContainerStyle={{ padding: 16 }}>
      <View className="mb-6">
        <Text className="mb-3 ml-1 text-[13px] font-bold uppercase tracking-[0.5px] text-[#666666]">
          Fridge Management
        </Text>
        
        <TouchableOpacity
          className="mb-2 flex-row items-center rounded-2xl bg-white p-4"
          onPress={handleClearExpired}
        >
          <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#FFF3E0]">
            <Trash2 size={20} color={palette.light.expiringSoon} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-[#1a1a1a]">Clear Expired Items</Text>
            <Text className="mt-0.5 text-[13px] text-[#666666]">Remove all expired food items</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="mb-2 flex-row items-center rounded-2xl bg-white p-4"
          onPress={handleClearAll}
        >
          <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#FFEBEE]">
            <Trash2 size={20} color={palette.light.expired} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-[#1a1a1a]">Clear All Items</Text>
            <Text className="mt-0.5 text-[13px] text-[#666666]">Remove everything from fridge</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View className="mb-6">
        <Text className="mb-3 ml-1 text-[13px] font-bold uppercase tracking-[0.5px] text-[#666666]">
          About
        </Text>
        
        <View className="mb-2 flex-row items-center rounded-2xl bg-white p-4">
          <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#E8F5E9]">
            <Info size={20} color={palette.light.tint} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-[#1a1a1a]">Fridge Tracker</Text>
            <Text className="mt-0.5 text-[13px] text-[#666666]">Version 1.0</Text>
          </View>
        </View>

        <View className="mb-2 flex-row items-center rounded-2xl bg-white p-4">
          <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#E3F2FD]">
            <Shield size={20} color="#2196F3" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-[#1a1a1a]">Privacy</Text>
            <Text className="mt-0.5 text-[13px] text-[#666666]">
              Your data is stored locally on your device
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 px-1">
        <Text className="text-center text-[13px] leading-5 text-[#666666]">
          Fridge Tracker helps you reduce food waste by tracking expiration dates
          and keeping your fridge organized.
        </Text>
      </View>
    </ScrollView>
  );
}

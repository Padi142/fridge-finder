import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import {
  Trash2,
  Info,
  Shield,
  UserRound,
  LogIn,
  LogOut,
} from "lucide-react-native";
import { useAccount } from "@/context/AccountContext";
import { useFridge } from "@/context/FridgeContext";
import palette from "@/constants/colors";

export default function SettingsScreen() {
  const { compartment, hasCompartment, items, removeItem } = useFridge();
  const { account, isLoading, isLoggedIn, createAnonymousSession, logout } =
    useAccount();

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
            items.forEach((item) => {
              void removeItem(item.id);
            });
          },
        },
      ],
    );
  };

  const handleClearExpired = () => {
    const expiredItems = items.filter(
      (item) => new Date(item.expiryDate) < new Date(),
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
            expiredItems.forEach((item) => {
              void removeItem(item.id);
            });
          },
        },
      ],
    );
  };

  const handleAccountAction = async () => {
    try {
      if (isLoggedIn) {
        await logout();
        return;
      }

      await createAnonymousSession();
    } catch (error) {
      Alert.alert(
        "Account Error",
        error instanceof Error
          ? error.message
          : "Unable to update your account session right now.",
      );
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#f8faf7]"
      contentContainerStyle={{ padding: 16 }}
    >
      <View className="mb-6">
        <Text className="mb-3 ml-1 text-[13px] font-bold uppercase tracking-[0.5px] text-[#666666]">
          Account
        </Text>

        <View className="mb-2 rounded-2xl bg-white p-4">
          <View className="flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#F3E8FF]">
              <UserRound size={20} color="#7C3AED" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-[#1a1a1a]">
                {isLoggedIn ? "Anonymous account active" : "Not signed in"}
              </Text>
              <Text className="mt-0.5 text-[13px] text-[#666666]">
                {account
                  ? `User ID: ${account.$id}`
                  : "Create an anonymous session to sync your fridge data with Appwrite."}
              </Text>
            </View>
          </View>

          <View className="mt-4 rounded-xl bg-[#F8FAF7] p-3">
            <Text className="text-[13px] font-semibold text-[#1a1a1a]">
              Status
            </Text>
            <Text className="mt-1 text-[13px] text-[#666666]">
              {isLoading
                ? "Checking your session..."
                : isLoggedIn
                  ? "Signed in with an anonymous Appwrite account."
                  : "No Appwrite session on this device."}
            </Text>
          </View>

          <TouchableOpacity
            className="mt-4 flex-row items-center justify-center rounded-[14px] py-3.5"
            style={{
              backgroundColor: isLoggedIn ? "#FDECEC" : palette.light.tint,
            }}
            onPress={() => {
              void handleAccountAction();
            }}
            disabled={isLoading}
          >
            {isLoggedIn ? (
              <LogOut size={18} color={palette.light.expired} />
            ) : (
              <LogIn size={18} color="white" />
            )}
            <Text
              className="ml-2 text-base font-bold"
              style={{ color: isLoggedIn ? palette.light.expired : "white" }}
            >
              {isLoading
                ? "Working..."
                : isLoggedIn
                  ? "Sign Out"
                  : "Sign In Anonymously"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-6">
        <Text className="mb-3 ml-1 text-[13px] font-bold uppercase tracking-[0.5px] text-[#666666]">
          Fridge Management
        </Text>

        <View className="mb-2 flex-row items-center rounded-2xl bg-white p-4">
          <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#E8F5E9]">
            <Info size={20} color={palette.light.tint} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-[#1a1a1a]">
              {hasCompartment ? compartment?.name ?? "Compartment ready" : "No compartment yet"}
            </Text>
            <Text className="mt-0.5 text-[13px] text-[#666666]">
              {hasCompartment
                ? "Items in this account are loaded from the Appwrite items table."
                : "Create a compartment from the home tab before adding fridge items."}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="mb-2 flex-row items-center rounded-2xl bg-white p-4"
          onPress={handleClearExpired}
        >
          <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#FFF3E0]">
            <Trash2 size={20} color={palette.light.expiringSoon} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-[#1a1a1a]">
              Clear Expired Items
            </Text>
            <Text className="mt-0.5 text-[13px] text-[#666666]">
              Remove all expired food items
            </Text>
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
            <Text className="text-base font-semibold text-[#1a1a1a]">
              Clear All Items
            </Text>
            <Text className="mt-0.5 text-[13px] text-[#666666]">
              Remove everything from fridge
            </Text>
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
            <Text className="text-base font-semibold text-[#1a1a1a]">
              Fridge Tracker
            </Text>
            <Text className="mt-0.5 text-[13px] text-[#666666]">
              Version 1.0
            </Text>
          </View>
        </View>

        <View className="mb-2 flex-row items-center rounded-2xl bg-white p-4">
          <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#E3F2FD]">
            <Shield size={20} color="#2196F3" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-[#1a1a1a]">
              Privacy
            </Text>
            <Text className="mt-0.5 text-[13px] text-[#666666]">
              Your fridge data is loaded from Appwrite
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 px-1">
        <Text className="text-center text-[13px] leading-5 text-[#666666]">
          Fridge Tracker helps you reduce food waste by tracking expiration
          dates and keeping your fridge organized.
        </Text>
      </View>
    </ScrollView>
  );
}

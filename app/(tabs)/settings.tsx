import { useAccount } from "@/context/AccountContext";
import { useFridge } from "@/context/FridgeContext";
import {
  AlertCircle,
  ChevronRight,
  Info,
  LogIn,
  LogOut,
  Package,
  Shield,
  Trash2,
  UserRound,
} from "lucide-react-native";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { compartment, hasCompartment, items, removeItem } = useFridge();
  const { account, isLoading, isLoggedIn, createAnonymousSession, logout } =
    useAccount();
  const insets = useSafeAreaInsets();

  const handleClearAll = () => {
    if (items.length === 0) {
      Alert.alert("No Items", "Your fridge is already empty!");
      return;
    }

    Alert.alert("Clear All Items", `Remove all ${items.length} items?`, [
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
    ]);
  };

  const handleClearExpired = () => {
    const expiredItems = items.filter(
      (item) => new Date(item.expiryDate) < new Date(),
    );

    if (expiredItems.length === 0) {
      Alert.alert("No Expired Items", "Nothing to clear!");
      return;
    }

    Alert.alert(
      "Clear Expired",
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
      className="flex-1 bg-[#FAFAFA]"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: insets.top + 12,
      }}
    >
      {/* Header */}
      <View className="mb-6">
        <Text
          className="text-[28px] font-bold text-[#0F0F0F]"
          style={{ fontFamily: "Poppins" }}
        >
          Settings
        </Text>
        <Text
          className="text-[15px] font-medium text-[#6B6B6B]"
          style={{ fontFamily: "Poppins" }}
        >
          Manage your account and data
        </Text>
      </View>

      {/* Account Section */}
      <View className="mb-6">
        <Text
          className="mb-3 text-[12px] font-bold uppercase tracking-wider text-[#9A9A9A]"
          style={{ fontFamily: "Poppins" }}
        >
          Account
        </Text>

        <View className="rounded-3xl border-2 border-[#E8E8E8] bg-white p-5">
          <View className="flex-row items-center">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#0F0F0F]">
              <UserRound size={24} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text
                className="text-[16px] font-bold text-[#0F0F0F]"
                style={{ fontFamily: "Poppins" }}
              >
                {isLoggedIn ? "Anonymous User" : "Not Signed In"}
              </Text>
              <Text
                className="text-[13px] font-medium text-[#6B6B6B]"
                style={{ fontFamily: "Poppins" }}
              >
                {account
                  ? `ID: ${account.$id.slice(0, 8)}...`
                  : "Sign in to sync your data"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-4"
            style={{
              backgroundColor: isLoggedIn ? "#FFEBEE" : "#0F0F0F",
            }}
            onPress={() => {
              void handleAccountAction();
            }}
            disabled={isLoading}
          >
            {isLoggedIn ? (
              <LogOut size={18} color="#FF1744" />
            ) : (
              <LogIn size={18} color="white" />
            )}
            <Text
              className="text-[15px] font-bold"
              style={{
                color: isLoggedIn ? "#FF1744" : "white",
                fontFamily: "Poppins",
              }}
            >
              {isLoading ? "Working..." : isLoggedIn ? "Sign Out" : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fridge Section */}
      <View className="mb-6">
        <Text
          className="mb-3 text-[12px] font-bold uppercase tracking-wider text-[#9A9A9A]"
          style={{ fontFamily: "Poppins" }}
        >
          Fridge
        </Text>

        <View className="rounded-3xl border-2 border-[#E8E8E8] bg-white overflow-hidden">
          {/* Compartment Info */}
          <View className="flex-row items-center p-5 border-b-2 border-[#F0F0F0]">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#00C853]">
              <Package size={22} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text
                className="text-[15px] font-bold text-[#0F0F0F]"
                style={{ fontFamily: "Poppins" }}
              >
                {hasCompartment
                  ? (compartment?.name ?? "Compartment")
                  : "No Compartment"}
              </Text>
              <Text
                className="text-[13px] font-medium text-[#6B6B6B]"
                style={{ fontFamily: "Poppins" }}
              >
                {hasCompartment
                  ? `${items.length} items tracked`
                  : "Create one in Home tab"}
              </Text>
            </View>
          </View>

          {/* Clear Expired */}
          <TouchableOpacity
            className="flex-row items-center p-5 border-b-2 border-[#F0F0F0]"
            onPress={handleClearExpired}
          >
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#FFF3E0]">
              <AlertCircle size={22} color="#FF9100" />
            </View>
            <View className="ml-4 flex-1">
              <Text
                className="text-[15px] font-bold text-[#0F0F0F]"
                style={{ fontFamily: "Poppins" }}
              >
                Clear Expired
              </Text>
              <Text
                className="text-[13px] font-medium text-[#6B6B6B]"
                style={{ fontFamily: "Poppins" }}
              >
                Remove expired items
              </Text>
            </View>
            <ChevronRight size={20} color="#9A9A9A" />
          </TouchableOpacity>

          {/* Clear All */}
          <TouchableOpacity
            className="flex-row items-center p-5"
            onPress={handleClearAll}
          >
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#FFEBEE]">
              <Trash2 size={22} color="#FF1744" />
            </View>
            <View className="ml-4 flex-1">
              <Text
                className="text-[15px] font-bold text-[#0F0F0F]"
                style={{ fontFamily: "Poppins" }}
              >
                Clear All Items
              </Text>
              <Text
                className="text-[13px] font-medium text-[#6B6B6B]"
                style={{ fontFamily: "Poppins" }}
              >
                Remove everything
              </Text>
            </View>
            <ChevronRight size={20} color="#9A9A9A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* About Section */}
      <View className="mb-6">
        <Text
          className="mb-3 text-[12px] font-bold uppercase tracking-wider text-[#9A9A9A]"
          style={{ fontFamily: "Poppins" }}
        >
          About
        </Text>

        <View className="rounded-3xl border-2 border-[#E8E8E8] bg-white overflow-hidden">
          <View className="flex-row items-center p-5 border-b-2 border-[#F0F0F0]">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#E3F2FD]">
              <Info size={22} color="#2979FF" />
            </View>
            <View className="ml-4 flex-1">
              <Text
                className="text-[15px] font-bold text-[#0F0F0F]"
                style={{ fontFamily: "Poppins" }}
              >
                FridgeFinder
              </Text>
              <Text
                className="text-[13px] font-medium text-[#6B6B6B]"
                style={{ fontFamily: "Poppins" }}
              >
                Version 1.0
              </Text>
            </View>
          </View>

          <View className="flex-row items-center p-5">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#F3E8FF]">
              <Shield size={22} color="#7C4DFF" />
            </View>
            <View className="ml-4 flex-1">
              <Text
                className="text-[15px] font-bold text-[#0F0F0F]"
                style={{ fontFamily: "Poppins" }}
              >
                Privacy
              </Text>
              <Text
                className="text-[13px] font-medium text-[#6B6B6B]"
                style={{ fontFamily: "Poppins" }}
              >
                Data stored in Appwrite
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="mt-4 px-1">
        <Text
          className="text-center text-[13px] font-medium leading-5 text-[#9A9A9A]"
          style={{ fontFamily: "Poppins" }}
        >
          FridgeFinder helps you reduce food waste by tracking expiration dates.
        </Text>
      </View>
    </ScrollView>
  );
}

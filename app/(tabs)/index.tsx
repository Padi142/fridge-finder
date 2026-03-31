import { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFridge } from "@/context/FridgeContext";
import {
  getExpiryStatus,
  getDaysUntilExpiry,
  categoryIcons,
  type FridgeItem,
  type ExpiryStatus,
} from "@/types/fridge";
import palette from "@/constants/colors";
import { AlertTriangle, Trash2, Clock } from "lucide-react-native";
import { useAccount } from "@/context/AccountContext";

export default function HomeScreen() {
  const { isLoggedIn, createAnonymousSession } = useAccount();
  const {
    compartment,
    hasCompartment,
    items,
    isLoading,
    isMutating,
    removeItem,
    createCompartment,
    refresh,
  } = useFridge();
  const [refreshing, setRefreshing] = useState(false);
  const [compartmentName, setCompartmentName] = useState("");
  const insets = useSafeAreaInsets();

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const statusA = getExpiryStatus(a.expiryDate);
      const statusB = getExpiryStatus(b.expiryDate);

      const priority: Record<ExpiryStatus, number> = {
        expired: 0,
        expiringSoon: 1,
        fresh: 2,
      };

      if (priority[statusA] !== priority[statusB]) {
        return priority[statusA] - priority[statusB];
      }

      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });
  }, [items]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      expired: items.filter((i) => getExpiryStatus(i.expiryDate) === "expired").length,
      expiringSoon: items.filter((i) => getExpiryStatus(i.expiryDate) === "expiringSoon").length,
      fresh: items.filter((i) => getExpiryStatus(i.expiryDate) === "fresh").length,
    };
  }, [items]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateCompartment = async () => {
    try {
      await createCompartment(compartmentName);
      setCompartmentName("");
    } catch (error) {
      Alert.alert(
        "Unable to Create Compartment",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const getStatusColor = (status: ExpiryStatus) => {
    switch (status) {
      case "expired":
        return palette.light.expired;
      case "expiringSoon":
        return palette.light.expiringSoon;
      case "fresh":
        return palette.light.fresh;
    }
  };

  const getStatusText = (status: ExpiryStatus, days: number) => {
    switch (status) {
      case "expired":
        return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`;
      case "expiringSoon":
        return days === 0 ? "Expires today" : `${days} day${days !== 1 ? "s" : ""} left`;
      case "fresh":
        return `${days} days left`;
    }
  };

  const renderItem = ({ item }: { item: FridgeItem }) => {
    const status = getExpiryStatus(item.expiryDate);
    const days = getDaysUntilExpiry(item.expiryDate);
    const statusColor = getStatusColor(status);

    return (
      <View
        className="flex-row items-center overflow-hidden rounded-2xl bg-white"
        style={{
          shadowColor: palette.light.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="h-full w-1" style={{ backgroundColor: statusColor }} />
        {item.imageUri && (
          <Image
            source={{ uri: item.imageUri }}
            className="ml-3 h-[60px] w-[60px] rounded-lg"
          />
        )}
        <View className="flex-1 p-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl">{categoryIcons[item.category]}</Text>
            <View className="flex-1">
              <Text className="text-base font-bold text-[#1a1a1a]">{item.name}</Text>
              <Text className="mt-0.5 text-[13px] text-[#666666]">
                {item.quantity} {item.unit}
              </Text>
            </View>
          </View>

          <View className="mt-2 flex-row items-center gap-1.5">
            <Clock size={14} color={statusColor} />
            <Text className="text-[13px] font-semibold" style={{ color: statusColor }}>
              {getStatusText(status, days)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="mr-1 p-3"
          onPress={() => {
            void removeItem(item.id);
          }}
          testID={`delete-${item.id}`}
        >
          <Trash2 size={18} color={palette.light.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

  if (!isLoggedIn) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8faf7] px-4">
        <Text className="mb-4 text-center text-[22px] font-bold text-[#1a1a1a]">Welcome to FridgeFinder!</Text>
        <Text className="mb-6 text-center text-[15px] text-[#666666]">
          To start tracking your fridge, please sign in anonymously. This creates an Appwrite-backed account for this device so your fridge data can be loaded from the cloud.
        </Text>
        <TouchableOpacity
          className="rounded-2xl bg-[#007AFF] px-6 py-3"
          onPress={() => void createAnonymousSession()}
        >
          <Text className="text-center font-semibold text-white">Sign In Anonymously</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8faf7]">
        <Text className="text-base text-[#666666]">Loading your fridge...</Text>
      </View>
    );
  }

  if (!hasCompartment) {
    return (
      <View className="flex-1 justify-center bg-[#f8faf7] px-6">
        <View className="rounded-[28px] bg-white p-6">
          <Text className="mb-2 text-[28px] font-extrabold text-[#1a1a1a]">
            Create your first fridge
          </Text>
          <Text className="mb-5 text-[15px] leading-6 text-[#666666]">
            You do not have a fridge compartment yet. Create one before adding items.
          </Text>

          <TextInput
            value={compartmentName}
            onChangeText={setCompartmentName}
            placeholder="My fridge"
            className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAF7] px-4 py-4 text-base text-[#1a1a1a]"
            editable={!isMutating}
            maxLength={100}
          />

          <TouchableOpacity
            className="mt-4 rounded-2xl px-6 py-4"
            style={{ backgroundColor: palette.light.tint, opacity: isMutating ? 0.7 : 1 }}
            onPress={() => {
              void handleCreateCompartment();
            }}
            disabled={isMutating}
          >
            <Text className="text-center text-base font-bold text-white">
              {isMutating ? "Creating..." : "Create Compartment"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-[#f8faf7]"
      style={{ paddingBottom: insets.bottom + 80 }}
    >
      <View className="p-4">
        <Text className="mb-3 text-[24px] font-extrabold text-[#1a1a1a]">
          {compartment?.name ?? "Your fridge"}
        </Text>
        <View className="flex-row gap-3">
          <View className="flex-1 items-center rounded-2xl bg-[#E8F5E9] p-4">
            <Text className="text-2xl font-extrabold" style={{ color: palette.light.fresh }}>
              {stats.fresh}
            </Text>
            <Text className="mt-1 text-xs font-semibold text-[#666666]">Fresh</Text>
          </View>
          <View className="flex-1 items-center rounded-2xl bg-[#FFF3E0] p-4">
            <Text
              className="text-2xl font-extrabold"
              style={{ color: palette.light.expiringSoon }}
            >
              {stats.expiringSoon}
            </Text>
            <Text className="mt-1 text-xs font-semibold text-[#666666]">Expiring</Text>
          </View>
          <View className="flex-1 items-center rounded-2xl bg-[#FFEBEE] p-4">
            <Text className="text-2xl font-extrabold" style={{ color: palette.light.expired }}>
              {stats.expired}
            </Text>
            <Text className="mt-1 text-xs font-semibold text-[#666666]">Expired</Text>
          </View>
        </View>

        {stats.expired > 0 && (
          <View className="mt-3 flex-row items-center justify-center gap-2 rounded-xl bg-[#FFEBEE] p-3">
            <AlertTriangle size={20} color={palette.light.expired} />
            <Text className="font-semibold" style={{ color: palette.light.expired }}>
              You have {stats.expired} expired item{stats.expired !== 1 ? "s" : ""}!
            </Text>
          </View>
        )}
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="mb-4 text-[64px]">🥗</Text>
          <Text className="mb-2 text-[22px] font-bold text-[#1a1a1a]">Your fridge is empty</Text>
          <Text className="text-center text-[15px] text-[#666666]">
            Tap Add Items to start tracking your food
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

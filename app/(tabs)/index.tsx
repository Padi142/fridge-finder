import palette from "@/constants/colors";
import { useAccount } from "@/context/AccountContext";
import { useFridge } from "@/context/FridgeContext";
import { formatDateInput, parseDateInput } from "@/lib/date";
import {
  categoryIcons,
  getDaysUntilExpiry,
  getExpiryStatus,
  type ExpiryStatus,
  type FridgeItem,
} from "@/types/fridge";
import {
  AlertCircle,
  Check,
  Clock,
  Package,
  Pencil,
  Trash2,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    updateItem,
  } = useFridge();
  const [refreshing, setRefreshing] = useState(false);
  const [compartmentName, setCompartmentName] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftExpiryDate, setDraftExpiryDate] = useState("");
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

      return (
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );
    });
  }, [items]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      expired: items.filter(
        (item) => getExpiryStatus(item.expiryDate) === "expired",
      ).length,
      expiringSoon: items.filter(
        (item) => getExpiryStatus(item.expiryDate) === "expiringSoon",
      ).length,
      fresh: items.filter(
        (item) => getExpiryStatus(item.expiryDate) === "fresh",
      ).length,
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

  const startEditingItem = (item: FridgeItem) => {
    setEditingItemId(item.id);
    setDraftName(item.name);
    setDraftExpiryDate(formatDateInput(item.expiryDate));
  };

  const cancelEditingItem = () => {
    setEditingItemId(null);
    setDraftName("");
    setDraftExpiryDate("");
  };

  const saveItemChanges = async (itemId: string) => {
    const trimmedName = draftName.trim();
    const parsedExpiryDate = parseDateInput(draftExpiryDate);

    if (!trimmedName) {
      Alert.alert("Missing Name", "Enter a product name before saving.");
      return;
    }

    if (!parsedExpiryDate) {
      Alert.alert(
        "Invalid Expiry Date",
        "Enter the expiry date in YYYY-MM-DD format.",
      );
      return;
    }

    try {
      await updateItem(itemId, {
        name: trimmedName,
        expiryDate: parsedExpiryDate,
      });
      cancelEditingItem();
    } catch (error) {
      Alert.alert(
        "Unable to Update Item",
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
        return `${Math.abs(days)}d ago`;
      case "expiringSoon":
        return days === 0 ? "Today" : `${days}d left`;
      case "fresh":
        return `${days}d left`;
    }
  };

  const renderItem = ({ item }: { item: FridgeItem }) => {
    const status = getExpiryStatus(item.expiryDate);
    const days = getDaysUntilExpiry(item.expiryDate);
    const statusColor = getStatusColor(status);
    const isEditing = editingItemId === item.id;

    return (
      <View
        className="flex-row overflow-hidden rounded-[28px] border-2 border-[#F0F0F0] bg-white"
        style={{
          shadowColor: palette.light.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
        }}
      >
        <View
          className="w-1.5 self-stretch"
          style={{ backgroundColor: statusColor }}
        />

        <View className="flex-1 p-4">
          <View className="flex-row items-start gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#FAFAFA]">
              <Text className="text-2xl">{categoryIcons[item.category]}</Text>
            </View>

            <View className="flex-1" style={{ minWidth: 0 }}>
              {isEditing ? (
                <View className="gap-3">
                  <View>
                    <Text
                      className="mb-1 text-[11px] font-bold uppercase tracking-[1.4px] text-[#9A9A9A]"
                      style={{ fontFamily: "Poppins" }}
                    >
                      Name
                    </Text>
                    <TextInput
                      value={draftName}
                      onChangeText={setDraftName}
                      placeholder="Milk"
                      placeholderTextColor="#9A9A9A"
                      className="rounded-2xl border-2 border-[#E8E8E8] bg-[#FAFAFA] px-4 py-3 text-[15px] text-[#0F0F0F]"
                      style={{ fontFamily: "Poppins" }}
                      editable={!isMutating}
                      maxLength={120}
                      autoCapitalize="words"
                    />
                  </View>

                  <View>
                    <Text
                      className="mb-1 text-[11px] font-bold uppercase tracking-[1.4px] text-[#9A9A9A]"
                      style={{ fontFamily: "Poppins" }}
                    >
                      Expiry Date
                    </Text>
                    <TextInput
                      value={draftExpiryDate}
                      onChangeText={setDraftExpiryDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9A9A9A"
                      className="rounded-2xl border-2 border-[#E8E8E8] bg-[#FAFAFA] px-4 py-3 text-[15px] text-[#0F0F0F]"
                      style={{ fontFamily: "Poppins" }}
                      editable={!isMutating}
                      maxLength={10}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>

                  <Text
                    className="text-[13px] font-medium text-[#6B6B6B]"
                    style={{ fontFamily: "Poppins" }}
                  >
                    {item.quantity} {item.unit}
                  </Text>
                </View>
              ) : (
                <>
                  <Text
                    className="text-[16px] font-semibold text-[#0F0F0F]"
                    style={{ fontFamily: "Poppins" }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    className="mt-1 text-[13px] font-medium text-[#6B6B6B]"
                    style={{ fontFamily: "Poppins" }}
                    numberOfLines={1}
                  >
                    {item.quantity} {item.unit}
                  </Text>
                  <Text
                    className="mt-1 text-[13px] font-medium text-[#9A9A9A]"
                    style={{ fontFamily: "Poppins" }}
                    numberOfLines={1}
                  >
                    Expires {formatDateInput(item.expiryDate)}
                  </Text>
                </>
              )}
            </View>
          </View>

          {isEditing ? (
            <View className="mt-4 flex-row gap-2">
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-[#0F0F0F] py-3"
                onPress={() => {
                  void saveItemChanges(item.id);
                }}
                disabled={isMutating}
              >
                <Check size={18} color="white" />
                <Text
                  className="text-[14px] font-bold text-white"
                  style={{ fontFamily: "Poppins" }}
                >
                  Save
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 border-[#E8E8E8] bg-white py-3"
                onPress={cancelEditingItem}
                disabled={isMutating}
              >
                <X size={18} color="#6B6B6B" />
                <Text
                  className="text-[14px] font-bold text-[#6B6B6B]"
                  style={{ fontFamily: "Poppins" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mt-4 flex-row items-center justify-between gap-3">
              <View
                className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
                style={{ backgroundColor: `${statusColor}15` }}
              >
                <Clock size={12} color={statusColor} />
                <Text
                  className="text-[12px] font-bold"
                  style={{ color: statusColor, fontFamily: "Poppins" }}
                >
                  {getStatusText(status, days)}
                </Text>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="h-10 w-10 items-center justify-center rounded-2xl bg-[#FAFAFA]"
                  onPress={() => startEditingItem(item)}
                  disabled={isMutating}
                  testID={`edit-${item.id}`}
                >
                  <Pencil size={16} color="#6B6B6B" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="h-10 w-10 items-center justify-center rounded-2xl bg-[#FAFAFA]"
                  onPress={() => {
                    void removeItem(item.id);
                  }}
                  disabled={isMutating}
                  testID={`delete-${item.id}`}
                >
                  <Trash2 size={16} color="#9A9A9A" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!isLoggedIn) {
    return (
      <View
        className="flex-1 items-center justify-center bg-[#FAFAFA] px-6"
        style={{ paddingTop: insets.top }}
      >
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl bg-[#00C853]">
          <Package size={40} color="white" />
        </View>
        <Text
          className="mb-2 text-center text-[28px] font-bold text-[#0F0F0F]"
          style={{ fontFamily: "Poppins" }}
        >
          FridgeFinder
        </Text>
        <Text
          className="mb-8 text-center text-[15px] font-medium text-[#6B6B6B]"
          style={{ fontFamily: "Poppins" }}
        >
          Track your food, reduce waste
        </Text>
        <TouchableOpacity
          className="w-full rounded-2xl bg-[#0F0F0F] px-6 py-4"
          onPress={() => void createAnonymousSession()}
        >
          <Text
            className="text-center text-[15px] font-bold text-white"
            style={{ fontFamily: "Poppins" }}
          >
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-[#FAFAFA]"
        style={{ paddingTop: insets.top }}
      >
        <Text
          className="text-[15px] font-medium text-[#6B6B6B]"
          style={{ fontFamily: "Poppins" }}
        >
          Loading your fridge...
        </Text>
      </View>
    );
  }

  if (!hasCompartment) {
    return (
      <View
        className="flex-1 justify-center bg-[#FAFAFA] px-6"
        style={{ paddingTop: insets.top }}
      >
        <View className="rounded-3xl border-2 border-[#E8E8E8] bg-white p-6">
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-[#00C853]">
            <Package size={28} color="white" />
          </View>
          <Text
            className="mb-2 text-[24px] font-bold text-[#0F0F0F]"
            style={{ fontFamily: "Poppins" }}
          >
            Create your fridge
          </Text>
          <Text
            className="mb-6 text-[15px] font-medium leading-6 text-[#6B6B6B]"
            style={{ fontFamily: "Poppins" }}
          >
            Set up your first compartment to start tracking items.
          </Text>

          <TextInput
            value={compartmentName}
            onChangeText={setCompartmentName}
            placeholder="My Fridge"
            placeholderTextColor="#9A9A9A"
            className="rounded-2xl border-2 border-[#E8E8E8] bg-[#FAFAFA] px-4 py-4 text-[15px] font-medium text-[#0F0F0F]"
            style={{ fontFamily: "Poppins" }}
            editable={!isMutating}
            maxLength={100}
          />

          <TouchableOpacity
            className="mt-4 rounded-2xl bg-[#0F0F0F] px-6 py-4"
            style={{ opacity: isMutating ? 0.7 : 1 }}
            onPress={() => {
              void handleCreateCompartment();
            }}
            disabled={isMutating}
          >
            <Text
              className="text-center text-[15px] font-bold text-white"
              style={{ fontFamily: "Poppins" }}
            >
              {isMutating ? "Creating..." : "Create Compartment"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <View className="px-5 pb-2" style={{ paddingTop: insets.top + 12 }}>
        <Text
          className="text-[28px] font-bold text-[#0F0F0F]"
          style={{ fontFamily: "Poppins" }}
        >
          {compartment?.name ?? "Your Fridge"}
        </Text>
        <Text
          className="text-[15px] font-medium text-[#6B6B6B]"
          style={{ fontFamily: "Poppins" }}
        >
          {stats.total} {stats.total === 1 ? "item" : "items"} tracked
        </Text>
      </View>

      <View className="px-5 pb-2 pt-2">
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl border-2 border-[#00C853] bg-white p-4">
            <Text
              className="text-[28px] font-bold text-[#00C853]"
              style={{ fontFamily: "Poppins" }}
            >
              {stats.fresh}
            </Text>
            <Text
              className="mt-1 text-[12px] font-bold uppercase tracking-wider text-[#6B6B6B]"
              style={{ fontFamily: "Poppins" }}
            >
              Fresh
            </Text>
          </View>
          <View className="flex-1 rounded-2xl border-2 border-[#FF9100] bg-white p-4">
            <Text
              className="text-[28px] font-bold text-[#FF9100]"
              style={{ fontFamily: "Poppins" }}
            >
              {stats.expiringSoon}
            </Text>
            <Text
              className="mt-1 text-[12px] font-bold uppercase tracking-wider text-[#6B6B6B]"
              style={{ fontFamily: "Poppins" }}
            >
              Expiring
            </Text>
          </View>
          <View className="flex-1 rounded-2xl border-2 border-[#FF1744] bg-white p-4">
            <Text
              className="text-[28px] font-bold text-[#FF1744]"
              style={{ fontFamily: "Poppins" }}
            >
              {stats.expired}
            </Text>
            <Text
              className="mt-1 text-[12px] font-bold uppercase tracking-wider text-[#6B6B6B]"
              style={{ fontFamily: "Poppins" }}
            >
              Expired
            </Text>
          </View>
        </View>

        {stats.expired > 0 && (
          <View className="mt-3 flex-row items-center gap-3 rounded-2xl border-2 border-[#FF1744] bg-[#FF1744] p-4">
            <AlertCircle size={24} color="white" />
            <Text
              className="flex-1 text-[14px] font-semibold text-white"
              style={{ fontFamily: "Poppins" }}
            >
              {stats.expired} expired item{stats.expired !== 1 ? "s" : ""} need
              attention
            </Text>
          </View>
        )}
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl bg-[#F0F0F0]">
            <Package size={40} color="#9A9A9A" />
          </View>
          <Text
            className="mb-1 text-center text-[20px] font-bold text-[#0F0F0F]"
            style={{ fontFamily: "Poppins" }}
          >
            Empty fridge
          </Text>
          <Text
            className="text-center text-[15px] font-medium text-[#6B6B6B]"
            style={{ fontFamily: "Poppins" }}
          >
            Tap Add to scan your first items
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00C853"
            />
          }
        />
      )}
    </View>
  );
}

import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FridgeItem, DetectedItem } from "@/types/fridge";

interface FridgeContextValue {
  items: FridgeItem[];
  isLoading: boolean;
  addItem: (item: Omit<FridgeItem, "id" | "dateAdded">) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<FridgeItem>) => void;
  addDetectedItems: (items: DetectedItem[], imageUri?: string) => void;
}

const STORAGE_KEY = "fridge_items";

const useFridgeContext = () => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<FridgeItem[]>([]);

  const { data: storedItems, isLoading } = useQuery({
    queryKey: ["fridge-items"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as FridgeItem[]) : [];
    },
  });

  useEffect(() => {
    if (storedItems) {
      setItems(storedItems);
    }
  }, [storedItems]);

  const syncMutation = useMutation({
    mutationFn: async (newItems: FridgeItem[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      return newItems;
    },
    onSuccess: (newItems) => {
      queryClient.setQueryData(["fridge-items"], newItems);
    },
  });

  const addItem = useCallback(
    (item: Omit<FridgeItem, "id" | "dateAdded">) => {
      const newItem: FridgeItem = {
        ...item,
        id: Date.now().toString(),
        dateAdded: new Date().toISOString(),
      };
      const updated = [...items, newItem];
      setItems(updated);
      syncMutation.mutate(updated);
    },
    [items, syncMutation]
  );

  const addDetectedItems = useCallback(
    (detectedItems: DetectedItem[], imageUri?: string) => {
      const newItems: FridgeItem[] = detectedItems.map((detected) => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + detected.estimatedExpiryDays);

        return {
          id: `${Date.now()}-${Math.random()}`,
          name: detected.name,
          quantity: detected.quantity,
          unit: detected.unit,
          category: detected.category,
          expiryDate: expiryDate.toISOString(),
          dateAdded: new Date().toISOString(),
          imageUri,
          confidence: detected.confidence,
        };
      });

      const updated = [...items, ...newItems];
      setItems(updated);
      syncMutation.mutate(updated);
    },
    [items, syncMutation]
  );

  const removeItem = useCallback(
    (id: string) => {
      const updated = items.filter((item) => item.id !== id);
      setItems(updated);
      syncMutation.mutate(updated);
    },
    [items, syncMutation]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<FridgeItem>) => {
      const updated = items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      setItems(updated);
      syncMutation.mutate(updated);
    },
    [items, syncMutation]
  );

  return useMemo(
    () => ({
      items,
      isLoading,
      addItem,
      removeItem,
      updateItem,
      addDetectedItems,
    }),
    [items, isLoading, addItem, removeItem, updateItem, addDetectedItems]
  );
};

export const [FridgeContext, useFridge] = createContextHook<FridgeContextValue>(useFridgeContext);
export const FridgeProvider = FridgeContext;

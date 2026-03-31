import createContextHook from "@nkzw/create-context-hook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { useAccount } from "@/context/AccountContext";
import {
  createCompartmentRow,
  createItemRow,
  deleteItemRow,
  listCompartmentItems,
  listUserCompartments,
  mapCompartmentRow,
  mapItemRow,
  updateItemRow,
} from "@/lib/appwrite/fridge";
import type { DetectedItem, FridgeCompartment, FridgeItem } from "@/types/fridge";

interface FridgeContextValue {
  compartment: FridgeCompartment | null;
  hasCompartment: boolean;
  items: FridgeItem[];
  isLoading: boolean;
  isMutating: boolean;
  createCompartment: (name: string) => Promise<void>;
  refresh: () => Promise<void>;
  addItem: (item: Omit<FridgeItem, "id" | "dateAdded">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<FridgeItem>) => Promise<void>;
  addDetectedItems: (items: DetectedItem[], imageUri?: string) => Promise<void>;
}

const useFridgeContext = () => {
  const queryClient = useQueryClient();
  const { account } = useAccount();
  const userId = account?.$id ?? null;

  const compartmentQuery = useQuery({
    queryKey: ["fridge-compartment", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) {
        return null;
      }

      const result = await listUserCompartments(userId);
      return result.rows[0] ?? null;
    },
  });

  const compartmentId = compartmentQuery.data?.$id ?? null;

  const itemsQuery = useQuery({
    queryKey: ["fridge-items", compartmentId],
    enabled: Boolean(compartmentId),
    queryFn: async () => {
      if (!compartmentId) {
        return [];
      }

      const result = await listCompartmentItems(compartmentId);
      return result.rows.map(mapItemRow);
    },
  });

  const invalidateFridge = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["fridge-compartment", userId] });

    if (compartmentId) {
      await queryClient.invalidateQueries({ queryKey: ["fridge-items", compartmentId] });
    }
  }, [compartmentId, queryClient, userId]);

  const createCompartmentMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!userId) {
        throw new Error("Sign in before creating a compartment.");
      }

      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error("Enter a compartment name.");
      }

      await createCompartmentRow(userId, trimmedName);
    },
    onSuccess: async () => {
      await invalidateFridge();
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: Omit<FridgeItem, "id" | "dateAdded">) => {
      if (!compartmentId) {
        throw new Error("Create a compartment before adding items.");
      }

      await createItemRow(compartmentId, item);
    },
    onSuccess: async () => {
      await invalidateFridge();
    },
  });

  const addDetectedItemsMutation = useMutation({
    mutationFn: async (detectedItems: DetectedItem[]) => {
      if (!compartmentId) {
        throw new Error("Create a compartment before adding items.");
      }

      await Promise.all(
        detectedItems.map(async (detected) => {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + detected.estimatedExpiryDays);

          await createItemRow(compartmentId, {
            name: detected.name,
            quantity: detected.quantity,
            unit: detected.unit,
            category: detected.category,
            expiryDate: expiryDate.toISOString(),
            imageUri: undefined,
            confidence: detected.confidence,
          });
        }),
      );
    },
    onSuccess: async () => {
      await invalidateFridge();
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: deleteItemRow,
    onSuccess: async () => {
      await invalidateFridge();
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FridgeItem> }) => {
      await updateItemRow(id, updates);
    },
    onSuccess: async () => {
      await invalidateFridge();
    },
  });

  const compartment = compartmentQuery.data ? mapCompartmentRow(compartmentQuery.data) : null;

  const createCompartment = useCallback(
    async (name: string) => {
      await createCompartmentMutation.mutateAsync(name);
    },
    [createCompartmentMutation],
  );

  const refresh = useCallback(async () => {
    await invalidateFridge();
  }, [invalidateFridge]);

  const addItem = useCallback(
    async (item: Omit<FridgeItem, "id" | "dateAdded">) => {
      await addItemMutation.mutateAsync(item);
    },
    [addItemMutation],
  );

  const addDetectedItems = useCallback(
    async (items: DetectedItem[], _imageUri?: string) => {
      await addDetectedItemsMutation.mutateAsync(items);
    },
    [addDetectedItemsMutation],
  );

  const removeItem = useCallback(
    async (id: string) => {
      await removeItemMutation.mutateAsync(id);
    },
    [removeItemMutation],
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<FridgeItem>) => {
      await updateItemMutation.mutateAsync({ id, updates });
    },
    [updateItemMutation],
  );

  return useMemo(
    () => ({
      compartment,
      hasCompartment: Boolean(compartment),
      items: compartmentId ? itemsQuery.data ?? [] : [],
      isLoading:
        compartmentQuery.isLoading || (Boolean(compartmentId) && itemsQuery.isLoading),
      isMutating:
        createCompartmentMutation.isPending ||
        addItemMutation.isPending ||
        addDetectedItemsMutation.isPending ||
        removeItemMutation.isPending ||
        updateItemMutation.isPending,
      createCompartment,
      refresh,
      addItem,
      removeItem,
      updateItem,
      addDetectedItems,
    }),
    [
      addDetectedItems,
      addDetectedItemsMutation.isPending,
      addItem,
      addItemMutation.isPending,
      compartment,
      compartmentId,
      compartmentQuery.isLoading,
      createCompartment,
      createCompartmentMutation.isPending,
      itemsQuery.data,
      itemsQuery.isLoading,
      refresh,
      removeItem,
      removeItemMutation.isPending,
      updateItem,
      updateItemMutation.isPending,
    ],
  );
};

export const [FridgeContext, useFridge] = createContextHook<FridgeContextValue>(useFridgeContext);
export const FridgeProvider = FridgeContext;

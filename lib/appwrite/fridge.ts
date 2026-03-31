import { ID, Models, Query, TablesDB } from "react-native-appwrite";

import { client } from "@/lib/appwrite/client";
import type { FridgeCompartment, FridgeItem } from "@/types/fridge";

const tablesDb = new TablesDB(client);

export const FRIDGE_DATABASE_ID = "fridge-db";
export const COMPARTMENTS_TABLE_ID = "compartments";
export const ITEMS_TABLE_ID = "items";

type ItemUnit = "piece" | "kg" | "lb" | "litre";

export interface AppwriteCompartmentRow extends Models.Row {
  compartmentName: string;
  compartmentType: FridgeCompartment["type"];
  isConfigured: boolean;
  userId: string;
}

export interface AppwriteItemRow extends Models.Row {
  itemName: string;
  quantity?: number | null;
  unit?: ItemUnit | null;
  expiryDate?: string | null;
  addedDate: string;
  locationLabel?: string | null;
  compartments?: string | null;
}

export function listUserCompartments(userId: string) {
  return tablesDb.listRows<AppwriteCompartmentRow>({
    databaseId: FRIDGE_DATABASE_ID,
    tableId: COMPARTMENTS_TABLE_ID,
    queries: [Query.equal("userId", userId), Query.limit(1)],
  });
}

export function createCompartmentRow(userId: string, name: string) {
  return tablesDb.createRow<AppwriteCompartmentRow>({
    databaseId: FRIDGE_DATABASE_ID,
    tableId: COMPARTMENTS_TABLE_ID,
    rowId: ID.unique(),
    data: {
      compartmentName: name.trim(),
      compartmentType: "fridge",
      isConfigured: true,
      userId,
    },
  });
}

export function listCompartmentItems(compartmentId: string) {
  return tablesDb.listRows<AppwriteItemRow>({
    databaseId: FRIDGE_DATABASE_ID,
    tableId: ITEMS_TABLE_ID,
    queries: [Query.equal("compartments", compartmentId), Query.orderAsc("expiryDate")],
  });
}

export function createItemRow(
  compartmentId: string,
  item: Omit<FridgeItem, "id" | "dateAdded"> & { dateAdded?: string },
) {
  return tablesDb.createRow<AppwriteItemRow>({
    databaseId: FRIDGE_DATABASE_ID,
    tableId: ITEMS_TABLE_ID,
    rowId: ID.unique(),
    data: {
      itemName: item.name,
      quantity: normalizeQuantity(item.quantity),
      unit: normalizeUnit(item.unit),
      expiryDate: item.expiryDate,
      addedDate: item.dateAdded ?? new Date().toISOString(),
      locationLabel: null,
      compartments: compartmentId,
    },
  });
}

export function updateItemRow(rowId: string, updates: Partial<FridgeItem>) {
  const data: Partial<AppwriteItemRow> = {};

  if (updates.name !== undefined) {
    data.itemName = updates.name;
  }

  if (updates.quantity !== undefined) {
    data.quantity = normalizeQuantity(updates.quantity);
  }

  if (updates.unit !== undefined) {
    data.unit = normalizeUnit(updates.unit);
  }

  if (updates.expiryDate !== undefined) {
    data.expiryDate = updates.expiryDate;
  }

  return tablesDb.updateRow<AppwriteItemRow>({
    databaseId: FRIDGE_DATABASE_ID,
    tableId: ITEMS_TABLE_ID,
    rowId,
    data,
  });
}

export function deleteItemRow(rowId: string) {
  return tablesDb.deleteRow({
    databaseId: FRIDGE_DATABASE_ID,
    tableId: ITEMS_TABLE_ID,
    rowId,
  });
}

export function mapCompartmentRow(row: AppwriteCompartmentRow): FridgeCompartment {
  return {
    id: row.$id,
    name: row.compartmentName,
    type: row.compartmentType,
    isConfigured: row.isConfigured,
  };
}

export function mapItemRow(row: AppwriteItemRow): FridgeItem {
  return {
    id: row.$id,
    name: row.itemName,
    quantity: row.quantity ?? 1,
    unit: row.unit ?? "piece",
    category: "other",
    expiryDate: row.expiryDate ?? row.addedDate,
    dateAdded: row.addedDate,
  };
}

function normalizeQuantity(quantity: number | undefined) {
  if (quantity === undefined || Number.isNaN(quantity)) {
    return 1;
  }

  return Math.max(0, Math.round(quantity));
}

function normalizeUnit(unit: string | undefined): ItemUnit {
  switch (unit) {
    case "kg":
    case "lb":
    case "litre":
    case "piece":
      return unit;
    default:
      return "piece";
  }
}

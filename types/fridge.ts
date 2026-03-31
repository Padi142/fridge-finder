import { getCalendarDayDifference } from "@/lib/date";

export interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: FoodCategory;
  expiryDate: string;
  dateAdded: string;
  imageUri?: string;
  confidence?: number;
}

export type CompartmentType = "fridge" | "freezer" | "pantry" | "cabinet";

export interface FridgeCompartment {
  id: string;
  name: string;
  type: CompartmentType;
  isConfigured: boolean;
}

export type FoodCategory =
  | "dairy"
  | "meat"
  | "vegetables"
  | "fruits"
  | "beverages"
  | "condiments"
  | "leftovers"
  | "other";

export interface DetectedItem {
  name: string;
  quantity: number;
  unit: string;
  category: FoodCategory;
  estimatedExpiryDays: number;
  confidence: number;
}

export interface DetectedItemInput extends DetectedItem {
  expiryDate: string;
}

export type ExpiryStatus = "fresh" | "expiringSoon" | "expired";

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const diffDays = getDaysUntilExpiry(expiryDate);

  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "expiringSoon";
  return "fresh";
}

export function getDaysUntilExpiry(expiryDate: string): number {
  return getCalendarDayDifference(expiryDate);
}

export const categoryIcons: Record<FoodCategory, string> = {
  dairy: "🥛",
  meat: "🥩",
  vegetables: "🥬",
  fruits: "🍎",
  beverages: "🥤",
  condiments: "🧂",
  leftovers: "🥡",
  other: "📦",
};

export const categoryLabels: Record<FoodCategory, string> = {
  dairy: "Dairy",
  meat: "Meat & Fish",
  vegetables: "Vegetables",
  fruits: "Fruits",
  beverages: "Beverages",
  condiments: "Condiments",
  leftovers: "Leftovers",
  other: "Other",
};

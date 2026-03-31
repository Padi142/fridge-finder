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

export type ExpiryStatus = "fresh" | "expiringSoon" | "expired";

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "expiringSoon";
  return "fresh";
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

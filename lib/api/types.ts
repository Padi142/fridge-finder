import type { DetectedItem } from "@/types/fridge";

export interface AnalyzeImageRequest {
  base64: string;
}

export interface AnalyzeImageResponse {
  items: DetectedItem[];
}

export interface ApiErrorResponse {
  error: string;
}

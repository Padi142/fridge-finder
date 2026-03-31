import { useMutation } from "@tanstack/react-query";
import {
  apiClient,
  type AnalyzeImageRequest,
  type AnalyzeImageResponse,
} from "@/lib/api/client";

export function useAnalyzeImageMutation() {
  return useMutation<AnalyzeImageResponse, Error, AnalyzeImageRequest>({
    mutationFn: (body) => apiClient.analyzeImage(body),
  });
}

import createClient from "openapi-fetch";
import { apiBaseUrl } from "@/lib/api/base-url";
import type { paths } from "@/lib/api/openapi.generated";
import type {
  AnalyzeImageRequest,
  AnalyzeImageResponse,
  ApiErrorResponse,
} from "@/lib/api/types";

const DEFAULT_TIMEOUT_MS = 20_000;

function getErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  if ("error" in error && typeof error.error === "string") {
    return error.error;
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  return null;
}

function createCancelableSignal(timeoutMs: number, signal?: AbortSignal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error("The request took too long to complete."));
  }, timeoutMs);

  const abortFromOutside = () => {
    controller.abort(signal?.reason);
  };

  signal?.addEventListener("abort", abortFromOutside, { once: true });

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abortFromOutside);
    },
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown, options?: ErrorOptions) {
    super(message, options);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface ApiClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
}

export interface RequestOptions {
  signal?: AbortSignal;
}

export function createApiClient(options: ApiClientOptions = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const client = createClient<paths>({
    baseUrl: options.baseUrl ?? apiBaseUrl,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });

  return {
    async analyzeImage(
      body: AnalyzeImageRequest,
      requestOptions: RequestOptions = {}
    ): Promise<AnalyzeImageResponse> {
      const { signal, cleanup } = createCancelableSignal(timeoutMs, requestOptions.signal);

      try {
        const { data, error, response } = await client.POST("/analyze-image", {
          body,
          signal,
        });

        if (error) {
          throw new ApiError(
            getErrorMessage(error) ?? "The API request failed.",
            response.status,
            error
          );
        }

        if (!data) {
          throw new ApiError("The API returned an empty response.", 200, null);
        }

        return data as AnalyzeImageResponse;
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }

        const message =
          error instanceof Error && error.name === "AbortError"
            ? "The request timed out. Check that the local API is running and reachable from Expo."
            : getErrorMessage(error) ?? "Unable to reach the API.";

        throw new ApiError(message, 0, null, { cause: error });
      } finally {
        cleanup();
      }
    },
  };
}

export const apiClient = createApiClient();

export type { AnalyzeImageRequest, AnalyzeImageResponse, ApiErrorResponse };

import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_API_PORT = "3000";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function resolveExpoHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) {
    return null;
  }

  const [host] = hostUri.split(":");

  return host || null;
}

export function resolveApiBaseUrl(): string {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return stripTrailingSlash(configuredBaseUrl);
  }

  if (Platform.OS === "web") {
    return `http://localhost:${DEFAULT_API_PORT}`;
  }

  const expoHost = resolveExpoHost();

  if (expoHost) {
    return `http://${expoHost}:${DEFAULT_API_PORT}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${DEFAULT_API_PORT}`;
  }

  return `http://localhost:${DEFAULT_API_PORT}`;
}

export const apiBaseUrl = resolveApiBaseUrl();

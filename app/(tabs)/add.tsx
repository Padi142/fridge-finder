import { useFridge } from "@/context/FridgeContext";
import { useAnalyzeImageMutation } from "@/hooks/use-analyze-image";
import { ApiError } from "@/lib/api/client";
import { addDaysToDateInput, parseDateInput } from "@/lib/date";
import type { DetectedItemInput } from "@/types/fridge";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  Check,
  Image as ImageIcon,
  Scan,
  Sparkles,
  X,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<"camera" | "gallery" | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<
    DetectedItemInput[] | null
  >(null);
  const cameraRef = useRef<CameraView>(null);
  const { addDetectedItems, hasCompartment, isMutating } = useFridge();
  const analyzeImageMutation = useAnalyzeImageMutation();
  const insets = useSafeAreaInsets();

  const getPreviewSource = (
    base64?: string | null,
    fallbackUri?: string | null,
  ) => {
    if (base64) {
      return `data:image/jpeg;base64,${base64}`;
    }

    return fallbackUri ?? null;
  };

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      return;
    }

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      base64: true,
    });

    if (photo?.uri) {
      setCapturedImage(getPreviewSource(photo.base64, photo.uri));
      void processImage(photo.base64 ?? undefined);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setCapturedImage(getPreviewSource(asset.base64, asset.uri));
      void processImage(asset.base64 ?? undefined);
    }
  };

  const processImage = async (base64?: string) => {
    if (!base64) {
      Alert.alert(
        "Processing Error",
        "The selected image could not be encoded. Please try another photo.",
      );
      setCapturedImage(null);
      return;
    }

    try {
      const result = await analyzeImageMutation.mutateAsync({ base64 });
      setDetectedItems(
        result.items.map((item) => ({
          ...item,
          expiryDate: addDaysToDateInput(item.estimatedExpiryDays),
        })),
      );
    } catch (error) {
      Alert.alert(
        "Processing Error",
        error instanceof ApiError
          ? error.message
          : "Failed to analyze the image. Please try again.",
      );
      setCapturedImage(null);
    }
  };

  const updateDetectedItem = (
    index: number,
    field: "name" | "expiryDate",
    value: string,
  ) => {
    setDetectedItems((currentItems) => {
      if (!currentItems) {
        return currentItems;
      }

      return currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      );
    });
  };

  const handleAddItems = () => {
    if (!detectedItems) {
      return;
    }

    const parsedItems: DetectedItemInput[] = [];

    for (const item of detectedItems) {
      const trimmedName = item.name.trim();
      const parsedExpiryDate = parseDateInput(item.expiryDate);

      if (!trimmedName) {
        Alert.alert("Missing Name", "Each detected item needs a product name.");
        return;
      }

      if (!parsedExpiryDate) {
        Alert.alert(
          "Invalid Expiry Date",
          `Use YYYY-MM-DD for ${trimmedName}.`,
        );
        return;
      }

      parsedItems.push({
        ...item,
        name: trimmedName,
        expiryDate: parsedExpiryDate,
      });
    }

    void addDetectedItems(parsedItems, capturedImage ?? undefined)
      .then(() => {
        resetState();
      })
      .catch((error) => {
        Alert.alert(
          "Unable to Add Items",
          error instanceof Error ? error.message : "Please try again.",
        );
      });
  };

  const resetState = () => {
    setMode(null);
    setCapturedImage(null);
    setDetectedItems(null);
    analyzeImageMutation.reset();
  };

  if (!permission?.granted && mode === "camera") {
    return (
      <View className="flex-1 bg-[#FAFAFA]">
        <View
          className="flex-1 items-center justify-center px-8"
          style={{ paddingTop: insets.top }}
        >
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl bg-[#E8E8E8]">
            <Camera size={40} color="#6B6B6B" />
          </View>
          <Text
            className="mb-2 text-[22px] font-bold text-[#0F0F0F]"
            style={{ fontFamily: "Poppins" }}
          >
            Camera Access
          </Text>
          <Text
            className="mb-6 text-center text-[15px] font-medium text-[#6B6B6B]"
            style={{ fontFamily: "Poppins" }}
          >
            Allow camera access to scan your fridge items
          </Text>
          <TouchableOpacity
            className="rounded-2xl bg-[#0F0F0F] px-8 py-4"
            onPress={handleRequestPermission}
          >
            <Text
              className="text-[15px] font-bold text-white"
              style={{ fontFamily: "Poppins" }}
            >
              Grant Access
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (mode === "camera" && !capturedImage) {
    return (
      <View className="flex-1 bg-[#0F0F0F]">
        <CameraView style={{ flex: 1 }} ref={cameraRef}>
          <View className="flex-1 justify-between bg-transparent p-6">
            <TouchableOpacity
              className="h-12 w-12 items-center justify-center self-start rounded-full bg-[rgba(255,255,255,0.2)]"
              onPress={() => setMode(null)}
            >
              <X color="white" size={24} />
            </TouchableOpacity>
            <View className="mb-8 items-center">
              <TouchableOpacity
                className="h-20 w-20 items-center justify-center rounded-full border-4 border-white"
                onPress={takePicture}
              >
                <View className="h-14 w-14 rounded-full bg-white" />
              </TouchableOpacity>
              <Text
                className="mt-4 text-[15px] font-medium text-white"
                style={{ fontFamily: "Poppins" }}
              >
                Tap to capture
              </Text>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  if (analyzeImageMutation.isPending) {
    return (
      <View
        className="flex-1 items-center justify-center bg-[#FAFAFA] px-8"
        style={{ paddingTop: insets.top }}
      >
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl bg-[#00C853]">
          <Sparkles size={40} color="white" />
        </View>
        <ActivityIndicator
          size="large"
          color="#00C853"
          style={{ marginBottom: 24 }}
        />
        <Text
          className="mb-2 text-center text-[22px] font-bold text-[#0F0F0F]"
          style={{ fontFamily: "Poppins" }}
        >
          Analyzing...
        </Text>
        <Text
          className="text-center text-[15px] font-medium text-[#6B6B6B]"
          style={{ fontFamily: "Poppins" }}
        >
          Identifying your fridge
        </Text>
      </View>
    );
  }

  if (detectedItems) {
    return (
      <View className="flex-1 bg-[#FAFAFA]">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 160 + insets.bottom,
            paddingTop: insets.top + 12,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            className="mb-2 text-[24px] font-bold text-[#0F0F0F]"
            style={{ fontFamily: "Poppins" }}
          >
            Review Detected Items
          </Text>
          <Text
            className="mb-5 text-[14px] font-medium text-[#6B6B6B]"
            style={{ fontFamily: "Poppins" }}
          >
            Adjust names and expiry dates before adding them to your fridge.
          </Text>

          {capturedImage && (
            <View className="mb-5 overflow-hidden rounded-2xl border-2 border-[#E8E8E8] bg-[#F3F3F3]">
              <ExpoImage
                source={{ uri: capturedImage }}
                style={{ width: "100%", height: 180 }}
                contentFit="cover"
                transition={150}
              />
            </View>
          )}

          <View className="gap-3">
            {detectedItems.map((item, index) => (
              <View
                key={`${item.name}-${index}`}
                className="rounded-[28px] border-2 border-[#E8E8E8] bg-white p-4"
              >
                <View className="mb-3 flex-row items-center justify-between gap-3">
                  <Text
                    className="flex-1 text-[12px] font-bold uppercase tracking-[1.5px] text-[#9A9A9A]"
                    style={{ fontFamily: "Poppins" }}
                    numberOfLines={1}
                  >
                    Detected Item {index + 1}
                  </Text>
                  <View
                    className="rounded-full px-3 py-1"
                    style={{
                      backgroundColor:
                        item.confidence > 0.8 ? "#00C853" : "#FF9100",
                    }}
                  >
                    <Text
                      className="text-[12px] font-bold text-white"
                      style={{ fontFamily: "Poppins" }}
                    >
                      {Math.round(item.confidence * 100)}%
                    </Text>
                  </View>
                </View>

                <View className="gap-3">
                  <View>
                    <Text
                      className="mb-1 text-[11px] font-bold uppercase tracking-[1.4px] text-[#9A9A9A]"
                      style={{ fontFamily: "Poppins" }}
                    >
                      Name
                    </Text>
                    <TextInput
                      value={item.name}
                      onChangeText={(value) => {
                        updateDetectedItem(index, "name", value);
                      }}
                      placeholder="Milk"
                      placeholderTextColor="#9A9A9A"
                      className="rounded-2xl border-2 border-[#E8E8E8] bg-[#FAFAFA] px-4 py-3 text-[15px] text-[#0F0F0F]"
                      style={{ fontFamily: "Poppins" }}
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
                      value={item.expiryDate}
                      onChangeText={(value) => {
                        updateDetectedItem(index, "expiryDate", value);
                      }}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9A9A9A"
                      className="rounded-2xl border-2 border-[#E8E8E8] bg-[#FAFAFA] px-4 py-3 text-[15px] text-[#0F0F0F]"
                      style={{ fontFamily: "Poppins" }}
                      maxLength={10}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                </View>

                <Text
                  className="mt-3 text-[13px] font-medium text-[#6B6B6B]"
                  style={{ fontFamily: "Poppins" }}
                >
                  {item.quantity} {item.unit} • {item.estimatedExpiryDays} day
                  {item.estimatedExpiryDays === 1 ? "" : "s"} estimated
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            className="mt-6 flex-row items-center justify-center gap-2 rounded-2xl border-2 border-[#E8E8E8] bg-white py-4"
            onPress={resetState}
          >
            <X size={20} color="#6B6B6B" />
            <Text
              className="text-[15px] font-bold text-[#6B6B6B]"
              style={{ fontFamily: "Poppins" }}
            >
              Retake
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View
          className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-3"
          style={{
            paddingBottom: Math.max(insets.bottom + 8, 24),
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.06,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#0F0F0F] py-4"
            onPress={handleAddItems}
            disabled={isMutating}
          >
            <Check size={20} color="white" />
            <Text
              className="text-[15px] font-bold text-white"
              style={{ fontFamily: "Poppins" }}
            >
              {isMutating ? "Adding..." : "Add Items"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
          paddingTop: insets.top + 12,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6">
          <Text
            className="text-[28px] font-bold text-[#0F0F0F]"
            style={{ fontFamily: "Poppins" }}
          >
            Add Items
          </Text>
          <Text
            className="text-[15px] font-medium text-[#6B6B6B]"
            style={{ fontFamily: "Poppins" }}
          >
            Scan or upload a photo
          </Text>
        </View>

        {!hasCompartment && (
          <View className="mb-6 rounded-2xl border-2 border-[#FF9100] bg-[#FFF8E1] p-4">
            <Text
              className="text-[14px] font-bold text-[#0F0F0F]"
              style={{ fontFamily: "Poppins" }}
            >
              Create a compartment first
            </Text>
            <Text
              className="mt-1 text-[13px] font-medium text-[#6B6B6B]"
              style={{ fontFamily: "Poppins" }}
            >
              Go to Home tab and create a fridge compartment before adding
              items.
            </Text>
          </View>
        )}

        <View className="flex-row gap-4">
          <TouchableOpacity
            className="flex-1 items-center rounded-3xl border-2 border-[#E8E8E8] bg-white p-6"
            style={{ opacity: hasCompartment ? 1 : 0.5 }}
            onPress={() => setMode("camera")}
            disabled={!hasCompartment}
          >
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-[#0F0F0F]">
              <Camera size={28} color="white" />
            </View>
            <Text
              className="mb-1 text-[16px] font-bold text-[#0F0F0F]"
              style={{ fontFamily: "Poppins" }}
            >
              Camera
            </Text>
            <Text
              className="text-[13px] font-medium text-[#9A9A9A]"
              style={{ fontFamily: "Poppins" }}
            >
              Take a photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 items-center rounded-3xl border-2 border-[#E8E8E8] bg-white p-6"
            style={{ opacity: hasCompartment ? 1 : 0.5 }}
            onPress={pickImage}
            disabled={!hasCompartment}
          >
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-[#00C853]">
              <ImageIcon size={28} color="white" />
            </View>
            <Text
              className="mb-1 text-[16px] font-bold text-[#0F0F0F]"
              style={{ fontFamily: "Poppins" }}
            >
              Gallery
            </Text>
            <Text
              className="text-[13px] font-medium text-[#9A9A9A]"
              style={{ fontFamily: "Poppins" }}
            >
              Upload image
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6 rounded-2xl border-2 border-[#E8E8E8] bg-white p-5">
          <View className="mb-3 flex-row items-center gap-2">
            <Scan size={18} color="#00C853" />
            <Text
              className="text-[14px] font-bold text-[#0F0F0F]"
              style={{ fontFamily: "Poppins" }}
            >
              Tips for best results
            </Text>
          </View>
          <View className="gap-2">
            <Text
              className="text-[14px] font-medium text-[#6B6B6B]"
              style={{ fontFamily: "Poppins" }}
            >
              • Use good lighting
            </Text>
            <Text
              className="text-[14px] font-medium text-[#6B6B6B]"
              style={{ fontFamily: "Poppins" }}
            >
              • Keep items clearly visible
            </Text>
            <Text
              className="text-[14px] font-medium text-[#6B6B6B]"
              style={{ fontFamily: "Poppins" }}
            >
              • Show labels when possible
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

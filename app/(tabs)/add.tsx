import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon, X, Check, Sparkles } from "lucide-react-native";
import { useFridge } from "@/context/FridgeContext";
import { useAnalyzeImageMutation } from "@/hooks/use-analyze-image";
import { ApiError } from "@/lib/api/client";
import type { DetectedItem } from "@/types/fridge";
import palette from "@/constants/colors";

export default function AddScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<"camera" | "gallery" | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[] | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { addDetectedItems, hasCompartment, isMutating } = useFridge();
  const analyzeImageMutation = useAnalyzeImageMutation();

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      if (photo?.uri) {
        setCapturedImage(photo.uri);
        void processImage(photo.base64 ?? undefined);
      }
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
      setCapturedImage(asset.uri);
      void processImage(asset.base64 ?? undefined);
    }
  };

  const processImage = async (base64?: string) => {
    if (!base64) {
      Alert.alert(
        "Processing Error",
        "The selected image could not be encoded. Please try another photo."
      );
      setCapturedImage(null);
      return;
    }

    try {
      const result = await analyzeImageMutation.mutateAsync({ base64 });
      setDetectedItems(result.items);
    } catch (error) {
      Alert.alert(
        "Processing Error",
        error instanceof ApiError
          ? error.message
          : "Failed to analyze the image. Please try again."
      );
      setCapturedImage(null);
    }
  };

  const handleAddItems = () => {
    if (detectedItems) {
      void addDetectedItems(detectedItems, capturedImage ?? undefined)
        .then(() => {
          resetState();
        })
        .catch((error) => {
          Alert.alert(
            "Unable to Add Items",
            error instanceof Error ? error.message : "Please try again.",
          );
        });
    }
  };

  const resetState = () => {
    setMode(null);
    setCapturedImage(null);
    setDetectedItems(null);
    analyzeImageMutation.reset();
  };

  if (!permission?.granted && mode === "camera") {
    return (
      <View className="flex-1 bg-[#f8faf7]">
        <View className="flex-1 items-center justify-center px-8">
          <Camera size={64} color={palette.light.tint} />
          <Text className="mb-2 mt-4 text-[22px] font-bold text-[#1a1a1a]">
            Camera Access Needed
          </Text>
          <Text className="mb-6 text-center text-[15px] text-[#666666]">
            We need camera access to take photos of your fridge
          </Text>
          <TouchableOpacity
            className="rounded-xl px-8 py-3.5"
            style={{ backgroundColor: palette.light.tint }}
            onPress={handleRequestPermission}
          >
            <Text className="text-base font-bold text-white">Grant Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (mode === "camera" && !capturedImage) {
    return (
      <View className="flex-1 bg-[#f8faf7]">
        <CameraView style={{ flex: 1 }} ref={cameraRef}>
          <View className="flex-1 justify-between bg-transparent p-6">
            <TouchableOpacity
              className="self-start p-2"
              onPress={() => setMode(null)}
            >
              <X color="white" size={28} />
            </TouchableOpacity>
            <View className="mb-8 items-center">
              <TouchableOpacity
                className="h-20 w-20 items-center justify-center rounded-full bg-[rgba(255,255,255,0.3)]"
                onPress={takePicture}
              >
                <View className="h-16 w-16 rounded-full bg-white" />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  if (analyzeImageMutation.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8faf7]">
        <View className="items-center px-8">
          <Sparkles size={48} color={palette.light.tint} />
          <ActivityIndicator
            size="large"
            color={palette.light.tint}
            style={{ marginBottom: 24, marginTop: 24 }}
          />
          <Text className="mb-2 text-[22px] font-bold text-[#1a1a1a]">
            Analyzing your fridge...
          </Text>
          <Text className="text-center text-[15px] text-[#666666]">
            Our AI is identifying items and estimating expiration dates
          </Text>
        </View>
      </View>
    );
  }

  if (detectedItems) {
    return (
      <View className="flex-1 bg-[#f8faf7]">
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text className="mb-4 text-2xl font-extrabold text-[#1a1a1a]">Items Detected</Text>
          {capturedImage && (
            <Image source={{ uri: capturedImage }} className="mb-5 h-[200px] w-full rounded-2xl" />
          )}

          <View className="gap-3">
            {detectedItems.map((item, index) => (
              <View
                key={index}
                className="rounded-xl bg-white p-4"
                style={{
                  shadowColor: palette.light.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View className="mb-1 flex-row items-center justify-between">
                  <Text className="text-base font-bold text-[#1a1a1a]">{item.name}</Text>
                  <View
                    className="rounded-lg px-2 py-1"
                    style={{
                      backgroundColor:
                        item.confidence > 0.8 ? "#E8F5E9" : "#FFF3E0",
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color:
                          item.confidence > 0.8
                            ? palette.light.fresh
                            : palette.light.expiringSoon,
                      }}
                    >
                      {Math.round(item.confidence * 100)}%
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-[#666666]">
                  {item.quantity} {item.unit} • Expires in {item.estimatedExpiryDays} days
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-6 flex-row gap-3">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 rounded-[14px] bg-[#F5F5F5] py-4"
              onPress={resetState}
            >
              <X size={20} color={palette.light.textSecondary} />
              <Text className="text-base font-bold text-[#666666]">Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 rounded-[14px] py-4"
              style={{ backgroundColor: palette.light.tint }}
              onPress={handleAddItems}
              disabled={isMutating}
            >
              <Check size={20} color="white" />
              <Text className="text-base font-bold text-white">
                {isMutating ? "Adding..." : "Add to Fridge"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8faf7]">
      <View className="flex-1 justify-center p-6">
        {!hasCompartment && (
          <View className="mb-6 rounded-2xl bg-[#FFF3E0] p-4">
            <Text className="text-sm font-bold text-[#1a1a1a]">Create a compartment first</Text>
            <Text className="mt-1 text-sm leading-5 text-[#666666]">
              Your Appwrite account does not have a compartment yet. Create one from the home tab before scanning items.
            </Text>
          </View>
        )}

        <Text className="mb-2 text-center text-[28px] font-extrabold text-[#1a1a1a]">
          Add Items to Fridge
        </Text>
        <Text className="mb-8 text-center text-base text-[#666666]">
          Take a photo or upload an image of your fridge
        </Text>

        <View className="flex-row gap-4">
          <TouchableOpacity
            className="flex-1 items-center rounded-[20px] bg-white p-6"
            style={{
              shadowColor: palette.light.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
            onPress={() => setMode("camera")}
            disabled={!hasCompartment}
          >
            <View className="mb-4 h-[72px] w-[72px] items-center justify-center rounded-full bg-[#E8F5E9]">
              <Camera size={32} color={palette.light.tint} />
            </View>
            <Text className="mb-1 text-base font-bold text-[#1a1a1a]">Take Photo</Text>
            <Text className="text-[13px] text-[#666666]">Use camera to capture</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 items-center rounded-[20px] bg-white p-6"
            style={{
              shadowColor: palette.light.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
            onPress={pickImage}
            disabled={!hasCompartment}
          >
            <View className="mb-4 h-[72px] w-[72px] items-center justify-center rounded-full bg-[#E3F2FD]">
              <ImageIcon size={32} color="#2196F3" />
            </View>
            <Text className="mb-1 text-base font-bold text-[#1a1a1a]">Upload Image</Text>
            <Text className="text-[13px] text-[#666666]">Select from gallery</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-10 rounded-2xl bg-white p-5">
          <Text className="mb-3 text-sm font-bold text-[#1a1a1a]">Tips for best results:</Text>
          <Text className="mb-1.5 text-sm text-[#666666]">• Ensure good lighting</Text>
          <Text className="mb-1.5 text-sm text-[#666666]">• Capture items clearly</Text>
          <Text className="text-sm text-[#666666]">• Include visible labels if possible</Text>
        </View>
      </View>
    </View>
  );
}

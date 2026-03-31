// template
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ModalScreen() {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={() => router.back()}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-[rgba(0,0,0,0.5)]"
        onPress={() => router.back()}
      >
        <View className="mx-5 min-w-[300px] items-center rounded-[20px] bg-white p-6">
          <Text className="mb-4 text-xl font-bold text-[#1a1a1a]">Modal</Text>
          <Text className="mb-6 text-center leading-5 text-[#666666]">
            This is an example modal with proper fade animation. You can edit it
            in app/modal.tsx.
          </Text>

          <TouchableOpacity
            className="min-w-[100px] rounded-[10px] bg-[#007AFF] px-6 py-3"
            onPress={() => router.back()}
          >
            <Text className="text-center font-semibold text-white">Close</Text>
          </TouchableOpacity>
        </View>
      </Pressable>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Modal>
  );
}

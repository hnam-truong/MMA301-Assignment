import React from "react";
import { View, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { Home, Heart } from "lucide-react-native";

export default function NavigationComponent() {
  const router = useRouter();

  return (
    <View className="flex-row justify-around items-center pt-1 bg-white border-t border-gray-300 h-[60px]">
      <Pressable onPress={() => router.push("/")} className="flex items-center space-y-2">
        <Home size={24} className="text-gray-500" />
        <Text className="text-gray-500 text-[10px]">Home</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/favorites")}
        className="flex items-center space-y-2"
      >
        <Heart size={24} className="text-gray-500" />
        <Text className="text-gray-500 text-[10px]">Favorites</Text>
      </Pressable>
    </View>
  );
}

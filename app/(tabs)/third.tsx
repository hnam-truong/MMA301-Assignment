import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ItemApi } from "@/api/item";
import { Item } from "@/type/item";
import { useFavorites } from "../FavoritesContext";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";

export default function IsBooleanScreen() {
  const [isBooleanItems, setIsBooleanItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    state: { favorites },
    dispatch,
  } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    fetchIsBooleanItems();
  }, []);

  const fetchIsBooleanItems = async () => {
    setIsLoading(true);
    try {
      const data = await ItemApi.getAll();
      const filteredData = data
        .filter((item: Item) => item.isBoolean && item.percentage > 0.1)
        .sort((a, b) => a.price - b.price);
      setIsBooleanItems(filteredData);
    } catch (error) {
      console.error("Error fetching glass surface items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      dispatch({ type: "REMOVE_FAVORITE", payload: id });
    } else {
      dispatch({ type: "ADD_FAVORITE", payload: id });
    }
  };

  const addAllToFavorites = () => {
    isBooleanItems.forEach((item) => {
      if (!favorites.includes(item.id)) {
        dispatch({ type: "ADD_FAVORITE", payload: item.id });
      }
    });
  };

  const removeAllFromFavorites = () => {
    isBooleanItems.forEach((item) => {
      if (favorites.includes(item.id)) {
        dispatch({ type: "REMOVE_FAVORITE", payload: item.id });
      }
    });
  };

  // Determine if all or none of the items are favorited
  const allFavorited = isBooleanItems.every((item) =>
    favorites.includes(item.id)
  );
  const noneFavorited = isBooleanItems.every(
    (item) => !favorites.includes(item.id)
  );

  const renderItem = (item: Item) => {
    const isFavorite = favorites.includes(item.id);
    return (
      <TouchableOpacity
        key={item.id}
        className="mb-4 bg-white rounded-lg shadow"
        onPress={() =>
          router.push({ pathname: "/detail", params: { id: item.id } })
        }
      >
        <View className="relative">
          <Image
            source={{ uri: item.image }}
            style={{ width: "100%", height: 200, borderRadius: 8 }}
            resizeMode="cover"
          />
          {/* Favorite Icon */}
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "white",
              padding: 5,
              borderRadius: 20,
            }}
          >
            <Heart
              color={isFavorite ? "#EF4444" : "#9CA3AF"}
              fill={isFavorite ? "#EF4444" : "none"}
            />
          </TouchableOpacity>
        </View>

        <View className="p-4">
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-xl font-bold">{item.itemName}</Text>
          </View>
          <Text className="text-gray-500 mt-1">
            Category: {item.itemCategory}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-700 font-semibold text-lg">
              ${item.price.toFixed(2)}
            </Text>
            <Text className="text-red-500 font-bold ml-2">
              -{(item.percentage * 100).toFixed(0)}% OFF
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 mb-12">
      <View className="flex-row justify-between px-4 py-2">
        <TouchableOpacity
          onPress={addAllToFavorites}
          disabled={allFavorited}
          className={`rounded-full px-4 py-2 ${
            allFavorited ? "bg-gray-300" : "bg-blue-500"
          }`}
        >
          <Text className="text-white font-semibold">Add All to Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={removeAllFromFavorites}
          disabled={noneFavorited}
          className={`rounded-full px-4 py-2 ${
            noneFavorited ? "bg-gray-300" : "bg-red-500"
          }`}
        >
          <Text className="text-white font-semibold">
            Remove All from Favorites
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : isBooleanItems.length > 0 ? (
          isBooleanItems.map((item) => renderItem(item))
        ) : (
          <Text className="text-center text-gray-600">
            No items suitable
            10% found.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { useFavorites } from "../FavoritesContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { Swipeable } from "react-native-gesture-handler";
import { ItemApi } from "@/api/item";
import { Item } from "@/type/item";

export default function FavoritesScreen() {
  const {
    state: { favorites },
    dispatch,
  } = useFavorites();
  const [favoriteItems, setFavoriteItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const openSwipeableRef = useRef<Swipeable | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      resetStates();
      return () => {};
    }, [])
  );

  const resetStates = () => {
    setSelectedItems([]);
    setIsSelectionMode(false);
  };

  useEffect(() => {
    loadFavorites();
  }, [favorites]);

  useEffect(() => {
    if (selectedItems.length === 0) {
      setIsSelectionMode(false);
    }
  }, [selectedItems]);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const favoriteData = await Promise.all(
        favorites.map((id) => ItemApi.getById(id))
      );
      setFavoriteItems(favoriteData.filter((item) => item !== null) as Item[]);
    } catch (error) {
      console.error("Error loading favorites:", error);
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

  const handleLongPress = (productId: string) => {
    if (favoriteItems.length > 1) {
      setIsSelectionMode(true);
      setSelectedItems((prev) => [...prev, productId]);
    }
  };

  const handlePress = (productId: string) => {
    if (isSelectionMode) {
      setSelectedItems((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );
    } else {
      router.push({
        pathname: "/detail",
        params: { id: productId },
      });
    }
  };

  const handleRemoveSelected = () => {
    if (selectedItems.length > 0) {
      Alert.alert(
        "Remove Selected",
        `Are you sure you want to remove ${selectedItems.length} item(s) from your favorites?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              if (selectedItems.length === favoriteItems.length) {
                dispatch({ type: "CLEAR_FAVORITES" });
              } else {
                selectedItems.forEach((productId) => {
                  dispatch({ type: "REMOVE_FAVORITE", payload: productId });
                });
              }
              setSelectedItems([]);
              setIsSelectionMode(false);
            },
          },
        ]
      );
    } else {
      Alert.alert("No items selected", "Please select items to unfavorite.");
    }
  };

  const renderRightActions = (product: Item) => {
    return (
      <TouchableOpacity
        className="bg-red-500 w-20 h-full justify-center items-center rounded-lg"
        onPress={() => handleDelete(product)}
      >
        <Trash2 size={24} color="#fff" />
      </TouchableOpacity>
    );
  };

  const handleDelete = (product: Item) => {
    Alert.alert(
      "Remove from Favorites",
      `Are you sure you want to remove ${product.itemName} from your favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            toggleFavorite(product.id);
          },
        },
      ]
    );
  };

  const renderSkeletonItem = () => (
    <View className="bg-gray-100 flex-row items-center p-4 rounded-lg shadow-sm mb-4">
      <View className="w-16 h-16 rounded-lg mr-4 bg-gray-200" />
      <View className="flex-1">
        <View className="w-3/4 h-6 bg-gray-200 rounded mb-2" />
        <View className="w-1/2 h-4 bg-gray-200 rounded" />
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Item }) => {
    if (isLoading) return renderSkeletonItem();
    return (
      <Swipeable
        ref={(ref) => {
          swipeableRefs.current[item.id] = ref;
          if (ref) {
            if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
              openSwipeableRef.current.close(); // Close the previously open swipeable
            }
            openSwipeableRef.current = ref; // Update the currently open swipeable
          }
        }}
        renderRightActions={() => renderRightActions(item)}
        enabled={!isSelectionMode}
        containerStyle={{ marginBottom: 10 }}
        onSwipeableWillOpen={() => {
          if (
            openSwipeableRef.current &&
            openSwipeableRef.current !== swipeableRefs.current[item.id]
          ) {
            openSwipeableRef.current.close(); // Close the previous swipeable
          }
          openSwipeableRef.current = swipeableRefs.current[item.id]; // Update the open swipeable ref
        }}
      >
        <TouchableOpacity
          onLongPress={() => handleLongPress(item.id)}
          onPress={() => handlePress(item.id)}
          delayLongPress={500}
        >
          <View
            className={`bg-gray-50 flex-row items-center p-4 rounded-lg shadow-sm ${
              isSelectionMode && selectedItems.includes(item.id)
                ? "bg-blue-50"
                : ""
            }`}
          >
            <Image
              source={{ uri: item.image }}
              className="w-16 h-16 rounded-lg mr-4"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text numberOfLines={1} className="text-lg font-bold mb-1">
                {item.itemName}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                ${(item.price * (1 - item.percentage)).toFixed(2)}
              </Text>
            </View>
            {isSelectionMode && (
              <View className="w-6 h-6 border-2 border-blue-500 rounded-full justify-center items-center">
                {selectedItems.includes(item.id) && (
                  <View className="w-4 h-4 bg-blue-500 rounded-full" />
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(favoriteItems.map((item) => item.id));
    setIsSelectionMode(true);
  };

  const handleUnselectAll = () => {
    setSelectedItems([]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4 ">Your Favorites</Text>
        {favoriteItems.length > 0 && (
          <Text className="text-lg text-gray-600 mb-2 font-medium">
            {favoriteItems.length} item{favoriteItems.length !== 1 ? "s" : ""}{" "}
            in favorites
          </Text>
        )}
        {!isLoading && favoriteItems.length >= 2 && (
          <View className="flex-row justify-between mb-4">
            <View className="flex-row">
              <TouchableOpacity
                onPress={handleSelectAll}
                className={`px-4 py-2 bg-blue-500 ${
                  selectedItems.length === favoriteItems.length
                    ? "opacity-50"
                    : ""
                } ${
                  selectedItems.length > 0 ? "rounded-l-full" : "rounded-full"
                }`}
                disabled={selectedItems.length === favoriteItems.length}
              >
                <Text className="text-white">Select All</Text>
              </TouchableOpacity>
              {selectedItems.length > 0 && (
                <TouchableOpacity
                  onPress={handleUnselectAll}
                  className="px-4 py-2 bg-gray-500 rounded-r-full"
                >
                  <Text className="text-white">Unselect All</Text>
                </TouchableOpacity>
              )}
            </View>
            {isSelectionMode && selectedItems.length > 0 && (
              <TouchableOpacity
                onPress={handleRemoveSelected}
                className="px-4 py-2 bg-red-500 rounded-full"
              >
                <Text className="text-white">
                  Remove ({selectedItems.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {isLoading ? (
        <FlatList
          data={Array(5).fill({})}
          renderItem={renderSkeletonItem}
          keyExtractor={(_, index) => `skeleton-${index}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      ) : favoriteItems.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Image
            source={require("../../assets/images/empty-box.png")}
            className="w-36 h-36 mb-5"
            resizeMode="contain"
          />
          <Text className="text-gray-500 text-lg">No favorites yet</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

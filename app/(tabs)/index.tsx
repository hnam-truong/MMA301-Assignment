import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Heart, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import MasonryList from "@react-native-seoul/masonry-list";
import * as Clipboard from "expo-clipboard";
import "nativewind";
import { useFavorites } from "../FavoritesContext";
import CircularMenu from "@/components/CircularMenu";
import { Item } from "@/type/item";
import { ItemApi } from "@/api/item";

const { width: screenWidth } = Dimensions.get("window");
const numColumns = 2;
const itemWidth = screenWidth / numColumns - 20;

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    state: { favorites },
    dispatch,
  } = useFavorites();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [heights, setHeights] = useState<{ [key: string]: number }>({});
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const searchFilterFadeAnim = useRef(new Animated.Value(1)).current;
  const searchInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (!menuVisible) {
      filterItems();
    }
  }, [items, searchQuery, selectedCategory, menuVisible]);

  useEffect(() => {
    Animated.timing(searchFilterFadeAnim, {
      toValue: menuVisible ? 0.3 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [menuVisible]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await ItemApi.getAll();
      const sortedData = data.sort((a, b) => Number(b.id) - Number(a.id));

      const newHeights: { [key: string]: number } = {};
      await Promise.all(
        sortedData.map(async (item: Item) => {
          await new Promise<void>((resolve) => {
            Image.getSize(item.image, (width, height) => {
              const aspectRatio = width / height;
              newHeights[item.id] = itemWidth / aspectRatio;
              resolve();
            });
          });
        })
      );
      setHeights(newHeights);
      setItems(sortedData);
      setFilteredItems(sortedData);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.itemCategory.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter(
        (item) => item.itemCategory === selectedCategory
      );
    }
    setFilteredItems(filtered);
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      dispatch({ type: "REMOVE_FAVORITE", payload: id });
    } else {
      dispatch({ type: "ADD_FAVORITE", payload: id });
    }
  };

  const handleLongPress = (item: Item, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setSelectedItem(item);
    setMenuVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseMenu = () => {
    setSelectedItem(null);
    setMenuVisible(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleAddToFavorites = () => {
    if (selectedItem) {
      toggleFavorite(selectedItem.id);
    }
    handleCloseMenu();
  };

  const handleCopyLink = async () => {
    if (selectedItem) {
      await Clipboard.setStringAsync(selectedItem.image);
    }
    handleCloseMenu();
  };

  const handleDownload = () => {
    if (selectedItem) {
      console.log("Download image:", selectedItem.image);
    }
    handleCloseMenu();
  };

  const renderSkeletonItem = () => (
    <View className="mb-4 self-center">
      <View
        className="rounded-lg bg-gray-200 overflow-hidden"
        style={{
          width: itemWidth,
          height: 200,
        }}
      />
    </View>
  );

  const renderItem = ({ item }: { item: Item | any }) => {
    const typedItem = item as Item;
    if (isLoading) return renderSkeletonItem();

    const isFavorite = favorites.includes(typedItem.id);
    const isSelected = selectedItem && selectedItem.id === typedItem.id;

    const discountedPrice =
      typedItem.percentage > 0
        ? typedItem.price * (1 - typedItem.percentage)
        : typedItem.price;

    return (
      <TouchableOpacity
        onPress={() => {
          if (menuVisible) {
            handleCloseMenu();
          } else {
            router.push({ pathname: "/detail", params: { id: typedItem.id } });
          }
        }}
        onLongPress={(event) => handleLongPress(typedItem, event)}
        delayLongPress={300}
        className="mb-4 self-center"
        disabled={menuVisible && selectedItem?.id !== typedItem.id}
      >
        <Animated.View
          className="rounded-lg bg-white overflow-hidden"
          style={{
            opacity: isSelected || !menuVisible ? 1 : 0.5,
            width: itemWidth,
            pointerEvents:
              menuVisible && selectedItem?.id !== typedItem.id
                ? "none"
                : "auto",
          }}
        >
          <View className="rounded-lg bg-white border border-gray-200 ">
            <Image
              source={{ uri: typedItem.image }}
              style={{
                width: itemWidth,
                height: heights[typedItem.id] || 150,
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
            {/* Heart Icon for Favorites */}
            {isFavorite && (
              <View className="absolute top-2 right-2 bg-white rounded-full p-1">
                <Heart size={16} color="#EF4444" fill="#EF4444" />
              </View>
            )}

            {/* Information */}
            <View className="p-2">
              <Text className="text-lg font-bold mt-2">
                {typedItem.itemName}
              </Text>
              <Text className="text-sm text-gray-500">
                Category: {typedItem.itemCategory}
              </Text>

              {typedItem.percentage > 0 ? (
                <View className="flex-row items-center">
                  <Text className="text-sm text-gray-500 line-through mr-2">
                    ${typedItem.price.toFixed(2)}
                  </Text>
                  <Text className="text-lg text-red-500 font-bold">
                    ${discountedPrice.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <Text className="text-lg text-gray-900 font-bold">
                  ${typedItem.price.toFixed(2)}
                </Text>
              )}

              <Text className="text-sm text-gray-500">
                Is Boolean: {typedItem.isBoolean ? "Yes" : "No"}
              </Text>
              {typedItem.percentage > 0 && (
                <Text className="text-sm text-red-500">
                  Percentage: -{(typedItem.percentage * 100).toFixed(0)}%
                </Text>
              )}
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 mb-16">
      <View className="pt-4 px-4">
        <Text className="text-3xl font-bold">Hi, Artist</Text>
        <Text className="text-gray-600 mb-4">Find your items</Text>
      </View>
      <Animated.View style={{ opacity: searchFilterFadeAnim }}>
        <View className="px-4 pb-2">
          <View className="flex-row items-center bg-white rounded-full px-4 py-2 mb-4 shadow">
            <Search size={20} className="text-gray-400 mr-2" />
            <TextInput
              ref={searchInputRef}
              placeholder="Search items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1"
              editable={!menuVisible}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  if (!menuVisible) {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }
                }}
                disabled={menuVisible}
              >
                <X size={20} className="text-gray-400" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            scrollEnabled={!menuVisible}
          >
            <TouchableOpacity
              className={`px-4 py-2 mr-2 rounded-full shadow ${
                selectedCategory === null ? "bg-blue-500" : "bg-white"
              }`}
              onPress={() => !menuVisible && setSelectedCategory(null)}
              disabled={menuVisible}
            >
              <Text
                className={
                  selectedCategory === null ? "text-white" : "text-gray-800"
                }
              >
                All
              </Text>
            </TouchableOpacity>
            {[...new Set(items.map((item) => item.itemCategory))].map(
              (category) => (
                <TouchableOpacity
                  key={category}
                  className={`px-4 py-2 mr-2 rounded-full shadow ${
                    selectedCategory === category ? "bg-blue-500" : "bg-white"
                  }`}
                  onPress={() =>
                    !menuVisible &&
                    setSelectedCategory(
                      category === selectedCategory ? null : category
                    )
                  }
                  disabled={menuVisible}
                >
                  <Text
                    className={
                      selectedCategory === category
                        ? "text-white"
                        : "text-gray-800"
                    }
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>
      </Animated.View>

      <View className="px-4 mb-2">
        <Text className="text-lg font-semibold">
          {isLoading
            ? "Loading..."
            : `${filteredItems.length} ${
                filteredItems.length === 1 ? "item" : "items"
              } found`}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={1}
        onPress={handleCloseMenu}
        className="flex-1"
      >
        <MasonryList
          data={isLoading ? Array(10).fill({}) : filteredItems}
          keyExtractor={(item, index) =>
            isLoading ? `skeleton-${index}` : (item as Item).id
          }
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          scrollEnabled={!menuVisible}
        />
      </TouchableOpacity>

      <CircularMenu
        isVisible={menuVisible}
        position={menuPosition}
        onClose={handleCloseMenu}
        onFavorite={handleAddToFavorites}
        onCopyLink={handleCopyLink}
        onDownload={handleDownload}
        favorites={favorites}
        selectedItem={selectedItem}
      />
    </SafeAreaView>
  );
}

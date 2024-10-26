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
import { ArtTool } from "@/type/art-tool";
import { ArtToolApi } from "@/api/artTool";

const { width: screenWidth } = Dimensions.get("window");
const numColumns = 2;
const itemWidth = screenWidth / numColumns - 20;

export default function HomeScreen() {
  const [artTools, setArtTools] = useState<ArtTool[]>([]);
  const [filteredTools, setFilteredTools] = useState<ArtTool[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    state: { favorites },
    dispatch,
  } = useFavorites();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ArtTool | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [heights, setHeights] = useState<{ [key: string]: number }>({});
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const searchFilterFadeAnim = useRef(new Animated.Value(1)).current;
  const searchInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    fetchArtTools();
  }, []);

  useEffect(() => {
    if (!menuVisible) {
      filterArtTools();
    }
  }, [artTools, searchQuery, selectedBrand, menuVisible]);

  useEffect(() => {
    Animated.timing(searchFilterFadeAnim, {
      toValue: menuVisible ? 0.3 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [menuVisible]);

  const fetchArtTools = async () => {
    setIsLoading(true);
    try {
      const data = await ArtToolApi.getAll();
      const newHeights: { [key: string]: number } = {};
      await Promise.all(
        data.map(async (tool: ArtTool) => {
          await new Promise<void>((resolve) => {
            Image.getSize(tool.image, (width, height) => {
              const aspectRatio = width / height;
              newHeights[tool.id] = itemWidth / aspectRatio;
              resolve();
            });
          });
        })
      );
      setHeights(newHeights);
      setArtTools(data);
      setFilteredTools(data);
    } catch (error) {
      console.error("Error fetching art tools:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterArtTools = () => {
    let filtered = artTools;
    if (searchQuery) {
      filtered = filtered.filter(
        (tool) =>
          tool.artName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedBrand) {
      filtered = filtered.filter((tool) => tool.brand === selectedBrand);
    }
    setFilteredTools(filtered);
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      dispatch({ type: "REMOVE_FAVORITE", payload: id });
    } else {
      dispatch({ type: "ADD_FAVORITE", payload: id });
    }
  };

  const handleLongPress = (artTool: ArtTool, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setSelectedItem(artTool);
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

  const renderItem = ({ item }: { item: unknown }) => {
    if (isLoading) return renderSkeletonItem();

    const artTool = item as ArtTool;
    const isFavorite = favorites.includes(artTool.id);
    const isSelected = selectedItem && selectedItem.id === artTool.id;

    return (
      <TouchableOpacity
        onPress={() => {
          if (menuVisible) {
            handleCloseMenu();
          } else {
            router.push({ pathname: "/detail", params: { id: artTool.id } });
          }
        }}
        onLongPress={(event) => handleLongPress(artTool, event)}
        delayLongPress={300}
        className="mb-4 self-center"
        disabled={menuVisible && selectedItem?.id !== artTool.id}
      >
        <Animated.View
          className="rounded-lg bg-white overflow-hidden"
          style={{
            opacity: isSelected || !menuVisible ? 1 : 0.5,
            width: itemWidth,
            pointerEvents:
              menuVisible && selectedItem?.id !== artTool.id ? "none" : "auto",
          }}
        >
          <View className="rounded-lg bg-white border border-gray-200">
            <Image
              source={{ uri: artTool.image }}
              style={{
                width: itemWidth,
                height: heights[artTool.id] || 200,
              }}
              resizeMode="contain"
            />
            {isFavorite && (
              <View className="absolute top-2 right-2 bg-white rounded-full p-1">
                <Heart size={16} color="#EF4444" fill="#EF4444" />
              </View>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 mb-16">
      <View className="pt-4 px-4">
        <Text className="text-3xl font-bold">Hi, Artist</Text>
        <Text className="text-gray-600 mb-4">
          Find your perfect art tools today
        </Text>
      </View>
      <Animated.View style={{ opacity: searchFilterFadeAnim }}>
        <View className="px-4 pb-2">
          <View className="flex-row items-center bg-white rounded-full px-4 py-2 mb-4 shadow">
            <Search size={20} className="text-gray-400 mr-2" />
            <TextInput
              ref={searchInputRef}
              placeholder="Search art tools..."
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
                    searchInputRef.current?.focus(); // Focus the TextInput
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
                selectedBrand === null ? "bg-blue-500" : "bg-white"
              }`}
              onPress={() => !menuVisible && setSelectedBrand(null)}
              disabled={menuVisible}
            >
              <Text
                className={
                  selectedBrand === null ? "text-white" : "text-gray-800"
                }
              >
                All
              </Text>
            </TouchableOpacity>
            {[...new Set(artTools.map((tool) => tool.brand))].map((brand) => (
              <TouchableOpacity
                key={brand}
                className={`px-4 py-2 mr-2 rounded-full shadow ${
                  selectedBrand === brand ? "bg-blue-500" : "bg-white"
                }`}
                onPress={() =>
                  !menuVisible &&
                  setSelectedBrand(brand === selectedBrand ? null : brand)
                }
                disabled={menuVisible}
              >
                <Text
                  className={
                    selectedBrand === brand ? "text-white" : "text-gray-800"
                  }
                >
                  {brand}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>

      <View className="px-4 mb-2">
        <Text className="text-lg font-semibold">
          {isLoading
            ? "Loading..."
            : `${filteredTools.length} ${
                filteredTools.length === 1 ? "item" : "items"
              } found`}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={1}
        onPress={handleCloseMenu}
        className="flex-1"
      >
        <MasonryList
          data={isLoading ? Array(10).fill({}) : filteredTools}
          keyExtractor={(item, index) =>
            isLoading ? `skeleton-${index}` : (item as ArtTool).id
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

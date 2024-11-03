import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Heart, Star, StarHalf, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ItemApi } from "@/api/item";
import { Item } from "@/type/item";
import { formatDistanceToNow } from "date-fns";
import { useFavorites } from "./FavoritesContext";
import NavigationComponent from "@/components/NavigationComponent";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function DetailScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageHeight, setImageHeight] = useState(300);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const {
    state: { favorites },
    dispatch,
  } = useFavorites();

  useEffect(() => {
    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  const fetchItemDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await ItemApi.getById(id);
      if (data) {
        setItem(data);
        Image.getSize(data.image, (width, height) => {
          const aspectRatio = width / height;
          const maxHeight = screenHeight * 0.7;
          const calculatedHeight = screenWidth / aspectRatio;
          setImageHeight(Math.min(calculatedHeight, maxHeight));
        });
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (id) {
      if (favorites.includes(id)) {
        dispatch({ type: "REMOVE_FAVORITE", payload: id });
      } else {
        dispatch({ type: "ADD_FAVORITE", payload: id });
      }
    }
  };

  const renderStars = (rating: number) => {
    const starSize = 24;
    const starColor = "#EAB308";
    const emptyStarColor = "#D1D5DB";

    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= Math.floor(rating)) {
            return (
              <Star
                key={star}
                size={starSize}
                color={starColor}
                fill={starColor}
                strokeWidth={1.5}
              />
            );
          } else if (star === Math.ceil(rating) && !Number.isInteger(rating)) {
            return (
              <View key={star} style={{ width: starSize, height: starSize }}>
                <Star
                  size={starSize}
                  color={starColor}
                  fill="none"
                  strokeWidth={1.5}
                  style={{ position: "absolute" }}
                />
                <StarHalf
                  size={starSize}
                  color={starColor}
                  fill={starColor}
                  strokeWidth={1.5}
                  style={{ position: "absolute" }}
                />
              </View>
            );
          } else {
            return (
              <Star
                key={star}
                size={starSize}
                color={emptyStarColor}
                fill="none"
                strokeWidth={1.5}
              />
            );
          }
        })}
      </View>
    );
  };

  const renderSkeleton = () => (
    <ScrollView>
      <View className="bg-gray-200" style={{ height: imageHeight }} />
      <View className="p-4">
        <View className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
        <View className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
        <View className="h-4 bg-gray-200 rounded w-full mb-2" />
        <View className="h-4 bg-gray-200 rounded w-full mb-2" />
        <View className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
        <View className="bg-gray-100 p-4 rounded-lg">
          <View className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
          <View className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <View className="h-4 bg-gray-200 rounded w-full" />
        </View>
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {renderSkeleton()}
        <NavigationComponent />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No item found</Text>
      </View>
    );
  }

  // const averageRating =
  //   item.comments && item.comments.length > 0
  //     ? item.comments.reduce((sum, comment) => sum + comment.rating, 0) /
  //       item.comments.length
  //     : 0;

  // const filteredComments =
  //   selectedRating !== null
  //     ? item.comments?.filter(
  //         (comment) => Math.floor(comment.rating) === selectedRating
  //       ) || []
  //     : item.comments || [];

  // const availableRatings = Array.from(
  //   new Set(item.comments?.map((comment) => Math.floor(comment.rating)))
  // ).sort((a, b) => a - b);

  const discountedPrice = item.price * (1 - item.percentage);

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        <View className="relative">
          <TouchableOpacity onPress={() => setShowFullImage(true)}>
            <Image
              source={{ uri: item.image }}
              style={{ width: screenWidth, height: imageHeight }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="absolute top-4 right-4 p-2 bg-white rounded-full"
            onPress={toggleFavorite}
          >
            <Heart
              color={favorites.includes(id) ? "#EF4444" : "#9CA3AF"}
              fill={favorites.includes(id) ? "#EF4444" : "none"}
            />
          </TouchableOpacity>
        </View>
        <View className="p-4">
          <Text className="text-3xl font-bold">{item.itemName}</Text>
          <View className="flex-row items-center mt-2">
            {item.percentage > 0 ? (
              <>
                <Text className="text-2xl text-gray-700 line-through">
                  ${item.price.toFixed(2)}
                </Text>
                <Text className="text-2xl text-red-500 font-bold ml-2">
                  ${discountedPrice.toFixed(2)}
                </Text>
                <Text className="text-lg text-red-500 font-bold ml-2">
                  ({Math.round(item.percentage * 100)}% OFF)
                </Text>
              </>
            ) : (
              <Text className="text-2xl text-gray-700">
                ${item.price.toFixed(2)}
              </Text>
            )}
          </View>
          {/* {averageRating > 0 && (
            <View className="flex-row items-center mt-4">
              {renderStars(averageRating)}
              <Text className="ml-2 text-lg font-semibold">
                {averageRating.toFixed(1)}
              </Text>
              <Text className="ml-2 text-gray-600">
                ({item.comments?.length || 0} ratings)
              </Text>
            </View>
          )} */}
          <Text className="text-gray-600 mt-4 text-base leading-6">
            {item.description}
          </Text>
          <View className="mt-4 bg-gray-100 p-4 rounded-lg">
            <Text className="font-semibold text-lg mb-2">Details</Text>
            <Text className="mb-2">
              <Text className="font-medium">Category:</Text> {item.itemCategory}
            </Text>
            <Text>
              <Text className="font-medium">Is Boolean:</Text>{" "}
              {item.isBoolean ? "Yes" : "No"}
            </Text>
          </View>

          {/* {item.comments && item.comments.length > 0 && (
            <View className="mt-6">
              <Text className="text-2xl font-bold mb-4">Customer Reviews</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                <TouchableOpacity
                  onPress={() => setSelectedRating(null)}
                  className={`px-4 py-2 mr-2 rounded-full ${
                    selectedRating === null ? "bg-blue-500" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`${
                      selectedRating === null ? "text-white" : "text-gray-800"
                    }`}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {availableRatings.map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() =>
                      setSelectedRating(
                        selectedRating === rating ? null : rating
                      )
                    }
                    className={`flex-row items-center px-4 py-2 mr-2 rounded-full ${
                      selectedRating === rating ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`${
                        selectedRating === rating
                          ? "text-white"
                          : "text-gray-800"
                      } `}
                    >
                      {rating}
                    </Text>
                    <Star size={16} color="#FACC15" fill="#FACC15" />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredComments.map((comment, index) => (
                <View key={index} className="bg-gray-100 rounded-lg p-4 mb-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Image
                        source={{ uri: comment.userAvatar }}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <View>
                        <Text className="font-semibold text-lg">
                          {comment.user}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(comment.commentTime), {
                            addSuffix: true,
                          })}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      {renderStars(comment.rating)}
                    </View>
                  </View>
                  <Text className="mt-3 text-base">{comment.comment}</Text>
                </View>
              ))}
            </View>
          )} */}
        </View>
      </ScrollView>

      <Modal visible={showFullImage} transparent={true} animationType="fade">
        <View className="flex-1 bg-black bg-opacity-90 justify-center items-center">
          <TouchableOpacity
            className="absolute top-10 right-5 z-10"
            onPress={() => setShowFullImage(false)}
          >
            <X color="white" size={30} />
          </TouchableOpacity>
          <Image
            source={{ uri: item.image }}
            style={{ width: screenWidth, height: screenHeight }}
            resizeMode="contain"
          />
        </View>
      </Modal>
      <NavigationComponent />
    </View>
  );
}

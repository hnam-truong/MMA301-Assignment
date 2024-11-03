import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Heart, Link, Download, X } from "lucide-react-native";
import { Item } from "@/type/item";

interface CircularMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onFavorite: () => void;
  onCopyLink: () => void;
  onDownload: () => void;
  position: { x: number; y: number };
  favorites: string[];
  selectedItem: Item | null;
}

const CircularMenu: React.FC<CircularMenuProps> = ({
  isVisible,
  onClose,
  onFavorite,
  onCopyLink,
  onDownload,
  position,
  favorites,
  selectedItem,
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  useEffect(() => {
    if (isVisible) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const menuSize = 160;
  const buttonSize = 40;
  const offset = menuSize / 2 - buttonSize / 2;

  let menuLeft = position.x - menuSize / 2;
  let menuTop = position.y - menuSize / 2;

  if (menuLeft + menuSize > screenWidth) {
    menuLeft = screenWidth - menuSize;
  } else if (menuLeft < 0) {
    menuLeft = 0;
  }

  if (menuTop + menuSize > screenHeight) {
    menuTop = screenHeight - menuSize;
  } else if (menuTop < 0) {
    menuTop = 0;
  }

  // Check if selected item is a favorite
  const isFavorite = selectedItem && favorites.includes(selectedItem.id);

  return (
    <Animated.View
      className="absolute"
      style={{
        left: menuLeft,
        top: menuTop,
        width: menuSize,
        height: menuSize,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onClose}
        className="absolute"
        style={{ left: offset, top: offset }}
      >
        <View className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-lg border border-gray-300">
          <X size={24} color="#000000" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onFavorite}
        className="absolute"
        style={{ left: offset, top: 0 }}
      >
        <View className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-lg border border-gray-300">
          <Heart
            size={24}
            color="#EF4444"
            fill={isFavorite ? "#EF4444" : "none"} // Conditionally fill if favorite
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onCopyLink}
        className="absolute"
        style={{ left: 0, top: offset }}
      >
        <View className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-lg border border-gray-300">
          <Link size={24} color="#3B82F6" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDownload}
        className="absolute"
        style={{ right: 0, top: offset }}
      >
        <View className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-lg border border-gray-300">
          <Download size={24} color="#10B981" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CircularMenu;

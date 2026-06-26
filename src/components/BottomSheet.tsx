import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sheetHeight?: number;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  sheetHeight = 280,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const [shouldRender, setShouldRender] = React.useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      progress.value = withTiming(1, { duration: 300 });
    } else {
      progress.value = withTiming(0, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
        }
      });
    }
  }, [isOpen]);

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value * 0.5,
    };
  });

  const sheetStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: (1 - progress.value) * sheetHeight,
        },
      ],
    };
  });

  if (!shouldRender) return null;

  return (
    <Modal
      visible={shouldRender}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={[StyleSheet.absoluteFill, { zIndex: 99999 }]} pointerEvents="box-none">
        {/* Dimmed Backdrop */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }, backdropStyle]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: sheetHeight,
              backgroundColor: Colors.white,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingBottom: insets.bottom + 16,
              paddingHorizontal: 24,
              paddingTop: 16,
            },
            sheetStyle,
          ]}
          className="shadow-2xl border-t border-gray-100"
        >
          {/* Handle Bar */}
          <View className="w-12 h-1.5 bg-gray-200 rounded-full mb-6 self-center" />

          {/* Title */}
          {title && (
            <Text className="text-xl font-black text-gray-800 mb-6 text-center">
              {title}
            </Text>
          )}

          {/* Custom Content */}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

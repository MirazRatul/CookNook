import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CustomVideoPlayer } from './CustomVideoPlayer';

interface VideoRecipeModalProps {
  visible: boolean;
  videoUrl: string;
  recipeTitle?: string;
  onClose: () => void;
}

export const VideoRecipeModal: React.FC<VideoRecipeModalProps> = ({
  visible,
  videoUrl,
  recipeTitle,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text numberOfLines={1} style={styles.titleText}>
            {recipeTitle ? `${recipeTitle} - Video` : 'Recipe Video'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Player Container */}
        <View style={styles.playerContainer}>
          <CustomVideoPlayer videoUrl={videoUrl} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000', // Solid black background to prevent background leak
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  closeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 44,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});

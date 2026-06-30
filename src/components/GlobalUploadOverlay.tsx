import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { clearUploadStatus } from '../store/slices/recipesSlice';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const GlobalUploadOverlay: React.FC = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const uploadStatus = useSelector((state: RootState) => state.recipes.uploadStatus);

  if (!uploadStatus.isUploading) return null;

  const handleDismissError = () => {
    dispatch(clearUploadStatus());
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 8 }, // Push down below status bar dynamically
      ]}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.statusGroup}>
            <Ionicons
              name={uploadStatus.error ? 'alert-circle' : 'cloud-upload'}
              size={20}
              color={uploadStatus.error ? Colors.danger : Colors.primary[500]}
              style={styles.icon}
            />
            <Text numberOfLines={1} style={styles.statusText}>
              {uploadStatus.error || uploadStatus.statusText}
            </Text>
          </View>
          {uploadStatus.error && (
            <TouchableOpacity onPress={handleDismissError} style={styles.closeButton}>
              <Ionicons name="close" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar (hidden on error) */}
        {!uploadStatus.error && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${uploadStatus.progress}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>{uploadStatus.progress}%</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#ffffff', // Matches top status bar area to blend in
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // Light gray divider border
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: '#1f2937', // Beautiful dark charcoal floating card design
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  icon: {
    marginRight: 8,
  },
  statusText: {
    color: '#f3f4f6',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    flex: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f59e0b', // Colors.primary[500] matching amber
  },
  progressPercent: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '800',
    width: 32,
    textAlign: 'right',
  },
});

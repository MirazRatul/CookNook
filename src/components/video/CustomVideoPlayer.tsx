import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface CustomVideoPlayerProps {
  videoUrl: string;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ videoUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.play();
  });

  // Set up listeners for player states
  useEffect(() => {
    // Configure event emission interval
    player.timeUpdateEventInterval = 0.25;

    const playSub = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });

    const timeSub = player.addListener('timeUpdate', (event) => {
      setCurrentTime(event.currentTime);
      setDuration(player.duration);
      if (player.status === 'readyToPlay') {
        setIsLoading(false);
      }
    });

    const statusSub = player.addListener('statusChange', (event) => {
      if (event.status === 'readyToPlay') {
        setIsLoading(false);
        setDuration(player.duration);
      } else if (event.status === 'loading') {
        setIsLoading(true);
      }
    });

    // Initial state
    setIsPlaying(player.playing);
    setCurrentTime(player.currentTime);
    setDuration(player.duration);
    setIsMuted(player.muted);
    setIsLoading(player.status !== 'readyToPlay');

    return () => {
      playSub.remove();
      timeSub.remove();
      statusSub.remove();
    };
  }, [player]);

  // Controls auto-hide timer
  useEffect(() => {
    if (!showControls || !isPlaying) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [showControls, isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setShowControls(true);
  };

  const toggleMute = () => {
    player.muted = !player.muted;
    setIsMuted(player.muted);
    setShowControls(true);
  };

  const handleProgressBarPress = (e: any) => {
    const { locationX } = e.nativeEvent;
    if (progressBarWidth > 0 && duration > 0) {
      const seekPercentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
      const seekTime = seekPercentage * duration;
      player.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleContainerPress = () => {
    setShowControls((prev) => !prev);
  };

  return (
    <Pressable onPress={handleContainerPress} style={styles.container}>
      {/* Video View */}
      <VideoView
        style={styles.video}
        player={player}
        nativeControls={false}
        contentFit="contain"
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      )}

      {/* Custom Controls Overlay */}
      {showControls && (
        <View style={styles.overlay} pointerEvents="box-none">
          {/* Big Center Play/Pause Button */}
          {!isLoading && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={togglePlay}
              style={styles.centerButton}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={34}
                color="white"
                style={!isPlaying ? { marginLeft: 4 } : undefined}
              />
            </TouchableOpacity>
          )}

          {/* Bottom Bar: Timeline, Timestamps, Mute */}
          <View style={styles.bottomBar}>
            {/* ProgressBar */}
            <Pressable
              onPress={handleProgressBarPress}
              onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
              style={styles.progressBarWrapper}
            >
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${((currentTime / (duration || 1)) * 100)}%` },
                  ]}
                />
              </View>
            </Pressable>

            {/* Sub-bar: Timestamps and Volume controls */}
            <View style={styles.subBar}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>

              <TouchableOpacity activeOpacity={0.7} onPress={toggleMute} style={styles.iconButton}>
                <Ionicons
                  name={isMuted ? 'volume-mute-outline' : 'volume-high-outline'}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    overflow: 'hidden',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'space-between',
    padding: 16,
  },
  centerButton: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -28, // Offset half button height
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.85)', // Colors.primary[500] matching amber
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  progressBarWrapper: {
    height: 12,
    justifyContent: 'center',
    width: '100%',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f59e0b', // Colors.primary[500] matching amber
  },
  subBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    padding: 4,
  },
});

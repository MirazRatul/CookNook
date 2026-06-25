import { useMemo } from 'react';
import { PixelRatio, useWindowDimensions } from 'react-native';

const guidelineWidth = 390;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return PixelRatio.roundToNearestPixel(value);
}

export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();

  return useMemo(() => {
    const shortestSide = Math.min(width, height);
    const longestSide = Math.max(width, height);
    const isCompactPhone = shortestSide < 360;
    const isPhone = shortestSide < 600;
    const isTablet = shortestSide >= 600;
    const isLargeTablet = shortestSide >= 900;
    const isLandscape = width > height;
    const scaleFactor = clamp(shortestSide / guidelineWidth, 0.88, isTablet ? 1.2 : 1.08);

    const spacing = {
      screen: isCompactPhone ? 18 : isTablet ? 32 : 24,
      section: isTablet ? 28 : 20,
      cardGap: isTablet ? 20 : 16,
    };

    const contentMaxWidth = isLargeTablet ? 920 : isTablet ? 760 : undefined;
    const formMaxWidth = isTablet ? 720 : undefined;
    const listMaxWidth = isTablet ? 720 : undefined;

    return {
      width,
      height,
      fontScale,
      shortestSide,
      longestSide,
      isCompactPhone,
      isPhone,
      isTablet,
      isLargeTablet,
      isLandscape,
      spacing,
      contentMaxWidth,
      formMaxWidth,
      listMaxWidth,
      compactFormFields: isCompactPhone || (isPhone && width < 390),
      tabBar: {
        height: isCompactPhone ? 60 : 64,
        horizontalInset: isTablet ? Math.max((width - 520) / 2, 32) : spacing.screen,
        radius: isCompactPhone ? 24 : 28,
      },
      recipeCard: {
        verticalWidth: round(clamp(width * 0.68, 236, isTablet ? 320 : 272)),
        verticalImageHeight: round(clamp(width * 0.44, 154, isTablet ? 220 : 176)),
        horizontalImageSize: isCompactPhone ? 82 : isTablet ? 112 : 96,
      },
      details: {
        heroHeight: round(clamp(height * 0.34, 280, isTablet ? 440 : 340)),
        contentMaxWidth: isTablet ? 820 : undefined,
      },
      scale: (value: number, min = value * 0.9, max = value * 1.15) =>
        round(clamp(value * scaleFactor, min, max)),
    };
  }, [fontScale, height, width]);
}

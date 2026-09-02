import React from 'react';
import { View, Text, StyleSheet, Image, ImageStyle, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { IMAGES } from '../../constants/assets';

interface HeroSectionProps {
  imageSource: any;
  isProcessing?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ imageSource, isProcessing = false }) => {
  const source = imageSource || IMAGES.hero.flag;

  return (
    <View style={styles.heroSection}>
      <View style={styles.heroImageWrapper}>
        <Image
          source={typeof source === 'string' ? { uri: source } : source}
          style={styles.heroImage as ImageStyle}
          resizeMode="cover"
        />
        {/* Subtle Tricolor Corner Accent Badge */}
        <View style={styles.tirangaCornerBadge}>
          <View style={[styles.cornerDot, { backgroundColor: '#FF671F' }]} />
          <View style={[styles.cornerDot, { backgroundColor: '#FFFFFF' }]} />
          <View style={[styles.cornerDot, { backgroundColor: '#046A38' }]} />
          <Text style={styles.cornerText}>NATIONAL DEFENSE</Text>
        </View>

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#FF671F" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    width: '100%',
    maxWidth: 420,
    marginTop: 12,
    marginBottom: 36, // Increased gap between header and upload section
    alignItems: 'center',
  },
  heroImageWrapper: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.slate[100],
    elevation: 4,
    shadowColor: colors.slate[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tirangaCornerBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(8, 20, 13, 0.86)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 184, 66, 0.5)',
  },
  cornerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 3,
  },
  cornerText: {
    color: '#E2E8F0',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginLeft: 3,
  },
});

export default HeroSection;

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { IMAGES } from '../../constants/assets';
import { STRINGS } from '../../constants/strings';

interface HeaderProps {
  onMenuPress: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuPress, title = STRINGS.app.name }) => {
  return (
    <View style={styles.header}>
      {/* App Logo & Name on Left */}
      <View style={styles.brandRow}>
        <Image
          source={IMAGES.icons.logo}
          style={styles.headerLogo as ImageStyle}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>{title}</Text>
      </View>

      {/* 3-Lines Hamburger Menu Icon on Right */}
      <TouchableOpacity
        style={styles.menuIconButton}
        onPress={onMenuPress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="menu-outline" size={28} color="#E2E8F0" />
      </TouchableOpacity>

      {/* Bottom Tricolor Defense Accent Stripe */}
      <View style={styles.tricolorStripe} pointerEvents="none">
        <View style={[styles.stripePart, { backgroundColor: '#FF671F' }]} />
        <View style={[styles.stripePart, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.stripePart, { backgroundColor: '#046A38' }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 62,
    flexShrink: 0,
    backgroundColor: '#08140D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A3D25',
    elevation: 4,
    zIndex: 10,
    position: 'relative',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E5B842',
    backgroundColor: '#07150C',
  },
  brandText: {
    fontSize: 25,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  menuIconButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tricolorStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    flexDirection: 'row',
  },
  stripePart: {
    flex: 1,
    height: 2.5,
  },
});

export default Header;

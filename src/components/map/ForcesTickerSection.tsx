import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
  Easing,
  Image,
  ImageStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { IMAGES } from '../../constants/assets';

export interface ForceUnitInfo {
  id: string;
  name: string;
  shortTag: string;
  role: string;
  appUsage: string;
  badgeColor: string;
  image: any;
}

export const FORCES_DATA: ForceUnitInfo[] = [
  {
    id: 'nsg',
    name: 'NSG Commandos',
    shortTag: '⚡ 51 & 52 SAG',
    role: 'Urban Counter-Terror',
    appUsage: '3D room-by-room breach walkthrough',
    badgeColor: '#E5B842',
    image: IMAGES.forces.nsg,
  },
  {
    id: 'blackcat',
    name: 'Black Cat Squad',
    shortTag: '🐈‍⬛ BLACK CATS',
    role: 'CQC Room Breach',
    appUsage: 'Corridor choke-points & door angles',
    badgeColor: '#10B981',
    image: IMAGES.forces.blackCat,
  },
  {
    id: 'crpf',
    name: 'CRPF COBRA Unit',
    shortTag: '🐍 COBRA SQUADS',
    role: 'Jungle & Compound Ops',
    appUsage: 'Structure entries & fortified hideouts',
    badgeColor: '#34D399',
    image: IMAGES.forces.crpfCobra,
  },
  {
    id: 'bsf',
    name: 'BSF Border Patrol',
    shortTag: '🇮🇳 BSF TACTICAL',
    role: 'Forward Bunker Recon',
    appUsage: 'Bunker 3D elevation & firing arcs',
    badgeColor: '#F59E0B',
    image: IMAGES.forces.bsf,
  },
  {
    id: 'parasf',
    name: 'Para Special Forces',
    shortTag: '🗡️ 9 & 10 PARA SF',
    role: 'Covert Infiltration',
    appUsage: 'Pre-insertion spatial muscle memory',
    badgeColor: '#E5B842',
    image: IMAGES.forces.paraSf,
  },
  {
    id: 'garud',
    name: 'Garud Commandos',
    shortTag: '🦅 IAF SPECIAL FORCE',
    role: 'Air Base & Deep SAR',
    appUsage: 'Hangar & compound security models',
    badgeColor: '#60A5FA',
    image: IMAGES.forces.garud,
  },
];

export const ForcesTickerSection: React.FC = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const startLoop = () => {
        animatedValue.setValue(0);
        Animated.timing(animatedValue, {
          toValue: -1,
          duration: 22000,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => startLoop());
      };
      startLoop();
    }
  }, [animatedValue]);

  // Double list for seamless continuous infinite marquee
  const loopedForces = [...FORCES_DATA, ...FORCES_DATA];

  return (
    <View style={styles.outerContainer}>
      {/* Web Keyframes for Silky-Smooth GPU Accelerated Ticker */}
      {Platform.OS === 'web' && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes tacticalForcesMarquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .forces-marquee-track {
                display: flex !important;
                flex-direction: row !important;
                width: max-content !important;
                animation: tacticalForcesMarquee 26s linear infinite !important;
                will-change: transform !important;
              }
              .forces-marquee-track:hover {
                animation-play-state: paused !important;
              }
            `,
          }}
        />
      )}

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerBadge}>
          <View style={[styles.pulseDot, { backgroundColor: '#FF671F' }]} />
          <View style={[styles.pulseDot, { backgroundColor: '#FFFFFF' }]} />
          <View style={[styles.pulseDot, { backgroundColor: '#046A38' }]} />
          <Text style={styles.headerBadgeText}>INDIAN ARMED FORCES COMPATIBILITY</Text>
        </View>
        <Text style={styles.headerTitle}>Built for Elite Defense Units</Text>
        <Text style={styles.headerSubtitle}>
          Specialized commando forces deploying Project VIJAY 3D spatial mapping
        </Text>
      </View>

      {/* Marquee Scroller Container */}
      <View style={styles.tickerWrapper}>
        {Platform.OS === 'web' ? (
          <div className="forces-marquee-track" style={{ display: 'flex', flexDirection: 'row' }}>
            {loopedForces.map((force, index) => (
              <View key={`${force.id}-${index}`} style={styles.forceCard}>
                {/* Subtle top tricolor accent line */}
                <View style={styles.cardTricolorGlow}>
                  <View style={{ flex: 1, backgroundColor: '#FF671F' }} />
                  <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
                  <View style={{ flex: 1, backgroundColor: '#046A38' }} />
                </View>

                {/* Left: Commando Action Picture */}
                <View style={styles.photoWrapper}>
                  <Image source={force.image} style={styles.commandoPhoto as ImageStyle} resizeMode="cover" />
                  <View style={styles.photoOverlayBorder} />
                </View>

                {/* Right: Concise Tactical Content */}
                <View style={styles.infoCol}>
                  {/* Top Row: Unit Pill + Status */}
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.unitTagPill, { borderColor: force.badgeColor }]}>
                      <Text style={[styles.unitTagText, { color: force.badgeColor }]}>{force.shortTag}</Text>
                    </View>
                    <View style={styles.statusDotGreen} />
                  </View>

                  {/* Force Name & Role */}
                  <Text style={styles.forceName} numberOfLines={1}>{force.name}</Text>
                  <Text style={styles.forceRole} numberOfLines={1}>{force.role}</Text>

                  {/* 1-Line Tactical Usage */}
                  <View style={styles.usageRow}>
                    <Text style={styles.usageBullet}>▸</Text>
                    <Text style={styles.usageText} numberOfLines={2}>{force.appUsage}</Text>
                  </View>
                </View>
              </View>
            ))}
          </div>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.nativeScrollContent}
          >
            {loopedForces.map((force, index) => (
              <View key={`${force.id}-${index}`} style={styles.forceCard}>
                {/* Subtle top tricolor accent line */}
                <View style={styles.cardTricolorGlow}>
                  <View style={{ flex: 1, backgroundColor: '#FF671F' }} />
                  <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
                  <View style={{ flex: 1, backgroundColor: '#046A38' }} />
                </View>

                {/* Left: Commando Action Picture */}
                <View style={styles.photoWrapper}>
                  <Image source={force.image} style={styles.commandoPhoto as ImageStyle} resizeMode="cover" />
                  <View style={styles.photoOverlayBorder} />
                </View>

                {/* Right: Concise Tactical Content */}
                <View style={styles.infoCol}>
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.unitTagPill, { borderColor: force.badgeColor }]}>
                      <Text style={[styles.unitTagText, { color: force.badgeColor }]}>{force.shortTag}</Text>
                    </View>
                    <View style={styles.statusDotGreen} />
                  </View>

                  <Text style={styles.forceName} numberOfLines={1}>{force.name}</Text>
                  <Text style={styles.forceRole} numberOfLines={1}>{force.role}</Text>

                  <View style={styles.usageRow}>
                    <Text style={styles.usageBullet}>▸</Text>
                    <Text style={styles.usageText} numberOfLines={2}>{force.appUsage}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    maxWidth: 500,
    marginTop: 18,
    marginBottom: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#132B1D',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#235235',
    marginBottom: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  headerBadgeText: {
    color: '#E5B842',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 3,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8FA396',
    textAlign: 'center',
    maxWidth: 360,
    lineHeight: 15,
  },
  tickerWrapper: {
    width: '100%',
    overflow: 'hidden',
    paddingVertical: 4,
  },
  nativeScrollContent: {
    paddingHorizontal: 10,
  },
  forceCard: {
    width: 305,
    height: 116,
    backgroundColor: '#0D2014',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#1E462C',
    padding: 9,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  cardTricolorGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
  },
  photoWrapper: {
    width: 86,
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#06130B',
  },
  commandoPhoto: {
    width: '100%',
    height: '100%',
  },
  photoOverlayBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 184, 66, 0.4)',
  },
  infoCol: {
    flex: 1,
    height: '100%',
    paddingLeft: 10,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitTagPill: {
    backgroundColor: '#163622',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  unitTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusDotGreen: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  forceName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  forceRole: {
    fontSize: 10,
    color: '#90E0EF',
    fontWeight: '700',
    marginTop: -1,
  },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#07150C',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#173622',
  },
  usageBullet: {
    color: '#E5B842',
    fontSize: 10,
    fontWeight: '800',
    marginRight: 4,
    lineHeight: 13,
  },
  usageText: {
    fontSize: 10,
    color: '#CBD5E1',
    lineHeight: 13,
    flex: 1,
  },
});

export default ForcesTickerSection;

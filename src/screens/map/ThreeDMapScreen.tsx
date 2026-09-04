import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ImageStyle,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { IMAGES } from '../../constants/assets';
import { STRINGS } from '../../constants/strings';
import { MapPreview } from '../../components/map/MapPreview';
import { SquadCoLocationHUD } from '../../components/map/SquadCoLocationHUD';
import { MapLayer, Architecture3D, SquadLocationData } from '../../types/map';
import { BlueprintSpatialEngine } from '../../services/map/BlueprintSpatialEngine';
import { MapService } from '../../services/map/MapService';

interface ThreeDMapScreenProps {
  route?: any;
  navigation?: any;
}

export const ThreeDMapScreen: React.FC<ThreeDMapScreenProps> = ({ route, navigation }) => {
  const initialSource = route?.params?.source || IMAGES.hero.flag;
  const [currentSource, setCurrentSource] = useState<any>(initialSource);
  const [architecture, setArchitecture] = useState<Architecture3D | undefined>(route?.params?.architecture);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('Tactical');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [walkthroughActive, setWalkthroughActive] = useState<boolean>(false);

  // Live Squad Co-Location Telemetry State
  const [squadData, setSquadData] = useState<SquadLocationData | null>(null);
  const [squadLoading, setSquadLoading] = useState<boolean>(false);

  // Poll / Fetch Live Squad Telemetry
  React.useEffect(() => {
    let isMounted = true;
    const fetchSquad = async () => {
      try {
        const data = await MapService.getSquadLocations();
        if (isMounted && data) {
          setSquadData(data);
        }
      } catch (err) {
        console.warn('Failed to load squad co-locations:', err);
      }
    };

    fetchSquad();
    const interval = setInterval(fetchSquad, 7000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handlePatrolDummy = async () => {
    setSquadLoading(true);
    try {
      const updated = await MapService.patrolDummyUser();
      if (updated) {
        setSquadData(updated);
      }
    } catch (err) {
      console.warn('Patrol trigger error:', err);
    } finally {
      setSquadLoading(false);
    }
  };

  // Analyze blueprint on load or change
  React.useEffect(() => {
    let targetUri = '';
    if (typeof currentSource === 'string') {
      targetUri = currentSource;
    } else if (currentSource?.uri) {
      targetUri = currentSource.uri;
    } else {
      const resolved = Image.resolveAssetSource(currentSource);
      targetUri = resolved?.uri || '';
    }

    if (targetUri) {
      BlueprintSpatialEngine.analyze2DBlueprint(targetUri).then((res) => {
        if (res.isValidMap && res.architecture) {
          setArchitecture(res.architecture);
        }
      }).catch(() => {});
    }
  }, [currentSource]);

  // Upload new 2D Map directly from 3D Map screen
  const handleUploadAnother = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newSource = { uri: result.assets[0].uri };
        setCurrentSource(newSource);
        Alert.alert('2D Map Updated', 'New 2D blueprint converted to 3D Map model! 🗺️');
      }
    } catch (err) {
      Alert.alert('Image Selection', 'Could not select photo.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.commando.background} />

      {/* 1. Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleRow}>
          <Image
            source={IMAGES.icons.logo}
            style={styles.headerLogo as ImageStyle}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>{STRINGS.map.threeDTitle}</Text>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.statusText}>LIVE 3D</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
      >
        {/* Main Banner Heading */}
        <View style={styles.bannerContainer}>
          <View style={styles.tacticalPill}>
            <Text style={styles.tacticalPillText}>{STRINGS.map.threeDBanner}</Text>
          </View>
          <Text style={styles.mainHeadingText}>{STRINGS.map.threeDTitle}</Text>
          <Text style={styles.subHeadingText}>{STRINGS.map.threeDSubHeading}</Text>
        </View>

        {/* 3D Viewport Simulation Card Component */}
        <MapPreview
          sourceImage={currentSource}
          architecture={architecture}
          is3DMode={is3DMode}
          zoomLevel={zoomLevel}
          activeLayer={activeLayer}
          walkthroughActive={walkthroughActive}
          onToggle3D={() => setIs3DMode(!is3DMode)}
          onZoomIn={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.0))}
          onZoomOut={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.8))}
          onToggleWalkthrough={() => {
            setWalkthroughActive(!walkthroughActive);
            Alert.alert(
              walkthroughActive ? 'Walkthrough Paused' : '3D Walkthrough Started',
              walkthroughActive
                ? 'Offline simulation paused.'
                : 'Simulating 3D room-by-room troops tactical walkthrough.'
            );
          }}
          onSelectLayer={(layer) => setActiveLayer(layer)}
          squadData={squadData}
        />

        {/* Live Squad Co-Location & Distance Telemetry HUD */}
        <SquadCoLocationHUD
          squadData={squadData}
          onPatrolDummy={handlePatrolDummy}
          loading={squadLoading}
        />

        {/* Tactical Intelligence Data Box */}
        <View style={styles.intelCard}>
          <Text style={styles.intelTitle}>Mission Spatial Intelligence</Text>
          <Text style={styles.intelDesc}>
            Converted from uploaded 2D blueprint into high-fidelity spatial mesh for pre-entry reconnaissance.
          </Text>

          <View style={styles.metricGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Rooms Detected</Text>
              <Text style={styles.metricValue}>14 Zones</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Clearance Height</Text>
              <Text style={styles.metricValue}>3.2 Meters</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Entry Points</Text>
              <Text style={styles.metricValue}>3 Breaches</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Offline Status</Text>
              <Text style={[styles.metricValue, { color: colors.commando.accentGreen }]}>100% Ready</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.uploadAnotherBtn}
          onPress={handleUploadAnother}
          activeOpacity={0.85}
        >
          <Text style={styles.uploadAnotherText}>📤 Upload Another 2D Map</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchBackButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.switchBackText}>← Back to 2D Map Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: colors.commando.background,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? ({ minHeight: 0 } as any) : {}),
  },
  scrollView: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.commando.background,
    ...(Platform.OS === 'web'
      ? ({
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        } as any)
      : {}),
  },
  header: {
    height: 60,
    flexShrink: 0,
    backgroundColor: colors.commando.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E432B',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.commando.surfaceLighter,
    borderWidth: 1,
    borderColor: '#2D603C',
  },
  backButtonText: {
    color: colors.slate[200],
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.slate[100],
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#112C1B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.commando.accentGreen,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.commando.accentGreen,
    marginRight: 5,
  },
  statusText: {
    color: colors.commando.accentGreen,
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContainer: {
    alignItems: 'center',
    padding: 16,
    paddingBottom: 40,
  },
  bannerContainer: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  tacticalPill: {
    backgroundColor: '#163622',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.commando.accentGold,
    marginBottom: 6,
  },
  tacticalPillText: {
    color: colors.commando.accentGold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  mainHeadingText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subHeadingText: {
    fontSize: 12.5,
    color: colors.commando.textSecondary,
    textAlign: 'center',
    maxWidth: 340,
  },
  intelCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.commando.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.commando.border,
    marginBottom: 16,
  },
  intelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.commando.accentGold,
    marginBottom: 4,
  },
  intelDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.commando.textSecondary,
    marginBottom: 14,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#0B1B10',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E432B',
  },
  metricLabel: {
    fontSize: 11,
    color: colors.commando.textMuted,
    marginBottom: 4,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 15,
    color: colors.slate[100],
    fontWeight: '800',
  },
  uploadAnotherBtn: {
    width: '100%',
    maxWidth: 520,
    height: 48,
    backgroundColor: '#1E432B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.commando.accentGold,
    marginBottom: 10,
  },
  uploadAnotherText: {
    color: colors.commando.accentGold,
    fontSize: 14,
    fontWeight: '800',
  },
  switchBackButton: {
    width: '100%',
    maxWidth: 520,
    height: 48,
    backgroundColor: '#275836',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3E8554',
    elevation: 3,
  },
  switchBackText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ThreeDMapScreen;

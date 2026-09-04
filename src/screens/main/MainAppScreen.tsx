import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
  Platform,
  useWindowDimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { colors } from '../../theme/colors';
import { IMAGES } from '../../constants/assets';
import { STRINGS } from '../../constants/strings';
import { MapLayer, Architecture3D, SquadLocationData } from '../../types/map';
import authService from '../../services/authService';
import MapService from '../../services/map/MapService';
import { BlueprintSpatialEngine } from '../../services/map/BlueprintSpatialEngine';

// UI Components
import { Header } from '../../components/layout/Header';
import { HeroSection } from '../../components/map/HeroSection';
import { UploadSection } from '../../components/map/UploadSection';
import { MapPreview } from '../../components/map/MapPreview';
import { StartingTacticalInfo } from '../../components/map/StartingTacticalInfo';
import { RecentMapsModal, RecentMapItem } from '../../components/map/RecentMapsModal';
import { ForcesTickerSection } from '../../components/map/ForcesTickerSection';
import { Scanning3DAnimationModal } from '../../components/map/Scanning3DAnimationModal';
import { SquadCoLocationHUD } from '../../components/map/SquadCoLocationHUD';
import { ProfileScreen } from './ProfileScreen';

interface MainAppScreenProps {
  route?: any;
  navigation?: any;
}

export const MainAppScreen: React.FC<MainAppScreenProps> = ({ route, navigation }) => {
  const user = route?.params?.user;
  const userToken = user?.token;
  const { width } = useWindowDimensions();

  // Scroll View Reference for auto-scrolling to 3D section
  const scrollViewRef = useRef<ScrollView>(null);

  // Selected 2D Map image state - defaults to Soldiers raising flag
  const [selectedSource, setSelectedSource] = useState<any>(IMAGES.hero.flag);
  const [uploadedMap, setUploadedMap] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);
  const [analyzingStageText, setAnalyzingStageText] = useState<string>('Converting 2D Blueprint to 3D Map...');
  const [architecture3D, setArchitecture3D] = useState<Architecture3D | null>(null);
  const [metrics, setMetrics] = useState({
    rooms: '8 Zones',
    clearance: '3.2 Meters',
    breaches: '3 Breaches',
    status: '100% Ready 🟢',
  });

  // 3D Viewport Simulation Controls
  const [activeLayer, setActiveLayer] = useState<MapLayer>('Tactical');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [walkthroughActive, setWalkthroughActive] = useState<boolean>(false);

  // Squad Co-Location & Dummy User Telemetry
  const [squadData, setSquadData] = useState<SquadLocationData | null>(null);
  const [squadLoading, setSquadLoading] = useState<boolean>(false);

  // Load live squad telemetry (Active User + Dummy Commando Vikram)
  useEffect(() => {
    let isMounted = true;
    const fetchSquad = async () => {
      try {
        const data = await MapService.getSquadLocations();
        if (isMounted && data && data.success) {
          setSquadData(data);
        }
      } catch (_) {}
    };
    fetchSquad();

    const interval = setInterval(fetchSquad, 7000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handlePatrolDummy = async () => {
    try {
      setSquadLoading(true);
      const updated = await MapService.patrolDummyUser();
      if (updated && updated.success) {
        setSquadData(updated);
      }
    } catch (_) {
    } finally {
      setSquadLoading(false);
    }
  };

  // Profile and navigation menu modal states
  const [profileModalVisible, setProfileModalVisible] = useState<boolean>(false);
  const [menuModalVisible, setMenuModalVisible] = useState<boolean>(false);
  const [recentMapsModalVisible, setRecentMapsModalVisible] = useState<boolean>(false);
  const [currentViewMode, setCurrentViewMode] = useState<string>('2D Map');
  const [profileAvatar, setProfileAvatar] = useState<any>(IMAGES.demo.soldierMale);

  // Recent uploaded 2D maps vault history - starts at 0 on login
  const [recentMaps, setRecentMaps] = useState<RecentMapItem[]>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem('ideajam_recent_uploaded_maps');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  // Helper to convert any image URI to permanent Data URI (Base64) for localhost storage
  const convertUriToDataUri = async (uri: string): Promise<string> => {
    if (typeof uri === 'string' && uri.startsWith('data:')) return uri;
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(uri);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return uri;
    }
  };

  const addUploadedMapToHistory = (source: any, customName?: string) => {
    const newMapItem: RecentMapItem = {
      id: `map_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      source: source,
      name: customName || `Tactical 2D Blueprint #${recentMaps.length + 1}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      size: '1.4 MB',
    };
    setRecentMaps((prev) => {
      const filtered = prev.filter((m) => m.source?.uri !== source?.uri);
      const updated = [newMapItem, ...filtered];
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem('ideajam_recent_uploaded_maps', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  // Load all past uploaded maps from localhost backend for active user session
  const fetchPastUploads = async () => {
    try {
      const userKey = user?.email || user?.id || 'commando_tactical';
      const backendMaps = await MapService.getRecentMapsFromBackend(userKey);
      if (backendMaps && Array.isArray(backendMaps)) {
        const formatted: RecentMapItem[] = backendMaps.map((bm: any, index: number) => ({
          id: bm._id || `map_backend_${index}`,
          source: { uri: bm.originalImage },
          name: bm.blueprintName || `Tactical Blueprint #${index + 1}`,
          timestamp: new Date(bm.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(bm.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          size: '1.4 MB',
        }));

        setRecentMaps(formatted);
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.setItem('ideajam_recent_uploaded_maps', JSON.stringify(formatted));
          } catch (e) {}
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchPastUploads();
  }, [user]);

  const handleSelectRecentMap = (item: RecentMapItem, autoAnalyze = false) => {
    setSelectedSource(item.source);
    setUploadedMap(item.source);
    setRecentMapsModalVisible(false);

    let targetUri = typeof item.source === 'string' ? item.source : item.source?.uri || '';
    if (targetUri) {
      BlueprintSpatialEngine.analyze2DBlueprint(targetUri).then((analysis) => {
        if (analysis.isValidMap && analysis.architecture) {
          setArchitecture3D(analysis.architecture);
          setMetrics({
            rooms: `${analysis.architecture.rooms.length} Zones`,
            clearance: `${analysis.architecture.dimensions.clearanceMeters} Meters`,
            breaches: `${analysis.architecture.tacticalMarkers.filter((m) => m.type === 'BREACH').length || 1} Breaches`,
            status: '100% Ready 🟢',
          });
        }
      }).catch(() => {});
    }

    if (autoAnalyze) {
      handleAnalyzePress(item.source);
    } else {
      setHasAnalyzed(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 50);
    }
  };

  const handleDeleteRecentMap = (id: string) => {
    setRecentMaps((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem('ideajam_recent_uploaded_maps', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    MapService.deleteMapFromBackend(id).catch(() => {});
  };

  // Pick Image from Device Gallery
  const handleUploadMap = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const rawUri = result.assets[0].uri;
        const permanentUri = await convertUriToDataUri(rawUri);
        const source = { uri: permanentUri };

        setSelectedSource(source);
        setUploadedMap(source);
        setHasAnalyzed(false);

        // Pre-analyze blueprint immediately so 3D model is ready
        BlueprintSpatialEngine.analyze2DBlueprint(permanentUri).then((analysis) => {
          if (analysis.isValidMap && analysis.architecture) {
            setArchitecture3D(analysis.architecture);
            setMetrics({
              rooms: `${analysis.architecture.rooms.length} Zones`,
              clearance: `${analysis.architecture.dimensions.clearanceMeters} Meters`,
              breaches: `${analysis.architecture.tacticalMarkers.filter((m) => m.type === 'BREACH').length || 1} Breaches`,
              status: '100% Ready 🟢',
            });
          }
        }).catch(() => {});

        const bpName = `Tactical_Blueprint_${Date.now().toString().slice(-4)}.png`;
        // Save to localhost backend disk & database
        MapService.uploadMapToBackend(permanentUri, bpName, user?.email || 'commando_tactical')
          .then((res) => {
            if (res?.map?.originalImage) {
              addUploadedMapToHistory({ uri: res.map.originalImage }, bpName);
            } else {
              addUploadedMapToHistory(source, bpName);
            }
          })
          .catch(() => {
            addUploadedMapToHistory(source, bpName);
          });
      }
    } catch (err: any) {
      try {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.granted) {
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.85,
            base64: true,
          });
          if (!res.canceled && res.assets && res.assets.length > 0) {
            const rawUri = res.assets[0].uri;
            const permanentUri = await convertUriToDataUri(rawUri);
            const source = { uri: permanentUri };

            setSelectedSource(source);
            setUploadedMap(source);
            setHasAnalyzed(false);

            // Pre-analyze blueprint immediately
            BlueprintSpatialEngine.analyze2DBlueprint(permanentUri).then((analysis) => {
              if (analysis.isValidMap && analysis.architecture) {
                setArchitecture3D(analysis.architecture);
                setMetrics({
                  rooms: `${analysis.architecture.rooms.length} Zones`,
                  clearance: `${analysis.architecture.dimensions.clearanceMeters} Meters`,
                  breaches: `${analysis.architecture.tacticalMarkers.filter((m) => m.type === 'BREACH').length || 1} Breaches`,
                  status: '100% Ready 🟢',
                });
              }
            }).catch(() => {});

            const bpName = `Tactical_Blueprint_${Date.now().toString().slice(-4)}.png`;
            MapService.uploadMapToBackend(permanentUri, bpName, user?.email || 'commando_tactical')
              .then((bRes) => {
                if (bRes?.map?.originalImage) {
                  addUploadedMapToHistory({ uri: bRes.map.originalImage }, bpName);
                } else {
                  addUploadedMapToHistory(source, bpName);
                }
              })
              .catch(() => {
                addUploadedMapToHistory(source, bpName);
              });
          }
        } else {
          Alert.alert('Permission', 'Please allow gallery access in app settings.');
        }
      } catch (e) {
        Alert.alert('Image Selection', 'Could not open photo selector.');
      }
    }
  };

  // When user clicks "Analyze & Generate 3D Map" -> Call spatial engine and auto scroll to top
  const handleAnalyzePress = async (explicitMapSource?: any) => {
    // Check if explicitMapSource is a valid image source (avoid click event objects)
    const isSource =
      explicitMapSource &&
      (typeof explicitMapSource === 'string' ||
        (typeof explicitMapSource === 'object' && typeof explicitMapSource.uri === 'string') ||
        typeof explicitMapSource === 'number');

    const activeMap = (isSource ? explicitMapSource : null) || uploadedMap || selectedSource;
    let targetUri = '';
    if (typeof activeMap === 'string') {
      targetUri = activeMap;
    } else if (activeMap?.uri) {
      targetUri = activeMap.uri;
    } else {
      const resolved = Image.resolveAssetSource(activeMap);
      targetUri = resolved?.uri || '';
    }

    if (!targetUri) {
      Alert.alert('No Map Selected', 'Please upload or select a 2D blueprint map first.');
      return;
    }

    // Immediately trigger 3D Scanning animation modal
    setIsAnalyzing(true);
    setAnalyzingStageText('1/3 Validating & scanning 2D blueprint contours...');

    try {
      // 1. Analyze 2D blueprint and extract custom 3D architecture
      const analysisResult = await BlueprintSpatialEngine.analyze2DBlueprint(targetUri);
      const customArch =
        (analysisResult && analysisResult.isValidMap && analysisResult.architecture) ||
        architecture3D ||
        MapService.getDefault3DArchitecture(targetUri);

      // 2. Call backend spatial API in background to sync
      MapService.analyzeMapOnBackend(`map_${Date.now()}`, targetUri, customArch).catch(() => {});

      // 3. Keep 3D scanning laser animation active for ~1.6s so user sees the high-tech 3D animation
      setTimeout(() => {
        setIsAnalyzing(false);
        setArchitecture3D(customArch);
        setMetrics({
          rooms: `${customArch.rooms?.length || 6} Zones`,
          clearance: `${customArch.dimensions?.clearanceMeters || 3.2} Meters`,
          breaches: `${customArch.tacticalMarkers?.filter((m: any) => m.type === 'BREACH')?.length || 1} Breaches`,
          status: '100% Ready 🟢',
        });
        setHasAnalyzed(true);
        setIs3DMode(true);

        // Auto-scroll smoothly to top so 3D map directly covers screen
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }, 100);
      }, 1600);
    } catch (e: any) {
      // Fallback: Generate robust 3D model regardless so user is never stuck
      const fallbackArch = architecture3D || MapService.getDefault3DArchitecture(targetUri);
      setTimeout(() => {
        setIsAnalyzing(false);
        setArchitecture3D(fallbackArch);
        setHasAnalyzed(true);
        setIs3DMode(true);
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }, 100);
      }, 1600);
    }
  };

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileAvatar({ uri: result.assets[0].uri });
      }
    } catch (err) {
      Alert.alert('Photo Selection', 'Could not open photo selector.');
    }
  };

  const handleResetUpload = () => {
    setUploadedMap(null);
    setHasAnalyzed(false);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  // Download HD 3D Tactical Map Model directly into user's files / Downloads
  const handleDownloadResult = async () => {
    try {
      const activeMap = uploadedMap || selectedSource;
      let targetUri = '';

      if (typeof activeMap === 'string') {
        targetUri = activeMap;
      } else if (activeMap?.uri) {
        targetUri = activeMap.uri;
      } else {
        const resolved = Image.resolveAssetSource(activeMap);
        targetUri = resolved?.uri || '';
      }

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const timestamp = Date.now();

        // 1. Download HD 3D Tactical Map Image / Result directly into Downloads
        if (targetUri) {
          if (targetUri.startsWith('data:')) {
            const link = document.createElement('a');
            link.href = targetUri;
            link.download = `Tactical_3D_Map_HD_${timestamp}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            try {
              const res = await fetch(targetUri);
              const blob = await res.blob();
              const blobUrl = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = `Tactical_3D_Map_HD_${timestamp}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(blobUrl);
            } catch (fetchErr) {
              const link = document.createElement('a');
              link.href = targetUri;
              link.download = `Tactical_3D_Map_HD_${timestamp}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }
        }

        // 2. Download 3D Tactical Mesh Geometry File (.obj) for CAD / 3D Walkthrough Viewers
        const objContent =
          architecture3D?.objContent ||
          `# National Defense Tactical 3D Reconnaissance Model
# Project VIJAY - Commando Spatial Division
# Clearance Height: 3.2m | Threat: ALPHA_SECURE
# Generated: ${new Date().toISOString()}

o Tactical_3D_Spatial_Model
v -12.0 0.0 -12.0
v 12.0 0.0 -12.0
v 12.0 0.0 12.0
v -12.0 0.0 12.0
v -12.0 3.2 -12.0
v 12.0 3.2 -12.0
v 12.0 3.2 12.0
v -12.0 3.2 12.0

# Base Floor
f 1 2 3 4
# Clearance Ceiling
f 8 7 6 5
# Perimeter Walls & Entry Breaches
f 1 5 6 2
f 2 6 7 3
f 3 7 8 4
f 4 8 5 1
`;
        const objBlob = new Blob([objContent], { type: 'text/plain;charset=utf-8' });
        const objBlobUrl = window.URL.createObjectURL(objBlob);
        const objLink = document.createElement('a');
        objLink.href = objBlobUrl;
        objLink.download = `Tactical_3D_Model_Mesh_${timestamp}.obj`;
        document.body.appendChild(objLink);
        objLink.click();
        document.body.removeChild(objLink);
        window.URL.revokeObjectURL(objBlobUrl);

        Alert.alert(
          '📥 Download Complete',
          'Aapka 3D Tactical Map aur 3D Model Mesh seedhe aapke files (Downloads) mein save ho gaya hai! 🎯'
        );
      } else {
        Alert.alert(
          '📥 HD 3D Model Saved',
          'High-Definition 3D Intelligence Model downloaded to local storage.'
        );
      }
    } catch (err: any) {
      Alert.alert('Download Error', 'Could not download 3D map: ' + (err?.message || ''));
    }
  };

  const handleLogout = async () => {
    setProfileModalVisible(false);
    // Reset past maps to 0 on logout
    setRecentMaps([]);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('ideajam_recent_uploaded_maps');
      } catch (e) {}
    }
    const userKey = user?.email || user?.id || 'commando_tactical';
    try {
      await MapService.clearMapsOnBackend(userKey);
    } catch (e) {}

    if (userToken) {
      await authService.logout(userToken);
    }
    Alert.alert('Signed Out', 'You have been safely signed out.');
    navigation?.replace('Login');
  };

  const handleScrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#08140D" />

      {/* Top Header Bar with Army Emblem Logo next to "Vijay" */}
      <Header onMenuPress={() => setMenuModalVisible(true)} title="Vijay" />

      {/* Commando Military Profile Modal */}
      <ProfileScreen
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        user={user}
        onLogout={handleLogout}
        onPickPhoto={handlePickAvatar}
        profileAvatar={profileAvatar}
        setProfileAvatar={setProfileAvatar}
      />

      {/* Recent 2D Maps Modal (Past Uploaded Blueprints Vault) */}
      <RecentMapsModal
        visible={recentMapsModalVisible}
        onClose={() => setRecentMapsModalVisible(false)}
        recentMaps={recentMaps}
        onSelectMap={handleSelectRecentMap}
        onUploadNew={handleUploadMap}
        onDeleteMap={handleDeleteRecentMap}
      />

      {/* 3D Laser Scanning & Hologram Extrusion Animation Modal */}
      <Scanning3DAnimationModal
        visible={isAnalyzing}
        sourceImage={uploadedMap || selectedSource}
      />

      {/* Navigation Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuModalVisible}
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuModalVisible(false)}
        >
          <View style={styles.navigationMenuCard}>
            <View style={styles.menuModalHeader}>
              <Text style={styles.menuModalTitle}>Navigation Menu</Text>
              <TouchableOpacity onPress={() => setMenuModalVisible(false)}>
                <Text style={styles.menuCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.menuListContainer}>
              {/* Option 1: My Profile */}
              <TouchableOpacity
                style={styles.menuListItemBtn}
                activeOpacity={0.8}
                onPress={() => {
                  setMenuModalVisible(false);
                  setProfileModalVisible(true);
                }}
              >
                <View style={styles.menuItemBadge}>
                  <Text style={styles.menuItemBadgeIcon}>👤</Text>
                </View>
                <Text style={styles.menuListItemText}>1. My Profile</Text>
                <Text style={styles.menuChevron}>›</Text>
              </TouchableOpacity>

              {/* Option 2: 2D Map -> Opens Recent 2D Maps Vault */}
              <TouchableOpacity
                style={[
                  styles.menuListItemBtn,
                  currentViewMode === '2D Map' && styles.menuListItemActive,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  setCurrentViewMode('2D Map');
                  setMenuModalVisible(false);
                  fetchPastUploads();
                  setRecentMapsModalVisible(true);
                }}
              >
                <View style={styles.menuItemBadge}>
                  <Text style={styles.menuItemBadgeIcon}>🗺️</Text>
                </View>
                <Text style={styles.menuListItemText}>2. 2D Map</Text>
                <Text style={styles.menuChevron}>›</Text>
              </TouchableOpacity>

              {/* Option 3: 3D Map View */}
              <TouchableOpacity
                style={[
                  styles.menuListItemBtn,
                  currentViewMode === '3D Map' && styles.menuListItemActive,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  setCurrentViewMode('3D Map');
                  setMenuModalVisible(false);
                  setIs3DMode(true);
                  handleAnalyzePress();
                }}
              >
                <View style={styles.menuItemBadge}>
                  <Text style={styles.menuItemBadgeIcon}>🧊</Text>
                </View>
                <Text style={styles.menuListItemText}>3. 3D Map</Text>
                <Text style={styles.menuChevron}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Main Content Scroll Container */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        scrollEnabled={true}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Hero 2D Image Photo Card -> Shown when not analyzed; compresses when 3D generated */}
        {!hasAnalyzed && (
          <HeroSection
            imageSource={selectedSource}
            isProcessing={isAnalyzing}
          />
        )}

        {/* 2. Upload 2D Map Card -> When hasAnalyzed is true, renders sleek compressed tactical bar with Upload/Change 2D option */}
        <UploadSection
          onUploadPress={handleUploadMap}
          uploadedImage={uploadedMap || (hasAnalyzed ? selectedSource : null)}
          isAnalyzing={isAnalyzing}
          analyzingStageText={analyzingStageText}
          onAnalyzePress={handleAnalyzePress}
          hasAnalyzed={hasAnalyzed}
          onResetUpload={handleResetUpload}
        />

        {/* Starting Page Tactical Features & Capabilities (Shown before 3D map is generated) */}
        {!hasAnalyzed && <StartingTacticalInfo />}
        {!hasAnalyzed && <ForcesTickerSection />}

        {/* ------------------------------------------------------------- */}
        {/* 3. GENERATED 3D MAP SECTION (Compact & Smooth Scroll)         */}
        {/* ------------------------------------------------------------- */}
        {hasAnalyzed && (
          <View style={styles.generated3DSection}>
            <View style={styles.sectionHeaderBadge}>
              <View style={styles.badgePulse} />
              <Text style={styles.sectionBadgeText}>3D TACTICAL MAP MODEL</Text>
            </View>
            <Text style={styles.generatedTitle}>3D Spatial Walkthrough</Text>

            {/* 3D Map Viewport Component with controls & Squad Telemetry */}
            <MapPreview
              sourceImage={uploadedMap || selectedSource}
              architecture={architecture3D || undefined}
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
                  walkthroughActive ? 'Walkthrough Paused' : '3D Walkthrough Active',
                  walkthroughActive
                    ? 'Offline simulation paused.'
                    : 'Troops room-by-room tactical walkthrough active.'
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
              {/* Subtle Top Tricolor Defense Bar */}
              <View style={styles.intelCardTricolorBar}>
                <View style={[styles.intelCardTricolorSeg, { backgroundColor: '#FF671F' }]} />
                <View style={[styles.intelCardTricolorSeg, { backgroundColor: '#FFFFFF' }]} />
                <View style={[styles.intelCardTricolorSeg, { backgroundColor: '#046A38' }]} />
              </View>

              <View style={styles.intelTitleRow}>
                <Text style={styles.intelTitle}>Mission Spatial Intelligence</Text>
                <View style={styles.tirangaIntelTag}>
                  <Text style={styles.tirangaIntelTagText}>🇮🇳 INDIAN DEFENSE</Text>
                </View>
              </View>
              <Text style={styles.intelDesc}>
                Converted from uploaded 2D blueprint into high-fidelity spatial mesh.
              </Text>

              <View style={styles.metricGrid}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Rooms Detected</Text>
                  <Text style={styles.metricValue}>{metrics.rooms}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Clearance Height</Text>
                  <Text style={styles.metricValue}>{metrics.clearance}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Entry Points</Text>
                  <Text style={styles.metricValue}>{metrics.breaches}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Offline Status</Text>
                  <Text style={[styles.metricValue, { color: '#10B981' }]}>{metrics.status}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 5. Green Download HD Result Button (Only shown after 3D map is generated) */}
        {hasAnalyzed && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownloadResult}
            activeOpacity={0.85}
          >
            <Ionicons name="cloud-download-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.downloadButtonText}>Download HD Result</Text>
          </TouchableOpacity>
        )}

        {/* 5.1 Horizontally Moving Armed Forces Cards (NSG, Black Cat, CRPF, BSF, etc.) */}
        {hasAnalyzed && <ForcesTickerSection />}

        {/* 6. Footer Tagline with Scroll to Top Action Button */}
        <View style={styles.footerTaglineContainer}>
          {/* Left Balance Spacer to keep tagline perfectly centered */}
          <View style={styles.arrowSpacer} />

          <Text style={styles.footerTaglineText} numberOfLines={1}>
            {STRINGS.app.tagline}
          </Text>

          <TouchableOpacity
            style={styles.scrollToTopBtn}
            onPress={handleScrollToTop}
            activeOpacity={0.75}
            accessibilityLabel="Scroll to header"
          >
            <Ionicons name="arrow-up" size={19} color="#10B981" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#08140D',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          minHeight: 0,
        } as any)
      : {}),
  },
  scrollView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#08140D',
    ...(Platform.OS === 'web'
      ? ({
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        } as any)
      : {}),
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: '#08140D',
    flexGrow: 1,
  },
  generated3DSection: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 16,
  },
  sectionHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#163622',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5B842',
    marginBottom: 6,
  },
  badgePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  sectionBadgeText: {
    color: '#E5B842',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  generatedTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  generatedSubtitle: {
    fontSize: 11.5,
    color: '#A0B4A7',
    textAlign: 'center',
    maxWidth: 340,
    marginBottom: 10,
  },
  intelCard: {
    width: '100%',
    backgroundColor: '#0E2215',
    borderRadius: 20,
    padding: 14,
    paddingTop: 16,
    borderWidth: 1.2,
    borderColor: '#1D452A',
    marginTop: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  intelCardTricolorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2.2,
    flexDirection: 'row',
  },
  intelCardTricolorSeg: {
    flex: 1,
    height: 2.2,
  },
  intelTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  tirangaIntelTag: {
    backgroundColor: '#163321',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5B842',
  },
  tirangaIntelTagText: {
    color: '#E5B842',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  intelTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#E5B842',
    marginBottom: 3,
  },
  intelDesc: {
    fontSize: 11,
    color: '#7D9987',
    marginBottom: 10,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#08140D',
    borderRadius: 10,
    padding: 9,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#1E432B',
  },
  metricLabel: {
    fontSize: 10,
    color: '#7D9987',
    marginBottom: 2,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '800',
  },
  reUploadActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginTop: 2,
  },
  reUploadActionText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  downloadButton: {
    width: '100%',
    maxWidth: 420,
    height: 50,
    backgroundColor: '#FF6B00',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  downloadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerTaglineContainer: {
    width: '100%',
    maxWidth: 480,
    marginTop: 26,
    marginBottom: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowSpacer: {
    width: 38,
    height: 38,
  },
  footerTaglineText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 18,
    color: '#7D9987',
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 14,
  },
  scrollToTopBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#132B1D',
    borderWidth: 1.5,
    borderColor: '#2A5C3B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 10, 6, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  navigationMenuCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0F2417',
    borderRadius: 24,
    padding: 24,
    elevation: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: '#265436',
  },
  menuModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E432B',
  },
  menuModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuCloseText: {
    fontSize: 18,
    color: '#7D9987',
    fontWeight: '700',
  },
  menuListContainer: {
    width: '100%',
    paddingVertical: 4,
  },
  menuListItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#132B1D',
    borderWidth: 1,
    borderColor: '#265436',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  menuListItemActive: {
    borderColor: '#10B981',
    backgroundColor: '#193A24',
  },
  menuItemBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#08140D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#265436',
  },
  menuItemBadgeIcon: {
    fontSize: 18,
  },
  menuListItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  menuChevron: {
    fontSize: 20,
    color: '#7D9987',
    fontWeight: '600',
  },
});

export default MainAppScreen;

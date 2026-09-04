import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageStyle, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { MapLayer, Architecture3D, SquadLocationData } from '../../types/map';
import { Tactical3DCanvas } from './Tactical3DCanvas';

interface MapPreviewProps {
  sourceImage: any;
  architecture?: Architecture3D;
  is3DMode?: boolean;
  zoomLevel?: number;
  activeLayer?: MapLayer;
  walkthroughActive?: boolean;
  onToggle3D?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onToggleWalkthrough?: () => void;
  onSelectLayer?: (layer: MapLayer) => void;
  squadData?: SquadLocationData | null;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  sourceImage,
  architecture,
  is3DMode = true,
  zoomLevel = 1,
  activeLayer = 'Tactical',
  walkthroughActive = false,
  onToggle3D,
  onZoomIn,
  onZoomOut,
  onToggleWalkthrough,
  onSelectLayer,
  squadData,
}) => {
  // 10-Second Objective Red Dot Alert (Starts Green for 10s, then turns Red)
  const [is2DRedAlert, setIs2DRedAlert] = useState<boolean>(false);
  const [countdown2D, setCountdown2D] = useState<number>(10);

  useEffect(() => {
    let seconds = 0;
    setIs2DRedAlert(false);
    setCountdown2D(10);
    const timer = setInterval(() => {
      seconds += 1;
      setCountdown2D(Math.max(0, 10 - seconds));
      if (seconds >= 10) {
        setIs2DRedAlert(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [sourceImage, architecture]);

  // Map 3D coordinates (X: -12.2 to 12.2, Z: -6.75 to 6.75) to 2D Blueprint percentage
  const pX = squadData?.primaryUser?.location?.x ?? 7.85;
  const pZ = squadData?.primaryUser?.location?.z ?? 0.0;
  const dX = squadData?.dummyUser?.location?.x ?? -2.3;
  const dZ = squadData?.dummyUser?.location?.z ?? -4.75;

  const pLeftPct = Math.max(8, Math.min(88, ((pX + 12.2) / 24.4) * 100));
  const pTopPct = Math.max(12, Math.min(86, ((pZ + 6.75) / 13.5) * 100));

  const dLeftPct = Math.max(8, Math.min(88, ((dX + 12.2) / 24.4) * 100));
  const dTopPct = Math.max(12, Math.min(86, ((dZ + 6.75) / 13.5) * 100));

  const objLeftPct = Math.max(8, Math.min(88, ((-2.3 + 12.2) / 24.4) * 100));
  const objTopPct = Math.max(12, Math.min(86, ((-4.75 + 6.75) / 13.5) * 100));

  return (
    <View style={styles.viewportCard}>
      {/* Top Header Mode Bar: 3D Model vs 2D Blueprint */}
      <View style={styles.viewportHeader}>
        <View style={styles.viewportTagRow}>
          <Text style={styles.viewportTagText}>
            {is3DMode ? '🧊 3D SPATIAL MODEL (WEBGL)' : '🗺️ 2D BLUEPRINT VIEW'}
          </Text>
        </View>

        {onToggle3D && (
          <TouchableOpacity
            style={[styles.modeToggleBtn, is3DMode && styles.modeToggleActive]}
            onPress={onToggle3D}
            activeOpacity={0.8}
          >
            <Text style={styles.modeToggleText}>
              {is3DMode ? 'Switch to 2D' : 'Switch to 3D'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Viewport Container */}
      <View style={styles.viewportContainer}>
        {is3DMode ? (
          <Tactical3DCanvas
            architecture={architecture}
            is3DMode={is3DMode}
            zoomLevel={zoomLevel}
            walkthroughActive={walkthroughActive}
            onToggleWalkthrough={onToggleWalkthrough}
            squadData={squadData}
          />
        ) : (
          <>
            <Image
              source={typeof sourceImage === 'string' ? { uri: sourceImage } : sourceImage}
              style={[
                styles.mapSurfaceImage as ImageStyle,
                { transform: [{ scale: zoomLevel }] },
              ]}
              resizeMode="contain"
            />

            {/* 2D Grid Overlay Wireframe */}
            <View style={styles.gridOverlay} pointerEvents="none">
              <View style={styles.gridHorizontal} />
              <View style={styles.gridHorizontal2} />
              <View style={styles.gridVertical} />
              <View style={styles.gridVertical2} />

              {/* 2D Tactical Operator Pin: Primary User (You) */}
              <View style={[styles.operator2DPin, { top: `${pTopPct}%`, left: `${pLeftPct}%` }]}>
                <View style={[styles.targetPulse, { backgroundColor: '#10B981' }]} />
                <View style={[styles.pinCoreDot, { backgroundColor: '#10B981' }]} />
                <View style={[styles.pinBadge, { borderColor: '#10B981' }]}>
                  <Text style={[styles.pinBadgeTitle, { color: '#34D399' }]}>🟢 YOU (CAPT. ARJUN)</Text>
                  <Text style={styles.pinBadgeRoom} numberOfLines={1}>
                    {squadData?.primaryUser?.location?.roomName || 'Reception'}
                  </Text>
                </View>
              </View>

              {/* 2D Tactical Operator Pin: Dummy User (Commando Vikram) */}
              <View style={[styles.operator2DPin, { top: `${dTopPct}%`, left: `${dLeftPct}%` }]}>
                <View style={[styles.targetPulse, { backgroundColor: '#38BDF8' }]} />
                <View style={[styles.pinCoreDot, { backgroundColor: '#38BDF8' }]} />
                <View style={[styles.pinBadge, { borderColor: '#38BDF8' }]}>
                  <Text style={[styles.pinBadgeTitle, { color: '#38BDF8' }]}>🔵 COMM. VIKRAM</Text>
                  <Text style={styles.pinBadgeRoom} numberOfLines={1}>
                    {squadData?.dummyUser?.location?.roomName || 'Server Vault'}
                  </Text>
                </View>
              </View>

              {/* 2D Objective Dot (Cyber Vault): Starts GREEN, turns RED after 10 seconds */}
              <View style={[styles.operator2DPin, { top: `${objTopPct}%`, left: `${objLeftPct}%` }]}>
                <View style={[styles.targetPulse, { backgroundColor: is2DRedAlert ? '#EF4444' : '#10B981' }]} />
                <View style={[styles.pinCoreDot, { backgroundColor: is2DRedAlert ? '#EF4444' : '#10B981' }]} />
                <View style={[styles.pinBadge, { borderColor: is2DRedAlert ? '#EF4444' : '#10B981' }]}>
                  <Text style={[styles.pinBadgeTitle, { color: is2DRedAlert ? '#EF4444' : '#34D399' }]}>
                    {is2DRedAlert ? '🔴 OBJECTIVE (ALERT)' : `🟢 OBJECTIVE (${countdown2D}s)`}
                  </Text>
                  <Text style={styles.pinBadgeRoom} numberOfLines={1}>
                    Cyber Server Vault
                  </Text>
                </View>
              </View>

              {/* Top Distance HUD Banner over 2D Blueprint */}
              <View style={styles.rangeBanner2D}>
                <View style={styles.beacon2DDot} />
                <Text style={styles.rangeBanner2DText}>
                  {`SQUAD RANGE: ${squadData?.interUnitMetrics?.distanceMeters || 11.21}m | BEARING: ${squadData?.interUnitMetrics?.bearingCompass || 'SW'} ${squadData?.interUnitMetrics?.bearingDegrees || 245}°`}
                </Text>
              </View>
            </View>

            {/* Floating Zoom & Controls for 2D Mode */}
            <View style={styles.floatingControls}>
              {onZoomIn && (
                <TouchableOpacity style={styles.controlCircle} onPress={onZoomIn}>
                  <Text style={styles.controlIcon}>+</Text>
                </TouchableOpacity>
              )}
              {onZoomOut && (
                <TouchableOpacity style={styles.controlCircle} onPress={onZoomOut}>
                  <Text style={styles.controlIcon}>−</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  viewportCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.commando.surface,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.commando.border,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  viewportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0B1B11',
    borderBottomWidth: 1,
    borderBottomColor: '#1E432B',
  },
  viewportTagRow: {
    backgroundColor: '#173B25',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  viewportTagText: {
    color: '#90E0EF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  modeToggleBtn: {
    backgroundColor: colors.commando.surfaceLighter,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.commando.border,
  },
  modeToggleActive: {
    borderColor: colors.commando.accentGold,
    backgroundColor: '#244D32',
  },
  modeToggleText: {
    color: colors.white,
    fontSize: 11.5,
    fontWeight: '700',
  },
  viewportContainer: {
    width: '100%',
    height: 390,
    backgroundColor: '#050E08',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapSurfaceImage: {
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridHorizontal: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  gridHorizontal2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  gridVertical: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  gridVertical2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  targetMarker: {
    position: 'absolute',
    backgroundColor: 'rgba(11, 25, 16, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.commando.accentGold,
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    marginRight: 6,
  },
  markerText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  floatingControls: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(11, 25, 16, 0.85)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.commando.border,
  },
  controlCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.commando.surfaceLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  controlCircleActive: {
    backgroundColor: colors.commando.accentGold,
  },
  controlIcon: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  layerTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#0A180E',
    padding: 8,
    justifyContent: 'space-between',
  },
  layerTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 4,
  },
  layerTabActive: {
    backgroundColor: colors.commando.surfaceLighter,
    borderWidth: 1,
    borderColor: colors.commando.accentGold,
  },
  layerTabText: {
    color: colors.commando.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  layerTabTextActive: {
    color: colors.slate[50],
    fontWeight: '800',
  },
  operator2DPin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  pinCoreDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
  },
  pinBadge: {
    position: 'absolute',
    top: 18,
    backgroundColor: 'rgba(5, 18, 12, 0.94)',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  pinBadgeTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  pinBadgeRoom: {
    color: '#E2E8F0',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 1,
  },
  rangeBanner2D: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 18, 12, 0.94)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 20,
  },
  beacon2DDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  rangeBanner2DText: {
    color: '#FBBF24',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
});

export default MapPreview;

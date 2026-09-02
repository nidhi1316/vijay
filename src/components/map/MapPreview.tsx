import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { MapLayer } from '../../types/map';

interface MapPreviewProps {
  sourceImage: any;
  is3DMode?: boolean;
  zoomLevel?: number;
  activeLayer?: MapLayer;
  walkthroughActive?: boolean;
  onToggle3D?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onToggleWalkthrough?: () => void;
  onSelectLayer?: (layer: MapLayer) => void;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  sourceImage,
  is3DMode = true,
  zoomLevel = 1,
  activeLayer = 'Tactical',
  walkthroughActive = false,
  onToggle3D,
  onZoomIn,
  onZoomOut,
  onToggleWalkthrough,
  onSelectLayer,
}) => {
  return (
    <View style={styles.viewportCard}>
      <View style={styles.viewportContainer}>
        <Image
          source={typeof sourceImage === 'string' ? { uri: sourceImage } : sourceImage}
          style={[
            styles.mapSurfaceImage as ImageStyle,
            is3DMode
              ? {
                  transform: [
                    { perspective: 700 },
                    { rotateX: '18deg' },
                    { scale: zoomLevel * 1.05 },
                  ],
                }
              : { transform: [{ scale: zoomLevel }] },
          ]}
          resizeMode="cover"
        />

        {/* 3D Grid Overlay Wireframe */}
        <View style={styles.gridOverlay} pointerEvents="none">
          <View style={styles.gridHorizontal} />
          <View style={styles.gridHorizontal2} />
          <View style={styles.gridVertical} />
          <View style={styles.gridVertical2} />

          {/* Target Markers */}
          <View style={[styles.targetMarker, { top: '30%', left: '38%' }]}>
            <View style={styles.targetPulse} />
            <Text style={styles.markerText}>📍 Alpha Target</Text>
          </View>

          <View style={[styles.targetMarker, { top: '65%', left: '60%' }]}>
            <View style={[styles.targetPulse, { backgroundColor: '#10B981' }]} />
            <Text style={styles.markerText}>🛡️ Extraction Zone</Text>
          </View>
        </View>

        {/* Floating Zoom & Controls */}
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
          {onToggleWalkthrough && (
            <TouchableOpacity
              style={[styles.controlCircle, walkthroughActive && styles.controlCircleActive]}
              onPress={onToggleWalkthrough}
            >
              <Text style={styles.controlIcon}>{walkthroughActive ? '⏸️' : '🚶'}</Text>
            </TouchableOpacity>
          )}
        </View>
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
});

export default MapPreview;

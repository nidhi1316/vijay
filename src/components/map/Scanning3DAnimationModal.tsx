import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Scanning3DAnimationModalProps {
  visible: boolean;
  sourceImage?: any;
  onComplete?: () => void;
}

const STAGES = [
  { percent: 22, text: 'Scanning 2D Blueprint Coordinates...', sub: 'Detecting boundary pixels & orientation' },
  { percent: 48, text: 'Analyzing Room Partitions & Walls...', sub: 'Extracting orthogonal interior divisions' },
  { percent: 76, text: 'Extruding 3D Spatial Geometry...', sub: 'Computing clearance height & floor zones' },
  { percent: 100, text: 'Finalizing 3D Interactive Tactical Model...', sub: 'Synthesizing 60 FPS WebGL mesh' },
];

export const Scanning3DAnimationModal: React.FC<Scanning3DAnimationModalProps> = ({
  visible,
  sourceImage,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(12);

  // Animation values
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const gridAlpha = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!visible) {
      setCurrentStageIdx(0);
      setProgressPercent(12);
      return;
    }

    // 1. Scan line bouncing up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();

    // 2. Pulse radar circle
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 750,
          easing: Easing.out(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 750,
          easing: Easing.in(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();

    // 3. Continuous 3D rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    ).start();

    // 4. Grid flash
    Animated.loop(
      Animated.sequence([
        Animated.timing(gridAlpha, {
          toValue: 0.85,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(gridAlpha, {
          toValue: 0.35,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();

    // Stage progression timer
    const t1 = setTimeout(() => {
      setCurrentStageIdx(1);
      setProgressPercent(48);
    }, 400);

    const t2 = setTimeout(() => {
      setCurrentStageIdx(2);
      setProgressPercent(76);
    }, 900);

    const t3 = setTimeout(() => {
      setCurrentStageIdx(3);
      setProgressPercent(98);
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible]);

  if (!visible) return null;

  const currentStage = STAGES[currentStageIdx] || STAGES[0];

  const scanTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-90, 90],
  });

  const rotateDeg = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.scanContainer}>
          {/* Top Indian Defense Header */}
          <View style={styles.headerRow}>
            <View style={styles.tricolorBar}>
              <View style={[styles.triSeg, { backgroundColor: '#FF671F' }]} />
              <View style={[styles.triSeg, { backgroundColor: '#FFFFFF' }]} />
              <View style={[styles.triSeg, { backgroundColor: '#046A38' }]} />
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.liveDot} />
              <Text style={styles.headerTitle}>3D SPATIAL RECONNAISSANCE ENGINE</Text>
            </View>
            <Text style={styles.securityClearance}>TOP SECRET // AI-3D</Text>
          </View>

          {/* Central 3D Blueprint Hologram Viewport */}
          <View style={styles.viewportBox}>
            {/* Corner HUD Reticles */}
            <View style={[styles.cornerBracket, styles.cornerTL]} />
            <View style={[styles.cornerBracket, styles.cornerTR]} />
            <View style={[styles.cornerBracket, styles.cornerBL]} />
            <View style={[styles.cornerBracket, styles.cornerBR]} />

            {/* Background 2D Blueprint with Cyan Matrix Tint */}
            {sourceImage && (
              <Image
                source={sourceImage}
                style={styles.blueprintImage}
                resizeMode="contain"
              />
            )}

            {/* Tactical Grid Lines */}
            <Animated.View style={[styles.gridOverlay, { opacity: gridAlpha }]} />

            {/* Rotating 3D Radar Circle */}
            <Animated.View
              style={[
                styles.radarCircle,
                {
                  transform: [{ scale: pulseAnim }, { rotate: rotateDeg }],
                },
              ]}
            >
              <View style={styles.radarCrossH} />
              <View style={styles.radarCrossV} />
              <View style={styles.radarInnerDot} />
            </Animated.View>

            {/* Moving Laser Beam Scanner */}
            <Animated.View
              style={[
                styles.laserBeam,
                {
                  transform: [{ translateY: scanTranslateY }],
                },
              ]}
            >
              <View style={styles.laserLine} />
              <View style={styles.laserGlow} />
            </Animated.View>

            {/* 3D Isometric Hologram Wireframe Badge */}
            <View style={styles.isometricBadge}>
              <Ionicons name="cube-outline" size={20} color="#10B981" />
              <Text style={styles.isometricBadgeText}>EXTRUDING 3D MESH</Text>
            </View>
          </View>

          {/* Live Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.stageTitleText}>{currentStage.text}</Text>
              <Text style={styles.percentText}>{progressPercent}%</Text>
            </View>

            {/* Track Bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>

            <Text style={styles.stageSubText}>{currentStage.sub}</Text>
          </View>

          {/* Step Indicators */}
          <View style={styles.stepsRow}>
            {STAGES.map((st, idx) => {
              const isDone = currentStageIdx > idx;
              const isCurr = currentStageIdx === idx;
              return (
                <View key={idx} style={[styles.stepItem, isCurr && styles.stepItemCurrent, isDone && styles.stepItemDone]}>
                  <Text style={[styles.stepIcon, (isDone || isCurr) && styles.stepIconActive]}>
                    {isDone ? '✓' : `${idx + 1}`}
                  </Text>
                  <Text style={[styles.stepText, (isDone || isCurr) && styles.stepTextActive]} numberOfLines={1}>
                    {idx === 0 ? 'Vectors' : idx === 1 ? 'Partitions' : idx === 2 ? 'Clearance' : '3D Mesh'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 10, 6, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scanContainer: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#08170E',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#10B981',
    padding: 18,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  headerRow: {
    marginBottom: 14,
  },
  tricolorBar: {
    flexDirection: 'row',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  triSeg: {
    flex: 1,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.8,
  },
  securityClearance: {
    fontSize: 10,
    color: '#7D9987',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  viewportBox: {
    width: '100%',
    height: 220,
    backgroundColor: '#040F08',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#133522',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  blueprintImage: {
    width: '90%',
    height: '90%',
    opacity: 0.45,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  cornerBracket: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: '#10B981',
    zIndex: 10,
  },
  cornerTL: {
    top: 8,
    left: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 8,
    right: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  radarCircle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarCrossH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.4)',
  },
  radarCrossV: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.4)',
  },
  radarInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  laserBeam: {
    position: 'absolute',
    width: '100%',
    height: 3,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  laserLine: {
    width: '100%',
    height: 2.5,
    backgroundColor: '#34D399',
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  laserGlow: {
    position: 'absolute',
    width: '100%',
    height: 18,
    backgroundColor: 'rgba(52, 211, 153, 0.18)',
  },
  isometricBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 23, 14, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    zIndex: 15,
  },
  isometricBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  progressSection: {
    width: '100%',
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stageTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  percentText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#34D399',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#122B1E',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: '#1D4530',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  stageSubText: {
    fontSize: 11,
    color: '#7D9987',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#122E1D',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    opacity: 0.4,
  },
  stepItemCurrent: {
    opacity: 1,
  },
  stepItemDone: {
    opacity: 0.9,
  },
  stepIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#122E1D',
    color: '#7D9987',
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
  },
  stepIconActive: {
    backgroundColor: '#10B981',
    color: '#08140D',
  },
  stepText: {
    fontSize: 10,
    color: '#7D9987',
    fontWeight: '600',
  },
  stepTextActive: {
    color: '#34D399',
  },
});

export default Scanning3DAnimationModal;

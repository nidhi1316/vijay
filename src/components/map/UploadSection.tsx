import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ImageStyle } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

interface UploadSectionProps {
  onUploadPress: () => void;
  uploadedImage?: any;
  isAnalyzing?: boolean;
  onAnalyzePress?: () => void;
  hasAnalyzed?: boolean;
  onResetUpload?: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onUploadPress,
  uploadedImage,
  isAnalyzing = false,
  onAnalyzePress,
  hasAnalyzed = false,
  onResetUpload,
}) => {
  // -------------------------------------------------------------
  // STATE 3: Analyzed -> Renders sleek compressed tactical bar at top
  // -------------------------------------------------------------
  if (uploadedImage && hasAnalyzed) {
    return (
      <View style={styles.compressedCard}>
        {/* 2D Blueprint Thumbnail */}
        <Image
          source={typeof uploadedImage === 'string' ? { uri: uploadedImage } : uploadedImage}
          style={styles.compressedThumb as ImageStyle}
          resizeMode="cover"
        />

        {/* 2D Info Column */}
        <View style={styles.compressedInfoCol}>
          <View style={styles.compressedTitleRow}>
            <Text style={styles.compressedTitle} numberOfLines={1}>
              2D Blueprint Synchronized
            </Text>
          </View>
          <Text style={styles.compressedSub} numberOfLines={1}>
            Spatial intelligence extracted
          </Text>
        </View>

        {/* Change 2D Map Action Button */}
        <TouchableOpacity
          style={styles.compressedChangeBtn}
          onPress={onUploadPress}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={13} color="#34D399" style={{ marginRight: 4 }} />
          <Text style={styles.compressedChangeText}>Upload / Change 2D</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // -------------------------------------------------------------
  // STATE 2: Photo Uploaded -> Shows "Analyze" button
  // -------------------------------------------------------------
  if (uploadedImage) {
    return (
      <View style={styles.uploadCard}>
        {/* Top Tricolor Micro Accent */}
        <View style={styles.cardTricolorTopBar}>
          <View style={[styles.cardTricolorSeg, { backgroundColor: '#FF671F' }]} />
          <View style={[styles.cardTricolorSeg, { backgroundColor: '#FFFFFF' }]} />
          <View style={[styles.cardTricolorSeg, { backgroundColor: '#046A38' }]} />
        </View>

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>Analyze 2D Map</Text>
        </View>

        <Text style={styles.cardSubtitle}>
          Blueprint uploaded. Click Analyze to generate 3D tactical model.
        </Text>

        <View style={styles.readyCard}>
          {/* Uploaded Thumbnail Row */}
          <View style={styles.thumbRow}>
            <Image
              source={typeof uploadedImage === 'string' ? { uri: uploadedImage } : uploadedImage}
              style={styles.uploadedThumb as ImageStyle}
              resizeMode="cover"
            />
            <View style={styles.thumbInfoCol}>
              <Text style={styles.thumbFileName}>
                {hasAnalyzed ? '2D Blueprint Synchronized' : '2D Blueprint Uploaded'}
              </Text>
              <Text style={styles.thumbFileSub}>
                {hasAnalyzed ? 'Spatial intelligence extracted' : 'Ready for 3D model generation'}
              </Text>
            </View>
          </View>

          {/* Analyze Button / Loading State */}
          {isAnalyzing ? (
            <View style={styles.analyzingState}>
              <ActivityIndicator size="small" color="#10B981" style={{ marginRight: 8 }} />
              <Text style={styles.analyzingText}>Converting 2D Blueprint to 3D Map...</Text>
            </View>
          ) : !hasAnalyzed && onAnalyzePress ? (
            <TouchableOpacity
              style={styles.analyseButton}
              onPress={onAnalyzePress}
              activeOpacity={0.85}
            >
              <Ionicons name="scan" size={19} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.analyseButtonText}>Analyze & Generate 3D Map</Text>
            </TouchableOpacity>
          ) : null}

          {/* Change photo / Upload new map link */}
          <TouchableOpacity
            style={styles.changeLink}
            onPress={onUploadPress}
            activeOpacity={0.75}
          >
            <Text style={styles.changeLinkText}>
              {hasAnalyzed ? '↺ Upload / Change 2D Map' : 'Change photo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------
  // STATE 1: Initial (Before Upload) -> Shows "Upload 2D Map"
  // -------------------------------------------------------------
  return (
    <View style={styles.uploadCard}>
      {/* Top Tricolor Micro Accent */}
      <View style={styles.cardTricolorTopBar}>
        <View style={[styles.cardTricolorSeg, { backgroundColor: '#FF671F' }]} />
        <View style={[styles.cardTricolorSeg, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.cardTricolorSeg, { backgroundColor: '#046A38' }]} />
      </View>

      {/* Header */}
      <Text style={styles.cardTitle}>Upload 2D Map</Text>
      <Text style={styles.cardSubtitle}>in JPG , PNG , GIF, PDF</Text>

      {/* Compact Tactical Green Dashed Drop Zone */}
      <TouchableOpacity
        style={styles.dropZone}
        onPress={onUploadPress}
        activeOpacity={0.78}
      >
        <View style={styles.iconContainer}>
          <Feather name="upload" size={30} color="#10B981" />
        </View>

        <Text style={styles.dropText}>
          Drag and drop or{' '}
          <Text style={styles.browseText}>Browse</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  uploadCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0E2215',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 28,
    borderWidth: 1.2,
    borderColor: '#1D452A',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#7D9987',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 14,
    fontWeight: '500',
  },
  dropZone: {
    width: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    paddingVertical: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropText: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '500',
    textAlign: 'center',
  },
  browseText: {
    color: '#FF8800',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },

  // Ready / Analyse Card
  readyCard: {
    width: '100%',
    backgroundColor: '#132B1D',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#265436',
    alignItems: 'center',
  },
  thumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  uploadedThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#10B981',
    marginRight: 10,
    backgroundColor: '#08140D',
  },
  thumbInfoCol: {
    flex: 1,
  },
  thumbFileName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  thumbFileSub: {
    fontSize: 11,
    color: '#7D9987',
  },
  analyseButton: {
    width: '100%',
    height: 44,
    backgroundColor: '#059669',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 8,
  },
  analyseButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  analyzingState: {
    width: '100%',
    height: 42,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  analyzingText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '600',
  },
  changeLink: {
    paddingVertical: 2,
  },
  changeLinkText: {
    color: '#7D9987',
    fontSize: 11.5,
    textDecorationLine: 'underline',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#132B1D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  statusBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  compressedCard: {
    width: '100%',
    maxWidth: 480,
    height: 52,
    backgroundColor: '#0C2013',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#245233',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 4,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  cardTricolorTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2.2,
    flexDirection: 'row',
  },
  cardTricolorSeg: {
    flex: 1,
    height: 2.2,
  },
  compressedThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#10B981',
    marginRight: 10,
    backgroundColor: '#08140D',
  },
  compressedInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  compressedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  compressedTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 6,
  },
  statusBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#132B1D',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusBadgeTextSmall: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '700',
  },
  compressedSub: {
    fontSize: 11,
    color: '#7D9987',
  },
  compressedChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#163622',
    borderWidth: 1,
    borderColor: '#2D6640',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 8,
  },
  compressedChangeText: {
    color: '#34D399',
    fontSize: 11.5,
    fontWeight: '700',
  },
});

export default UploadSection;

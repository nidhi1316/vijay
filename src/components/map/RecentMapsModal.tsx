import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export interface RecentMapItem {
  id: string;
  source: any;
  name: string;
  timestamp: string;
  date: string;
  size?: string;
  analyzed?: boolean;
}

interface RecentMapsModalProps {
  visible: boolean;
  onClose: () => void;
  recentMaps: RecentMapItem[];
  onSelectMap: (map: RecentMapItem, autoAnalyze?: boolean) => void;
  onUploadNew: () => void;
  onDeleteMap?: (id: string) => void;
}

export const RecentMapsModal: React.FC<RecentMapsModalProps> = ({
  visible,
  onClose,
  recentMaps,
  onSelectMap,
  onUploadNew,
  onDeleteMap,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.modalCard}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <View style={styles.iconBadge}>
                <Text style={styles.iconBadgeText}>🗺️</Text>
              </View>
              <View>
                <View style={styles.badgeRow}>
                  <Text style={styles.modalTitle}>Recent 2D Maps</Text>
                  <View style={styles.vaultBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.vaultBadgeText}>
                      Total: {recentMaps?.length || 0} Uploads
                    </Text>
                  </View>
                </View>
                <Text style={styles.modalSubtitle}>
                  Past uploaded blueprints & reconnaissance captures
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Action Bar: Quick Upload New */}
          <TouchableOpacity
            style={styles.uploadNewBtn}
            onPress={() => {
              onClose();
              onUploadNew();
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.uploadNewBtnText}>+ Upload New 2D Blueprint</Text>
          </TouchableOpacity>

          {/* Scrollable Maps List */}
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollContainer}
          >
            {recentMaps && recentMaps.length > 0 ? (
              recentMaps.map((item, index) => {
                const imgSource =
                  typeof item.source === 'string'
                    ? { uri: item.source }
                    : item.source?.uri
                    ? { uri: item.source.uri }
                    : item.source;

                return (
                  <View key={item.id || index} style={styles.mapItemCard}>
                    {/* Thumbnail Preview */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => onSelectMap(item, false)}
                      style={styles.thumbWrapper}
                    >
                      <Image
                        source={imgSource}
                        style={styles.thumbImage as ImageStyle}
                        resizeMode="cover"
                      />
                      <View style={styles.thumbBadge}>
                        <Text style={styles.thumbBadgeText}>2D</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Metadata Column */}
                    <View style={styles.mapInfoCol}>
                      <Text style={styles.mapName} numberOfLines={1}>
                        {item.name || `Tactical Blueprint #${index + 1}`}
                      </Text>

                      <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={12} color="#7D9987" style={{ marginRight: 4 }} />
                        <Text style={styles.metaText}>{item.date || 'Today'} • {item.timestamp || 'Uploaded'}</Text>
                      </View>

                      <View style={styles.tagRow}>
                        <View style={styles.statusPill}>
                          <View style={styles.statusDot} />
                          <Text style={styles.statusPillText}>Ready for 3D Mesh</Text>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={styles.loadMapBtn}
                          onPress={() => onSelectMap(item, false)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="checkmark-circle-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <Text style={styles.loadMapBtnText}>Load 2D Map</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.view3DBtn}
                          onPress={() => onSelectMap(item, true)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="cube-outline" size={14} color="#E5B842" style={{ marginRight: 4 }} />
                          <Text style={styles.view3DBtnText}>View 3D</Text>
                        </TouchableOpacity>

                        {onDeleteMap && (
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => onDeleteMap(item.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              /* Empty State */
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Text style={styles.emptyIcon}>🗺️</Text>
                </View>
                <Text style={styles.emptyTitle}>No Past 2D Maps Found</Text>
                <Text style={styles.emptySubtitle}>
                  You haven't uploaded any 2D blueprints yet. Upload your first blueprint to save it in your tactical vault.
                </Text>
                <TouchableOpacity
                  style={styles.emptyUploadBtn}
                  onPress={() => {
                    onClose();
                    onUploadNew();
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="cloud-upload" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.emptyUploadBtnText}>Upload First 2D Blueprint</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Footer Close Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.footerCloseBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.footerCloseBtnText}>Close Vault</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 10, 6, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '88%',
    backgroundColor: '#0F2417',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#265436',
    elevation: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E432B',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#08140D',
    borderWidth: 1,
    borderColor: '#265436',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconBadgeText: {
    fontSize: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 8,
  },
  vaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#132B1D',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  vaultBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: '#7D9987',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#132B1D',
    borderWidth: 1,
    borderColor: '#265436',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  closeBtnText: {
    fontSize: 15,
    color: '#7D9987',
    fontWeight: '700',
  },
  uploadNewBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#059669',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  uploadNewBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 16,
  },
  mapItemCard: {
    flexDirection: 'row',
    backgroundColor: '#132B1D',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#1E432B',
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  thumbWrapper: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#10B981',
    backgroundColor: '#08140D',
    marginRight: 12,
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(8, 20, 13, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  thumbBadgeText: {
    fontSize: 8.5,
    color: '#10B981',
    fontWeight: '800',
  },
  mapInfoCol: {
    flex: 1,
  },
  mapName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  metaText: {
    fontSize: 11,
    color: '#7D9987',
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E2215',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#265436',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  statusPillText: {
    fontSize: 10,
    color: '#34D399',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 8,
    marginRight: 8,
  },
  loadMapBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  view3DBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A28',
    paddingHorizontal: 9,
    paddingVertical: 5.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5B842',
    marginRight: 8,
  },
  view3DBtnText: {
    color: '#E5B842',
    fontSize: 11.5,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#1E1B1B',
    borderWidth: 1,
    borderColor: '#3D2020',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#132B1D',
    borderWidth: 1,
    borderColor: '#265436',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#7D9987',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 18,
    maxWidth: 280,
  },
  emptyUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyUploadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E432B',
    backgroundColor: '#0B1B11',
    alignItems: 'center',
  },
  footerCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#132B1D',
    borderWidth: 1,
    borderColor: '#265436',
  },
  footerCloseBtnText: {
    color: '#A0B4A7',
    fontSize: 12.5,
    fontWeight: '700',
  },
});

export default RecentMapsModal;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ImageStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { SAMPLES, COMMANDO_POSITIONS } from '../../constants/assets';
import { STRINGS } from '../../constants/strings';

/**
 * Cleanly formats user name into a real person name (e.g. "akashdubey.gmo" -> "Akash Dubey")
 */
export const formatPersonName = (rawName?: string, rawEmail?: string): string => {
  if (!rawName && !rawEmail) return 'Akash Dubey';

  let str = (rawName || rawEmail?.split('@')[0] || '').trim();

  // If email, grab before @
  if (str.includes('@')) {
    str = str.split('@')[0];
  }

  // Remove common trailing extensions like .gmo, .com, etc.
  str = str.replace(/\.(gmo|com|in|org|net|gov|mil)$/i, '');

  // Normalize check for akashdubey
  const normalized = str.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized === 'akashdubey') {
    return 'Akash Dubey';
  }

  // Replace separators with spaces
  if (str.includes('.') || str.includes('_') || str.includes('-')) {
    return str
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  // Split camelCase if present
  str = str.replace(/([a-z])([A-Z])/g, '$1 $2');

  if (str.includes(' ')) {
    return str
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
};

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user?: any;
  onLogout: () => void;
  onPickPhoto: () => Promise<void>;
  profileAvatar: any;
  setProfileAvatar: (source: any) => void;
}

export const ProfileScreen: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  user,
  onLogout,
  onPickPhoto,
  profileAvatar,
  setProfileAvatar,
}) => {
  // Commando Profile States
  const [profileName, setProfileName] = useState<string>(() =>
    formatPersonName(user?.name, user?.email)
  );
  const [profileEmail, setProfileEmail] = useState<string>(user?.email || STRINGS.commando.defaultEmail);
  const [profileCitizenId, setProfileCitizenId] = useState<string>(user?.citizenId || STRINGS.commando.defaultCitizenId);
  const [commandoPosition, setCommandoPosition] = useState<string>(STRINGS.commando.defaultPosition);

  // Sync if user prop updates
  React.useEffect(() => {
    if (user?.name || user?.email) {
      setProfileName(formatPersonName(user?.name, user?.email));
    }
  }, [user]);

  // Edit Profile States
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(profileName);
  const [editEmail, setEditEmail] = useState<string>(profileEmail);
  const [editCitizenId, setEditCitizenId] = useState<string>(profileCitizenId);
  const [editPosition, setEditPosition] = useState<string>(commandoPosition);

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('Validation', 'Officer name cannot be empty.');
      return;
    }
    setProfileName(editName.trim());
    setProfileEmail(editEmail.trim());
    setProfileCitizenId(editCitizenId.trim());
    setCommandoPosition(editPosition.trim());
    setIsEditingProfile(false);
    Alert.alert('Commando Dossier Updated', 'Officer profile credentials updated successfully! 🎖️');
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        setIsEditingProfile(false);
        onClose();
      }}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => {
          setIsEditingProfile(false);
          onClose();
        }}
      >
        <View style={styles.commandoModalCard} onStartShouldSetResponder={() => true}>
          <View style={styles.commandoModalHeader}>
            <View style={styles.headerRankBadge}>
              <Text style={styles.headerRankText}>{STRINGS.commando.dossierTitle}</Text>
            </View>

            {/* Top Action Icons: Edit, Sign Out, Close */}
            <View style={styles.headerActionsGroup}>
              {/* Edit Profile Icon Button */}
              <TouchableOpacity
                style={[
                  styles.headerIconBtn,
                  isEditingProfile && styles.headerIconBtnActive,
                ]}
                onPress={() => {
                  if (!isEditingProfile) {
                    setEditName(profileName);
                    setEditEmail(profileEmail);
                    setEditCitizenId(profileCitizenId);
                    setEditPosition(commandoPosition);
                    setIsEditingProfile(true);
                  } else {
                    setIsEditingProfile(false);
                  }
                }}
                activeOpacity={0.75}
                accessibilityLabel="Edit Profile"
              >
                <Ionicons
                  name={isEditingProfile ? 'close-outline' : 'create-outline'}
                  size={17}
                  color={isEditingProfile ? '#E5B842' : '#34D399'}
                />
              </TouchableOpacity>

              {/* Sign Out Icon Button */}
              <TouchableOpacity
                style={styles.headerSignOutBtn}
                onPress={() => {
                  onClose();
                  onLogout();
                }}
                activeOpacity={0.75}
                accessibilityLabel="Sign Out"
              >
                <Ionicons name="log-out-outline" size={17} color="#F87171" />
              </TouchableOpacity>

              {/* Close Modal Button */}
              <TouchableOpacity
                onPress={() => {
                  setIsEditingProfile(false);
                  onClose();
                }}
                style={styles.modalCloseCircle}
                accessibilityLabel="Close"
              >
                <Text style={styles.commandoCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.commandoScrollContent}>
            {/* Profile Avatar & Change Photo */}
            <TouchableOpacity
              style={styles.commandoAvatarWrapper}
              onPress={onPickPhoto}
              activeOpacity={0.8}
            >
              <Image
                source={typeof profileAvatar === 'string' ? { uri: profileAvatar } : profileAvatar}
                style={styles.commandoAvatarImage as ImageStyle}
              />
              <View style={styles.avatarCameraBadge}>
                <Text style={styles.avatarCameraIcon}>📷</Text>
              </View>
            </TouchableOpacity>

            {!isEditingProfile && (
              <TouchableOpacity
                style={styles.changePhotoSmallBtn}
                onPress={onPickPhoto}
                activeOpacity={0.8}
              >
                <Text style={styles.changePhotoSmallText}>📷 Edit Photo</Text>
              </TouchableOpacity>
            )}

            {!isEditingProfile ? (
              /* VIEW PROFILE MODE */
              <View style={styles.profileViewContainer}>
                <Text style={styles.commandoNameText}>{profileName}</Text>

                {/* Commando Position Badge */}
                <View style={styles.positionBadge}>
                  <Text style={styles.positionBadgeText}>⚔️ {commandoPosition}</Text>
                </View>

                {/* Tactical Status Badge */}
                <View style={styles.tacticalStatusBadge}>
                  <View style={styles.tacticalGreenPulse} />
                  <Text style={styles.tacticalStatusText}>{STRINGS.commando.activeStatus}</Text>
                </View>

                {/* Information Rows */}
                <View style={styles.commandoDataBox}>
                  <View style={styles.commandoDataRow}>
                    <Text style={styles.commandoDataLabel}>Email ID:</Text>
                    <Text style={styles.commandoDataVal}>{profileEmail}</Text>
                  </View>
                  <View style={styles.commandoDivider} />
                  <View style={styles.commandoDataRow}>
                    <Text style={styles.commandoDataLabel}>Citizen / Reg ID:</Text>
                    <Text style={[styles.commandoDataVal, { color: colors.commando.accentGold }]}>{profileCitizenId}</Text>
                  </View>
                  <View style={styles.commandoDivider} />
                  <View style={styles.commandoDataRow}>
                    <Text style={styles.commandoDataLabel}>Commando Unit:</Text>
                    <Text style={styles.commandoDataVal}>{STRINGS.commando.unit}</Text>
                  </View>
                </View>
              </View>
            ) : (
              /* EDIT PROFILE MODE */
              <View style={styles.profileEditContainer}>
                <Text style={styles.editFormTitle}>Edit Commando Credentials</Text>

                {/* Commando Avatar Quick-Pickers */}
                <Text style={styles.inputFieldLabel}>Choose Commando Avatar</Text>
                <View style={styles.avatarSelectionRow}>
                  {SAMPLES.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.avatarSampleThumb,
                        profileAvatar === s.source && styles.avatarSampleSelected,
                      ]}
                      onPress={() => setProfileAvatar(s.source)}
                      activeOpacity={0.8}
                    >
                      <Image source={s.source} style={styles.avatarThumbImg as ImageStyle} />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Upload from Gallery Button */}
                <TouchableOpacity
                  style={styles.changePhotoBtn}
                  onPress={onPickPhoto}
                  activeOpacity={0.8}
                >
                  <Text style={styles.changePhotoText}>📁 Upload from Device Gallery</Text>
                </TouchableOpacity>

                <Text style={styles.inputFieldLabel}>Officer Full Name</Text>
                <TextInput
                  style={styles.commandoTextInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter Name"
                  placeholderTextColor={colors.slate[500]}
                />

                {/* Elite Commando Positions Selector */}
                <Text style={styles.inputFieldLabel}>Position in Commando</Text>
                <View style={styles.commandoPillsRow}>
                  {COMMANDO_POSITIONS.map((pos) => {
                    const isSelected = editPosition === pos;
                    return (
                      <TouchableOpacity
                        key={pos}
                        style={[
                          styles.commandoPill,
                          isSelected && styles.commandoPillSelected,
                        ]}
                        onPress={() => setEditPosition(pos)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.commandoPillText,
                            isSelected && styles.commandoPillTextSelected,
                          ]}
                        >
                          {isSelected ? '✓ ' : ''}{pos}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TextInput
                  style={styles.commandoTextInput}
                  value={editPosition}
                  onChangeText={setEditPosition}
                  placeholder="e.g. Chief of the Commandos"
                  placeholderTextColor={colors.slate[500]}
                />

                <Text style={styles.inputFieldLabel}>Official Email Address</Text>
                <TextInput
                  style={styles.commandoTextInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Enter Email"
                  placeholderTextColor={colors.slate[500]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.inputFieldLabel}>Citizen / Military Service ID</Text>
                <TextInput
                  style={styles.commandoTextInput}
                  value={editCitizenId}
                  onChangeText={setEditCitizenId}
                  placeholder="Enter ID"
                  placeholderTextColor={colors.slate[500]}
                  autoCapitalize="characters"
                />

                {/* Save & Cancel Buttons */}
                <View style={styles.editActionRow}>
                  <TouchableOpacity
                    style={styles.cancelEditBtn}
                    onPress={() => setIsEditingProfile(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelEditText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveProfileBtn}
                    onPress={handleSaveProfile}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.saveProfileText}>💾 Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.commando.background ? 'rgba(5, 15, 8, 0.78)' : colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  commandoModalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '92%',
    backgroundColor: colors.commando.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.commando.border,
    padding: 20,
    elevation: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  commandoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F472D',
  },
  headerRankBadge: {
    backgroundColor: colors.commando.surfaceLighter,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.commando.accentGold,
  },
  headerRankText: {
    color: colors.commando.accentGold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.commando.surfaceLighter,
    borderWidth: 1,
    borderColor: colors.commando.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerIconBtnActive: {
    backgroundColor: '#1E3A28',
    borderColor: colors.commando.accentGold,
  },
  headerSignOutBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 30, 30, 0.25)',
    borderWidth: 1,
    borderColor: '#7A1C1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.commando.surfaceLighter,
    borderWidth: 1,
    borderColor: colors.commando.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commandoCloseText: {
    fontSize: 15,
    color: colors.commando.textSecondary,
    fontWeight: '700',
  },
  commandoScrollContent: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  commandoAvatarWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2.5,
    borderColor: colors.commando.accentGold,
    position: 'relative',
    marginBottom: 4,
  },
  commandoAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2D5A3C',
    borderWidth: 1.5,
    borderColor: colors.commando.accentGold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCameraIcon: {
    fontSize: 13,
  },
  changePhotoSmallBtn: {
    backgroundColor: colors.commando.surfaceLighter,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.commando.accentGold,
    marginTop: 4,
    marginBottom: 4,
  },
  changePhotoSmallText: {
    color: colors.commando.accentGold,
    fontSize: 11.5,
    fontWeight: '700',
  },
  profileViewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  commandoNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    marginTop: 8,
    textAlign: 'center',
  },
  positionBadge: {
    backgroundColor: '#1E432B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E6641',
    marginTop: 6,
    marginBottom: 10,
  },
  positionBadgeText: {
    color: colors.commando.accentCyan,
    fontSize: 12,
    fontWeight: '700',
  },
  tacticalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#102B19',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.commando.accentGreen,
    marginBottom: 14,
  },
  tacticalGreenPulse: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.commando.accentGreen,
    marginRight: 6,
  },
  tacticalStatusText: {
    color: colors.commando.accentGreen,
    fontSize: 11,
    fontWeight: '800',
  },
  commandoDataBox: {
    width: '100%',
    backgroundColor: '#0B1B10',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E432B',
    marginBottom: 14,
  },
  commandoDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  commandoDataLabel: {
    fontSize: 12,
    color: colors.commando.textMuted,
    fontWeight: '500',
  },
  commandoDataVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.white,
    maxWidth: '62%',
    textAlign: 'right',
  },
  commandoDivider: {
    height: 1,
    backgroundColor: '#193823',
    marginVertical: 3,
  },
  editProfileBtn: {
    width: '100%',
    height: 44,
    backgroundColor: '#275836',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3E8554',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  editProfileBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  commandoSignOutBtn: {
    width: '100%',
    height: 40,
    backgroundColor: colors.commando.danger,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commandoSignOutText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  profileEditContainer: {
    width: '100%',
    paddingTop: 4,
  },
  editFormTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.commando.accentGold,
    marginBottom: 12,
    textAlign: 'center',
  },
  avatarSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  avatarSampleThumb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#1F472D',
    overflow: 'hidden',
    backgroundColor: '#0A180E',
  },
  avatarSampleSelected: {
    borderColor: colors.commando.accentGold,
    borderWidth: 2.5,
  },
  avatarThumbImg: {
    width: '100%',
    height: '100%',
  },
  changePhotoBtn: {
    backgroundColor: colors.commando.surfaceLighter,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E6641',
    alignItems: 'center',
    marginBottom: 14,
  },
  changePhotoText: {
    color: colors.commando.accentGold,
    fontSize: 12.5,
    fontWeight: '700',
  },
  inputFieldLabel: {
    fontSize: 11,
    color: colors.commando.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  commandoPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  commandoPill: {
    backgroundColor: '#0A180E',
    borderWidth: 1,
    borderColor: '#244B30',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  commandoPillSelected: {
    backgroundColor: '#1E432B',
    borderColor: colors.commando.accentGold,
    borderWidth: 1.5,
  },
  commandoPillText: {
    color: colors.commando.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  commandoPillTextSelected: {
    color: colors.commando.accentGold,
    fontWeight: '800',
  },
  commandoTextInput: {
    backgroundColor: '#09170E',
    borderWidth: 1,
    borderColor: '#244B30',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.white,
    fontSize: 13,
    marginBottom: 8,
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelEditBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#1B3624',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelEditText: {
    color: colors.commando.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  saveProfileBtn: {
    flex: 1.2,
    height: 42,
    backgroundColor: colors.commando.success,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveProfileText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
});

export default ProfileScreen;

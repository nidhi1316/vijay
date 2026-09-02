import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import authService, { DashboardResponse } from '../../services/authService';
import { IMAGES } from '../../constants/assets';
import { colors } from '../../theme/colors';

interface DashboardScreenProps {
  route?: any;
  navigation?: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ route, navigation }) => {
  const userToken = route?.params?.user?.token || '';
  const initialUser = route?.params?.user;

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchDashboardData = async () => {
    try {
      if (userToken) {
        const data = await authService.getDashboard(userToken);
        setDashboardData(data);
      } else if (initialUser) {
        setDashboardData({
          success: true,
          user: {
            id: initialUser.id,
            name: initialUser.name,
            email: initialUser.email,
            citizenId: initialUser.citizenId || 'ID-100234',
            isOnline: true,
            lastLogin: initialUser.lastLogin || new Date().toISOString(),
          },
          stats: {
            totalUsers: 1,
            onlineUsersCount: 1,
            serverStatus: 'Active 🟢',
          },
          onlineUsers: [initialUser],
        });
      }
    } catch (err: any) {
      console.warn('Dashboard fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userToken]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      if (userToken) {
        await authService.logout(userToken);
      }
      Alert.alert('Signed Out', 'You have been safely logged out.');
      navigation?.replace('Login');
    } catch (error) {
      navigation?.replace('Login');
    } finally {
      setLoggingOut(false);
    }
  };

  const user = dashboardData?.user || initialUser;
  const stats = dashboardData?.stats;

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={IMAGES.demo.background}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Glassmorphic Dashboard Container */}
            <View style={styles.glassCard}>
              {/* Header */}
              <View style={styles.headerRow}>
                <Image
                  source={IMAGES.icons.logo}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <View style={styles.headerTitles}>
                  <Text style={styles.title}>Citizen Dashboard</Text>
                  <Text style={styles.subtitle}>National Portal Digital ID</Text>
                </View>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF6B00" />
                  <Text style={styles.loadingText}>Syncing backend data...</Text>
                </View>
              ) : (
                <>
                  {/* User Online Status Card */}
                  <View style={styles.profileSection}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
                    </View>
                    <View style={styles.profileDetails}>
                      <Text style={styles.userName}>{user?.name || 'Citizen User'}</Text>
                      <Text style={styles.userEmail}>{user?.email || 'N/A'}</Text>
                      <View style={styles.citizenIdPill}>
                        <Text style={styles.citizenIdText}>ID: {user?.citizenId || 'ID-994812'}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Online Badge Banner */}
                  <View style={styles.onlineBadgeCard}>
                    <View style={styles.greenPulseDot} />
                    <Text style={styles.onlineBadgeText}>STATUS: CURRENTLY ACTIVE & ONLINE</Text>
                  </View>

                  {/* Live Statistics Cards */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>{stats?.onlineUsersCount || 1}</Text>
                      <Text style={styles.statLabel}>Active Citizens</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>{stats?.totalUsers || 1}</Text>
                      <Text style={styles.statLabel}>Total Registered</Text>
                    </View>
                  </View>

                  {/* 2D to 3D Map Entry Point */}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation?.navigate('MainApp', { user })}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.actionButtonText}>🗺️ Open 2D / 3D Map Visualizer</Text>
                  </TouchableOpacity>

                  {/* Refresh Button */}
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={fetchDashboardData}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.refreshButtonText}>🔄 Sync Live Online Users</Text>
                  </TouchableOpacity>

                  {/* Logout Button */}
                  <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    disabled={loggingOut}
                    activeOpacity={0.85}
                  >
                    {loggingOut ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.logoutButtonText}>🔒 Sign Out Securely</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  glassCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
  },
  logoImage: {
    width: 48,
    height: 48,
    marginRight: 14,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  citizenIdPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  citizenIdText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  onlineBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  greenPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
    marginRight: 10,
  },
  onlineBadgeText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  actionButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  refreshButton: {
    width: '100%',
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  refreshButtonText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  logoutButton: {
    width: '100%',
    height: 44,
    backgroundColor: '#DC2626',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default DashboardScreen;

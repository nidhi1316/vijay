import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SquadLocationData } from '../../types/map';

interface SquadCoLocationHUDProps {
  squadData: SquadLocationData | null;
  onPatrolDummy: () => Promise<void>;
  loading?: boolean;
}

export const SquadCoLocationHUD: React.FC<SquadCoLocationHUDProps> = ({
  squadData,
  onPatrolDummy,
  loading = false,
}) => {
  const [isPatrolling, setIsPatrolling] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!squadData) return null;

  const { primaryUser, dummyUser, interUnitMetrics } = squadData;

  const handlePatrolPress = async () => {
    try {
      setIsPatrolling(true);
      await onPatrolDummy();
    } finally {
      setIsPatrolling(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.liveBeaconDot} />
          <Text style={styles.headerTitle}>SQUAD CO-LOCATION TELEMETRY</Text>
          <View style={styles.floorBadge}>
            <Text style={styles.floorBadgeText}>0.000M LVL</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.collapseToggle}
          onPress={() => setCollapsed(!collapsed)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={collapsed ? 'chevron-down' : 'chevron-up'}
            size={18}
            color="#A7F3D0"
          />
        </TouchableOpacity>
      </View>

      {!collapsed && (
        <View style={styles.bodyContent}>
          {/* Main Rangefinder Distance Banner */}
          <View style={styles.rangeBanner}>
            <View style={styles.rangeIconCol}>
              <MaterialCommunityIcons name="radar" size={24} color="#F59E0B" />
            </View>
            <View style={styles.rangeDataCol}>
              <Text style={styles.rangeLabel}>DISTANCE BETWEEN OPERATORS</Text>
              <Text style={styles.rangeValue}>
                {`${interUnitMetrics?.distanceMeters || 11.21} Meters`}
              </Text>
            </View>
            <View style={styles.bearingCol}>
              <Text style={styles.bearingLabel}>BEARING</Text>
              <Text style={styles.bearingValue}>
                {`${interUnitMetrics?.bearingCompass || 'SW'} ${interUnitMetrics?.bearingDegrees || 245}°`}
              </Text>
            </View>
          </View>

          {/* Two Operators Grid */}
          <View style={styles.operatorsRow}>
            {/* Operator 1: Current Active User (You) */}
            <View style={[styles.operatorCard, styles.primaryCard]}>
              <View style={styles.cardHeader}>
                <View style={[styles.userBadgeDot, { backgroundColor: primaryUser.color || '#10B981' }]} />
                <Text style={styles.operatorRole}>ACTIVE OPERATIVE</Text>
              </View>
              <Text style={styles.operatorName} numberOfLines={1}>
                {primaryUser.name}
              </Text>
              <Text style={styles.callsignTag}>{primaryUser.callsign}</Text>

              <View style={styles.locationBox}>
                <View style={styles.locRow}>
                  <Ionicons name="location-sharp" size={13} color="#10B981" />
                  <Text style={styles.roomName} numberOfLines={2}>
                    {primaryUser.location?.roomName || 'Reception & Waiting Hall'}
                  </Text>
                </View>
                <Text style={styles.coordsText}>
                  {`X: ${primaryUser.location?.x?.toFixed(1)}m | Z: ${primaryUser.location?.z?.toFixed(1)}m`}
                </Text>
              </View>
            </View>

            {/* Tactical Vector Arrow */}
            <View style={styles.vectorDivider}>
              <Ionicons name="swap-horizontal" size={22} color="#F59E0B" />
              <Text style={styles.vectorDistanceText}>
                {`${interUnitMetrics?.distanceMeters || 11.21}m`}
              </Text>
            </View>

            {/* Operator 2: Dummy Squad User (Commando Vikram) */}
            <View style={[styles.operatorCard, styles.dummyCard]}>
              <View style={styles.cardHeader}>
                <View style={[styles.userBadgeDot, { backgroundColor: dummyUser.color || '#38BDF8' }]} />
                <Text style={[styles.operatorRole, { color: '#7DD3FC' }]}>DUMMY USER</Text>
              </View>
              <Text style={styles.operatorName} numberOfLines={1}>
                {dummyUser.name}
              </Text>
              <Text style={[styles.callsignTag, styles.dummyCallsignTag]}>{dummyUser.callsign}</Text>

              <View style={styles.locationBox}>
                <View style={styles.locRow}>
                  <Ionicons name="location-sharp" size={13} color="#38BDF8" />
                  <Text style={styles.roomName} numberOfLines={2}>
                    {dummyUser.location?.roomName || 'Record Room & Cyber Server Vault'}
                  </Text>
                </View>
                <Text style={styles.coordsText}>
                  {`X: ${dummyUser.location?.x?.toFixed(1)}m | Z: ${dummyUser.location?.z?.toFixed(1)}m`}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Footer: Patrol Dummy User Button */}
          <View style={styles.footerRow}>
            <View style={styles.statusIndicatorRow}>
              <View style={styles.greenRingPulse} />
              <Text style={styles.statusFooterText}>
                {`Telemetry Synced • ${interUnitMetrics?.lineOfSight || 'CLEAR_CORRIDOR'}`}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.patrolButton, (isPatrolling || loading) && styles.patrolButtonDisabled]}
              onPress={handlePatrolPress}
              disabled={isPatrolling || loading}
              activeOpacity={0.8}
            >
              {isPatrolling || loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
              ) : (
                <Ionicons name="navigate-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.patrolButtonText}>
                {isPatrolling ? 'Relocating...' : 'Move / Patrol Vikram'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(8, 24, 15, 0.95)',
    borderWidth: 1.5,
    borderColor: '#1D452A',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D2718',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A4228',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBeaconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  headerTitle: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  floorBadge: {
    backgroundColor: '#133522',
    borderWidth: 1,
    borderColor: '#245939',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  floorBadgeText: {
    color: '#A7F3D0',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  collapseToggle: {
    padding: 2,
  },
  bodyContent: {
    padding: 12,
  },
  rangeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 40, 26, 0.9)',
    borderWidth: 1,
    borderColor: '#2D5E3C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  rangeIconCol: {
    marginRight: 12,
  },
  rangeDataCol: {
    flex: 1,
  },
  rangeLabel: {
    color: '#86EFAC',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  rangeValue: {
    color: '#F59E0B',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  bearingCol: {
    alignItems: 'flex-end',
  },
  bearingLabel: {
    color: '#9CA3AF',
    fontSize: 8.5,
    fontWeight: '700',
  },
  bearingValue: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  operatorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  operatorCard: {
    flex: 1,
    backgroundColor: 'rgba(12, 30, 20, 0.95)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  primaryCard: {
    borderColor: '#10B981',
  },
  dummyCard: {
    borderColor: '#38BDF8',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  operatorRole: {
    color: '#6EE7B7',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  operatorName: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  callsignTag: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  dummyCallsignTag: {
    color: '#38BDF8',
  },
  locationBox: {
    backgroundColor: '#06160D',
    borderRadius: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: '#183823',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  roomName: {
    color: '#E2E8F0',
    fontSize: 9.5,
    fontWeight: '700',
    marginLeft: 3,
    flex: 1,
  },
  coordsText: {
    color: '#6B8775',
    fontSize: 8.5,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  vectorDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  vectorDistanceText: {
    color: '#F59E0B',
    fontSize: 9.5,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#163822',
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greenRingPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusFooterText: {
    color: '#7D9987',
    fontSize: 9.5,
    fontWeight: '600',
  },
  patrolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  patrolButtonDisabled: {
    opacity: 0.6,
  },
  patrolButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});

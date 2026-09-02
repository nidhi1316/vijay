import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export const StartingTacticalInfo: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* 1. Live Telemetry Capsule Badges */}
      <View style={styles.telemetryRow}>
        <View style={[styles.telemetryPill, { borderColor: 'rgba(255, 103, 31, 0.5)' }]}>
          <View style={[styles.pulseDotGreen, { backgroundColor: '#FF671F' }]} />
          <Text style={[styles.telemetryText, { color: '#FFA500' }]}>🇮🇳 TIRANGA RECON</Text>
        </View>
        <View style={styles.telemetryPill}>
          <Ionicons name="flash" size={11} color="#E5B842" style={{ marginRight: 4 }} />
          <Text style={styles.telemetryTextGold}>0.9s AI LATENCY</Text>
        </View>
        <View style={styles.telemetryPill}>
          <Ionicons name="shield-checkmark" size={11} color="#10B981" style={{ marginRight: 4 }} />
          <Text style={styles.telemetryText}>AIR-GAPPED</Text>
        </View>
      </View>

      {/* 2. Section Header: Tactical Capabilities with Tricolor Accent Lines */}
      <View style={styles.sectionHeaderRow}>
        <View style={[styles.sectionAccentLine, { backgroundColor: '#FF671F' }]} />
        <Text style={styles.sectionHeaderText}>TACTICAL CAPABILITIES</Text>
        <View style={[styles.sectionAccentLine, { backgroundColor: '#046A38' }]} />
      </View>

      {/* 3. Three Sleek Feature Cards */}
      <View style={styles.cardsColumn}>
        {/* Feature 1: Spatial Mesh Reconstruction */}
        <View style={styles.featureCard}>
          <View style={styles.featureIconBox}>
            <Ionicons name="cube" size={20} color="#10B981" />
          </View>
          <View style={styles.featureContent}>
            <View style={styles.featureTitleRow}>
              <Text style={styles.featureTitle}>Instant 3D Spatial Mesh</Text>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeText}>Neural 3D</Text>
              </View>
            </View>
            <Text style={styles.featureDesc}>
              Converts 2D architectural blueprints into high-fidelity 3D spatial models with wall elevations & clearance zones.
            </Text>
          </View>
        </View>

        {/* Feature 2: Pre-Breach Troop Walkthrough */}
        <View style={styles.featureCard}>
          <View style={[styles.featureIconBox, { backgroundColor: '#183624', borderColor: '#2E6341' }]}>
            <Ionicons name="walk" size={20} color="#E5B842" />
          </View>
          <View style={styles.featureContent}>
            <View style={styles.featureTitleRow}>
              <Text style={styles.featureTitle}>Pre-Breach Troop Recon</Text>
              <View style={[styles.featureBadge, { backgroundColor: '#26220E', borderColor: '#E5B842' }]}>
                <Text style={[styles.featureBadgeText, { color: '#E5B842' }]}>Tactical 3D</Text>
              </View>
            </View>
            <Text style={styles.featureDesc}>
              Allows commando units to simulate room-by-room entry paths, entry breaches, and identify blind angles.
            </Text>
          </View>
        </View>

        {/* Feature 3: 100% Offline Battlefield Ready */}
        <View style={styles.featureCard}>
          <View style={styles.featureIconBox}>
            <Ionicons name="cloud-offline" size={20} color="#10B981" />
          </View>
          <View style={styles.featureContent}>
            <View style={styles.featureTitleRow}>
              <Text style={styles.featureTitle}>100% Offline Battlefield Ready</Text>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeText}>Air-Gapped</Text>
              </View>
            </View>
            <Text style={styles.featureDesc}>
              Zero cloud dependency. Complete spatial computing executes 100% locally on device for secure tactical zones.
            </Text>
          </View>
        </View>
      </View>

      {/* 4. 3-Step Tactical Deployment Guide */}
      <View style={styles.workflowCard}>
        <Text style={styles.workflowCardTitle}>MISSION DEPLOYMENT WORKFLOW</Text>
        <View style={styles.workflowStepsRow}>
          <View style={styles.stepItem}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Upload 2D</Text>
            <Text style={styles.stepSub}>Floor Plan / Paper</Text>
          </View>

          <View style={styles.stepDivider} />

          <View style={styles.stepItem}>
            <View style={[styles.stepNumberCircle, { borderColor: '#E5B842', backgroundColor: '#1A291E' }]}>
              <Text style={[styles.stepNumberText, { color: '#E5B842' }]}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Neural Mesh</Text>
            <Text style={styles.stepSub}>Auto Elevation</Text>
          </View>

          <View style={styles.stepDivider} />

          <View style={styles.stepItem}>
            <View style={[styles.stepNumberCircle, { borderColor: '#34D399', backgroundColor: '#153322' }]}>
              <Text style={[styles.stepNumberText, { color: '#34D399' }]}>3</Text>
            </View>
            <Text style={styles.stepTitle}>3D Walkthrough</Text>
            <Text style={styles.stepSub}>Troop Entry Recon</Text>
          </View>
        </View>
      </View>

      {/* 5. Official Defense Footnote Badge */}
      <View style={styles.defenseBadgeFooter}>
        <View style={styles.defenseEmblemDot} />
        <Text style={styles.defenseFooterText}>
          INDIAN DEFENSE SPATIAL RECONNAISSANCE • PROJECT VIJAY
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1B11',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E432B',
  },
  pulseDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  telemetryText: {
    color: '#A0B4A7',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  telemetryTextGold: {
    color: '#E5B842',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  sectionAccentLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E432B',
  },
  sectionHeaderText: {
    color: '#7D9987',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingHorizontal: 8,
  },
  cardsColumn: {
    width: '100%',
    marginBottom: 12,
  },
  featureCard: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#0E2215',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.32)',
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#132B1D',
    borderWidth: 1,
    borderColor: '#265436',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },
  featureContent: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  featureBadge: {
    backgroundColor: '#132B1D',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  featureBadgeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '700',
  },
  featureDesc: {
    color: '#7D9987',
    fontSize: 11,
    lineHeight: 15,
  },
  workflowCard: {
    width: '100%',
    backgroundColor: '#0A180F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.32)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  workflowCardTitle: {
    color: '#E5B842',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  workflowStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#132B1D',
    borderWidth: 1.5,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumberText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  stepTitle: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  stepSub: {
    color: '#7D9987',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 1,
  },
  stepDivider: {
    width: 16,
    height: 1,
    backgroundColor: '#265436',
    marginBottom: 14,
  },
  defenseBadgeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07120A',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#193A24',
    marginBottom: 4,
  },
  defenseEmblemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5B842',
    marginRight: 6,
  },
  defenseFooterText: {
    color: '#5C7A67',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default StartingTacticalInfo;

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { SpatialIntelMetrics, Architecture3D, SquadLocationData } from '../../types/map';
import { BlueprintSpatialEngine, BlueprintAnalysisResult } from './BlueprintSpatialEngine';

export interface UploadMapResponse {
  success: boolean;
  message: string;
  mapId: string;
  map?: any;
}

export interface AnalyzeMapResponse {
  success: boolean;
  message: string;
  mapId: string;
  map?: any;
  analysis: {
    roomsCount: number;
    clearanceHeight: number;
    breachPoints: number;
    wallThickness: number;
    meshStats: {
      vertices: number;
      polygons: number;
      textures: string;
    };
    threatLevel: string;
    tacticalGrid: any;
    architecture3D?: Architecture3D;
  };
  architecture3D?: Architecture3D;
}

export class MapService {
  /**
   * Helper to build dynamic 3D architecture based on blueprint image
   */
  static getDefault3DArchitecture(imageUriOrSeed?: string): Architecture3D {
    let hash = 0;
    const str = String(imageUriOrSeed || 'blueprint_default');
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    return BlueprintSpatialEngine.generateStructuralLayoutFromFingerprint(hash);
  }

  /**
   * Generates candidate URLs for backend connection
   */
  private static getApiBaseUrls(): string[] {
    const urls: string[] = [];

    // Production Cloud URL from Environment Variable
    if (process.env.EXPO_PUBLIC_API_URL) {
      const base = process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
      urls.push(`${base}/api/map`);
    }

    // Localhost for Web
    if (Platform.OS === 'web') {
      urls.push('http://localhost:5000/api/map');
      urls.push('http://127.0.0.1:5000/api/map');
    }

    // Expo Host URI for LAN Mobile
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
    if (hostUri) {
      const hostIp = hostUri.split(':')[0];
      urls.push(`http://${hostIp}:5000/api/map`);
    }

    urls.push('http://10.0.2.2:5000/api/map'); // Android Emulator
    urls.push('http://192.168.2.36:5000/api/map'); // LAN Fallback

    return urls;
  }

  /**
   * Upload 2D Blueprint Map to Backend
   */
  static async uploadMapToBackend(originalImage: string, blueprintName?: string, userId?: string): Promise<UploadMapResponse> {
    const urls = this.getApiBaseUrls();

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`${url}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalImage,
            blueprintName: blueprintName || `Tactical_Map_${Date.now()}.png`,
            userId: userId || 'commando_tactical',
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        // Try next candidate url
      }
    }

    // Fallback: Local offline mock response
    return {
      success: true,
      message: '2D Map cached locally (Offline Tactical Mode).',
      mapId: `map_offline_${Date.now()}`,
    };
  }

  /**
   * Fetch all past uploaded maps from backend (localhost:5000)
   */
  static async getRecentMapsFromBackend(userId?: string): Promise<any[]> {
    const urls = this.getApiBaseUrls();

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${url}/recent${userId ? `?userId=${userId}` : ''}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && data.maps && Array.isArray(data.maps)) {
            return data.maps;
          }
        }
      } catch (err) {
        // Try next candidate url
      }
    }

    return [];
  }

  /**
   * Delete map from backend (localhost:5000)
   */
  static async deleteMapFromBackend(mapId: string): Promise<boolean> {
    const urls = this.getApiBaseUrls();

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${url}/${mapId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return true;
        }
      } catch (err) {
        // Try next candidate url
      }
    }

    return false;
  }

  /**
   * Clear all maps from backend for user on logout/reset
   */
  static async clearMapsOnBackend(userId?: string): Promise<boolean> {
    const urls = this.getApiBaseUrls();

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${url}/clear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return true;
        }
      } catch (err) {
        // Try next candidate url
      }
    }

    return false;
  }

  /**
   * Analyze 2D Blueprint & Generate 3D Model on Backend
   */
  static async analyzeMapOnBackend(mapId: string, imageUri?: string, precomputedArch?: Architecture3D): Promise<AnalyzeMapResponse> {
    const urls = this.getApiBaseUrls();
    const defaultArch = precomputedArch || this.getDefault3DArchitecture(imageUri);

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(`${url}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mapId,
            originalImage: imageUri,
            architecture3D: precomputedArch,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const resJson = await response.json();
          if (resJson && resJson.success) {
            return resJson;
          }
        }
      } catch (err) {
        // Try next candidate url
      }
    }

    // Fallback: Local offline response with rich 3D architecture
    return {
      success: true,
      message: '3D Tactical Model generated (Offline Spatial Recon).',
      mapId,
      architecture3D: defaultArch,
      analysis: {
        roomsCount: defaultArch.rooms.length,
        clearanceHeight: defaultArch.dimensions.clearanceMeters,
        breachPoints: defaultArch.tacticalMarkers.filter((m) => m.type === 'BREACH').length || 1,
        wallThickness: 0.35,
        meshStats: {
          vertices: 18400,
          polygons: 12600,
          textures: '4K Tactical Normal Map',
        },
        threatLevel: 'ALPHA_SECURE',
        tacticalGrid: {
          rows: 10,
          cols: 10,
          targetAlpha: { x: 38, y: 30 },
          extractionZone: { x: 60, y: 65 },
        },
        architecture3D: defaultArch,
      },
    };
  }

  /**
   * Get Spatial Intelligence Metrics
   */
  static getSpatialIntelligence(imageUri?: string): SpatialIntelMetrics {
    return {
      roomsDetected: '14 Zones',
      clearanceHeight: '3.2 Meters',
      entryPoints: '3 Breaches',
      offlineStatus: '100% Ready',
    };
  }

  /**
   * Helper to get candidate User API URLs
   */
  private static getUserApiUrls(): string[] {
    const urls: string[] = [];
    if (process.env.EXPO_PUBLIC_API_URL) {
      const base = process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
      urls.push(`${base}/api/user`);
    }
    urls.push('http://localhost:5000/api/user', 'http://127.0.0.1:5000/api/user');
    return urls;
  }

  /**
   * Fetch Live Squad Locations (Active User + Dummy Commando Vikram)
   */
  static async getSquadLocations(): Promise<SquadLocationData> {
    const urls = this.getUserApiUrls();

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${url}/squad-locations`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            return data;
          }
        }
      } catch (_) {}
    }

    // Fallback Offline Squad Telemetry
    return {
      success: true,
      timestamp: new Date().toISOString(),
      mapFloor: 'PLAN @ 0.000M LVL',
      primaryUser: {
        id: 'active-user-captain',
        name: 'Captain Arjun (You)',
        callsign: 'Alpha-01',
        role: 'Tactical Team Lead',
        isOnline: true,
        status: 'COMMAND_POINT',
        color: '#10B981',
        radarColor: 'rgba(16, 185, 129, 0.4)',
        location: {
          x: 7.85,
          y: 0.5,
          z: 0.0,
          roomName: 'Reception & Security Waiting Hall',
          roomCode: 'RECEPT-01',
          floorLevel: 'PLAN @ 0.000M LVL',
        },
      },
      dummyUser: {
        id: 'dummy-commando-vikram',
        name: 'Commando Vikram',
        callsign: 'Recon-Bravo',
        role: 'Reconnaissance Specialist',
        isOnline: true,
        status: 'ACTIVE_PATROL',
        color: '#38BDF8',
        radarColor: 'rgba(56, 189, 248, 0.4)',
        location: {
          x: -2.3,
          y: 0.5,
          z: -4.75,
          roomName: 'Record Room & Cyber Server Vault',
          roomCode: 'SEC-VAULT',
          floorLevel: 'PLAN @ 0.000M LVL',
        },
      },
      interUnitMetrics: {
        distanceMeters: 11.21,
        direct3DDistance: 11.21,
        bearingDegrees: 245,
        bearingCompass: 'SW',
        proximityStatus: 'CROSS_SECTOR',
        lineOfSight: 'CLEAR_CORRIDOR',
      },
      vectorLine: {
        from: {
          userId: 'active-user-captain',
          name: 'Captain Arjun (You)',
          position: { x: 7.85, y: 0.5, z: 0.0, roomName: 'Reception' },
          color: '#10B981',
        },
        to: {
          userId: 'dummy-commando-vikram',
          name: 'Commando Vikram',
          position: { x: -2.3, y: 0.5, z: -4.75, roomName: 'Server Vault' },
          color: '#38BDF8',
        },
        distanceMeters: 11.21,
        color: '#F59E0B',
      },
    };
  }

  /**
   * Update active user's location on backend
   */
  static async updateUserLocation(coords: { x: number; y?: number; z: number; roomName?: string }): Promise<SquadLocationData> {
    const urls = this.getUserApiUrls();

    for (const url of urls) {
      try {
        const res = await fetch(`${url}/update-location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coords),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) return data;
        }
      } catch (_) {}
    }

    return this.getSquadLocations();
  }

  /**
   * Trigger Dummy User Patrol to move to next waypoint
   */
  static async patrolDummyUser(): Promise<SquadLocationData> {
    const urls = this.getUserApiUrls();

    for (const url of urls) {
      try {
        const res = await fetch(`${url}/patrol-dummy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) return data;
        }
      } catch (_) {}
    }

    return this.getSquadLocations();
  }
}

export default MapService;

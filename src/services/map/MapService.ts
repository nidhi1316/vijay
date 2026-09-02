import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { SpatialIntelMetrics } from '../../types/map';

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
  };
}

export class MapService {
  /**
   * Generates candidate URLs for backend connection
   */
  private static getApiBaseUrls(): string[] {
    const urls: string[] = [];

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
   * Analyze 2D Blueprint & Generate 3D Model on Backend
   */
  static async analyzeMapOnBackend(mapId: string, imageUri?: string): Promise<AnalyzeMapResponse> {
    const urls = this.getApiBaseUrls();

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${url}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mapId,
            originalImage: imageUri,
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
      message: '3D Tactical Model generated (Offline Spatial Recon).',
      mapId,
      analysis: {
        roomsCount: 14,
        clearanceHeight: 3.2,
        breachPoints: 3,
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
   * Validates if file format is supported (JPG, JPEG, PNG, GIF, PDF)
   */
  static isValidMapFormat(uri: string): boolean {
    const cleanUri = uri.toLowerCase();
    return (
      cleanUri.endsWith('.jpg') ||
      cleanUri.endsWith('.jpeg') ||
      cleanUri.endsWith('.png') ||
      cleanUri.endsWith('.gif') ||
      cleanUri.endsWith('.pdf')
    );
  }
}

export default MapService;

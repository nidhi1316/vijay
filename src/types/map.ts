/**
 * Map & Spatial Intelligence Types
 */

export interface SampleImageItem {
  id: string;
  name: string;
  source: any;
}

export type MapLayer = 'Tactical' | 'Elevation' | 'Heatmap';

export interface SpatialIntelMetrics {
  roomsDetected: string;
  clearanceHeight: string;
  entryPoints: string;
  offlineStatus: string;
}

export interface TargetMarker {
  id: string;
  title: string;
  top: string;
  left: string;
  type: 'alpha' | 'extraction' | 'hazard';
}

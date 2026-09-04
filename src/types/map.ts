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

export interface Room3D {
  id: string;
  name: string;
  code: string;
  type: string;
  bounds: {
    x: number;
    z: number;
    width: number;
    depth: number;
  };
  color: string;
  clearance: number;
  props?: string[];
  securityLevel?: string;
}

export interface Wall3D {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

export interface TacticalMarker3D {
  id: string;
  label: string;
  type: 'OBJECTIVE' | 'EXTRACTION' | 'BREACH' | 'HAZARD';
  position: {
    x: number;
    y: number;
    z: number;
  };
  color: string;
  pulseColor?: string;
  room?: string;
  description?: string;
}

export interface DoorWay3D {
  id: string;
  name: string;
  code: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  connectedRoom: string;
}

export interface DoorDistanceMeasurement {
  id: string;
  fromDoorId: string;
  fromName: string;
  toDoorId: string;
  toName: string;
  distanceMeters: number;
  fromPos: { x: number; y: number; z: number };
  toPos: { x: number; y: number; z: number };
  color?: string;
}

export interface Architecture3D {
  dimensions: {
    widthMeters: number;
    lengthMeters: number;
    clearanceMeters: number;
    totalAreaSqMeters: number;
  };
  rooms: Room3D[];
  walls: Wall3D[];
  tacticalMarkers: TacticalMarker3D[];
  doors?: DoorWay3D[];
  doorDistances?: DoorDistanceMeasurement[];
  objContent?: string;
}

export interface TacticalOperatorUnit {
  id: string;
  name: string;
  callsign: string;
  role: string;
  email?: string;
  avatar?: string;
  isOnline: boolean;
  status: string;
  color: string;
  radarColor?: string;
  location: {
    x: number;
    y: number;
    z: number;
    roomName: string;
    roomCode?: string;
    floorLevel?: string;
    heading?: number;
    lastUpdated?: string;
  };
  health?: string;
  ammo?: string;
}

export interface InterUnitMetrics {
  distanceMeters: number;
  direct3DDistance: number;
  bearingDegrees: number;
  bearingCompass: string;
  proximityStatus: string;
  lineOfSight: string;
}

export interface SquadLocationData {
  success: boolean;
  timestamp: string;
  mapFloor: string;
  primaryUser: TacticalOperatorUnit;
  dummyUser: TacticalOperatorUnit;
  interUnitMetrics: InterUnitMetrics;
  vectorLine?: {
    from: {
      userId: string;
      name: string;
      position: { x: number; y: number; z: number; roomName?: string };
      color: string;
    };
    to: {
      userId: string;
      name: string;
      position: { x: number; y: number; z: number; roomName?: string };
      color: string;
    };
    distanceMeters: number;
    color: string;
  };
}


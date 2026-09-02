/**
 * API Endpoints
 */

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    HEARTBEAT: '/auth/heartbeat',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ACTIVE_USERS: '/dashboard/active-users',
  },
  MAP: {
    PROCESS_2D: '/map/process-2d',
    CONVERT_3D: '/map/convert-3d',
  },
};

export default ENDPOINTS;

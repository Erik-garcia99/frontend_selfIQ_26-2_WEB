import { getLatestOccupancy } from '../services/telemetryService';
import { usePolledReading } from './usePolledReading';

// Igual que el móvil: el aforo se consulta cada 2 s.
export const useOccupancy = (accessToken, branchId, options = {}) =>
  usePolledReading({ fetcher: getLatestOccupancy, accessToken, branchId, pollMs: 2000, ...options });

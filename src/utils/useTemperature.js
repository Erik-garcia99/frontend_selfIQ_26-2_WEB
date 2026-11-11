import { getLatestTemperature } from '../services/telemetryService';
import { usePolledReading } from './usePolledReading';

// Misma consulta y frecuencia (15 s) que el móvil, pero la sucursal la decide
// el selector global del dashboard.
export const useTemperature = (accessToken, branchId, options = {}) =>
  usePolledReading({ fetcher: getLatestTemperature, accessToken, branchId, pollMs: 15000, ...options });

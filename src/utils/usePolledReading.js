import { useCallback, useEffect, useState } from 'react';
import { AppState } from './appState';

// Consulta una lectura (temperatura / aforo) cada `pollMs` mientras la pestaña
// esté visible. La sucursal viene de fuera (selector del topbar / DeviceContext).
// `waiting` = todavía se están cargando las sucursales.
export function usePolledReading({ fetcher, accessToken, branchId, pollMs, waiting = false }) {
  const [reading, setReading] = useState(null);
  const [requestState, setRequestState] = useState(null);
  const [now, setNow] = useState(Date.now);
  const [attempt, setAttempt] = useState(0);
  const refresh = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (!accessToken || !branchId) return undefined;
    let active = true;
    let foreground = AppState.currentState === 'active';
    let inFlight = false;
    let timer;
    async function load() {
      if (!active || !foreground || inFlight) return;
      clearTimeout(timer);
      inFlight = true;
      setRequestState((old) => ({ ...(old?.branchId === branchId ? old : {}), branchId, loading: true, error: old?.branchId === branchId ? old.error : '' }));
      try {
        const data = await fetcher(branchId, accessToken);
        if (active) { setReading(data); setRequestState({ branchId, loading: false, error: '' }); }
      } catch (error) {
        if (active) setRequestState({ branchId, loading: false, error: error.message, status: error.status ?? null });
      } finally {
        inFlight = false;
        if (active) setNow(Date.now());
        if (active && foreground) timer = setTimeout(load, pollMs);
      }
    }
    load();
    const subscription = AppState.addEventListener('change', (state) => {
      foreground = state === 'active';
      clearTimeout(timer);
      if (foreground) load();
    });
    return () => { active = false; clearTimeout(timer); subscription.remove(); };
  }, [fetcher, accessToken, branchId, pollMs, attempt]);

  const data = reading?.branch_id === branchId ? reading : null;
  const state = requestState?.branchId === branchId ? requestState : null;
  const stale = Boolean(data?.measured_at && (data.status === 'stale'
    || now - new Date(data.measured_at).getTime() >= data.stale_after_seconds * 1000));
  return {
    branchId, data, stale, refresh,
    loading: waiting || Boolean(branchId && (!state || state.loading)),
    error: state?.error || '', errorStatus: state?.status ?? null,
  };
}

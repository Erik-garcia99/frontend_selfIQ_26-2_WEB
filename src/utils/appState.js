// Sustituto web de AppState de React Native: "active" = pestaña visible.
// Los hooks de polling (useTemperature / useOccupancy) lo usan para pausar
// las consultas cuando la pestaña está en segundo plano.
export const AppState = {
  get currentState() { return document.visibilityState === 'visible' ? 'active' : 'background'; },
  addEventListener(_event, handler) {
    const listener = () => handler(AppState.currentState);
    document.addEventListener('visibilitychange', listener);
    return { remove: () => document.removeEventListener('visibilitychange', listener) };
  },
};

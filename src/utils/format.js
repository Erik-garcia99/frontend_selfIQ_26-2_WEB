const valid = (iso) => { const date = iso ? new Date(iso) : null; return date && !Number.isNaN(date.getTime()) ? date : null; };
export const formatTime = (iso) => valid(iso)?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) || '';
export const formatDateTime = (iso) => valid(iso)?.toLocaleString('es-MX') || '';

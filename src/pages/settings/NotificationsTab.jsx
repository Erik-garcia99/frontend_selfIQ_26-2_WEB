import { useEffect, useState } from 'react';
import { Button, Notice } from '../../components';
import { Switch } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { getNotificationPreferences, saveNotificationPreferences } from '../../services/settingsService';
import styles from './NotificationsTab.module.css';

const DEFAULTS = { lowStock: true, capacity: true, temperature: true, offline: true, sound: true };

export default function NotificationsTab() {
  const { accessToken } = useAuth();
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setPrefs(await getNotificationPreferences(accessToken)); }
    catch (e) { setError(e.message || 'Error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [accessToken]);

  const save = async () => {
    setSaving(true); setMessage('');
    try { await saveNotificationPreferences(prefs, accessToken); setMessage('Guardado.'); }
    catch (e) { setMessage(e.message || 'Error'); }
    finally { setSaving(false); }
  };

  if (loading) return <p>Cargando…</p>;
  if (error) return <><Notice tone="danger">{error}</Notice><Button onClick={load}>Reintentar</Button></>;

  return <div className={styles.wrap}>
    <Switch checked={prefs.lowStock} onChange={(v) => setPrefs({ ...prefs, lowStock: v })} label="Stock bajo" />
    <Switch checked={prefs.capacity} onChange={(v) => setPrefs({ ...prefs, capacity: v })} label="Aforo" />
    <Switch checked={prefs.temperature} onChange={(v) => setPrefs({ ...prefs, temperature: v })} label="Temperatura" />
    <Switch checked={prefs.offline} onChange={(v) => setPrefs({ ...prefs, offline: v })} label="Sin conexión" />
    <Switch checked={prefs.sound} onChange={(v) => setPrefs({ ...prefs, sound: v })} label="Sonido" />
    {message && <Notice tone={message === 'Guardado.' ? 'success' : 'danger'}>{message}</Notice>}
    <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
  </div>;
}
import { useEffect, useState } from 'react';
import { Button, Card, EmptyState, Notice, Switch, useToast } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { getNotificationPreferences, saveNotificationPreferences } from '../../services/settingsService';
import { useAsyncAction } from '../../utils/useAsyncAction';
import styles from './Settings.module.css';

const OPTIONS = [
  ['lowStock', 'Stock bajo', 'Cuando un producto llegue a un nivel bajo.'],
  ['capacity', 'Aforo máximo', 'Cuando la sucursal alcance su capacidad.'],
  ['temperature', 'Temperatura fuera de rango', 'Cuando haga demasiado frío o calor.'],
  ['offline', 'Dispositivos sin conexión', 'Cuando un gateway o nodo deje de reportar.'],
  ['sound', 'Sonido', 'Reproducir un sonido cuando llegue un aviso.'],
];

export default function NotificationsTab() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const task = useAsyncAction();
  const [saved, setSaved] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError('');
    getNotificationPreferences(accessToken)
      .then((data) => { if (active) { setSaved(data); setPrefs(data); } })
      .catch((error) => { if (active) setLoadError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [accessToken, attempt]);

  const dirty = saved && prefs && OPTIONS.some(([key]) => prefs[key] !== saved[key]);
  const save = async () => {
    const result = await task.run(() => saveNotificationPreferences(prefs, accessToken));
    if (result) { setSaved(result); setPrefs(result); toast.success('Preferencias guardadas.'); }
  };

  if (loading) return <Card title="Notificaciones"><p className={styles.intro}>Cargando preferencias…</p></Card>;
  if (loadError) return <Card title="Notificaciones">
    <EmptyState title="No se pudieron cargar tus preferencias" action={<Button variant="secondary" onClick={() => setAttempt((v) => v + 1)}>Reintentar</Button>}>{loadError}</EmptyState>
  </Card>;

  return <Card title="Notificaciones">
    <p className={styles.intro}>Elige qué avisos quieres recibir.</p>
    <div>
      {OPTIONS.map(([key, label, description]) => <Switch key={key} label={label} description={description}
        checked={Boolean(prefs[key])} disabled={task.loading} onChange={(value) => setPrefs((old) => ({ ...old, [key]: value }))} />)}
    </div>
    <Notice>{task.error}</Notice>
    <div className={styles.actions}>
      <Button variant="secondary" disabled={!dirty || task.loading} onClick={() => setPrefs(saved)}>Descartar</Button>
      <Button disabled={!dirty} loading={task.loading} loadingLabel="Guardando…" onClick={save}>Guardar cambios</Button>
    </div>
  </Card>;
}

import { useEffect, useState } from 'react';
import { Button, Field, Notice } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/settingsService';
import styles from './ProfileTab.module.css';

export default function ProfileTab() {
  const { user, accessToken, refreshUser } = useAuth();
  const [draft, setDraft] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { setDraft({ first_name: user?.first_name || '', last_name: user?.last_name || '' }); }, [user]);

  const changed = draft.first_name !== (user?.first_name || '') || draft.last_name !== (user?.last_name || '');
  const save = async () => {
    setSaving(true); setMessage('');
    try {
      await updateProfile({ first_name: draft.first_name, last_name: draft.last_name }, accessToken);
      await refreshUser();
      setMessage('Guardado.');
    } catch (e) { setMessage(e.message || 'Error'); }
    finally { setSaving(false); }
  };

  return <div className={styles.wrap}>
    <Field label="Correo" value={user?.email || ''} readOnly />
    <Field label="Rol" value={user?.role || ''} readOnly />
    <Field label="Nombres" value={draft.first_name} onChange={(e) => setDraft({ ...draft, first_name: e.target.value })} />
    <Field label="Apellidos" value={draft.last_name} onChange={(e) => setDraft({ ...draft, last_name: e.target.value })} />
    {message && <Notice tone={message === 'Guardado.' ? 'success' : 'danger'}>{message}</Notice>}
    <div className={styles.row}>
      <Button onClick={save} disabled={!changed || saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
      <Button variant="secondary" onClick={() => setDraft({ first_name: user?.first_name || '', last_name: user?.last_name || '' })} disabled={!changed}>Descartar</Button>
    </div>
  </div>;
}
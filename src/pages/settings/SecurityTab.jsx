import { useState } from 'react';
import { Button, Field, Notice } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/settingsService';
import styles from './SecurityTab.module.css';

export default function SecurityTab() {
  const { accessToken } = useAuth();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const valid = form.current && form.next.length >= 8 && form.next !== form.current && form.next === form.confirm;

  const submit = async () => {
    setSaving(true); setMessage('');
    try {
      await changePassword(form.current, form.next, accessToken);
      setForm({ current: '', next: '', confirm: '' });
      setMessage('Contraseña actualizada.');
    } catch (e) { setMessage(e.message || 'Error'); }
    finally { setSaving(false); }
  };

  return <div className={styles.wrap}>
    <Field label="Contraseña actual" type="password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
    <Field label="Nueva contraseña" type="password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
    <Field label="Confirmar" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
    {message && <Notice tone={message === 'Contraseña actualizada.' ? 'success' : 'danger'}>{message}</Notice>}
    <Button onClick={submit} disabled={!valid || saving}>{saving ? 'Guardando…' : 'Cambiar contraseña'}</Button>
  </div>;
}
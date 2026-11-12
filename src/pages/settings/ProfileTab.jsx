import { useState } from 'react';
import { Badge, Button, Card, Field, Notice, useToast } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/settingsService';
import { useAsyncAction } from '../../utils/useAsyncAction';
import { roleLabel } from '../../utils/validation';
import styles from './Settings.module.css';

export default function ProfileTab() {
  const { user, accessToken, refreshUser } = useAuth();
  const toast = useToast();
  const task = useAsyncAction();
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '' });
  const bind = (key) => ({ value: form[key], disabled: task.loading, onChange: (e) => setForm((old) => ({ ...old, [key]: e.target.value })) });
  const dirty = form.first_name.trim() !== (user?.first_name || '') || form.last_name.trim() !== (user?.last_name || '');

  const submit = async (event) => {
    event.preventDefault();
    const first_name = form.first_name.trim();
    const last_name = form.last_name.trim();
    if (!first_name || !last_name) return task.setError('Escribe tus nombres y apellidos.');
    const ok = await task.run(async () => { await updateProfile({ first_name, last_name }, accessToken); await refreshUser(); return true; });
    if (ok) toast.success('Perfil actualizado.');
  };

  return <Card title="Perfil">
    <div className={styles.meta}><Badge tone="info">{roleLabel(user)}</Badge><span>{user?.email}</span></div>
    <form onSubmit={submit} noValidate>
      <div className={styles.grid2}>
        <Field label="Nombres" autoComplete="given-name" {...bind('first_name')} />
        <Field label="Apellidos" autoComplete="family-name" {...bind('last_name')} />
      </div>
      <Field label="Correo" type="email" value={user?.email || ''} disabled readOnly hint="El correo no se puede cambiar." />
      <Notice>{task.error}</Notice>
      <div className={styles.actions}>
        <Button variant="secondary" disabled={!dirty || task.loading} onClick={() => { setForm({ first_name: user?.first_name || '', last_name: user?.last_name || '' }); task.setError(''); }}>Descartar</Button>
        <Button type="submit" disabled={!dirty} loading={task.loading} loadingLabel="Guardando…">Guardar cambios</Button>
      </div>
    </form>
  </Card>;
}

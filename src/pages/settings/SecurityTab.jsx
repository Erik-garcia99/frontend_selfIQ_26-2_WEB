import { useState } from 'react';
import { Button, Card, Field, Notice, useToast } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/settingsService';
import { useAsyncAction } from '../../utils/useAsyncAction';
import styles from './Settings.module.css';

const EMPTY = { current: '', next: '', confirmation: '' };

export default function SecurityTab() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const task = useAsyncAction();
  const [form, setForm] = useState(EMPTY);
  const bind = (key) => ({ value: form[key], disabled: task.loading, onChange: (e) => setForm((old) => ({ ...old, [key]: e.target.value })) });

  const submit = async (event) => {
    event.preventDefault();
    if (!form.current) return task.setError('Escribe tu contraseña actual.');
    if (form.next.length < 8) return task.setError('La contraseña nueva debe tener al menos 8 caracteres.');
    if (form.next === form.current) return task.setError('La contraseña nueva debe ser distinta de la actual.');
    if (form.next !== form.confirmation) return task.setError('Las contraseñas nuevas no coinciden.');
    const ok = await task.run(async () => { await changePassword(form.current, form.next, accessToken); return true; });
    if (ok) { setForm(EMPTY); toast.success('Contraseña actualizada.'); }
  };

  return <Card title="Seguridad">
    <p className={styles.intro}>Cambia la contraseña con la que inicias sesión.</p>
    <form onSubmit={submit} noValidate>
      <Field label="Contraseña actual" type="password" autoComplete="current-password" {...bind('current')} />
      <div className={styles.grid2}>
        <Field label="Contraseña nueva" type="password" autoComplete="new-password" hint="Mínimo 8 caracteres." {...bind('next')} />
        <Field label="Confirmar contraseña nueva" type="password" autoComplete="new-password" {...bind('confirmation')} />
      </div>
      <Notice>{task.error}</Notice>
      <div className={styles.actions}>
        <Button type="submit" loading={task.loading} loadingLabel="Guardando…">Cambiar contraseña</Button>
      </div>
    </form>
  </Card>;
}

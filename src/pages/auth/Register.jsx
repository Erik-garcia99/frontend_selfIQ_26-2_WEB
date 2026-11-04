import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Field, FeedbackDialog, Notice } from '../../components';
import { register } from '../../services/authService';
import { useAsyncAction } from '../../utils/useAsyncAction';
import { describeError } from '../../utils/errorMessages';
import { isEmail } from '../../utils/validation';
import { usePageTitle } from '../../utils/usePageTitle';
import styles from './auth.module.css';

const EMPTY = { first_name: '', last_name: '', email: '', password: '', confirmation: '', registration_token: '' };

export default function Register() {
  usePageTitle('Crear cuenta');
  const [form, setForm] = useState(EMPTY);
  const [createdId, setCreatedId] = useState('');
  const [feedback, setFeedback] = useState(null);
  const task = useAsyncAction();
  const bind = (key) => ({ value: form[key], onChange: (e) => setForm((old) => ({ ...old, [key]: e.target.value })), disabled: task.loading });
  const closeFeedback = () => setFeedback(null);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !isEmail(form.email) || !form.registration_token.trim()) return task.setError('Completa nombres, apellidos, correo y token de sucursal.');
    if (form.password.length < 8) return task.setError('La contraseña debe tener al menos 8 caracteres.');
    if (form.password !== form.confirmation) return task.setError('Las contraseñas no coinciden.');
    const result = await task.run(() => register({ first_name: form.first_name.trim(), last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(), password: form.password, registration_token: form.registration_token.trim() }));
    if (!result) {
      const info = describeError(task.getFailure());
      task.setError('');
      return setFeedback({ variant: 'error', ...info, actionLabel: 'Corregir datos' });
    }
    setCreatedId(result.user_id);
    setForm(EMPTY);
    setFeedback({ variant: 'success', title: 'Cuenta creada', message: 'Tu registro quedó guardado y está pendiente de aprobación.',
      hint: 'Un administrador debe aprobar la cuenta antes de que puedas iniciar sesión.', actionLabel: 'Entendido' });
  };

  return <div className={styles.card}>
    <h1 className={styles.title}>Creación de usuario</h1>
    <p className={styles.subtitle}>Registra tu cuenta con el token de tu sucursal. Un administrador la aprobará después.</p>
    <form onSubmit={submit} noValidate>
      <div className={styles.grid2}>
        <Field label="Nombres" placeholder="Marcos" autoComplete="given-name" {...bind('first_name')} />
        <Field label="Apellidos" placeholder="Solís" autoComplete="family-name" {...bind('last_name')} />
      </div>
      <Field label="Correo" type="email" placeholder="tu@correo.com" autoComplete="email" {...bind('email')} />
      <div className={styles.grid2}>
        <Field label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" {...bind('password')} />
        <Field label="Confirmar contraseña" type="password" placeholder="Repite la contraseña" autoComplete="new-password" {...bind('confirmation')} />
      </div>
      <Field label="Token de la sucursal" placeholder="Token que te dio tu administrador" autoComplete="off" spellCheck={false} {...bind('registration_token')} />
      <Notice>{task.error}</Notice>
      {createdId && <p className={styles.note}>Folio para aprobación: <strong>{createdId}</strong></p>}
      <Button type="submit" full loading={task.loading}>Registrar usuario</Button>
    </form>
    <p className={styles.switch}>¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
    <FeedbackDialog open={Boolean(feedback)} {...feedback} onClose={closeFeedback} />
  </div>;
}

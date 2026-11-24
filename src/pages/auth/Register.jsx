import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Field, FeedbackDialog, Notice } from '../../components';
import { registerCustomer } from '../../services/authService';
import { useAsyncAction } from '../../utils/useAsyncAction';
import { describeError } from '../../utils/errorMessages';
import { isEmail } from '../../utils/validation';
import { usePageTitle } from '../../utils/usePageTitle';
import styles from './auth.module.css';

// El alta de empleados la hace el encargado desde Personas (F-02). El registro
// público queda solo para clientes y usa el código de la organización.
const EMPTY = { first_name: '', last_name: '', email: '', password: '', confirmation: '', organization_code: '' };

export default function Register() {
  usePageTitle('Crear cuenta de cliente');
  const [form, setForm] = useState(EMPTY);
  const [feedback, setFeedback] = useState(null);
  const task = useAsyncAction();
  const navigate = useNavigate();
  const bind = (key) => ({ value: form[key], onChange: (e) => setForm((old) => ({ ...old, [key]: e.target.value })), disabled: task.loading });
  const closeFeedback = () => {
    const wasSuccess = feedback?.variant === 'success';
    setFeedback(null);
    if (wasSuccess) navigate('/login');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !isEmail(form.email)) {
      return task.setError('Completa nombres, apellidos y un correo válido.');
    }
    if (!form.organization_code.trim()) {
      return task.setError('Completa el código de organización que te dio la tienda.');
    }
    if (form.password.length < 8) return task.setError('La contraseña debe tener al menos 8 caracteres.');
    if (form.password !== form.confirmation) return task.setError('Las contraseñas no coinciden.');
    const result = await task.run(() => registerCustomer({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      organization_code: form.organization_code.trim(),
    }));
    if (!result) {
      const info = describeError(task.getFailure());
      task.setError('');
      return setFeedback({ variant: 'error', ...info, actionLabel: 'Corregir datos' });
    }
    setForm(EMPTY);
    setFeedback({ variant: 'success', title: 'Cuenta creada', message: 'Tu cuenta de cliente ya está activa.',
      hint: 'Inicia sesión con tu correo y contraseña para empezar.', actionLabel: 'Iniciar sesión' });
  };

  return <div className={styles.card}>
    <h1 className={styles.title}>Crear cuenta de cliente</h1>
    <p className={styles.subtitle}>Regístrate con el código que te dio la tienda para consultar disponibilidad y guías.</p>
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
      <Field label="Código de la organización" placeholder="Código que te dio la tienda" autoComplete="off" {...bind('organization_code')} />
      <Notice>{task.error}</Notice>
      <Button type="submit" full loading={task.loading}>Crear cuenta de cliente</Button>
    </form>
    <p className={styles.switch}>¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
    <FeedbackDialog open={Boolean(feedback)} {...feedback} onClose={closeFeedback} />
  </div>;
}

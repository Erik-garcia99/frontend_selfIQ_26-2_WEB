import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Field, Notice } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useAsyncAction } from '../../utils/useAsyncAction';
import { isEmail } from '../../utils/validation';
import { usePageTitle } from '../../utils/usePageTitle';
import styles from './auth.module.css';

export default function Login() {
  usePageTitle('Iniciar sesión');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const task = useAsyncAction();

  const submit = (event) => {
    event.preventDefault();
    if (!isEmail(email) || !password) return task.setError('Escribe tu correo y contraseña.');
    task.run(() => signIn(email.trim().toLowerCase(), password));
  };

  return <div className={styles.card}>
    <h1 className={styles.title}>Bienvenido</h1>
    <p className={styles.subtitle}>Inicia sesión para entrar a tu panel.</p>
    <form onSubmit={submit} noValidate>
      <Field label="Correo electrónico" type="email" placeholder="example@example.com" autoComplete="email" autoFocus
        value={email} onChange={(e) => setEmail(e.target.value)} disabled={task.loading} />
      <Field label="Contraseña" type="password" placeholder="••••••••" autoComplete="current-password"
        value={password} onChange={(e) => setPassword(e.target.value)} disabled={task.loading} />
      <Link to="/recuperar" className={styles.forgot}>¿Olvidaste tu contraseña?</Link>
      <Notice>{task.error}</Notice>
      <Button type="submit" full loading={task.loading}>Iniciar sesión</Button>
    </form>
    <p className={styles.switch}>¿Aún no tienes cuenta? <Link to="/registro">Registrarse</Link></p>
  </div>;
}

import { useNavigate } from 'react-router-dom';
import { Button } from '../../components';
import { usePageTitle } from '../../utils/usePageTitle';
import styles from './auth.module.css';

// El backend aún no tiene endpoint de recuperación por correo (igual que en el móvil).
export default function Recovery() {
  usePageTitle('Recuperar acceso');
  const navigate = useNavigate();
  return <div className={styles.card}>
    <h1 className={styles.title}>Recupera tu acceso</h1>
    <p className={styles.subtitle}>Contacta al administrador de tu sucursal para recuperar el acceso.</p>
    <p className={styles.text}>El envío de enlaces de recuperación todavía no está disponible. Tu administrador puede restablecer tu contraseña desde el panel de administración.</p>
    <Button full onClick={() => navigate('/login')}>Volver a iniciar sesión</Button>
  </div>;
}

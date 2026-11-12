import { Link } from 'react-router-dom';
import { Icon, PageHeader } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { canApprove, canCreateBranch } from '../../utils/validation';
import styles from './admin.module.css';

export default function Staff() {
  const { user } = useAuth();
  const items = [
    canApprove(user) && { to: '/personal/aprobar', icon: 'users', title: 'Aprobar usuarios', text: 'Revisa las cuentas pendientes y apruébalas o recházalas.' },
    { to: '/personal/tokens', icon: 'key', title: 'Tokens de acceso', text: 'Genera o reemplaza los tokens para registrar personal.' },
    canCreateBranch(user) && { to: '/sucursales/nueva', icon: 'plus', title: 'Crear sucursal', text: 'Da de alta una nueva sucursal de tu negocio.' },
  ].filter(Boolean);
  return <>
    <PageHeader title="Personal" subtitle="Accesos, aprobaciones y sucursales." />
    <div className={styles.hub}>
      {items.map((item) => <Link key={item.to} to={item.to} className={styles.hubCard}>
        <div className={styles.hubIcon}><Icon name={item.icon} size={22} /></div>
        <span className={styles.hubTitle}>{item.title}</span>
        <span className={styles.hubText}>{item.text}</span>
      </Link>)}
    </div>
  </>;
}

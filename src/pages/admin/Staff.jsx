import { Link } from 'react-router-dom';
import { Card, Icon, PageHeader } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { canApprove, canCreateBranch, canManage } from '../../utils/validation';
import styles from './admin.module.css';

export default function Staff() {
  const { user } = useAuth();
  return <>
    <PageHeader title="Personal" subtitle="Administración de accesos" />
    <div className={styles.grid}>
      {canApprove(user) && <Link to="/personal/aprobar" className={styles.card}><Icon name="users" /><span>Aprobar usuarios</span></Link>}
      {canManage(user) && <Link to="/personal/tokens" className={styles.card}><Icon name="key" /><span>Tokens de acceso</span></Link>}
      {canCreateBranch(user) && <Link to="/sucursales/nueva" className={styles.card}><Icon name="plus" /><span>Crear sucursal</span></Link>}
    </div>
  </>;
}
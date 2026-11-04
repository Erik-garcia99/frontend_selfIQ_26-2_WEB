import { Outlet } from 'react-router-dom';
import { Badge, Icon, Logo } from '../components';
import { API_BASE_URL } from '../services/http';
import { useApiStatus } from '../utils/useApiStatus';
import styles from './AuthLayout.module.css';

const FEATURES = [
  ['users', 'Aforo y temperatura de tu sucursal'],
  ['devices', 'Gateways, cámaras y luces en un solo lugar'],
  ['settings', 'Accesos y personal bajo control'],
];

function ApiStatus() {
  const online = useApiStatus();
  if (online === false) return <div className={styles.status}>
    <Badge tone="danger" dot>Sin conexión con el servidor</Badge>
    <p style={{ marginTop: 8 }}>No se pudo conectar con {API_BASE_URL || '(VITE_API_URL sin configurar)'}. Revisa el archivo .env y que el backend esté encendido.</p>
  </div>;
  return <div className={styles.status}><Badge tone={online ? 'success' : 'neutral'} dot>{online ? 'Servidor conectado' : 'Comprobando conexión…'}</Badge></div>;
}

export default function AuthLayout() {
  return <div className={styles.page}>
    <aside className={styles.brand}>
      <Logo size={40} />
      <div>
        <h2 className={styles.headline} style={{ color: 'inherit', fontSize: 38 }}>Gestión inteligente para tu operación</h2>
        <p className={styles.lead}>Monitorea tu sucursal y administra tus equipos desde cualquier computadora.</p>
        <ul className={styles.list}>{FEATURES.map(([icon, text]) => <li key={text}><span><Icon name={icon} size={16} /></span>{text}</li>)}</ul>
      </div>
      <p className={styles.foot}>© {new Date().getFullYear()} SelfIQ</p>
    </aside>
    <main className={styles.main}>
      <div className={styles.box}>
        <div className={styles.mobileLogo}><Logo size={36} /></div>
        <Outlet />
      </div>
      <ApiStatus />
    </main>
  </div>;
}

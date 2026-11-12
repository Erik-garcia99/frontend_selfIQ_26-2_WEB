import { NavLink, Outlet } from 'react-router-dom';
import { Icon, PageHeader } from '../../components';
import styles from './Settings.module.css';

const TABS = [
  { to: 'perfil', label: 'Perfil', icon: 'user' },
  { to: 'notificaciones', label: 'Notificaciones', icon: 'bell' },
  { to: 'seguridad', label: 'Seguridad', icon: 'lock' },
];

export default function Settings() {
  return <>
    <PageHeader title="Ajustes" subtitle="Tu cuenta, avisos y contraseña." />
    <div className={styles.layout}>
      <nav className={styles.tabs} aria-label="Secciones de ajustes">
        {TABS.map((tab) => <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>
          <Icon name={tab.icon} size={18} />{tab.label}</NavLink>)}
      </nav>
      <div className={styles.panel}><Outlet /></div>
    </div>
  </>;
}

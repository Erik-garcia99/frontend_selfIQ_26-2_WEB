import { NavLink, Outlet } from 'react-router-dom';
import { PageHeader } from '../../components';
import styles from './Settings.module.css';

const TABS = [
  { to: 'perfil', label: 'Perfil' },
  { to: 'notificaciones', label: 'Notificaciones' },
  { to: 'seguridad', label: 'Seguridad' },
];

export default function Settings() {
  return <>
    <PageHeader title="Ajustes" subtitle="Perfil, notificaciones y seguridad" />
    <nav className={styles.tabs}>
      {TABS.map((t) => <NavLink key={t.to} to={t.to} className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>{t.label}</NavLink>)}
    </nav>
    <div className={styles.content}><Outlet /></div>
  </>;
}
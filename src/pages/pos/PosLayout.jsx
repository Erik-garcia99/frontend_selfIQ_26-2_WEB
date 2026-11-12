import { NavLink, Outlet } from 'react-router-dom';
import { PageHeader } from '../../components';
import styles from './PosLayout.module.css';

const TABS = [
  { to: '.', label: 'Caja', end: true },
  { to: 'inventario', label: 'Inventario' },
  { to: 'historial', label: 'Historial' },
];

export default function PosLayout() {
  return <>
    <PageHeader title="POS" subtitle="Punto de venta" />
    <nav className={styles.tabs}>
      {TABS.map((t) => <NavLink key={t.label} to={t.to} end={t.end}
        className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>{t.label}</NavLink>)}
    </nav>
    <Outlet />
  </>;
}
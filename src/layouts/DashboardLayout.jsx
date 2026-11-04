import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Button, Icon, Logo, Modal } from '../components';
import { useAuth } from '../context/AuthContext';
import { useDevices } from '../context/DeviceContext';
import { APP_VERSION } from '../config/appInfo';
import { canManage, roleLabel } from '../utils/validation';
import styles from './DashboardLayout.module.css';

const ITEMS = [
  { to: '/inicio', label: 'Inicio', icon: 'home' },
  { to: '/alertas', label: 'Alertas', icon: 'bell' },
  { to: '/dispositivos', label: 'Dispositivos', icon: 'devices', allow: canManage },
  { to: '/personal', label: 'Personal', icon: 'users', allow: canManage },
  { to: '/ajustes', label: 'Ajustes', icon: 'settings' },
];

const initials = (user) => `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || '?';

function BranchPicker() {
  const { branches, branchId, selectBranch, loadingBranches } = useDevices();
  if (loadingBranches || branches.length === 0) return null;
  if (branches.length === 1) return <div className={styles.branch}><span className={styles.branchLabel}>Sucursal</span><span className={styles.branchName}>{branches[0].name}</span></div>;
  return <div className={styles.branch}>
    <label htmlFor="branch-picker" className={styles.branchLabel}>Sucursal</label>
    <select id="branch-picker" className={styles.select} value={branchId} onChange={(event) => selectBranch(event.target.value)}>
      {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
    </select>
  </div>;
}

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  const items = ITEMS.filter((item) => !item.allow || item.allow(user));
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Mi cuenta';

  return <div className={`${styles.shell} ${menuOpen ? styles.open : ''}`}>
    <aside className={styles.sidebar} aria-label="Navegación principal">
      <div className={styles.logo}><Logo size={36} color="#F8FCFE" /></div>
      <nav className={styles.nav}>
        {items.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <Icon name={item.icon} />{item.label}</NavLink>)}
      </nav>
      <p className={styles['side-foot']}>SelfIQ Web · v{APP_VERSION}</p>
    </aside>
    <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />

    <div className={styles.main}>
      <header className={styles.topbar}>
        <div className={styles.left}>
          <button type="button" className={styles.menuBtn} onClick={() => setMenuOpen(true)} aria-label="Abrir menú"><Icon name="menu" /></button>
          <BranchPicker />
        </div>
        <div className={styles.user}>
          <div className={styles.who}><strong>{fullName}</strong><span>{roleLabel(user)}</span></div>
          <div className={styles.avatar} aria-hidden="true">{initials(user)}</div>
          <button type="button" className={styles.logout} onClick={() => setConfirmLogout(true)} aria-label="Cerrar sesión" title="Cerrar sesión"><Icon name="logout" /></button>
        </div>
      </header>
      <main className={styles.content}><Outlet /></main>
    </div>

    <Modal open={confirmLogout} title="¿Cerrar sesión?" onClose={() => setConfirmLogout(false)}
      footer={<><Button variant="secondary" onClick={() => setConfirmLogout(false)}>Cancelar</Button><Button variant="danger" onClick={signOut}>Cerrar sesión</Button></>}>
      Tendrás que iniciar sesión de nuevo para volver a entrar.
    </Modal>
  </div>;
}

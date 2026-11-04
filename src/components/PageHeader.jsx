import { usePageTitle } from '../utils/usePageTitle';
import styles from './PageHeader.module.css';

// Título de página del dashboard + acciones a la derecha (botones).
export function PageHeader({ title, subtitle, actions }) {
  usePageTitle(title);
  return <header className={styles.header}>
    <div><h1>{title}</h1>{subtitle && <p className={styles.subtitle}>{subtitle}</p>}</div>
    {actions && <div className={styles.actions}>{actions}</div>}
  </header>;
}
